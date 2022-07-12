import React, { useEffect } from "react";
import { H1, P } from "jambonz-ui";
import { getRecentCalls } from "src/api";
import { toastError } from "src/store";

import { Section } from "src/components";

export const RecentCalls = () => {
  useEffect(() => {
    let ignore = false;

    getRecentCalls("foo-sid")
      .then(({ json }) => {
        if (!ignore) {
          console.log(json);
        }
      })
      .catch((error) => {
        toastError(error.msg);
      });

    return function cleanup() {
      ignore = true;
    };
  }, []);

  return (
    <>
      <H1>Recent Calls</H1>
      <Section>
        <P>Example using a test dev server for mocked API responses.</P>
        <P>
          To run the dev mock api server run <code>npm run dev:server</code>.
        </P>
        <P>
          You can see the dev server implementation in{" "}
          <code>dev.server.ts</code>
        </P>
        <P>If the dev server is not running you will get an error toast.</P>
        <P>Otherwise check the browser console to see the data logged...</P>
      </Section>
    </>
  );
};

export default RecentCalls;
