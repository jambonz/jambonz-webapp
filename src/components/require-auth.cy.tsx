import React from "react";
import { H1 } from "jambonz-ui";

import { RequireAuth } from "./require-auth";

/** Wrapper to pass different auth contexts */
const RequireAuthTestWrapper = () => {
  return (
    <RequireAuth>
      <div className="auth-div">
        <H1>Protected Route</H1>
      </div>
    </RequireAuth>
  );
};

describe("<RequireAuth>", () => {
  it("mounts", () => {
    cy.mountTestProvider(<RequireAuthTestWrapper />);
  });

  it("is not authorized", () => {
    cy.mountTestProvider(<RequireAuthTestWrapper />);

    cy.get(".auth-div").should("not.exist");
  });

  it("is authorized", () => {
    cy.mountTestProvider(<RequireAuthTestWrapper />, {
      authProps: { authorized: true },
    });

    cy.get(".auth-div").should("exist");
  });
});
