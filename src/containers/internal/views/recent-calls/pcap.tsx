import React, { useEffect, useState } from "react";

import { getPcap } from "src/api";
import { toastError } from "src/store";

import type { DownloadedBlob, RecentCall } from "src/api/types";

type PcapButtonProps = {
  call: RecentCall;
};

export const PcapButton = ({ call }: PcapButtonProps) => {
  const [pcap, setPcap] = useState<DownloadedBlob | null>(null);

  useEffect(() => {
    if (!pcap) {
      getPcap(call.account_sid, call.sip_callid, "invite")
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
  }, []);

  if (pcap) {
    return (
      <a
        href={pcap.data_url}
        download={pcap.file_name}
        className="btn btn--small pcap"
      >
        Download pcap
      </a>
    );
  }

  return null;
};
