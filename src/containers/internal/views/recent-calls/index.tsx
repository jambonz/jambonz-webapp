import React, { useEffect, useState } from "react";
import {
  Button,
  ButtonGroup,
  H1,
  M,
  // MS,
  P,
} from "jambonz-ui";
import dayjs from "dayjs";

import {
  getRecentCalls,
  // getRecentCall,
  // getPcap,
  useServiceProviderData,
} from "src/api";
import { toastError } from "src/store";
import { Section, AccountFilter, Spinner } from "src/components";

import type {
  Account,
  // Pcap,
  RecentCall,
} from "src/api/types";
import { Selector } from "src/components/forms";
import { hasLength, hasValue } from "src/utils";

export const RecentCalls = () => {
  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const [accountSid, setAccountSid] = useState("");
  const [dateFilter, setDateFilter] = useState("today");
  const [directionFilter, setDirectionFilter] = useState("io");
  const [statusFilter, setStatusFilter] = useState("all");

  const [pageNumber, setPageNumber] = useState(1);
  const [perPageFilter, setPerPageFilter] = useState("25"); // string.....................
  const [maxPageNumber, setMaxPageNumber] = useState(1);

  // const [pcap, setPcap] = useState<Pcap>();
  const [calls, setCalls] = useState<RecentCall[]>();
  const [callsTotal, setCallsTotal] = useState(0);

  const dateSelection = [
    { name: "today", value: "today" },
    { name: "last 7d", value: "7" },
    { name: "last 14d", value: "14" },
    { name: "last 30d", value: "30" },
  ];

  const directionSelection = [
    { name: "either", value: "io" },
    { name: "inbound only", value: "inbound" },
    { name: "outbound only", value: "outbound" },
  ];

  const statusSelection = [
    { name: "all", value: "all" },
    { name: "answered", value: "true" }, // string..........
    { name: "not answered", value: "false" },
  ];

  const perPageSelection = [
    { name: "25 / page", value: "25" },
    { name: "50 / page", value: "50" },
    { name: "100 / page", value: "100" },
  ];

  const phoneNumberFormat = (number: string) => {
    const usaReg = /^(1?)([2-9][0-9]{2})([2-9][0-9]{2})([0-9]{4})$/;
    const match = number.match(usaReg);
    if (match) {
      return `${match[1] ? `+${match[1]} ` : ""}(${match[2]}) ${match[3]}-${
        match[4]
      }`;
    }
    return number;
  };

  useEffect(() => {
    let ignore = false;

    getRecentCalls("account-sid", {
      ...(dateFilter === "today"
        ? { start: dayjs().startOf("date").toISOString() }
        : { days: parseInt(dateFilter) }),
      ...(statusFilter !== "all" && { answered: statusFilter }),
      ...(directionFilter !== "io" && { direction: directionFilter }),
      page: pageNumber,
      count: parseInt(perPageFilter),
    })
      .then(({ json }) => {
        if (!ignore) {
          console.log(json);
          setCalls(json.data);
          setCallsTotal(json.total);
        }
      })
      .catch((error) => {
        toastError(error.msg);
      });

    return function cleanup() {
      ignore = true;
    };
  }, [
    accountSid,
    dateFilter,
    directionFilter,
    statusFilter,
    perPageFilter,
    pageNumber,
  ]);

  useEffect(() => {
    if (pageNumber > maxPageNumber) {
      setPageNumber(maxPageNumber);
    } else if (pageNumber <= 0) {
      setPageNumber(1);
    }
  }, [pageNumber]);

  useEffect(() => {
    setMaxPageNumber(Math.ceil(callsTotal / parseInt(perPageFilter)));
  }, [callsTotal, perPageFilter]);

  return (
    <>
      <section className="mast">
        <H1>Recent Calls</H1>
      </section>
      <section className="filters filters--ender">
        <AccountFilter // half and half
          account={[accountSid, setAccountSid]}
          accounts={accounts}
        />
        <label htmlFor="date_filter">Date: </label>
        <Selector
          name="date_filter"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          options={dateSelection}
        />
        <label htmlFor="direction_filter">Direction: </label>
        <Selector
          name="direction_filter"
          value={directionFilter}
          onChange={(e) => setDirectionFilter(e.target.value)}
          options={directionSelection}
        />
        <label htmlFor="status_filter">Status: </label>
        <Selector
          name="status_filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={statusSelection}
        />
      </section>
      {/* <Section>
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
              getRecentCall(calls[0].account_sid, calls[0].call_sid)
                .then(({ json }) => {
                  if (json.total > 0) {
                    getPcap(calls[0].account_sid, calls[0].call_sid)
                      .then(({ blob }) => {
                        if (blob) {
                          setPcap({
                            data_url: URL.createObjectURL(blob),
                            file_name: `callid-${calls[0].sip_callid}.pcap`,
                          });
                        }
                      })
                      .catch((error) => {
                        toastError(error.msg);
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
      </Section> */}
      <Section {...(hasLength(calls) ? { slim: true } : {})}>
        <div className="list">
          {!hasValue(calls) && <Spinner />}
          {hasLength(calls) ? (
            calls.map((call) => (
              <div
                className="item"
                key={`${call.call_sid}-${call.attempted_at}-p${pageNumber}`}
              >
                <div className="item__info">
                  <div className="item__title">
                    {/* i dont think this is working, it updates every second if button pressed TODO*/}
                    {new Date(call.attempted_at).toLocaleString()}{" "}
                  </div>
                  <div className="item__meta">
                    <div>
                      {call.direction} from {phoneNumberFormat(call.from)} to{" "}
                      {phoneNumberFormat(call.to)} with {call.trunk} for{" "}
                      {call.duration}s
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <M>No data</M>
          )}
        </div>
      </Section>

      <ButtonGroup>
        <P>
          Total: {callsTotal} record{callsTotal === 1 ? "" : "s"}
        </P>
        <Button
          disabled={pageNumber === 1}
          small
          onClick={() => setPageNumber(pageNumber - 1)}
        >
          {"<"}{" "}
          {/* go back will have a problem where the page will be longer, thus we are not at the bottom any more if the next page is shorter TODO*/}
        </Button>
        {hasLength(calls) &&
          Array(maxPageNumber)
            .fill(0)
            .map(
              (_, index) =>
                (pageNumber === index + 1 ||
                  pageNumber - 1 === index + 1 ||
                  pageNumber + 1 === index + 1 ||
                  index === 0 ||
                  index === maxPageNumber - 1) && (
                  <div key={`button-page-${index + 1}`}>
                    {/*make them clickable with style TODO*/}
                    {pageNumber - 1 === index + 1 &&
                      pageNumber > 3 &&
                      "---   "}{" "}
                    <Button
                      subStyle={index + 1 === pageNumber ? "teal" : "grey"} // why cant i make it pink??
                      small
                      onClick={() => setPageNumber(index + 1)}
                    >
                      {index + 1}
                    </Button>
                    {pageNumber + 1 === index + 1 &&
                      maxPageNumber - pageNumber > 2 &&
                      "   ---"}
                  </div>
                )
            )}

        <Button
          disabled={pageNumber === maxPageNumber}
          small
          onClick={() => setPageNumber(pageNumber + 1)}
        >
          {">"}
        </Button>
        <Selector
          name="page_filter"
          value={perPageFilter}
          onChange={(e) => setPerPageFilter(e.target.value)}
          options={perPageSelection}
        />
      </ButtonGroup>
    </>
  );
};

export default RecentCalls;
