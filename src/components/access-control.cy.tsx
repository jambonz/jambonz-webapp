import React from "react";
import { H1 } from "jambonz-ui";

import { AccessControl } from "./access-control";

import type { ACLProps } from "./access-control";

/** Wrapper to pass different ACLs */
const AccessControlTestWrapper = (props: Partial<ACLProps>) => {
  return (
    <AccessControl acl={props.acl!}>
      <div className="acl-div">
        <H1>ACL: {props.acl}</H1>
      </div>
    </AccessControl>
  );
};

describe("<AccessControl>", () => {
  it("mounts", () => {
    cy.mountTestProvider(<AccessControlTestWrapper acl="hasAdminAuth" />);
  });

  it("doesn't have teams fqdn ACL", () => {
    cy.mountTestProvider(<AccessControlTestWrapper acl="hasMSTeamsFqdn" />);

    /** Default ACL disables MS Teams FQDN */
    cy.get(".acl-div").should("not.exist");
  });

  it("has admin ACL", () => {
    cy.mountTestProvider(<AccessControlTestWrapper acl="hasAdminAuth" />);

    /** Default ACL applies admin auth -- the singleton admin user */
    cy.get(".acl-div").should("exist");
  });
});
