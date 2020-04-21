import React, { useState, useEffect, useContext, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { NotificationDispatchContext } from '../../contexts/NotificationContext';
import SetupTemplate from '../../templates/SetupTemplate';
import Form from '../../elements/Form';
import Button from '../../elements/Button';
import Input from '../../elements/Input';
import FormError from '../../blocks/FormError';

const CreatePassword = () => {
  let history = useHistory();
  const dispatch = useContext(NotificationDispatchContext);

  // Refs
  const refPassword = useRef(null);
  const refPasswordConfirm = useRef(null);

  // Form inputs
  const [ password,        setPassword        ] = useState('');
  const [ passwordConfirm, setPasswordConfirm ] = useState('');

  // Invalid form inputs
  const [ invalidPassword,        setInvalidPassword        ] = useState(false);
  const [ invalidPasswordConfirm, setInvalidPasswordConfirm ] = useState(false);

  const [ errorMessage, setErrorMessage ] = useState('');

  // Handle Password visibility
  // (not using PasswordInput because need to manage if password is visible here
  // because showing password hides passwordConfirm input)
  const [ showPassword, setShowPassword ] = useState(false);
  const toggleShowPassword = () => setShowPassword(!showPassword);

  useEffect(() => {
    if (!sessionStorage.getItem('user_sid')) {

      if (localStorage.getItem('token')) {
        history.push('/internal/accounts');
        dispatch({
          type: 'ADD',
          level: 'error',
          message: 'That page is only accessible during setup',
        });
        return;
      }

      history.push('/');
      dispatch({
        type: 'ADD',
        level: 'error',
        message: 'You must log in to view that page.',
      });
    }
  }, [history, dispatch]);

  const handleSubmit = async e => {
    try {
      e.preventDefault();
      setErrorMessage('');
      setInvalidPassword(false);
      setInvalidPasswordConfirm(false);

      if (!password) {
        setErrorMessage('Please provide a password');
        setInvalidPassword(true);
        if (!passwordConfirm) {
          setInvalidPasswordConfirm(true);
        }
        refPassword.current.focus();
        return;
      }

      if (!showPassword && !passwordConfirm) {
        setErrorMessage('Both fields are required');
        setInvalidPasswordConfirm(true);
        refPasswordConfirm.current.focus();
        return;
      }

      if (!showPassword && password !== passwordConfirm) {
        setErrorMessage('Passwords do not match');
        setInvalidPassword(true);
        setInvalidPasswordConfirm(true);
        refPassword.current.focus();
        return;
      }

      if (
        (password.length < 6) ||
        (!/\d/.test(password)) ||
        (!/[a-zA-Z]/.test(password))
      ) {
        setErrorMessage(
          <div>
            Password must:
            <ul>
              <li>Be at least 6 characters</li>
              <li>Contain at least one letter</li>
              <li>Contain at least one number</li>
            </ul>
          </div>
        );
        setInvalidPassword(true);
        setInvalidPasswordConfirm(true);
        refPassword.current.focus();
        return;
      }

      const user_sid = sessionStorage.getItem('user_sid');
      const old_password = sessionStorage.getItem('old_password');

      if (!old_password) {
        history.push('/');
        dispatch({
          type: 'ADD',
          level: 'error',
          message: 'Your session has expired. Please log in again',
        });
        return;
      }

      const response = await axios({
        method: 'put',
        baseURL: process.env.REACT_APP_API_BASE_URL,
        url: `/Users/${user_sid}`,
        data: {
          old_password,
          new_password: password,
        },
      });

      sessionStorage.removeItem('user_sid');
      sessionStorage.removeItem('old_password');

      if (response.data.user_sid) {
        localStorage.setItem('token', response.data.token);
      }

      history.push('/configure-account');

    } catch(err) {
      console.log(err);
      localStorage.clear();
      sessionStorage.clear();
      history.push('/');
      setErrorMessage('something went wrong, please log in and try again');
    }
  };

  return (
    <SetupTemplate
      title="Create Password"
      subtitle="You must create a new password"
    >
      <Form onSubmit={handleSubmit}>
        <Input
          large
          allowShowPassword={showPassword}
          showPassword={showPassword}
          toggleShowPassword={toggleShowPassword}
          type={showPassword ? "text" : "password"}
          name="password"
          id="password"
          placeholder="New Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => {
            if (!showPassword && e.getModifierState('CapsLock')) {
              setErrorMessage('CAPSLOCK is enabled!');
            } else {
              setErrorMessage('');
            }
          }}
          ref={refPassword}
          invalid={invalidPassword}
          autoFocus
        />
        {!showPassword && (
          <Input
            large
            allowShowPassword
            showPassword={showPassword}
            toggleShowPassword={toggleShowPassword}
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            placeholder="Confirm New Password"
            value={passwordConfirm}
            onChange={e => setPasswordConfirm(e.target.value)}
            onKeyDown={e => {
              if (!showPassword && e.getModifierState('CapsLock')) {
                setErrorMessage('CAPSLOCK is enabled!');
              } else {
                setErrorMessage('');
              }
            }}
            ref={refPasswordConfirm}
            invalid={invalidPasswordConfirm}
          />
        )}
        {errorMessage && (
          <FormError message={errorMessage} />
        )}
        <Button
          large
          fullWidth
        >
          Create Password
        </Button>
      </Form>
    </SetupTemplate>
  );
};

export default CreatePassword;
