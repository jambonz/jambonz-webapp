import React, { useState, useEffect, useContext, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { NotificationDispatchContext } from '../../contexts/NotificationContext';
import { ShowMsTeamsDispatchContext } from '../../contexts/ShowMsTeamsContext';
import Form from '../elements/Form';
import Input from '../elements/Input';
import Label from '../elements/Label';
import Select from '../elements/Select';
import Checkbox from '../elements/Checkbox';
import InputGroup from '../elements/InputGroup';
import PasswordInput from '../elements/PasswordInput';
import FormError from '../blocks/FormError';
import Button from '../elements/Button';
import Loader from '../blocks/Loader';

const SettingsForm = () => {
  const history = useHistory();
  const dispatch = useContext(NotificationDispatchContext);
  const refreshMsTeamsData = useContext(ShowMsTeamsDispatchContext);

  // Refs
  const refEnableMsTeams = useRef(null);
  const refSbcDomainName = useRef(null);
  const refSipRealm = useRef(null);
  const refRegWebhook = useRef(null);
  const refUser = useRef(null);
  const refPassword = useRef(null);

  // Form inputs
  const [ enableMsTeams, setEnableMsTeams ] = useState(false);
  const [ sbcDomainName, setSbcDomainName ] = useState('');
  const [ sipRealm,      setSipRealm      ] = useState('');
  const [ regWebhook,    setRegWebhook    ] = useState('');
  const [ method,        setMethod        ] = useState('POST');
  const [ user,          setUser          ] = useState('');
  const [ password,      setPassword      ] = useState('');

  // For when user has data in sbcDomainName and then taps the checkbox to disable MsTeams
  const [ savedSbcDomainName, setSavedSbcDomainName ] = useState('');

  // Invalid form inputs
  const [ invalidEnableMsTeams, setInvalidEnableMsTeams ] = useState(false);
  const [ invalidSbcDomainName, setInvalidSbcDomainName ] = useState(false);
  const [ invalidSipRealm,      setInvalidSipRealm      ] = useState(false);
  const [ invalidRegWebhook,    setInvalidRegWebhook    ] = useState(false);
  const [ invalidUser,          setInvalidUser          ] = useState(false);
  const [ invalidPassword,      setInvalidPassword      ] = useState(false);

  const [ showLoader, setShowLoader ] = useState(true);
  const [ errorMessage, setErrorMessage ] = useState('');

  const [ showAuth, setShowAuth ] = useState(false);
  const toggleAuth = () => setShowAuth(!showAuth);

  const [ serviceProviderSid, setServiceProviderSid ] = useState('');

  useEffect(() => {
    const getSettingsData = async () => {
      try {
        if (!localStorage.getItem('token')) {
          history.push('/');
          dispatch({
            type: 'ADD',
            level: 'error',
            message: 'You must log in to view that page.',
          });
          return;
        }

        const serviceProvidersResponse = await axios({
          method: 'get',
          baseURL: process.env.REACT_APP_API_BASE_URL,
          url: '/ServiceProviders',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const sp = serviceProvidersResponse.data[0];

        setServiceProviderSid(sp.service_provider_sid || '');
        setEnableMsTeams(sp.ms_teams_fqdn ? true : false);
        setSbcDomainName(sp.ms_teams_fqdn || '');
        setSipRealm(sp.root_domain || '');
        setRegWebhook((sp.registration_hook && sp.registration_hook.url) || '');
        setMethod((sp.registration_hook && sp.registration_hook.method) || 'post');
        setUser((sp.registration_hook && sp.registration_hook.username) || '');
        setPassword((sp.registration_hook && sp.registration_hook.password) || '');

        if (
          (sp.registration_hook && sp.registration_hook.username) ||
          (sp.registration_hook && sp.registration_hook.password)
        ) {
          setShowAuth(true);
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
    getSettingsData();
    // eslint-disable-next-line
  }, []);

  const toggleMsTeams = (e) => {
    if (!e.target.checked && sbcDomainName) {
      setSavedSbcDomainName(sbcDomainName);
      setSbcDomainName('');
    }
    if (e.target.checked && savedSbcDomainName) {
      setSbcDomainName(savedSbcDomainName);
      setSavedSbcDomainName('');
    }
    setEnableMsTeams(e.target.checked);
  };

  const handleSubmit = async (e) => {
    let isMounted = true;
    try {
      //=============================================================================
      // reset
      //=============================================================================
      setShowLoader(true);
      e.preventDefault();
      setErrorMessage('');
      setInvalidEnableMsTeams(false);
      setInvalidSbcDomainName(false);
      setInvalidSipRealm(false);
      setInvalidRegWebhook(false);
      setInvalidUser(false);
      setInvalidPassword(false);
      let errorMessages = [];
      let focusHasBeenSet = false;

      //=============================================================================
      // data checks
      //=============================================================================
      if (enableMsTeams && !sbcDomainName) {
        errorMessages.push(
          'You must provide an SBC Domain Name in order to enable Microsoft Teams Direct Routing'
        );
        setInvalidSbcDomainName(true);
        if (!focusHasBeenSet) {
          refSbcDomainName.current.focus();
          focusHasBeenSet = true;
        }
      }

      if (!enableMsTeams && sbcDomainName) {
        errorMessages.push(
          'You must check "Enable Microsoft Teams Direct Routing" to enable this feature, or remove the SBC Domain Name provided'
        );
        setInvalidEnableMsTeams(true);
        if (!focusHasBeenSet) {
          refEnableMsTeams.current.focus();
          focusHasBeenSet = true;
        }
      }

      if (!sipRealm && (regWebhook || user || password)) {
        errorMessages.push(
          'You must provide a SIP Realm in order to provide a Registration Webhook'
        );
        setInvalidSipRealm(true);
        if (!focusHasBeenSet) {
          refSipRealm.current.focus();
          focusHasBeenSet = true;
        }
      }

      if (sipRealm && !regWebhook) {
        errorMessages.push(
          'You must provide a Registration Webhook when providing a SIP Realm'
        );
        setInvalidRegWebhook(true);
        if (!focusHasBeenSet) {
          refRegWebhook.current.focus();
          focusHasBeenSet = true;
        }
      }

      if ((user && !password) || (!user && password)) {
        errorMessages.push('Username and password must be either both filled out or both empty.');
        setInvalidUser(true);
        setInvalidPassword(true);
        if (!focusHasBeenSet) {
          if (!user) {
            refUser.current.focus();
          } else {
            refPassword.current.focus();
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

      //=============================================================================
      // submit data
      //=============================================================================
      const data = {
        ms_teams_fqdn: sbcDomainName.trim() || null,
        root_domain: sipRealm.trim() || null,
      };

      if (regWebhook) {
        data.registration_hook = {
          url: regWebhook.trim() || null,
          method,
          username: user.trim() || null,
          password: password || null,
        };
      }

      await axios({
        method: 'put',
        baseURL: process.env.REACT_APP_API_BASE_URL,
        url: `/ServiceProviders/${serviceProviderSid}`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        data,
      });

      refreshMsTeamsData();

      //=============================================================================
      // redirect
      //=============================================================================
      isMounted = false;
      history.push('/internal/accounts');
      dispatch({
        type: 'ADD',
        level: 'success',
        message: 'Settings updated'
      });

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

  return (
    showLoader
    ? <Loader height="365px" />
    : <Form
        large
        wideLabel
        onSubmit={handleSubmit}
      >
        <div>{/* needed for CSS grid layout */}</div>
        <Checkbox
          noLeftMargin
          id="enableMsTeams"
          label="Enable Microsoft Teams Direct Routing"
          checked={enableMsTeams}
          onChange={toggleMsTeams}
          invalid={invalidEnableMsTeams}
          ref={refEnableMsTeams}
        />

        <Label htmlFor="sbcDomainName">SBC Domain Name</Label>
        <Input
          name="sbcDomainName"
          id="sbcDomainName"
          value={sbcDomainName}
          onChange={e => setSbcDomainName(e.target.value)}
          placeholder="Fully qualified domain name used for Microsoft Teams"
          invalid={invalidSbcDomainName}
          autoFocus={enableMsTeams}
          ref={refSbcDomainName}
          disabled={!enableMsTeams}
          title={(!enableMsTeams && "You must enable Microsoft Teams Direct Routing in order to provide an SBC Domain Name") || ""}
        />

        <hr />

        <Label htmlFor="sipRealm">Fallback SIP Realm</Label>
        <Input
          name="sipRealm"
          id="sipRealm"
          value={sipRealm}
          onChange={e => setSipRealm(e.target.value)}
          placeholder="Domain name that accounts will use as a fallback"
          invalid={invalidSipRealm}
          autoFocus={!enableMsTeams}
          ref={refSipRealm}
        />

        <Label htmlFor="regWebhook">Registration Webhook</Label>
        <InputGroup>
          <Input
            name="regWebhook"
            id="regWebhook"
            value={regWebhook}
            onChange={e => setRegWebhook(e.target.value)}
            placeholder="URL for your web application that handles registrations"
            invalid={invalidRegWebhook}
            ref={refRegWebhook}
            disabled={!sipRealm && !regWebhook && !user && !password}
            title={(
              !sipRealm &&
              !regWebhook &&
              !user &&
              !password &&
              "You must provide a SIP Realm in order to enter a registration webhook"
            ) || ""}
          />

          <Label
            middle
            htmlFor="method"
          >
            Method
          </Label>
          <Select
            name="method"
            id="method"
            value={method}
            onChange={e => setMethod(e.target.value)}
            disabled={!sipRealm && !regWebhook && !user && !password}
            title={(
              !sipRealm &&
              !regWebhook &&
              !user &&
              !password &&
              "You must provide a SIP Realm in order to enter a registration webhook"
            ) || ""}
          >
            <option value="POST">POST</option>
            <option value="GET">GET</option>
          </Select>
        </InputGroup>

        {showAuth ? (
          <InputGroup>
            <Label indented htmlFor="user">User</Label>
            <Input
              name="user"
              id="user"
              value={user || ''}
              onChange={e => setUser(e.target.value)}
              placeholder="Optional"
              invalid={invalidUser}
              ref={refUser}
              disabled={!sipRealm && !regWebhook && !user && !password}
              title={(
                !sipRealm &&
                !regWebhook &&
                !user &&
                !password &&
                "You must provide a SIP Realm in order to enter a registration webhook"
              ) || ""}
            />
            <Label htmlFor="password" middle>Password</Label>
            <PasswordInput
              allowShowPassword
              name="password"
              id="password"
              password={password}
              setPassword={setPassword}
              setErrorMessage={setErrorMessage}
              placeholder="Optional"
              invalid={invalidPassword}
              ref={refPassword}
              disabled={!sipRealm && !regWebhook && !user && !password}
              title={(
                !sipRealm &&
                !regWebhook &&
                !user &&
                !password &&
                "You must provide a SIP Realm in order to enter a registration webhook"
              ) || ""}
            />
          </InputGroup>
        ) : (
          <Button
            text
            formLink
            type="button"
            onClick={toggleAuth}
          >
            Use HTTP Basic Authentication
          </Button>
        )}

        {errorMessage && (
          <FormError grid message={errorMessage} />
        )}

        <InputGroup flexEnd spaced>
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

          <Button grid>Save</Button>
        </InputGroup>
      </Form>
  );
};

export default SettingsForm;
