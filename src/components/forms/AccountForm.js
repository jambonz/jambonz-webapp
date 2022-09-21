/* eslint-disable no-undef */
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { NotificationDispatchContext } from '../../contexts/NotificationContext';
import { ServiceProviderValueContext } from '../../contexts/ServiceProviderContext';
import Form from '../elements/Form';
import Input from '../elements/Input';
import Label from '../elements/Label';
import Radio from '../elements/Radio';
import Select from '../elements/Select';
import InputGroup from '../elements/InputGroup';
import PasswordInput from '../elements/PasswordInput';
import FormError from '../blocks/FormError';
import TableMenu from '../blocks/TableMenu';
import Loader from '../blocks/Loader';
import Modal from '../blocks/Modal';
import Button from '../elements/Button';
import Link from '../elements/Link';
import Tooltip from '../elements/Tooltip';
import CopyableText from '../elements/CopyableText';
import Span from '../elements/Span';
import handleErrors from "../../helpers/handleErrors";
import styled from 'styled-components/macro';
import { APP_API_BASE_URL, LIMITS } from "../../constants";

const StyledInputGroup = styled(InputGroup)`
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto;

  & > label {
    text-align: left;
  }

  & > div:last-child {
    margin-top: -24px;
  }
`;

const ModalContainer = styled.div`
  margin-top: 2rem;
`;

const P = styled.p`
  margin: 0 0 1.5rem;
  font-size: 14px;
  font-weight: 500;
  font-weight: 500;
  color: #231f20;
`;

