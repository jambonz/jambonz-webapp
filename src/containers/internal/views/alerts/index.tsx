import React, { useEffect, useState } from "react";
import { ButtonGroup, H1, M, MS } from "jambonz-ui";
import dayjs from "dayjs";

import { getAlerts, useServiceProviderData } from "src/api";
import { toastError } from "src/store";
import {
  AccountFilter,
  Pagination,
  Section,
  SelectFilter,
  Spinner,
} from "src/components";

import type { Account, Alert, PageQuery } from "src/api/types";
import { hasLength, hasValue } from "src/utils";

export const Alerts = () => {
  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const [accountSid, setAccountSid] = useState("");
  const [dateFilter, setDateFilter] = useState("today");

  const [pageNumber, setPageNumber] = useState(1);
  const [perPageFilter, setPerPageFilter] = useState("25");
  const [maxPageNumber, setMaxPageNumber] = useState(1);

  const [alerts, setAlerts] = useState<Alert[]>();
  const [alertsTotal, setAlertsTotal] = useState(0);

  const dateSelection = [
    { name: "today", value: "today" },
    { name: "last 7d", value: "7" },
    { name: "last 14d", value: "14" },
    { name: "last 30d", value: "30" },
  ];

  const perPageSelection = [
    { name: "25 / page", value: "25" },
    { name: "50 / page", value: "50" },
    { name: "100 / page", value: "100" },
  ];

  const handleFilterChange = () => {
    const payload: Partial<PageQuery> = {
      page: pageNumber,
      count: Number(perPageFilter),
      ...(dateFilter === "today"
        ? { start: dayjs().startOf("date").toISOString() }
        : { days: Number(dateFilter) }),
    };

    getAlerts(accountSid, payload)
      .then(({ json }) => {
        setAlerts(json.data);
        setAlertsTotal(json.total);
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
  }, [accountSid, pageNumber, dateFilter, perPageFilter]);

  return (
    <>
      <section className="mast">
        <H1 className="h2">Alerts</H1>
      </section>
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
      </section>
      <Section {...(hasLength(alerts) ? { slim: true } : {})}>
        <div className="list">
          {!hasValue(alerts) && <Spinner />}
          {hasLength(alerts) ? (
            alerts.map((alert) => (
              <div key={`${alert.alert_type}-${alert.time}`}>
                {dayjs.unix(alert.time / 1000).format("YYYY MM.DD hh:mm a")}{" "}
                {alert.message}
              </div>
            ))
          ) : (
            <M>No data</M>
          )}
        </div>
      </Section>
      <footer>
        <ButtonGroup>
          <MS>
            Total: {alertsTotal} record{alertsTotal === 1 ? "" : "s"}
          </MS>
          {hasLength(alerts) && (
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

export default Alerts;
