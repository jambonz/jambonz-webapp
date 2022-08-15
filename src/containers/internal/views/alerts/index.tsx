import React, { useEffect } from "react";
import { H1, P } from "jambonz-ui";

import { getAlerts } from "src/api";
import { toastError } from "src/store";
import { Section } from "src/components";

export const Alerts = () => {
  useEffect(() => {
    let ignore = false;

    getAlerts("foo-sid")
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
      <H1>Alerts</H1>
      <Section>
        <P>Example using a test dev server for mocked API responses.</P>
        <P>
          To run the dev mock api server run <code>npm run dev:server</code>.
        </P>
        <P>If the dev server is not running you will get an error toast.</P>
        <P>Otherwise check the browser console to see the data logged...</P>
      </Section>
    </>
  );
};

export default Alerts;
