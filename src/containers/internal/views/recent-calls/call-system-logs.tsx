import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { getRecentCallLog } from "src/api";
import { RecentCall } from "src/api/types";
import { Icons, Spinner } from "src/components";
import { toastError, toastSuccess } from "src/store";
import { hasValue } from "src/utils";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

type CallSystemLogsProps = {
  call: RecentCall;
};

// Helper function to format logs
const formatLog = (log: string): string => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsedLog = JSON.parse(log) as any;

    const l = {
      ...parsedLog,
      time: dayjs(parsedLog.time).utc().format("YYYY-MM-DD HH:mm:ssZ"),
    };
    return JSON.stringify(l, null, 2);
  } catch {
    return log;
  }
};

export default function CallSystemLogs({ call }: CallSystemLogsProps) {
  const [logs, setLogs] = useState<string[] | null>();
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  useEffect(() => {}, [call]);
  const getLogs = () => {
    setLoading(true);
    setCount((prev) => prev + 1);
    if (call && call.account_sid && call.call_sid) {
      getRecentCallLog(call.account_sid, call.call_sid)
        .then(({ json }) => {
          setLogs(json);
        })
        .catch((err) => {
          if (err.status === 404) {
            toastError("There is no log for this call");
          } else {
            toastError(err.msg);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const copyToClipboard = () => {
    if (!logs) {
      return;
    }
    const textToCopy = logs.map(formatLog).join("\n\n");

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => toastSuccess("Logs copied to clipboard"))
      .catch(() => toastError("Failed to copy logs"));
  };

  const downloadLogs = () => {
    if (!logs) {
      return;
    }
    const textToDownload = logs.map(formatLog).join("\n\n");

    const blob = new Blob([textToDownload], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${call.call_sid}.log`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <>
      <>
        <div className="log-container">
          <div className="log-buttons">
            <button
              onClick={getLogs}
              className="log-retrieve-button"
              title="Retrieve Logs"
              disabled={loading}
            >
              <div style={{ display: "flex", gap: "5px" }}>
                Retrieve Logs
                {loading && <Spinner small />}
              </div>
            </button>
            {hasValue(logs) && logs.length !== 0 && (
              <>
                <button
                  onClick={copyToClipboard}
                  className="log-button"
                  title="Copy to clipboard"
                >
                  <Icons.Clipboard />
                </button>
                <button
                  onClick={downloadLogs}
                  className="log-button"
                  title="Download logs"
                >
                  <Icons.Download />
                </button>
              </>
            )}
          </div>
          <pre className="log-content">
            {hasValue(logs) && logs.length !== 0
              ? logs?.map((log, index) => (
                  <div key={index}>{formatLog(log)}</div>
                ))
              : count !== 0 && logs === null
                ? "No logs found"
                : ""}
          </pre>
        </div>
      </>
    </>
  );
}
