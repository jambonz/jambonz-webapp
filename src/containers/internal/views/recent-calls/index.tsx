import React, { useEffect, useState } from "react";
import { ButtonGroup, H1, M, MS } from "jambonz-ui";
import dayjs from "dayjs";

import { getRecentCalls, useServiceProviderData } from "src/api";
import {
  DATE_SELECTION,
  PER_PAGE_SELECTION,
  USER_ACCOUNT,
} from "src/api/constants";
import { toastError, useSelectState } from "src/store";
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
import { ScopedAccess } from "src/components/scoped-access";
import { Scope } from "src/store/types";

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

export const RecentCalls = () => {
  const user = useSelectState("user");
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
        setCalls([]);
      });
  };

  useEffect(() => {
    if (accountSid) {
      handleFilterChange();
    }
  }, [accountSid, pageNumber, dateFilter, directionFilter, statusFilter]);

  /** Reset page number when filters change */
  useEffect(() => {
    if (user?.account_sid && user.scope === USER_ACCOUNT) {
      setAccountSid(user?.account_sid);
    }

    setPageNumber(1);
  }, [user, accountSid, dateFilter, directionFilter, statusFilter]);

  return (
    <>
      <section className="mast">
        <H1 className="h2">Recent calls</H1>
      </section>
      {/* Setting overflow-x auto for now until we have a better responsive solution... */}
      <section className="filters filters--multi">
        <ScopedAccess user={user} scope={Scope.service_provider}>
          <AccountFilter
            account={[accountSid, setAccountSid]}
            accounts={accounts}
          />
        </ScopedAccess>
        <SelectFilter
          id="date_filter"
          label="Date"
          filter={[dateFilter, setDateFilter]}
          options={DATE_SELECTION}
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
      <Section {...(hasLength(calls) && { slim: true })}>
        <div className="list">
          {!hasValue(calls) && hasLength(accounts) ? (
            <Spinner />
          ) : hasLength(calls) ? (
            calls.map((call) => <DetailsItem key={call.call_sid} call={call} />)
          ) : (
            <M>No data.</M>
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
            options={PER_PAGE_SELECTION}
          />
        </ButtonGroup>
      </footer>
    </>
  );
};

export default RecentCalls;
