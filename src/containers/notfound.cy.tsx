import React from "react";
import { AuthStateContext } from "src/router/auth";
import { TestProvider } from "src/test";
import NotFound from "./notfound";

const NotFoundTestWrapper = (props: Partial<AuthStateContext>) => {
  return (
    <TestProvider {...(props as AuthStateContext)}>
      <NotFound />
    </TestProvider>
  );
};

describe("<NotFound>", () => {
  it("mounts", () => {
    cy.mount(<NotFoundTestWrapper authorized />);
  });

  it("authorized has h1, no login button", () => {
    cy.mount(<NotFoundTestWrapper authorized />);
    cy.get("h1.h2").should("exist");
    cy.get("div.notfound--login").should("not.exist");
  });

  it("not authorized has h1 and login buttons", () => {
    cy.mount(<NotFoundTestWrapper />);

    cy.get("h1.h2").should("exist");
    cy.get("div.notfound--login").should("exist");
  });
});
