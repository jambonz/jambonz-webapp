import dayjs from "dayjs";
import React, { useState } from "react";
import { Alert } from "src/api/types";
import { Icons } from "src/components";

type AlertDetailsItemProps = {
  alert: Alert;
};

export const AlertDetailItem = ({ alert }: AlertDetailsItemProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="item">
      <details
        className="clean"
        onToggle={(e: React.BaseSyntheticEvent) => {
          if (e.target.open && !open) {
            setOpen(e.target.open);
          }
        }}
      >
        <summary className="txt--jam">
          <div className="item__info">
            <div className="item__title">
              <strong>
                {dayjs(alert.time).format("YYYY MM.DD hh:mm:ss a")}
              </strong>
            </div>
            <div className="item__meta">
              <div>
                <div className="i txt--teal">
                  <Icons.AlertCircle />
                  <span>{alert.message}</span>
                </div>
              </div>
            </div>
          </div>
        </summary>
        <div className="item__details">
          <div className="pre-grid">
            {Object.keys(alert).map((key) => (
              <React.Fragment key={key}>
                <div>{key}:</div>
                <div>
                  {alert[key as keyof typeof alert]
                    ? String(alert[key as keyof typeof alert])
                    : "null"}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </details>
    </div>
  );
};

export default AlertDetailItem;