const AccountForm = props => {
  let history = useHistory();
  const dispatch = useContext(NotificationDispatchContext);
  const jwt = localStorage.getItem("token");
  const currentServiceProvider = useContext(ServiceProviderValueContext);

  // Refs
  const refName = useRef(null);
  const refSipRealm = useRef(null);
  const refRegWebhook = useRef(null);
  const refRegUser = useRef(null);
  const refRegPassword = useRef(null);
  const refQueueWebhook = useRef(null);
  const refQueueUser = useRef(null);
  const refQueuePassword = useRef(null);
  const refSubspaceId = useRef(null);
  const refSubspaceSecret = useRef(null);
  const refSubspaceOtherSip = useRef(null);

  // Form inputs
  const [ name,          setName       ] = useState('');
  const [ sipRealm,      setSipRealm   ] = useState('');
  const [ deviceCallingApplication, setDeviceCallingApplication ] = useState('');
  const [ siprecCallingApplication, setSiprecCallingApplication ] = useState('');
  const [ regWebhook,    setRegWebhook ] = useState('');
  const [ regMethod,     setRegMethod     ] = useState('POST');
  const [ regUser,       setRegUser       ] = useState('');
  const [ regPassword,   setRegPassword   ] = useState('');
  const [ webhookSecret, setWebhookSecret ] = useState('');
  const [ queueWebhook,  setQueueWebhook ] = useState('');
  const [ queueMethod,   setQueueMethod     ] = useState('POST');
  const [ queueUser,     setQueueUser       ] = useState('');
  const [ queuePassword, setQueuePassword   ] = useState('');
  const [ hasSubspace,    setHasSubspace      ] = useState(false);
  const [ subspaceId,    setSubspaceId      ] = useState('');
  const [ subspaceSecret, setSubspaceSecret ] = useState('');
  const [ subspaceSipTeleportId, setSubspaceSipTeleportId ] = useState('');
  const [ subspaceSipTeleportEntryPoints, setSubspaceSipTeleportEntryPoints ] = useState([]);
  const [ showSubspaceModal, setShowSubspaceModal ] = useState(false);
  const [ generatingSubspace, setGeneratingSubspace ] = useState(false);
  const [ subspaceSipRealm, setSubspaceSipRealm ] = useState('');
  const [ sbcs, setSbcs ] = useState([]);
  const [ subspaceSipRealmOtherValue, setSubspaceSipRealmOtherValue ] = useState('');
  const [ subspaceEnable, setSubspaceEnable ] = useState(false);
  const [localLimits, setLocalLimits] = useState([]);

  // Invalid form inputs
  const [ invalidName,          setInvalidName       ] = useState(false);
  const [ invalidSipRealm,      setInvalidSipRealm   ] = useState(false);
  const [ invalidRegWebhook,    setInvalidRegWebhook ] = useState(false);
  const [ invalidRegUser,       setInvalidRegUser       ] = useState(false);
  const [ invalidRegPassword,   setInvalidRegPassword   ] = useState(false);
  const [ invalidQueueWebhook,  setInvalidQueueWebhook ] = useState(false);
  const [ invalidQueueUser,     setInvalidQueueUser       ] = useState(false);
  const [ invalidQueuePassword, setInvalidQueuePassword   ] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [ invalidSubspaceId, setInvalidSubspaceId   ] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [ invalidSubspaceClient, setInvalidSubspaceClient   ] = useState(false);

  const [ showLoader, setShowLoader ] = useState(true);
  const [ errorMessage, setErrorMessage ] = useState('');

  const [ showRegAuth, setShowRegAuth ] = useState(false);
  const [ showQueueAuth, setShowQueueAuth ] = useState(false);
  const toggleRegAuth = () => setShowRegAuth(!showRegAuth);
  const toggleQueueAuth = () => setShowQueueAuth(!showQueueAuth);

  const [ accounts, setAccounts ] = useState([]);
  const [ accountSid, setAccountSid ] = useState('');
  const [ accountApplications, setAccountApplications ] = useState([]);

  const [ menuOpen, setMenuOpen ] = useState(null);
  const [showConfirmSecret, setShowConfirmSecret] = useState(false);
  const [generatingSecret, setGeneratingSecret] = useState(false);

  const handleMenuOpen = sid => {
    if (menuOpen === sid) {
      setMenuOpen(null);
    } else {
      setMenuOpen(sid);
    }
  };

  const handleSubspaceMenuOpen = sid => {
    if (menuOpen === sid) {
      setMenuOpen(null);
    } else {
      setMenuOpen(sid);
    }
  };

  const copyWebhookSecret = async e => {
    e.preventDefault();
    setMenuOpen(null);

    try {
      await navigator.clipboard.writeText(webhookSecret);
      dispatch({
        type: 'ADD',
        level: 'success',
        message: `Webhook Secret copied to clipboard`,
      });
    } catch (err) {
      dispatch({
        type: 'ADD',
        level: 'error',
        message: `Unable to copy Webhook Secret.`,
      });
    }
  };

  const generateWebhookSecret = async e => {
    e.preventDefault();
    setShowConfirmSecret(true);
    setMenuOpen(null);
  };

  const updateWebhookSecret = async () => {
    try {
      setGeneratingSecret(true);
      const apiKeyResponse = await axios({
        method: 'get',
        baseURL: APP_API_BASE_URL,
        url: `/Accounts/${accountSid}/WebhookSecret?regenerate=true`,
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      if (apiKeyResponse.status === 200) {
        setWebhookSecret(apiKeyResponse.data.webhook_secret);
        dispatch({
          type: 'ADD',
          level: 'success',
          message: 'Webhook signing secret was successfully generated.',
        });
      }
    } catch (err) {
      handleErrors({ err, history, dispatch });
    } finally {
      setGeneratingSecret(false);
      setShowConfirmSecret(false);
    }
  };

  const toggleSubspaceTeleport = (enable, e) => {
    e.preventDefault();
    setMenuOpen(null);
    setSubspaceEnable(enable);
    setShowSubspaceModal(true);
  };

  const resetSubspaceState = () => {
    setMenuOpen(null);
    setShowSubspaceModal(false);
    setSubspaceSipRealmOtherValue('');
    setGeneratingSubspace(false);
    setSubspaceEnable(false);
    setSubspaceSipRealm('');
  };

  const handleSubspaceEnable = async () => {
    try {
      setGeneratingSubspace(true);

      const destination = subspaceSipRealm === 'other'
        ? subspaceSipRealmOtherValue
        : subspaceSipRealm;
      const response = await axios({
        method: 'post',
        baseURL: APP_API_BASE_URL,
        url: `/Accounts/${accountSid}/SubspaceTeleport`,
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
        data: { destination },
      });

      if (response.status === 200) {
        setSubspaceSipTeleportId(response.data.subspace_sip_teleport_id || '');
        setSubspaceSipTeleportEntryPoints(response.data.subspace_sip_teleport_destinations || []);

        dispatch({
          type: 'ADD',
          level: 'success',
          message: 'Successfully enabled subspace teleport.',
        });
      }

      resetSubspaceState();
    } catch (err) {
      resetSubspaceState();
      if (err.response.status === 500 && err.response.data.msg === 'Too Many Requests') {
        dispatch({
          type: 'ADD',
          level: 'error',
          message: 'You have already created the maximum number of SIP Teleports allowed for your Subspace account.',
        });
      } else {
        handleErrors({ err, history, dispatch });
      }
    }
  };

  const handleSubspaceDisable = async () => {
    try {
      setGeneratingSubspace(true);

      const response = await axios({
        method: 'delete',
        baseURL: APP_API_BASE_URL,
        url: `/Accounts/${accountSid}/SubspaceTeleport`,
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      if (response.status === 204) {
        setSubspaceSipTeleportId('');
        setSubspaceSipTeleportEntryPoints([]);

        dispatch({
          type: 'ADD',
          level: 'success',
          message: `Successfully disabled subspace teleport.`,
        });
      }

      resetSubspaceState();
    } catch (err) {
      resetSubspaceState();
      handleErrors({ err, history, dispatch });
    }
  };

  useEffect(() => {
    const getAccounts = async () => {
      try {
        if (!jwt) {
          history.push('/');
          dispatch({
            type: 'ADD',
            level: 'error',
            message: 'You must log in to view that page.',
          });
          return;
        }

        const promiseList = [];
        const accountsPromise = axios({
          method: 'get',
          baseURL: APP_API_BASE_URL,
          url: '/Accounts',
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });
        promiseList.push(accountsPromise);

        if (props.type === 'edit') {
          const applicationsPromise = axios({
            method: 'get',
            baseURL: APP_API_BASE_URL,
            url: '/Applications',
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          });
          promiseList.push(applicationsPromise);

          const limitsPromise = axios({
            method: 'get',
            baseURL: APP_API_BASE_URL,
            url: `/Accounts/${[props.account_sid]}/Limits`,
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          });
          promiseList.push(limitsPromise);
        }

        const sbcsPromise = await axios({
          method: 'get',
          baseURL: APP_API_BASE_URL,
          url: '/Sbcs',
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });
        promiseList.push(sbcsPromise);

        const promiseAllValues = await Promise.all(promiseList);

        const accountsData = (promiseAllValues[0] && promiseAllValues[0].data) || [];
        setAccounts(accountsData);

        if (props.type === 'edit') {
          // Application Data
          const allApplications = (promiseAllValues[1] && promiseAllValues[1].data) || [];
          const accountApplicationsData = allApplications.filter(app => {
            return app.account_sid === props.account_sid;
          });
          setAccountApplications(accountApplicationsData);
          // Limits Data
          setLocalLimits(promiseAllValues[2]?.data);
        }
        setSbcs(promiseAllValues[3]?.data); 

        if (props.type === 'setup' && accountsData.length > 1) {
          history.push('/internal/accounts');
          dispatch({
            type: 'ADD',
            level: 'error',
            message: 'That page is only accessible during setup.',
          });
        }

        if (props.type === 'setup' || props.type === 'edit') {
          const currentAccount = props.account_sid
            ? accountsData.filter(a => a.account_sid === props.account_sid)
            : accountsData;

          const noAccountMessage = props.type === 'setup'
            ? 'You do not have an account. Please add one through the accounts page.'
            : 'That account does not exist.';

          if (!currentAccount.length) {
            history.push('/internal/accounts');
            dispatch({
              type: 'ADD',
              level: 'error',
              message: noAccountMessage,
            });
            return;
          }
          const acc = currentAccount[0];
          setAccountSid(acc.account_sid || '');
                setName(acc.name        || '');
            setSipRealm(acc.sip_realm   || '');
          setDeviceCallingApplication(acc.device_calling_application_sid || '');
          setSiprecCallingApplication(acc.siprec_hook_sid || '');
          setRegWebhook((acc.registration_hook && acc.registration_hook.url     ) || '');
              setRegMethod((acc.registration_hook && acc.registration_hook.method  ) || 'post');
                setRegUser((acc.registration_hook && acc.registration_hook.username) || '');
            setRegPassword((acc.registration_hook && acc.registration_hook.password) || '');
            setQueueWebhook((acc.queue_event_hook && acc.queue_event_hook.url     ) || '');
              setQueueMethod((acc.queue_event_hook && acc.queue_event_hook.method  ) || 'post');
                setQueueUser((acc.queue_event_hook && acc.queue_event_hook.username) || '');
            setQueuePassword((acc.queue_event_hook && acc.queue_event_hook.password) || '');
            setWebhookSecret(acc.webhook_secret || '');
            setSubspaceId(acc.subspace_client_id || '');
            setSubspaceSecret(acc.subspace_client_secret || '');
            setSubspaceSipTeleportId(acc.subspace_sip_teleport_id || '');
            setSubspaceSipTeleportEntryPoints(acc.subspace_sip_teleport_destinations ? JSON.parse(acc.subspace_sip_teleport_destinations) : []);
            setHasSubspace(acc.subspace_client_id ? true : false);
          if (
            (acc.registration_hook && acc.registration_hook.username) ||
            (acc.registration_hook && acc.registration_hook.password)
          ) {
            setShowRegAuth(true);
          }

          if (
            (acc.queue_event_hook && acc.queue_event_hook.username) ||
            (acc.queue_event_hook && acc.queue_event_hook.password)
          ) {
            setShowQueueAuth(true);
          }
        }
        setShowLoader(false);

      } catch (err) {
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          sessionStorage.clear();
          history.push('/');
          dispatch({
            type: 'ADD',
            level: 'error',
            message: 'Your session has expired. Please log in and try again.',
          });
        } else {
          dispatch({
            type: 'ADD',
            level: 'error',
            message: (err.response && err.response.data && err.response.data.msg) || 'Something went wrong, please try again.',
          });
          console.log(err.response || err);
        }
        setShowLoader(false);
      }
    };
    getAccounts();
    // eslint-disable-next-line
  }, []);

  const handleSubmit = async (e) => {
    let isMounted = true;
    try {
      setShowLoader(true);
      e.preventDefault();
      setErrorMessage('');
      setInvalidName(false);
      setInvalidSipRealm(false);
      setInvalidRegWebhook(false);
      setInvalidRegUser(false);
      setInvalidRegPassword(false);
      setInvalidQueueWebhook(false);
      setInvalidQueueUser(false);
      setInvalidQueuePassword(false);
      let errorMessages = [];
      let focusHasBeenSet = false;

      if ((props.type === 'add' || props.type === 'edit') && !name) {
        errorMessages.push('Please provide a name.');
        setInvalidName(true);
        if (!focusHasBeenSet) {
          refName.current.focus();
          focusHasBeenSet = true;
        }
      }

      // Check if name or sip_realm are already in use
      accounts.forEach(a => {
        if (a.account_sid === accountSid) {
          return;
        }

        if (a.name === name) {
          errorMessages.push(
            'The name you have entered is already in use on another one of your accounts.'
          );
          setInvalidName(true);
          if (!focusHasBeenSet) {
            refName.current.focus();
            focusHasBeenSet = true;
          }
        }

        if (sipRealm && a.sip_realm === sipRealm) {
          errorMessages.push(
            'The SIP Realm you have entered is already in use on another one of your accounts.'
          );
          setInvalidSipRealm(true);
          if (!focusHasBeenSet) {
            refSipRealm.current.focus();
            focusHasBeenSet = true;
          }
        }
      });


      if ((regUser && !regPassword) || (!regUser && regPassword)) {
        errorMessages.push('Registration webhook username and password must be either both filled out or both empty.');
        setInvalidRegUser(true);
        setInvalidRegPassword(true);
        if (!focusHasBeenSet) {
          if (!regUser) {
            refRegUser.current.focus();
          } else {
            refRegPassword.current.focus();
          }
          focusHasBeenSet = true;
        }
      }

      if ((queueUser && !queuePassword) || (!queueUser && queuePassword)) {
        errorMessages.push('Queue event webhook username and password must be either both filled out or both empty.');
        setInvalidQueueUser(true);
        setInvalidQueuePassword(true);
        if (!focusHasBeenSet) {
          if (!queueUser) {
            refQueueUser.current.focus();
          } else {
            refQueuePassword.current.focus();
          }
          focusHasBeenSet = true;
        }
      }

      if (errorMessages.length > 1) {
        setErrorMessage(errorMessages);
        return;
      } else if (errorMessages.length === 1) {
        setErrorMessage(errorMessages[0]);
        return;
      }

      const axiosData = {
        name: name.trim(),
        sip_realm: sipRealm.trim() || null,
        registration_hook: {
          url: regWebhook.trim(),
          method: regMethod,
          username: regUser.trim() || null,
          password: regPassword || null,
        },
        queue_event_hook: {
          url: queueWebhook.trim(),
          method: queueMethod,
          username: queueUser.trim() || null,
          password: queuePassword || null,
        },
        webhook_secret: webhookSecret || null,
        subspace_client_id: subspaceId || null,
        subspace_client_secret: subspaceSecret || null,
      };

      if (props.type === 'add') {
        axiosData.service_provider_sid = currentServiceProvider;
      }

      if (props.type === 'edit') {
        axiosData.device_calling_application_sid = deviceCallingApplication || null;
        axiosData.siprec_hook_sid = siprecCallingApplication || null;
      }

      const url = props.type === 'add'
        ? `/Accounts`
        : `/Accounts/${accountSid}`;

      await axios({
        method: props.type === 'add' ? 'post' : 'put',
        baseURL: APP_API_BASE_URL,
        url,
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
        data: axiosData,
      });
      // Update Limits
      if (props.type === 'edit') {
        for (const limit of localLimits) {
          await axios({
            method: 'post',
            baseURL: APP_API_BASE_URL,
            url: `/Accounts/${props.account_sid}/Limits`,
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
            data: limit,
          });
        }
      }

      if (props.type === 'setup') {
        isMounted = false;
        history.push('/create-application');
      } else {
        isMounted = false;
        history.push('/internal/accounts');
        const dispatchMessage = props.type === 'add'
          ? 'Account created successfully'
          : 'Account updated successfully';
        dispatch({
          type: 'ADD',
          level: 'success',
          message: dispatchMessage
        });
      }


    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
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
        console.log(err.response || err);
      }
    } finally {
      if (isMounted) {
        setShowLoader(false);
      }
    }
  };

  const menuItems = [
    {
      type: 'button',
      name: 'Copy',
      action: copyWebhookSecret,
    },
    {
      type: 'button',
      name: 'Generate new secret',
      action: generateWebhookSecret,
    },
  ];

  const subspaceMenuItems = [
    {
      type: 'button',
      name: 'Enable',
      action: toggleSubspaceTeleport.bind(toggleSubspaceTeleport, true),
    },
    {
      type: 'button',
      name: 'Disable',
      action: toggleSubspaceTeleport.bind(toggleSubspaceTeleport, false),
    },
  ];

  const limitElements = [];
  LIMITS.forEach(({ label, category }) => {
    limitElements.push(<Label htmlFor={category}>{label}</Label>);
    limitElements.push(
      <Input
        name={category}
        id={category}
        type="number"
        min="0"
        value={localLimits?.find(l => l.category === category)?.quantity}
        onChange={e => {
          let isLimitExisted = false;
          const newLimits = localLimits?.map(l => {
            if (l.category === category) {
              isLimitExisted = true;
              return { ...l, quantity: Number(e.target.value) };
            } else {
              return l;
            }
          });
          if(!isLimitExisted) {
            newLimits.push(({category, quantity: e.target.value}));
          }
          setLocalLimits(newLimits);
        }}
      />);
  });

  return (
    showLoader
    ? <Loader
        height={
          props.type === 'setup'
            ? '309px'
            : props.type === 'edit'
              ? '381px'
              : '292px'
        }
      />
    : <Form
        large
        wideLabel={props.type === 'edit'}
        onSubmit={handleSubmit}
      >

        {props.type === 'edit' && (
          <React.Fragment>
            <Label>AccountSid</Label>
            <CopyableText text={accountSid} textType="AccountSid" />
          </React.Fragment>
        )}

        {(props.type === 'add' || props.type === 'edit') && (
          <React.Fragment>
            <Label htmlFor="name">Name</Label>
            <Input
              large={props.type === 'setup'}
              name="name"
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Account name"
              invalid={invalidName}
              autoFocus
              ref={refName}
            />
          </React.Fragment>

        )}
        <Label htmlFor="sipRealm">SIP Realm</Label>
        <Input
          large={props.type === 'setup'}
          name="sipRealm"
          id="sipRealm"
          value={sipRealm}
          onChange={e => setSipRealm(e.target.value)}
          placeholder="The domain name that SIP devices will register with"
          invalid={invalidSipRealm}
          autoFocus={props.type === 'setup'}
          ref={refSipRealm}
        />
        {props.type === 'edit' && limitElements}
        <Label htmlFor="webhookSecret">Webhook Secret</Label>
        <StyledInputGroup>
          <Label>{webhookSecret || "None"}</Label>
          <TableMenu
            sid="webhook"
            open={menuOpen === "webhook"}
            handleMenuOpen={handleMenuOpen}
            menuItems={webhookSecret ? menuItems: menuItems.slice(1)}
          />
        </StyledInputGroup>

        {props.type === 'edit' && (
          <>
            <React.Fragment>
              <Label tooltip htmlFor="deviceCallingApplication">
                <span style={{ position: 'relative' }}>
                  Application for SIP Device Calls
                  <Tooltip large>
                    This application is used to handle incoming calls from SIP users who have registered to the Account’s SIP Realm.
                  </Tooltip>
                </span>
              </Label>
              <Select
                large={props.type === 'setup'}
                name="deviceCallingApplication"
                id="deviceCallingApplication"
                value={deviceCallingApplication}
                onChange={e => setDeviceCallingApplication(e.target.value)}
              >
                <option value="">-- NONE --</option>
                {accountApplications && accountApplications.map(app => (
                  <option
                    key={app.application_sid}
                    value={app.application_sid}
                  >
                    {app.name}
                  </option>
                ))}
              </Select>
            </React.Fragment>
            
            <React.Fragment>
              <Label tooltip htmlFor="siprecCallingApplication">
                <span style={{ position: 'relative' }}>
                  Application for SIPREC Calls
                </span>
              </Label>
              <Select
                large={props.type === 'setup'}
                name="siprecCallingApplication"
                id="siprecCallingApplication"
                value={siprecCallingApplication}
                onChange={e => setSiprecCallingApplication(e.target.value)}
                right
              >
                <option value="">-- NONE --</option>
                {accountApplications && accountApplications.map(app => (
                  <option
                    key={app.application_sid}
                    value={app.application_sid}
                  >
                    {app.name}
                  </option>
                ))}
              </Select>
            </React.Fragment>
          </>
        )}

        <Label htmlFor="regWebhook">Registration Webhook</Label>
        <InputGroup>
          <Input
            large={props.type === 'setup'}
            name="regWebhook"
            id="regWebhook"
            value={regWebhook}
            onChange={e => setRegWebhook(e.target.value)}
            placeholder="URL for your web application that handles registrations"
            invalid={invalidRegWebhook}
            ref={refRegWebhook}
          />

          <Label
            middle
            htmlFor="method"
          >
            Method
          </Label>
          <Select
            large={props.type === 'setup'}
            name="method"
            id="regMethod"
            value={regMethod}
            onChange={e => setRegMethod(e.target.value)}
          >
            <option value="POST">POST</option>
            <option value="GET">GET</option>
          </Select>
        </InputGroup>

        {showRegAuth ? (
          <InputGroup>
            <Label indented htmlFor="user">User</Label>
            <Input
              large={props.type === 'setup'}
              name="user"
              id="user"
              value={regUser || ''}
              onChange={e => setRegUser(e.target.value)}
              placeholder="Optional"
              invalid={invalidRegUser}
              ref={refRegUser}
            />
            <Label htmlFor="password" middle>Password</Label>
            <PasswordInput
              large={props.type === 'setup'}
              allowShowPassword
              name="password"
              id="password"
              password={regPassword}
              setPassword={setRegPassword}
              setErrorMessage={setErrorMessage}
              placeholder="Optional"
              invalid={invalidRegPassword}
              ref={refRegPassword}
            />
          </InputGroup>
        ) : (
          <Button
            text
            formLink
            type="button"
            onClick={toggleRegAuth}
          >
            Use HTTP Basic Authentication
          </Button>
        )}

        <Label htmlFor="queueWebhook">Queue Event Webhook</Label>
        <InputGroup>
          <Input
            large={props.type === 'setup'}
            name="queueWebhook"
            id="queueWebhook"
            value={queueWebhook}
            onChange={e => setQueueWebhook(e.target.value)}
            placeholder="URL to notify when a member joins or leaves a queue"
            invalid={invalidQueueWebhook}
            ref={refQueueWebhook}
          />

          <Label
            middle
            htmlFor="method"
          >
            Method
          </Label>
          <Select
            large={props.type === 'setup'}
            name="method"
            id="queueMethod"
            value={queueMethod}
            onChange={e => setQueueMethod(e.target.value)}
          >
            <option value="POST">POST</option>
          </Select>
        </InputGroup>

        {showQueueAuth ? (
          <InputGroup>
            <Label indented htmlFor="user">User</Label>
            <Input
              large={props.type === 'setup'}
              name="user"
              id="user"
              value={queueUser || ''}
              onChange={e => setQueueUser(e.target.value)}
              placeholder="Optional"
              invalid={invalidQueueUser}
              ref={refQueueUser}
            />
            <Label htmlFor="password" middle>Password</Label>
            <PasswordInput
              large={props.type === 'setup'}
              allowShowPassword
              name="password"
              id="password"
              password={queuePassword}
              setPassword={setQueuePassword}
              setErrorMessage={setErrorMessage}
              placeholder="Optional"
              invalid={invalidQueuePassword}
              ref={refQueuePassword}
            />
          </InputGroup>
        ) : (
          <Button
            text
            formLink
            type="button"
            onClick={toggleQueueAuth}
          >
            Use HTTP Basic Authentication
          </Button>
        )}

        { process.env.REACT_APP_ENABLE_SUBSPACE ? (
          <>
            <Label htmlFor="subspaceId">Subspace</Label>
            <InputGroup>
              <Input
                large={props.type === 'setup'}
                name="subspaceId"
                id="subspaceId"
                value={subspaceId}
                onChange={e => setSubspaceId(e.target.value)}
                placeholder="Client Id for Subspace"
                ref={refSubspaceId}
                style={{ margin: '0 4px' }}
              />

              <PasswordInput
                large={props.type === 'setup'}
                allowShowPassword
                name="subspaceSecret"
                id="subspaceSecret"
                password={subspaceSecret}
                setPassword={setSubspaceSecret}
                setErrorMessage={setErrorMessage}
                placeholder="Client Secret for Subspace"
                ref={refSubspaceSecret}
                style={{ margin: '0 4px' }}
              />

              <StyledInputGroup>
                <TableMenu
                  disabled={!hasSubspace}
                  sid="subspace"
                  open={menuOpen === "subspace"}
                  handleMenuOpen={handleSubspaceMenuOpen}
                  menuItems={subspaceSipTeleportId ? [subspaceMenuItems[1]] : [subspaceMenuItems[0]]}
                />
              </StyledInputGroup>
            </InputGroup>
            {subspaceSipTeleportId ? (
              <div style={{ gridColumn: 2, textAlign: 'left' }}>
                <div>Subspace is now enabled. To send your traffic through Subspace:</div>
                {subspaceSipTeleportEntryPoints.map(entrypoint => (
                  <div key={entrypoint.transport_type}>
                    <Span>send {entrypoint.transport_type.split('_').join(' and ')} traffic to&nbsp;</Span>
                    <CopyableText text={entrypoint.address} textType="Address" />
                  </div>
                ))}
              </div>
            ) : null}
            {showSubspaceModal && (
              <Modal
                title={subspaceEnable ? 'Have Subspace send SIP to:' : 'Are you sure you want to delete your Subspace SIP Teleport?'}
                loader={generatingSubspace}
                hideButtons={generatingSubspace}
                maskClosable={!generatingSubspace}
                actionText={subspaceEnable ? 'Save' : 'Disable'}
                content={
                  <ModalContainer>
                    {subspaceEnable ? (
                      <>
                        {sipRealm && (
                          <Radio
                            noLeftMargin
                            name="subspaceSipRealm"
                            id="sipRealmAccount"
                            label={sipRealm}
                            checked={subspaceSipRealm === sipRealm}
                            onChange={() => {
                              setSubspaceSipRealm(sipRealm);
                              setSubspaceSipRealmOtherValue('');
                            }}
                          />
                        )}
                        {sbcs.map((sbc) => {
                          return (
                            <Radio
                              key={sbc.ipv4}
                              noLeftMargin
                              name="subspaceSipRealm"
                              id={sbc.sbc_address_sid}
                              label={`${sbc.ipv4}:${sbc.port}`}
                              checked={subspaceSipRealm === `${sbc.ipv4}:${sbc.port}`}
                              onChange={() => {
                                setSubspaceSipRealm(`${sbc.ipv4}:${sbc.port}`);
                                setSubspaceSipRealmOtherValue('');
                              }}
                            />
                          );
                        })}
                        <Radio
                          noLeftMargin
                          name="subspaceSipRealm"
                          id="sipRealmOther"
                          label="Other"
                          checked={subspaceSipRealm === 'other'}
                          onChange={() => {
                            setSubspaceSipRealm('other');
                            setTimeout(() => refSubspaceOtherSip.current.focus(), 0);
                          }}
                        />
                        {subspaceSipRealm === 'other' && (
                          <Input
                            ref={refSubspaceOtherSip}
                            name="subspaceSipRealm"
                            id="sipRealmOtherValue"
                            value={subspaceSipRealmOtherValue}
                            onChange={e => setSubspaceSipRealmOtherValue(e.target.value)}
                            placeholder="IP address or DNS name"
                            style={{ marginTop: '8px' }}
                          />
                        )}
                      </>
                    ) : null}
                  </ModalContainer>
                }
                handleCancel={() => {
                  setShowSubspaceModal(false);
                  resetSubspaceState();
                }}
                handleSubmit={() => {
                  if (subspaceEnable) {
                    handleSubspaceEnable();
                  } else {
                    handleSubspaceDisable();
                  }
                }}
              />
            )}
          </>
        ) : null }

        {errorMessage && (
          <FormError grid message={errorMessage} />
        )}

        <InputGroup flexEnd spaced>
          {props.type === 'edit' && (
            <Button
              grid
              gray
              type="button"
              onClick={() => {
                history.push('/internal/accounts');
                dispatch({
                  type: 'ADD',
                  level: 'info',
                  message: 'Changes canceled',
                });
              }}
            >
              Cancel
            </Button>
          )}

          <Button
            large={props.type === 'setup'}
            grid
            fullWidth={props.type === 'setup' || props.type === 'add'}
          >
            {props.type === 'setup'
              ? 'Save and Continue'
              : props.type === 'add'
                ? 'Add Account'
                : 'Save'
            }
          </Button>
        </InputGroup>

        {props.type === 'setup' && (
          <Link
            formLink
            right
            to="/create-application"
          >
            Skip for now &mdash; I'll complete later
          </Link>
        )}
        {showConfirmSecret && (
          <Modal
            title={generatingSecret ? "" : "Generate new secret"}
            loader={generatingSecret}
            hideButtons={generatingSecret}
            maskClosable={!generatingSecret}
            actionText="OK"
            content={
              <ModalContainer>
                <P>Press OK to generate a new webhook signing secret.</P>
                <P>Note: this will immediately invalidate the old webhook signing secret.</P>
              </ModalContainer>
            }
            handleCancel={() => setShowConfirmSecret(false)}
            handleSubmit={updateWebhookSecret}
          />
        )}
      </Form>
  );
};

export default AccountForm;
