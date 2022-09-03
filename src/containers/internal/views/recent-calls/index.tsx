import React, { useEffect, useState } from "react";
import { ButtonGroup, H1, M, P } from "jambonz-ui";
import dayjs from "dayjs";

import {
  getRecentCalls,
  getRecentCall,
  getPcap,
  useServiceProviderData,
} from "src/api";
import { toastError } from "src/store";
import { Section, AccountFilter, Spinner, Pagination } from "src/components";

import type { Account, CallQuery, Pcap, RecentCall } from "src/api/types";
import { Selector } from "src/components/forms";
import { formatPhoneNumber, hasLength, hasValue } from "src/utils";

export const RecentCalls = () => {
  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const [accountSid, setAccountSid] = useState("");
  const [dateFilter, setDateFilter] = useState("today");
  const [directionFilter, setDirectionFilter] = useState("io");
  const [statusFilter, setStatusFilter] = useState("all");

  const [pageNumber, setPageNumber] = useState(1);
  const [perPageFilter, setPerPageFilter] = useState("25"); // string.....................
  const [maxPageNumber, setMaxPageNumber] = useState(1);

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
    { name: "not answered", value: "false" }, // string...
  ];

  const perPageSelection = [
    { name: "25 / page", value: "25" },
    { name: "50 / page", value: "50" },
    { name: "100 / page", value: "100" },
  ];

  // i guess this is just temporary until proper style is there?
  type JustFilterProps = {
    get: string | number;
    set: React.Dispatch<React.SetStateAction<string>>;
    label: string;
    name: string;
    options: { name: string; value: string }[];
  };
  const JustFilter = (props: JustFilterProps) => {
    return (
      <div className={props.name}>
        <label htmlFor={props.name}>{props.label}</label>
        <select
          name={props.name}
          value={props.get}
          onChange={(e) => props.set(e.target.value)}
        >
          {props.options.map((option) => (
            <option key={`${props.name}-${option.value}`} value={option.value}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
    );
  };

  type PcapButtonProp = {
    call_data: RecentCall;
  };
  const PcapButton = ({ call_data }: PcapButtonProp) => {
    console.log("this runs");
    const [pcap, setPcap] = useState<Pcap>();

    // not sure why but this get recent call will prevent tons of freezing requests
    // still, it is sending a lot of requests right now
    useEffect(() => {
      getRecentCall(call_data.account_sid, call_data.call_sid)
        .then(({ json }) => {
          if (json.total > 0) {
            getPcap(call_data.account_sid, call_data.call_sid)
              .then(({ blob }) => {
                if (blob) {
                  console.log(blob);
                  setPcap({
                    data_url: URL.createObjectURL(blob),
                    file_name: `callid-${call_data.sip_callid}.pcap`,
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
    }, [call_data, setPcap]);

    return (
      <div className="p">
        {pcap ? (
          <>
            <a href={pcap.data_url} download={pcap.file_name}>
              Download pcap file
            </a>
          </>
        ) : (
          <strong>undefined</strong>
        )}
      </div>
    );
  };

  const handleFilterChange = () => {
    if (pageNumber >= maxPageNumber) {
      setPageNumber(maxPageNumber);
    } else if (pageNumber <= 0) {
      setPageNumber(1);
    }

    const payload: Partial<CallQuery> = {
      page: pageNumber,
      count: parseInt(perPageFilter, 10),
      ...(dateFilter === "today"
        ? { start: dayjs().startOf("date").toISOString() }
        : { days: parseInt(dateFilter, 10) }),
      ...(statusFilter !== "all" &&
        (statusFilter === "true" ? { answered: true } : { answered: false })),
      ...(directionFilter !== "io" && { direction: directionFilter }),
    };

    getRecentCalls("account-sid", payload)
      .then(({ json }) => {
        console.log(json);
        setCalls(json.data);
        setCallsTotal(json.total);
        setMaxPageNumber(Math.ceil(json.total / parseInt(perPageFilter, 10)));
      })
      .catch((error) => {
        toastError(error.msg);
      });
  };

  useEffect(() => {
    if (pageNumber === 1) {
      handleFilterChange();
    } else {
      setPageNumber(1);
    }
  }, [accountSid, dateFilter, directionFilter, statusFilter, perPageFilter]);

  useEffect(() => {
    handleFilterChange();
  }, [pageNumber, perPageFilter]);

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

      <Section {...(hasLength(calls) ? { slim: true } : {})}>
        <div className="list">
          {!hasValue(calls) && <Spinner />}
          {hasLength(calls) ? (
            calls.map((call) => (
              <div
                className="item"
                key={`${call.call_sid}-${call.attempted_at}-p${pageNumber}`}
              >
                <details>
                  <summary>
                    <div className="item__info">
                      <div className="item__title">
                        {/*it updates if button pressed??*/}
                        {dayjs
                          .unix(call.attempted_at / 1000)
                          .format("YYYY MM.DD hh:mm a")}
                      </div>
                      <div className="item__meta">
                        <div>
                          {call.direction} from {formatPhoneNumber(call.from)}{" "}
                          to {formatPhoneNumber(call.to)} with {call.trunk} for{" "}
                          {call.duration}s
                        </div>
                      </div>
                    </div>
                  </summary>
                  {Object.keys(call).map((key) => (
                    <div key={key}>{`${key}: ${call[key as keyof typeof call]
                      .toString()
                      .padStart(10)}`}</div>
                  ))}
                  <PcapButton call_data={call} />
                </details>
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
        {hasLength(calls) && (
          <Pagination
            pageNumber={pageNumber}
            setPageNumber={setPageNumber}
            maxPageNumber={maxPageNumber}
          />
        )}
        <JustFilter
          get={perPageFilter}
          set={setPerPageFilter}
          label=""
          name="page_filter"
          options={perPageSelection}
        />
      </ButtonGroup>
    </>
  );
};

export default RecentCalls;
