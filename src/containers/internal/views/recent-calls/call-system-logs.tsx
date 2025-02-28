import React from "react";
import { Icons } from "src/components";
import { toastError, toastSuccess } from "src/store";

type CallSystemLogsProps = {
  logs: string[];
};

// Helper function to format logs
const formatLog = (log: string): string => {
  try {
    return JSON.stringify(JSON.parse(log), null, 2);
  } catch {
    return log;
  }
};

export default function CallSystemLogs({ logs }: CallSystemLogsProps) {
  const copyToClipboard = () => {
    const textToCopy = logs.map(formatLog).join("\n\n");

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => toastSuccess("Logs copied to clipboard"))
      .catch(() => toastError("Failed to copy logs"));
  };

  const downloadLogs = () => {
    const textToDownload = logs.map(formatLog).join("\n\n");

    const blob = new Blob([textToDownload], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "logs.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="log-container">
      <div className="log-buttons">
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
      </div>
      <pre className="log-content">
        {logs.map((log, index) => (
          <div key={index}>{formatLog(log)}</div>
        ))}
      </pre>
    </div>
  );
}
