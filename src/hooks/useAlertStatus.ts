import { useEffect, useRef, useCallback } from "react";

import { getAlerts, getServiceProviderAlerts } from "src/api";
import { useSelectState, useDispatch } from "src/store";
import { getAlertsLastViewed } from "src/store/localStore";
import { Scope } from "src/store/types";

const POLL_INTERVAL = 60 * 1000; // 60 seconds

export const useAlertStatus = () => {
  const user = useSelectState("user");
  const currentServiceProvider = useSelectState("currentServiceProvider");
  const dispatch = useDispatch();

  const dispatchRef = useRef(dispatch);

  useEffect(() => {
    dispatchRef.current = dispatch;
  }, [dispatch]);

  const checkAlerts = useCallback(() => {
    const lastViewed = getAlertsLastViewed();
    const query = {
      page: 1,
      count: 10,
      days: 30,
      ...(lastViewed ? { start: lastViewed } : {}),
    };

    // Account-scoped users: check their own account
    if (user?.access === Scope.account && user.account_sid) {
      getAlerts(user.account_sid, query)
        .then(({ json }) => {
          dispatchRef.current({ type: "unreadAlerts", payload: json.total });
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
          dispatchRef.current({ type: "unreadAlerts", payload: json.total });
        })
        .catch(() => {});
    }
  }, [
    user?.access,
    user?.account_sid,
    currentServiceProvider?.service_provider_sid,
  ]);

  // Check immediately when user or SP changes
  useEffect(() => {
    checkAlerts();
  }, [checkAlerts]);

  // Set up polling interval (stable, doesn't restart on state changes)
  const checkAlertsRef = useRef(checkAlerts);

  useEffect(() => {
    checkAlertsRef.current = checkAlerts;
  }, [checkAlerts]);

  useEffect(() => {
    const interval = setInterval(() => checkAlertsRef.current(), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);
};
