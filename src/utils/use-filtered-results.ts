import { useMemo } from "react";

import { hasValue, hasLength, isObject } from ".";

const fuzzyMatch = (patterns: string[], items: string[]) => {
  const searchableItems = items
    .filter((x) => hasValue(x))
    .map((x) => {
      return isObject(x) ? Object.values(x).join("") : String(x);
    });

  return searchableItems.find((item) => {
    return patterns.some((patternPart) => {
      return item.includes(patternPart);
    });
  });
};

export const useFilteredResults = <Type>(
  rawFilter: string,
  rawCollection: Type[] | undefined
) => {
  const splitFilter = useMemo(() => rawFilter.split(" "), [rawFilter]);
  const filteredCollection = useMemo(() => {
    if (hasLength(rawCollection)) {
      return rawCollection.filter((rawItem) => {
        const values = Object.values(<Record<string, unknown>>rawItem)
          .filter((x) => hasValue(x))
          .flatMap((x) => {
            return isObject(x) ? Object.values(<Record<string, unknown>>x) : x;
          });
        return fuzzyMatch(splitFilter, <string[]>values);
      });
    }

    return [];
  }, [rawCollection, splitFilter]);

  return filteredCollection;
};
