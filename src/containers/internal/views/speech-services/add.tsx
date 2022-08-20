import React from "react";
import { H1 } from "jambonz-ui";

import { useServiceProviderData } from "src/api";
import { SpeechServiceForm } from "./form";

import type { Account } from "src/api/types";

export const AddSpeechService = () => {
  const [accounts] = useServiceProviderData<Account[]>("Accounts");

  return (
    <>
      <H1>Add a speech service</H1>
      <SpeechServiceForm accounts={accounts} />
    </>
  );
};

export default AddSpeechService;
