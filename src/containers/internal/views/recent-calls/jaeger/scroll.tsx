import React, { useState } from "react";
import { JaegerGroup } from "src/api/jaeger-types";
import { Button } from "@jambonz/ui-kit";
import "./styles.scss";

type ScrollProps = {
  groups: JaegerGroup[];
  barGroupRef: React.RefObject<HTMLDivElement>;
};

export const Scroll = ({ groups, barGroupRef }: ScrollProps) => {
  const [scrollPos, setScrollPos] = useState<number>(0);

  const goLeft = () => {
    if (barGroupRef.current) {
      if (groups) {
        const pos =
          barGroupRef.current.scrollLeft - barGroupRef.current.offsetWidth;
        const positions = groups
          .map((value) => value.startPx)
          .filter((value) => value < pos)
          .sort((a, b) => b - a);
        if (positions.length > 0) {
          barGroupRef.current.scrollLeft = positions[0] - 800;
          const viewPortRatio =
            (barGroupRef.current.offsetWidth + 100) /
            barGroupRef.current.scrollWidth;
          setScrollPos(viewPortRatio * positions[0]);
        }
      }
    }
  };

  const goRight = () => {
    if (barGroupRef.current) {
      if (groups) {
        const pos =
          barGroupRef.current.scrollLeft + barGroupRef.current.offsetWidth;
        const positions = groups
          .map((value) => value.startPx)
          .filter((value) => value > pos)
          .sort((a, b) => a - b);
        console.log(pos, positions);
        if (positions.length > 0) {
          barGroupRef.current.scrollLeft = positions[0];
          const viewPortRatio =
            (barGroupRef.current.offsetWidth - 130) /
            barGroupRef.current.scrollWidth;
          setScrollPos(viewPortRatio * positions[0]);
        }
      }
    }
  };

  return (
    <div className="scroll-buttons">
      <Button
        small
        type="button"
        style={{ borderRadius: "0px" }}
        onClick={goLeft}
      >
        &lt;
      </Button>
      <div
        className="scroll-buttons__track"
        style={{ paddingLeft: `${scrollPos}px` }}
      >
        <div className="scroll-buttons__thumb"></div>
      </div>
      <Button
        small
        type="button"
        style={{ borderRadius: "0px" }}
        onClick={goRight}
      >
        &gt;
      </Button>
    </div>
  );
};
