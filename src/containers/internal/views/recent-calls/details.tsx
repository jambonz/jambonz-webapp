import React, { useState } from "react";
import dayjs from "dayjs";

import { Icons } from "src/components";
import { formatPhoneNumber, hasValue } from "src/utils";
import { PcapButton } from "./pcap";
import type { RecentCall } from "src/api/types";
import { Tabs, Tab } from "@jambonz/ui-kit";
import CallDetail from "./call-detail";
import CallTracing from "./call-tracing";
import { DISABLE_JAEGER_TRACING } from "src/api/constants";
import { Player } from "./player";
import "./styles.scss";
import DownloadRecord from "./record";

type DetailsItemProps = {
  call: RecentCall;
};

export const DetailsItem = ({ call }: DetailsItemProps) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("");

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
                {dayjs(call.attempted_at).format("YYYY MM.DD hh:mm a")}
              </strong>
              <span className="i txt--dark">
                {call.direction === "inbound" ? (
                  <Icons.LogIn />
                ) : (
                  <Icons.LogOut />
                )}
                <span>{call.direction}</span>
              </span>
            </div>
            <div className="item__meta">
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
        {call.trace_id === "00000000000000000000000000000000" ||
        DISABLE_JAEGER_TRACING ? (
          <CallDetail call={call} />
        ) : (
          <Tabs active={[activeTab, setActiveTab]}>
            <Tab id="details" label="Details">
              <CallDetail call={call} />
            </Tab>
            <Tab id="tracing" label="Tracing">
              <CallTracing call={call} />
            </Tab>
          </Tabs>
        )}
        {open && (
          <>
            <div className="footer">
              {hasValue(call.recording_url) && (
                <Player url={call.recording_url} />
              )}

              <div className="footer__buttons">
                <PcapButton call={call} />
                {call.recording_url && (
                  <DownloadRecord
                    url={call.recording_url}
                    call_sid={call.call_sid}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </details>
    </div>
  );
};
