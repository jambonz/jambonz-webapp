import React from "react";
import { H1 } from "jambonz-ui";

import { SpeechServiceForm } from "./form";

export const AddSpeechService = () => {
  return (
    <>
      <H1>Add a speech service</H1>
      <SpeechServiceForm />
    </>
  );
};

export default AddSpeechService;
