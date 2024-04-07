import React, { useState } from "react";
import { Button, H1 } from "@jambonz/ui-kit";
import { Message } from "src/components/forms";
import { postForgotPassword } from "src/api";
import { StatusCodes } from "src/api/types";
import { useNavigate } from "react-router-dom";

import { MSG_SOMETHING_WRONG } from "src/constants";

import { ROUTE_LOGIN } from "src/router/routes";
import { toastSuccess } from "src/store";

export const ForgotPassword = () => {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");

    postForgotPassword({ email })
      .then((response) => {
        if (response.status === StatusCodes.NO_CONTENT) {
          toastSuccess(
            "A password reset email has been sent to your email. Please check your inbox (and, possibly, spam folder) and follow the instructions to reset your password.",
          );
          navigate(ROUTE_LOGIN);
        } else {
          setMessage(MSG_SOMETHING_WRONG);
        }
      })
      .catch((error) => {
        setMessage(error.error);
      });
  };
  return (
    <>
      <H1 className="h2">Forgot Password</H1>
      <form className="form form--login" onSubmit={handleSubmit}>
        <span>Enter your email and we will send you a password reset link</span>
        <input
          required
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {message && <Message message={message} />}
        <Button type="submit">Send me a reset password link</Button>
      </form>
    </>
  );
};

export default ForgotPassword;
