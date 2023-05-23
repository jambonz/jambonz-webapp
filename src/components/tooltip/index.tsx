import React from "react";

import { Icons } from "../icons";

import type { IMessage } from "src/store/types";

import "./styles.scss";

type TooltipProps = {
  text: IMessage;
  children: React.ReactNode;
  subStyle?: string;
};

export const Tooltip = ({ text, children, subStyle }: TooltipProps) => {
  return (
    <div className="tooltip">
      <div className="tooltip__reveal">{text}</div>
      {children}
      {subStyle === "info" ? <Icons.Info /> : <Icons.HelpCircle />}
    </div>
  );
};
