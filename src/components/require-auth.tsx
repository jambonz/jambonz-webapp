import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "src/router/auth";
import { ROUTE_LOGIN } from "src/router/routes";
import { MSG_MUST_LOGIN } from "src/constants";
import { useToast } from "./toast/toast-provider";

/**
 * Wrapper component that enforces valid authorization to the app
 */
export const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { toastError } = useToast();
  const { authorized } = useAuth();
  const navigate = useNavigate();

  /** Simply not authorized -- e.g. no token */
  useEffect(() => {
    if (!authorized) {
      toastError(MSG_MUST_LOGIN);
      navigate(ROUTE_LOGIN);
    }
  }, [authorized]);

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
};
