import React, { useEffect } from "react";
import { H1 } from "@jambonz/ui-kit";
import { useParams } from "react-router-dom";

import { useApiData } from "src/api";
import { toastError, useSelectState } from "src/store";
import { ApplicationForm } from "./form";

import type { Application } from "src/api/types";
import { useScopedRedirect } from "src/utils/use-scoped-redirect";
import { Scope } from "src/store/types";
import { ROUTE_INTERNAL_APPLICATIONS } from "src/router/routes";

export const EditApplication = () => {
  const params = useParams();
  const user = useSelectState("user");
  const [data, refetch, error] = useApiData<Application>(
    `Applications/${params.application_sid}`,
  );

  useScopedRedirect(
    Scope.account,
    ROUTE_INTERNAL_APPLICATIONS,
    user,
    "You do not have access to this resource",
    data,
  );

  useEffect(() => {
    if (error) {
      toastError(error.msg);
    }
  }, [error, data]);

  return (
    <>
      <H1 className="h2">Edit application</H1>
      <ApplicationForm application={{ data, refetch, error }} />
    </>
  );
};

export default EditApplication;
