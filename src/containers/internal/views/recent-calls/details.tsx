import React, { useState } from "react";
import dayjs from "dayjs";

import { Icons } from "src/components";
import { formatPhoneNumber } from "src/utils";
import { PcapButton } from "./pcap";

import type { RecentCall } from "src/api/types";

type DetailsItemProps = {
  call: RecentCall;
};

export const DetailsItem = ({ call }: DetailsItemProps) => {
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
        <summary>
          <div className="item__info">
            <div className="item__title">
              <strong>
                {dayjs
                  .unix(call.attempted_at / 1000)
                  .format("YYYY MM.DD hh:mm a")}
              </strong>
              <span className="ms i txt--grey">
                <Icons.Clock />
                <span>{call.duration}s</span>
              </span>
            </div>
            <div className="item__meta">
              <div>
                <div className="i txt--teal">
                  {call.direction === "inbound" ? (
                    <Icons.LogIn />
                  ) : (
                    <Icons.LogOut />
                  )}
                  <span>{call.direction}</span>
                </div>
              </div>
              <div>
                <div className="i txt--teal">
                  <Icons.PhoneOutgoing />
                  <span>{formatPhoneNumber(call.from)}</span>
                </div>
              </div>
              <div>
                <div className="i txt--teal">
                  <Icons.PhoneIncoming />
                  <span>{formatPhoneNumber(call.to)}</span>
                </div>
              </div>
            </div>
          </div>
        </summary>
        <div className="item__details">
          <div className="pre-grid">
            {Object.keys(call).map((key) => (
              <React.Fragment key={key}>
                <div>{key}:</div>
                <div>
                  {call[key as keyof typeof call].toString().padStart(10)}
                </div>
              </React.Fragment>
            ))}
          </div>
          {open && <PcapButton call={call} />}
        </div>
      </details>
    </div>
  );
};
