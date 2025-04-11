import React, { useState, forwardRef } from "react";

import { Icons } from "src/components/icons";

import "./styles.scss";

type PasswdProps = JSX.IntrinsicElements["input"] & {
  locked?: boolean;
  /** This is optional in case an onChange override is necessary... */
  setValue?: React.Dispatch<React.SetStateAction<string>>;
  /** Whether to ignore password managers */
  ignorePasswordManager?: boolean;
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
      ignorePasswordManager = true,
      ...restProps
    }: PasswdProps,
    ref,
  ) => {
    const [reveal, setReveal] = useState(false);

    // Create object with conditional password manager attributes
    const passwordManagerAttributes = ignorePasswordManager
      ? {
          "data-lpignore": "true",
          "data-1p-ignore": "",
          "data-form-type": "other",
          "data-bwignore": "",
        }
      : {};

    return (
      <div className="passwd">
        <input
          autoComplete="off"
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
          {...passwordManagerAttributes}
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
