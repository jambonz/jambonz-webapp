import React from "react";

import { Icons } from "../icons";

import type { IMessage } from "src/store/types";

import "./styles.scss";

type TooltipProps = {
  text: IMessage;
  children: React.ReactNode;
};

export const Tooltip = ({ text, children }: TooltipProps) => {
  return (
    <div className="tooltip">
      <div className="tooltip__reveal">{text}</div>
      {children}
      <Icons.HelpCircle />
    </div>
  );
};
