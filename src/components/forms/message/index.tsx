import React from "react";

import { Icons } from "src/components/icons";

import type { IMessage } from "src/store/types";

import "./styles.scss";

type MsgProps = {
  message: IMessage;
};

export const Message = ({ message }: MsgProps) => {
  return (
    <div className="msg">
      <Icons.AlertCircle />
      <span>{message}</span>
    </div>
  );
};
