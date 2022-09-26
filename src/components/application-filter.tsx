import React, { useState } from "react";
import { classNames } from "jambonz-ui";

import { Icons } from "src/components/icons";
import { sortLocaleName } from "src/utils";

import type { Application } from "src/api/types";

export type ApplicationFilterProps = JSX.IntrinsicElements["select"] & {
  label?: string;
  application: [string, React.Dispatch<React.SetStateAction<string>>];
  applications?: Application[];
  defaultOption?: string;
};

export const ApplicationFilter = ({
  label = "Application",
  application: [applicationSid, setApplicationSid],
  applications,
  defaultOption,
}: ApplicationFilterProps) => {
  const [focus, setFocus] = useState(false);
  const classes = {
    smsel: true,
    "smsel--filter": true,
    "application-filter": true,
    focused: focus,
  };

  return (
    <div className={classNames(classes)}>
      <label htmlFor="application_filter">{label}:</label>
      <div>
        <select
          id="application_filter"
          name="application_filter"
          value={applicationSid}
          onChange={(e) => setApplicationSid(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
        >
          {defaultOption && <option value="">{defaultOption}</option>}
          {applications &&
            applications.sort(sortLocaleName).map((app) => {
              return (
                <option key={app.application_sid} value={app.application_sid}>
                  {app.name}
                </option>
              );
            })}
        </select>
        <span>
          <Icons.ChevronUp />
          <Icons.ChevronDown />
        </span>
      </div>
    </div>
  );
};
