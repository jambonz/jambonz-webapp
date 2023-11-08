import { Button, ButtonGroup, MS } from "@jambonz/ui-kit";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  deleteClient,
  postClient,
  putClient,
  useServiceProviderData,
} from "src/api";
import { USER_ACCOUNT } from "src/api/constants";
import { Account, Client, UseApiDataMap } from "src/api/types";
import { Section, Tooltip } from "src/components";
import { AccountSelect, Message, Passwd } from "src/components/forms";
import { MSG_REQUIRED_FIELDS } from "src/constants";
import { ROUTE_INTERNAL_CLIENTS } from "src/router/routes";
import { toastError, toastSuccess, useSelectState } from "src/store";
import ClientsDelete from "./delete";
import { hasValue } from "src/utils";
import { IMessage } from "src/store/types";

type ClientsFormProps = {
  client?: UseApiDataMap<Client>;
};

export const ClientsForm = ({ client }: ClientsFormProps) => {
  const user = useSelectState("user");
  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const navigate = useNavigate();

  const [accountSid, setAccountSid] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isActive, setIsActive] = useState(
    client ? client.data?.is_active : true
  );
  const [allowDirectAppCalling, setAllowDirectAppCalling] = useState(true);
  const [allowDirectQueueCalling, setAllowDirectQueueCalling] = useState(true);
  const [allowDirectUserCalling, setAllowDirectUserCalling] = useState(true);
  const [modal, setModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!client) {
      postClient({
        account_sid: accountSid,
        username: username,
        password: password,
        is_active: isActive,
        allow_direct_app_calling: allowDirectAppCalling,
        allow_direct_queue_calling: allowDirectQueueCalling,
        allow_direct_user_calling: allowDirectUserCalling,
      })
        .then(() => {
          toastSuccess("Client created successfully");
          navigate(ROUTE_INTERNAL_CLIENTS);
        })
        .catch((error: { msg: IMessage }) => {
          toastError(error.msg);
        });
    } else {
      putClient(client.data?.client_sid || "", {
        is_active: isActive,
        allow_direct_app_calling: allowDirectAppCalling,
        allow_direct_queue_calling: allowDirectQueueCalling,
        allow_direct_user_calling: allowDirectUserCalling,
      })
        .then(() => {
          toastSuccess("Client updated successfully");
          navigate(ROUTE_INTERNAL_CLIENTS);
        })
        .catch((error: { msg: IMessage }) => {
          toastError(error.msg);
        });
    }
  };

  const handleCancel = () => {
    setModal(false);
  };

  const handleDelete = () => {
    if (client) {
      deleteClient(client.data?.client_sid || "")
        .then(() => {
          toastSuccess("Client deleted successfully");
          navigate(ROUTE_INTERNAL_CLIENTS);
        })
        .catch((error: { msg: IMessage }) => {
          toastError(error.msg);
        });
    }
  };

  useEffect(() => {
    if (client && client.data) {
      if (client.data.username) {
        setUsername(client.data.username);
      }

      if (client.data.account_sid) {
        setAccountSid(client.data.account_sid);
      }

      if (client.data.password) {
        setPassword(client.data.password);
      }

      setIsActive(client.data.is_active);
      setAllowDirectAppCalling(client.data.allow_direct_app_calling);
      setAllowDirectQueueCalling(client.data.allow_direct_queue_calling);
      setAllowDirectUserCalling(client.data.allow_direct_user_calling);
    }
  }, [client]);

  useEffect(() => {
    const acc = accounts?.find((a) => a.account_sid === accountSid);
    if (!accountSid || !accounts || !acc) return;
    if (!acc?.sip_realm) {
      setErrorMessage(`Sip realm is not set for the account.`);
    } else {
      setErrorMessage("");
    }
  }, [accountSid]);
  return (
    <>
      <Section slim>
        <form
          className={`form form--internal ${
            !client?.data && client?.refetch ? "form--blur" : ""
          }`}
          onSubmit={handleSubmit}
        >
          <fieldset>
            <MS>{MSG_REQUIRED_FIELDS}</MS>
            {errorMessage && <Message message={errorMessage} />}
          </fieldset>
          <fieldset>
            <div className="multi">
              <div className="inp">
                <label htmlFor="lcr_name">
                  User Name<span>*</span>
                </label>
                <input
                  id="client_username"
                  name="client_username"
                  type="text"
                  placeholder="user name"
                  value={username}
                  required={true}
                  disabled={hasValue(client)}
                  autoComplete="off"
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
            <label htmlFor="password">
              Password{!hasValue(client) && <span>*</span>}
            </label>
            <Passwd
              id="password"
              required={!hasValue(client)}
              name="password"
              value={password}
              placeholder="Password"
              setValue={setPassword}
              disabled={hasValue(client)}
              autoComplete="off"
            />
          </fieldset>
          <fieldset>
            <label htmlFor="is_active" className="chk">
              <input
                id="is_active"
                name="is_active"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <div>Active</div>
            </label>
            <label htmlFor="allow_direct_app_calling" className="chk">
              <input
                id="allow_direct_app_calling"
                name="allow_direct_app_calling"
                type="checkbox"
                checked={allowDirectAppCalling}
                onChange={(e) => setAllowDirectAppCalling(e.target.checked)}
              />
              <div>Allow direct calling to applications</div>
              <Tooltip text="Allow user to call applications without configuring an application for sip device calls.">
                {" "}
              </Tooltip>
            </label>
            <label htmlFor="allow_direct_queue_calling" className="chk">
              <input
                id="allow_direct_queue_calling"
                name="allow_direct_queue_calling"
                type="checkbox"
                checked={allowDirectQueueCalling}
                onChange={(e) => setAllowDirectQueueCalling(e.target.checked)}
              />
              <div>Allow direct calling to queues</div>
              <Tooltip text="Allow user to take calls from queues without configuring an application for sip device calls.">
                {" "}
              </Tooltip>
            </label>
            <label htmlFor="allow_direct_user_calling" className="chk">
              <input
                id="allow_direct_user_calling"
                name="allow_direct_user_calling"
                type="checkbox"
                checked={allowDirectUserCalling}
                onChange={(e) => setAllowDirectUserCalling(e.target.checked)}
              />
              <div>Allow direct calling to other users</div>
              <Tooltip text="Allow user to call other users without configuring an application for sip device calls.">
                {" "}
              </Tooltip>
            </label>
          </fieldset>
          {user?.scope !== USER_ACCOUNT && (
            <fieldset>
              <AccountSelect
                accounts={accounts}
                account={[accountSid, setAccountSid]}
                label="Belongs to"
                required={true}
                defaultOption={false}
                disabled={hasValue(client)}
              />
            </fieldset>
          )}
          <fieldset>
            <ButtonGroup left className={client && "btns--spaced"}>
              <Button
                small
                subStyle="grey"
                as={Link}
                to={ROUTE_INTERNAL_CLIENTS}
              >
                Cancel
              </Button>
              <Button type="submit" small disabled={errorMessage !== ""}>
                Save
              </Button>
              {client && client.data && (
                <Button
                  small
                  type="button"
                  subStyle="grey"
                  onClick={() => setModal(true)}
                >
                  Delete User
                </Button>
              )}
            </ButtonGroup>
          </fieldset>
        </form>
      </Section>
      {client && client.data && modal && (
        <ClientsDelete
          client={client.data}
          handleCancel={handleCancel}
          handleSubmit={handleDelete}
        />
      )}
    </>
  );
};

export default ClientsForm;
