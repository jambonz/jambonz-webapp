import React, { useState } from "react";
import { JaegerGroup } from "src/api/jaeger-types";

import "./styles.scss";
import { formattedDuration } from "./utils";
import { JaegerDetail } from "./detail";

type BarProps = {
  group: JaegerGroup;
};

export const Bar = ({ group }: BarProps) => {
  const [jaegerDetail, setJaegerDetail] = useState<JaegerGroup | null>(null);
  const titleMargin = group.level * 30;

  const truncate = (str: string) => {
    if (str.length > 36) {
      return str.substring(0, 36) + "...";
    }
    return str;
  };

  return (
    <>
      <div
        className="barContainer"
        onMouseOver={() => setJaegerDetail(group)}
        onFocus={() => setJaegerDetail(group)}
        onMouseLeave={() => setJaegerDetail(null)}
      >
        <div className="barWrapper">
          <div role="presentation" className="barWrapper__row">
            <div
              className="barWrapper__header"
              style={{ paddingLeft: `${titleMargin}px` }}
            >
              {truncate(group.name)}
            </div>
            <button
              className="barWrapper__span"
              style={{
                marginLeft: `${group.startPx}px`,
                width: group.durationPx,
              }}
            />
            <div className="barWrapper__duration">
              {formattedDuration(group.durationMs)}
            </div>
          </div>
          {jaegerDetail && <JaegerDetail group={jaegerDetail} />}
        </div>
      </div>
      {group.children.map((value) => (
        <Bar key={value.spanId} group={value} />
      ))}
    </>
  );
};
