import React from "react";
import { classNames } from "jambonz-ui";

import { Icons } from "src/components";

import type { Toast as ToastType } from "src/store/types";

import "./styles.scss";

export const Toast = ({ type, message }: ToastType) => {
  const classes = classNames({
    toast: true,
    [`toast--${type}`]: true,
  });

  return (
    <div className={classes}>
      <div className="toast__box">
        {type === "error" ? <Icons.AlertCircle /> : <Icons.Info />}
        {message}
      </div>
    </div>
  );
};
