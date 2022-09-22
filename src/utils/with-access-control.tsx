import React, { useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { toastError, useSelectState, useAccessControl } from "src/store";
import { ROUTE_INTERNAL_SETTINGS } from "src/router/routes";

import type { ACL, IMessage } from "src/store/types";
import type { ServiceProvider } from "src/api/types";

type PassthroughProps = {
  [key: string]: unknown;
};

export interface ACLGetIMessage {
  (sp: ServiceProvider): IMessage;
}

export const withAccessControl = (
  acl: keyof ACL,
  getMessage: ACLGetIMessage
) => {
  return function WithAccessControl(Component: React.ComponentType) {
    return function ComponentWithAccessControl(props: PassthroughProps) {
      const navigate = useNavigate();
      const hasPermission = useAccessControl(acl);
      const currentServiceProvider = useSelectState("currentServiceProvider");

      /** Handles ACL based on current service provider / user */
      useEffect(() => {
        if (currentServiceProvider && !hasPermission) {
          toastError(getMessage(currentServiceProvider));
          navigate(ROUTE_INTERNAL_SETTINGS);
        }
      }, [hasPermission, currentServiceProvider]);

      return <Component {...props} />;
    };
  };
};
