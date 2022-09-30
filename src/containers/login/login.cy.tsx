import React from "react";
import { AuthContext, AuthStateContext } from "src/router/auth";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Login from "./login";

const LoginTestWrapper = (props: Partial<AuthStateContext>) => {
  return (
    <AuthContext.Provider value={props as AuthStateContext}>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

describe("<Login/>", () => {
  it("mount", () => {
    cy.mount(<LoginTestWrapper />);
  });

  it("has required elements", () => {
    cy.mount(<LoginTestWrapper />);
    cy.get("h1.h2").should("have.text", "Log in");
    cy.get('input[name="username"]').should("have.attr", "required");
    cy.get('input[name="username"]')
      .should("have.attr", "placeholder")
      .and("equals", "Username");
    cy.get('input[name="password"]').should("have.attr", "required");
    cy.get('input[name="password"]')
      .should("have.attr", "placeholder")
      .and("equals", "Password");
    cy.get("button.btn").should("have.text", "Log in");
  });

  it("authorized", () => {
    cy.mount(<LoginTestWrapper authorized={true} />);
    cy.get("h1.h2").should("not.exist");
    cy.get('input[name="username"]').should("not.exist");
    cy.get('input[name="password"').should("not.exist");
    cy.get("button.btn").should("not.exist");
  });
});
