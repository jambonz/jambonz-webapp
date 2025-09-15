import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, ButtonGroup, Icon, MS, MXS, Tab, Tabs } from "@jambonz/ui-kit";

import {
  deleteSipGateway,
  postCarrier,
  postSipGateway,
  postSmppGateway,
  putCarrier,
  putSipGateway,
  putSmppGateway,
  useApiData,
  useServiceProviderData,
  postPredefinedCarrierTemplate,
  postPredefinedCarrierTemplateAccount,
} from "src/api";
import {
  DEFAULT_SIP_INBOUND_GATEWAY,
  DEFAULT_SMPP_GATEWAY,
  DTMF_TYPE_SELECTION,
  FQDN,
  FQDN_TOP_LEVEL,
  INVALID,
  IP,
  NETMASK_OPTIONS,
  SIP_GATEWAY_PROTOCOL_OPTIONS,
  TCP_MAX_PORT,
  TECH_PREFIX_MINLENGTH,
  TRUNK_TYPE_SELECTION,
  USER_ACCOUNT,
} from "src/api/constants";
import { Icons, Section, Tooltip } from "src/components";
import {
  Checkzone,
  Message,
  Passwd,
  Selector,
  AccountSelect,
  ApplicationSelect,
} from "src/components/forms";
import { MSG_REQUIRED_FIELDS } from "src/constants";
import { ROUTE_INTERNAL_CARRIERS } from "src/router/routes";
import { useSelectState } from "src/store";
import {
  checkSelectOptions,
  getIpValidationType,
  isUserAccountScope,
  hasLength,
  isValidPort,
  disableDefaultTrunkRouting,
  hasValue,
  isNotBlank,
} from "src/utils";

import {
  type Account,
  type UseApiDataMap,
  type Carrier,
  type SipGateway,
  type SmppGateway,
  type PredefinedCarrier,
  type Sbc,
  type Application,
  DtmfType,
  TrunkType,
} from "src/api/types";
import { setAccountFilter, setLocation } from "src/store/localStore";
import { RegisterStatus } from "./register-status";
import { useToast } from "src/components/toast/toast-provider";

type CarrierFormProps = {
  carrier?: UseApiDataMap<Carrier>;
  carrierSipGateways?: UseApiDataMap<SipGateway[]>;
  carrierSmppGateways?: UseApiDataMap<SmppGateway[]>;
};

