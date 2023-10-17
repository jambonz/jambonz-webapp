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
  WaveSurferSttResult,
} from "src/api/jaeger-types";
import {
  getSpanAttributeByName,
  getSpansByName,
  getSpansByNameRegex,
  getSpansFromJaegerRoot,
} from "./utils";
import { toastError, toastSuccess } from "src/store";

type PlayerProps = {
  call: RecentCall;
};

export const Player = ({ call }: PlayerProps) => {
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
          "duration"
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

  const drawSttRegionForSpan = (
    s: JaegerSpan,
    startPoint: JaegerSpan,
    channel = 0
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

        const region = waveSurferRegionsPluginRef.current.addRegion({
          id: s.spanId,
          start,
          end,
          color: "rgba(255, 0, 0, 0.15)",
          drag: false,
          resize: false,
        });

        changeRegionMouseStyle(region, channel);
        const [sttResult] = getSpanAttributeByName(s.attributes, "stt.result");
        let att: WaveSurferSttResult;
        if (sttResult) {
          const data = JSON.parse(sttResult.value.stringValue);
          att = {
            vendor: data.vendor.name,
            transcript: data.alternatives[0].transcript,
            confidence: data.alternatives[0].confidence,
            language_code: data.language_code,
          };
        } else {
          const [sttResolve] = getSpanAttributeByName(
            s.attributes,
            "stt.resolve"
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

        region.on("click", () => {
          setWaveSurferRegionData(att);
        });
      }
    }
  };

  const buildWavesurferRegion = () => {
    if (jaegerRoot) {
      const spans = getSpansFromJaegerRoot(jaegerRoot);
      const [startPoint] = getSpansByName(spans, "background-listen:listen");
      // there should be only one startPoint for background listen
      if (startPoint) {
        const gatherSpans = getSpansByNameRegex(spans, /:gather{/);
        gatherSpans.forEach((s) => {
          drawSttRegionForSpan(s, startPoint);
        });

        const transcribeSpans = getSpansByNameRegex(spans, /stt-listen:/);
        transcribeSpans.forEach((cs) => {
          // Channel start from 0
          const channel = Number(cs.name.split(":")[1]);
          drawSttRegionForSpan(
            cs,
            startPoint,
            channel > 0 ? channel - 1 : channel
          );
        });

        const dtmfSpans = getSpansByNameRegex(spans, /dtmf:/);
        dtmfSpans.forEach((ds) => {
          drawDtmfRegionForSpan(ds, startPoint);
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
          <div>Overlay STT and DTMF events</div>
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
