import React, { useEffect, useRef, useState } from "react";

import { LIMITS, LIMIT_UNITS } from "src/api/constants";
import { hasLength } from "src/utils";

import type { Limit, LimitCategories } from "src/api/types";
import { Selector } from "./selector";

type LocalLimitRef = {
  [key in LimitCategories]?: HTMLInputElement;
};

type LocalLimitsProps = {
  data: Limit[] | undefined;
  limits: [Limit[], React.Dispatch<React.SetStateAction<Limit[]>>];
  inputRef?: React.MutableRefObject<LocalLimitRef>;
};

/** Simple wrapper hook since this ref is so specific */
export const useLocalLimitsRef = () => {
  return useRef<LocalLimitRef>({});
};

export const LocalLimits = ({
  data,
  limits: [localLimits, setLocalLimits],
  inputRef,
}: LocalLimitsProps) => {
  const APP_ENABLE_ACCOUNT_LIMITS_ALL = import.meta.env
    .VITE_APP_ENABLE_ACCOUNT_LIMITS_ALL;
  const [unit, setUnit] = useState("session");

  const updateLimitValue = (category: string) => {
    if (hasLength(localLimits)) {
      const limit = localLimits.find((l) => l.category === category);

      return limit ? limit.quantity : "";
    }

    return "";
  };

  useEffect(() => {
    if (hasLength(data)) {
      setLocalLimits(data);
    } else {
      setLocalLimits([]);
    }
  }, [data]);

  return APP_ENABLE_ACCOUNT_LIMITS_ALL ? (
    <>
      <label htmlFor="units">Units</label>
      <Selector
        id="units"
        name="units"
        value={unit}
        options={LIMIT_UNITS}
        onChange={(e) => setUnit(e.target.value)}
      />
      {LIMITS.filter((limit) =>
        unit === "session"
          ? !limit.category.includes("minutes")
          : limit.category.includes("minutes")
      ).map(({ category, label }) => {
        return (
          <React.Fragment key={category}>
            <label htmlFor={category}>{label}</label>
            <input
              ref={(el: HTMLInputElement) => {
                if (inputRef && inputRef.current) {
                  inputRef.current[category] = el;
                }
              }}
              id={category}
              type="number"
              name={category}
              placeholder="Enter quantity (0=unlimited)"
              min="0"
              value={updateLimitValue(category)}
              onChange={(e) => {
                const limit = localLimits.find((l) => l.category === category);
                const value = e.target.value ? Number(e.target.value) : "";

                if (limit) {
                  setLocalLimits(
                    localLimits.map((l) =>
                      l.category === category ? { ...l, quantity: value } : l
                    )
                  );
                } else {
                  setLocalLimits([
                    ...localLimits,
                    { category, quantity: value },
                  ]);
                }
              }}
            />
          </React.Fragment>
        );
      })}
    </>
  ) : (
    <>
      {LIMITS.filter(
        (limit) =>
          !limit.category.includes("license") &&
          !limit.category.includes("minutes")
      ).map(({ category, label }) => {
        return (
          <React.Fragment key={category}>
            <label htmlFor={category}>{label}</label>
            <input
              ref={(el: HTMLInputElement) => {
                if (inputRef && inputRef.current) {
                  inputRef.current[category] = el;
                }
              }}
              id={category}
              type="number"
              name={category}
              placeholder="Enter quantity (0=unlimited)"
              min="0"
              value={updateLimitValue(category)}
              onChange={(e) => {
                const limit = localLimits.find((l) => l.category === category);
                const value = e.target.value ? Number(e.target.value) : "";

                if (limit) {
                  setLocalLimits(
                    localLimits.map((l) =>
                      l.category === category ? { ...l, quantity: value } : l
                    )
                  );
                } else {
                  setLocalLimits([
                    ...localLimits,
                    { category, quantity: value },
                  ]);
                }
              }}
            />
          </React.Fragment>
        );
      })}
    </>
  );
};
