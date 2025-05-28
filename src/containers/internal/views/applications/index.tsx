import React, { useEffect, useState, useRef } from "react";
import { H1, M, Button, Icon, ButtonGroup, MS } from "@jambonz/ui-kit";
import { Link } from "react-router-dom";

import {
  deleteApplication,
  useServiceProviderData,
  getApplications,
} from "src/api";
import {
  ROUTE_INTERNAL_APPLICATIONS,
  ROUTE_INTERNAL_ACCOUNTS,
} from "src/router/routes";
import {
  Icons,
  Section,
  Spinner,
  AccountFilter,
  SearchFilter,
  Pagination,
  SelectFilter,
} from "src/components";
import { DeleteApplication } from "./delete";
import { useSelectState } from "src/store";
import { isUserAccountScope, hasLength, hasValue } from "src/utils";

import type { Application, Account } from "src/api/types";
import { ScopedAccess } from "src/components/scoped-access";
import { Scope } from "src/store/types";
import { PER_PAGE_SELECTION, USER_ACCOUNT } from "src/api/constants";
import { getAccountFilter, setLocation } from "src/store/localStore";
import { useToast } from "src/components/toast/toast-provider";

export const Applications = () => {
  const { toastError, toastSuccess } = useToast();
  const user = useSelectState("user");
  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const [accountSid, setAccountSid] = useState("");
  const [application, setApplication] = useState<Application | null>(null);
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [filter, setFilter] = useState("");

  const [applicationsTotal, setApplicationsTotal] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [perPageFilter, setPerPageFilter] = useState("25");
  const [maxPageNumber, setMaxPageNumber] = useState(1);

  // Track previous values to detect changes
  const prevValuesRef = useRef({
    accountSid: "",
    filter: "",
    pageNumber: 1,
    perPageFilter: "25",
  });

  const fetchApplications = (resetPage = false) => {
    // Don't fetch if no account is selected
    if (!accountSid) return;

    setApplications(null);

    // Calculate the correct page to use
    const currentPage = resetPage ? 1 : pageNumber;

    // If we're resetting the page, also update the state
    if (resetPage && pageNumber !== 1) {
      setPageNumber(1);
    }

    getApplications(accountSid, {
      page: currentPage,
      page_size: Number(perPageFilter),
      ...(filter && { name: filter }),
    })
      .then(({ json }) => {
        setApplications(json.data);
        setApplicationsTotal(json.total);
        setMaxPageNumber(Math.ceil(json.total / Number(perPageFilter)));
      })
      .catch((error) => {
        setApplications([]);
        toastError(error.msg);
      });
  };

  const handleDelete = () => {
    if (application) {
      if (isUserAccountScope(accountSid, user)) {
        toastError(
          "You do not have permissions to make changes to this Application",
        );
        return;
      }
      deleteApplication(application.application_sid)
        .then(() => {
          fetchApplications(false);
          setApplication(null);
          toastSuccess(
            <>
              Deleted application <strong>{application.name}</strong>
            </>,
          );
        })
        .catch((error) => {
          toastError(error.msg);
        });
    }
  };

  // Set initial account
  useEffect(() => {
    if (user?.account_sid && user.scope === USER_ACCOUNT) {
      setAccountSid(user?.account_sid);
    } else {
      setAccountSid(
        getAccountFilter() || accountSid || accounts?.[0]?.account_sid || "",
      );
    }
    setLocation();
  }, [user, accounts]);

  // This single effect handles all data fetching triggers
  useEffect(() => {
    const accSid = accountSid || getAccountFilter() || "";

    if (!accSid) return;

    // Determine if the change requires a page reset
    const prevValues = prevValuesRef.current;
    const isFilterChange =
      prevValues.accountSid !== accountSid || prevValues.filter !== filter;

    const isPageSizeChange =
      prevValues.perPageFilter !== perPageFilter &&
      prevValues.perPageFilter !== ""; // Skip initial render

    // Update ref with current values for next comparison
    prevValuesRef.current = {
      accountSid: accSid,
      filter,
      pageNumber,
      perPageFilter,
    };

    // Fetch data with page reset if needed
    fetchApplications(isFilterChange || isPageSizeChange);
  }, [accountSid, filter, pageNumber, perPageFilter]);

  return (
    <>
      <section className="mast">
        <H1 className="h2">Applications</H1>
        {accountSid && (
          <Link
            to={`${ROUTE_INTERNAL_APPLICATIONS}/add`}
            title="Add an application"
          >
            <Icon>
              <Icons.Plus />
            </Icon>
          </Link>
        )}
      </section>
      <section className="filters filters--multi">
        <SearchFilter
          placeholder="Filter applications"
          filter={[filter, setFilter]}
          delay={1000}
        />
        <ScopedAccess user={user} scope={Scope.service_provider}>
          <AccountFilter
            account={[accountSid, setAccountSid]}
            accounts={accounts}
          />
        </ScopedAccess>
      </section>
      <Section {...(hasLength(applications) && { slim: true })}>
        <div className="list">
          {!hasValue(applications) && hasLength(accounts) ? (
            <Spinner />
          ) : hasLength(applications) ? (
            applications
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((application) => {
                return (
                  <div className="item" key={application.application_sid}>
                    <div className="item__info">
                      <div className="item__title">
                        <Link
                          to={`${ROUTE_INTERNAL_APPLICATIONS}/${application.application_sid}/edit`}
                          title="Edit application"
                          className="i"
                        >
                          <strong>{application.name}</strong>
                          <Icons.ArrowRight />
                        </Link>
                      </div>
                      <div className="item__meta">
                        <div>
                          <div
                            className={`i txt--${
                              application.account_sid ? "teal" : "grey"
                            }`}
                          >
                            <Icons.Activity />
                            <span>
                              {
                                accounts?.find(
                                  (acct) =>
                                    acct.account_sid ===
                                    application.account_sid,
                                )?.name
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="item__actions">
                      <Link
                        to={`${ROUTE_INTERNAL_APPLICATIONS}/${application.application_sid}/edit`}
                        title="Edit application"
                      >
                        <Icons.Edit3 />
                      </Link>
                      <button
                        type="button"
                        title="Delete application"
                        onClick={() => setApplication(application)}
                        className="btnty"
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  </div>
                );
              })
          ) : accountSid ? (
            <M>No applications.</M>
          ) : (
            <M>
              You must{" "}
              <Link to={`${ROUTE_INTERNAL_ACCOUNTS}/add`}>
                create an account
              </Link>{" "}
              before you can create an application.
            </M>
          )}
        </div>
      </Section>
      {accountSid && (
        <Section clean>
          <Button small as={Link} to={`${ROUTE_INTERNAL_APPLICATIONS}/add`}>
            Add application
          </Button>
        </Section>
      )}
      <footer>
        <ButtonGroup>
          <MS>
            Total: {applicationsTotal} record
            {applicationsTotal === 1 ? "" : "s"}
          </MS>
          {hasLength(applications) && (
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
      {application && (
        <DeleteApplication
          application={application}
          handleCancel={() => setApplication(null)}
          handleSubmit={handleDelete}
        />
      )}
    </>
  );
};

export default Applications;
