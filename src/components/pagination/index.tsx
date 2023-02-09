import React, { useCallback, useMemo } from "react";
import { Icon } from "@jambonz/ui-kit";

import { Icons } from "../icons";

import "./styles.scss";

type PaginationProps = {
  pageNumber: number;
  setPageNumber: React.Dispatch<React.SetStateAction<number>>;
  maxPageNumber: number;

  /** Sort of "secret" props... */
  nextTo?: number;
  jumpNum?: number;
  showMin?: number;
};

export const Pagination = ({
  pageNumber,
  setPageNumber,
  maxPageNumber,
  nextTo = 1,
  jumpNum = 3,
  showMin = 4,
}: PaginationProps) => {
  const memoizedPages = useMemo(() => {
    return Array(maxPageNumber).fill(0);
  }, [maxPageNumber]);

  const handleSetPageNumber = useCallback(
    (num: number) => {
      setPageNumber(Math.max(1, Math.min(maxPageNumber, num)));
    },
    [maxPageNumber, setPageNumber]
  );

  const handleNumberMapping = useCallback(
    (_: number, index: number) => {
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
    },
    [maxPageNumber, pageNumber]
  );

  return (
    <div className="pagination">
      <button
        type="button"
        disabled={pageNumber === 1}
        onClick={() => handleSetPageNumber(pageNumber - 1)}
      >
        <Icon>
          <Icons.ChevronLeft />
        </Icon>
      </button>
      {memoizedPages.map(handleNumberMapping)}
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
