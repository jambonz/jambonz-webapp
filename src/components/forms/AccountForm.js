import React, { useState, useEffect, useContext, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { NotificationDispatchContext } from '../../contexts/NotificationContext';
import Form from '../elements/Form';
import Input from '../elements/Input';
import Label from '../elements/Label';
import Select from '../elements/Select';
import InputGroup from '../elements/InputGroup';
import PasswordInput from '../elements/PasswordInput';
import FormError from '../blocks/FormError';
import Loader from '../blocks/Loader';
import Button from '../elements/Button';
import Link from '../elements/Link';
import Tooltip from '../elements/Tooltip';

const AccountForm = props => {
  let history = useHistory();
  const dispatch = useContext(NotificationDispatchContext);

  // Refs
  const refName = useRef(null);
  const refSipRealm = useRef(null);
  const refRegWebhook = useRef(null);
  const refUser = useRef(null);
  const refPassword = useRef(null);

  // Form inputs
  const [ name,       setName       ] = useState('');
  const [ sipRealm,   setSipRealm   ] = useState('');
  const [ deviceCallingApplication, setDeviceCallingApplication ] = useState('');
  const [ regWebhook, setRegWebhook ] = useState('');
  const [ method,     setMethod     ] = useState('POST');
  const [ user,       setUser       ] = useState('' || '');
  const [ password,   setPassword   ] = useState('' || '');

  // Invalid form inputs
  const [ invalidName,       setInvalidName       ] = useState(false);
  const [ invalidSipRealm,   setInvalidSipRealm   ] = useState(false);
  const [ invalidRegWebhook, setInvalidRegWebhook ] = useState(false);
  const [ invalidUser,       setInvalidUser       ] = useState(false);
  const [ invalidPassword,   setInvalidPassword   ] = useState(false);

  const [ showLoader, setShowLoader ] = useState(true);
  const [ errorMessage, setErrorMessage ] = useState('');

  const [ showAuth, setShowAuth ] = useState(false);
  const toggleAuth = () => setShowAuth(!showAuth);

  const [ accounts, setAccounts ] = useState([]);
  const [ accountSid, setAccountSid ] = useState('');
  const [ serviceProviderSid, setServiceProviderSid ] = useState('');
  const [ accountApplications, setAccountApplications ] = useState([]);

  useEffect(() => {
    const getAccounts = async () => {
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

        const promiseList = [];
        const accountsPromise = axios({
          method: 'get',
          baseURL: process.env.REACT_APP_API_BASE_URL,
          url: '/Accounts',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        promiseList.push(accountsPromise);

        if (props.type === 'edit') {
          const applicationsPromise = axios({
            method: 'get',
            baseURL: process.env.REACT_APP_API_BASE_URL,
            url: '/Applications',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          promiseList.push(applicationsPromise);
        }

        if (props.type === 'add') {
          const serviceProvidersPromise = axios({
            method: 'get',
            baseURL: process.env.REACT_APP_API_BASE_URL,
            url: '/ServiceProviders',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          promiseList.push(serviceProvidersPromise);
        }

        const promiseAllValues = await Promise.all(promiseList);

        const accountsData = (promiseAllValues[0] && promiseAllValues[0].data) || [];
        setAccounts(accountsData);

        if (props.type === 'edit') {
          const allApplications = (promiseAllValues[1] && promiseAllValues[1].data) || [];
          const accountApplicationsData = allApplications.filter(app => {
            return app.account_sid === props.account_sid;
          });
          setAccountApplications(accountApplicationsData);
        }

        if (props.type === 'add') {
          const serviceProviders = (promiseAllValues[1] && promiseAllValues[1].data) || '';
          setServiceProviderSid(serviceProviders[0].service_provider_sid);
        }

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
          setRegWebhook((acc.registration_hook && acc.registration_hook.url     ) || '');
              setMethod((acc.registration_hook && acc.registration_hook.method  ) || 'post');
                setUser((acc.registration_hook && acc.registration_hook.username) || '');
            setPassword((acc.registration_hook && acc.registration_hook.password) || '');

          if (
            (acc.registration_hook && acc.registration_hook.username) ||
            (acc.registration_hook && acc.registration_hook.password)
          ) {
            setShowAuth(true);
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

  const handleSumit = async (e) => {
    try {
      e.preventDefault();
      setErrorMessage('');
      setInvalidName(false);
      setInvalidSipRealm(false);
      setInvalidRegWebhook(false);
      setInvalidUser(false);
      setInvalidPassword(false);
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

      const axiosData = {
        name,
        sip_realm: sipRealm || null,
        registration_hook: {
          url: regWebhook,
          method: method,
          username: user || null,
          password: password || null,
        },
      };

      if (props.type === 'add') {
        axiosData.service_provider_sid = serviceProviderSid;
      }

      if (props.type === 'edit') {
        axiosData.device_calling_application_sid = deviceCallingApplication || null;
      }

      const url = props.type === 'add'
        ? `/Accounts`
        : `/Accounts/${accountSid}`;

      await axios({
        method: props.type === 'add' ? 'post' : 'put',
        baseURL: process.env.REACT_APP_API_BASE_URL,
        url,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        data: axiosData,
      });

      if (props.type === 'setup') {
        history.push('/create-application');
      } else {
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
    }
  };

  return (
    showLoader
    ? <Loader
        height={
          props.type === 'setup'
            ? '309px'
            : '292px'
        }
      />
    : <Form
        large
        wideLabel={props.type === 'edit'}
        onSubmit={handleSumit}
      >
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

        {props.type === 'edit' && (
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
            id="method"
            value={method}
            onChange={e => setMethod(e.target.value)}
          >
            <option value="POST">POST</option>
            <option value="GET">GET</option>
          </Select>
        </InputGroup>

        {showAuth ? (
          <InputGroup>
            <Label indented htmlFor="user">User</Label>
            <Input
              large={props.type === 'setup'}
              name="user"
              id="user"
              value={user || ''}
              onChange={e => setUser(e.target.value)}
              invalid={invalidUser}
              ref={refUser}
            />
            <Label htmlFor="password" middle>Password</Label>
            <PasswordInput
              large={props.type === 'setup'}
              allowShowPassword
              name="password"
              id="password"
              password={password}
              setPassword={setPassword}
              setErrorMessage={setErrorMessage}
              invalid={invalidPassword}
              ref={refPassword}
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
            Skip for now &mdash; I'l complete later
          </Link>
        )}
      </Form>
  );
};

export default AccountForm;
