import React from "react";

import WaveSurfer from "wavesurfer.js";
import { useEffect, useRef, useState } from "react";
import { Icon, P } from "@jambonz/ui-kit";
import { Icons, Modal, ModalClose } from "src/components";
import { deleteRecord, getBlob, getJaegerTrace } from "src/api";
import { DownloadedBlob, RecentCall } from "src/api/types";
import RegionsPlugin, { Region } from "wavesurfer.js/src/plugin/regions";
import TimelinePlugin from "wavesurfer.js/src/plugin/timeline";
import { API_BASE_URL } from "src/api/constants";
import {
  JaegerRoot,
  JaegerSpan,
  WaveSufferDtmfResult,
  WaveSufferSttResult,
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
  const [waveSufferRegionData, setWaveSufferRegionData] =
    useState<WaveSufferSttResult | null>();
  const [waveSufferDtmfData, setWaveSufferDtmfData] =
    useState<WaveSufferDtmfResult | null>();
  const [regionChecked, setRegionChecked] = useState(false);

  const wavesurferId = `wavesurfer--${call_sid}`;
  const wavesurferTimelineId = `timeline-${wavesurferId}`;
  const waveSufferRef = useRef<WaveSurfer | null>(null);

  const [record, setRecord] = useState<DownloadedBlob | null>(null);

  const [deleteRecordUrl, setDeleteRecordUrl] = useState("");

  const drawDtmfRegionForSpan = (s: JaegerSpan, startPoint: JaegerSpan) => {
    if (waveSufferRef.current) {
      const r = waveSufferRef.current.regions.list[s.spanId];
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
          // as duration of DTMF is short, cannot be shown in wavesuffer,
          // adjust region width here.
          const delta = duration <= 0.1 ? 0.1 : duration;
          const end = start + delta;

          const region = waveSufferRef.current.addRegion({
            id: s.spanId,
            start,
            end,
            color: "rgba(138, 43, 226, 0.15)",
            drag: false,
            loop: false,
            resize: false,
          });
          changeRegionMouseStyle(region);

          const att: WaveSufferDtmfResult = {
            dtmf: dtmfValue.value.stringValue,
            duration: durationValue.value.stringValue,
          };

          region.on("click", () => {
            setWaveSufferDtmfData(att);
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
    if (waveSufferRef.current) {
      const r = waveSufferRef.current.regions.list[s.spanId];
      if (!r) {
        const start =
          (s.startTimeUnixNano - startPoint.startTimeUnixNano) / 1_000_000_000 +
          0.05; // add magic 0.01 second in each region start time to isolate 2 near regions
        const end =
          (s.endTimeUnixNano - startPoint.startTimeUnixNano) / 1_000_000_000;

        const region = waveSufferRef.current.addRegion({
          id: s.spanId,
          start,
          end,
          color: "rgba(255, 0, 0, 0.15)",
          drag: false,
          loop: false,
          resize: false,
        });
        changeRegionMouseStyle(region, channel);
        const [sttResult] = getSpanAttributeByName(s.attributes, "stt.result");
        let att: WaveSufferSttResult;
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
          setWaveSufferRegionData(att);
        });
      }
    }
  };

  const buildWavesufferRegion = () => {
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
    buildWavesufferRegion();
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
    if (waveSufferRef.current !== null || !record) return;
    waveSufferRef.current = WaveSurfer.create({
      container: `#${wavesurferId}`,
      waveColor: "#da1c5c",
      progressColor: "grey",
      height: 50,
      cursorWidth: 1,
      cursorColor: "lightgray",
      normalize: true,
      responsive: true,
      fillParent: true,
      splitChannels: true,
      scrollParent: true,
      plugins: [
        RegionsPlugin.create({}),
        TimelinePlugin.create({
          container: `#${wavesurferTimelineId}`,
        }),
      ],
    });

    waveSufferRef.current.load(record?.data_url);
    // All event should be after load
    waveSufferRef.current.on("finish", () => {
      setIsPlaying(false);
    });

    waveSufferRef.current.on("play", () => {
      setIsPlaying(true);
    });

    waveSufferRef.current.on("pause", () => {
      setIsPlaying(false);
    });

    waveSufferRef.current.on("ready", () => {
      setIsReady(true);
      setPlayBackTime(formatTime(waveSufferRef.current?.getDuration() || 0));
    });

    waveSufferRef.current.on("audioprocess", () => {
      setPlayBackTime(formatTime(waveSufferRef.current?.getCurrentTime() || 0));
    });
  }, [record]);

  const togglePlayback = () => {
    if (waveSufferRef.current) {
      if (!isPlaying) {
        waveSufferRef.current.play();
      } else {
        waveSufferRef.current.pause();
      }
    }
  };

  const setPlaybackJump = (delta: number) => {
    if (waveSufferRef.current) {
      const idx = waveSufferRef.current.getCurrentTime() + delta;
      const value =
        idx <= 0
          ? 0
          : idx >= waveSufferRef.current.getDuration()
          ? waveSufferRef.current.getDuration() - 1
          : idx;
      waveSufferRef.current.setCurrentTime(value);
      setPlayBackTime(formatTime(value));
    }
  };

  if (!record) return null;

  return (
    <>
      <div className="media-container">
        <div id={wavesurferId} />
        <div id={wavesurferTimelineId} />
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
              if (waveSufferRef.current) {
                const regionsList = waveSufferRef.current.regions.list;
                for (const [, region] of Object.entries(regionsList)) {
                  region.element.style.display = e.target.checked ? "" : "none";
                }
              }
            }}
          />
          <div>Overlay STT and DTMF events</div>
        </label>
      </div>
      {waveSufferRegionData && (
        <ModalClose handleClose={() => setWaveSufferRegionData(null)}>
          <div className="spanDetailsWrapper__header">
            <P>
              <strong>Speech to text result</strong>
            </P>
          </div>
          <div className="spanDetailsWrapper">
            <div className="spanDetailsWrapper__detailsWrapper">
              {waveSufferRegionData.vendor && (
                <div className="spanDetailsWrapper__details">
                  <div className="spanDetailsWrapper__details_header">
                    <strong>Vendor:</strong>
                  </div>
                  <div className="spanDetailsWrapper__details_body">
                    {waveSufferRegionData.vendor}
                  </div>
                </div>
              )}
              {waveSufferRegionData.confidence !== 0 && (
                <div className="spanDetailsWrapper__details">
                  <div className="spanDetailsWrapper__details_header">
                    <strong>Confidence:</strong>
                  </div>
                  <div className="spanDetailsWrapper__details_body">
                    {waveSufferRegionData.confidence}
                  </div>
                </div>
              )}
              {waveSufferRegionData.language_code && (
                <div className="spanDetailsWrapper__details">
                  <div className="spanDetailsWrapper__details_header">
                    <strong>Language code:</strong>
                  </div>
                  <div className="spanDetailsWrapper__details_body">
                    {waveSufferRegionData.language_code}
                  </div>
                </div>
              )}
              {waveSufferRegionData.transcript && (
                <div className="spanDetailsWrapper__details">
                  <div className="spanDetailsWrapper__details_header">
                    <strong>Transcript:</strong>
                  </div>
                  <div className="spanDetailsWrapper__details_body">
                    {waveSufferRegionData.transcript}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ModalClose>
      )}
      {waveSufferDtmfData && (
        <ModalClose handleClose={() => setWaveSufferDtmfData(null)}>
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
                  {waveSufferDtmfData.dtmf}
                </div>
              </div>

              <div className="spanDetailsWrapper__details">
                <div className="spanDetailsWrapper__details_header">
                  <strong>Duration:</strong>
                </div>
                <div className="spanDetailsWrapper__details_body">
                  {waveSufferDtmfData.duration}
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
