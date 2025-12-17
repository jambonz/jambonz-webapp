import { JaegerAttribute, JaegerRoot, JaegerSpan } from "src/api/jaeger-types";

export const getSpansFromJaegerRoot = (trace: JaegerRoot) => {
  const spans: JaegerSpan[] = [];
  trace.resourceSpans.forEach((resourceSpan) => {
    if (resourceSpan.instrumentationLibrarySpans) {
      resourceSpan.instrumentationLibrarySpans.forEach(
        (instrumentationLibrarySpan) => {
          instrumentationLibrarySpan.spans.forEach((value) => {
            const attrs = value.attributes.filter(
              (attr) =>
                !(
                  attr.key.startsWith("telemetry") ||
                  attr.key.startsWith("internal")
                ),
            );
            value.attributes = attrs;
            spans.push(value);
          });
        },
      );
    } else if (resourceSpan.scopeSpans) {
      resourceSpan.scopeSpans.forEach((scopeSpan) => {
        scopeSpan.spans.forEach((value) => {
          const attrs = value.attributes.filter(
            (attr) =>
              !(
                attr.key.startsWith("telemetry") ||
                attr.key.startsWith("internal")
              ),
          );
          value.attributes = attrs;
          spans.push(value);
        });
      });
    }
  });
  spans.sort((a, b) => a.startTimeUnixNano - b.startTimeUnixNano);
  return spans;
};

export const getSpansByName = (
  spans: JaegerSpan[],
  name: string,
): JaegerSpan[] => {
  return spans.filter((s) => s.name === name);
};

export const getSpansByNameRegex = (
  spans: JaegerSpan[],
  pattern: RegExp,
): JaegerSpan[] => {
  const matcher = new RegExp(pattern);
  return spans.filter((s) => matcher.test(s.name));
};

export const getSpanAttributeByName = (
  attr: JaegerAttribute[],
  name: string,
): JaegerAttribute[] => {
  return attr.filter((a) => a.key === name);
};
