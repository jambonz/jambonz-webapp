import React, { useEffect, useRef, useState } from "react";
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
  TCP_MAX_PORT,
  TECH_PREFIX_MINLENGTH,
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

  const refSipIp = useRef<HTMLInputElement[]>([]);
  const refSipPort = useRef<HTMLInputElement[]>([]);
  const refSmppIp = useRef<HTMLInputElement[]>([]);
  const refSmppPort = useRef<HTMLInputElement[]>([]);

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

  const addSmppGateway = (obj: Partial<SmppGateway>) => {
    setSmppGateways((curr) => [
      ...curr,
      {
        ...DEFAULT_SMPP_GATEWAY /** { inbound: true, outbound: true } */,
        ...obj /** pass which one is false: e.g. { outbound: false } */,
      },
    ]);
  };

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
    sipGatewaysDelete.forEach((g) => {
      if (g.sip_gateway_sid) {
        deleteSipGateway(g.sip_gateway_sid);
      }
    });
    setSipGatewaysDelete([]);
  };

  const handleSmppGatewayDelete = () => {
    smppGatewaysDelete.forEach((g) => {
      if (g.smpp_gateway_sid) {
        deleteSmppGateway(g.smpp_gateway_sid);
      }
    });
    setSmppGatewaysDelete([]);
  };

  const hasEmptySmppGateways = (type: keyof SmppGateway) => {
    const filtered = smppGateways.filter((g) => g[type]);
    return (
      hasLength(filtered) &&
      filtered.reduce((acc, g) => {
        return acc + g.ipv4.trim();
      }, "") === ""
    );
  };

  const handleActiveTab = () => {
    /** When to switch to `sip` tab */

    const emptySipIp = sipGateways.find((g) => g.ipv4.trim() === "");
    const invalidSipPort = sipGateways.find((g) => !isValidPort(g.port));

    /** Empty SIP gateway */
    /** Invalid SIP port number */
    /** Outbound auth conditionals */
    if (
      emptySipIp ||
      invalidSipPort ||
      (sipUser && !sipPass) ||
      (sipPass && !sipUser) ||
      (sipRegister && (!sipRealm || !sipPass || !sipUser)) ||
      (prefix && prefix.length < TECH_PREFIX_MINLENGTH)
    ) {
      setActiveTab("sip");
    }

    /** When to switch to the `smpp` tab */

    const invalidSmppPort = smppGateways
      .filter((g) => g.outbound)
      .find((g) => !isValidPort(g.port));

    /** Outbound user/pass filled out but no gateways */
    /** Inbound gateways but no inbound pass */
    /** Invalid SMPP port number */
    if (
      invalidSmppPort ||
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

    for (let i = 0; i < sipGateways.length; i++) {
      const gateway = sipGateways[i];
      const type = getIpValidationType(gateway.ipv4);

      if (type === FQDN_TOP_LEVEL) {
        setMessage(
          "When using an FQDN, you must use a subdomain (e.g. sip.example.com)."
        );
        refSipIp.current[i].focus();
        return;
      } else if (type === INVALID) {
        setMessage(
          "Please provide a valid IP address or fully qualified domain name."
        );
        refSipIp.current[i].focus();
        return;
      }

      /** Port validation */
      if (!isValidPort(gateway.port)) {
        setMessage(
          `Please provide a valid port number between 0 and ${TCP_MAX_PORT}`
        );
        refSipPort.current[i].focus();
        return;
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
        setMessage("Each SIP gateway must have a unique IP address.");
        refSipIp.current[i].focus();
        return;
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
                      name: carrier.name,
                      value: carrier.name,
                    }))
                  )}
                  onChange={(e) => setPredefinedName(e.target.value)}
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
              </label>
              <MXS>
                <em>Prepend a leading + on origination attempts.</em>
              </MXS>
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
                  minLength={TECH_PREFIX_MINLENGTH}
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
                handleChecked={(e) => {
                  if (!e.target.checked) {
                    setDiversion("");
                  }
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
              <label htmlFor="sip_gateways">
                SIP Gateways<span>*</span>
              </label>
              <MXS>
                <em>At least one SIP gateway is required.</em>
              </MXS>
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
                          ref={(ref: HTMLInputElement) =>
                            (refSipIp.current[i] = ref)
                          }
                        />
                      </div>
                      <div>
                        <input
                          id={`sip_port_${i}`}
                          name={`sip_port_${i}`}
                          type="number"
                          min="0"
                          max={TCP_MAX_PORT}
                          placeholder={DEFAULT_SIP_GATEWAY.port.toString()}
                          value={g.port}
                          onChange={(e) => {
                            updateSipGateways(
                              i,
                              "port",
                              Number(e.target.value)
                            );
                          }}
                          ref={(ref: HTMLInputElement) =>
                            (refSipPort.current[i] = ref)
                          }
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
                placeholder="SMPP system ID to authenticate with"
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
              <label htmlFor="outbound_smpp">
                Carrier SMPP Gateways
                <span>{smppSystemId || smppPass ? "*" : ""}</span>
              </label>
              <MXS>
                <em>
                  At least one outbound gateway is required when using system ID
                  or password above.
                </em>
              </MXS>
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
                            ref={(ref: HTMLInputElement) =>
                              (refSmppIp.current[i] = ref)
                            }
                          />
                        </div>
                        <div>
                          <input
                            id={`port_${i}`}
                            name={`port_${i}`}
                            type="number"
                            min="0"
                            max={TCP_MAX_PORT}
                            placeholder={DEFAULT_SMPP_GATEWAY.port.toString()}
                            value={g.port}
                            onChange={(e) =>
                              updateSmppGateways(
                                i,
                                "port",
                                Number(e.target.value)
                              )
                            }
                            ref={(ref: HTMLInputElement) =>
                              (refSmppPort.current[i] = ref)
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
                        onClick={() => {
                          if (
                            hasLength(smpps) &&
                            smppGateways.filter((g) => g.outbound).length <=
                              1 &&
                            (smppSystemId || smppPass)
                          ) {
                            setMessage(
                              "You must provide at least one Outbound Gateway."
                            );
                          } else {
                            setSmppGateways(
                              smppGateways.filter(
                                (g2, i2) =>
                                  i2 !== i ||
                                  setSmppGatewaysDelete((curr) => [...curr, g2])
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
                  ) : null;
                })}
              <ButtonGroup left>
                <button
                  className="btnty"
                  type="button"
                  onClick={() => addSmppGateway({ inbound: false })}
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
                placeholder="SMPP system ID to authenticate with"
                onChange={(e) => {
                  setSmppInboundSystemId(e.target.value);
                }}
              />
              <label htmlFor="inbound_pass">
                Password
                <span>{!hasEmptySmppGateways("inbound") ? "*" : ""}</span>
              </label>
              <MXS>
                <em>
                  Passord is required if whitelisting carrier IP address(es)
                  below.
                </em>
              </MXS>
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
                            ref={(ref: HTMLInputElement) =>
                              (refSmppIp.current[i] = ref)
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
                  onClick={() => addSmppGateway({ outbound: false })}
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
            <Button type="submit" small onClick={handleActiveTab}>
              Save
            </Button>
          </ButtonGroup>
        </fieldset>
      </form>
    </Section>
  );
};

export default CarrierForm;
