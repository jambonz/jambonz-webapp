import React, { useEffect, useState } from "react";
import { H1, M, Button, Icon } from "jambonz-ui";
import { Link } from "react-router-dom";

import { deleteApplication, getFetch, useServiceProviderData } from "src/api";
import { API_ACCOUNTS } from "src/api/constants";
import {
  ROUTE_INTERNAL_APPLICATIONS,
  ROUTE_INTERNAL_ACCOUNTS,
} from "src/router/routes";
import { Icons, Section, Spinner, AccountFilter } from "src/components";
import { DeleteApplication } from "./delete";
import { toastError, toastSuccess } from "src/store";
import { hasLength } from "src/utils";

import type { Application, Account } from "src/api/types";

export const Applications = () => {
  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const [accountSid, setAccountSid] = useState("");
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [application, setApplication] = useState<Application | null>(null);

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
    } else {
      setApplications([]);
    }
  }, [accountSid]);

  return (
    <>
      <section className="mast">
        <H1>Applications</H1>
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
      <section className="filters filters--ender">
        <AccountFilter
          account={[accountSid, setAccountSid]}
          accounts={accounts}
        />
      </section>
      <Section {...(hasLength(applications) ? { slim: true } : {})}>
        <div className="list">
          {applications ? (
            applications.length > 0 ? (
              applications.map((application) => {
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
                        className=""
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
              <M>No applications yet.</M>
            ) : (
              <M>
                You must{" "}
                <Link to={`${ROUTE_INTERNAL_ACCOUNTS}/add`}>
                  create an account
                </Link>{" "}
                before you can create an application.
              </M>
            )
          ) : (
            <Spinner />
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
