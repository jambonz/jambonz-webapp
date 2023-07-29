import { Button, H1 } from "@jambonz/ui-kit";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { postChangepassword, postSignIn } from "src/api";
import { Message, Passwd } from "src/components/forms";
import { setToken } from "src/router/auth";
import { ROUTE_INTERNAL_ACCOUNTS } from "src/router/routes";
import { toastError, toastSuccess } from "src/store";

export const ResetPassword = () => {
  const params = useParams();
  const resetId = params.id;
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isDisableSubmitButton, setIsDisableSubmitButton] = useState(false);
  const [message, setMessage] = useState("");
  const [accountSid, setAccountSid] = useState("");
  const navigate = useNavigate();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (newPassword !== confirmNewPassword) {
      setMessage(
        "The confirmation password does not match the new password. Please ensure both passwords are identical."
      );
      return;
    }
    if (newPassword.length < 6) {
      setMessage("The password must be at least 7 characters long.");
      return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      setMessage(
        "The password must include one special character (such as @, $, !, %, *, ?, &)."
      );
      return;
    }

    if (!/[a-zA-Z]/.test(newPassword)) {
      setMessage("Password must contain a letter.");
    }

    setIsDisableSubmitButton(true);
    postChangepassword({
      old_password: resetId,
      new_password: newPassword,
    })
      .then(() => {
        toastSuccess("New password was successfully set.");
        navigate(`${ROUTE_INTERNAL_ACCOUNTS}/${accountSid}/edit`);
      })
      .catch((error) => {
        toastError(error.msg);
      });
  };

  useEffect(() => {
    postSignIn({
      link: resetId,
    })
      .then(({ json }) => {
        setToken(json.jwt || "");
        setAccountSid(json.account_sid || "");
      })
      .catch((error) => toastError(error.msg));
  }, []);
  return (
    <>
      <H1 className="h2">Reset Password</H1>
      <form className="form form--login" onSubmit={handleSubmit}>
        <label htmlFor="new_password">New password</label>
        <Passwd
          id="new_password"
          name="new_password"
          value={newPassword}
          placeholder="New password"
          required
          onChange={(e) => {
            setNewPassword(e.target.value);
          }}
        />

        <label htmlFor="confirm_new_password">Confirm new password</label>
        <Passwd
          id="confirm_new_password"
          name="confirm_new_password"
          value={confirmNewPassword}
          placeholder="Confirm new password"
          required
          onChange={(e) => {
            setConfirmNewPassword(e.target.value);
          }}
        />

        {message && <Message message={message} />}
        <Button type="submit" disabled={isDisableSubmitButton}>
          Save
        </Button>
      </form>
    </>
  );
};

export default ResetPassword;
