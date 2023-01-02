import React, { useState } from "react";
import { Button, H1, M } from "jambonz-ui";
import { useNavigate } from "react-router-dom";

import { isValidPasswd } from "src/utils";
import { putUser, useApiData } from "src/api";
import { PasswordSettings, StatusCodes } from "src/api/types";
import { Passwd, Message } from "src/components/forms";
import {
  ROUTE_LOGIN,
  ROUTE_INTERNAL_ACCOUNTS,
  ROUTE_INTERNAL_APPLICATIONS,
} from "src/router/routes";
import {
  SESS_OLD_PASSWORD,
  SESS_USER_SID,
  MSG_SOMETHING_WRONG,
  MSG_CAPSLOCK,
  MSG_PASSWD_MATCH,
  MSG_PASSWD_CRITERIA,
} from "src/constants";

import type { IMessage } from "src/store/types";
import { USER_ACCOUNT } from "src/api/constants";
import { getToken, parseJwt } from "src/router/auth";

export const CreatePassword = () => {
  const [passwdSettings] = useApiData<PasswordSettings>("PasswordSettings");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<IMessage>("");
  const navigate = useNavigate();

  const handleKeydown = (e: React.KeyboardEvent) => {
    if (e.getModifierState("CapsLock")) {
      setMessage(MSG_CAPSLOCK);
    } else {
      setMessage("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");

    if (password !== confirmPassword) {
      setMessage(MSG_PASSWD_MATCH);
      return;
    }

    if (passwdSettings && !isValidPasswd(password, passwdSettings)) {
      setMessage(MSG_PASSWD_CRITERIA);
      return;
    }

    const userSid = sessionStorage.getItem(SESS_USER_SID);
    const oldPassword = sessionStorage.getItem(SESS_OLD_PASSWORD);
    const token = getToken();
    const userData = parseJwt(token);

    if (!oldPassword) {
      navigate(ROUTE_LOGIN);
      return;
    }

    if (userSid) {
      putUser(userSid, {
        old_password: oldPassword,
        new_password: password,
      })
        .then((response) => {
          if (response.status === StatusCodes.NO_CONTENT) {
            sessionStorage.clear();

            navigate(
              userData.scope !== USER_ACCOUNT
                ? ROUTE_INTERNAL_ACCOUNTS
                : ROUTE_INTERNAL_APPLICATIONS
            );
          } else {
            setMessage(MSG_SOMETHING_WRONG);
          }
        })
        .catch((error) => {
          setMessage(error.msg);
        });
    } else {
      setMessage(MSG_SOMETHING_WRONG);
    }
  };

  return (
    <>
      <H1 className="h2">Create password</H1>
      <form className="form form--login" onSubmit={handleSubmit}>
        <M>You must create a new password</M>
        <Passwd
          locked
          required
          name="password"
          value={password}
          placeholder="New password"
          setValue={setPassword}
          onKeyDown={handleKeydown}
        />
        <Passwd
          required
          name="confirmPassword"
          value={confirmPassword}
          placeholder="Confirm new password"
          setValue={setConfirmPassword}
          onKeyDown={handleKeydown}
        />
        {message && <Message message={message} />}
        <Button type="submit">Create password</Button>
      </form>
    </>
  );
};

export default CreatePassword;
