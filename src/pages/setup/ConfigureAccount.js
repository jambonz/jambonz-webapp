import React, { useState, useEffect, useContext, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { NotificationDispatchContext } from '../../contexts/NotificationContext';
import SetupTemplate from '../../templates/SetupTemplate';
import Form from '../../elements/Form';
import Input from '../../elements/Input';
import Label from '../../elements/Label';
import Select from '../../elements/Select';
import InputGroup from '../../elements/InputGroup';
import PasswordInput from '../../elements/PasswordInput';
import FormError from '../../blocks/FormError';
import Button from '../../elements/Button';
import Link from '../../elements/Link';

const ConfigureAccount = () => {
  let history = useHistory();
  const dispatch = useContext(NotificationDispatchContext);

  // Refs
  const refSipRealm = useRef(null);
  const refRegWebhook = useRef(null);
  const refUser = useRef(null);
  const refPassword = useRef(null);

  // Form inputs
  const [ sipRealm,   setSipRealm   ] = useState('');
  const [ regWebhook, setRegWebhook ] = useState('');
  const [ method,     setMethod     ] = useState('POST');
  const [ user,       setUser       ] = useState('');
  const [ password,   setPassword   ] = useState('');

  // Invalid form inputs
  const [ invalidSipRealm,   setInvalidSipRealm   ] = useState(false);
  const [ invalidRegWebhook, setInvalidRegWebhook ] = useState(false);
  const [ invalidUser,       setInvalidUser       ] = useState(false);
  const [ invalidPassword,   setInvalidPassword   ] = useState(false);

  const [ errorMessage, setErrorMessage ] = useState('');

  const [ showAuth, setShowAuth ] = useState(false);
  const toggleAuth = () => setShowAuth(!showAuth);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      history.push('/');
      dispatch({
        type: 'ADD',
        level: 'error',
        message: 'You must log in to view that page.',
      });
    }
  }, [history, dispatch]);

  const handleSumit = async (e) => {
    try {
      e.preventDefault();
      setErrorMessage('');
      setInvalidSipRealm(false);
      setInvalidRegWebhook(false);
      setInvalidUser(false);
      setInvalidPassword(false);
      let errorMessages = [];
      let focusHasBeenSet = false;

      if (!sipRealm) {
        errorMessages.push('Please enter a SIP Realm or click the link below to skip this step.');
        setInvalidSipRealm(true);
        if (!focusHasBeenSet) {
          refSipRealm.current.focus();
          focusHasBeenSet = true;
        }
      }

      if (!regWebhook) {
        errorMessages.push('Please enter a Registration Webhook or click the link below to skip this step.');
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

      // Get Account SID in order to update it
      const account = await axios({
        method: 'get',
        baseURL: process.env.REACT_APP_API_BASE_URL,
        url: '/Accounts',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const { account_sid } = account.data[0];

      await axios({
        method: 'put',
        baseURL: process.env.REACT_APP_API_BASE_URL,
        url: `/Accounts/${account_sid}`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        data: {
          sip_realm: sipRealm,
          registration_hook: {
            url: regWebhook,
            method: method,
            username: user || null,
            password: password || null,
          },
        },
      });

      history.push('/create-application');

    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        sessionStorage.clear();
        history.push('/');
        dispatch({
          type: 'ADD',
          level: 'error',
          message: 'Your session has expired. Please log in and try again',
        });
      } else {
        setErrorMessage('Something went wrong, please try again');
        console.log(err);
      }
    }
  };

  return (
    <SetupTemplate
      title="Configure Account"
      progress={1}
    >
      <Form
        large
        onSubmit={handleSumit}
      >
        <Label htmlFor="sipRealm">SIP Realm</Label>
        <Input
          large
          name="sipRealm"
          id="sipRealm"
          value={sipRealm}
          onChange={e => setSipRealm(e.target.value)}
          placeholder="The domain name that SIP devices will register with"
          invalid={invalidSipRealm}
          autoFocus
          ref={refSipRealm}
        />

        <Label htmlFor="regWebhook">Registration Webhook</Label>
        <InputGroup>
          <Input
            large
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
            large
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
              large
              name="user"
              id="user"
              value={user}
              onChange={e => setUser(e.target.value)}
              invalid={invalidUser}
              ref={refUser}
            />
            <Label htmlFor="password" middle>Password</Label>
            <PasswordInput
              large
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
        <Button large grid fullWidth>
          Save and Continue
        </Button>

        <Link
          formLink
          right
          to="/create-application"
        >
          Skip for now &mdash; I'l complete later
        </Link>

      </Form>
    </SetupTemplate>
  );
};

export default ConfigureAccount;
