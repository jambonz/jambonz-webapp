import React from "react";
import { Icon } from "jambonz-ui";

import { Icons } from "../icons";

import type { Dispatch, SetStateAction } from "react";

import "./styles.scss";

type PaginationProps = {
  pageNumber: number;
  setPageNumber: Dispatch<SetStateAction<number>>;
  maxPageNumber: number;
};

const nextTo = 1;
const jumpNum = 3;
const showMin = 4; // hard coded and tested for now, if we want something more sophisticated, sure

export const Pagination = ({
  pageNumber,
  setPageNumber,
  maxPageNumber,
}: PaginationProps) => {
  const handleSetPageNumber = (num: number) => {
    setPageNumber(Math.max(1, Math.min(maxPageNumber, num)));
  };

  return (
    <div className="pagi">
      <button
        type="button"
        disabled={pageNumber === 1}
        onClick={() => handleSetPageNumber(pageNumber - 1)}
      >
        <Icon>
          <Icons.ChevronLeft />
        </Icon>
      </button>
      {Array(maxPageNumber)
        .fill(0)
        .map((_, index) => {
          const num = index + 1;

          if (
            pageNumber === num ||
            num === 1 ||
            num === maxPageNumber ||
            (pageNumber > num && pageNumber <= num + nextTo) ||
            (pageNumber < num && pageNumber >= num - nextTo) ||
            (pageNumber <= showMin && num <= showMin) ||
            (maxPageNumber - pageNumber + 1 <= showMin &&
              maxPageNumber - num + 1 <= showMin)
          ) {
            return (
              <button
                type="button"
                onClick={() => handleSetPageNumber(num)}
                key={num}
              >
                {num === pageNumber ? (
                  <Icon>{num}</Icon>
                ) : (
                  <Icon subStyle="grey">{num}</Icon>
                )}
              </button>
            );
          }

          if (
            pageNumber >= showMin
              ? num === pageNumber + nextTo + 1
              : num === showMin + 1
          ) {
            return (
              <button
                key="jump_right"
                type="button"
                onClick={() => handleSetPageNumber(pageNumber + jumpNum)}
              >
                <Icon subStyle="grey">
                  <Icons.MoreHorizontal />
                </Icon>
              </button>
            );
          }

          if (
            maxPageNumber - pageNumber + 1 >= showMin
              ? num === pageNumber - nextTo - 1
              : maxPageNumber - num + 1 === showMin + 1
          ) {
            return (
              <button
                key="jump_left"
                type="button"
                onClick={() => handleSetPageNumber(pageNumber - jumpNum)}
              >
                <Icon subStyle="grey">
                  <Icons.MoreHorizontal />
                </Icon>
              </button>
            );
          }
        })}
      <button
        type="button"
        disabled={pageNumber === maxPageNumber}
        onClick={() => handleSetPageNumber(pageNumber + 1)}
      >
        <Icon>
          <Icons.ChevronRight />
        </Icon>
      </button>
    </div>
  );
};
