import React, { useEffect, useState } from "react";
import { Button, H1 } from "@jambonz/ui-kit";
import { useLocation, Navigate, Link } from "react-router-dom";

import { getToken, parseJwt, useAuth } from "src/router/auth";
import {
  SESS_FLASH_MSG,
  SESS_OLD_PASSWORD,
  MSG_LOGGED_OUT,
} from "src/constants";
import { Passwd, Message } from "src/components/forms";
import {
  ROUTE_INTERNAL_ACCOUNTS,
  ROUTE_CREATE_PASSWORD,
  ROUTE_FORGOT_PASSWORD,
  ROUTE_REGISTER,
} from "src/router/routes";
import {
  USER_ACCOUNT,
  ENABLE_FORGOT_PASSWORD,
  ENABLE_HOSTED_SYSTEM,
} from "src/api/constants";
import { Icons } from "src/components";
import { v4 as uuid } from "uuid";
import { setLocationBeforeOauth, setOauthState } from "src/store/localStore";
import { getGithubOauthUrl, getGoogleOauthUrl } from "./utils";
import { UserData } from "src/store/types";
import { useToast } from "src/components/toast/toast-provider";

export const Login = () => {
  const { toastSuccess, toastError } = useToast();
  const state = uuid();
  setOauthState(state);
  setLocationBeforeOauth("/sign-in");
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
    const userData: UserData = parseJwt(getToken());
    return (
      <Navigate
        to={
          userData?.scope !== USER_ACCOUNT
            ? ROUTE_INTERNAL_ACCOUNTS
            : `${ROUTE_INTERNAL_ACCOUNTS}/${userData.account_sid}/edit`
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
          ignorePasswordManager={false}
        />
        {message && <Message message={message} />}
        <Button type="submit">Log in</Button>
        {(ENABLE_FORGOT_PASSWORD || ENABLE_HOSTED_SYSTEM) && (
          <div className={ENABLE_HOSTED_SYSTEM ? "mast" : ""}>
            {ENABLE_HOSTED_SYSTEM && (
              <Link to={ROUTE_REGISTER} title="Forgot Password">
                <p>Register</p>
              </Link>
            )}
            {ENABLE_FORGOT_PASSWORD && (
              <Link to={ROUTE_FORGOT_PASSWORD} title="Forgot Password">
                <p>Forgot Password</p>
              </Link>
            )}
          </div>
        )}
        {ENABLE_HOSTED_SYSTEM && (
          <>
            <a href={getGoogleOauthUrl(state)} className="btn btn--hollow">
              <div className="mast">
                <Icons.Youtube />
                <span>Sign In With Google</span>
              </div>
            </a>
            <a href={getGithubOauthUrl(state)} className="btn btn--hollow">
              <div className="mast">
                <Icons.GitHub />
                <span>Sign In With Github</span>
              </div>
            </a>
          </>
        )}
      </form>
    </>
  );
};

export default Login;
