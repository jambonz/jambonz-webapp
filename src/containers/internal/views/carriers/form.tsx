import { Button, ButtonGroup, MS } from "jambonz-ui";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { postCarrier, putCarrier } from "src/api";
import { Account, UseApiDataMap, Carrier, SipGateway } from "src/api/types";
import { Icons, Section } from "src/components";
import { Checkzone, Passwd, Selector } from "src/components/forms";
import { MSG_REQUIRED_FIELDS } from "src/constants";
import { ROUTE_INTERNAL_CARRIERS } from "src/router/routes";
import { toastError, toastSuccess, useSelectState } from "src/store";
import { hasLength } from "src/utils";

type CarrierFormProps = {
  carrier?: UseApiDataMap<Carrier>;
  accounts: null | Account[];
  carriers: null | Carrier[];
  predefinedCarriers: null | Carrier[];
  // protocol gateway stuffs
};

export const CarrierForm = ({
  carrier,
  accounts,
  carriers,
  predefinedCarriers,
}: CarrierFormProps) => {
  const navigate = useNavigate();

  const currentServiceProvider = useSelectState("currentServiceProvider");
  const [predefinedName, setPredefinedName] = useState("");

  // it looks like it is fetched from the whole db rather than just the SP

  const [carrierName, setCarrierName] = useState("");
  // unused feature, maybe we can add this?
  // const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [e164, setE164] = useState(false);
  const [applicationSid, setApplicationSid] = useState("");
  const [accountSid, setAccountSid] = useState("");

  const [sipRegister, setSipRegister] = useState(false);
  const [sipUser, setSipUser] = useState("");
  const [sipPass, setSipPass] = useState("");
  const [sipRealm, setSipRealm] = useState("");

  const [prefix, setPrefix] = useState("");
  const [diversion, setDiversion] = useState("");

  const [smppSystemId, setSmppSystemId] = useState("");
  const [smppPass, setSmppPass] = useState("");
  const [smppInboundSystemId, setSmppInboundSystemId] = useState("");
  const [smppInboundPass, setSmppInboundPass] = useState("");

  const [sipGateways, setSipGateways] = useState<SipGateway[]>(
    [] as SipGateway[]
  );

  const [message, setMessage] = useState("");
  console.log(message);

  const setStates = (obj: Carrier) => {
    if (obj) {
      if (obj.name) {
        setCarrierName(obj.name);
      }
      if (obj.e164_leading_plus) {
        setE164(obj.e164_leading_plus);
      }
      if (obj.application_sid) {
        setApplicationSid(obj.application_sid);
      }
      if (obj.account_sid) {
        setAccountSid(obj.account_sid);
      }

      if (obj.requires_register) {
        setSipRegister(obj.requires_register);
      }
      if (obj.register_username) {
        setSipUser(obj.register_username);
      }
      if (obj.register_password) {
        setSipPass(obj.register_password);
      }
      if (obj.register_sip_realm) {
        setSipRealm(obj.register_sip_realm);
      }

      if (obj.tech_prefix) {
        setPrefix(obj.tech_prefix);
      }
      if (obj.diversion) {
        setDiversion(obj.diversion);
      }

      if (obj.smpp_system_id) {
        setSmppSystemId(obj.smpp_system_id);
      }
      if (obj.smpp_password) {
        setSmppPass(obj.smpp_password);
      }
      if (obj.smpp_inbound_system_id) {
        setSmppInboundSystemId(obj.smpp_inbound_system_id);
      }
      if (obj.smpp_inbound_password) {
        setSmppInboundPass(obj.smpp_inbound_password);
      }
    }

    // TODO, set ProtocolGateways type also
  };

  const addSipGateway = () => {
    setSipGateways((curr) => [
      // this could be move to the constant TODO
      ...curr,
      {
        is_active: false,
        voip_carrier_sid: "",
        ipv4: "",
        port: 5060,
        netmask: 32,
        inbound: false,
        outbound: false,
      },
    ]);
  };

  const updateSipGateways = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    key: string
  ) => {
    console.log(sipGateways);
    let arr_copy: SipGateway[] = sipGateways;

    arr_copy = arr_copy.map((g, i) =>
      i === index ? { ...g, [key]: e.target.value } : g
    );

    setSipGateways(arr_copy);
    console.log(sipGateways);

    // setSipGateways((g, i) => i === index ? {...g, g[key] = }: g)
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");

    if (carriers) {
    }

    const payload: Partial<Carrier> = {
      name: carrierName.trim(),
      e164_leading_plus: e164,
      application_sid: applicationSid || null,
      account_sid: accountSid || null,
      requires_register: sipRegister,
      register_username: sipUser.trim() || null,
      register_password: sipPass.trim() || null,
      register_sip_realm: sipRealm.trim() || null,
      tech_prefix: prefix.trim() || null,
      diversion: diversion.trim() || null,
      is_active: isActive,
      smpp_system_id: smppSystemId.trim() || null,
      smpp_password: smppPass.trim() || null,
      smpp_inbound_system_id: smppInboundSystemId.trim() || null,
      smpp_inbound_password: smppInboundPass.trim() || null,
    };

    if (carrier && carrier.data) {
      putCarrier(carrier.data.voip_carrier_sid, payload)
        .then(() => {
          toastSuccess("Carrier updated successfully");
          carrier.refetch();
        })
        .catch((error) => {
          toastError(error.msg);
        });
    } else {
      postCarrier({
        ...payload,
        service_provider_sid: currentServiceProvider?.service_provider_sid,
      })
        .then(({ json }) => {
          toastSuccess("Carrier created successfully");
          console.log(json);
          navigate(`${ROUTE_INTERNAL_CARRIERS}`);
        })
        .catch((error) => {
          toastError(error.msg);
        });
    }
  };

  useEffect(() => {
    if (predefinedName && predefinedCarriers && hasLength(predefinedCarriers)) {
      setStates(
        predefinedCarriers?.filter((a) => a.name === predefinedName)[0]
      );
    }
  }, [predefinedName]);

  useEffect(() => {
    if (!carrier) {
      addSipGateway();
    } else if (carrier.data) {
      setStates(carrier.data);
    }
  }, [carrier]);

  useEffect(() => {
    console.log(sipGateways);
  }, [sipGateways]);

  return (
    <Section slim>
      <form className="form form--internal" onSubmit={handleSubmit}>
        <fieldset>
          <MS>{MSG_REQUIRED_FIELDS}</MS>
        </fieldset>
        {predefinedCarriers && hasLength(predefinedCarriers) && (
          <fieldset>
            <label htmlFor="predefined_select">Presets</label>
            <Selector // TODO selecting NONE reset the fields?
              id="predefined_select"
              name="predefined_select"
              value={predefinedName}
              options={[
                {
                  name: "None",
                  value: "",
                },
              ].concat(
                predefinedCarriers?.map((carrier) => ({
                  // TODO filter by `requires_static_ip`
                  // the type is different, but we're totally knowing what we are doing
                  name: carrier.name,
                  value: carrier.name,
                }))
              )}
              onChange={(e) => setPredefinedName(e.target.value)}
            />
          </fieldset>
        )}
        <fieldset>
          <label htmlFor="carrier_name">
            Carrier name<span>*</span>
          </label>
          <input
            id="carrier_name"
            name="carrier_name"
            type="text"
            required
            placeholder="Carrier name"
            value={carrierName}
            onChange={(e) => setCarrierName(e.target.value)}
          />
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
        </fieldset>

        {/*SIP*/}
        <fieldset>
          <label htmlFor="e164" className="chk">
            <div>E.164 Syntax</div>
            <input
              id="e164"
              name="e164"
              type="checkbox"
              checked={e164}
              onChange={(e) => setE164(e.target.checked)}
            />
            <div>prepend a leading + on origination attempts</div>
          </label>
          {accounts && (
            <>
              <label htmlFor="account_name">Account</label>
              <Selector
                id="account_name"
                name="account_name"
                value={accountSid}
                options={[
                  {
                    name: "All accounts",
                    value: "",
                  },
                ].concat(
                  accounts.map((account) => ({
                    name: account.name,
                    value: account.account_sid,
                  }))
                )}
                onChange={(e) => setAccountSid(e.target.value)}
              />
            </>
          )}
        </fieldset>
        <fieldset>
          <Checkzone
            hidden
            name="sip_credentials"
            label="Does your carrier require authentication on outbound calls?"
            initialCheck={sipUser ? true : false}
          >
            <label htmlFor="sip_username">Username</label>
            <input
              id="sip_username"
              name="sip_username"
              type="text"
              value={sipUser}
              placeholder="SIP username for authenticating outbound calls"
              onChange={(e) => {
                setSipUser(e.target.value);
              }}
            />
            <label htmlFor="sip_password">Password</label>
            <Passwd
              id="sip_password"
              name="sip_password"
              value={sipPass}
              placeholder="SIP password for authenticating outbound calls"
              onChange={(e) => {
                setSipPass(e.target.value);
              }}
            />
            <label htmlFor="sip_register">
              <input
                id="sip_register"
                name="sip_register"
                type="checkbox"
                checked={sipRegister}
                onChange={(e) => setSipRegister(e.target.checked)}
              />
              <div>
                Carrier requires SIP Register before sending outbound calls
              </div>
            </label>
          </Checkzone>
        </fieldset>

        <fieldset>
          <Checkzone
            hidden
            name="tech_prefix_check"
            label="Does your carrier require a tech prefix on outbound calls?"
            initialCheck={prefix ? true : false}
          >
            <input
              id="tech_prefix"
              name="tech_prefix"
              type="text"
              value={prefix}
              placeholder="Tech prefix"
              onChange={(e) => {
                // TODO, clear the payload if these are unchecked
                setPrefix(e.target.value);
              }}
            />
          </Checkzone>
        </fieldset>
        <fieldset>
          <Checkzone
            // the checkbox size is scaling by how long the label is
            // so this one size looks comically small
            hidden
            name="diversion_check"
            label="Does your carrier support the SIP Diversion header for authenticating the calling number?"
            initialCheck={diversion ? true : false}
          >
            <input
              id="diversion"
              name="diversion"
              type="text"
              value={diversion}
              placeholder="Phone number or SIP URI"
              onChange={(e) => {
                // TODO, clear the payload if these are unchecked
                setDiversion(e.target.value);
              }}
            />
          </Checkzone>
        </fieldset>
        <fieldset>
          <>
            <label htmlFor="sip_gateways">SIP Gateways</label>
            <label htmlFor="sip_gateways">
              Network Address / Port / Netmask
            </label>
            {sipGateways &&
              sipGateways.map((g, i) => {
                <div key={`sip_gateway_${i}`}>
                  <input
                    id={`ip_${i}`}
                    name={`ip_${i}`}
                    type="text"
                    placeholder="1.2.3.4"
                    value={g.ipv4}
                    onChange={(e) => {
                      updateSipGateways(e, i, "ipv4");
                    }}
                  />
                  <input
                    id={`port_${i}`}
                    name={`port_${i}`}
                    type="text"
                    placeholder="5060"
                    value={g.port}
                    onChange={(e) => {
                      updateSipGateways(e, i, "port");
                    }}
                  />
                  <input
                    id={`netmask_${i}`}
                    name={`netmask_${i}`}
                    type="text"
                    placeholder="32"
                    value={g.netmask}
                    onChange={(e) => {
                      updateSipGateways(e, i, "netmask");
                    }}
                  />
                  <input
                    id={`inbound_${i}`}
                    name={`inbound_${i}`}
                    type="checkbox"
                    checked={g.inbound}
                    onChange={(e) => {
                      updateSipGateways(e, i, "inbound");
                    }}
                  />
                  <input
                    id={`outbound_${i}`}
                    name={`outbound_${i}`}
                    type="checkbox"
                    checked={g.outbound}
                    onChange={(e) => {
                      updateSipGateways(e, i, "outbound");
                    }}
                  />
                  <div>Active</div>
                  <button
                    title="Delete SIP Gateway"
                    onClick={() =>
                      setSipGateways(sipGateways.filter((g2, i2) => i2 === i))
                    }
                  >
                    <Icons.Trash />
                  </button>
                </div>;
              })}
            <button title="Add a SIP gateway" onClick={() => addSipGateway()}>
              <Icons.Plus />
            </button>
          </>
        </fieldset>
        {/*SIP ends*/}

        {/*SMPP*/}
        {/*SMPP ends*/}
        <fieldset>
          <ButtonGroup left>
            <Button
              small
              subStyle="grey"
              as={Link}
              to={ROUTE_INTERNAL_CARRIERS}
            >
              Cancel
            </Button>
            <Button type="submit" small>
              Save
            </Button>
          </ButtonGroup>
        </fieldset>
      </form>
    </Section>
  );
};

export default CarrierForm;
