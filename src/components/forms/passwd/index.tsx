import React, { useState, forwardRef } from "react";

import { Icons } from "src/components/icons";

import "./styles.scss";

type PasswdProps = JSX.IntrinsicElements["input"] & {
  locked?: boolean;
  /** This is optional in case an onChange override is necessary... */
  setValue?: React.Dispatch<React.SetStateAction<string>>;
};

type PasswdRef = HTMLInputElement;

/** The restProps spread at the end in case an onChange override is necessary... */
/** The forwarded ref is so forms can still focus() this input field if necessary... */
export const Passwd = forwardRef<PasswdRef, PasswdProps>(
  (
    {
      name,
      value,
      setValue,
      placeholder,
      locked = false,
      ...restProps
    }: PasswdProps,
    ref,
  ) => {
    const [reveal, setReveal] = useState(false);

    return (
      <div className="passwd">
        <input
          autoComplete="off"
          data-lpignore=true
          ref={ref}
          type={reveal ? "text" : "password"}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            if (setValue) {
              setValue(e.target.value);
            }
          }}
          {...restProps}
        />
        {!locked && (
          <button
            className="btnty"
            type="button"
            onClick={() => setReveal(!reveal)}
          >
            {reveal ? <Icons.EyeOff /> : <Icons.Eye />}
          </button>
        )}
      </div>
    );
  },
);

Passwd.displayName = "Passwd";
