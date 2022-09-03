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
      {Array(maxPageNumber)
        .fill(0)
        .map(
          (_, index) =>
            (pageNumber === index + 1 ||
              (pageNumber > index + 1 && pageNumber <= index + 1 + nextTo) ||
              (pageNumber < index + 1 && pageNumber >= index + 1 - nextTo) ||
              index === 0 ||
              index === maxPageNumber - 1) && (
              <div key={`button-page-${index + 1}`}>
                {index + 1 === pageNumber - nextTo && index + 1 > 1 + nextTo && (
                  <button
                    type="button"
                    onClick={() => setPageNumber(index - jumpNum)}
                  >
                    ...
                  </button>
                )}
                <button type="button" onClick={() => setPageNumber(index + 1)}>
                  {index + 1}
                </button>
                {index + 1 === pageNumber + nextTo &&
                  index + 1 < maxPageNumber - nextTo && (
                    <button
                      type="button"
                      onClick={() => setPageNumber(index + jumpNum)}
                    >
                      ...
                    </button>
                  )}
              </div>
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
