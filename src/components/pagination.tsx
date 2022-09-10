import React from "react";

type PaginationProps = {
  pageNumber: number;
  setPageNumber: React.Dispatch<React.SetStateAction<number>>;
  maxPageNumber: number;
};

export const Pagination = ({
  pageNumber,
  setPageNumber,
  maxPageNumber,
}: PaginationProps) => {
  // uhhh
  const nextTo = 1;
  const jumpNum = 3;

  return (
    <>
      <button
        type="button"
        disabled={pageNumber === 1}
        onClick={() => setPageNumber(pageNumber - 1)}
      >
        {"<"}
      </button>
      {Array(maxPageNumber) // also show 3 when the selected is 1? it is getting complicated
        .fill(0)
        .map((_, index) =>
          pageNumber === index + 1 ||
          index + 1 === 1 ||
          index + 1 === maxPageNumber ||
          (pageNumber > index + 1 && pageNumber <= index + 1 + nextTo) ||
          (pageNumber < index + 1 && pageNumber >= index + 1 - nextTo) ? (
            <button
              type="button"
              onClick={() => setPageNumber(index + 1)}
              key={index + 1}
            >
              {index + 1}
            </button>
          ) : (
            (index + 1 === pageNumber + nextTo + 1 && (
              <button
                key="jump_right"
                name="jump_right"
                type="button"
                onClick={() => setPageNumber(pageNumber + jumpNum)}
              >
                ...
              </button>
            )) ||
            (index + 1 === pageNumber - nextTo - 1 && (
              <button
                key="jump_left"
                name="jump_left"
                type="button"
                onClick={() => setPageNumber(pageNumber - jumpNum)}
              >
                ...
              </button>
            ))
          )
        )}
      <button
        type="button"
        disabled={pageNumber === maxPageNumber}
        onClick={() => setPageNumber(pageNumber + 1)}
      >
        {">"}
      </button>
    </>
  );
};
