import React from "react";
import { H1 } from "jambonz-ui";

import { StateProvider } from "src/store";
import { AccessControl } from "./access-control";

import type { ACLProps } from "./access-control";

/** Wrapper to pass different ACLs */
const AccessControlTestWrapper = (props: Partial<ACLProps>) => {
  return (
    <StateProvider>
      <AccessControl acl={props.acl!}>
        <div className="acl-div">
          <H1>ACL: {props.acl}</H1>
        </div>
      </AccessControl>
    </StateProvider>
  );
};

describe("<AccessControl>", () => {
  it("mounts", () => {
    cy.mount(<AccessControlTestWrapper acl="hasAdminAuth" />);
  });

  it("doesn't have teams fqdn ACL", () => {
    cy.mount(<AccessControlTestWrapper acl="hasMSTeamsFqdn" />);

    /** Default ACL disables MS Teams FQDN */
    cy.get(".acl-div").should("not.exist");
  });

  it("has admin ACL", () => {
    cy.mount(<AccessControlTestWrapper acl="hasAdminAuth" />);

    /** Default ACL applies admin auth -- the singleton admin user */
    cy.get(".acl-div").should("exist");
  });
});
