import React, { useEffect, useState } from "react";
import { getBlob } from "src/api";
import { DownloadedBlob } from "src/api/types";

type DownloadRecordProps = {
  call_sid: string;
  url: string;
};

export const DownloadRecord = ({ url, call_sid }: DownloadRecordProps) => {
  const [record, setRecord] = useState<DownloadedBlob | null>(null);
  useEffect(() => {
    getBlob(url).then(({ blob }) => {
      if (blob) {
        setRecord({
          data_url: URL.createObjectURL(blob),
          file_name: `callid-${call_sid}.raw`,
        });
      }
    });
  }, []);

  if (record) {
    return (
      <a
        href={record.data_url}
        download={record.file_name}
        className="btn btn--small pcap"
      >
        Download record
      </a>
    );
  }

  return null;
};

export default DownloadRecord;
