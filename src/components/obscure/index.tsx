import React, { useState } from "react";

import { Icons } from "src/components/icons";
import { getObscured } from "src/utils";

import "./styles.scss";

type ObscureProps = {
  text: string;
};

export const Obscure = ({ text }: ObscureProps) => {
  const [reveal, setReveal] = useState(false);
  const obscured = getObscured(text);

  return (
    <div className="obscure">
      <span>{reveal ? text : obscured}</span>
      <button
        className="btn--type"
        type="button"
        onClick={() => setReveal(!reveal)}
      >
        {reveal ? <Icons.EyeOff /> : <Icons.Eye />}
      </button>
    </div>
  );
};
