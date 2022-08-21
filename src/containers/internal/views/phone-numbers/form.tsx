import React from "react";
import { Account, FetchError, PhoneNumber } from "src/api/types";

type UsePhoneNumberData = {
  data: PhoneNumber | null;
  error: FetchError | null;
  refetch: () => void;
};

type PhoneNumberFormProps = {
  phoneNumber?: UsePhoneNumberData;
  accounts: Account[] | null;
  // voipCarriers: VoipCarrier[];
};

export const PhoneNumberForm = ({
  phoneNumber,
  accounts,
}: PhoneNumberFormProps) => {
  return (
    <>
      <div>
        {phoneNumber && accounts && 1}
        <div>hello world</div>
      </div>
    </>
  );
};

export default PhoneNumberForm;
