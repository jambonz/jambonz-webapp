import { H1 } from "@jambonz/ui-kit";
import React from "react";
import ClientsForm from "./form";

export const ClientsAdd = () => {
  return (
    <>
      <H1 className="h2">Add client</H1>
      <ClientsForm />
    </>
  );
};

export default ClientsAdd;
