import { H1 } from "@jambonz/ui-kit";
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useApiData } from "src/api";
import { Client } from "src/api/types";
import { toastError } from "src/store";
import ClientsForm from "./form";

export const ClientsEdit = () => {
  const params = useParams();
  const [data, refetch, error] = useApiData<Client>(
    `Clients/${params.client_sid}`
  );

  /** Handle error toast at top level... */
  useEffect(() => {
    if (error) {
      toastError(error.msg);
    }
  }, [error]);

  return (
    <>
      <H1 className="h2">Edit client</H1>
      <ClientsForm client={{ data, refetch, error }} />
    </>
  );
};

export default ClientsEdit;
