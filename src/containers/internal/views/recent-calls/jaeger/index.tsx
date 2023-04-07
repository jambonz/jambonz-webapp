import React, { useEffect, useRef, useState } from "react";
import { getJaegerTrace, getRecentCall } from "src/api";
import { JaegerGroup, JaegerRoot, JaegerSpan } from "src/api/jaeger-types";
import { toastError } from "src/store";
import { JaegerModalFullScreen } from "./modal";
import type { RecentCall } from "src/api/types";
import { Bar } from "./bar";
import { Button } from "@jambonz/ui-kit";

import "./styles.scss";
import dayjs from "dayjs";

type JaegerButtonProps = {
  call: RecentCall;
};

export const JaegerButton = ({ call }: JaegerButtonProps) => {
  const [jaegerGroup, setJaegerGroup] = useState<JaegerGroup>();
  const [jaegerSpan, setJaegerSpan] = useState<JaegerSpan>();
  const [modal, setModal] = useState(false);
  const barGroupRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    setModal(false);
  };

  const handleOpen = () => {
    setModal(true);
  };

  const goLeft = () => {
    if (barGroupRef.current) {
      barGroupRef.current.scrollLeft -= barGroupRef.current.offsetWidth * 100;
    }
  };

  const goRight = () => {
    if (barGroupRef.current) {
      barGroupRef.current.scrollLeft += barGroupRef.current.offsetWidth * 100;
    }
  };

  const buildSpans = (trace: JaegerRoot) => {
    const spans: JaegerSpan[] = [];
    trace.resourceSpans.forEach((resourceSpan) => {
      resourceSpan.instrumentationLibrarySpans.forEach(
        (instrumentationLibrarySpan) => {
          instrumentationLibrarySpan.spans.forEach((value) =>
            spans.push(value)
          );
        }
      );
    });
    spans.sort((a, b) => a.startTimeUnixNano - b.startTimeUnixNano);
    const span = spans.find((value) => value.parentSpanId == "AAAAAAAAAAA=");
    if (span) {
      setJaegerSpan(span);
      const level = 1;
      const start = 0;
      const end =
        (span.endTimeUnixNano - span.startTimeUnixNano) / 1_000_000_000;
      const group: JaegerGroup = {
        level,
        start,
        end,
        span,
        children: buildSpanChildren(level + 1, span, spans),
      };
      setJaegerGroup(group);
    }
  };

  const buildSpanChildren = (
    level: number,
    span: JaegerSpan,
    spans: JaegerSpan[]
  ): JaegerGroup[] => {
    return spans
      .filter((value) => value.parentSpanId === span.spanId)
      .map((value) => {
        const start =
          (value.startTimeUnixNano - span.startTimeUnixNano) / 1_000_000_000;
        const end =
          (value.endTimeUnixNano - value.startTimeUnixNano) / 1_000_000_000;
        return {
          level,
          start,
          end,
          span: value,
          children: buildSpanChildren(level + 1, value, spans),
        };
      });
  };

  useEffect(() => {
    getRecentCall(call.account_sid, call.sip_callid)
      .then(({ json }) => {
        if (json.total > 0 && !call.trace_id.startsWith("0000")) {
          getJaegerTrace(call.account_sid, call.trace_id)
            .then(({ json }) => {
              if (json) {
                buildSpans(json);
              }
            })
            .catch((error) => {
              toastError(error.msg);
            });
        }
      })
      .catch((error) => {
        toastError(error.msg);
      });
  }, []);

  if (jaegerGroup) {
    return (
      <>
        <button className="btn btn--small pcap" onClick={handleOpen}>
          View trace
        </button>
        {modal && (
          <JaegerModalFullScreen>
            <div className="modalHeader">
              <Button type="button" small onClick={handleClose}>
                Back
              </Button>
              <div className="modalHeader__header_item">
                <div>Trace ID:</div>
                <div>{call.trace_id}</div>
              </div>
            </div>
            <div ref={barGroupRef} className="barGroup">
              <Bar group={jaegerGroup} handleRowSelect={setJaegerSpan} />
            </div>
            <div className="scroll-buttons">
              <Button
                small
                type="button"
                style={{ borderRadius: "0px" }}
                onClick={goLeft}
              >
                &lt;
              </Button>
              <Button
                small
                type="button"
                style={{ borderRadius: "0px" }}
                onClick={goRight}
              >
                &gt;
              </Button>
            </div>
            {jaegerSpan && (
              <div className="spanDetailsWrapper">
                <div className="spanDetailsWrapper__header">
                  Span: {jaegerSpan.name}
                </div>

                <div className="spanDetailsWrapper__details">
                  <div className="spanDetailsWrapper__details_header">
                    Span ID:
                  </div>
                  <div className="spanDetailsWrapper__details_body">
                    {jaegerSpan.spanId}
                  </div>
                  <div className="spanDetailsWrapper__details_header">
                    Span Start:
                  </div>
                  <div className="spanDetailsWrapper__details_body">
                    {dayjs
                      .unix(jaegerSpan.startTimeUnixNano / 1000000000)
                      .format("DD/MM/YY HH:mm:ss.SSS")}
                  </div>
                  <div className="spanDetailsWrapper__details_header">
                    Span End:
                  </div>
                  <div className="spanDetailsWrapper__details_body">
                    {dayjs
                      .unix(jaegerSpan.endTimeUnixNano / 1000000000)
                      .format("DD/MM/YY HH:mm:ss.SSS")}
                  </div>
                  {jaegerSpan.attributes.map((attribute) => (
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
            )}
          </JaegerModalFullScreen>
        )}
      </>
    );
  }
  return null;
};
