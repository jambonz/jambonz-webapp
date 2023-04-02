import React, { useEffect, useState } from "react";

import {
  getRecentCall,
  getServiceProviderRecentCall,
  getPcap,
  getServiceProviderPcap,
} from "src/api";
import { toastError } from "src/store";

import type { Pcap } from "src/api/types";

type PcapButtonProps = {
  accountSid: string;
  serviceProviderSid: string;
  sipCallId: string;
};

export const PcapButton = ({
  accountSid,
  serviceProviderSid,
  sipCallId,
}: PcapButtonProps) => {
  const [pcap, setPcap] = useState<Pcap>();

  useEffect(() => {
    const p = accountSid
      ? getRecentCall(accountSid, sipCallId)
      : getServiceProviderRecentCall(serviceProviderSid, sipCallId);
    p.then(({ json }) => {
      if (json.total > 0) {
        const p1 = accountSid
          ? getPcap(accountSid, sipCallId)
          : getServiceProviderPcap(serviceProviderSid, sipCallId);
        p1.then(({ blob }) => {
          if (blob) {
            setPcap({
              data_url: URL.createObjectURL(blob),
              file_name: `callid-${sipCallId}.pcap`,
            });
          }
        }).catch((error) => {
          toastError(error.msg);
        });
      }
    }).catch((error) => {
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
        Download pcap
      </a>
    );
  }

  return null;
};
