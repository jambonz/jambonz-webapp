import React from "react";
import { JaegerGroup } from "src/api/jaeger-types";

import "./styles.scss";
import { formattedDuration } from "./utils";

type BarProps = {
  group: JaegerGroup;
  handleRowSelect: (grp: JaegerGroup) => void;
};

export const Bar = ({ group, handleRowSelect }: BarProps) => {
  const titleMargin = group.level * 30;

  const handleRowClick = () => {
    handleRowSelect(group);
  };

  const truncate = (str: string) => {
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
