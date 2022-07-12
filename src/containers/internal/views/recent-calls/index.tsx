import React, { useEffect, useState } from "react";
import { Button, H1, P } from "jambonz-ui";

import { getRecentCalls, getPcap } from "src/api";
import { toastError } from "src/store";
import { Section } from "src/components";

import type { Pcap, RecentCall } from "src/api/types";

export const RecentCalls = () => {
  const [pcap, setPcap] = useState<Pcap>();
  const [calls, setCalls] = useState<RecentCall[]>();

  useEffect(() => {
    let ignore = false;

    getRecentCalls("account-sid")
      .then(({ json }) => {
        if (!ignore) {
          setCalls(json.data);
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
        <P>If the dev server is not running you will get an error toast.</P>
        <P>Otherwise check the browser console to see the data logged...</P>
        <P>&nbsp;</P>
        <P>
          Also this page shows how to fetch a <span>pcap</span> file from the
          API:
        </P>
        <div className="p">
          Selected pcap state object:{" "}
          {pcap ? (
            <>
              <pre>{JSON.stringify(pcap, null, 2)}</pre>
              <a href={pcap.data_url} download={pcap.file_name}>
                Download pcap file
              </a>
            </>
          ) : (
            <strong>undefined</strong>
          )}
        </div>
        <P>&nbsp;</P>
        {calls && (
          <Button
            small
            onClick={() => {
              getPcap(calls[0].account_sid, calls[0].call_sid)
                .then(({ blob }) => {
                  if (blob) {
                    setPcap({
                      data_url: URL.createObjectURL(blob),
                      file_name: `callid-${calls[0].sip_call_id}.pcap`,
                    });
                  }
                })
                .catch((error) => {
                  toastError(error.msg);
                });
            }}
          >
            Fetch pcap
          </Button>
        )}
      </Section>
    </>
  );
};

export default RecentCalls;
