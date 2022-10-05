import React from "react";
import { CreatePassword } from "./create-password";
import { TestProvider } from "src/test";

const CreatePasswordTestWrapper = () => {
  return (
    <TestProvider>
      <CreatePassword />
    </TestProvider>
  );
};

describe("<CreatePassword />", () => {
  it("mount", () => {
    cy.mount(<CreatePasswordTestWrapper />);
  });

  it("has required elements", () => {
    cy.mount(<CreatePasswordTestWrapper />);

    cy.get("h1.h2").should("have.text", "Create password");
    cy.get(".m").should("have.text", "You must create a new password");
    cy.get('input[name="password"]')
      .should("have.attr", "placeholder")
      .and("equals", "New password");
    cy.get('input[name="confirmPassword"]')
      .should("have.attr", "placeholder")
      .and("equals", "Confirm new password");
    cy.get("button.btn").should("have.text", "Create password");
  });

  it("provide wrong confirmpassword", () => {
    cy.mount(<CreatePasswordTestWrapper />);
    cy.get('input[name="password"]').type("asdasd");
    cy.get('input[name="confirmPassword"]').type("3453");
    cy.get("button.btn").click();
    cy.get("span").should("have.text", "Passwords do not match");
  });

  it("provide correct confirmpassword, but not match expected streng", () => {
    cy.mount(<CreatePasswordTestWrapper />);
    cy.get('input[name="password"]').type("asdasd");
    cy.get('input[name="confirmPassword"]').type("asdasd");
    cy.get("button.btn").click();
    cy.get("span").should(
      "have.text",
      "Password must:Be at least 6 charactersContain at least one letterContain at least one number"
    );
  });

  it("provide correct confirmpassword, but match expected streng", () => {
    cy.mount(<CreatePasswordTestWrapper />);
    cy.get('input[name="password"]').type("a#nks45S");
    cy.get('input[name="confirmPassword"]').type("a#nks45S");
    cy.get("button.btn").click();
    cy.get("span").should("not.exist");
  });
});
