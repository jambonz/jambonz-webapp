import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import axios from 'axios';
import styled from "styled-components/macro";
import { Menu, Dropdown } from "antd";

import { NotificationDispatchContext } from '../../contexts/NotificationContext';
import { ServiceProviderValueContext } from '../../contexts/ServiceProviderContext';
import Form from '../elements/Form';
import Input from '../elements/Input';
import PasswordInput from '../elements/PasswordInput';
import Label from '../elements/Label';
import Checkbox from '../elements/Checkbox';
import InputGroup from '../elements/InputGroup';
import FormError from '../blocks/FormError';
import Button from '../elements/Button';
import TrashButton from '../elements/TrashButton';
import Loader from '../blocks/Loader';
import sortSipGateways from '../../helpers/sortSipGateways';
import Select from '../elements/Select';
import handleErrors from "../../helpers/handleErrors";

const StyledForm = styled(Form)`
  @media (max-width: 978.98px) {
    flex-direction: column;
    display: flex;
    align-items: flex-start;

    & > * {
      width: 100%;
    }

    & > hr {
      width: calc(100% + 4rem);
    }
  }
`;

const StyledLabel = styled.div`
  white-space: nowrap;
  text-align: left;
  color: #767676;
`;

const StyledButton = styled(Button)`
  grid-column: 1 / 3;
`;

const SIPGatewaysInputGroup = styled(InputGroup)`
  grid-column: 1 / 3;
  display: grid;
  grid-gap: 1rem;
  grid-template-columns: 1fr 80px 80px auto;

  @media (max-width: 978.98px) {
    grid-template-columns: 1fr 80px 80px auto;
  }

  @media (max-width: 899.98px) {
    grid-template-columns: 1fr 100px 80px;
  }

  @media (max-width: 767.98px) {
    grid-template-columns: 1fr 80px 80px auto;
  }

  @media (max-width: 549.98px) {
    grid-template-columns: 1fr 100px 80px;
  }
`;

const SIPGatewaysChecboxGroup = styled.div`
  display: flex;

  @media (max-width: 978.98px) {
    & > *:first-child {
      margin-left: -0.5rem;
    }
  }

  @media (max-width: 549.98px) {
    grid-column: 1 / 3;
  }
`;

const StyledButtonGroup = styled(InputGroup)`
  @media (max-width: 576.98px) {
    width: 100%;

    & > * {
      width: 100%;

      & > * {
        width: 100%;
      }
    }
  }

  @media (max-width: 399.98px) {
    flex-direction: column;

    & > *:first-child {
      margin-right: 0;
      margin-bottom: 1rem;
    }
  }
`;

const NameFieldWrapper = styled.div`
  ${(props) => props.hasDropdown ? `
    display: grid;
    grid-template-columns: 75%  25%;
    align-items: center;
  ` : `
    width: 100%;
  `}
`;

const CarrierSelect = styled.div`
  margin-left: 1rem;

  & > * {
    width: 100%;
    justify-content: flex-end;
  }
`;

const CarrierItem = styled.div`
  font-family: Objectivity;
  font-size: 16px;
  font-weight: 400;
  color: #565656;
  padding: 0.25rem 0.5rem;

  ${(props) => props.disabled ? 'opacity: 0.5;' : ''}
`;

