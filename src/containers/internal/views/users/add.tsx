import React from "react";
import { H1 } from "jambonz-ui";

import { UserForm } from "./form";

export const AddUser = () => {
  return (
    <>
      <H1 className="h2">Add new user</H1>
      <UserForm />
    </>
  );
};

export default AddUser;
