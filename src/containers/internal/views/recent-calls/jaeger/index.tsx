import React, { useEffect, useRef, useState } from "react";
import { getJaegerTrace, getRecentCall } from "src/api";
import { JaegerGroup, JaegerRoot, JaegerSpan } from "src/api/jaeger-types";
import { toastError } from "src/store";
import { JaegerModalFullScreen } from "./modal";
import type { RecentCall } from "src/api/types";
import { Bar } from "./bar";
import { Button } from "@jambonz/ui-kit";
import { Scroll } from "./scroll";
import { JaegerDetail } from "./detail";

import "./styles.scss";

type JaegerButtonProps = {
  call: RecentCall;
};

export const JaegerButton = ({ call }: JaegerButtonProps) => {
  const [jaegerGroup, setJaegerGroup] = useState<JaegerGroup>();
  const [groups, setGroups] = useState<JaegerGroup[]>([]);
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
      const startTime = rootSpan.startTimeUnixNano;
      const viewPortRatio = 1;

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
      setGroups(groups);

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
              <Bar group={jaegerGroup} handleRowSelect={setJaegerGroup} />
            </div>
            <Scroll groups={groups} barGroupRef={barGroupRef} />
            {jaegerGroup && <JaegerDetail group={jaegerGroup} />}
          </JaegerModalFullScreen>
        )}
      </>
    );
  }
  return null;
};
