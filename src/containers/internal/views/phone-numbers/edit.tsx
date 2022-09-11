import React, { useEffect } from "react";
import { H1 } from "jambonz-ui";
import { useParams } from "react-router-dom";

import { useApiData } from "src/api";
import { toastError } from "src/store";
import { PhoneNumberForm } from "./form";

import type { PhoneNumber } from "src/api/types";

export const EditPhoneNumber = () => {
  const params = useParams();
  const [data, refetch, error] = useApiData<PhoneNumber>(
    `PhoneNumbers/${params.phone_number_sid}`
  );

  useEffect(() => {
    if (error) {
      toastError(error.msg);
    }
  }, [error]);

  return (
    <>
      <H1 className="h2">Edit phone number</H1>
      <PhoneNumberForm phoneNumber={{ data, refetch, error }} />
    </>
  );
};

export default EditPhoneNumber;
