import React, { useEffect, forwardRef } from "react";

import { Selector } from "src/components/forms";
import { hasLength } from "src/utils";

import type { Application } from "src/api/types";
import type { IMessage } from "src/store/types";

type ApplicationSelectProps = {
  id?: string;
  label?: IMessage;
  application: [string, React.Dispatch<React.SetStateAction<string>>];
  applications?: Application[];
  defaultOption?: string;

  /** Native select element attributes we support */
  required?: boolean;
  disabled?: boolean;
};

type SelectorRef = HTMLSelectElement;

export const ApplicationSelect = forwardRef<
  SelectorRef,
  ApplicationSelectProps
>(
  (
    {
      id = "application_sid",
      label = "Application",
      application: [applicationSid, setApplicationSid],
      applications,
      required = false,
      defaultOption,
      ...restProps
    }: ApplicationSelectProps,
    ref
  ) => {
    useEffect(() => {
      if (hasLength(applications) && !applicationSid && !defaultOption) {
        setApplicationSid(applications[0].application_sid);
      }
    }, [applications, applicationSid, defaultOption]);

    return (
      <>
        <label htmlFor={id}>
          {label} {required && <span>*</span>}
        </label>
        <Selector
          ref={ref}
          id={id}
          name={id}
          required={required}
          value={applicationSid}
          options={(defaultOption
            ? [{ name: defaultOption, value: "" }]
            : []
          ).concat(
            hasLength(applications)
              ? applications.map((application) => ({
                  name: application.name,
                  value: application.application_sid,
                }))
              : []
          )}
          onChange={(e) => setApplicationSid(e.target.value)}
          {...restProps}
        />
      </>
    );
  }
);

ApplicationSelect.displayName = "ApplicationSelect";
