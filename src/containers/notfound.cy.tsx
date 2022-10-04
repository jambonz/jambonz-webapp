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
    cy.mount(<NotFoundTestWrapper authorized={true} />);
  });

  it("authorized has h1, no login button", () => {
    cy.mount(<NotFoundTestWrapper authorized={true} />);
    cy.get("H1").should("have.text", "That page doesn't exist.");
    cy.get("a").should("not.exist");
  });

  it("not authorized has h1 and login buttons", () => {
    cy.mount(<NotFoundTestWrapper authorized={false} />);

    cy.get("H1").should("have.text", "That page doesn't exist.");
    cy.get("a").should("have.text", "Log in");
    cy.get("a").should("have.class", "btn btn--hollow btn--white");
  });
});
