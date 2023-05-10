import React from "react";
import { H1, M } from "@jambonz/ui-kit";

import { LcrForm } from "./form";

export const AddLcr = () => {
  return (
    <>
      <H1 className="h2">Add outbound call routes</H1>
      <section>
        <M>
          Outbound call routing is used to select a carrier when there are
          multiple carriers available.
        </M>
      </section>
      <LcrForm />
    </>
  );
};

export default AddLcr;
