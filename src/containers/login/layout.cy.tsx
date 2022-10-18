import React from "react";

import { Layout } from "./layout";
import { LayoutProvider } from "src/test";

const LayoutTestWrapper = () => {
  return (
    <LayoutProvider Layout={Layout} outlet={<div className="outlet-div" />} />
  );
};

describe("<Layout/>", () => {
  it("mounts", () => {
    cy.mount(<LayoutTestWrapper />);
  });

  it("has required elements", () => {
    cy.mount(<LayoutTestWrapper />);

    cy.get("header").should("exist");
    cy.get("footer").should("exist");
    cy.get(".outlet-div").should("exist");
  });
});
