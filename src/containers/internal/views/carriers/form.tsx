import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, ButtonGroup, Icon, MS, MXS, Tab, Tabs } from "jambonz-ui";

import {
  deleteSipGateway,
  deleteSmppGateway,
  postCarrier,
  postSipGateway,
  postSmppGateway,
  putCarrier,
  putSipGateway,
  putSmppGateway,
  useApiData,
} from "src/api";
import {
  DEFAULT_SIP_GATEWAY,
  DEFAULT_SMPP_GATEWAY,
  NETMASK_OPTIONS,
} from "src/api/constants";
import { Icons, Section } from "src/components";
import { Checkzone, Message, Passwd, Selector } from "src/components/forms";
import { MSG_REQUIRED_FIELDS } from "src/constants";
import { ROUTE_INTERNAL_CARRIERS } from "src/router/routes";
import { toastError, toastSuccess, useSelectState } from "src/store";
import { hasLength } from "src/utils";

import type {
  Account,
  UseApiDataMap,
  Carrier,
  SipGateway,
  SmppGateway,
  PredefinedCarriers,
  Sbc,
  Smpp,
} from "src/api/types";

type CarrierFormProps = {
  carrier?: UseApiDataMap<Carrier>;
  accounts: null | Account[];
  predefinedCarriers: null | PredefinedCarriers[];
  carrierSipGateways?: UseApiDataMap<SipGateway[]>;
  carrierSmppGateways?: UseApiDataMap<SmppGateway[]>;
};

