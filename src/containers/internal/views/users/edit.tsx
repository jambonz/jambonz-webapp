import React, { useEffect } from "react";
import { H1 } from "@jambonz/ui-kit";
import { useParams } from "react-router-dom";

import { UserForm } from "./form";
import { useApiData } from "src/api";
import { User } from "src/api/types";
import { toastError } from "src/store";

export const EditUser = () => {
  const params = useParams();
  const [data, refetch, error] = useApiData<User>(`Users/${params.user_sid}`);

  /** Handle error toast at top level... */
  useEffect(() => {
    if (error) {
      toastError(error.msg);
    }
  }, [error]);

  return (
    <>
      <H1 className="h2">Edit user</H1>
      <UserForm user={{ data, refetch, error }} />
    </>
  );
};

export default EditUser;
