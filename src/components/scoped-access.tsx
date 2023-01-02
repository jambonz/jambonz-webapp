import React from "react";

import type { UserData, Scope } from "src/store/types";

export type ScopedAccessProps = {
  /**
   * Minumum required scope
   * @see enum `Scope` in src/store/types
   */
  scope: Scope;
  user?: UserData;
  children: React.ReactNode;
};

export const ScopedAccess = ({ user, scope, children }: ScopedAccessProps) => {
  if (user && user.access >= scope) {
    return <>{children}</>;
  }

  return null;
};
