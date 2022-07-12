import React, { useState } from "react";
import { classNames } from "jambonz-ui";

import { Icons } from "src/components/icons";

import type { Dispatch, SetStateAction } from "react";
import type { SelectorOption } from "./forms/selector";

type SelectFilterProps = {
  id: string;
  label?: string;
  options: SelectorOption[];
  filter: [string, Dispatch<SetStateAction<string>>];
};

export const SelectFilter = ({
  id,
  label,
  options,
  filter: [filterValue, setFilterValue],
}: SelectFilterProps) => {
  const [focus, setFocus] = useState(false);
  const classes = {
    smsel: true,
    "smsel--filter": true,
    "select-filter": true,
    focused: focus,
  };

  return (
    <div className={classNames(classes)}>
      {label && <label htmlFor={id}>{label}:</label>}
      <div>
        <select
          id={id}
          name={id}
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
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
    </div>
  );
};
