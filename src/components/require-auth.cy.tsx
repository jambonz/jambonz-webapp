import React from "react";
import { H1 } from "jambonz-ui";

import { TestProvider } from "src/test";
import { RequireAuth } from "./require-auth";

import type { AuthStateContext } from "src/router/auth";

/** Wrapper to pass different auth contexts */
const RequireAuthTestWrapper = (props: Partial<AuthStateContext>) => {
  return (
    <TestProvider {...(props as AuthStateContext)}>
      <RequireAuth>
        <div className="auth-div">
          <H1>Protected Route</H1>
        </div>
      </RequireAuth>
    </TestProvider>
  );
};

describe("<RequireAuth>", () => {
  it("mounts", () => {
    cy.mount(<RequireAuthTestWrapper />);
  });

  it("is not authorized", () => {
    cy.mount(<RequireAuthTestWrapper />);

    cy.get(".auth-div").should("not.exist");
  });

  it("is authorized", () => {
    cy.mount(<RequireAuthTestWrapper authorized />);

    cy.get(".auth-div").should("exist");
  });
});
