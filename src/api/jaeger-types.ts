export interface JaegerRoot {
  resourceSpans: JaegerResourceSpan[];
}

export interface JaegerResourceSpan {
  resource: JaegerResource;
  instrumentationLibrarySpans: InstrumentationLibrarySpan[];
}

export interface JaegerResource {
  attributes: JaegerAttribute[];
}

export interface InstrumentationLibrarySpan {
  instrumentationLibrary: InstrumentationLibrary;
  spans: JaegerSpan[];
}

export interface InstrumentationLibrary {
  name: string;
  version: string;
}

export interface JaegerSpan {
  traceId: string;
  spanId: string;
  parentSpanId: string;
  name: string;
  kind: string;
  startTimeUnixNano: number;
  endTimeUnixNano: number;
  attributes: JaegerAttribute[];
}

export interface JaegerAttribute {
  key: string;
  value: JaegerValue;
}

export interface WaveSurferSttResult {
  vendor: string;
  transcript: string;
  confidence: number;
  language_code: string;
  latency?: number;
}

export interface WaveSurferDtmfResult {
  dtmf: string;
  duration: string;
}

export interface JaegerValue {
  stringValue: string;
  doubleValue: string;
  boolValue: string;
}

export interface JaegerGroup {
  level: number;
  startPx: number;
  endPx: number;
  durationPx: number;
  startMs: number;
  endMs: number;
  durationMs: number;
  traceId: string;
  spanId: string;
  parentSpanId: string;
  name: string;
  kind: string;
  startTimeUnixNano: number;
  endTimeUnixNano: number;
  attributes: JaegerAttribute[];
  children: JaegerGroup[];
}
