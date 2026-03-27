import { useEffect, useRef } from "react";

import { getAlerts, getServiceProviderAlerts } from "src/api";
import { useSelectState, useDispatch } from "src/store";
import { getAlertsLastViewed } from "src/store/localStore";
import { Scope } from "src/store/types";

const POLL_INTERVAL = 60 * 1000; // 60 seconds

export const useAlertStatus = () => {
  const user = useSelectState("user");
  const currentServiceProvider = useSelectState("currentServiceProvider");
  const dispatch = useDispatch();

  const userRef = useRef(user);
  const spRef = useRef(currentServiceProvider);
  const dispatchRef = useRef(dispatch);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    spRef.current = currentServiceProvider;
  }, [currentServiceProvider]);

  useEffect(() => {
    dispatchRef.current = dispatch;
  }, [dispatch]);

  useEffect(() => {
    const checkAlerts = () => {
      const currentUser = userRef.current;
      const sp = spRef.current;
      const lastViewed = getAlertsLastViewed();
      const query = {
        page: 1,
        count: 50,
        ...(lastViewed ? { start: lastViewed } : { days: 1 }),
      };

      // Account-scoped users: check their own account
      if (currentUser?.access === Scope.account && currentUser.account_sid) {
        getAlerts(currentUser.account_sid, query)
          .then(({ json }) => {
            dispatchRef.current({ type: "unreadAlerts", payload: json.total });
          })
          .catch(() => {});
        return;
      }

      // Admin/SP users: check all alerts under the service provider
      if (sp?.service_provider_sid) {
        getServiceProviderAlerts(sp.service_provider_sid, query)
          .then(({ json }) => {
            dispatchRef.current({ type: "unreadAlerts", payload: json.total });
          })
          .catch(() => {});
      }
    };

    checkAlerts();

    const interval = setInterval(checkAlerts, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, []);
};
