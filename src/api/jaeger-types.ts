export interface JaegerRoot {
    resourceSpans: JaegerResourceSpan[]
}

export interface JaegerResourceSpan {
    resource: JaegerResource
    instrumentationLibrarySpans: InstrumentationLibrarySpan[]
}

export interface JaegerResource {
    attributes: JaegerAttribute[]
}

export interface InstrumentationLibrarySpan {
    instrumentationLibrary: InstrumentationLibrary
    spans: JaegerSpan[]
}

export interface InstrumentationLibrary {
    name: string
    version: string
}

export interface JaegerSpan {
    traceId: string
    spanId: string
    parentSpanId: string
    name: string
    kind: string
    startTimeUnixNano: string
    endTimeUnixNano: string
    attributes: JaegerAttribute[]
}

export interface JaegerAttribute {
    key: string
    value: JaegerValue
}

export interface JaegerValue {
    stringValue: string
}
