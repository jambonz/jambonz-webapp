import React from "react";

import { MainApp } from "src/main-app";
import { AccessControl } from "./access-control";

import type { ACLProps } from "./access-control";

/** Wrapper to pass different ACLs */
const AccessControlTestWrapper = (props: Partial<ACLProps>) => {
  return (
    <MainApp>
      <AccessControl acl={props.acl!}>
        <div className="acl-div" />
      </AccessControl>
    </MainApp>
  );
};

describe("<AccessControl>", () => {
  it("mounts", () => {
    cy.mount(<AccessControlTestWrapper acl="hasAdminAuth" />);
  });

  it("has admin ACL", () => {
    cy.mount(<AccessControlTestWrapper acl="hasAdminAuth" />);

    /** Default ACL applies admin auth -- the singleton admin user */
    cy.get(".acl-div").should("exist");
  });

  it("has doesn't have teams fqdn ACL", () => {
    cy.mount(<AccessControlTestWrapper acl="hasMSTeamsFqdn" />);

    /** Default ACL disables MS Teams FQDN */
    cy.get(".acl-div").should("not.exist");
  });
});
