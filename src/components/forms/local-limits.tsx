import React, { useEffect, useRef, useState } from "react";

import {
  LIMITS,
  LIMIT_MIN,
  LIMIT_SESS,
  LIMIT_UNITS,
  USER_ADMIN,
} from "src/api/constants";
import { hasLength } from "src/utils";

import type { Limit, LimitCategories, LimitUnit } from "src/api/types";
import { Selector } from "./selector";
import { useSelectState } from "src/store";
import { ScopedAccess } from "../scoped-access";
import { Scope } from "src/store/types";

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
  const user = useSelectState("user");
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
          ? !limit.category.includes(LIMIT_MIN)
          : limit.category.includes(LIMIT_MIN)
      )
    : LIMITS.filter(
        (limit) =>
          !limit.category.includes("license") &&
          !limit.category.includes(LIMIT_MIN)
      );

  useEffect(() => {
    if (hasLength(data)) {
      setLocalLimits(data);
      setUnit(() => {
        return data.find((l) => l.category.includes(LIMIT_MIN))
          ? LIMIT_MIN
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
          <label htmlFor="units">Unit</label>
          <Selector
            id="units"
            name="units"
            value={unit}
            options={LIMIT_UNITS}
            disabled={user && user.scope !== USER_ADMIN}
            onChange={(e) => {
              setUnit(e.target.value as Lowercase<LimitUnit>);
              if (e.target.value !== unit) {
                localLimits.forEach((l) => {
                  if (l.category.includes(unit)) {
                    l.quantity = "";
                  }
                });
              }
            }}
          />
        </>
      )}
      {filteredLimits.map(({ category, label }) => {
        return (
          user && (
            <ScopedAccess
              user={user}
              scope={
                (import.meta.env.VITE_APP_ENABLE_ACCOUNT_LIMITS_ALL &&
                  !category.includes("license") &&
                  Scope.admin) ||
                Scope.account
              }
            >
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
                  disabled={
                    import.meta.env.VITE_APP_ENABLE_ACCOUNT_LIMITS_ALL &&
                    user.scope !== USER_ADMIN
                  }
                  onChange={(e) => {
                    const limit = localLimits.find(
                      (l) => l.category === category
                    );
                    const value = e.target.value ? Number(e.target.value) : "";

                    if (limit) {
                      setLocalLimits(
                        localLimits.map((l) =>
                          l.category === category
                            ? { ...l, quantity: value }
                            : l
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
            </ScopedAccess>
          )
        );
      })}
    </>
  );
};
