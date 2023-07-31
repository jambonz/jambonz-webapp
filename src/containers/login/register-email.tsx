import { Button, H1 } from "@jambonz/ui-kit";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { postRegister } from "src/api";
import { DEFAULT_SERVICE_PROVIDER_SID } from "src/api/constants";
import { Passwd } from "src/components/forms";
import { ROUTE_LOGIN, ROUTE_REGISTER_EMAIL_VERIFY } from "src/router/routes";
import { generateActivationCode } from "./utils";
import { setToken } from "src/router/auth";
import { toastError } from "src/store";
import { setRootDomain } from "src/store/localStore";

export const RegisterEmail = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const email_activation_code = generateActivationCode();
    postRegister({
      service_provider_sid: DEFAULT_SERVICE_PROVIDER_SID,
      provider: "local",
      email,
      password,
      email_activation_code,
      inviteCode: undefined, // reserved for inviteCode.
    })
      .then(({ json }) => {
        setToken(json.jwt);
        setRootDomain(json.root_domain);
        navigate(ROUTE_REGISTER_EMAIL_VERIFY);
      })
      .catch((error) => {
        toastError(error.msg);
      });
  };
  return (
    <>
      <H1 className="h2">Register</H1>

      <form className="form form--login" onSubmit={handleSubmit}>
        <input
          required
          type="text"
          name="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Passwd
          required
          name="password"
          value={password}
          placeholder="Password"
          setValue={setPassword}
        />
        <Button type="submit">Continue →</Button>
        <Link to={ROUTE_LOGIN} title="Go back">
          <p>Go back</p>
        </Link>
      </form>
    </>
  );
};

export default RegisterEmail;
