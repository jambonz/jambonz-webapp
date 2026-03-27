import { useEffect, useCallback } from "react";

import { getAlerts, getServiceProviderAlerts } from "src/api";
import { useSelectState, useDispatch } from "src/store";
import { getAlertsLastViewed } from "src/store/localStore";
import { Scope } from "src/store/types";

const POLL_INTERVAL = 2 * 60 * 1000; // 2 minutes

export const useAlertStatus = () => {
  const user = useSelectState("user");
  const currentServiceProvider = useSelectState("currentServiceProvider");
  const dispatch = useDispatch();

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

    // Admin/SP users: check all alerts under the service provider
    if (currentServiceProvider?.service_provider_sid) {
      getServiceProviderAlerts(
        currentServiceProvider.service_provider_sid,
        query,
      )
        .then(({ json }) => {
          dispatch({ type: "unreadAlerts", payload: json.total });
        })
        .catch(() => {});
    }
  }, [
    user?.access,
    user?.account_sid,
    currentServiceProvider?.service_provider_sid,
    dispatch,
  ]);

  useEffect(() => {
    checkAlerts();

    const interval = setInterval(checkAlerts, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [checkAlerts]);
};
