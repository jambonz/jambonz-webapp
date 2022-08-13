import React, { useState } from "react";
import { H1, Button, Icon } from "jambonz-ui";
import { Link } from "react-router-dom";

import { useApiData, deleteApplication } from "src/api";
import { ROUTE_INTERNAL_APPLICATIONS } from "src/router/routes";
import { Icons, Section, Spinner } from "src/components";
import { DeleteApplication } from "./delete";
import { toastError, toastSuccess } from "src/store";

import type { Application } from "src/api/types";

export const Applications = () => {
  const [applications, refetch] = useApiData<Application[]>("Applications");
  const [application, setApplication] = useState<Application | null>(null);

  const handleDelete = () => {
    if (application) {
      deleteApplication(application.application_sid)
        .then(() => {
          refetch();
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
