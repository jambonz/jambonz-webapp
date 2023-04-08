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
    document.body.style.overflow = "auto";
    setModal(false);
  };

  const handleOpen = () => {
    document.body.style.overflow = "hidden";
    setModal(true);
  };

  const goLeft = () => {
    if (barGroupRef.current) {
      barGroupRef.current.scrollLeft -= barGroupRef.current.offsetWidth;
    }
  };

  const goRight = () => {
    if (barGroupRef.current) {
      barGroupRef.current.scrollLeft += barGroupRef.current.offsetWidth;
    }
  };

  /*
   * Need to find a better way for long duration
   * and short duration spans to coexist.
   * Currently the longer spans either require a
   * large scroll to right or we compress the timeline.
   * Shrinking the timeline based on longest span
   * causes us to lose the detail between the ms spans
   * For now using a stepped ratio based on duration
   * which gives an average result.
   * */
  const durationRatio = (durationMs: number) => {
    const mins = durationMs / 1000 / 60;
    if (mins <= 10) return 2000;
    else if (mins <= 20) return 8000;
    else if (mins <= 30) return 12000;
    else if (mins <= 40) return 16000;
    else if (mins <= 50) return 18000;
    else return 22000;
  };
  const getViewPortRatio = (durationMs: number) => {
    const { innerWidth } = window;
    const titleOffset = innerWidth + durationRatio(durationMs);
    return durationMs / titleOffset;
  };

  const getSpansFromJaegerRoot = (trace: JaegerRoot) => {
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
    return spans;
  };

  const getGroupsByParent = (spanId: string, groups: JaegerGroup[]) => {
    groups.sort((a, b) => a.startTimeUnixNano - b.startTimeUnixNano);
    return groups.filter((value) => value.parentSpanId === spanId);
  };

  const getRootSpan = (spans: JaegerSpan[]) => {
    return spans.find((value) => value.parentSpanId == "AAAAAAAAAAA=");
  };

  const getRootGroup = (grps: JaegerGroup[]) => {
    return grps.find((value) => value.parentSpanId == "AAAAAAAAAAA=");
  };

  const buildSpans = (root: JaegerRoot) => {
    const spans = getSpansFromJaegerRoot(root);
    const rootSpan = getRootSpan(spans);
    if (rootSpan) {
      setJaegerSpan(rootSpan);

      const startTime = rootSpan.startTimeUnixNano;
      const fullDuration =
        (rootSpan.endTimeUnixNano - rootSpan.startTimeUnixNano) / 1_000_000;
      const viewPortRatio = getViewPortRatio(fullDuration);

      const groups: JaegerGroup[] = spans.map((span) => {
        const level = 0;
        const children: JaegerGroup[] = [];
        const startMs = (span.startTimeUnixNano - startTime) / 1_000_000;
        const durationMs =
          (span.endTimeUnixNano - span.startTimeUnixNano) / 1_000_000;
        const startPx = startMs / viewPortRatio;
        const durationPx = durationMs / viewPortRatio;
        const endPx = startPx + durationPx;
        const endMs = startMs + durationMs;
        return {
          level,
          children,
          startPx,
          endPx,
          durationPx,
          startMs,
          endMs,
          durationMs,
          ...span,
        };
      });

      const rootGroup = getRootGroup(groups);
      if (rootGroup) {
        rootGroup.children = buildChildren(
          rootGroup.level + 1,
          rootGroup,
          groups
        );
        setJaegerGroup(rootGroup);
      }
    }
  };

  const buildChildren = (
    level: number,
    rootGroup: JaegerGroup,
    groups: JaegerGroup[]
  ): JaegerGroup[] => {
    return getGroupsByParent(rootGroup.spanId, groups).map((group) => {
      group.level = level;
      group.children = buildChildren(group.level + 1, group, groups);
      return group;
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
