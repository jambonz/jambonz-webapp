import React from "react";

import { useStateContext } from "src/store";

import type { State } from "src/store/types";

/** HOC for mapping state to props -- use with default exports and React.lazy */
export const withSelectState = <Key extends keyof State>(keys: Key[]) => {
  return function WithSelectState(Component: React.ElementType) {
    return function ComponentWithSelectState(props: {
      [key: string]: unknown;
    }) {
      const state = useStateContext();
      const stateProps: { [key: string]: unknown } = {};

      keys.forEach((key) => {
        stateProps[key] = state[key];
      });

      return <Component {...props} {...stateProps} />;
    };
  };
};
