import React from "react";

import type { UserData, Scope } from "src/store/types";

export type ScopedAccessProps = {
  user?: UserData;
  scope: Scope;
  children: React.ReactNode;
};

export const ScopedAccess = ({ user, scope, children }: ScopedAccessProps) => {
  if (user && user.access >= scope) {
    return <>{children}</>;
  }

  return null;
};
