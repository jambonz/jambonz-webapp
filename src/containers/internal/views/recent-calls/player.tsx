import React from "react";

import WaveSurfer from "wavesurfer.js";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@jambonz/ui-kit";
import { Icons } from "src/components";
import { v4 } from "uuid";

type PlayerProps = {
  url: string;
};

export const Player = ({ url }: PlayerProps) => {
  const JUMP_DURATION = 15; //seconds
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const wavesurferId = `wavesurfer--${v4()}`;
  const waveSufferRef = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (waveSufferRef.current !== null) return;
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
    });

    waveSufferRef.current.load(url);
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
  }, []);

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

  return (
    <>
      <div id={wavesurferId} />
      <div className="media-container">
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
            <Icons.ChevronLeft />
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
            <Icons.ChevronRight />
          </Icon>
        </button>
      </div>
    </>
  );
};
