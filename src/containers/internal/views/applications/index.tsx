import React, { useEffect, useState } from "react";
import { H1, M, Button, Icon } from "jambonz-ui";
import { Link } from "react-router-dom";

import { deleteApplication, getFetch, useServiceProviderData } from "src/api";
import { API_ACCOUNTS } from "src/api/constants";
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
} from "src/components";
import { DeleteApplication } from "./delete";
import { toastError, toastSuccess, useSelectState } from "src/store";
import { hasLength, hasValue, useFilteredResults } from "src/utils";

import type { Application, Account } from "src/api/types";

export const Applications = () => {
  const currentServiceProvider = useSelectState("currentServiceProvider");
  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const [accountSid, setAccountSid] = useState("");
  const [application, setApplication] = useState<Application | null>(null);
  const [applications, setApplications] = useState<Application[]>();
  const [filter, setFilter] = useState("");

  const filteredApplications = useFilteredResults<Application>(
    filter,
    applications
  );

  const getApplications = () => {
    getFetch<Application[]>(`${API_ACCOUNTS}/${accountSid}/Applications`)
      .then(({ json }) => setApplications(json))
      .catch((error) => {
        toastError(error.msg);
      });
  };

  const handleDelete = () => {
    if (application) {
      deleteApplication(application.application_sid)
        .then(() => {
          getApplications();
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
    if (accountSid) {
      getApplications();
    } else if (accounts && !accounts.length) {
      setApplications([]);
    }
  }, [accountSid, accounts]);

  useEffect(() => {
    return function cleanup() {
      setAccountSid("");
      setApplications(undefined);
    };
  }, [currentServiceProvider]);

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
        <AccountFilter
          account={[accountSid, setAccountSid]}
          accounts={accounts}
        />
      </section>
      <Section {...(hasLength(filteredApplications) ? { slim: true } : {})}>
        <div className="list">
          {!hasValue(applications) && <Spinner />}
          {hasLength(filteredApplications) ? (
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

export default Applications;
