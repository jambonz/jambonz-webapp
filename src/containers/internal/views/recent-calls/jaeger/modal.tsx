import React from "react";
import ReactDOM from "react-dom";

import "./styles.scss";

type CloseProps = {
  children: React.ReactNode;
};

const portal: Element = document.getElementById("modal")!;

export const JaegerModalFullScreen = ({ children }: CloseProps) => {
  return ReactDOM.createPortal(
    <div className="jaegerModal">{children}</div>,
    portal
  );
};
