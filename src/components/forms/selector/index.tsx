import React, { useState, forwardRef } from "react";
import { classNames } from "@jambonz/ui-kit";

import { Icons } from "src/components/icons";

import "./styles.scss";

export interface SelectorOption {
  name: string;
  value: string;
}

type SelectorProps = JSX.IntrinsicElements["select"] & {
  options: SelectorOption[];
};

type SelectorRef = HTMLSelectElement;

/** The forwarded ref is so forms can still focus() this select menu if necessary... */
export const Selector = forwardRef<SelectorRef, SelectorProps>(
  (
    { id, name, value, options, disabled, ...restProps }: SelectorProps,
    ref
  ) => {
    const [focus, setFocus] = useState(false);
    const classes = {
      selector: true,
      focused: focus,
      disabled: disabled ? true : false,
    };

    return (
      <div className={classNames(classes)}>
        <select
          ref={ref}
          id={id}
          name={name}
          value={value}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          disabled={disabled}
          {...restProps}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.name}
            </option>
          ))}
        </select>
        <span>
          <Icons.ChevronUp />
          <Icons.ChevronDown />
        </span>
      </div>
    );
  }
);

Selector.displayName = "Selector";
