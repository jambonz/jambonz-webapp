import React, { useState } from "react";
import { H1, Tabs, Tab, MS } from "jambonz-ui";

import { withSelectState } from "src/utils";
import { ApiKeys } from "src/containers/internal/api-keys";
import ServiceProviderSettings from "./service-provider-settings";
import AdminSettings from "./admin-settings";
import { ScopedAccess } from "src/components/scoped-access";
import type { ServiceProvider } from "src/api/types";
import { Section } from "src/components";

import { USER_ADMIN } from "src/api/constants";
import { MSG_REQUIRED_FIELDS } from "src/constants";
import { useSelectState } from "src/store";
import { Scope } from "src/store/types";

type SettingsProps = {
  currentServiceProvider: ServiceProvider;
};

export const Settings = ({ currentServiceProvider }: SettingsProps) => {
  const user = useSelectState("user");
  const [activeTab, setActiveTab] = useState("");

  return (
    <>
      <H1 className="h2">Settings</H1>
      <Section slim>
        <form className="form form--internal">
          <fieldset>
            <MS>{MSG_REQUIRED_FIELDS}</MS>
          </fieldset>
          <ScopedAccess scope={Scope.admin} user={user}>
            <Tabs active={[activeTab, setActiveTab]}>
              <Tab id="admin" label="Admin">
                <AdminSettings />
              </Tab>
              <Tab id="serviceProvider" label="Service Provider">
                <ServiceProviderSettings />
              </Tab>
            </Tabs>
          </ScopedAccess>
          {user?.scope !== USER_ADMIN && (
            <ScopedAccess scope={Scope.service_provider} user={user}>
              <ServiceProviderSettings />
            </ScopedAccess>
          )}
        </form>
      </Section>

      {currentServiceProvider && activeTab === "serviceProvider" && (
        <ApiKeys
          key={currentServiceProvider.service_provider_sid}
          path={`ServiceProviders/${currentServiceProvider.service_provider_sid}/ApiKeys`}
          post={{
            service_provider_sid: currentServiceProvider.service_provider_sid,
          }}
          label="Service provider"
        />
      )}
    </>
  );
};

export default withSelectState(["currentServiceProvider"])(Settings);
