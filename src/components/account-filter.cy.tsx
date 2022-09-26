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
    cy.get("select").should("have.value", accountsSorted[0].account_sid);
  });

  it("updates value onChange", () => {
    cy.mount(<AccountFilterTestWrapper />);

    /** Assert onChange value updates */
    cy.get("select").select(accountsSorted[1].account_sid);
    cy.get("select").should("have.value", accountsSorted[1].account_sid);
  });

  it("manages the focused state", () => {
    cy.mount(<AccountFilterTestWrapper />);

    /** Test the `focused` state className (applied onFocus) */
    cy.get("select").select(accountsSorted[1].account_sid);
    cy.get(".account-filter").should("have.class", "focused");
    cy.get("select").blur();
    cy.get(".account-filter").should("not.have.class", "focused");
  });

  it("renders with default option", () => {
    /** Test with the `defaultOption` prop */
    cy.mount(<AccountFilterTestWrapper defaultOption />);

    /** No default value is set when this prop is present */
    cy.get("select").should("have.value", "");
  });
});
