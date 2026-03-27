import { useEffect, useCallback } from "react";

import { getAlerts, useServiceProviderData } from "src/api";
import { useSelectState, useDispatch } from "src/store";
import { getAlertsLastViewed } from "src/store/localStore";
import { Scope } from "src/store/types";
import type { Account } from "src/api/types";

const POLL_INTERVAL = 2 * 60 * 1000; // 2 minutes

export const useAlertStatus = () => {
  const user = useSelectState("user");
  const dispatch = useDispatch();
  const [accounts] = useServiceProviderData<Account[]>("Accounts");

  const checkAlerts = useCallback(() => {
    const lastViewed = getAlertsLastViewed();
    const query = {
      page: 1,
      count: 1,
      ...(lastViewed ? { start: lastViewed } : { days: 1 }),
    };

    // Account-scoped users: check their own account
    if (user?.access === Scope.account && user.account_sid) {
      getAlerts(user.account_sid, query)
        .then(({ json }) => {
          dispatch({ type: "unreadAlerts", payload: json.total });
        })
        .catch(() => {});
      return;
    }

    // Admin/SP users: check all accounts under the service provider
    if (accounts && accounts.length > 0) {
      Promise.all(
        accounts.map((account) =>
          getAlerts(account.account_sid, query)
            .then(({ json }) => json.total)
            .catch(() => 0),
        ),
      ).then((totals) => {
        const total = totals.reduce((sum, t) => sum + t, 0);
        dispatch({ type: "unreadAlerts", payload: total });
      });
    }
  }, [user?.access, user?.account_sid, accounts, dispatch]);

  useEffect(() => {
    checkAlerts();

    const interval = setInterval(checkAlerts, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [checkAlerts]);
};
