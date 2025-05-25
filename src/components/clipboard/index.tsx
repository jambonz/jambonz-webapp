import React from "react";

import { Icons } from "src/components/icons";
import { useToast } from "../toast/toast-provider";

type ClipBoardProps = {
  id?: string;
  name?: string;
  text: string;
};

/** Clipboard support...? */
const hasClipboard = typeof navigator.clipboard !== "undefined";

export const ClipBoard = ({ text, id = "", name = "" }: ClipBoardProps) => {
  const { toastSuccess, toastError } = useToast();
  const handleClick = () => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toastSuccess(
          <>
            <strong>{text}</strong> copied to clipboard
          </>,
        );
      })
      .catch(() => {
        toastError(
          <>
            Unable to copy <strong>{text}</strong>, please select the text and
            right click to copy
          </>,
        );
      });
  };

  return (
    <div className="clipboard inpbtn">
      <input id={id} name={name} type="text" readOnly value={text} />
      {hasClipboard && (
        <button
          className="btnty"
          type="button"
          title="Copy to clipboard"
          onClick={handleClick}
        >
          <Icons.Clipboard />
        </button>
      )}
    </div>
  );
};
