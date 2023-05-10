import React from "react";
import { JaegerGroup, JaegerValue } from "src/api/jaeger-types";
import dayjs from "dayjs";
import "./styles.scss";
import { formattedDuration } from "./utils";

type JaegerDetailProps = {
  group: JaegerGroup;
};

const extractSpanGroupValue = (value: JaegerValue): string => {
  return value.stringValue || value.doubleValue || `${value.boolValue}`;
};

export const JaegerDetail = ({ group }: JaegerDetailProps) => {
  return (
    <div className="spanDetailsWrapper">
      <div className="spanDetailsWrapper__header">Span: {group.name}</div>
      <div className="spanDetailsWrapper__detailsWrapper">
        <div className="spanDetailsWrapper__details">
          <div className="spanDetailsWrapper__details_header">Span ID:</div>
          <div className="spanDetailsWrapper__details_body">{group.spanId}</div>
        </div>
        <div className="spanDetailsWrapper__details">
          <div className="spanDetailsWrapper__details_header">Span Start:</div>
          <div className="spanDetailsWrapper__details_body">
            {dayjs
              .unix(group.startTimeUnixNano / 1000000000)
              .format("DD/MM/YY HH:mm:ss.SSS")}
          </div>
        </div>
        <div className="spanDetailsWrapper__details">
          <div className="spanDetailsWrapper__details_header">Span End:</div>
          <div className="spanDetailsWrapper__details_body">
            {dayjs
              .unix(group.endTimeUnixNano / 1000000000)
              .format("DD/MM/YY HH:mm:ss.SSS")}
          </div>
        </div>
        <div className="spanDetailsWrapper__details">
          <div className="spanDetailsWrapper__details_header">Duration:</div>
          <div className="spanDetailsWrapper__details_body">
            {formattedDuration(group.durationMs)}
          </div>
        </div>
        {group.attributes.map((attribute) => (
          <div key={attribute.key} className="spanDetailsWrapper__details">
            <div className="spanDetailsWrapper__details_header">
              {attribute.key}:
            </div>
            <div className="spanDetailsWrapper__details_body">
              {extractSpanGroupValue(attribute.value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
