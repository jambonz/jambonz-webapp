import React from "react";
import ReactDOM from "react-dom";
import { classNames } from "@jambonz/ui-kit";

import { Icons } from "src/components";

import type { Toast as ToastProps } from "src/store/types";

import "./styles.scss";

const portal: Element = document.getElementById("toast")!;

export const Toast = ({ type, message }: ToastProps) => {
  const classes = classNames({
    toast: true,
    [`toast--${type}`]: true,
  });

  return ReactDOM.createPortal(
    <div className={classes}>
      <div className="toast__box">
        {type === "error" ? <Icons.AlertCircle /> : <Icons.Info />}
        {message}
      </div>
    </div>,
    portal
  );
};
