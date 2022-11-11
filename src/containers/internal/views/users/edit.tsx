import React from "react";
import { H1 } from "jambonz-ui";
import { UserForm } from "./form";

export const EditUser = () => {
  return (
    <>
      <H1 className="h2">Edit user</H1>
      <UserForm />
    </>
  );
};

export default EditUser;
