import React, { useEffect, useState } from "react";
import { H1, M, Button, Icon, ButtonGroup } from "@jambonz/ui-kit";
import { Link } from "react-router-dom";

import {
  deleteApplication,
  useApiData,
  useServiceProviderDataPaginated,
  listApplicationsPaginated,
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
import { toastError, toastSuccess, useSelectState } from "src/store";
import {
  isUserAccountScope,
  hasLength,
  hasValue,
  useFilteredResults,
} from "src/utils";

import type { Application, Account, CallQuery } from "src/api/types";
import { ScopedAccess } from "src/components/scoped-access";
import { Scope } from "src/store/types";
import { PER_PAGE_SELECTION, USER_ACCOUNT } from "src/api/constants";
import { getAccountFilter, setLocation } from "src/store/localStore";

export const ApplicationsPaginated = () => {
  const user = useSelectState("user");

  const [accountSid, setAccountSid] = useState("");
  // const [application, setApplication] = useState<Application | null>(null);
  const [apiUrl, setApiUrl] = useState("");
  const [applications] = useApiData<Application[]>(apiUrl);
  const [filter, setFilter] = useState("");

  const [pageNumber, setPageNumber] = useState(1);
  const [perPageFilter, setPerPageFilter] = useState("25");
  const [application, setApplication] = useState<Application | null>(null);
  const [, setApplicationsTotalItems] = useState(0);
  const [applicationsTotalPages, setApplicationsTotalPages] = useState(1);
  const query: Partial<CallQuery> = {
    page: pageNumber,
    limit: Number(perPageFilter),
  };
  const [accounts] = useServiceProviderDataPaginated<Account[]>(
    "Accounts",
    query
  );

  const filteredApplications = useFilteredResults<Application>(
    filter,
    applications
  );

  const handleFilterChange = () => {
    const query: Partial<CallQuery> = {
      page: pageNumber,
      limit: Number(perPageFilter),
    };

    if (accountSid) {
      listApplicationsPaginated(accountSid, query)
        .then(({ json }) => {
          if (json) {
            // setApplications(json.data);
            setApplicationsTotalItems(json.total_items);
            setApplicationsTotalPages(json.total_pages);
          }
        })
        .catch((error) => {
          toastError(error.msg);
          setApplication(null);
        });
    }
  };

  const handleDelete = () => {
    if (application) {
      if (isUserAccountScope(accountSid, user)) {
        toastError(
          "You do not have permissions to make changes to this Application"
        );
        return;
      }
      deleteApplication(application.application_sid)
        .then(() => {
          handleFilterChange();
          setApplication(null);
          toastSuccess(
            <>
              Deleted application <strong>{application.name}</strong>
            </>
          );
        })
        .catch((error) => {
          toastError(error.msg);
        });
    }
  };

  useEffect(() => {
    setLocation();
    if (user?.account_sid && user.scope === USER_ACCOUNT) {
      setAccountSid(user?.account_sid);
    } else {
      setAccountSid(getAccountFilter() || accountSid);
    }

    if (accountSid) {
      setApiUrl(`Accounts/${accountSid}/Applications`);
    }

    handleFilterChange();
  }, [accountSid, user]);

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
      <section className="filters filters--spaced">
        <SearchFilter
          placeholder="Filter applications"
          filter={[filter, setFilter]}
        />
        <ScopedAccess user={user} scope={Scope.service_provider}>
          <AccountFilter
            account={[accountSid, setAccountSid]}
            accounts={accounts}
          />
        </ScopedAccess>
      </section>
      <Section {...(hasLength(filteredApplications) && { slim: true })}>
        <div className="list">
          {!hasValue(applications) && hasLength(accounts) ? (
            <Spinner />
          ) : hasLength(filteredApplications) ? (
            filteredApplications.map((application) => {
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
                                  acct.account_sid === application.account_sid
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
      <footer>
        <ButtonGroup>
          <Pagination
            pageNumber={pageNumber}
            setPageNumber={setPageNumber}
            maxPageNumber={applicationsTotalPages}
          />
          <SelectFilter
            id="page_filter"
            filter={[perPageFilter, setPerPageFilter]}
            options={PER_PAGE_SELECTION}
          />
        </ButtonGroup>
      </footer>
      {accountSid && (
        <Section clean>
          <Button small as={Link} to={`${ROUTE_INTERNAL_APPLICATIONS}/add`}>
            Add application
          </Button>
        </Section>
      )}
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

export default ApplicationsPaginated;
