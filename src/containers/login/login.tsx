import React, { useState, useEffect } from "react";
import { Button, H1 } from "jambonz-ui";
import { useLocation, Navigate } from "react-router-dom";

import { toastError } from "src/store";
import { useAuth } from "src/router/auth";
import { SESS_UNAUTHORIZED, SESS_OLD_PASSWORD } from "src/constants";
import { Passwd, Message } from "src/components/forms";
import {
  ROUTE_INTERNAL_ACCOUNTS,
  ROUTE_CREATE_PASSWORD,
} from "src/router/routes";

import "./styles.scss";

export const Login = () => {
  const { signin, authorized } = useAuth();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    signin(username, password).catch((error) => {
      setMessage(error);
    });
  };

  /** "Flash" a session message when booted from the app */
  useEffect(() => {
    const unauthorized = sessionStorage.getItem(SESS_UNAUTHORIZED);

    if (unauthorized) {
      toastError(unauthorized);
      sessionStorage.clear();
    }
  }, []);

  if (authorized) {
    if (sessionStorage.getItem(SESS_OLD_PASSWORD)) {
      return (
        <Navigate
          to={ROUTE_CREATE_PASSWORD}
          state={{ from: location }}
          replace
        />
      );
    }

    return (
      <Navigate
        to={ROUTE_INTERNAL_ACCOUNTS}
        state={{ from: location }}
        replace
      />
    );
  }

  return (
    <>
      <H1>Log in</H1>
      <form onSubmit={handleSubmit}>
        <input
          required
          type="text"
          name="username"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Passwd
          required
          name="password"
          value={password}
          placeholder="Password"
          setValue={setPassword}
        />
        {message && <Message message={message} />}
        <Button type="submit">Log in</Button>
      </form>
    </>
  );
};

export default Login;
