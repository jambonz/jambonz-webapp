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
  FQDN_TOP_LEVEL,
  INVALID,
  NETMASK_BITS,
} from "src/api/constants";
import { Icons, Section } from "src/components";
import { Checkzone, Message, Passwd, Selector } from "src/components/forms";
import { MSG_REQUIRED_FIELDS } from "src/constants";
import { ROUTE_INTERNAL_CARRIERS } from "src/router/routes";
import { toastError, toastSuccess, useSelectState } from "src/store";
import { getIpValidationType, hasLength, isValidPort } from "src/utils";

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
  accounts?: Account[];
  predefinedCarriers?: PredefinedCarriers[];
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
  const netmaskOptions = NETMASK_BITS.map((bit) => ({
    name: bit.toString(),
    value: bit.toString(),
  }));
  const defaultSmppGateways = [
    {
      ...DEFAULT_SMPP_GATEWAY,
      inbound: false,
    },
    {
      ...DEFAULT_SMPP_GATEWAY,
      outbound: false,
    },
  ];

  const [sbcs] = useApiData<Sbc[]>("Sbcs");
  const [smpps] = useApiData<Smpp[]>("Smpps");

  const [activeTab, setActiveTab] = useState("");
  const [predefinedName, setPredefinedName] = useState("");

  const [carrierName, setCarrierName] = useState("");
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

  /** TODO: we can try to reduce the code by making callback and stuff (3+ parameters for that function), or we can just move it out of here */
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

  const hasEmptySmppGateways = (type: keyof SmppGateway) => {
    const filtered = smppGateways.filter((g) => g[type]);
    return (
      hasLength(filtered) && filtered.map((g) => g.ipv4.trim()).join("") === ""
    );
  };

  const handleOnClick = () => {
    /** When to switch to `sip` tab */

    const emptySipIp = sipGateways.find((g) => g.ipv4.trim() === "");

    /** Empty SIP gateway */
    /** Outbound auth conditionals */
    if (
      emptySipIp ||
      (sipUser && !sipPass) ||
      (sipPass && !sipUser) ||
      (sipRegister && (!sipRealm || !sipPass || !sipUser)) ||
      (prefix && prefix.length < 3)
    ) {
      setActiveTab("sip");
    }

    /** When to switch to the `smpp` tab */

    /** Outbound user/pass filled out but no gateways */
    /** Inbound gateways but no inbound pass */
    if (
      (smppSystemId && smppPass && hasEmptySmppGateways("outbound")) ||
      (!smppInboundPass && !hasEmptySmppGateways("inbound"))
    ) {
      setActiveTab("smpp");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");

    if (!hasLength(sipGateways)) {
      setMessage("You must provide at least one SIP Gateway.");
      return;
    }

    let loop_type = 0; // just to make it quick
    for (const gateways of [sipGateways, smppGateways]) {
      for (const gateway of gateways) {
        const type = getIpValidationType(gateway.ipv4);
        let message = "";

        /** IP validation */
        if (!gateway.ipv4) {
          message +=
            "The IP Address cannot be blank. Please provide an IP address or delete the row.\n";
        } else if (type === FQDN_TOP_LEVEL) {
          message +=
            "When using an FQDN, you must use a subdomain (e.g. sip.example.com).\n";
        } else if (type === INVALID) {
          message +=
            "Please provide a valid IP address or fully qualified domain name.\n";
        }

        /** Port validation */
        if (isValidPort(gateway.port)) {
          message +=
            "Please provide a valid port number between 0 and 65535.\n";
        }

        /** Inbound/Outbound validation */
        if (type === "fqdn" && (!gateway.outbound || gateway.inbound)) {
          message +=
            "A fully qualified domain name may only be used for outbound calls.\n";
        } else if (!gateway.inbound && !gateway.outbound) {
          message +=
            "Each SIP Gateway must accept inbound calls, outbound calls, or both.\n";
        }

        /** Duplicates validation */
        const dupeSipGateway = sipGateways.find((g) => {
          return (
            g !== gateway &&
            gateway.ipv4 &&
            g.ipv4 === gateway.ipv4 &&
            g.port === gateway.port
          );
        });

        if (dupeSipGateway) {
          message += "Each SIP gateway must have a unique IP address.\n";
        }

        if (message) {
          loop_type === 0 ? setActiveTab("sip") : setActiveTab("smpp");
          setMessage(message);
          return;
        }
      }
      ++loop_type;
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

      carrierSipGateways?.data
        ? setSipGateways(carrierSipGateways.data)
        : setSipGateways([DEFAULT_SIP_GATEWAY]);
      carrierSmppGateways?.data
        ? setSmppGateways(carrierSmppGateways.data)
        : setSmppGateways(defaultSmppGateways);
    } else {
      setSipGateways([DEFAULT_SIP_GATEWAY]);
      setSmppGateways(defaultSmppGateways);
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
                      // TODO: Disable option by static ip, requires changes to Selector tag
                      name: carrier.requires_static_ip
                        ? `${carrier.name} -- requires static ip`
                        : carrier.name,
                      value: carrier.name,
                    }))
                  )}
                  onChange={(e) => {
                    setPredefinedName(e.target.value);

                    // TODO: Reset prefefined carrier fields when selecting "None"
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
        <Tabs active={[activeTab, setActiveTab]}>
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
                initialCheck={
                  sipUser || sipPass || sipRealm || sipRegister ? true : false
                }
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
                      required={sipRegister}
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
              {hasLength(sipGateways) &&
                sipGateways.map((g, i) => (
                  <div
                    key={`sip_gateway_${i}`}
                    className="gateway gateway--sip"
                  >
                    <div>
                      <div>
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
                      <div>
                        <input
                          id={`sip_port_${i}`}
                          name={`sip_port_${i}`}
                          type="text"
                          placeholder={DEFAULT_SIP_GATEWAY.port.toString()}
                          value={g.port}
                          onChange={(e) => {
                            updateSipGateways(i, "port", e.target.value);
                          }}
                        />
                      </div>
                      <div>
                        <Selector
                          id={`sip_netmask_${i}`}
                          name={`sip_netmask${i}`}
                          placeholder="32"
                          value={g.netmask}
                          options={netmaskOptions}
                          onChange={(e) => {
                            updateSipGateways(i, "netmask", e.target.value);
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div>
                        <label htmlFor={`sip_inbound_${i}`} className="chk">
                          <input
                            id={`sip_inbound_${i}`}
                            name={`sip_inbound_${i}`}
                            type="checkbox"
                            checked={g.inbound}
                            required={!g.outbound}
                            onChange={(e) => {
                              updateSipGateways(i, "inbound", e.target.checked);
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
                                e.target.checked
                              );
                            }}
                          />
                          <div>Outbound</div>
                        </label>
                      </div>
                    </div>
                    <button
                      className="btnty"
                      title="Delete SIP Gateway"
                      type="button"
                      onClick={() => {
                        setMessage("");

                        if (sipGateways.length === 1) {
                          setMessage(
                            "You must provide at least one SIP Gateway."
                          );
                        } else {
                          setSipGateways(
                            sipGateways.filter(
                              (g2, i2) =>
                                i2 !== i ||
                                setSipGatewaysDelete((curr) => [...curr, g2])
                            )
                          );
                        }
                      }}
                    >
                      <Icon>
                        <Icons.Trash2 />
                      </Icon>
                    </button>
                  </div>
                ))}
              <ButtonGroup left>
                <button
                  className="btnty"
                  type="button"
                  title="Add SIP Gateway"
                  onClick={() => {
                    setMessage("");
                    addSipGateway();
                  }}
                >
                  <Icon subStyle="teal">
                    <Icons.Plus />
                  </Icon>
                </button>
              </ButtonGroup>
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
              <label htmlFor="outbound_pass">Password</label>
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
              <label htmlFor="outbound_smpp">IP or DNS / Port</label>
              {hasLength(smppGateways.filter((g) => g.outbound)) &&
                smppGateways.map((g, i) => {
                  return g.outbound ? (
                    <div key={`smpp_gateway_outbound_${i}`} className="gateway">
                      <div>
                        <div>
                          <input
                            id={`ip_${i}`}
                            name={`ip_${i}`}
                            type="text"
                            placeholder="1.2.3.4"
                            required={smppSystemId || smppPass ? true : false}
                            value={g.ipv4}
                            onChange={(e) =>
                              updateSmppGateways(i, "ipv4", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <input
                            id={`port_${i}`}
                            name={`port_${i}`}
                            type="text"
                            placeholder={DEFAULT_SMPP_GATEWAY.port.toString()}
                            value={g.port}
                            onChange={(e) =>
                              updateSmppGateways(i, "port", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label htmlFor={`use_tls_${i}`} className="chk">
                            <input
                              id={`use_tls_${i}`}
                              name={`use_tls_${i}`}
                              type="checkbox"
                              checked={g.use_tls}
                              onChange={(e) =>
                                updateSmppGateways(
                                  i,
                                  "use_tls",
                                  e.target.checked
                                )
                              }
                            />
                            <div>Use&nbsp;TLS</div>
                          </label>
                        </div>
                      </div>
                      <button
                        title="Delete Outbound SMPP Gateway"
                        type="button"
                        className="btnty"
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
                        <Icon>
                          <Icons.Trash2 />
                        </Icon>
                      </button>
                    </div>
                  ) : null;
                })}
              <ButtonGroup left>
                <button
                  className="btnty"
                  type="button"
                  onClick={() => addSmppGateway(true)}
                  title="Add Outbound SMPP Gateway"
                >
                  <Icon subStyle="teal">
                    <Icons.Plus />
                  </Icon>
                </button>
              </ButtonGroup>
            </fieldset>
            <fieldset>
              <label htmlFor="inbound_smpp">Inbound SMPP</label>
              <label htmlFor="inbound_id">System ID</label>
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
              <label htmlFor="inbound_pass">Password</label>
              <Passwd
                id="inbound_pass"
                name="inbound_pass"
                value={smppInboundPass}
                placeholder="SMPP password for authenticating inbound messages"
                required={!hasEmptySmppGateways("inbound")}
                onChange={(e) => {
                  setSmppInboundPass(e.target.value);
                }}
              />
              <label htmlFor="inbound_smpp">
                Carrier IP Address(es) to whitelist
              </label>
              <label htmlFor="inbound_smpp">IP Adress / Netmask</label>
              {hasLength(smppGateways.filter((g) => g.inbound)) &&
                smppGateways.map((g, i) => {
                  return g.inbound ? (
                    <div key={`smpp_gateway_inbound_${i}`} className="gateway">
                      <div>
                        <div>
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
                        </div>
                        <div>
                          <Selector
                            id={`smpp_netmask_${i}`}
                            name={`smpp_netmask_${i}`}
                            placeholder="32"
                            options={netmaskOptions}
                            value={g.netmask}
                            onChange={(e) =>
                              updateSmppGateways(i, "netmask", e.target.value)
                            }
                          />
                        </div>
                      </div>
                      <button
                        className="btnty"
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
                        <Icon>
                          <Icons.Trash2 />
                        </Icon>
                      </button>
                    </div>
                  ) : null;
                })}
              <ButtonGroup left>
                <button
                  className="btnty"
                  type="button"
                  onClick={() => addSmppGateway(false)}
                  title="Add Inbound SMPP Gateway"
                >
                  <Icon subStyle="teal">
                    <Icons.Plus />
                  </Icon>
                </button>
              </ButtonGroup>
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
            <Button type="submit" small onClick={handleOnClick}>
              Save
            </Button>
          </ButtonGroup>
        </fieldset>
      </form>
    </Section>
  );
};

export default CarrierForm;
