import React from "react";
import { H1 } from "jambonz-ui";

import { TestProvider } from "src/test";
import { ScopedAccess } from "./scoped-access";

import type { ScopedAccessProps } from "./scoped-access";
import { Scope } from "src/store/types";

/** Wrapper to pass different user scopes as enum values */
const ScopedAccessTestWrapper = (props: Partial<ScopedAccessProps>) => {
  return (
    <TestProvider>
      <ScopedAccess scope={props.scope!}>
        <div className="scope-div">
          <H1>ScopedAccess: {props.scope}</H1>
        </div>
      </ScopedAccess>
    </TestProvider>
  );
};

describe("<ScopedAccess>", () => {
  it("has sufficient scope - admin", () => {
    cy.mount(<ScopedAccessTestWrapper scope={Scope.admin} />);
    cy.get(".scope-div").should("exist");
    cy.get("h1").should("exist");
  });

  it("has insufficient scope - service_provider", () => {
    cy.mount(<ScopedAccessTestWrapper scope={Scope.service_provider} />);
    cy.get(".scope-div").should("not.exist");
    cy.get("h1").should("not.exist");
  });

  it("has insufficient scope - account", () => {
    cy.mount(<ScopedAccessTestWrapper scope={Scope.account} />);
    cy.get(".scope-div").should("not.exist");
    cy.get("h1").should("not.exist");
  });
});
