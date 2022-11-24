import React from "react";

import { useSelectState } from "src/store";

import type { Scope } from "src/store/types";

export type ScopedAccessProps = {
  enumScope: Scope;
  children: React.ReactNode;
  noAccessRender?: React.ReactNode;
};

export const ScopedAccess = ({
  enumScope,
  children,
  noAccessRender,
}: ScopedAccessProps) => {
  const user = useSelectState("user");

  if (user && user.enumScope <= enumScope) {
    return <>{children}</>;
  }

  if (user && user.enumScope >= enumScope && noAccessRender) {
    return <>{noAccessRender}</>;
  }

  return null;
};
