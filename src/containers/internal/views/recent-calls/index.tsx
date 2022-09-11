import React, { useEffect, useState } from "react";
import { ButtonGroup, H1, M, MS } from "jambonz-ui";
import dayjs from "dayjs";

import {
  getRecentCalls,
  getRecentCall,
  getPcap,
  useServiceProviderData,
} from "src/api";
import { toastError } from "src/store";
import {
  Section,
  AccountFilter,
  Spinner,
  Pagination,
  SelectFilter,
  Icons,
} from "src/components";
import { formatPhoneNumber, hasLength, hasValue } from "src/utils";

import type { Account, CallQuery, Pcap, RecentCall } from "src/api/types";

type PcapButtonProps = {
  call_data: RecentCall;
};

const PcapButton = ({ call_data }: PcapButtonProps) => {
  const [pcap, setPcap] = useState<Pcap>();

  useEffect(() => {
    getRecentCall(call_data.account_sid, call_data.call_sid)
      .then(({ json }) => {
        if (json.total > 0) {
          getPcap(call_data.account_sid, call_data.call_sid)
            .then(({ blob }) => {
              if (blob) {
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
  }, []);

  if (pcap) {
    return (
      <a
        href={pcap.data_url}
        download={pcap.file_name}
        className="btn btn--small pcap"
      >
        Download pcap file
      </a>
    );
  }

  return null;
};

type DetailsItemProps = {
  call: RecentCall;
};

const DetailsItem = ({ call }: DetailsItemProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="item">
      <details
        className="clean"
        onToggle={(e: React.BaseSyntheticEvent) => {
          if (e.target.open && !open) {
            setOpen(e.target.open);
          }
        }}
      >
        <summary>
          <div className="item__info">
            <div className="item__title">
              <strong>
                {dayjs
                  .unix(call.attempted_at / 1000)
                  .format("YYYY MM.DD hh:mm a")}
              </strong>
              <span className="ms i txt--grey">
                <Icons.Clock />
                <span>{call.duration}s</span>
              </span>
            </div>
            <div className="item__meta">
              <div>
                <div className="i txt--teal">
                  {call.direction === "inbound" ? (
                    <Icons.LogIn />
                  ) : (
                    <Icons.LogOut />
                  )}
                  <span>{call.direction}</span>
                </div>
              </div>
              <div>
                <div className="i txt--teal">
                  <Icons.PhoneOutgoing />
                  <span>{formatPhoneNumber(call.from)}</span>
                </div>
              </div>
              <div>
                <div className="i txt--teal">
                  <Icons.PhoneIncoming />
                  <span>{formatPhoneNumber(call.to)}</span>
                </div>
              </div>
            </div>
          </div>
        </summary>
        <div className="item__details">
          <div className="pre-grid">
            {Object.keys(call).map((key) => (
              <React.Fragment key={key}>
                <div>{key}:</div>
                <div>
                  {call[key as keyof typeof call].toString().padStart(10)}
                </div>
              </React.Fragment>
            ))}
          </div>
          {open && <PcapButton call_data={call} />}
        </div>
      </details>
    </div>
  );
};

export const RecentCalls = () => {
  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const [accountSid, setAccountSid] = useState("");
  const [dateFilter, setDateFilter] = useState("today");
  const [directionFilter, setDirectionFilter] = useState("io");
  const [statusFilter, setStatusFilter] = useState("all");

  const [pageNumber, setPageNumber] = useState(1);
  const [perPageFilter, setPerPageFilter] = useState("25");
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
    { name: "answered", value: "true" },
    { name: "not answered", value: "false" },
  ];

  const perPageSelection = [
    { name: "25 / page", value: "25" },
    { name: "50 / page", value: "50" },
    { name: "100 / page", value: "100" },
  ];

  const handleFilterChange = () => {
    const payload: Partial<CallQuery> = {
      page: pageNumber,
      count: Number(perPageFilter),
      ...(dateFilter === "today"
        ? { start: dayjs().startOf("date").toISOString() }
        : { days: Number(dateFilter) }),
      ...(statusFilter !== "all" && { answered: statusFilter }),
      ...(directionFilter !== "io" && { direction: directionFilter }),
    };

    getRecentCalls(accountSid, payload)
      .then(({ json }) => {
        setCalls(json.data);
        setCallsTotal(json.total);
        setMaxPageNumber(Math.ceil(json.total / Number(perPageFilter)));
      })
      .catch((error) => {
        toastError(error.msg);
      });
  };

  useEffect(() => {
    if (accountSid) {
      handleFilterChange();
    }
  }, [
    accountSid,
    pageNumber,
    dateFilter,
    directionFilter,
    statusFilter,
    perPageFilter,
  ]);

  return (
    <>
      <section className="mast">
        <H1>Recent Calls</H1>
      </section>
      {/* Setting overflow-x auto for now until we have a better responsive solution... */}
      <section className="filters filters--multi">
        <AccountFilter
          account={[accountSid, setAccountSid]}
          accounts={accounts}
        />
        <SelectFilter
          id="date_filter"
          label="Date"
          filter={[dateFilter, setDateFilter]}
          options={dateSelection}
        />
        <SelectFilter
          id="direction_filter"
          label="Direction"
          filter={[directionFilter, setDirectionFilter]}
          options={directionSelection}
        />
        <SelectFilter
          id="status_filter"
          label="Status"
          filter={[statusFilter, setStatusFilter]}
          options={statusSelection}
        />
      </section>
      <Section {...(hasLength(calls) ? { slim: true } : {})}>
        <div className="list">
          {!hasValue(calls) && <Spinner />}
          {hasLength(calls) ? (
            calls.map((call) => <DetailsItem key={call.call_sid} call={call} />)
          ) : (
            <div className="item">
              <M>No data</M>
            </div>
          )}
        </div>
      </Section>
      <footer>
        <ButtonGroup>
          <MS>
            Total: {callsTotal} record{callsTotal === 1 ? "" : "s"}
          </MS>
          {hasLength(calls) && (
            <Pagination
              pageNumber={pageNumber}
              setPageNumber={setPageNumber}
              maxPageNumber={maxPageNumber}
            />
          )}
          <SelectFilter
            id="page_filter"
            filter={[perPageFilter, setPerPageFilter]}
            options={perPageSelection}
          />
        </ButtonGroup>
      </footer>
    </>
  );
};

export default RecentCalls;