const CarrierForm = (props) => {
  const { voip_carrier_sid } = useParams();
  const type = voip_carrier_sid ? 'edit' : 'add';

  const currentServiceProvider = useContext(ServiceProviderValueContext);
  const history = useHistory();
  const dispatch = useContext(NotificationDispatchContext);
  const jwt = localStorage.getItem('token');

  // Refs
  const refName = useRef(null);
  const refUsername = useRef(null);
  const refPassword = useRef(null);
  const refRealm = useRef(null);
  const refIp = useRef([]);
  const refPort = useRef([]);
  const refInbound = useRef([]);
  const refOutbound = useRef([]);
  const refTrash = useRef([]);
  const refAdd = useRef(null);
  const refTechPrefix = useRef(null);

  // Form inputs
  const [ name,            setName            ] = useState('');
  const [ nameInvalid,     setNameInvalid     ] = useState(false);
  const [ e164,            setE164            ] = useState(false);
  const [ application,      setApplication    ] = useState('');
  const [ authenticate,    setAuthenticate    ] = useState(false);
  const [ register,        setRegister        ] = useState(false);
  const [ username,        setUsername        ] = useState('');
  const [ usernameInvalid, setUsernameInvalid ] = useState(false);
  const [ password,        setPassword        ] = useState('');
  const [ passwordInvalid, setPasswordInvalid ] = useState(false);
  const [ realm,           setRealm           ] = useState('');
  const [ realmInvalid,    setRealmInvalid    ] = useState(false);
  const [ sipGateways,     setSipGateways     ] = useState([
    {
      sip_gateway_sid: '',
      ip: '',
      port: 5060,
      inbound: true,
      outbound: false,
      invalidIp: false,
      invalidPort: false,
      invalidInbound: false,
      invalidOutbound: false,
    }
  ]);

  const [ applicationValues, setApplicationValues ] = useState([]);
  const [ accounts, setAccounts ] = useState([]);
  const [ accountSid, setAccountSid ] = useState('');

  const [ carrierSid,   setCarrierSid   ] = useState('');
  const [ showLoader,   setShowLoader   ] = useState(true);
  const [ errorMessage, setErrorMessage ] = useState('');

  const [requiredTechPrefix, setRequiredTechPrefix] = useState(false);
  const [techPrefix, setTechPrefix] = useState('');
  const [techPrefixInvalid, setTechPrefixInvalid ] = useState(false);
  const [suportSIP, setSupportSIP] = useState(false);
  const [diversion, setDiversion] = useState("");
  const [carrierActive, setCarrierActive] = useState(true);

  const [predefinedCarriers, setPredefinedCarriers] = useState([]);

  // eslint-disable-next-line
  const [sipRealm, setSipRealm] = useState('');
  // eslint-disable-next-line
  const [staticIPs, setStaticIPs] = useState(null);

  useEffect(() => {
    const getAPIData = async () => {
      let isMounted = true;
      try {

        const promises = [];

        // Get Application Data
        const applicationPromise = axios({
          method: 'get',
          baseURL: process.env.REACT_APP_API_BASE_URL,
          url: '/Applications',
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });
        const accountsPromise = axios({
          method: 'get',
          baseURL: process.env.REACT_APP_API_BASE_URL,
          url: '/Accounts',
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });
        promises.push(applicationPromise);
        promises.push(accountsPromise);

        if (type === 'edit') {
          const carrierPromise = axios({
            method: 'get',
            baseURL: process.env.REACT_APP_API_BASE_URL,
            url: `/VoipCarriers/${voip_carrier_sid}`,
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          });

          const sipGatewaysPromise = axios({
            method: 'get',
            baseURL: process.env.REACT_APP_API_BASE_URL,
            url: `/SipGateways?voip_carrier_sid=${voip_carrier_sid}`,
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          });

          promises.push(carrierPromise);
          promises.push(sipGatewaysPromise);
        }

        const promiseResponses = await Promise.all(promises);

        setApplicationValues(promiseResponses[0].data);
        setAccounts(promiseResponses[1].data);

        if (type === 'edit') {

          const carrier = promiseResponses[2].data;
          const allSipGateways = promiseResponses[3].data;

          if (!carrier) {
            isMounted = false;
            history.push('/internal/carriers');
            dispatch({
              type: 'ADD',
              level: 'error',
              message: 'That carrier does not exist.',
            });
            return;
          }

          const currentSipGateways = allSipGateways.filter(s => {
            return s.voip_carrier_sid === carrier.voip_carrier_sid;
          });

          sortSipGateways(currentSipGateways);

          setName(carrier.name || '');
          setE164(carrier.e164_leading_plus === 1);
          setApplication(carrier.application_sid || '');
          setAccountSid(carrier.account_sid || '');
          setAuthenticate(carrier.register_username ? true : false);
          setRegister(carrier.requires_register === 1);
          setUsername(carrier.register_username || '');
          setPassword(carrier.register_password || '');
          setRealm(carrier.register_sip_realm || '');
          setSipGateways(currentSipGateways.map(s => ({
            sip_gateway_sid: s.sip_gateway_sid,
            ip: s.ipv4,
            port: s.port,
            netmask: s.netmask,
            inbound: s.inbound === 1,
            outbound: s.outbound === 1,
            invalidIp: false,
            invalidPort: false,
            invalidInbound: false,
            invalidOutbound: false,
          })));
          setCarrierSid(carrier.voip_carrier_sid);
          setTechPrefix(carrier.tech_prefix || '');
          setRequiredTechPrefix(carrier.tech_prefix ? true : false);
          setSupportSIP(carrier.diversion ? true : false);
          setDiversion(carrier.diversion || '');
          setCarrierActive(carrier.is_active === 1);
        } else {
          const result = await axios({
            method: 'get',
            baseURL: process.env.REACT_APP_API_BASE_URL,
            url: `/PredefinedCarriers`,
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          });
          setPredefinedCarriers(
            result.data
              .map((item) => ({
                ...item,
                value: item.predefined_carrier_sid,
                text: item.requires_static_ip
                  ? `${item.name} - requires static IP`
                  : item.name,
              }))
              .sort((a, b) => a.text.localeCompare(b.text))
          );
        }

      } catch (err) {
        if (err.response && err.response.status === 401) {
          localStorage.clear();
          sessionStorage.clear();
          isMounted = false;
          history.push('/');
          dispatch({
            type: 'ADD',
            level: 'error',
            message: 'Your session has expired. Please log in and try again.',
          });
        } else {
          setErrorMessage('Something went wrong, please try again.');
          dispatch({
            type: 'ADD',
            level: 'error',
            message: (err.response && err.response.data && err.response.data.msg) || 'Unable to get carriers',
          });
          console.error(err.response || err);
        }
      } finally {
        if (isMounted) {
          setShowLoader(false);
        }
      }
    };
    getAPIData();
    // eslint-disable-next-line
  }, [history.location.pathname]);

  const addSipGateway = () => {
    const newSipGateways = [
      ...sipGateways,
      {
        sip_gateway_sid: '',
        ip: '',
        port: 5060,
        inbound: true,
        outbound: false,
        invalidIp: false,
        invalidPort: false,
        invalidInbound: false,
        invalidOutbound: false,
      }
    ];
    setSipGateways(newSipGateways);
  };

  const removeSipGateway = index => {
    const newSipGateways = sipGateways.filter((s,i) => i !== index);
    setSipGateways(newSipGateways);
    setErrorMessage('');
  };

  const updateSipGateways = (e, i, key) => {
    const newSipGateways = [...sipGateways];
    const newValue =
      key === 'invalidIp'       ||
      key === 'invalidPort'     ||
      key === 'invalidInbound'  ||
      key === 'invalidOutbound'
        ? true
        : (key === 'inbound') || (key === 'outbound')
          ? e.target.checked
          : e.target.value;
    newSipGateways[i][key] = newValue;

    if (key === "outbound" && newValue === true) {
      newSipGateways[i]["netmask"] = 32;
    }
    setSipGateways(newSipGateways);
  };

  const resetInvalidFields = () => {
    setNameInvalid(false);
    setUsernameInvalid(false);
    setPasswordInvalid(false);
    setRealmInvalid(false);
    setTechPrefixInvalid(false);
    const newSipGateways = [...sipGateways];
    newSipGateways.forEach((s, i) => {
      newSipGateways[i].invalidIp = false;
      newSipGateways[i].invalidPort = false;
      newSipGateways[i].invalidInbound = false;
      newSipGateways[i].invalidOutbound = false;
    });
    setSipGateways(newSipGateways);
  };

  const handleSubmit = async e => {
    let isMounted = true;
    try {
      setShowLoader(true);
      e.preventDefault();
      setErrorMessage('');
      resetInvalidFields();
      let errorMessages = [];
      let focusHasBeenSet = false;

      if (!name) {
        errorMessages.push('Please provide a name.');
        setNameInvalid(true);
        if (!focusHasBeenSet) {
          refName.current.focus();
          focusHasBeenSet = true;
        }
      }

      if (!register && ((username && !password) || (!username && password))) {
        errorMessages.push('Username and password must be either both filled out or both empty.');
        setUsernameInvalid(true);
        setPasswordInvalid(true);
        if (!focusHasBeenSet) {
          if (!username) {
            refUsername.current.focus();
          } else {
            refPassword.current.focus();
          }
          focusHasBeenSet = true;
        }
      }

      if (register && !username) {
        errorMessages.push('If registration is required, you must provide a username.');
        setUsernameInvalid(true);
        if (!focusHasBeenSet) {
          refUsername.current.focus();
          focusHasBeenSet = true;
        }
      }

      if (register && !password) {
        errorMessages.push('If registration is required, you must provide a password.');
        setPasswordInvalid(true);
        if (!focusHasBeenSet) {
          refPassword.current.focus();
          focusHasBeenSet = true;
        }
      }

      if (register && !realm) {
        errorMessages.push('If registration is required, you must provide a SIP realm.');
        setRealmInvalid(true);
        if (!focusHasBeenSet) {
          refRealm.current.focus();
          focusHasBeenSet = true;
        }
      }

      if (techPrefix && techPrefix.length < 2) {
        errorMessages.push('If registration is required, you must provide a Tech prefix with more than 2 characters.');
        setTechPrefixInvalid(true);
        if (!focusHasBeenSet) {
          refTechPrefix.current.focus();
          focusHasBeenSet = true;
        }
      }

      if (!sipGateways.length) {
        errorMessages.push('You must provide at least one SIP Gateway.');
        if (!focusHasBeenSet) {
          refAdd.current.focus();
          focusHasBeenSet = true;
        }
      }

      const regIp = /^((25[0-5]|2[0-4][0-9]|[0-1]?[0-9]?[0-9])\.){3}(25[0-5]|2[0-4][0-9]|[0-1]?[0-9]?[0-9])$/;
      const regFqdn = /^([a-zA-Z][^.]*)(\.[^.]+){2,}$/;
      const regFqdnTopLevel = /^([a-zA-Z][^.]*)(\.[^.]+)$/;
      const regPort = /^[0-9]+$/;

      sipGateways.forEach(async (gateway, i) => {
        //-----------------------------------------------------------------------------
        // IP validation
        //-----------------------------------------------------------------------------
        const type = regIp.test(gateway.ip.trim())
          ? 'ip'
          : regFqdn.test(gateway.ip.trim())
            ? 'fqdn'
            : regFqdnTopLevel.test(gateway.ip.trim())
              ? 'fqdn-top-level'
              : 'invalid';

        if (!gateway.ip) {
          errorMessages.push('The IP Address cannot be blank. Please provide an IP address or delete the row.');
          updateSipGateways(null, i, 'invalidIp');
          if (!focusHasBeenSet) {
            refIp.current[i].focus();
            focusHasBeenSet = true;
          }
        }

        else if (type === 'fqdn-top-level') {
          errorMessages.push('When using an FQDN, you must use a subdomain (e.g. sip.example.com).');
          updateSipGateways(null, i, 'invalidIp');
          if (!focusHasBeenSet) {
            refIp.current[i].focus();
            focusHasBeenSet = true;
          }
        }

        else if (type === 'invalid') {
          errorMessages.push('Please provide a valid IP address or fully qualified domain name.');
          updateSipGateways(null, i, 'invalidIp');
          if (!focusHasBeenSet) {
            refIp.current[i].focus();
            focusHasBeenSet = true;
          }
        }

        //-----------------------------------------------------------------------------
        // Port validation
        //-----------------------------------------------------------------------------
        if (
          gateway.port && (
            !(regPort.test(gateway.port.toString().trim()))
            || (parseInt(gateway.port.toString().trim()) < 0)
            || (parseInt(gateway.port.toString().trim()) > 65535)
          )
        ) {
          errorMessages.push('Please provide a valid port number between 0 and 65535');
          updateSipGateways(null, i, 'invalidPort');
          if (!focusHasBeenSet) {
            refPort.current[i].focus();
            focusHasBeenSet = true;
          }
        }

        //-----------------------------------------------------------------------------
        // inbound/outbound validation
        //-----------------------------------------------------------------------------
        if (type === 'fqdn' && (!gateway.outbound || gateway.inbound)) {
          errorMessages.push('A fully qualified domain name may only be used for outbound calls.');
          updateSipGateways(null, i, 'invalidIp');
          if (gateway.inbound) updateSipGateways(null, i, 'invalidInbound');
          if (!gateway.outbound) updateSipGateways(null, i, 'invalidOutbound');
          if (!focusHasBeenSet) {
            if (gateway.inbound) {
              refInbound.current[i].focus();
            } else {
              refOutbound.current[i].focus();
            }
            focusHasBeenSet = true;
          }
        }

        else if (!gateway.inbound && !gateway.outbound) {
          errorMessages.push('Each SIP Gateway must accept inbound calls, outbound calls, or both.');
          updateSipGateways(null, i, 'invalidInbound');
          updateSipGateways(null, i, 'invalidOutbound');
          if (!focusHasBeenSet) {
            refInbound.current[i].focus();
            focusHasBeenSet = true;
          }
        }

        //-----------------------------------------------------------------------------
        // duplicates validation
        //-----------------------------------------------------------------------------
        sipGateways.forEach((otherGateway, j) => {
          if (i >= j) return;
          if (!gateway.ip) return;
          if (type === 'invalid') return;
          if (gateway.ip === otherGateway.ip && gateway.port === otherGateway.port) {
            errorMessages.push('Each SIP gateway must have a unique IP address.');
            updateSipGateways(null, i, 'invalidIp');
            updateSipGateways(null, i, 'invalidPort');
            updateSipGateways(null, j, 'invalidIp');
            updateSipGateways(null, j, 'invalidPort');
            if (!focusHasBeenSet) {
              refTrash.current[j].focus();
              focusHasBeenSet = true;
            }
          }
        });
      });

      // remove duplicate error messages
      for (let i = 0; i < errorMessages.length; i++) {
        for (let j = 0; j < errorMessages.length; j++) {
          if (i >= j) continue;
          if (errorMessages[i] === errorMessages[j]) {
            errorMessages.splice(j, 1);
            j = j - 1;
          }
        }
      }
      if (errorMessages.length > 1) {
        setErrorMessage(errorMessages);
        return;
      } else if (errorMessages.length === 1) {
        setErrorMessage(errorMessages[0]);
        return;
      }

      //=============================================================================
      // Submit
      //=============================================================================
      const creatingNewCarrier = type === 'add';

      const method = creatingNewCarrier
        ? 'post'
        : 'put';

      const url = creatingNewCarrier
        ? `ServiceProviders/${currentServiceProvider}/VoipCarriers`
        : `ServiceProviders/${currentServiceProvider}/VoipCarriers/${carrierSid}`;

      // Create or update carrier
      const voipCarrier = await axios({
        method,
        baseURL: process.env.REACT_APP_API_BASE_URL,
        url,
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
        data: {
          name: name.trim() || null,
          e164_leading_plus: e164 ? 1 : 0,
          application_sid: application || null,
          account_sid: accountSid || null,
          requires_register: register ? 1 : 0,
          register_username: username ? username.trim() : null,
          register_password: password ? password : null,
          register_sip_realm: register ? realm.trim() : null,
          tech_prefix: techPrefix ? techPrefix.trim() : null,
          diversion: diversion ? diversion.trim() : null,
          is_active: carrierActive ? 1 : 0,
        },
      });
      const voip_carrier_sid = voipCarrier.data.sid;

      // get updated gateway info from API in order to delete ones that user has removed from UI
      let sipGatewaysFromAPI;
      if (!creatingNewCarrier) {
        const results = await axios({
          method: 'get',
          baseURL: process.env.REACT_APP_API_BASE_URL,
          url: `/SipGateways?voip_carrier_sid=${carrierSid}`,
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });
        sipGatewaysFromAPI = results.data.filter(s => s.voip_carrier_sid === carrierSid);
      }

      //-----------------------------------------------------------------------------
      // Create or Update SIP Gateways
      //-----------------------------------------------------------------------------
      // Keeping track of created SIP gateways in case one throws an error, then all
      // of the ones created before that (as well as the carrier) have to be deleted.
      let completedSipGateways = [];
      try {
        for (const s of sipGateways) {
          const creatingNewGateway = creatingNewCarrier || s.sip_gateway_sid === '';

          const method = creatingNewGateway
            ? 'post'
            : 'put';

          const url = creatingNewGateway
            ? '/SipGateways'
            : `/SipGateways/${s.sip_gateway_sid}`;

          const data = {
            ipv4: s.ip.trim(),
            port: s.port.toString().trim(),
            netmask: s.netmask,
            inbound: s.inbound,
            outbound: s.outbound,
          };

          if (creatingNewGateway) {
            data.voip_carrier_sid = voip_carrier_sid || carrierSid;
          }

          const result = await axios({
            method,
            baseURL: process.env.REACT_APP_API_BASE_URL,
            url,
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
            data,
          });
          if (creatingNewGateway) {
            completedSipGateways.push(result.data.sid);
          }
        };
      } catch (err) {
        if (completedSipGateways.length) {
          for (const sid of completedSipGateways) {
            await axios({
              method: 'delete',
              baseURL: process.env.REACT_APP_API_BASE_URL,
              url: `/SipGateways/${sid}`,
              headers: {
                Authorization: `Bearer ${jwt}`,
              },
            });
          }
        }
        if (voip_carrier_sid) {
          await axios({
            method: 'delete',
            baseURL: process.env.REACT_APP_API_BASE_URL,
            url: `/VoipCarriers/${voip_carrier_sid}`,
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          });
        }
        throw err;
      }

      // delete removed gateways (after add/update in case add/update caused errors)
      if (!creatingNewCarrier) {
        for (const remote of sipGatewaysFromAPI) {
          const match = sipGateways.filter(local => local.sip_gateway_sid === remote.sip_gateway_sid);
          if (!match.length) {
            await axios({
              method: 'delete',
              baseURL: process.env.REACT_APP_API_BASE_URL,
              url: `/SipGateways/${remote.sip_gateway_sid}`,
              headers: {
                Authorization: `Bearer ${jwt}`,
              },
            });
          }
        }
      }

      isMounted = false;
      history.push('/internal/carriers');
      const dispatchMessage = type === 'add'
        ? 'Carrier created successfully'
        : 'Carrier updated successfully';
      dispatch({
        type: 'ADD',
        level: 'success',
        message: dispatchMessage
      });

    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.clear();
        sessionStorage.clear();
        isMounted = false;
        history.push('/');
        dispatch({
          type: 'ADD',
          level: 'error',
          message: 'Your session has expired. Please log in and try again.',
        });
      } else {
        setErrorMessage((err.response && err.response.data && err.response.data.msg) || 'Something went wrong, please try again.');
        console.error(err.response || err);
      }
    } finally {
      if (isMounted) {
        setShowLoader(false);
      }
    }
  };

  const pickupCarrier = async (value) => {
    let isMounted = true;
    try {
      setShowLoader(true);
      setErrorMessage("");

      const result = await axios({
        method: 'post',
        baseURL: process.env.REACT_APP_API_BASE_URL,
        url: `/ServiceProviders/${currentServiceProvider}/PredefinedCarriers/${value}`,
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      const { sid } = result.data;

      history.push(`/internal/carriers/${sid}/edit`);
    } catch (err) {
      handleErrors({ err, history, dispatch, setErrorMessage });
    } finally {
      if (isMounted) {
        setShowLoader(false);
      }
    }
  };

  // eslint-disable-next-line
  const getSubTitle = () => {
    let title = <>&nbsp;</>;
    if (sipRealm) {
      title = staticIPs
        ? `Have your carrier send your calls to your static IP(s): ${staticIPs.join(
            ", "
          )}`
        : `Have your carrier send calls to ${sipRealm}`;
    }
    return title;
  };

  return (
    showLoader ? (
      <Loader height="376px" />
    ) : (
      <StyledForm
        large
        onSubmit={handleSubmit}
      >
        <Label htmlFor="name">Name</Label>
        <NameFieldWrapper hasDropdown={type === 'add'}>
          <Input
            name="name"
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Carrier name"
            invalid={nameInvalid}
            autoFocus
            ref={refName}
          />
          {type === 'add' && (
            <CarrierSelect>
              <Dropdown
                placement="bottomRight"
                trigger="click"
                overlay={
                  <Menu>
                    {predefinedCarriers.map((item) => {
                      const disabled = !staticIPs && item.requires_static_ip;
                      return (
                        <Menu.Item key={item.value} disabled={disabled}>
                          <CarrierItem
                            disabled={disabled}
                            onClick={() => !disabled && pickupCarrier(item.value)}
                          >
                            {item.text}
                          </CarrierItem>
                        </Menu.Item>
                      );
                    })}
                  </Menu>
                }
              >
                <Button text formLink type="button">
                  Select from list
                </Button>
              </Dropdown>
            </CarrierSelect>
          )}
        </NameFieldWrapper>

        <Label htmlFor="e164">active</Label>
        <Checkbox
          noLeftMargin
          name="active"
          id="active"
          label=""
          checked={carrierActive}
          onChange={e => setCarrierActive(e.target.checked)}
        />

        <Label htmlFor="e164">E.164 Syntax</Label>
        <Checkbox
          noLeftMargin
          name="e164"
          id="e164"
          label="prepend a leading + on origination attempts"
          checked={e164}
          onChange={e => setE164(e.target.checked)}
        />

        <Label htmlFor="account">Used by</Label>
        <Select
          name="account"
          id="account"
          value={accountSid}
          onChange={(e) => {
            setAccountSid(e.target.value);
            setApplication('');
          }}
        >
          <option value="">
            All accounts
          </option>
          {accounts.filter(a => a.service_provider_sid === currentServiceProvider).map(a => (
            <option
              key={a.account_sid}
              value={a.account_sid}
            >
              {a.name}
            </option>
          ))}
        </Select>

        {accountSid && (
          <>
            <Label htmlFor="application">Default Application</Label>
            <Select
              name="application"
              id="application"
              value={application}
              onChange={e => setApplication(e.target.value)}
            >
              <option value="">
                {type === 'add'
                  ? '-- OPTIONAL: Application to invoke on calls arriving from this carrier --'
                  : '-- NONE --'
                }
              </option>
              {applicationValues.filter((a) => {
                // Map an application to a service provider through it's account_sid
                const acct = accounts.find(ac => a.account_sid === ac.account_sid);
    
                if (accountSid) {
                  return a.account_sid === accountSid;
                }
    
                return acct.service_provider_sid === currentServiceProvider;
              }).map(a => (
                <option
                  key={a.application_sid}
                  value={a.application_sid}
                >
                  {a.name}
                </option>
              ))}
            </Select>
          </>
        )}

        <hr style={{ margin: '0.5rem -2rem' }} />

        {
          !authenticate ? (
            <>
              <Button
                text
                formLink
                type="button"
                onClick={e => setAuthenticate(!authenticate)}
              >
                Does your carrier require authentication on outbound calls?
              </Button>
            </>
          ) : (
            <>
              <Label htmlFor="username">Username</Label>
              <Input
                name="username"
                id="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="SIP username for authenticating outbound calls"
                invalid={usernameInvalid}
                ref={refUsername}
              />
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                allowShowPassword
                name="password"
                id="password"
                password={password}
                setPassword={setPassword}
                setErrorMessage={setErrorMessage}
                placeholder="SIP password for authenticating outbound calls"
                invalid={passwordInvalid}
                ref={refPassword}
              />
              <div></div>
              <Checkbox
                noLeftMargin
                name="register"
                id="register"
                label="Carrier requires SIP Register before sending outbound calls"
                checked={register}
                onChange={e => setRegister(e.target.checked)}
              />
              {
                register ? (
                  <>
                    <Label htmlFor="realm">SIP Realm</Label>
                    <Input
                      name="realm"
                      id="realm"
                      value={realm}
                      onChange={e => setRealm(e.target.value)}
                      placeholder="SIP realm for registration"
                      invalid={realmInvalid}
                      ref={refRealm}
                    />
                  </>
                ) : (
                  null
                )
              }
            </>
          )
        }

        <hr style={{ margin: '0.5rem -2rem' }} />

        {
          requiredTechPrefix ? (
            <>
              <Label htmlFor="techPrefix">Tech prefix</Label>
              <Input
                name="techPrefix"
                id="techPrefix"
                value={techPrefix}
                onChange={e => setTechPrefix(e.target.value)}
                placeholder="Tech Prefix"
                invalid={techPrefixInvalid}
                ref={refTechPrefix}
              />
            </>
          ) : (
            <>
              <Button
                text
                formLink
                type="button"
                onClick={e => setRequiredTechPrefix(!requiredTechPrefix)}
              >
                Does your carrier require a tech prefix on outbound calls?
              </Button>
            </>
          )
        }

        <hr style={{ margin: '0.5rem -2rem' }} />

        {
          suportSIP ? (
            <>
              <Label htmlFor="diversion">Diversion</Label>
              <Input
                name="diversion"
                id="diversion"
                value={diversion}
                onChange={e => setDiversion(e.target.value)}
                placeholder="Phone number or SIP URI"
              />
            </>
          ) : (
            <>
              <Button
                text
                formLink
                type="button"
                onClick={() => setSupportSIP(!suportSIP)}
              >
                Does your carrier support the SIP Diversion header for authenticating the calling number?
              </Button>
            </>
          )
        }

        <hr style={{ margin: '0.5rem -2rem' }} />

        <StyledLabel>SIP Gateways</StyledLabel>
        <SIPGatewaysInputGroup>
        <StyledLabel>Network Address / Port / Netmask</StyledLabel>
        </SIPGatewaysInputGroup>
        {sipGateways.map((g, i) => (
          <SIPGatewaysInputGroup key={i}>
            <Input
              name={`sipGatewaysIp[${i}]`}
              id={`sipGatewaysIp[${i}]`}
              value={sipGateways[i].ip}
              onChange={e => updateSipGateways(e, i, 'ip')}
              placeholder={'1.2.3.4'}
              invalid={sipGateways[i].invalidIp}
              ref={ref => refIp.current[i] = ref}
            />
            <Input
              width="5rem"
              name={`sipGatewaysPort[${i}]`}
              id={`sipGatewaysPort[${i}]`}
              value={sipGateways[i].port}
              onChange={e => updateSipGateways(e, i, 'port')}
              placeholder="5060"
              invalid={sipGateways[i].invalidPort}
              ref={ref => refPort.current[i] = ref}
            />
            <Select
              name={`sipgatewaysNetmask[${i}]`}
              id={`sipgatewaysNetmask[${i}]`}
              value={sipGateways[i].netmask}
              disabled={sipGateways[i].outbound}
              onChange={e => updateSipGateways(e, i, 'netmask')}
            >
              {Array.from(Array(32 + 1).keys()).slice(1).reverse().map((item) => (
                <option value={item} key={item}>{item}</option>
              ))}
            </Select>
            <SIPGatewaysChecboxGroup>
              <Checkbox
                id={`inbound[${i}]`}
                label="Inbound"
                tooltip="Sends us calls"
                checked={sipGateways[i].inbound}
                onChange={e => updateSipGateways(e, i, 'inbound')}
                invalid={sipGateways[i].invalidInbound}
                ref={ref => refInbound.current[i] = ref}
              />
              <Checkbox
                id={`outbound[${i}]`}
                label="Outbound"
                tooltip="Accepts calls from us"
                checked={sipGateways[i].outbound}
                onChange={e => updateSipGateways(e, i, 'outbound')}
                invalid={sipGateways[i].invalidOutbound}
                ref={ref => refOutbound.current[i] = ref}
              />
              <TrashButton
                onClick={() => removeSipGateway(i)}
                ref={ref => refTrash.current[i] = ref}
              />
            </SIPGatewaysChecboxGroup>
          </SIPGatewaysInputGroup>
        ))}
        <StyledButton
          square
          type="button"
          onClick={addSipGateway}
          ref={refAdd}
        >
          +
        </StyledButton>
        {errorMessage && (
          <FormError grid message={errorMessage} />
        )}

        <StyledButtonGroup flexEnd spaced>
          <Button
            rounded="true"
            gray
            type="button"
            onClick={() => {
              history.push('/internal/carriers');
              dispatch({
                type: 'ADD',
                level: 'info',
                message: type === 'add' ? 'New carrier canceled' :'Changes canceled',
              });
            }}
          >
            Cancel
          </Button>

          <Button rounded="true">
            {type === 'add'
              ? 'Add Carrier'
              : 'Save'
            }
          </Button>
        </StyledButtonGroup>
      </StyledForm>
    )
  );
};

export default CarrierForm;
