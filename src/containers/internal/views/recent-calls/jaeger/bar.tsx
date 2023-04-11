import React from "react";
import { JaegerGroup } from "src/api/jaeger-types";

import "./styles.scss";

type BarProps = {
  group: JaegerGroup;
  handleRowSelect: (grp: JaegerGroup) => void;
};

const formattedDuration = (duration: number) => {
  if (duration < 1) {
    return (Math.round(duration * 100) / 100).toFixed(2) + "ms";
  } else if (duration < 1000) {
    return (Math.round(duration * 100) / 100).toFixed(0) + "ms";
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
};

export const Bar = ({ group, handleRowSelect }: BarProps) => {
  const titleMargin = group.level * 30;

  const handleRowClick = () => {
    handleRowSelect(group);
  };

  const truncate = (str: string) => {
    console.log(str.length);
    if (str.length > 36) {
      return str.substring(0, 36) + "...";
    }
    return str;
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
          {truncate(group.name)}
        </div>
        <button
          className="barWrapper__span"
          style={{ marginLeft: `${group.startPx}px`, width: group.durationPx }}
        />
        <div className="barWrapper__duration">
          {formattedDuration(group.durationMs)}
        </div>
      </div>
      {group.children.map((value) => (
        <Bar
          key={value.spanId}
          group={value}
          handleRowSelect={handleRowSelect}
        />
      ))}
    </div>
  );
};
