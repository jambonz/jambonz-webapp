import React, { useState } from "react";

import { SelectFilter } from "./select-filter";

/** Wrapper to perform React state setup */
const SelectFilterTestWrapper = ({ onSelectSpy = () => null }) => {
  const [selected, setSelected] = useState("");

  return (
    <SelectFilter
      id="test"
      label="Test"
      options={[
        { name: "Option one", value: "1" },
        { name: "Option two", value: "2" },
        { name: "Option three", value: "3" },
      ]}
      filter={[selected, setSelected]}
      handleSelect={onSelectSpy}
    />
  );
};

describe("<SelectFilter>", () => {
  it("mounts", () => {
    cy.mount(<SelectFilterTestWrapper />);
  });

  it("has label text", () => {
    cy.mount(<SelectFilterTestWrapper />);

    /** Label text is properly set */
    cy.get("label").should("have.text", "Test:");
  });

  it("has id prop", () => {
    cy.mount(<SelectFilterTestWrapper />);

    /** Select ID attribute is properly set */
    cy.get("select").should("have.id", "test");
  });

  it("has default value", () => {
    cy.mount(<SelectFilterTestWrapper />);

    /** Default value is properly set to first option */
    cy.get("select").should("have.value", "1");
  });

  it("calls onChange handler", () => {
    /** Create a spy for the `onChange` handler */
    const onSelectSpy = cy.spy().as("onSelectSpy");

    cy.mount(<SelectFilterTestWrapper onSelectSpy={onSelectSpy} />);

    /** Assert onChange value and custom handler is called */
    cy.get("select").select("2");
    cy.get("select").should("have.value", "2");
    cy.get("@onSelectSpy").should("have.been.calledOnce");
  });

  it("manages focused state", () => {
    cy.mount(<SelectFilterTestWrapper />);

    /** Test the `focused` state className (applied onFocus) */
    cy.get("select").select("3");
    cy.get(".select-filter").should("have.class", "focused");
    cy.get("select").blur();
    cy.get(".select-filter").should("not.have.class", "focused");
  });
});
