import React from "react";
import { H1 } from "@jambonz/ui-kit";

import { ScopedAccess } from "./scoped-access";
import { USER_SP, USER_ADMIN, USER_ACCOUNT } from "src/api/constants";

import type { ScopedAccessProps } from "./scoped-access";
import type { UserData } from "src/store/types";

import { Scope } from "src/store/types";

/** Wrapper to pass different user scopes as enum values */
const ScopedAccessTestWrapper = (props: ScopedAccessProps) => {
  return (
    <ScopedAccess {...props}>
      <div className="scope-div">{props.children}</div>
    </ScopedAccess>
  );
};

describe("<ScopedAccess>", () => {
  it("has sufficient scope - admin", () => {
    const user = {
      user_sid: "78131ad5-f041-4d5d-821c-47b2d8c6d015",
      scope: USER_ADMIN,
      access: Scope.admin,
    } as UserData;

    cy.mountTestProvider(
      <ScopedAccessTestWrapper scope={Scope.admin} user={user}>
        <H1>ScopedAccess: admin</H1>
      </ScopedAccessTestWrapper>
    );
    cy.get(".scope-div").should("exist");
  });

  it("has insufficient scope - service_provider", () => {
    const user = {
      user_sid: "78131ad5-f041-4d5d-821c-47b2d8c6d015",
      scope: USER_SP,
      access: Scope.service_provider,
    } as UserData;

    cy.mountTestProvider(
      <ScopedAccessTestWrapper scope={Scope.admin} user={user}>
        <H1>ScopedAccess: service_provider</H1>
      </ScopedAccessTestWrapper>
    );
    cy.get(".scope-div").should("not.exist");
  });

  it("has insufficient scope - account", () => {
    const user = {
      user_sid: "78131ad5-f041-4d5d-821c-47b2d8c6d015",
      scope: USER_ACCOUNT,
      access: Scope.account,
    } as UserData;

    cy.mountTestProvider(
      <ScopedAccessTestWrapper scope={Scope.admin} user={user}>
        <H1>ScopedAccess: account</H1>
      </ScopedAccessTestWrapper>
    );
    cy.get(".scope-div").should("not.exist");
  });
});
