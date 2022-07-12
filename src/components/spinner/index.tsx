import React from "react";
import { classNames } from "jambonz-ui";

import "./styles.scss";

type SpinnerProps = {
  small?: boolean;
};

export const Spinner = ({ small = false }: SpinnerProps) => {
  const classes = {
    spinner: true,
    "spinner--small": small,
  };

  return (
    <div className={classNames(classes)}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};
