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

  useEffect(() => {
    if (waveSufferRef.current !== null || !record) return;
    waveSufferRef.current = WaveSurfer.create({
      container: `#${wavesurferId}`,
      waveColor: "grey",
      progressColor: "#da1c5c",
      height: 70,
      cursorWidth: 1,
      cursorColor: "lightgray",
      barWidth: 2,
      normalize: true,
      responsive: true,
      fillParent: true,
      splitChannels: true,
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
    }
  };

  if (!record) return null;

  return (
    <>
      <div className="media-container">
        <div id={wavesurferId} />
        <div className="media-container__buttons">
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
