import React, { useEffect, useRef, useState } from "react";

import { LIMITS, LIMIT_MINS, LIMIT_SESS, LIMIT_UNITS } from "src/api/constants";
import { hasLength } from "src/utils";

import type { Limit, LimitCategories, LimitUnit } from "src/api/types";
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
  const [unit, setUnit] = useState<Lowercase<LimitUnit>>(LIMIT_SESS);

  const updateLimitValue = (category: string) => {
    if (hasLength(localLimits)) {
      const limit = localLimits.find((l) => l.category === category);

      return limit ? limit.quantity : "";
    }

    return "";
  };

  const filteredLimits = import.meta.env.VITE_APP_ENABLE_ACCOUNT_LIMITS_ALL
    ? LIMITS.filter((limit) =>
        unit === LIMIT_SESS
          ? !limit.category.includes(LIMIT_MINS)
          : limit.category.includes(LIMIT_MINS)
      )
    : LIMITS.filter(
        (limit) =>
          !limit.category.includes("license") &&
          !limit.category.includes(LIMIT_MINS)
      );

  useEffect(() => {
    if (hasLength(data)) {
      setLocalLimits(data);
      setUnit(() => {
        return data.find((l) => l.category.includes(LIMIT_MINS))
          ? LIMIT_MINS
          : LIMIT_SESS;
      });
    } else {
      setLocalLimits([]);
    }
  }, [data]);

  return (
    <>
      {import.meta.env.VITE_APP_ENABLE_ACCOUNT_LIMITS_ALL && (
        <>
          <label htmlFor="units">Units</label>
          <Selector
            id="units"
            name="units"
            value={unit}
            options={LIMIT_UNITS}
            onChange={(e) => setUnit(e.target.value as Lowercase<LimitUnit>)}
          />
        </>
      )}
      {filteredLimits.map(({ category, label }) => {
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
                  console.log([...localLimits, { category, quantity: value }]);
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
