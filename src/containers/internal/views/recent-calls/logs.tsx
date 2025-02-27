import React, { useEffect, useState } from "react";
import { DownloadedBlob } from "src/api/types";

export default function CallRecentLogsButton({
  call_sid,
  logs,
}: {
  call_sid: string;
  logs: string[];
}) {
  const [log, setLog] = useState<DownloadedBlob | null>(null);

  useEffect(() => {
    if (!log && logs.length) {
      setLog({
        data_url: URL.createObjectURL(new Blob(logs, { type: "text/plain" })),
        file_name: `${call_sid}.log`,
      });
    }
  }, [logs]);
  if (log) {
    return (
      <a
        href={log.data_url}
        download={log.file_name}
        className="btn btn--small pcap"
      >
        Download Logs
      </a>
    );
  }

  return null;
}
