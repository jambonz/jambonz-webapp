import React from "react";

import { useSelectState } from "src/store";

import type { ACL } from "src/store/types";

export type ACLProps = {
  acl: keyof ACL;
  children: React.ReactNode;
};

export const AccessControl = ({ acl, children }: ACLProps) => {
  const accessControl = useSelectState("accessControl");

  if (accessControl[acl]) {
    return <>{children}</>;
  }

  return null;
};
