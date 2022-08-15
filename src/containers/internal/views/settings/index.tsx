import React, { useState, useEffect } from "react";
import { H1, P, Button, ButtonGroup } from "jambonz-ui";

import { useDispatch, toastSuccess, toastError } from "src/store";
import { withSelectState } from "src/utils";
import { putServiceProvider, deleteServiceProvider } from "src/api";
import { Modal, Section } from "src/components";
import { Checkzone } from "src/components/forms";
import { ApiKeys } from "src/containers/internal/api-keys";

import type { ServiceProvider } from "src/api/types";

type SettingsProps = {
  serviceProviders: ServiceProvider[];
  currentServiceProvider: ServiceProvider;
};

export const Settings = ({
  serviceProviders,
  currentServiceProvider,
}: SettingsProps) => {
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [temp, setTemp] = useState("");
  const [teams, setTeams] = useState("");
  const [initialCheck, setInitialCheck] = useState(false);
  const [modal, setModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (currentServiceProvider) {
      putServiceProvider(currentServiceProvider.service_provider_sid, {
        name,
        ms_teams_fqdn: teams || null,
      })
        .then(() => {
          dispatch({ type: "serviceProviders" });
          toastSuccess("Settings updated");
        })
        .catch((error) => {
          toastError(error.msg);
        });
    }
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setModal(true);
  };

  const handleCancel = () => {
    setModal(false);
  };

  const handleDelete = () => {
    deleteServiceProvider(currentServiceProvider.service_provider_sid)
      .then(() => {
        setModal(false);
        dispatch({ type: "serviceProviders" });
        toastSuccess(
          <>
            Deleted service provider{" "}
            <strong>{currentServiceProvider.name}</strong>
          </>
        );
      })
      .catch((error) => {
        toastError(error.msg);
      });
  };

  const handleChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked && temp) {
      setTeams(temp);
    }

    if (!e.target.checked) {
      setTemp(teams);
      setTeams("");
    }
  };

  /** Set initial value for controlled input(s) */
  useEffect(() => {
    if (currentServiceProvider) {
      setName(currentServiceProvider.name);

      if (currentServiceProvider.ms_teams_fqdn) {
        setTeams(currentServiceProvider.ms_teams_fqdn);
        setInitialCheck(true);
      } else {
        setTemp("");
        setTeams("");
        setInitialCheck(false);
      }
    }
  }, [currentServiceProvider]);

  return (
    <>
      <H1>Settings</H1>
      <Section slim>
        <form onSubmit={handleSubmit}>
          <fieldset>
            <label htmlFor="name">Service provider name</label>
            <input
              id="name"
              required
              type="text"
              name="name"
              placeholder="Service provider name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </fieldset>
          <fieldset>
            <Checkzone
              name="teams"
              label="Enable MS Teams Direct Routing"
              initialCheck={initialCheck}
              handleChecked={handleChecked}
            >
              <label htmlFor="ms_teams_fqdn">SBC domain name</label>
              <input
                id="ms_teams_fqdn"
                type="text"
                name="ms_teams_fqdn"
                placeholder="Fully qualified domain name used for MS Teams"
                value={teams}
                onChange={(e) => setTeams(e.target.value)}
              />
            </Checkzone>
          </fieldset>
          <fieldset>
            <ButtonGroup left>
              <Button type="submit" small>
                Save
              </Button>
              {serviceProviders.length > 1 && (
                <Button small subStyle="grey" onClick={handleConfirm}>
                  Delete
                </Button>
              )}
            </ButtonGroup>
          </fieldset>
        </form>
      </Section>
      {currentServiceProvider && (
        <ApiKeys
          path={`ServiceProviders/${currentServiceProvider.service_provider_sid}/ApiKeys`}
          post={{
            service_provider_sid: currentServiceProvider.service_provider_sid,
          }}
          label="Service provider"
        />
      )}
      {modal && (
        <Modal handleSubmit={handleDelete} handleCancel={handleCancel}>
          <P>
            Are you sure you want to delete the service provider{" "}
            <strong>{currentServiceProvider.name}</strong>?
          </P>
        </Modal>
      )}
    </>
  );
};

export default withSelectState(["serviceProviders", "currentServiceProvider"])(
  Settings
);
