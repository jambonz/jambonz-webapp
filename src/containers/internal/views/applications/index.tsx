import React, { useEffect, useState } from "react";
import { H1, Button, Icon } from "jambonz-ui";
import { Link } from "react-router-dom";

import { deleteApplication, getApplications, getFetch } from "src/api";
import { API_APPLICATIONS } from "src/api/constants";
import { ROUTE_INTERNAL_APPLICATIONS } from "src/router/routes";
import { Icons, Section, Spinner, AccountFilter } from "src/components";
import { DeleteApplication } from "./delete";
import { toastError, toastSuccess } from "src/store";

import type { Application } from "src/api/types";

export const Applications = () => {
  const [accountSid, setAccountSid] = useState("");
  const [accountName] = useState("");
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [application, setApplication] = useState<Application | null>(null);

  const [refetch, setRefetch] = useState(0);

  const handleDelete = () => {
    if (application) {
      deleteApplication(application.application_sid)
        .then(() => {
          setRefetch(refetch + 1);
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
      getApplications(accountSid)
        .then(({ json }) => setApplications(json))
        .catch((error) => {
          toastError(error.msg);
        });
    } else {
      // accountSid is null is "All accounts"
      getFetch<Application[]>(API_APPLICATIONS)
        .then(({ json }) => setApplications(json))
        .catch((error) => {
          toastError(error.msg);
        });
    }
  }, [accountSid, refetch]);

  return (
    <>
      <section className="mast">
        <H1>Applications</H1>
        <Link
          to={`${ROUTE_INTERNAL_APPLICATIONS}/add`}
          title="Add an application"
        >
          <Icon>
            <Icons.Plus />
          </Icon>
        </Link>
      </section>
      <section className="filters">
        <AccountFilter
          label="Used by"
          account={[accountSid, setAccountSid]}
          // accountName={[setAccountName]}
          defaultOption
        />
      </section>
      <Section
        {...(applications && applications.length > 0 ? { slim: true } : {})}
      >
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
                      <div className="item__sid">
                        <strong>SID:</strong>{" "}
                        <code>{application.application_sid}</code>
                      </div>
                      {!accountSid && accountName && (
                        <div className="item_account">
                          <strong>Account:</strong> <code>{accountName}</code>
                        </div>
                      )}
                      <div className="item__calling">
                        <strong>Calling Webhook:</strong>{" "}
                        <code>{application.call_hook?.url}</code>
                      </div>
                      <div className="item__callstatus">
                        <strong>Call Status Webhook:</strong>{" "}
                        <code>{application.call_status_hook?.url}</code>
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
                        className="btn--type"
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div>No applications yet.</div>
            )
          ) : (
            <Spinner />
          )}
        </div>
      </Section>
      <Section clean>
        <Button small as={Link} to={`${ROUTE_INTERNAL_APPLICATIONS}/add`}>
          Add application
        </Button>
      </Section>
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
