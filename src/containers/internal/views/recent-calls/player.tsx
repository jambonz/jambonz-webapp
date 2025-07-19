import React from "react";

import WaveSurfer from "wavesurfer.js";
import { useEffect, useRef, useState } from "react";
import { Icon, P } from "@jambonz/ui-kit";
import { Icons, Modal, ModalClose } from "src/components";
import { deleteRecord, getBlob, getJaegerTrace } from "src/api";
import { DownloadedBlob, RecentCall } from "src/api/types";
import RegionsPlugin, { Region } from "wavesurfer.js/dist/plugins/regions";
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline";
import { API_BASE_URL } from "src/api/constants";
import {
  JaegerRoot,
  JaegerSpan,
  WaveSurferDtmfResult,
  WaveSurferGatherSpeechVerbHookLatencyResult,
  WaveSurferSttResult,
  WaveSurferTtsLatencyResult,
} from "src/api/jaeger-types";
import {
  getSpanAttributeByName,
  getSpansByNameRegex,
  getSpansFromJaegerRoot,
} from "./utils";
import { useToast } from "src/components/toast/toast-provider";

type PlayerProps = {
  call: RecentCall;
};

export const Player = ({ call }: PlayerProps) => {
  const { toastSuccess, toastError } = useToast();
  const { recording_url, call_sid } = call;
  const url =
    recording_url && recording_url.startsWith("http://")
      ? recording_url
      : `${API_BASE_URL}${recording_url}`;
  const JUMP_DURATION = 15; //seconds
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [playBackTime, setPlayBackTime] = useState("");
  const [jaegerRoot, setJeagerRoot] = useState<JaegerRoot>();
  const [waveSurferRegionData, setWaveSurferRegionData] =
    useState<WaveSurferSttResult | null>();
  const [waveSurferDtmfData, setWaveSurferDtmfData] =
    useState<WaveSurferDtmfResult | null>();

  const [waveSurferTtsLatencyData, setWaveSurferTtsLatencyData] =
    useState<WaveSurferTtsLatencyResult | null>();

  const [
    waveSurferGatherSpeechVerbHookLatencyData,
    setWaveSurferGatherSpeechVerbHookLatencyData,
  ] = useState<WaveSurferGatherSpeechVerbHookLatencyResult | null>();
  const [regionChecked, setRegionChecked] = useState(false);

  const wavesurferId = `wavesurfer--${call_sid}`;
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const waveSurferRegionsPluginRef = useRef<RegionsPlugin | null>();

  const [record, setRecord] = useState<DownloadedBlob | null>(null);

  const [deleteRecordUrl, setDeleteRecordUrl] = useState("");

  const drawDtmfRegionForSpan = (s: JaegerSpan, startPoint: JaegerSpan) => {
    if (waveSurferRegionsPluginRef.current) {
      waveSurferRef.current;
      const r = waveSurferRegionsPluginRef.current
        .getRegions()
        .find((r) => r.id === s.spanId);
      if (!r) {
        const [dtmfValue] = getSpanAttributeByName(s.attributes, "dtmf");
        const [durationValue] = getSpanAttributeByName(
          s.attributes,
          "duration",
        );
        if (dtmfValue && durationValue) {
          const start =
            (s.startTimeUnixNano - startPoint.startTimeUnixNano) /
            1_000_000_000;
          const duration =
            Number(durationValue.value.stringValue.replace("ms", "")) / 1_000;
          // as duration of DTMF is short, cannot be shown in wavesurfer,
          // adjust region width here.
          const delta = duration <= 0.1 ? 0.1 : duration;
          const end = start + delta;

          const region = waveSurferRegionsPluginRef.current.addRegion({
            id: s.spanId,
            start,
            end,
            color: "rgba(138, 43, 226, 0.15)",
            drag: false,
            resize: false,
          });
          changeRegionMouseStyle(region);

          const att: WaveSurferDtmfResult = {
            dtmf: dtmfValue.value.stringValue,
            duration: durationValue.value.stringValue,
          };

          region.on("click", () => {
            setWaveSurferDtmfData(att);
          });
        }
      }
    }
  };

  const changeRegionMouseStyle = (region: Region, channel = 0) => {
    region.element.style.display = regionChecked ? "" : "none";
    region.element.style.height = "49%";
    region.element.style.top = channel === 0 ? "0" : "51%";

    region.element.addEventListener("mouseenter", () => {
      region.element.style.cursor = "pointer"; // Change to your desired cursor style
    });

    region.element.addEventListener("mouseleave", () => {
      region.element.style.cursor = "default";
    });
  };

  const PEAKS_WINDOW = 5; // require 30 ms of speech energy over threshold to trigger
  const PEAK_THRESHOLD = 0.03;

  const getSilenceStartTime = (
    start: number,
    end: number,
    channel: number,
  ): number => {
    if (waveSurferRef.current) {
      const duration = waveSurferRef.current.getDecodedData()?.duration;
      if (duration && duration > 0) {
        const maxLength = Math.round(duration * 8000) / 10; // evaluate speech energy every 10 ms
        const peaks = waveSurferRef.current.exportPeaks({ maxLength });
        if (peaks && peaks.length > channel) {
          if (duration && duration > 0) {
            const data = peaks[channel];
            const startPeak = Math.ceil((start * data.length) / duration);
            const endPeak = Math.ceil((end * data.length) / duration);
            let count = 0;
            for (let i = endPeak; i > startPeak; i--)
              if (Math.abs(data[i]) > PEAK_THRESHOLD) {
                count++;
                if (count === PEAKS_WINDOW) {
                  return (
                    ((i + PEAKS_WINDOW) * duration) / data.length + 0.02 // add 20 ms adjustment
                  );
                }
              } else {
                count = 0;
              }
          }
        }
      }
    }
    return -1;
  };

  const drawSttRegionForSpan = (
    s: JaegerSpan,
    startPoint: JaegerSpan,
    channel = 0,
  ) => {
    if (waveSurferRegionsPluginRef.current) {
      const r = waveSurferRegionsPluginRef.current
        .getRegions()
        .find((r) => r.id === s.spanId);
      if (!r) {
        const start =
          (s.startTimeUnixNano - startPoint.startTimeUnixNano) / 1_000_000_000 +
          0.05; // add magic 0.01 second in each region start time to isolate 2 near regions
        const end =
          (s.endTimeUnixNano - startPoint.startTimeUnixNano) / 1_000_000_000;

        const [sttLatencyMs] = getSpanAttributeByName(
          s.attributes,
          "stt.latency_ms",
        );
        let endSpeechTime = 0;
        if (!sttLatencyMs) {
          endSpeechTime = getSilenceStartTime(start, end, channel);
        } else {
          endSpeechTime =
            end - parseFloat(sttLatencyMs.value.stringValue) / 1000;
        }

        const [sttResult] = getSpanAttributeByName(s.attributes, "stt.result");
        let att: WaveSurferSttResult;
        if (sttResult) {
          const data = JSON.parse(sttResult.value.stringValue);

          att = {
            vendor: data.vendor.name,
            transcript: data.alternatives[0].transcript,
            confidence: data.alternatives[0].confidence,
            language_code: data.language_code,
            ...(endSpeechTime > 0 && { latency: end - endSpeechTime }),
          };

          const [sttResolve] = getSpanAttributeByName(
            s.attributes,
            "stt.resolve",
          );
          if (
            endSpeechTime > 0 &&
            sttResolve &&
            sttResolve.value.stringValue === "speech"
          ) {
            const latencyRegion = waveSurferRegionsPluginRef.current.addRegion({
              id: s.spanId + "latency",
              start: endSpeechTime,
              end,
              color: "rgba(255, 255, 0, 0.55)",
              drag: false,
              resize: false,
              content: `${(end - endSpeechTime).toFixed(2)}s`,
            });

            changeRegionMouseStyle(latencyRegion, channel);
          }
        } else {
          const [sttResolve] = getSpanAttributeByName(
            s.attributes,
            "stt.resolve",
          );
          if (sttResolve && sttResolve.value.stringValue === "timeout") {
            att = {
              vendor: "",
              transcript: "None (speech session timeout)",
              confidence: 0,
              language_code: "",
            };
          } else {
            att = {
              vendor: "",
              transcript:
                "None (call disconnected or speech session terminated)",
              confidence: 0,
              language_code: "",
            };
          }
        }

        const region = waveSurferRegionsPluginRef.current.addRegion({
          id: s.spanId,
          start,
          end,
          color: "rgba(255, 0, 0, 0.15)",
          drag: false,
          resize: false,
        });

        changeRegionMouseStyle(region, channel);

        region.on("click", () => {
          setWaveSurferRegionData(att);
        });
      }
    }
  };

  const drawTtsLatencyRegion = (s: JaegerSpan, startPoint: JaegerSpan) => {
    if (waveSurferRegionsPluginRef.current) {
      const r = waveSurferRegionsPluginRef.current
        .getRegions()
        .find((r) => r.id === s.spanId);
      if (!r) {
        const start =
          (s.startTimeUnixNano - startPoint.startTimeUnixNano) / 1_000_000_000;
        let end =
          (s.endTimeUnixNano - startPoint.startTimeUnixNano) / 1_000_000_000;

        const [ttsVendor] = getSpanAttributeByName(s.attributes, "tts.vendor");
        const [ttsCache] = getSpanAttributeByName(s.attributes, "tts.cached");
        const [streamLatency] = getSpanAttributeByName(
          s.attributes,
          "time_to_first_byte_ms",
        );
        if (streamLatency && streamLatency.value.stringValue) {
          end = start + Number(streamLatency.value.stringValue) / 1_000;
        }
        if (ttsVendor && ttsCache && !Boolean(ttsCache.value.boolValue)) {
          const latencyRegion = waveSurferRegionsPluginRef.current.addRegion({
            id: s.spanId,
            start: start,
            end,
            color: "rgba(255, 155, 0, 0.55)",
            drag: false,
            resize: false,
            content: createMultiLineTextElement(`${(end - start).toFixed(2)}s`),
          });

          changeRegionMouseStyle(latencyRegion, 1);

          latencyRegion.on("click", () => {
            setWaveSurferTtsLatencyData({
              vendor: ttsVendor.value.stringValue,
              latency: `${(end - start).toFixed(2)}s`,
              isCached: String(ttsCache.value.boolValue),
            });
          });
        }
      }
    }
  };

  const drawVerbHookDelayRegion = (s: JaegerSpan, startPoint: JaegerSpan) => {
    if (waveSurferRegionsPluginRef.current) {
      const r = waveSurferRegionsPluginRef.current
        .getRegions()
        .find((r) => r.id === s.spanId);

      if (!r) {
        const start =
          (s.startTimeUnixNano - startPoint.startTimeUnixNano) / 1_000_000_000;
        const end =
          (s.endTimeUnixNano - startPoint.startTimeUnixNano) / 1_000_000_000;
        const tmpEnd = end - start < 0.05 ? start + 0.05 : end;

        const latencyRegion = waveSurferRegionsPluginRef.current.addRegion({
          id: s.spanId,
          start: start,
          end: tmpEnd,
          color: "rgba(255, 3, 180, 0.55)",
          drag: false,
          resize: false,
          content: createMultiLineTextElement(`${(end - start).toFixed(2)}s`),
        });
        const [statusCode] = getSpanAttributeByName(
          s.attributes,
          "http.statusCode",
        );
        changeRegionMouseStyle(latencyRegion, 0);
        latencyRegion.on("click", () => {
          setWaveSurferGatherSpeechVerbHookLatencyData({
            statusCode: statusCode ? Number(statusCode.value.doubleValue) : 404,
            latency: `${(end - start).toFixed(2)}s`,
          });
        });
      }
    }
  };

  function createMultiLineTextElement(text: string) {
    const div = document.createElement("div");
    div.style.paddingLeft = "10px";
    div.style.paddingTop = "15px";
    div.appendChild(document.createElement("br"));
    div.appendChild(document.createTextNode(text));

    return div;
  }

  const buildWavesurferRegion = () => {
    if (jaegerRoot) {
      const spans = getSpansFromJaegerRoot(jaegerRoot);
      const start = getSpansByNameRegex(spans, /background-record:listen/);
      const startPoint = start ? start[0] : null;
      // there should be only one startPoint for background listen
      if (startPoint) {
        const gatherSpans = getSpansByNameRegex(spans, /:gather{/);
        gatherSpans.forEach((s) => {
          drawSttRegionForSpan(s, startPoint);
        });

        // Trasscription
        const transcribeSpans = getSpansByNameRegex(spans, /stt-listen:/);
        transcribeSpans.forEach((cs) => {
          // Channel start from 0
          const channel = Number(cs.name.split(":")[1]);
          drawSttRegionForSpan(
            cs,
            startPoint,
            channel > 0 ? channel - 1 : channel,
          );
        });
        // DTMF
        const dtmfSpans = getSpansByNameRegex(spans, /dtmf:/);
        dtmfSpans.forEach((ds) => {
          drawDtmfRegionForSpan(ds, startPoint);
        });
        // TTS delay
        const ttsSpans = getSpansByNameRegex(spans, /tts-generation/);
        ttsSpans.forEach((tts) => {
          drawTtsLatencyRegion(tts, startPoint);
        });

        // Gather verb hook delay
        const verbHookSpans = getSpansByNameRegex(spans, /verb:hook/);
        verbHookSpans
          .filter((s) => {
            const [httpBody] = getSpanAttributeByName(
              s.attributes,
              "http.body",
            );
            return (
              httpBody.value.stringValue.includes(
                '"reason":"speechDetected"',
              ) ||
              httpBody.value.stringValue.includes('"reason":"dtmfDetected"')
            );
          })
          .forEach((s) => {
            drawVerbHookDelayRegion(s, startPoint);
          });
      }
    }
  };

  const handleDeleteRecordSubmit = () => {
    if (deleteRecordUrl) {
      deleteRecord(deleteRecordUrl)
        .then(() => {
          setDeleteRecordUrl("");
          toastSuccess("Successfully deleted record");
        })
        .catch((error) => {
          toastError(error.msg);
        });
    }
  };

  useEffect(() => {
    buildWavesurferRegion();
  }, [jaegerRoot, isReady]);

  useEffect(() => {
    getBlob(url).then(({ blob, headers }) => {
      if (blob) {
        const ext = headers.get("Content-Type") === "audio/wav" ? "wav" : "mp3";
        setRecord({
          data_url: URL.createObjectURL(blob),
          file_name: `callid-${call_sid}.${ext}`,
        });
      }
    });

    if (call.trace_id && call.trace_id != "00000000000000000000000000000000") {
      getJaegerTrace(call.account_sid, call.trace_id).then(({ json }) => {
        if (json) {
          setJeagerRoot(json);
        }
      });
    }
  }, []);

  function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }

  useEffect(() => {
    if (waveSurferRef.current !== null || !record) return;
    waveSurferRegionsPluginRef.current = RegionsPlugin.create();
    waveSurferRef.current = WaveSurfer.create({
      container: `#${wavesurferId}`,
      waveColor: "#da1c5c",
      progressColor: "grey",
      height: 50,
      cursorWidth: 1,
      cursorColor: "lightgray",
      normalize: true,
      autoScroll: true,
      splitChannels: [],
      minPxPerSec: 100,
      plugins: [
        waveSurferRegionsPluginRef.current,
        TimelinePlugin.create({
          timeInterval: 0.2,
          primaryLabelInterval: 5,
          secondaryLabelInterval: 1,
          style: {
            fontSize: "15px",
            color: "#000000",
            fontWeight: "bold",
          },
        }),
      ],
    });

    waveSurferRef.current.load(record?.data_url);
    // All event should be after load
    waveSurferRef.current.on("finish", () => {
      setIsPlaying(false);
    });

    waveSurferRef.current.on("play", () => {
      setIsPlaying(true);
    });

    waveSurferRef.current.on("pause", () => {
      setIsPlaying(false);
    });

    waveSurferRef.current.on("ready", () => {
      setIsReady(true);
      setPlayBackTime(formatTime(waveSurferRef.current?.getDuration() || 0));
    });

    waveSurferRef.current.on("audioprocess", () => {
      setPlayBackTime(formatTime(waveSurferRef.current?.getCurrentTime() || 0));
    });
  }, [record]);

  const togglePlayback = () => {
    if (waveSurferRef.current) {
      if (!isPlaying) {
        waveSurferRef.current.play();
      } else {
        waveSurferRef.current.pause();
      }
    }
  };

  const setPlaybackJump = (delta: number) => {
    if (waveSurferRef.current) {
      const idx = waveSurferRef.current.getCurrentTime() + delta;
      const value =
        idx <= 0
          ? 0
          : idx >= waveSurferRef.current.getDuration()
            ? waveSurferRef.current.getDuration() - 1
            : idx;
      waveSurferRef.current.setTime(value);
      setPlayBackTime(formatTime(value));
    }
  };

  if (!record) return null;

  return (
    <>
      <div className="media-container">
        <div id={wavesurferId} />
        <div className="media-container__center">
          <strong>{playBackTime}</strong>
        </div>
        <div className="controll-btn-container">
          <div className="controll-btn-container__placeholder"></div>
          <div className="controll-btn-container__center">
            <button
              className="btnty"
              type="button"
              onClick={() => {
                setPlaybackJump(-JUMP_DURATION);
              }}
              title="Jump left"
              disabled={!isReady}
            >
              <Icon>
                <Icons.ChevronsLeft />
              </Icon>
            </button>
            <button
              className="btnty"
              type="button"
              onClick={togglePlayback}
              title="play/pause"
              disabled={!isReady}
            >
              <Icon>{isPlaying ? <Icons.Pause /> : <Icons.Play />}</Icon>
            </button>

            <button
              className="btnty"
              type="button"
              onClick={() => {
                setPlaybackJump(JUMP_DURATION);
              }}
              title="Jump right"
              disabled={!isReady}
            >
              <Icon>
                <Icons.ChevronsRight />
              </Icon>
            </button>
          </div>

          <div className="controll-btn-container__right">
            <a
              href={record.data_url}
              download={record.file_name}
              className="btnty"
              title="Download record file"
            >
              <Icon>
                <Icons.Download />
              </Icon>
            </a>

            <button
              type="button"
              onClick={() => {
                setDeleteRecordUrl(url || "");
              }}
              title="Delete record file"
            >
              <Icon>
                <Icons.Trash2 />
              </Icon>
            </button>
          </div>
        </div>
        <label htmlFor="is_active" className="chk">
          <input
            id={`is_active${call.call_sid}`}
            name="is_active"
            type="checkbox"
            checked={regionChecked}
            onChange={(e) => {
              setRegionChecked(e.target.checked);
              if (waveSurferRegionsPluginRef.current) {
                const regionsList =
                  waveSurferRegionsPluginRef.current.getRegions();
                for (const [, region] of Object.entries(regionsList)) {
                  region.element.style.display = e.target.checked ? "" : "none";
                }
              }
            }}
          />
          <div>Show latencies</div>
        </label>
      </div>
      {waveSurferRegionData && (
        <ModalClose handleClose={() => setWaveSurferRegionData(null)}>
          <div className="spanDetailsWrapper__header">
            <P>
              <strong>Speech to text result</strong>
            </P>
          </div>
          <div className="spanDetailsWrapper">
            <div className="spanDetailsWrapper__detailsWrapper">
              {waveSurferRegionData.vendor && (
                <div className="spanDetailsWrapper__details">
                  <div className="spanDetailsWrapper__details_header">
                    <strong>Vendor:</strong>
                  </div>
                  <div className="spanDetailsWrapper__details_body">
                    {waveSurferRegionData.vendor}
                  </div>
                </div>
              )}
              {waveSurferRegionData.confidence !== 0 && (
                <div className="spanDetailsWrapper__details">
                  <div className="spanDetailsWrapper__details_header">
                    <strong>Confidence:</strong>
                  </div>
                  <div className="spanDetailsWrapper__details_body">
                    {waveSurferRegionData.confidence}
                  </div>
                </div>
              )}
              {waveSurferRegionData.language_code && (
                <div className="spanDetailsWrapper__details">
                  <div className="spanDetailsWrapper__details_header">
                    <strong>Language code:</strong>
                  </div>
                  <div className="spanDetailsWrapper__details_body">
                    {waveSurferRegionData.language_code}
                  </div>
                </div>
              )}
              {waveSurferRegionData.transcript && (
                <div className="spanDetailsWrapper__details">
                  <div className="spanDetailsWrapper__details_header">
                    <strong>Transcript:</strong>
                  </div>
                  <div className="spanDetailsWrapper__details_body">
                    {waveSurferRegionData.transcript}
                  </div>
                </div>
              )}
              {waveSurferRegionData.latency && (
                <div className="spanDetailsWrapper__details">
                  <div className="spanDetailsWrapper__details_header">
                    <strong>Latency:</strong>
                  </div>
                  <div className="spanDetailsWrapper__details_body">
                    {waveSurferRegionData.latency.toFixed(2)} seconds
                  </div>
                </div>
              )}
            </div>
          </div>
        </ModalClose>
      )}
      {waveSurferDtmfData && (
        <ModalClose handleClose={() => setWaveSurferDtmfData(null)}>
          <div className="spanDetailsWrapper__header">
            <P>
              <strong>Dtmf result</strong>
            </P>
          </div>
          <div className="spanDetailsWrapper">
            <div className="spanDetailsWrapper__detailsWrapper">
              <div className="spanDetailsWrapper__details">
                <div className="spanDetailsWrapper__details_header">
                  <strong>Dtmf:</strong>
                </div>
                <div className="spanDetailsWrapper__details_body">
                  {waveSurferDtmfData.dtmf}
                </div>
              </div>

              <div className="spanDetailsWrapper__details">
                <div className="spanDetailsWrapper__details_header">
                  <strong>Duration:</strong>
                </div>
                <div className="spanDetailsWrapper__details_body">
                  {waveSurferDtmfData.duration}
                </div>
              </div>
            </div>
          </div>
        </ModalClose>
      )}
      {waveSurferTtsLatencyData && (
        <ModalClose handleClose={() => setWaveSurferTtsLatencyData(null)}>
          <div className="spanDetailsWrapper__header">
            <P>
              <strong>Tts Latency</strong>
            </P>
          </div>
          <div className="spanDetailsWrapper">
            <div className="spanDetailsWrapper__detailsWrapper">
              <div className="spanDetailsWrapper__details">
                <div className="spanDetailsWrapper__details_header">
                  <strong>Vendor:</strong>
                </div>
                <div className="spanDetailsWrapper__details_body">
                  {waveSurferTtsLatencyData.vendor}
                </div>
              </div>

              <div className="spanDetailsWrapper__details">
                <div className="spanDetailsWrapper__details_header">
                  <strong>Latency:</strong>
                </div>
                <div className="spanDetailsWrapper__details_body">
                  {waveSurferTtsLatencyData.latency}
                </div>
              </div>

              <div className="spanDetailsWrapper__details">
                <div className="spanDetailsWrapper__details_header">
                  <strong>From Cache:</strong>
                </div>
                <div className="spanDetailsWrapper__details_body">
                  {waveSurferTtsLatencyData.isCached}
                </div>
              </div>
            </div>
          </div>
        </ModalClose>
      )}
      {waveSurferGatherSpeechVerbHookLatencyData && (
        <ModalClose
          handleClose={() => setWaveSurferGatherSpeechVerbHookLatencyData(null)}
        >
          <div className="spanDetailsWrapper__header">
            <P>
              <strong>Application Response Latency</strong>
            </P>
          </div>
          <div className="spanDetailsWrapper">
            <div className="spanDetailsWrapper__detailsWrapper">
              <div className="spanDetailsWrapper__details">
                <div className="spanDetailsWrapper__details_header">
                  <strong>Status Code:</strong>
                </div>
                <div className="spanDetailsWrapper__details_body">
                  {waveSurferGatherSpeechVerbHookLatencyData.statusCode}
                </div>
              </div>

              <div className="spanDetailsWrapper__details">
                <div className="spanDetailsWrapper__details_header">
                  <strong>Latency:</strong>
                </div>
                <div className="spanDetailsWrapper__details_body">
                  {waveSurferGatherSpeechVerbHookLatencyData.latency}
                </div>
              </div>
            </div>
          </div>
        </ModalClose>
      )}
      {deleteRecordUrl && (
        <Modal
          handleCancel={() => setDeleteRecordUrl("")}
          handleSubmit={handleDeleteRecordSubmit}
        >
          <P>
            Are you sure you want to delete the record for call{" "}
            <strong>{call_sid}</strong>?
          </P>
        </Modal>
      )}
    </>
  );
};
