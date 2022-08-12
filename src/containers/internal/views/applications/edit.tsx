import React, { useEffect } from "react";
import { H1 } from "jambonz-ui";

import { useApiData } from "src/api";
import { toastError } from "src/store";
import { ApplicationForm } from "./form";

import type { Application } from "src/api/types";

export const EditApplication = () => {
  // const params = useParams();// TODO get the params correctly and promise? for the data
  const [data, refetch, error] = useApiData<Application>("Applications"); // return is array but let's just pretend so the compiler stop complaining
  // console.log(applications);
  // console.log(current_application);
  /** According to API, only able to retrieve all applications at once
   * so there needs to be filtered here for the one application that we need */

  // const current_application = applications.filter((app) => app.application_sid === params.application_sid);

  useEffect(() => {
    if (error) {
      toastError(error.msg);
    }
  }, [error]);

  return (
    <>
      <H1>Edit Application</H1>
      <ApplicationForm application={{ data, refetch, error }} />
      {/*      <ApiKeys
        path={`Applications`}
        post={{ application_sid: params.application_sid }}
        label="Application"
      />*/}
    </>
  );
};

export default EditApplication;
