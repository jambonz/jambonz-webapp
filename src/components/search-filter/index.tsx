import React, { useState, useCallback, useRef } from "react";
import { classNames } from "@jambonz/ui-kit";

import { Icons } from "src/components/icons";

import "./styles.scss";

type SearchFilterProps = JSX.IntrinsicElements["input"] & {
  filter: [string, React.Dispatch<React.SetStateAction<string>>];
  delay?: number | null;
};

export const SearchFilter = ({
  placeholder,
  filter: [filterValue, setFilterValue],
  delay,
}: SearchFilterProps) => {
  const [focus, setFocus] = useState(false);
  const [tmpFilterValue, setTmpFilterValue] = useState(filterValue);
  const [appearance, setAppearance] = useState(false);
  const typingTimeoutRef = useRef<number | null>(null);
  const classes = {
    "search-filter": true,
    focused: focus,
    appearance,
  };

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTmpFilterValue(e.target.value.toLowerCase());
      if (delay) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
          setFilterValue(e.target.value.toLowerCase());
        }, delay);
      } else {
        setFilterValue(e.target.value.toLowerCase());
      }

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
        value={tmpFilterValue}
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
