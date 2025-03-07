import React, { useState } from "react";

import { sortLocaleName } from "src/utils";

import { AccountFilter } from "./account-filter";

import type { AccountFilterProps } from "./account-filter";
import type { Account } from "src/api/types";

/** Import fixture data directly so we don't use cy.fixture() ... */
import accounts from "../../cypress/fixtures/accounts.json";

/** Wrapper to perform React state setup */
const AccountFilterTestWrapper = (props: Partial<AccountFilterProps>) => {
  const [account, setAccount] = useState("");

  return (
    <AccountFilter
      label="Test"
      accounts={accounts as Account[]}
      account={[account, setAccount]}
      defaultOption={props.defaultOption}
    />
  );
};

describe("<AccountFilter>", () => {
  /** The AccountFilter uses sort with `localeCompare` */
  const accountsSorted = accounts.sort(sortLocaleName);

  it("mounts", () => {
    cy.mount(<AccountFilterTestWrapper />);
  });

  it("has label text", () => {
    cy.mount(<AccountFilterTestWrapper />);

    /** Label text is properly set */
    cy.get("label").should("have.text", "Test:");
  });

  it("has default value", () => {
    cy.mount(<AccountFilterTestWrapper />);

    /** Default value is properly set to first option */
    cy.get("input").should("have.value", accountsSorted[0].name);
  });

  it("updates value onChange", () => {
    cy.mount(<AccountFilterTestWrapper />);

    /** Assert onChange value updates */
    cy.get("input").clear();
    cy.get("input").type(accountsSorted[1].name);
    cy.get("input").should("have.value", accountsSorted[1].name);
  });

  it("manages the focused state", () => {
    cy.mount(<AccountFilterTestWrapper />);

    /** Test the `focused` state className (applied onFocus) */
    cy.get("input").clear();
    cy.get("input").type(accountsSorted[1].name);
    cy.get("input").parent().should("have.class", "focused");
    cy.get("input").blur();
    cy.get("input").parent().should("not.have.class", "focused");
  });

  it("renders with default option", () => {
    /** Test with the `defaultOption` prop */
    cy.mount(<AccountFilterTestWrapper defaultOption />);
    /** No default value is set when this prop is present */
    cy.get("input").should("have.value", "All accounts");
  });

  it("verify the typeahead dropdown", () => {
    /** Test by typing cus then custom account is selected */
    cy.mount(<AccountFilterTestWrapper defaultOption />);
    cy.get("input").clear();
    cy.get("input").type("cus");
    cy.get("div#account_filter-option-1").should("have.text", "custom account");
  });
  it("handles Enter key press", () => {
    cy.mount(<AccountFilterTestWrapper />);

    cy.get("input").clear();
    cy.get("input").type("cus{enter}");
    cy.get("input").should("have.value", "custom account");
  });
  it("navigates down and up with arrow keys", () => {
    cy.mount(<AccountFilterTestWrapper />);

    cy.get("input").clear();
    // Press arrow down to move to the first option
    cy.get("input").type("{downarrow}");
    cy.get("input").type("{enter}");
    cy.get("input").should("have.value", "default account");

    // Press up to move to the previous option
    cy.get("input").type("{uparrow}");
    cy.get("input").type("{uparrow}");
    cy.get("input").type("{enter}");
    cy.get("input").should("have.value", "custom account");
  });
});
