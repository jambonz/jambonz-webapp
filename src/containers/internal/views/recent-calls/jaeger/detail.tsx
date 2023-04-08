import React from "react";
import { JaegerGroup } from "src/api/jaeger-types";
import dayjs from "dayjs";
import "./styles.scss";

type JaegerDetailProps = {
  group: JaegerGroup;
};

export const JaegerDetail = ({ group }: JaegerDetailProps) => {
  return (
    <div className="spanDetailsWrapper">
      <div className="spanDetailsWrapper__header">Span: {group.name}</div>
      <div className="spanDetailsWrapper__details">
        <div className="spanDetailsWrapper__details_header">Span ID:</div>
        <div className="spanDetailsWrapper__details_body">{group.spanId}</div>
        <div className="spanDetailsWrapper__details_header">Span Start:</div>
        <div className="spanDetailsWrapper__details_body">
          {dayjs
            .unix(group.startTimeUnixNano / 1000000000)
            .format("DD/MM/YY HH:mm:ss.SSS")}
        </div>
        <div className="spanDetailsWrapper__details_header">Span End:</div>
        <div className="spanDetailsWrapper__details_body">
          {dayjs
            .unix(group.endTimeUnixNano / 1000000000)
            .format("DD/MM/YY HH:mm:ss.SSS")}
        </div>
        {group.attributes.map((attribute) => (
          <React.Fragment key={attribute.key}>
            <div className="spanDetailsWrapper__details_header">
              {attribute.key}:
            </div>
            <div className="spanDetailsWrapper__details_body">
              {attribute.value.stringValue}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
