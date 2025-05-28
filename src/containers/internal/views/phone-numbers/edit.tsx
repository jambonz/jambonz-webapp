import React, { useEffect } from "react";
import { H1 } from "@jambonz/ui-kit";
import { useParams } from "react-router-dom";

import { useApiData } from "src/api";
import { PhoneNumberForm } from "./form";

import type { PhoneNumber } from "src/api/types";
import { useToast } from "src/components/toast/toast-provider";

export const EditPhoneNumber = () => {
  const { toastError } = useToast();
  const params = useParams();
  const [data, refetch, error] = useApiData<PhoneNumber>(
    `PhoneNumbers/${params.phone_number_sid}`,
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
