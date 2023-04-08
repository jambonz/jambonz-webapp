import React from "react";
import { JaegerGroup, JaegerSpan } from "src/api/jaeger-types";

import "./styles.scss";

type BarProps = {
  group: JaegerGroup;
  handleRowSelect: (grp: JaegerSpan) => void;
};

export const Bar = ({ group, handleRowSelect }: BarProps) => {
  const barMargin = group.start == 0 ? 0 : group.start;
  const titleMargin = group.level * 30;
  const maxWidth = group.end;
  const duration =
    (group.span.endTimeUnixNano - group.span.startTimeUnixNano) / 1_000_000;

  const formattedDuration = (duration: number) => {
    if (duration < 1) {
      return (Math.round(duration * 100) / 100).toFixed(2) + "ms";
    } else if (duration >= 1000) {
      const min = Math.floor((duration / 1000 / 60) << 0);

      if (min == 0) {
        const secs = parseFloat(`${duration / 1000}`).toFixed(2);
        return `${secs}s`;
      } else {
        const sec = Math.floor((duration / 1000) % 60);
        return `${min}m ${sec}s`;
      }
    }

    return (Math.round(duration * 100) / 100).toFixed(0) + "ms";
  };

  const handleRowClick = () => {
    handleRowSelect(group.span);
  };

  return (
    <div className="barWrapper">
      <div
        role="presentation"
        className="barWrapper__row"
        onClick={handleRowClick}
      >
        <div
          className="barWrapper__header"
          style={{ paddingLeft: `${titleMargin}px` }}
        >
          {group.span.name}
        </div>
        <button
          className="barWrapper__span"
          style={{ marginLeft: `${barMargin}px`, width: maxWidth }}
        />
        <div className="barWrapper__duration">
          {formattedDuration(duration)}
        </div>
      </div>
      {group.children.map((value) => (
        <Bar
          key={value.span.spanId}
          group={value}
          handleRowSelect={handleRowSelect}
        />
      ))}
    </div>
  );
};
