import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { AuthContext, AuthStateContext } from "src/router/auth";
import NotFound from "./notfound";

const NotFoundTestWrapper = (props: Partial<AuthStateContext>) => {
  return (
    <AuthContext.Provider value={props as AuthStateContext}>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
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
