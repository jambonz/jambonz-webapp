import React from "react";

import { useSelectState } from "src/store";

import type { Scope } from "src/store/types";

export type ScopedAccessProps = {
  scope: Scope;
  children: React.ReactNode;
};

export const ScopedAccess = ({ scope, children }: ScopedAccessProps) => {
  const user = useSelectState("user");

  if (user && user.scopeAccess >= scope) {
    return <>{children}</>;
  }

  return null;
};
