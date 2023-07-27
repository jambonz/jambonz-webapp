import React from "react";
import { useNavigate } from "react-router-dom";

import { Icons } from "src/components/icons";

type EditBoardProps = {
  id?: string;
  name?: string;
  text: string;
  path: string;
  title?: string;
};

export const EditBoard = ({
  text,
  id = "",
  name = "",
  path,
  title,
}: EditBoardProps) => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(path);
  };

  return (
    <div className="clipboard inpbtn">
      <input id={id} name={name} type="text" readOnly value={text} />
      <button
        className="btnty"
        type="button"
        title={title ? title : "Edit"}
        onClick={handleClick}
      >
        <Icons.Edit />
      </button>
    </div>
  );
};
