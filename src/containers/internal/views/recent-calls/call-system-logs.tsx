import React from "react";

type CallSystemLogsProps = {
  logs: string[];
};

export default function CallSystemLogs({ logs }: CallSystemLogsProps) {
  return (
    <pre className="log-container">
      {logs.map((log, index) => {
        let parsedLog;
        try {
          parsedLog = JSON.stringify(JSON.parse(log), null, 2); // Pretty-print JSON
        } catch {
          parsedLog = log; // If not JSON, show as is
        }
        return <div key={index}>{parsedLog}</div>;
      })}
    </pre>
  );
}
