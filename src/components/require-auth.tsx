import React from "react";
import { useLocation, Navigate } from "react-router-dom";

import { useAuth } from "src/router/auth";
import { toastError } from "src/store";
import { ROUTE_LOGIN } from "src/router/routes";
import { MSG_MUST_LOGIN } from "src/constants";

/**
 * Wrapper component that enforces valid authorization to the app
 */
export const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { authorized } = useAuth();
  const location = useLocation();

  // Simply not authorized -- e.g. no token
  if (!authorized) {
    toastError(MSG_MUST_LOGIN);

    return <Navigate to={ROUTE_LOGIN} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
