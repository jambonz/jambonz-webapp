import React from "react";
import { H1 } from "@jambonz/ui-kit";

import { RequireAuth } from "./require-auth";
import { ToastProvider } from "./toast/toast-provider";

/** Wrapper to pass different auth contexts */
const RequireAuthTestWrapper = () => {
  return (
    <ToastProvider>
      <RequireAuth>
        <div className="auth-div">
          <H1>Protected Route</H1>
        </div>
      </RequireAuth>
    </ToastProvider>
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
