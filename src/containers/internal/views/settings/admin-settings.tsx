import React, { useEffect, useState } from "react";

import { ButtonGroup, Button, MS, P } from "@jambonz/ui-kit";
import {
  useApiData,
  postPasswordSettings,
  postSystemInformation,
  deleteTtsCache,
} from "src/api";
import { PasswordSettings, SystemInformation, TtsCache } from "src/api/types";
import { toastError, toastSuccess } from "src/store";
import { Selector } from "src/components/forms";
import { hasValue, isvalidIpv4OrCidr } from "src/utils";
import { PASSWORD_LENGTHS_OPTIONS, PASSWORD_MIN } from "src/api/constants";
import { Modal } from "src/components";

export const AdminSettings = () => {
  const [passwordSettings, passwordSettingsFetcher] =
    useApiData<PasswordSettings>("PasswordSettings");
  const [systemInformation, systemInformationFetcher] =
    useApiData<SystemInformation>("SystemInformation");
  const [ttsCache, ttsCacheFetcher] = useApiData<TtsCache>("TtsCache");
  // Min value is 8
  const [minPasswordLength, setMinPasswordLength] = useState(PASSWORD_MIN);
  const [requireDigit, setRequireDigit] = useState(false);
  const [requireSpecialCharacter, setRequireSpecialCharacter] = useState(false);
  const [domainName, setDomainName] = useState("");
  const [sipDomainName, setSipDomainName] = useState("");
  const [privateNetworkCidr, setPrivateNetworkCidr] = useState("");
  const [monitoringDomainName, setMonitoringDomainName] = useState("");
  const [clearTtsCacheFlag, setClearTtsCacheFlag] = useState(false);

  const handleClearCache = () => {
    deleteTtsCache()
      .then(() => {
        ttsCacheFetcher();
        setClearTtsCacheFlag(false);
        toastSuccess("Tts Cache successfully cleaned");
      })
      .catch((error) => {
        toastError(error.msg);
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (privateNetworkCidr) {
      const cidrs = privateNetworkCidr.split(",");
      for (const cidr of cidrs) {
        if (!isvalidIpv4OrCidr(cidr)) {
          toastError(`Invalid Private Network CIDR for "${cidr}"`);
          return;
        }
      }
    }

    const systemInformationPayload: Partial<SystemInformation> = {
      domain_name: domainName || null,
      sip_domain_name: sipDomainName || null,
      monitoring_domain_name: monitoringDomainName || null,
      private_network_cidr: privateNetworkCidr || null,
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
        systemInformationFetcher();
        toastSuccess("Admin settings updated successfully");
      })
      .catch((error) => {
        toastError(error.msg);
      });
  };

  useEffect(() => {
    if (hasValue(passwordSettings)) {
      setRequireDigit(passwordSettings.require_digit > 0 ? true : false);
      setRequireSpecialCharacter(
        passwordSettings.require_special_character > 0 ? true : false,
      );
      if (passwordSettings.min_password_length) {
        setMinPasswordLength(passwordSettings.min_password_length);
      }
    }
    if (hasValue(systemInformation)) {
      if (systemInformation.domain_name) {
        setDomainName(systemInformation.domain_name);
      }

      if (systemInformation.sip_domain_name) {
        setSipDomainName(systemInformation.sip_domain_name);
      }

      if (systemInformation.monitoring_domain_name) {
        setMonitoringDomainName(systemInformation.monitoring_domain_name);
      }

      if (systemInformation.private_network_cidr) {
        setPrivateNetworkCidr(systemInformation.private_network_cidr);
      }
    }
  }, [passwordSettings, systemInformation]);

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
        <label htmlFor="name">Private Network CIDR</label>
        <input
          id="private_network_cidr"
          type="text"
          name="private_network_cidr"
          placeholder="Private network CIDR"
          value={privateNetworkCidr}
          onChange={(e) => setPrivateNetworkCidr(e.target.value)}
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
          <Button
            onClick={(e: React.FormEvent) => {
              e.preventDefault();
              setClearTtsCacheFlag(true);
            }}
            small
            disabled={!ttsCache || ttsCache.size === 0}
          >
            Clear TTS Cache
          </Button>
        </ButtonGroup>
        <MS>{`There are ${
          ttsCache ? ttsCache.size : 0
        } cached TTS prompts`}</MS>
      </fieldset>
      <fieldset>
        <ButtonGroup left>
          <Button onClick={handleSubmit} small>
            Save
          </Button>
        </ButtonGroup>
      </fieldset>
      {clearTtsCacheFlag && (
        <Modal
          handleSubmit={handleClearCache}
          handleCancel={() => setClearTtsCacheFlag(false)}
        >
          <P>Are you sure you want to clean TTS cache?</P>
        </Modal>
      )}
    </>
  );
};

export default AdminSettings;
