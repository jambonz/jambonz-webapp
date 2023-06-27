import { Button, H1 } from "@jambonz/ui-kit";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Passwd } from "src/components/forms";
import { ROUTE_LOGIN } from "src/router/routes";

export const RegisterEmail = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };
  return (
    <>
      <H1 className="h2">Register</H1>

      <form className="form form--login" onSubmit={handleSubmit}>
        <input
          required
          type="text"
          name="username"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
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
        <Link to={ROUTE_LOGIN} title="Forgot Password">
          <p>Go back</p>
        </Link>
      </form>
    </>
  );
};

export default RegisterEmail;
