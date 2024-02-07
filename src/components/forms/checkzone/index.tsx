import React, { useState, useEffect, forwardRef } from "react";
import { classNames } from "@jambonz/ui-kit";

import "./styles.scss";

type CheckzoneProps = {
  id?: string;
  name: string;
  label: string;
  labelNode?: React.ReactNode;
  hidden?: boolean;
  children: React.ReactNode;
  initialCheck: boolean;
  disabled?: boolean;
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
      labelNode,
      hidden = false,
      children,
      initialCheck,
      handleChecked,
      disabled = false,
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
          <div className="label-container">
            <input
              disabled={disabled}
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
            {label && <div>{label}</div>}
            {labelNode && labelNode}
          </div>
        </label>
        {checked && <div className={classesIn}>{children}</div>}
      </div>
    );
  }
);

Checkzone.displayName = "Checkzone";
