import React, { useState } from "react";

import { sortLocaleName } from "src/utils";

import { ApplicationFilter } from "./application-filter";

import type { ApplicationFilterProps } from "./application-filter";
import type { Application } from "src/api/types";

/** Import fixture data directly so we don't use cy.fixture() ... */
import applications from "../../cypress/fixtures/applications.json";

/** Wrapper to perform React state setup */
const ApplicationFilterTestWrapper = (
  props: Partial<ApplicationFilterProps>,
) => {
  const [application, setApplication] = useState("");

  return (
    <ApplicationFilter
      label="Test"
      applications={applications as Application[]}
      application={[application, setApplication]}
      defaultOption={props.defaultOption}
    />
  );
};

describe("<ApplicationFilter>", () => {
  /** The AccountFilter uses sort with `localeCompare` */
  const applicationsSorted = applications.sort(sortLocaleName);

  it("mounts", () => {
    cy.mount(<ApplicationFilterTestWrapper />);
  });

  it("has label text", () => {
    cy.mount(<ApplicationFilterTestWrapper />);

    /** Label text is properly set */
    cy.get("label").should("have.text", "Test:");
  });

  it("has default value", () => {
    cy.mount(<ApplicationFilterTestWrapper />);

    /** Default value is properly set to first option */
    cy.get("select").should(
      "have.value",
      applicationsSorted[0].application_sid,
    );
  });

  it("updates value onChange", () => {
    cy.mount(<ApplicationFilterTestWrapper />);

    /** Assert onChange value updates */
    cy.get("select").select(applicationsSorted[1].application_sid);
    cy.get("select").should(
      "have.value",
      applicationsSorted[1].application_sid,
    );
  });

  it("manages focused state", () => {
    cy.mount(<ApplicationFilterTestWrapper />);

    /** Test the `focused` state className (applied onFocus) */
    cy.get("select").select(applicationsSorted[1].application_sid);
    cy.get(".application-filter").should("have.class", "focused");
    cy.get("select").blur();
    cy.get(".application-filter").should("not.have.class", "focused");
  });

  it("renders default option", () => {
    /** Test with the `defaultOption` prop */
    cy.mount(
      <ApplicationFilterTestWrapper defaultOption="Choose Application" />,
    );

    /** No default value is set when this prop is present */
    cy.get("select").should("have.value", "");

    /** Validate that our prop renders correct default option text */
    cy.get("option").first().should("have.text", "Choose Application");
  });
});
