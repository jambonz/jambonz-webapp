/* eslint-disable no-undef */
import React, { useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import SetupTemplate from '../templates/SetupTemplate';
import Form from '../elements/Form';
import Button from '../elements/Button';
import Input from '../elements/Input';
import PasswordInput from '../elements/PasswordInput';
import FormError from '../blocks/FormError';
import { APP_API_BASE_URL } from "../../constants";

const Login = props => {
  let history = useHistory();
  useEffect(() => {
    document.title = `Login | Jambonz | Open Source CPAAS`;
  });

  // Refs
  const refUsername = useRef(null);
  const refPassword = useRef(null);

  // Form inputs
  const [ username,     setUsername     ] = useState('');
  const [ password,     setPassword     ] = useState('');
  const [ errorMessage, setErrorMessage ] = useState('');

  // Invalid form inputs
  const [ invalidUsername, setInvalidUsername ] = useState(false);
  const [ invalidPassword, setInvalidPassword ] = useState(false);

  const handleSubmit = async e => {
    try {
      e.preventDefault();
      setErrorMessage('');
      setInvalidUsername(false);
      setInvalidPassword(false);

      if (!username && !password) {
        setErrorMessage('Username and password are required');
        setInvalidUsername(true);
        setInvalidPassword(true);
        refUsername.current.focus();
        return;
      }
      if (!username) {
        setErrorMessage('Username is required');
        setInvalidUsername(true);
        refUsername.current.focus();
        return;
      }

      if (!password) {
        setErrorMessage('Password is required');
        setInvalidPassword(true);
        refPassword.current.focus();
        return;
      }

      // Log in
      const response = await axios({
        method: 'post',
        baseURL: APP_API_BASE_URL,
        url: '/login',
        data: { username, password },
      });

      // New account, password change required
      if (response.data.force_change) {
        // `user_sid` and `old_password` are needed for the new password form.
        // They're saved to sessionStorage so that the data does not persist.
        sessionStorage.setItem('user_sid', response.data.user_sid);
        sessionStorage.setItem('old_password', password);
        localStorage.setItem('token', response.data.token);
        history.push('/create-password');
        return;
      }

      // Save API key
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      //-----------------------------------------------------------------------------
      // Get account data
      //-----------------------------------------------------------------------------
      const serviceProvidersPromise = axios({
        method: 'get',
        baseURL: APP_API_BASE_URL,
        url: '/serviceProviders',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const accountsPromise = axios({
        method: 'get',
        baseURL: APP_API_BASE_URL,
        url: '/Accounts',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const applicationsPromise = axios({
        method: 'get',
        baseURL: APP_API_BASE_URL,
        url: '/applications',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const voipCarriersPromise = axios({
        method: 'get',
        baseURL: APP_API_BASE_URL,
        url: '/voipCarriers',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const promiseAllValues = await Promise.all([
        serviceProvidersPromise,
        accountsPromise,
        applicationsPromise,
        voipCarriersPromise,
      ]);

      const serviceProviders = promiseAllValues[0].data;
      const accounts         = promiseAllValues[1].data;
      const applications     = promiseAllValues[2].data;
      const voipCarriers     = promiseAllValues[3].data;

      //-----------------------------------------------------------------------------
      // Determine where to route user
      //-----------------------------------------------------------------------------
      if (
        (serviceProviders.length > 1) ||
        (accounts.length         > 1) ||
        (accounts.length         < 1) ||
        (applications.length     > 1) ||
        (voipCarriers.length     > 0)
      ) {
        history.push('/internal/accounts');
        return;
      }

      // const { sip_realm, registration_hook } = accounts[0];

      // if (
      //   (!sip_realm || !registration_hook) &&
      //   !applications.length
      // ) {
      //   history.push('/configure-account');
      //   return;
      // }

      // if (!applications.length) {
      //   history.push('/create-application');
      //   return;
      // }

      history.push('/internal/accounts');

    } catch (err) {
      // 400 --> one or both fields are empty (prevented by above error checking)
      // 403 --> username or password are incorrect
      if (
        err.response
        && err.response.status
        && err.response.status > 399
        && err.response.status < 500
      ) {
        setErrorMessage('Login credentials are incorrect');
      } else {
        setErrorMessage(
          (err.response && err.response.data && err.response.data.msg) ||
          'Something went wrong, please try again.'
        );
        console.log(err.response || err);
      }
    }
  };

  return (
    <SetupTemplate title="Log In">
      <Form onSubmit={handleSubmit}>
        <Input
          large
          fullWidth
          type="text"
          name="username"
          id="username"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          ref={refUsername}
          invalid={invalidUsername}
          autoFocus
        />
        <PasswordInput
          large
          allowShowPassword
          name="password"
          id="password"
          placeholder="Password"
          password={password}
          setPassword={setPassword}
          setErrorMessage={setErrorMessage}
          ref={refPassword}
          invalid={invalidPassword}
        />
        {errorMessage && (
          <FormError message={errorMessage} />
        )}
        <Button
          large
          fullWidth
        >
          Log In
        </Button>
      </Form>
    </SetupTemplate>
  );
};

export default Login;
