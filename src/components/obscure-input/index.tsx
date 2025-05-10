import React, { useState } from "react";
import { Icons } from "src/components/icons";
import "./styles.scss";

interface ObscureInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ObscureInput = ({
  value,
  onChange,
  className = "",
  ...props
}: ObscureInputProps) => {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="passwd">
      <input
        type={revealed ? "text" : "password"}
        value={value}
        onChange={onChange}
        className={className}
        {...props}
      />
      <button
        className="btnty"
        type="button"
        onClick={() => setRevealed(!revealed)}
        aria-label={revealed ? "Hide text" : "Show text"}
      >
        {revealed ? <Icons.EyeOff /> : <Icons.Eye />}
      </button>
    </div>
  );
};

export default ObscureInput;
