import { Button, ButtonGroup, MS, P, Tab, Tabs } from "jambonz-ui";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  deleteSipGateway,
  deleteSmppGateway,
  postCarrier,
  postSipGateway,
  postSmppGateway,
  putCarrier,
  putSipGateway,
  putSmppGateway,
} from "src/api";
import {
  Account,
  UseApiDataMap,
  Carrier,
  SipGateway,
  SmppGateway,
  PredefinedCarriers,
} from "src/api/types";
import { Icons, Section } from "src/components";
import { Checkzone, Message, Passwd, Selector } from "src/components/forms";
import { MSG_REQUIRED_FIELDS } from "src/constants";
import { ROUTE_INTERNAL_CARRIERS } from "src/router/routes";
import { toastError, toastSuccess, useSelectState } from "src/store";
import { hasLength } from "src/utils";

type CarrierFormProps = {
  carrier?: UseApiDataMap<Carrier>;
  carrierSipGateways?: SipGateway[] | null;
  carrierSmppGateways?: SmppGateway[] | null;
  carrierSipGatewayRefetch?: () => void;
  carrierSmppGatewayRefetch?: () => void;
  accounts: null | Account[];
  carriers: null | Carrier[];
  predefinedCarriers: null | PredefinedCarriers[];
};

export const CarrierForm = ({
  carrier,
  carrierSipGateways,
  carrierSmppGateways,
  carrierSipGatewayRefetch,
  carrierSmppGatewayRefetch,
  accounts,
  predefinedCarriers,
}: CarrierFormProps) => {
  const navigate = useNavigate();
  const currentServiceProvider = useSelectState("currentServiceProvider");
  const [activeTab, setActiveTab] = useState("");
  const [predefinedName, setPredefinedName] = useState("");

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

  const [sipGateways, setSipGateways] = useState<SipGateway[]>([]);
  const [smppGateways, setSmppGateways] = useState<SmppGateway[]>([]);

  const [sipGatewaysDelete, setSipGatewaysDelete] = useState<SipGateway[]>([]);
  const [smppGatewaysDelete, setSmppGatewaysDelete] = useState<SmppGateway[]>(
    []
  );

  const [message, setMessage] = useState("");

  if (message) {
    // unwarning com/transpiler warning TODO if needed
  }

  const setCarrierStates = (obj: Carrier) => {
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
  };

  const addSipGateway = () => {
    setSipGateways((curr) => [
      // this could be move to the constant TODO
      ...curr,
      {
        voip_carrier_sid: "",
        ipv4: "",
        port: 5060,
        netmask: 32,
        is_active: false,
        inbound: true,
        outbound: false,
      } as SipGateway,
    ]);
  };

  const addSmppGateway = (type: boolean) => {
    setSmppGateways((curr) => [
      ...curr,
      {
        voip_carrier_sid: "",
        ipv4: "",
        port: 2775,
        is_primary: false,
        use_tls: false,
        netmask: 32,
        inbound: !type,
        outbound: type,
      } as SmppGateway,
    ]);
  };

  // TODO we can try to reduce the code by making callback and stuff (3+ parameters for that function), or we can just move it out of here
  const updateSipGateways = (
    index: number,
    key: string,
    value: typeof sipGateways[number][keyof SipGateway]
  ) => {
    setSipGateways(
      sipGateways.map((g, i) => (i === index ? { ...g, [key]: value } : g))
    );
  };

  const updateSmppGateways = (
    index: number,
    key: string,
    value: typeof smppGateways[number][keyof SmppGateway]
  ) => {
    setSmppGateways(
      smppGateways.map((g, i) => (i === index ? { ...g, [key]: value } : g))
    );
  };

  const handleSipGatewayPutPost = (voip_carrier_sid: string) => {
    sipGateways.forEach(({ sip_gateway_sid, ...g }: SipGateway) =>
      sip_gateway_sid
        ? putSipGateway(sip_gateway_sid, g)
        : postSipGateway({ ...g, voip_carrier_sid: voip_carrier_sid })
    );
  };

  const handleSmppGatewayPutPost = (voip_carrier_sid: string) => {
    smppGateways.forEach(({ smpp_gateway_sid, ...g }: SmppGateway) => {
      smpp_gateway_sid
        ? putSmppGateway(smpp_gateway_sid, g)
        : postSmppGateway({ ...g, voip_carrier_sid: voip_carrier_sid });
    });
  };

  const handleSipGatewayDelete = () => {
    sipGatewaysDelete.forEach(
      (g) => g.sip_gateway_sid && deleteSipGateway(g.sip_gateway_sid)
    );
  };

  const handleSmppGatewayDelete = () => {
    smppGatewaysDelete.forEach(
      (g) => g.smpp_gateway_sid && deleteSmppGateway(g.smpp_gateway_sid)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");

    if (!hasLength(sipGateways)) {
      setMessage("You must provide at least one SIP Gateway.");
      return;
    }

    const regIp =
      /^((25[0-5]|2[0-4][0-9]|[0-1]?[0-9]?[0-9])\.){3}(25[0-5]|2[0-4][0-9]|[0-1]?[0-9]?[0-9])$/;
    const regFqdn = /^([a-zA-Z0-9][^.]*)(\.[^.]+){2,}$/;
    const regFqdnTopLevel = /^([a-zA-Z][^.]*)(\.[^.]+)$/;
    const regPort = /^[0-9]+$/;

    // copy pasted portion
    // uhhh, not sure if this is what we want
    for (const gateway of sipGateways) {
      console.log("do validation");
      //-----------------------------------------------------------------------------
      // IP validation
      //-----------------------------------------------------------------------------
      const type = regIp.test(gateway.ipv4.trim())
        ? "ip"
        : regFqdn.test(gateway.ipv4.trim())
        ? "fqdn"
        : regFqdnTopLevel.test(gateway.ipv4.trim())
        ? "fqdn-top-level"
        : "invalid";

      console.log(type);

      if (!gateway.ipv4) {
        setMessage(
          "The IP Address cannot be blank. Please provide an IP address or delete the row."
        );
        return;
      } else if (type === "fqdn-top-level") {
        setMessage(
          "When using an FQDN, you must use a subdomain (e.g. sip.example.com)."
        );
        return;
      } else if (type === "invalid") {
        setMessage(
          "Please provide a valid IP address or fully qualified domain name."
        );
        return;
      }

      //-----------------------------------------------------------------------------
      // Port validation
      //-----------------------------------------------------------------------------
      if (
        gateway.port &&
        (!regPort.test(gateway.port.toString().trim()) ||
          parseInt(gateway.port.toString().trim()) < 0 ||
          parseInt(gateway.port.toString().trim()) > 65535)
      ) {
        setMessage("Please provide a valid port number between 0 and 65535");
        return;
      }
      //-----------------------------------------------------------------------------
      // inbound/outbound validation
      //-----------------------------------------------------------------------------
      if (type === "fqdn" && (!gateway.outbound || gateway.inbound)) {
        setMessage(
          "A fully qualified domain name may only be used for outbound calls."
        );
        return;
      } else if (!gateway.inbound && !gateway.outbound) {
        setMessage(
          "Each SIP Gateway must accept inbound calls, outbound calls, or both."
        );
        return;
      }

      //-----------------------------------------------------------------------------
      // duplicates validation
      //-----------------------------------------------------------------------------
      for (const otherGateway of sipGateways) {
        if (gateway.sip_gateway_sid === otherGateway.sip_gateway_sid) continue;
        if (!gateway.ipv4) continue;
        if (
          gateway.ipv4 === otherGateway.ipv4 &&
          gateway.port === otherGateway.port
        ) {
          setMessage("Each SIP gateway must have a unique IP address.");
          return;
        }
      }
    }
    if (currentServiceProvider) {
      const carrierPayload: Partial<Carrier> = {
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
        putCarrier(
          currentServiceProvider.service_provider_sid,
          carrier.data.voip_carrier_sid,
          carrierPayload
        )
          .then(() => {
            if (carrier.data?.voip_carrier_sid) {
              handleSipGatewayPutPost(carrier.data.voip_carrier_sid);
              handleSmppGatewayPutPost(carrier.data.voip_carrier_sid);
            }
            handleSipGatewayDelete();
            handleSmppGatewayDelete();

            toastSuccess("Carrier updated successfully");
            carrier.refetch();

            if (carrierSipGatewayRefetch) {
              carrierSipGatewayRefetch();
            }
            if (carrierSmppGatewayRefetch) {
              carrierSmppGatewayRefetch();
            }
          })
          .catch((error) => {
            toastError(error.msg);
          });
      } else {
        postCarrier(currentServiceProvider.service_provider_sid, {
          ...carrierPayload,
          service_provider_sid: currentServiceProvider.service_provider_sid,
        })
          .then(({ json }) => {
            handleSipGatewayPutPost(json.sid);
            handleSmppGatewayPutPost(json.sid);

            handleSipGatewayDelete();
            handleSmppGatewayDelete();

            toastSuccess("Carrier created successfully");
            navigate(`${ROUTE_INTERNAL_CARRIERS}/${json.sid}/edit`);
          })
          .catch((error) => {
            toastError(error.msg);
          });
      }
    }
  };

  useEffect(() => {
    if (predefinedName && predefinedCarriers && hasLength(predefinedCarriers)) {
      setCarrierStates(
        predefinedCarriers?.filter((a) => a.name === predefinedName)[0]
      );
    }
  }, [predefinedName]);

  useEffect(() => {
    if (carrier && carrier.data) {
      setCarrierStates(carrier.data);

      if (carrierSipGateways) {
        setSipGateways(carrierSipGateways);
      }
      if (carrierSmppGateways && carrierSmppGateways) {
        setSmppGateways(carrierSmppGateways);
      }
    } else {
      addSipGateway();
      addSmppGateway(false); // the argument could be a bit clearer TODO
      addSmppGateway(true);
    }
  }, [carrier, carrierSipGateways, carrierSmppGateways]);

  useEffect(() => {
    console.log(sipGateways);
  }, [sipGateways, smppGateways]);

  return (
    <Section slim>
      <form className="form form--internal" onSubmit={handleSubmit}>
        <fieldset>
          <MS>{MSG_REQUIRED_FIELDS}</MS>
        </fieldset>
        {!carrier && predefinedCarriers && hasLength(predefinedCarriers) && (
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
                predefinedCarriers?.map((carrier: PredefinedCarriers) => ({
                  // TODO disable option by static ip, requires changes to Selector tag
                  name: carrier.requires_static_ip
                    ? `${carrier.name} -- requires static ip`
                    : carrier.name,
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

        <Tabs setActiveTab={setActiveTab}>
          {/*TODO aligning and giving more space for tab button*/}
          <Tab id="sip" label="Voice">
            <fieldset>
              <details>
                <summary>
                  Have your carriers whitelist ours{" "}
                  <span>SIP signaling IPs</span>
                </summary>
                <P>3.34.102.122:5060</P>
                <P>52.55.111.178:5060</P>
              </details>
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
              <Checkzone // uncheck the checkzone clear everything? TODO
                hidden
                name="sip_credentials"
                label="Does your carrier require authentication on outbound calls?"
                // im testing the UX over here to see how it is like, pretty complicated
                initialCheck={
                  sipUser || sipPass || sipRegister || sipRealm ? true : false
                }
              >
                <label htmlFor="sip_username">
                  Username {sipPass || sipRegister ? <span>*</span> : ""}
                </label>
                <input
                  id="sip_username"
                  name="sip_username"
                  type="text"
                  value={sipUser}
                  placeholder="SIP username for authenticating outbound calls"
                  // hasValue cant be used much because this is not null
                  required={sipRegister || sipPass.length > 0}
                  onChange={(e) => {
                    setSipUser(e.target.value);
                  }}
                />
                <label htmlFor="sip_password">
                  Password
                  {sipUser || sipRegister ? <span>*</span> : ""}
                </label>
                <Passwd
                  id="sip_password"
                  name="sip_password"
                  value={sipPass}
                  placeholder="SIP password for authenticating outbound calls"
                  required={sipRegister || sipUser.length > 0}
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
                    required={sipRegister}
                    onChange={(e) => setSipRegister(e.target.checked)}
                  />
                  <div>
                    Carrier requires SIP Register before sending outbound calls
                  </div>
                </label>
                {sipRegister && (
                  <>
                    <label htmlFor="sip_realm">
                      SIP Realm{sipRegister ? <span>*</span> : ""}
                    </label>
                    <input
                      id="sip_realm"
                      name="sip_realm"
                      type="text"
                      value={sipRealm}
                      required={sipRegister} // this is reduntant to check
                      onChange={(e) => setSipRealm(e.target.value)}
                    />
                  </>
                )}
              </Checkzone>
            </fieldset>
            <fieldset>
              <Checkzone
                hidden
                name="tech_prefix_check"
                label="Does your carrier require a tech prefix on outbound calls?"
                // errorMessages.push('If registration is required,
                // you must provide a Tech prefix with more than 2 characters.');
                // ?? no check for that so not sure if the sipRegister is needed
                initialCheck={prefix ? true : false}
              >
                <label htmlFor="tech_prefix">Tech prefix</label>
                {/* <MS>Prefix length has to be greater than 2</MS> */}
                <input
                  id="tech_prefix"
                  name="tech_prefix"
                  type="text"
                  value={prefix}
                  placeholder="Tech prefix"
                  // required={prefix.length < 2} // does not work??
                  onChange={(e) => {
                    // TODO, clear the payload if these are unchecked?
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
              <label htmlFor="sip_gateways">SIP Gateways</label>
              <label htmlFor="sip_gateways">
                Network Address / Port / Netmask
              </label>
              {sipGateways &&
                hasLength(sipGateways) &&
                sipGateways.map((g, i) => (
                  // className="multi" right now makes the buttons minicule
                  <div key={`sip_gateway_${i}`}>
                    <input
                      id={`sip_ip_${i}`}
                      name={`sip_ip_${i}`}
                      type="text"
                      placeholder="1.2.3.4"
                      required
                      value={g.ipv4}
                      onChange={(e) => {
                        updateSipGateways(i, "ipv4", e.target.value);
                      }}
                    />
                    <input
                      id={`sip_port_${i}`}
                      name={`sip_port_${i}`}
                      type="text"
                      placeholder="5060"
                      value={g.port}
                      onChange={(e) => {
                        updateSipGateways(i, "port", e.target.value);
                      }}
                    />
                    <Selector
                      id={`sip_netmask_${i}`}
                      name={`sip_netmask${i}`}
                      placeholder="32"
                      value={g.netmask}
                      options={Array(32) // not being initialized at 32 like the placeholder?
                        .fill(1)
                        .map((_, index) => ({
                          name: index.toString(),
                          value: index.toString(),
                        }))}
                      onChange={(e) => {
                        updateSipGateways(i, "netmask", e.target.value);
                      }}
                    />
                    <input
                      id={`sip_inbound_${i}`}
                      name={`sip_inbound_${i}`}
                      type="checkbox"
                      checked={g.inbound}
                      required={!g.outbound}
                      onChange={(e) => {
                        updateSipGateways(
                          i,
                          "inbound",
                          e.target.checked ? 1 : 0
                        );
                      }}
                    />
                    <input
                      id={`sip_outbound_${i}`}
                      name={`sip_outbound_${i}`}
                      type="checkbox"
                      checked={g.outbound}
                      required={!g.inbound}
                      onChange={(e) => {
                        updateSipGateways(
                          i,
                          "outbound",
                          e.target.checked ? 1 : 0
                        );
                      }}
                    />
                    <button
                      title="Delete SIP Gateway"
                      type="button"
                      onClick={() =>
                        setSipGateways(
                          sipGateways.filter(
                            (g2, i2) =>
                              i2 !== i ||
                              setSipGatewaysDelete((curr) => [...curr, g2])
                          )
                        )
                      }
                    >
                      <Icons.Trash />
                    </button>
                  </div>
                ))}
              <Button type="button" onClick={() => addSipGateway()}>
                <Icons.Plus />
              </Button>
            </fieldset>
          </Tab>
          <Tab id="smpp" label="SMS">
            <fieldset>
              <details>
                <summary>
                  Have your carriers whitelist ours{" "}
                  <span>SMPP signaling IPs</span>
                </summary>
                <P>3.209.58.102:3550 (TLS)</P>
                <P>34.197.99.29:27750</P>
              </details>
            </fieldset>
            <fieldset>
              <label htmlFor="outbound_smpp">Outbound SMPP</label>
              <label htmlFor="outbound_id">System ID</label>
              <input
                id="outbound_id"
                name="outbound_id"
                type="text"
                value={smppSystemId}
                placeholder="SMPP system id to authenticate with"
                onChange={(e) => {
                  setSmppSystemId(e.target.value);
                }}
              />
              <Passwd
                id="outbound_pass"
                name="outbound_pass"
                value={smppPass}
                placeholder="SMPP password to authenticate with"
                onChange={(e) => {
                  setSmppPass(e.target.value);
                }}
              />
              <label htmlFor="outbound_smpp">Carrier SMPP Gateways</label>
              <label htmlFor="outbound_smpp">IP or DNS / Port / Use TLS</label>
              {smppGateways &&
                hasLength(smppGateways) &&
                smppGateways.map((g, i) =>
                  g.outbound ? (
                    <div key={`smpp_gateway_outbound_${i}`}>
                      <input
                        id={`ip_${i}`}
                        name={`ip_${i}`}
                        type="text"
                        placeholder="1.2.3.4"
                        required={activeTab === "smpp"}
                        value={g.ipv4}
                        onChange={(e) =>
                          updateSmppGateways(i, "ipv4", e.target.value)
                        }
                      />
                      <input
                        id={`port_${i}`}
                        name={`port_${i}`}
                        type="text"
                        placeholder="2775"
                        value={g.port}
                        onChange={(e) =>
                          updateSmppGateways(i, "port", e.target.value)
                        }
                      />
                      <input
                        id={`use_tls_${i}`}
                        name={`use_tls_${i}`}
                        type="checkbox"
                        checked={g.use_tls}
                        onChange={(e) =>
                          updateSmppGateways(
                            i,
                            "use_tls",
                            e.target.checked ? 1 : 0
                          )
                        }
                      />
                      <button
                        title="Delete Outbound SMPP Gateway"
                        type="button"
                        onClick={() =>
                          setSmppGateways(
                            smppGateways.filter(
                              (g2, i2) =>
                                i2 !== i ||
                                setSmppGatewaysDelete((curr) => [...curr, g2])
                            )
                          )
                        }
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  ) : null
                )}
              <Button type="button" onClick={() => addSmppGateway(true)}>
                <Icons.Plus />
              </Button>
            </fieldset>

            <fieldset>
              <label htmlFor="inbound_smpp">Inbound SMPP</label>
              <input
                id="inbound_id"
                name="inbound_id"
                type="text"
                value={smppInboundSystemId}
                placeholder="SMPP system id to authenticate with"
                onChange={(e) => {
                  setSmppInboundSystemId(e.target.value);
                }}
              />
              <Passwd
                id="inbound_pass"
                name="inbound_pass"
                value={smppInboundPass}
                placeholder="SMPP password for authenticating inbound messages"
                onChange={(e) => {
                  setSmppInboundPass(e.target.value);
                }}
              />
              <label htmlFor="inbound_smpp">
                Carrier IP Address(es) to whitelist
              </label>
              <label htmlFor="inbound_smpp">IP Adress / Netmask</label>
              {smppGateways &&
                hasLength(smppGateways) &&
                smppGateways.map((g, i) =>
                  g.inbound ? (
                    <div key={`smpp_gateway_inbound_${i}`}>
                      <input
                        id={`smpp_ip_${i}`}
                        name={`smpp_ip_${i}`}
                        type="text"
                        placeholder="1.2.3.4"
                        value={g.ipv4}
                        onChange={(e) =>
                          updateSmppGateways(i, "ipv4", e.target.value)
                        }
                      />
                      <Selector
                        id={`smpp_netmask_${i}`}
                        name={`smpp_netmask_${i}`}
                        placeholder="32"
                        options={Array(32)
                          .fill(1)
                          .map((_, index) => ({
                            name: index.toString(),
                            value: index.toString(),
                          }))}
                        value={g.netmask}
                        onChange={(e) =>
                          updateSmppGateways(i, "netmask", e.target.value)
                        }
                      />
                      <button
                        title="Delete Inbound SMPP Gateway"
                        type="button"
                        onClick={() =>
                          setSmppGateways(
                            smppGateways.filter(
                              (g2, i2) =>
                                i2 !== i ||
                                setSmppGatewaysDelete((curr) => [...curr, g2])
                            )
                          )
                        }
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  ) : null
                )}
              <Button type="button" onClick={() => addSmppGateway(false)}>
                <Icons.Plus />
              </Button>
            </fieldset>
          </Tab>
        </Tabs>
        {message && <fieldset>{<Message message={message} />}</fieldset>}
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
