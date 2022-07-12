import React, { useState } from "react";
import { classNames } from "jambonz-ui";

import { Icons } from "src/components/icons";

import type { Dispatch, SetStateAction } from "react";
import type { Application } from "src/api/types";

type SelectorProps = JSX.IntrinsicElements["select"] & {
  application: [string, Dispatch<SetStateAction<string>>];
  applications?: Application[];
};

export const ApplicationSelect = ({
  application: [applicationSid, setApplicationSid],
  applications,
}: SelectorProps) => {
  const [focus, setFocus] = useState(false);
  const classes = {
    smsel: true,
    "smsel--filter": true,
    "application-select": true,
    focused: focus,
  };

  return (
    <div className={classNames(classes)}>
      <label htmlFor="application_select">Application:</label>
      <select
        name="application_select"
        value={applicationSid}
        onChange={(e) => setApplicationSid(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
      >
        <option value="">Choose application</option>
        {applications &&
          applications
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((app) => {
              return (
                <option key={app.application_sid} value={app.application_sid}>
                  {app.name}
                </option>
              );
            })}
        <option value="none">None</option>
      </select>
      <span>
        <Icons.ChevronUp />
        <Icons.ChevronDown />
      </span>
    </div>
  );
};
