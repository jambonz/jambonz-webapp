import React from "react";
import { Spinner } from "src/components";

type PassthroughProps = {
  [key: string]: unknown;
};

export const withSuspense = (Component: React.ComponentType) => {
  return function ComponentWithSuspense(props: PassthroughProps) {
    return (
      <React.Suspense fallback={<Spinner />}>
        <Component {...props} />
      </React.Suspense>
    );
  };
};