export const CarrierForm = ({
  carrier,
  carrierSipGateways,
  carrierSmppGateways,
}: CarrierFormProps) => {
  const { toastSuccess, toastError } = useToast();
  const navigate = useNavigate();
  const user = useSelectState("user");
  const currentServiceProvider = useSelectState("currentServiceProvider");

  const refSipIp = useRef<HTMLInputElement[]>([]);
  const refSipPort = useRef<HTMLInputElement[]>([]);
  const refSmppIp = useRef<HTMLInputElement[]>([]);
  const [sbcs] = useApiData<Sbc[]>("Sbcs");
  const [applications] = useServiceProviderData<Application[]>("Applications");
  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const [predefinedCarriers] =
    useApiData<PredefinedCarrier[]>("PredefinedCarriers");

  const [activeTab, setActiveTab] = useState("");
  const [predefinedName, setPredefinedName] = useState("");

  const [carrierName, setCarrierName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [e164, setE164] = useState(false);
  const [applicationSid, setApplicationSid] = useState("");
  const [accountSid, setAccountSid] = useState("");
  const [dtmfType, setDtmfType] = useState<DtmfType>("rfc2833");
  const [trunkType, setTrunkType] = useState<TrunkType>("static_ip");

  const [inboundAuthUsername, setInboundAuthUsername] = useState("");
  const [inboundAuthPassword, setInboundAuthPassword] = useState("");

  const [sipRegister, setSipRegister] = useState(false);
  const [sipUser, setSipUser] = useState("");
  const [sipPass, setSipPass] = useState("");
  const [sipRealm, setSipRealm] = useState("");
  const [fromUser, setFromUser] = useState("");
  const [fromDomain, setFromDomain] = useState("");
  const [regPublicIpInContact, setRegPublicIpInContact] = useState(false);

  const [prefix, setPrefix] = useState("");
  const [initialPrefix, setInitialPrefix] = useState(false);
  const [diversion, setDiversion] = useState("");
  const [initialDiversion, setInitialDiversion] = useState(false);

  const [initialSipProxy, setInitialSipProxy] = useState(false);
  const [outboundSipProxy, setOutboundSipProxy] = useState("");

  const [smppSystemId, setSmppSystemId] = useState("");
  const [smppPass, setSmppPass] = useState("");
  const [smppInboundSystemId, setSmppInboundSystemId] = useState("");
  const [smppInboundPass, setSmppInboundPass] = useState("");

  const [sipInboundGateways, setSipInboundGateways] = useState<SipGateway[]>(
    [],
  );
  const [sipOutboundGateways, setSipOutboundGateways] = useState<SipGateway[]>(
    [],
  );
  const [smppGateways, setSmppGateways] = useState<SmppGateway[]>([
    {
      ...DEFAULT_SMPP_GATEWAY,
      inbound: 0,
    },
    {
      ...DEFAULT_SMPP_GATEWAY,
      outbound: 0,
    },
  ]);

  const [sipInboundMessage, setSipInboundMessage] = useState("");
  const [sipOutboundMessage, setSipOutboundMessage] = useState("");

  const validateOutboundSipGateway = (
    gateway: string,
    acceptPort: boolean = false,
  ): boolean => {
    /** validate outbound sip gateway formats:
     * - IP address (e.g., "192.168.1.1")
     * - DNS name (e.g., "example.com")
     * - Domain with port (e.g., "example.com:5060")
     * - sip:IP or domain (e.g., "sip:example.com")
     * - sips:IP or domain (e.g., "sips:example.com")
     * - sip:IP or domain with port (e.g., "sip:example.com:5060")
     * - Full SIP URI with optional port (e.g., "sip:user@example.com:5060")
     */

    // First handle URIs with colon but not sip: or sips: prefix
    if (gateway.includes(":")) {
      // Check if it's a domain:port format (without sip prefix)
      if (!gateway.startsWith("sip:") && !gateway.startsWith("sips:")) {
        if (!acceptPort) {
          return false; // Reject domain:port if ports not accepted
        }

        // Extract domain part for validation
        const parts = gateway.split(":");
        const domain = parts[0];

        // Validate domain part
        const domainType = getIpValidationType(domain);
        if (domainType === INVALID) {
          return false;
        }

        // Optionally validate port range
        if (parts.length > 1) {
          const port = parseInt(parts[1]);
          if (isNaN(port) || port < 1 || port > 65535) {
            return false;
          }
        }

        return true;
      }

      // Handle sip: or sips: URIs
      // Use regex to properly extract domain (and port if present)
      const sipUriPattern = /^(sip|sips):(?:([^@]+)@)?([^:@]+)(?::(\d+))?/;
      const match = gateway.match(sipUriPattern);

      if (match) {
        const domain = match[3];
        const domainType = getIpValidationType(domain);

        if (domainType === INVALID) {
          return false;
        }

        // If port is present, validate it
        if (match[4] && !acceptPort) {
          return false; // Reject if port not accepted
        }

        return true;
      }

      return false;
    }

    // Simple IP or domain name without any colons
    const gatewayType = getIpValidationType(gateway);
    return gatewayType !== INVALID;
  };

  const setCarrierStates = (obj: Carrier) => {
    if (obj) {
      setIsActive(obj.is_active);
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
      if (obj.register_from_user) {
        setFromUser(obj.register_from_user);
      }
      if (obj.register_from_domain) {
        setFromDomain(obj.register_from_domain);
      }
      if (obj.register_public_ip_in_contact) {
        setRegPublicIpInContact(obj.register_public_ip_in_contact);
      }

      if (obj.tech_prefix) {
        setPrefix(obj.tech_prefix);
        setInitialPrefix(true);
      } else {
        setInitialPrefix(false);
      }
      if (obj.diversion) {
        setDiversion(obj.diversion);
        setInitialDiversion(true);
      } else {
        setInitialDiversion(false);
      }

      if (obj.outbound_sip_proxy) {
        setOutboundSipProxy(obj.outbound_sip_proxy);
        setInitialSipProxy(true);
      } else {
        setInitialSipProxy(false);
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
      if (obj.dtmf_type) {
        setDtmfType(obj.dtmf_type);
      }
      if (obj.trunk_type) {
        setTrunkType(obj.trunk_type);
      }
      if (obj.inbound_auth_username) {
        setInboundAuthUsername(obj.inbound_auth_username);
      }
      if (obj.inbound_auth_password) {
        setInboundAuthPassword(obj.inbound_auth_password);
      }
    }
  };

  const addSipInboundGateway = () => {
    setSipInboundGateways((curr) => [
      ...curr,
      { ...DEFAULT_SIP_INBOUND_GATEWAY, inbound: 1, outbound: 0 },
    ]);
  };

  const addSipOutboundGateway = () => {
    setSipOutboundGateways((curr) => [
      ...curr,
      { ...DEFAULT_SIP_INBOUND_GATEWAY, inbound: 0, outbound: 1 },
    ]);
  };

  const addSmppGateway = (obj: Partial<SmppGateway>) => {
    setSmppGateways((curr) => [
      ...curr,
      {
        ...DEFAULT_SMPP_GATEWAY /** { inbound: 1, outbound: 1 } */,
        ...obj /** pass the values: e.g. { outbound: 1, inbound: 0 } */,
      },
    ]);
  };

  const updateSipInboundGateways = (
    index: number,
    key: string,
    value: (typeof sipInboundGateways)[number][keyof SipGateway],
  ) => {
    setSipInboundGateways(
      sipInboundGateways.map((g, i) =>
        i === index
          ? {
              ...g,
              [key]: value,
              // If Change to ipv4 and port is null, change port to 5060
              ...(key === "ipv4" &&
                value &&
                typeof value === "string" &&
                getIpValidationType(value) === IP &&
                g.port === null && { port: 5060 }),
            }
          : g,
      ),
    );
  };

  const updateSipOutboundGateways = (
    index: number,
    key: string,
    value: (typeof sipOutboundGateways)[number][keyof SipGateway],
  ) => {
    setSipOutboundGateways(
      sipOutboundGateways.map((g, i) =>
        i === index
          ? {
              ...g,
              [key]: value,
              // If Change to ipv4 and port is null, change port to 5060
              ...(key === "ipv4" &&
                value &&
                typeof value === "string" &&
                getIpValidationType(value) === IP &&
                g.port === null && { port: 5060 }),
            }
          : g,
      ),
    );
  };

  const handleSipGatewayPutPost = (voip_carrier_sid: string) => {
    const allSipGateways = [...sipInboundGateways, ...sipOutboundGateways];
    Promise.all(
      allSipGateways.map(({ sip_gateway_sid, ...g }: SipGateway) =>
        sip_gateway_sid
          ? putSipGateway(sip_gateway_sid, g)
          : postSipGateway({ ...g, voip_carrier_sid }),
      ),
    )
      .then(() => {
        if (carrierSipGateways) {
          carrierSipGateways.refetch();
        }
      })
      .catch((error) => {
        console.error("Error updating SIP gateways:", error);
        toastError(error.msg);
      });
  };

  const handleSmppGatewayPutPost = (voip_carrier_sid: string) => {
    Promise.all(
      smppGateways
        /** Ensure the empty UI fields don't actually save in the background... */
        .filter((g) => g.ipv4.trim() !== "" && isValidPort(g.port))
        .map(({ smpp_gateway_sid, ...g }: SmppGateway) => {
          smpp_gateway_sid
            ? putSmppGateway(smpp_gateway_sid, g)
            : postSmppGateway({ ...g, voip_carrier_sid });
        }),
    ).then(() => {
      if (carrierSmppGateways) {
        carrierSmppGateways.refetch();
      }
    });
  };

  const handleSipGatewayDelete = (g?: SipGateway) => {
    if (g && g.sip_gateway_sid) {
      deleteSipGateway(g.sip_gateway_sid).then(() =>
        toastSuccess("SIP gateway successfully deleted"),
      );
    }
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

  const getSipValidation = () => {
    const allSipGateways = [...sipInboundGateways, ...sipOutboundGateways];
    if (!hasLength(allSipGateways)) {
      return "You must provide at least one SIP Gateway.";
    }

    // Validate Static IP Whitelist trunk type requires at least 1 inbound gateway
    if (trunkType === "static_ip") {
      if (sipInboundGateways.length < 1) {
        return "Static IP Whitelist trunk type requires at least one inbound gateway.";
      }
    }

    for (let i = 0; i < allSipGateways.length; i++) {
      const gateway = allSipGateways[i];
      const type = getIpValidationType(gateway.ipv4);

      /** DH: unclear why we had this restriction, removing for now
      if (type === FQDN_TOP_LEVEL) {
        refSipIp.current[i].focus();
        return "When using an FQDN, you must use a subdomain (e.g. sip.example.com).";
      } else if (type === FQDN && (!gateway.outbound || gateway.inbound)) {
      */
      if (type === FQDN && (!gateway.outbound || gateway.inbound)) {
        refSipIp.current[i].focus();
        return "A fully qualified domain name may only be used for outbound calls.";
      } else if (type === INVALID) {
        refSipIp.current[i].focus();
        return "Please provide a valid IP address or fully qualified domain name.";
      }

      /** Duplicates validation */
      const dupeSipGateway = allSipGateways.find((g) => {
        return (
          g !== gateway &&
          gateway.ipv4 &&
          g.ipv4 === gateway.ipv4 &&
          g.port === gateway.port
        );
      });

      if (dupeSipGateway) {
        refSipIp.current[i].focus();
        return "Each SIP gateway must have a unique IP address.";
      }
    }
  };

  const getSmppValidation = () => {
    for (let i = 0; i < smppGateways.length; i++) {
      const gateway = smppGateways[i];
      const gatewayType = gateway.inbound ? "inbound" : "outbound";
      const type = getIpValidationType(gateway.ipv4);

      if (type === FQDN_TOP_LEVEL) {
        refSmppIp.current[i].focus();
        return {
          msg: "When using an FQDN, you must use a subdomain (e.g. sip.example.com).",
          type: gatewayType,
        };
      } else if (type === FQDN && (!gateway.outbound || gateway.inbound)) {
        refSmppIp.current[i].focus();
        return {
          msg: "A fully qualified domain name may only be used for outbound calls.",
          type: gatewayType,
        };
      } else if (type === INVALID && gateway.ipv4.trim() !== "") {
        refSmppIp.current[i].focus();
        return {
          msg: `Please provide a valid ${gatewayType} IP address or fully qualified domain name.`,
          type: gatewayType,
        };
      }

      /** Duplicates validation */
      const dupeSmppGateway = smppGateways.find((g) => {
        return (
          g !== gateway &&
          gateway.ipv4 &&
          g[gatewayType] === gateway[gatewayType] &&
          g.ipv4 === gateway.ipv4 &&
          g.port === gateway.port
        );
      });

      if (dupeSmppGateway) {
        refSmppIp.current[i].focus();
        return {
          msg: `Each ${gatewayType} SMPP gateway must have a unique IP address.`,
          type: gatewayType,
        };
      }
    }
  };

  const shouldValidateSmpp = () => {
    return (
      smppSystemId ||
      smppPass ||
      smppInboundPass ||
      !hasEmptySmppGateways("outbound") ||
      !hasEmptySmppGateways("inbound")
    );
  };

  const handleActiveTab = () => {
    /** When to switch to `sip` tab */

    const allSipGateways = [...sipInboundGateways, ...sipOutboundGateways];
    const emptySipIp = allSipGateways.find((g) => g.ipv4.trim() === "");
    const invalidSipPort = allSipGateways.find(
      (g) => hasValue(g.port) && !isValidPort(g.port),
    );
    const sipGatewayValidation = getSipValidation();

    /** Empty SIP gateway */
    /** Invalid SIP port number */
    /** Outbound auth conditionals */
    if (
      emptySipIp ||
      invalidSipPort ||
      sipGatewayValidation ||
      (sipUser && !sipPass) ||
      (sipPass && !sipUser) ||
      (sipRegister && (!sipRealm || !sipPass || !sipUser)) ||
      (prefix && prefix.length < TECH_PREFIX_MINLENGTH)
    ) {
      setActiveTab("sip");
      return; /** Important so browser contstraints work properly */
    }

    /** When to switch to the `smpp` tab */

    const invalidSmppPort = smppGateways
      .filter((g) => g.outbound)
      .find((g) => !isValidPort(g.port));
    const smppGatewayValidation = shouldValidateSmpp() && getSmppValidation();

    /** Outbound user/pass filled out but no gateways */
    /** Inbound gateways but no inbound pass */
    /** Invalid SMPP port number */
    if (
      invalidSmppPort ||
      smppGatewayValidation ||
      (smppSystemId && smppPass && hasEmptySmppGateways("outbound")) ||
      (!smppInboundPass && !hasEmptySmppGateways("inbound"))
    ) {
      setActiveTab("smpp");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isUserAccountScope(accountSid, user)) {
      toastError("You do not have permissions to make changes to this Carrier");
      return;
    }

    setSipInboundMessage("");
    setSipOutboundMessage("");

    const sipGatewayValidation = getSipValidation();

    if (sipGatewayValidation) {
      // For validation errors that affect the total, show in both tabs
      if (
        sipGatewayValidation === "You must provide at least one SIP Gateway."
      ) {
        setSipInboundMessage(sipGatewayValidation);
        setSipOutboundMessage(sipGatewayValidation);
      } else {
        // For other validation errors, we need to determine which tab they belong to
        // For now, show in both tabs to ensure user sees the error
        setSipInboundMessage(sipGatewayValidation);
        setSipOutboundMessage(sipGatewayValidation);
      }
      return;
    }

    if (
      isNotBlank(outboundSipProxy) &&
      !validateOutboundSipGateway(outboundSipProxy, true)
    ) {
      toastError("Please provide a valid SIP Proxy domain or IP address.");
      return;
    }

    if (currentServiceProvider) {
      const carrierPayload: Partial<Carrier> = {
        name: carrierName.trim(),
        e164_leading_plus: e164,
        application_sid: applicationSid || null,
        service_provider_sid: currentServiceProvider.service_provider_sid,
        account_sid: accountSid || null,
        requires_register: sipRegister,
        register_username: sipUser.trim() || null,
        register_password: sipPass.trim() || null,
        register_sip_realm: sipRealm.trim() || null,
        register_from_user: sipRegister && fromUser ? fromUser.trim() : null,
        register_from_domain:
          sipRegister && fromDomain ? fromDomain.trim() : null,
        register_public_ip_in_contact: sipRegister && regPublicIpInContact,
        tech_prefix: prefix.trim() || null,
        diversion: diversion.trim() || null,
        is_active: isActive,
        smpp_system_id: smppSystemId.trim() || null,
        smpp_password: smppPass.trim() || null,
        smpp_inbound_system_id: smppInboundSystemId.trim() || null,
        smpp_inbound_password: smppInboundPass.trim() || null,
        dtmf_type: dtmfType,
        trunk_type: trunkType,
        inbound_auth_username: inboundAuthUsername.trim() || undefined,
        inbound_auth_password: inboundAuthPassword.trim() || undefined,
        outbound_sip_proxy: outboundSipProxy.trim().replaceAll(" ", "") || null,
      };

      if (carrier && carrier.data) {
        putCarrier(
          currentServiceProvider.service_provider_sid,
          carrier.data.voip_carrier_sid,
          carrierPayload,
        )
          .then(() => {
            if (carrier.data?.voip_carrier_sid) {
              handleSipGatewayPutPost(carrier.data.voip_carrier_sid);
              handleSmppGatewayPutPost(carrier.data.voip_carrier_sid);
            }

            toastSuccess("Carrier updated successfully");
            carrier.refetch();
            navigate(
              `${ROUTE_INTERNAL_CARRIERS}/${carrier.data?.voip_carrier_sid}/edit`,
            );
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

            toastSuccess("Carrier created successfully");
            navigate(ROUTE_INTERNAL_CARRIERS);
            setAccountFilter(accountSid);
          })
          .catch((error) => {
            toastError(error.msg);
          });
      }
    }
  };

  useEffect(() => {
    setLocation();
    if (predefinedName && hasLength(predefinedCarriers)) {
      const predefinedCarrierSid = predefinedCarriers.find(
        (a) => a.name === predefinedName,
      )?.predefined_carrier_sid;

      if (currentServiceProvider && predefinedCarrierSid) {
        const postPredefinedCarrier =
          user?.scope === USER_ACCOUNT
            ? postPredefinedCarrierTemplateAccount(
                accountSid,
                predefinedCarrierSid,
              )
            : postPredefinedCarrierTemplate(
                currentServiceProvider.service_provider_sid,
                predefinedCarrierSid,
              );

        postPredefinedCarrier
          .then(({ json }) => {
            navigate(`${ROUTE_INTERNAL_CARRIERS}/${json.sid}/edit`);
          })
          .catch((error) => {
            toastError(error.msg);
          });
      }
    }
  }, [predefinedName]);

  useEffect(() => {
    if (carrier && carrier.data) {
      setCarrierStates(carrier.data);
    }
  }, [carrier]);

  /** This fixes a re-rendering glitch when we used useEffect that was annoying but not breaking */
  /** https://beta.reactjs.org/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes */
  const [prevSipGateways, setPrevSipGateways] = useState<SipGateway[]>();
  const [prevSmppGateways, setPrevSmppGateways] = useState<SmppGateway[]>();

  if (
    carrierSipGateways &&
    hasLength(carrierSipGateways.data) &&
    carrierSipGateways.data !== prevSipGateways
  ) {
    setPrevSipGateways(carrierSipGateways.data); /** Deadly important */
    const inboundGateways = carrierSipGateways.data.filter((g) => g.inbound);
    const outboundGateways = carrierSipGateways.data.filter((g) => g.outbound);
    setSipInboundGateways(inboundGateways);
    setSipOutboundGateways(outboundGateways);
  }

  if (
    carrierSmppGateways &&
    hasLength(carrierSmppGateways.data) &&
    carrierSmppGateways.data !== prevSmppGateways
  ) {
    const inbound = carrierSmppGateways.data.filter((g) => g.inbound);
    const outbound = carrierSmppGateways.data.filter((g) => g.outbound);

    setPrevSmppGateways(carrierSmppGateways.data); /** Deadly important */
    setSmppGateways(carrierSmppGateways.data);

    if (inbound.length <= 0) {
      addSmppGateway({ inbound: 1, outbound: 0 });
    }

    if (outbound.length <= 0) {
      addSmppGateway({ outbound: 1, inbound: 0 });
    }
  }

  return (
    <Section slim>
      <form
        className={`form form--internal ${
          !carrier?.data && carrier?.refetch ? "form--blur" : ""
        }`}
        onSubmit={handleSubmit}
      >
        <fieldset>
          <MS>{MSG_REQUIRED_FIELDS}</MS>
        </fieldset>
        {carrier &&
          carrier.data &&
          Boolean(carrier.data.requires_register) &&
          carrier.data.register_status && (
            <fieldset>
              <div className="m med">Register status</div>
              <RegisterStatus carrier={carrier.data} />
            </fieldset>
          )}
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
            {!carrier && (
              <div className="sel sel--preset">
                <label htmlFor="predefined_select">
                  Select a predefined carrier
                </label>
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
                    predefinedCarriers
                      ? predefinedCarriers.map(
                          (carrier: PredefinedCarrier) => ({
                            name: carrier.name,
                            value: carrier.name,
                          }),
                        )
                      : [],
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
        <Tabs active={[activeTab, setActiveTab]}>
          {/** General */}
          <Tab id="general" label="General">
            <fieldset>
              <AccountSelect
                accounts={
                  user?.scope === USER_ACCOUNT
                    ? accounts?.filter(
                        (acct) => user.account_sid === acct.account_sid,
                      )
                    : accounts
                }
                account={[accountSid, setAccountSid]}
                label="Used by"
                required={false}
                defaultOption={checkSelectOptions(user, carrier?.data)}
                disabled={
                  user?.scope !== USER_ACCOUNT
                    ? false
                    : user.account_sid !== accountSid
                      ? true
                      : false
                }
              />

              <label htmlFor="dtmf_type">
                <Tooltip
                  text={
                    "RFC 2833 is commonly used on VoIP networks. Do not change unless you are certain this carrier does not support it"
                  }
                >
                  DTMF type
                </Tooltip>
              </label>
              <Selector
                id="dtmf_type"
                name="dtmf_type"
                value={dtmfType}
                options={DTMF_TYPE_SELECTION}
                onChange={(e) => setDtmfType(e.target.value as DtmfType)}
              />
              {user &&
                disableDefaultTrunkRouting(user?.scope) &&
                accountSid &&
                hasLength(applications) && (
                  <>
                    <ApplicationSelect
                      label="Default Application"
                      defaultOption="None"
                      application={[applicationSid, setApplicationSid]}
                      applications={applications.filter(
                        (application) => application.account_sid === accountSid,
                      )}
                    />
                  </>
                )}
            </fieldset>
            <fieldset>
              <label htmlFor="trunk_type">Trunk Type</label>
              <Selector
                id="trunk_type"
                name="trunk_type"
                value={trunkType}
                options={TRUNK_TYPE_SELECTION}
                onChange={(e) => {
                  const newTrunkType = e.target.value as TrunkType;
                  setTrunkType(newTrunkType);

                  // Clear auth credentials when switching away from auth trunk
                  if (newTrunkType !== "auth") {
                    setInboundAuthUsername("");
                    setInboundAuthPassword("");
                  }

                  // Ensure at least one inbound gateway for Static IP Whitelist
                  if (newTrunkType === "static_ip") {
                    if (sipInboundGateways.length === 0) {
                      // Add one inbound gateway if none exist
                      setSipInboundGateways([
                        {
                          ...DEFAULT_SIP_INBOUND_GATEWAY,
                          inbound: 1,
                          outbound: 0,
                        },
                      ]);
                    }
                    // Keep all existing gateways if multiple exist
                  }
                }}
              />
            </fieldset>
          </Tab>
          {/** Inbound */}
          <Tab id="inbound" label="Inbound">
            {trunkType === "static_ip" && (
              <fieldset>
                <label htmlFor="allow_ip_addresses">Allowed IP Addresses</label>
                <MXS>
                  <em>
                    Static IP Whitelist requires at least one inbound gateway.
                    {sipInboundGateways.length === 0 &&
                      " Click the plus icon to add one."}
                    {sipInboundGateways.length === 1 &&
                      " You can add more gateways or keep this one."}
                    {sipInboundGateways.length > 1 &&
                      " You can delete gateways but must keep at least one."}
                  </em>
                </MXS>
                {hasLength(sipInboundGateways) ? (
                  <label htmlFor="sip_gateways">
                    Network address / Netmask
                  </label>
                ) : (
                  <MXS>
                    <em>Click plus icon to add SIP Gateway.</em>
                  </MXS>
                )}
                {sipInboundMessage && <Message message={sipInboundMessage} />}
                {hasLength(sipInboundGateways) &&
                  sipInboundGateways.map((g, i) => (
                    <div
                      key={`sip_gateway_${i}`}
                      className="gateway-inbound gateway-inbound--sip"
                    >
                      <div>
                        <div>
                          <input
                            id={`sip_ip_${i}`}
                            name={`sip_ip_${i}`}
                            type="text"
                            placeholder="1.2.3.4 / sip.my.com"
                            required
                            value={g.ipv4}
                            onChange={(e) => {
                              updateSipInboundGateways(
                                i,
                                "ipv4",
                                e.target.value,
                              );
                            }}
                            ref={(ref: HTMLInputElement) =>
                              (refSipIp.current[i] = ref)
                            }
                          />
                        </div>
                        <div>
                          <Selector
                            id={`sip_netmask_${i}`}
                            name={`sip_netmask${i}`}
                            value={g.netmask}
                            options={NETMASK_OPTIONS}
                            onChange={(e) => {
                              updateSipInboundGateways(
                                i,
                                "netmask",
                                e.target.value,
                              );
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <div>
                          <label
                            htmlFor={`sip__gw_is_active_${i}`}
                            className="chk"
                          >
                            <input
                              id={`sip__gw_is_active_${i}`}
                              name={`sip__gw_is_active_${i}`}
                              type="checkbox"
                              checked={g.is_active ? true : false}
                              onChange={(e) => {
                                updateSipInboundGateways(
                                  i,
                                  "is_active",
                                  e.target.checked ? 1 : 0,
                                );
                              }}
                            />
                            <div>Active</div>
                          </label>
                        </div>

                        <div>
                          <label
                            htmlFor={`sip_pad_crypto_${i}`}
                            className="chk"
                          >
                            <input
                              id={`sip_pad_crypto_${i}`}
                              name={`sip_pad_crypto_${i}`}
                              type="checkbox"
                              checked={g.pad_crypto ? true : false}
                              onChange={(e) => {
                                updateSipInboundGateways(
                                  i,
                                  "pad_crypto",
                                  e.target.checked,
                                );
                              }}
                            />
                            <div>Pad crypto</div>
                          </label>
                        </div>
                      </div>

                      <button
                        className="btnty"
                        title="Delete SIP Gateway"
                        type="button"
                        onClick={() => {
                          setSipInboundMessage("");
                          setSipOutboundMessage("");

                          // Special validation for static_ip trunk type
                          if (
                            trunkType === "static_ip" &&
                            sipInboundGateways.length <= 1
                          ) {
                            setSipInboundMessage(
                              "Static IP Whitelist trunk type requires at least one inbound gateway.",
                            );
                            return;
                          }

                          const totalAfterDelete =
                            sipInboundGateways.length -
                            1 +
                            sipOutboundGateways.length;

                          if (totalAfterDelete === 0) {
                            setSipInboundMessage(
                              "You must provide at least one SIP Gateway.",
                            );
                            setSipOutboundMessage(
                              "You must provide at least one SIP Gateway.",
                            );
                          } else {
                            handleSipGatewayDelete(
                              sipInboundGateways.find((g2, i2) => i2 === i),
                            );

                            setSipInboundGateways(
                              sipInboundGateways.filter((g2, i2) => i2 !== i),
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
                      setSipInboundMessage("");
                      setSipOutboundMessage("");
                      addSipInboundGateway();
                    }}
                  >
                    <Icon subStyle="teal">
                      <Icons.Plus />
                    </Icon>
                  </button>
                </ButtonGroup>
              </fieldset>
            )}
            {trunkType === "auth" && (
              <fieldset>
                <label htmlFor="inbound_auth_username">Credentials</label>
                <MXS>
                  <em>Enter authentication credentials for inbound calls.</em>
                </MXS>

                <label htmlFor="inbound_auth_username">Username</label>
                <input
                  id="inbound_auth_username"
                  name="inbound_auth_username"
                  type="text"
                  placeholder="Authentication username"
                  required={true}
                  value={inboundAuthUsername}
                  onChange={(e) => setInboundAuthUsername(e.target.value)}
                />

                <label htmlFor="inbound_auth_password">Password</label>
                <Passwd
                  id="inbound_auth_password"
                  name="inbound_auth_password"
                  placeholder="Authentication password"
                  required={true}
                  value={inboundAuthPassword}
                  onChange={(e) => setInboundAuthPassword(e.target.value)}
                />
              </fieldset>
            )}
            {trunkType === "reg" && (
              <fieldset>
                <MXS>
                  <em>Registration Trunk does not require Inbound settings.</em>
                </MXS>
              </fieldset>
            )}
          </Tab>
          {/** Outbound */}
          <Tab id="outbound" label="Outbound">
            <fieldset>
              <label htmlFor="reg_public_ip_in_contact" className="chk">
                <input
                  id="reg_public_ip_in_contact"
                  name="reg_public_ip_in_contact"
                  type="checkbox"
                  checked={regPublicIpInContact}
                  onChange={(e) => setRegPublicIpInContact(e.target.checked)}
                />
                <div>Use public IP in contact</div>
              </label>
              <label htmlFor="e164" className="chk">
                <input
                  id="e164"
                  name="e164"
                  type="checkbox"
                  checked={e164}
                  onChange={(e) => setE164(e.target.checked)}
                />
                <div>E.164 syntax</div>
              </label>
              <MXS>
                <em>Prepend a leading + on origination attempts.</em>
              </MXS>
            </fieldset>
            <fieldset>
              <Checkzone
                hidden
                name="tech_prefix_check"
                label="Tech prefix"
                initialCheck={initialPrefix}
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
                initialCheck={initialDiversion}
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
              <Checkzone
                hidden
                name="outbound_sip_proxy"
                label="Outbound SIP Proxy"
                initialCheck={initialSipProxy}
                handleChecked={(e) => {
                  if (!e.target.checked) {
                    setOutboundSipProxy("");
                  }
                }}
              >
                <MS>
                  Send all calls to this carrier through an outbound proxy
                </MS>
                <input
                  id="outbound_sip_proxy"
                  name="outbound_sip_proxy"
                  type="text"
                  value={outboundSipProxy}
                  placeholder="Outbound Sip Proxy"
                  onChange={(e) => {
                    setOutboundSipProxy(e.target.value);
                  }}
                />
              </Checkzone>
            </fieldset>
            <fieldset>
              <label htmlFor="sip_gateways">
                SIP gateways<span>*</span>
              </label>
              <MXS>
                <em>At least one SIP gateway is required.</em>
              </MXS>
              <label htmlFor="sip_gateways">
                Network address / Port / Netmask
              </label>
              {sipOutboundMessage && <Message message={sipOutboundMessage} />}
              {hasLength(sipOutboundGateways) &&
                sipOutboundGateways.map((g, i) => (
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
                          placeholder="1.2.3.4 / sip.my.com"
                          required
                          value={g.ipv4}
                          onChange={(e) => {
                            updateSipOutboundGateways(
                              i,
                              "ipv4",
                              e.target.value,
                            );
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
                          placeholder={
                            g.protocol === "tls" || g.protocol === "tls/srtp"
                              ? ""
                              : DEFAULT_SIP_INBOUND_GATEWAY.port?.toString()
                          }
                          value={g.port === null ? "" : g.port}
                          onChange={(e) => {
                            updateSipOutboundGateways(
                              i,
                              "port",
                              g.outbound > 0 &&
                                !isNotBlank(e.target.value) &&
                                getIpValidationType(g.ipv4) !== IP
                                ? null
                                : Number(e.target.value),
                            );
                          }}
                          ref={(ref: HTMLInputElement) =>
                            (refSipPort.current[i] = ref)
                          }
                        />
                      </div>
                      {g.outbound ? (
                        <div>
                          <Selector
                            id={`sip_protocol_${i}`}
                            name={`sip_protocol${i}`}
                            value={g.protocol}
                            options={SIP_GATEWAY_PROTOCOL_OPTIONS}
                            onChange={(e) => {
                              updateSipOutboundGateways(
                                i,
                                "protocol",
                                e.target.value,
                              );
                            }}
                          />
                        </div>
                      ) : (
                        <div>
                          <Selector
                            id={`sip_netmask_${i}`}
                            name={`sip_netmask${i}`}
                            value={g.netmask}
                            options={NETMASK_OPTIONS}
                            onChange={(e) => {
                              updateSipOutboundGateways(
                                i,
                                "netmask",
                                e.target.value,
                              );
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <div>
                        <label
                          htmlFor={`sip__gw_is_active_${i}`}
                          className="chk"
                        >
                          <input
                            id={`sip__gw_is_active_${i}`}
                            name={`sip__gw_is_active_${i}`}
                            type="checkbox"
                            checked={g.is_active ? true : false}
                            onChange={(e) => {
                              updateSipOutboundGateways(
                                i,
                                "is_active",
                                e.target.checked ? 1 : 0,
                              );
                            }}
                          />
                          <div>Active</div>
                        </label>
                      </div>

                      <div>
                        <label htmlFor={`sip_pad_crypto_${i}`} className="chk">
                          <input
                            id={`sip_pad_crypto_${i}`}
                            name={`sip_pad_crypto_${i}`}
                            type="checkbox"
                            checked={g.pad_crypto ? true : false}
                            onChange={(e) => {
                              updateSipOutboundGateways(
                                i,
                                "pad_crypto",
                                e.target.checked,
                              );
                            }}
                          />
                          <div>Pad crypto</div>
                        </label>
                      </div>
                      {Boolean(g.outbound) && (
                        <div>
                          <label
                            htmlFor={`send_options_ping_${i}`}
                            className="chk"
                          >
                            <input
                              id={`send_options_ping_${i}`}
                              name={`send_options_ping_${i}`}
                              type="checkbox"
                              checked={g.send_options_ping ? true : false}
                              onChange={(e) => {
                                updateSipOutboundGateways(
                                  i,
                                  "send_options_ping",
                                  e.target.checked,
                                );
                              }}
                            />
                            <div>Send OPTIONS ping</div>
                          </label>
                        </div>
                      )}
                      {(g.protocol === "tls" || g.protocol === "tls/srtp") && (
                        <div>
                          <label
                            htmlFor={`use_sips_scheme_${i}`}
                            className="chk"
                          >
                            <input
                              id={`use_sips_scheme_${i}`}
                              name={`use_sips_scheme_${i}`}
                              type="checkbox"
                              checked={g.use_sips_scheme ? true : false}
                              onChange={(e) => {
                                updateSipOutboundGateways(
                                  i,
                                  "use_sips_scheme",
                                  e.target.checked,
                                );
                              }}
                            />
                            <div>Use sips scheme</div>
                          </label>
                        </div>
                      )}
                    </div>

                    <button
                      className="btnty"
                      title="Delete SIP Gateway"
                      type="button"
                      onClick={() => {
                        setSipInboundMessage("");
                        setSipOutboundMessage("");

                        const totalAfterDelete =
                          sipInboundGateways.length +
                          (sipOutboundGateways.length - 1);

                        if (totalAfterDelete === 0) {
                          setSipInboundMessage(
                            "You must provide at least one SIP Gateway.",
                          );
                          setSipOutboundMessage(
                            "You must provide at least one SIP Gateway.",
                          );
                        } else {
                          handleSipGatewayDelete(
                            sipOutboundGateways.find((g2, i2) => i2 === i),
                          );

                          setSipOutboundGateways(
                            sipOutboundGateways.filter((g2, i2) => i2 !== i),
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
                    setSipInboundMessage("");
                    setSipOutboundMessage("");
                    addSipOutboundGateway();
                  }}
                >
                  <Icon subStyle="teal">
                    <Icons.Plus />
                  </Icon>
                </button>
              </ButtonGroup>
            </fieldset>
          </Tab>
          {/** Registration */}
          <Tab id="registration" label="Registration">
            <fieldset>
              <div className="multi">
                <div className="inp">
                  <label htmlFor="sip_username">
                    Auth username {sipPass || sipRegister ? <span>*</span> : ""}
                  </label>
                  <input
                    id="sip_username"
                    name="sip_username"
                    type="text"
                    value={sipUser}
                    placeholder="SIP username"
                    required={sipRegister || sipPass.length > 0}
                    onChange={(e) => {
                      setSipUser(e.target.value);
                    }}
                  />
                </div>

                <div className="sel sel--preset">
                  <label htmlFor="sip_password">
                    Password
                    {sipUser || sipRegister ? <span>*</span> : ""}
                  </label>
                  <Passwd
                    id="sip_password"
                    name="sip_password"
                    value={sipPass}
                    placeholder="SIP password"
                    required={sipRegister || sipUser.length > 0}
                    onChange={(e) => {
                      setSipPass(e.target.value);
                    }}
                  />
                </div>
              </div>
              <label htmlFor="sip_realm">
                SIP realm{sipRegister ? <span>*</span> : ""}
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

              <label htmlFor="from_domain">SIP from domain</label>
              <input
                id="from_domain"
                name="from_domain"
                type="text"
                value={fromDomain}
                placeholder="Optional: specify host part of SIP From header"
                onChange={(e) => setFromDomain(e.target.value)}
              />
            </fieldset>
          </Tab>
        </Tabs>
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
