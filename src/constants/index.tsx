import React from "react";

export const TOAST_TIME = 5000;
export const SESS_FLASH_MSG = "SESS_FLASH_MSG";
export const SESS_USER_SID = "SESS_USER_SID";
export const SESS_OLD_PASSWORD = "SESS_OLD_PASSWORD";
export const MSG_SESS_EXPIRED =
  "Your session has expired. Please log in and try again.";
export const MSG_SOMETHING_WRONG = "Something went wrong, please try again";
export const MSG_INCORRECT_CREDS = "Login credentials are incorrect";
export const MSG_CAPSLOCK = "CAPSLOCK is enabled!";
export const MSG_PASSWD_MATCH = "Passwords do not match";
export const MSG_SERVER_DOWN = "The server cannot be reached";
export const MSG_LOGGED_OUT = "You've successfully logged out.";
export const MSG_MUST_LOGIN = "You must log in to view that page";
export const MSG_REQUIRED_FIELDS = (
  <>
    Fields marked with an asterisk<span>*</span> are required.
  </>
);
export const MSG_WEBHOOK_FIELDS = (
  <>
    When using HTTP basic authentication both the <span>username</span> and{" "}
    <span>password</span> fields are required.
  </>
);
