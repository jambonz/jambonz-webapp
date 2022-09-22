import React, { useState, useCallback } from "react";
import { classNames } from "jambonz-ui";

import { Icons } from "src/components/icons";

import "./styles.scss";

type SearchFilterProps = JSX.IntrinsicElements["input"] & {
  filter: [string, React.Dispatch<React.SetStateAction<string>>];
};

export const SearchFilter = ({
  placeholder,
  filter: [filterValue, setFilterValue],
}: SearchFilterProps) => {
  const [focus, setFocus] = useState(false);
  const [appearance, setAppearance] = useState(false);
  const classes = {
    "search-filter": true,
    focused: focus,
    appearance,
  };

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilterValue(e.target.value.toLowerCase());

      if (e.target.value) {
        setAppearance(true);
      } else {
        setAppearance(false);
      }
    },
    [setFilterValue]
  );

  const handleActive = useCallback(() => {
    if (filterValue) {
      setAppearance(true);
    }
  }, [filterValue]);

  const handleInactive = () => {
    setAppearance(false);
  };

  return (
    <div className={classNames(classes)}>
      <Icons.Filter />
      <input
        type="search"
        name="search_filter"
        placeholder={placeholder}
        value={filterValue}
        onChange={handleChange}
        onFocus={() => {
          setFocus(true);
          handleActive();
        }}
        onMouseEnter={handleActive}
        onMouseLeave={handleInactive}
        onBlur={() => {
          setFocus(false);
          handleInactive();
        }}
      />
      <Icons.XCircle />
    </div>
  );
};
