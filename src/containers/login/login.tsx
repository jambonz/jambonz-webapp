import React, { useEffect, useState } from "react";
import { Button, H1 } from "jambonz-ui";
import { useLocation, Navigate } from "react-router-dom";

import { toastError, toastSuccess, useSelectState } from "src/store";
import { useAuth } from "src/router/auth";
import {
  SESS_FLASH_MSG,
  SESS_OLD_PASSWORD,
  MSG_LOGGED_OUT,
} from "src/constants";
import { Passwd, Message } from "src/components/forms";
import {
  ROUTE_INTERNAL_ACCOUNTS,
  ROUTE_CREATE_PASSWORD,
  ROUTE_INTERNAL_APPLICATIONS,
} from "src/router/routes";
import { USER_ACCOUNT } from "src/api/constants";

export const Login = () => {
  const { signin, authorized } = useAuth();
  const location = useLocation();
  const user = useSelectState("user");
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
    const flashMsg = sessionStorage.getItem(SESS_FLASH_MSG);

    if (flashMsg) {
      const toastMethod =
        flashMsg === MSG_LOGGED_OUT ? toastSuccess : toastError;
      toastMethod(flashMsg);
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
        to={
          user?.scope !== USER_ACCOUNT
            ? ROUTE_INTERNAL_ACCOUNTS
            : ROUTE_INTERNAL_APPLICATIONS
        }
        state={{ from: location }}
        replace
      />
    );
  }

  return (
    <>
      <H1 className="h2">Log in</H1>
      <form className="form form--login" onSubmit={handleSubmit}>
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
