import React, { useEffect, useState } from "react";
import { ButtonGroup, H1, M, MS } from "jambonz-ui";
import dayjs from "dayjs";

import { getRecentCalls, useServiceProviderData } from "src/api";
import { toastError } from "src/store";
import {
  Section,
  AccountFilter,
  Spinner,
  Pagination,
  SelectFilter,
} from "src/components";
import { hasLength, hasValue } from "src/utils";
import { DetailsItem } from "./details";

import type { Account, CallQuery, RecentCall } from "src/api/types";

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
  }, [accountSid, pageNumber, dateFilter, directionFilter, statusFilter]);

  return (
    <>
      <section className="mast">
        <H1 className="h2">Recent Calls</H1>
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
            <M>No data</M>
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
            handleSelect={() => setPageNumber(1)}
          />
        </ButtonGroup>
      </footer>
    </>
  );
};

export default RecentCalls;