export const CarrierForm = ({
  carrier,
  accounts,
  predefinedCarriers,
  carrierSipGateways,
  carrierSmppGateways,
}: CarrierFormProps) => {
  const navigate = useNavigate();
  const currentServiceProvider = useSelectState("currentServiceProvider");

  const [sbcs] = useApiData<Sbc[]>("Sbcs");
  const [smpps] = useApiData<Smpp[]>("Smpps");

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
    setSipGateways((curr) => [...curr, DEFAULT_SIP_GATEWAY]);
  };

  const addSmppGateway = (type: boolean) => {
    setSmppGateways((curr) => [
      ...curr,
      {
        ...DEFAULT_SMPP_GATEWAY,
        inbound: !type,
        outbound: type,
      },
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
      sip_gateway_sid // && g.ipv4.length > 0 this conditioni does not work because of branching and redundant as it is handled already
        ? putSipGateway(sip_gateway_sid, g)
        : postSipGateway({ ...g, voip_carrier_sid: voip_carrier_sid })
    );
  };

  const handleSmppGatewayPutPost = (voip_carrier_sid: string) => {
    smppGateways.forEach(({ smpp_gateway_sid, ...g }: SmppGateway) => {
      smpp_gateway_sid
        ? putSmppGateway(smpp_gateway_sid, g)
        : // right now, i am not sure how this condition would belong for the UX
          // the webapp lets empty smpp ipv4 getting into the db, maybe that is more preferable
          // since it happens exact to what is expected
          g.ipv4 &&
          postSmppGateway({ ...g, voip_carrier_sid: voip_carrier_sid });
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

            carrierSipGateways?.refetch && carrierSipGateways.refetch();
            carrierSmppGateways?.refetch && carrierSmppGateways.refetch();
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

      carrierSipGateways?.data && setSipGateways(carrierSipGateways.data);
      carrierSmppGateways?.data && setSmppGateways(carrierSmppGateways.data);
    } else {
      setSipGateways([DEFAULT_SIP_GATEWAY]);
      setSmppGateways([
        {
          ...DEFAULT_SMPP_GATEWAY,
          inbound: false,
          outbound: true,
        },
        {
          ...DEFAULT_SMPP_GATEWAY,
          inbound: true,
          outbound: false,
        },
      ]);
    }
  }, [carrier, carrierSipGateways, carrierSmppGateways]);

  return (
    <Section slim>
      <form className="form form--internal" onSubmit={handleSubmit}>
        <fieldset>
          <MS>{MSG_REQUIRED_FIELDS}</MS>
        </fieldset>
        <fieldset>
          <div className="multi">
            <div className="inp">
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
            </div>
            {hasLength(predefinedCarriers) && !carrier && (
              <div className="sel sel--preset">
                <label htmlFor="predefined_select">Presets</label>
                <Selector
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
                  onChange={(e) => {
                    setPredefinedName(e.target.value);

                    // Reset prefefined carrier fields when selecting "None"
                    if (e.target.value === "") {
                      console.log("Reset predefinedCarriers fields");
                    }
                  }}
                />
              </div>
            )}
          </div>
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
          <Tab id="sip" label="Voice">
            <fieldset>
              <details>
                <summary>
                  Have your carriers whitelist our SIP signaling IPs
                </summary>
                {hasLength(sbcs) &&
                  sbcs.map((sbc) => {
                    return (
                      <MS key={sbc.sbc_address_sid}>
                        {sbc.ipv4}:{sbc.port}
                      </MS>
                    );
                  })}
              </details>
            </fieldset>
            <fieldset>
              {accounts && (
                <>
                  <label htmlFor="account_name">Used by</label>
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
              <label htmlFor="e164" className="chk">
                <input
                  id="e164"
                  name="e164"
                  type="checkbox"
                  checked={e164}
                  onChange={(e) => setE164(e.target.checked)}
                />
                <div>E.164 Syntax</div>
                <MXS>(prepend a leading + on origination attempts)</MXS>
              </label>
            </fieldset>
            <fieldset>
              <Checkzone
                hidden
                name="sip_credentials"
                label="Outbound Authentication"
                initialCheck={sipUser || sipPass || sipRealm ? true : false}
                handleChecked={(e) => {
                  if (!e.target.checked) {
                    setSipUser("");
                    setSipPass("");
                    setSipRealm("");
                    setSipRegister(false);
                  }
                }}
              >
                <MS>
                  Does your carrier require authentication on outbound calls?
                </MS>
                <label htmlFor="sip_username">
                  Username {sipPass || sipRegister ? <span>*</span> : ""}
                </label>
                <input
                  id="sip_username"
                  name="sip_username"
                  type="text"
                  value={sipUser}
                  placeholder="SIP username for authenticating outbound calls"
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
                <label htmlFor="sip_register" className="chk">
                  <input
                    id="sip_register"
                    name="sip_register"
                    type="checkbox"
                    checked={sipRegister}
                    required={sipRegister}
                    onChange={(e) => setSipRegister(e.target.checked)}
                  />
                  <div>Require SIP Register</div>
                </label>
                {sipRegister && (
                  <>
                    <MS>
                      Carrier requires SIP Register before sending outbound
                      calls.
                    </MS>
                    <label htmlFor="sip_realm">
                      SIP Realm{sipRegister ? <span>*</span> : ""}
                    </label>
                    <input
                      id="sip_realm"
                      name="sip_realm"
                      type="text"
                      value={sipRealm}
                      placeholder="SIP realm for registration"
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
                label="Tech Prefix"
                initialCheck={prefix ? true : false}
                handleChecked={(e) => {
                  if (!e.target.checked) {
                    setPrefix("");
                  }
                }}
              >
                <MS>
                  Does your carrier require a tech prefix on outbound calls?
                </MS>
                <input
                  id="tech_prefix"
                  name="tech_prefix"
                  type="text"
                  value={prefix}
                  minLength={3}
                  placeholder="Tech prefix"
                  onChange={(e) => {
                    setPrefix(e.target.value);
                  }}
                />
              </Checkzone>
            </fieldset>
            <fieldset>
              <Checkzone
                hidden
                name="diversion_check"
                label="SIP Diversion Header"
                initialCheck={diversion ? true : false}
                handleChecked={() => {
                  setDiversion("");
                }}
              >
                <MS>
                  Does your carrier support the SIP Diversion header for
                  authenticating the calling number?
                </MS>
                <input
                  id="diversion"
                  name="diversion"
                  type="text"
                  value={diversion}
                  placeholder="Phone number or SIP URI"
                  onChange={(e) => {
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
                  <div key={`sip_gateway_${i}`} className="multi">
                    <div className="inp inp--med">
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
                    </div>
                    <div className="inp inp--mini">
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
                    </div>
                    <div className="sel">
                      <Selector
                        id={`sip_netmask_${i}`}
                        name={`sip_netmask${i}`}
                        placeholder="32"
                        value={g.netmask}
                        options={NETMASK_OPTIONS}
                        onChange={(e) => {
                          updateSipGateways(i, "netmask", e.target.value);
                        }}
                      />
                    </div>
                    <div>
                      <label htmlFor={`sip_inbound_${i}`} className="chk">
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
                        <div>Inbound</div>
                      </label>
                    </div>
                    <div>
                      <label htmlFor={`sip_outbound_${i}`} className="chk">
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
                        <div>Outbound</div>
                      </label>
                    </div>
                    <button
                      className="btnty"
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
              <button
                className="btnty"
                type="button"
                onClick={() => addSipGateway()}
              >
                <Icon>
                  <Icons.Plus />
                </Icon>
              </button>
            </fieldset>
          </Tab>
          <Tab id="smpp" label="SMS">
            <fieldset>
              <details>
                <summary>
                  Have your carriers whitelist our SMPP signaling IPs
                </summary>
                {hasLength(smpps) &&
                  smpps.map((smpp) => {
                    return (
                      <MS key={smpp.smpp_address_sid}>
                        {smpp.ipv4}:{smpp.port}
                        {smpp.use_tls && " (TLS)"}
                      </MS>
                    );
                  })}
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
                        options={NETMASK_OPTIONS}
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
