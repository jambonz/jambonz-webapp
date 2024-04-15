// ***********************************************************
// This example support/component.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import jambonz global styles
import "src/styles/index.scss";

// Import commands.js using ES2015 syntax:
import "./commands";

import React from "react";

import { mount } from "cypress/react18";

import { TestProvider } from "src/test";

import type { TestProviderProps } from "src/test";
import type { MountOptions, MountReturn } from "cypress/react";

// Augment the Cypress namespace to include type definitions for
// your custom command.
// Alternatively, can be defined in cypress/support/component.d.ts
declare global {
  // Disabling, but: https://typescript-eslint.io/rules/no-namespace/...
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
      /**
       * Mounts a React node
       * @param component React Node to mount
       * @param options Additional options to pass into mount
       */
      mountTestProvider(
        component: React.ReactNode,
        options?: MountOptions & { authProps?: TestProviderProps["authProps"] },
      ): Cypress.Chainable<MountReturn>;
    }
  }
}

Cypress.Commands.add("mount", mount);

// This gives us access to dispatch inside of our test wrappers...
Cypress.Commands.add("mountTestProvider", (component, options = {}) => {
  const { authProps, ...mountOptions } = options;
  const wrapper = (
    <TestProvider authProps={authProps}>{component}</TestProvider>
  );
  return mount(wrapper, mountOptions);
});

// Example use:
// cy.mount(<MyComponent />)
