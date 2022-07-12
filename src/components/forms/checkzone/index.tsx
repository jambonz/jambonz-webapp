import React, { useState, useEffect, forwardRef } from "react";
import { classNames } from "jambonz-ui";

import "./styles.scss";

type CheckzoneProps = {
  id?: string;
  name: string;
  label: string;
  hidden?: boolean;
  children: React.ReactNode;
  initialCheck: boolean;
  handleChecked?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

type CheckzoneRef = HTMLInputElement;

/** The forwarded ref is so forms can still focus() this checkbox field if necessary... */
export const Checkzone = forwardRef<CheckzoneRef, CheckzoneProps>(
  (
    {
      id,
      name,
      label,
      hidden = false,
      children,
      initialCheck,
      handleChecked,
    }: CheckzoneProps,
    ref
  ) => {
    const [checked, setChecked] = useState(false);
    const classesTop = classNames({
      checkzone: true,
      "checkzone--hidden": hidden,
    });
    const classesIn = classNames({
      checkzone__managed: true,
      active: checked,
    });

    /** Handle initial checked condition */
    useEffect(() => {
      setChecked(initialCheck);
    }, [initialCheck]);

    return (
      <div className={classesTop}>
        <label>
          <input
            ref={ref}
            type="checkbox"
            name={name}
            id={id || name}
            onChange={(e) => {
              setChecked(e.target.checked);

              if (handleChecked) {
                handleChecked(e);
              }
            }}
            checked={checked}
          />
          <div>{label}</div>
        </label>
        <div className={classesIn}>{children}</div>
      </div>
    );
  }
);

Checkzone.displayName = "Checkzone";
