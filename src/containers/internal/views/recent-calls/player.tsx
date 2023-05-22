import React from "react";

import WaveSurfer from "wavesurfer.js";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@jambonz/ui-kit";
import { Icons } from "src/components";
import { getBlob } from "src/api";
import { DownloadedBlob } from "src/api/types";

type PlayerProps = {
  call_sid: string;
  url: string;
};

export const Player = ({ url, call_sid }: PlayerProps) => {
  const JUMP_DURATION = 15; //seconds
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [playBackTime, setPlayBackTime] = useState("");

  const wavesurferId = `wavesurfer--${call_sid}`;
  const waveSufferRef = useRef<WaveSurfer | null>(null);

  const [record, setRecord] = useState<DownloadedBlob | null>(null);
  useEffect(() => {
    getBlob(url).then(({ blob }) => {
      if (blob) {
        setRecord({
          data_url: URL.createObjectURL(blob),
          file_name: `callid-${call_sid}.wav`,
        });
      }
    });
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
        <div className="media-container__center">
          <strong>{playBackTime}</strong>
        </div>
        <div className="media-container__center">
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
          <a
            href={record.data_url}
            download={record.file_name}
            className="btnty"
            title="Download wav file"
          >
            <Icon>
              <Icons.Download />
            </Icon>
          </a>
        </div>
      </div>
    </>
  );
};
