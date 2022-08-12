import React, { forwardRef } from "react";

import { Icons } from "src/components/icons";

import "./styles.scss";

interface SelectorOption {
  name: string;
  value: string;
}

type SelectorProps = JSX.IntrinsicElements["select"] & {
  options: SelectorOption[];
};

type SelectorRef = HTMLSelectElement;

/** The forwarded ref is so forms can still focus() this select menu if necessary... */
export const Selector = forwardRef<SelectorRef, SelectorProps>(
  ({ id, name, value, options, ...restProps }: SelectorProps, ref) => {
    return (
      <div className="selector">
        <select ref={ref} id={id} name={name} value={value} {...restProps}>
          {options?.map((option) => (
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
