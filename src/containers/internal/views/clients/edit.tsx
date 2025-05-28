import { H1 } from "@jambonz/ui-kit";
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApiData } from "src/api";
import { Client } from "src/api/types";
import ClientsForm from "./form";
import { ROUTE_INTERNAL_CLIENTS } from "src/router/routes";
import { useToast } from "src/components/toast/toast-provider";

export const ClientsEdit = () => {
  const { toastError } = useToast();
  const params = useParams();
  const navigate = useNavigate();
  const [data, refetch, error] = useApiData<Client>(
    `Clients/${params.client_sid}`,
  );

  /** Handle error toast at top level... */
  useEffect(() => {
    if (error) {
      toastError(error.msg);
      navigate(ROUTE_INTERNAL_CLIENTS);
    }
  }, [error]);

  return (
    <>
      <H1 className="h2">Edit sip client</H1>
      <ClientsForm client={{ data, refetch, error }} />
    </>
  );
};

export default ClientsEdit;
