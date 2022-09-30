import React from "react";
import { Layout } from "./layout";

const LayoutTestWrapper = () => {
  return <Layout />;
};

describe("<Layout/>", () => {
  it("mount", () => {
    cy.mount(<LayoutTestWrapper />);
  });

  it("has required elements", () => {
    cy.mount(<LayoutTestWrapper />);
    cy.get('img[alt="jambonz"]')
      .should("have.attr", "src")
      .and("contains", "jambonz--light.svg");
    cy.get("div.mxs").should(
      "have.text",
      "jambonz is open source MIT onGitHub"
    );
    cy.get('a[href="https://github.com/jambonz"]');
  });
});
