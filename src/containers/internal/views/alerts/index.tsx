import React, { useEffect, useMemo, useState } from "react";
import { ButtonGroup, H1, M, MS } from "@jambonz/ui-kit";
import dayjs from "dayjs";

import { getAlerts, useServiceProviderData } from "src/api";
import {
  DATE_SELECTION,
  PER_PAGE_SELECTION,
  USER_ACCOUNT,
} from "src/api/constants";
import { toastError, useSelectState } from "src/store";
import { hasLength, hasValue } from "src/utils";
import {
  AccountFilter,
  Pagination,
  Section,
  SelectFilter,
  Spinner,
  Icons,
} from "src/components";

import type { Account, Alert, PageQuery } from "src/api/types";
import { ScopedAccess } from "src/components/scoped-access";
import { Scope } from "src/store/types";
import {
  getAccountFilter,
  getQueryFilter,
  setLocation,
} from "src/store/localStore";

export const Alerts = () => {
  const user = useSelectState("user");
  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const [accountSid, setAccountSid] = useState("");
  const [dateFilter, setDateFilter] = useState("today");

  const [pageNumber, setPageNumber] = useState(1);
  const [perPageFilter, setPerPageFilter] = useState("25");
  const [maxPageNumber, setMaxPageNumber] = useState(1);

  const [alerts, setAlerts] = useState<Alert[]>();
  const [alertsTotal, setAlertsTotal] = useState(0);

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
        setAlerts([]);
      });
  };

  useMemo(() => {
    if (getQueryFilter()) {
      const [date] = getQueryFilter().split("/");
      setAccountSid(getAccountFilter() || accountSid);
      if (!accountSid && user?.account_sid) setAccountSid(user?.account_sid);
      setDateFilter(date);
    }
  }, [accountSid]);

  useEffect(() => {
    setLocation();
    if (user?.account_sid && user.scope === USER_ACCOUNT) {
      setAccountSid(user?.account_sid);
    }

    if (accountSid) {
      handleFilterChange();
    }
  }, [user, accountSid, pageNumber, dateFilter]);

  /** Reset page number when filters change */
  useEffect(() => {
    setPageNumber(1);
  }, [accountSid, dateFilter]);

  return (
    <>
      <section className="mast">
        <H1 className="h2">Alerts</H1>
      </section>
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
          options={DATE_SELECTION.slice(0, 2)}
        />
      </section>
      <Section {...(hasLength(alerts) && { slim: true })}>
        <div className="list">
          {!hasValue(alerts) && hasLength(accounts) ? (
            <Spinner />
          ) : hasLength(alerts) ? (
            alerts.map((alert) => (
              <div className="item" key={`${alert.alert_type}-${alert.time}`}>
                <div className="item__info">
                  <div className="item__title txt--jam">
                    <strong>
                      {dayjs(alert.time).format("YYYY MM.DD hh:mm a")}
                    </strong>
                  </div>
                  <div className="item__meta">
                    <div className="i">
                      <Icons.AlertCircle />
                      <span>{alert.message}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <M>No data.</M>
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
            options={PER_PAGE_SELECTION}
          />
        </ButtonGroup>
      </footer>
    </>
  );
};

export default Alerts;
