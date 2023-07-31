import { Button, H1, MS } from "@jambonz/ui-kit";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { putActivationCode } from "src/api";
import { getToken, parseJwt } from "src/router/auth";
import {
  ROUTE_REGISTER_EMAIL,
  ROUTE_REGISTER_SUB_DOMAIN,
} from "src/router/routes";
import { toastError } from "src/store";
import { UserData } from "src/store/types";

export const EmailVerify = () => {
  const [code, setCode] = useState("");
  const userData: UserData = parseJwt(getToken());
  const navigate = useNavigate();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    putActivationCode(code, {
      user_sid: userData.user_sid,
      type: "email",
    })
      .then(() => {
        navigate(ROUTE_REGISTER_SUB_DOMAIN);
      })
      .catch((error) => {
        toastError(error.msg);
      });
  };
  return (
    <>
      <H1 className="h2">Register</H1>

      <form className="form form--login" onSubmit={handleSubmit}>
        <MS>Please enter the code we just sent to your email</MS>
        <input
          required
          type="text"
          name="code"
          placeholder="Verification Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <Button type="submit">Continue →</Button>
        <Link to={ROUTE_REGISTER_EMAIL} title="Go back">
          <p>Go back</p>
        </Link>
      </form>
    </>
  );
};

export default EmailVerify;
