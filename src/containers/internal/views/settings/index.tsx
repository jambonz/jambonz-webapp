import React, { useState } from "react";
import { H1, Tabs, Tab, MS } from "jambonz-ui";

import { withSelectState } from "src/utils";
import { useSelectState } from "src/store";
import { ScopedAccess } from "src/components/scoped-access";
import { ApiKeys } from "src/containers/internal/api-keys";
import ServiceProviderSettings from "./service-provider-settings";
import AdminSettings from "./admin-settings";
import type { ServiceProvider } from "src/api/types";
import { Scope } from "src/store/types";
import { Section } from "src/components";
import { MSG_REQUIRED_FIELDS } from "src/constants";
import { USER_ACCOUNT } from "src/api/constants";

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
          <ScopedAccess scope={Scope.admin}>
            <Tabs active={[activeTab, setActiveTab]}>
              <Tab id="admin" label="Admin">
                <AdminSettings />
              </Tab>
              <Tab id="serviceProvider" label="Service Provider">
                <ServiceProviderSettings />
              </Tab>
            </Tabs>
          </ScopedAccess>
          <ScopedAccess scope={Scope.service_provider}>
            <ServiceProviderSettings />
          </ScopedAccess>
        </form>
      </Section>

      {(currentServiceProvider && activeTab === "serviceProvider") ||
        (user?.scope !== USER_ACCOUNT && (
          <ApiKeys
            key={currentServiceProvider.service_provider_sid}
            path={`ServiceProviders/${currentServiceProvider.service_provider_sid}/ApiKeys`}
            post={{
              service_provider_sid: currentServiceProvider.service_provider_sid,
            }}
            label="Service provider"
          />
        ))}
    </>
  );
};

export default withSelectState(["currentServiceProvider"])(Settings);
