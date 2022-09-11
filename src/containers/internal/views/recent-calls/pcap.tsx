import React, { useEffect, useState } from "react";

import { getPcap, getRecentCall } from "src/api";
import { toastError } from "src/store";

import type { Pcap, RecentCall } from "src/api/types";

type PcapButtonProps = {
  call: RecentCall;
};

export const PcapButton = ({ call }: PcapButtonProps) => {
  const [pcap, setPcap] = useState<Pcap>();

  useEffect(() => {
    getRecentCall(call.account_sid, call.call_sid)
      .then(({ json }) => {
        if (json.total > 0) {
          getPcap(call.account_sid, call.call_sid)
            .then(({ blob }) => {
              if (blob) {
                setPcap({
                  data_url: URL.createObjectURL(blob),
                  file_name: `callid-${call.sip_callid}.pcap`,
                });
              }
            })
            .catch((error) => {
              toastError(error.msg);
            });
        }
      })
      .catch((error) => {
        toastError(error.msg);
      });
  }, []);

  if (pcap) {
    return (
      <a
        href={pcap.data_url}
        download={pcap.file_name}
        className="btn btn--small pcap"
      >
        Download pcap file
      </a>
    );
  }

  return null;
};
