import { Button, H1, MS } from "@jambonz/ui-kit";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ROUTE_REGISTER_EMAIL } from "src/router/routes";

export const EmailVerify = () => {
  const [code, setCode] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
