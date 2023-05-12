import React, { useEffect, useState } from "react";

import { ButtonGroup, Button } from "@jambonz/ui-kit";
import {
  useApiData,
  postPasswordSettings,
  postSystemInformation,
} from "src/api";
import { PasswordSettings, SystemInformation } from "src/api/types";
import { toastError, toastSuccess } from "src/store";
import { Selector } from "src/components/forms";
import { hasValue } from "src/utils";
import { PASSWORD_LENGTHS_OPTIONS, PASSWORD_MIN } from "src/api/constants";

export const AdminSettings = () => {
  const [passwordSettings, passwordSettingsFetcher] =
    useApiData<PasswordSettings>("PasswordSettings");
  // const [systemInformatin, systemInformationFetcher] =
  //   useApiData<SystemInformation>("SystemInformation");
  // Min value is 8
  const [minPasswordLength, setMinPasswordLength] = useState(PASSWORD_MIN);
  const [requireDigit, setRequireDigit] = useState(false);
  const [requireSpecialCharacter, setRequireSpecialCharacter] = useState(false);
  const [domainName, setDomainName] = useState("");
  const [sipDomainName, setSipDomainName] = useState("");
  const [monitoringDomainName, setMonitoringDomainName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const systemInformationPayload: Partial<SystemInformation> = {
      domain_name: domainName,
      sip_domain_name: sipDomainName,
      monitoring_domain_name: monitoringDomainName,
    };
    const passwordSettingsPayload: Partial<PasswordSettings> = {
      min_password_length: minPasswordLength,
      require_digit: requireDigit ? 1 : 0,
      require_special_character: requireSpecialCharacter ? 1 : 0,
    };
    Promise.all([
      postSystemInformation(systemInformationPayload),
      postPasswordSettings(passwordSettingsPayload),
    ])
      .then(() => {
        passwordSettingsFetcher();
        // systemInformationFetcher();
        toastSuccess("Password settings successfully updated");
      })
      .catch((error) => {
        toastError(error.msg);
      });
  };

  useEffect(() => {
    if (hasValue(passwordSettings)) {
      setRequireDigit(passwordSettings.require_digit > 0 ? true : false);
      setRequireSpecialCharacter(
        passwordSettings.require_special_character > 0 ? true : false
      );
      if (passwordSettings.min_password_length) {
        setMinPasswordLength(passwordSettings.min_password_length);
      }
    }
    // if (hasValue(systemInformatin)) {
    //   setDomainName(systemInformatin.domain_name);
    //   setSipDomainName(systemInformatin.sip_domain_name);
    //   setMonitoringDomainName(systemInformatin.monitoring_domain_name);
    // }
  }, [passwordSettings]); // systemInformatin

  return (
    <>
      <fieldset>
        <label htmlFor="system_information">System Information</label>
        <label htmlFor="name">Domain Name</label>
        <input
          id="domain_name"
          type="text"
          name="domain_name"
          placeholder="Domain name"
          value={domainName}
          onChange={(e) => setDomainName(e.target.value)}
        />
        <label htmlFor="name">Sip Domain Name</label>
        <input
          id="sip_domain_name"
          type="text"
          name="sip_domain_name"
          placeholder="Sip domain name"
          value={sipDomainName}
          onChange={(e) => setSipDomainName(e.target.value)}
        />
        <label htmlFor="name">Monitoring Domain Name</label>
        <input
          id="monitor_domain_name"
          type="text"
          name="monitor_domain_name"
          placeholder="Monitoring domain name"
          value={monitoringDomainName}
          onChange={(e) => setMonitoringDomainName(e.target.value)}
        />
      </fieldset>
      <fieldset>
        <label htmlFor="min_password_length">Min password length</label>
        <Selector
          id="min_password_length"
          name="min_password_length"
          value={minPasswordLength}
          options={PASSWORD_LENGTHS_OPTIONS}
          onChange={(e) => setMinPasswordLength(Number(e.target.value))}
        />
        <label htmlFor="require_digit" className="chk">
          <input
            id="require_digit"
            name="require_digit"
            type="checkbox"
            checked={requireDigit}
            onChange={(e) => setRequireDigit(e.target.checked)}
          />
          <div>Password require digit</div>
        </label>

        <label htmlFor="require_special_character" className="chk">
          <input
            id="require_special_character"
            name="require_special_character"
            type="checkbox"
            checked={requireSpecialCharacter}
            onChange={(e) => setRequireSpecialCharacter(e.target.checked)}
          />
          <div>Password require special character</div>
        </label>
      </fieldset>
      <fieldset>
        <ButtonGroup left>
          <Button onClick={handleSubmit} small>
            Save
          </Button>
        </ButtonGroup>
      </fieldset>
    </>
  );
};

export default AdminSettings;
