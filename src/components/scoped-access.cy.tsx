import React from "react";
import { H1, H2 } from "jambonz-ui";

import { TestProvider } from "src/test";
import { ScopedAccess } from "./scoped-access";

import type { ScopedAccessProps } from "./scoped-access";

/** Wrapper to pass different user scopes as enum values */
const ScopedAccessTestWrapper = (props: Partial<ScopedAccessProps>) => {
  return (
    <TestProvider>
      <ScopedAccess
        enumScope={props.enumScope!}
        noAccessRender={<H2>{"noAccessRender"}</H2>}
      >
        <div className="scope-div">
          <H1>ScopedAccess: {props.enumScope}</H1>
        </div>
      </ScopedAccess>
    </TestProvider>
  );
};

describe("<ScopedAccess>", () => {
  it("has sufficient scope - admin", () => {
    cy.mount(<ScopedAccessTestWrapper enumScope={0} />);
    cy.get(".scope-div").should("exist");
    cy.get("h1").should("exist");
  });

  it("has insufficient scope - service_provider", () => {
    cy.mount(<ScopedAccessTestWrapper enumScope={1} />);
    cy.get(".scope-div").should("not.exist");
    cy.get("h2").should("exist");
  });

  it("has insufficient scope - account", () => {
    cy.mount(<ScopedAccessTestWrapper enumScope={2} />);
    cy.get(".scope-div").should("not.exist");
    cy.get("h2").should("exist");
  });
});
