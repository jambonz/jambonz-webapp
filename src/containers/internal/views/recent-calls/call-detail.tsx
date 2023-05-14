import React from "react";
import { RecentCall } from "src/api/types";

export type CallDetailProps = {
  call: RecentCall;
};

export const CallDetail = ({ call }: CallDetailProps) => {
  return (
    <>
      <div className="item__details">
        <div className="pre-grid">
          {Object.keys(call).map((key) => (
            <React.Fragment key={key}>
              <div>{key}:</div>
              <div>
                {call[key as keyof typeof call]
                  ? String(call[key as keyof typeof call])
                  : "null"}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
};

export default CallDetail;
