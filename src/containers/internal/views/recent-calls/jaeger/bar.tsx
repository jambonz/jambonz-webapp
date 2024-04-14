import React, { useState } from "react";
import { JaegerGroup } from "src/api/jaeger-types";

import "./styles.scss";
import { formattedDuration } from "./utils";
import { JaegerDetail } from "./detail";
import { ModalClose } from "src/components";
import { P } from "@jambonz/ui-kit";

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
        className="barWrapper"
        role={"presentation"}
        onClick={() => {
          setJaegerDetail(group);
        }}
      >
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
      </div>
      {jaegerDetail && (
        <ModalClose handleClose={() => setJaegerDetail(null)}>
          <div className="spanDetailsWrapper__header">
            <P>
              <strong>Span:</strong> {group.name.replaceAll(",", ", ")}
            </P>
          </div>
          <JaegerDetail group={jaegerDetail} />
        </ModalClose>
      )}
      {group.children.map((value) => (
        <Bar key={value.spanId} group={value} />
      ))}
    </>
  );
};
