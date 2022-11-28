import React from "react";
import { H1 } from "jambonz-ui";

import { TestProvider } from "src/test";
import { RequireAuth } from "./require-auth";

import type { TestProviderProps } from "src/test";

/** Wrapper to pass different auth contexts */
const RequireAuthTestWrapper = (props: Partial<TestProviderProps>) => {
  return (
    <TestProvider {...props}>
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
    cy.mount(<RequireAuthTestWrapper authProps={{ authorized: true }} />);

    cy.get(".auth-div").should("exist");
  });
});
