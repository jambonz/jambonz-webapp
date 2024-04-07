import React from "react";
import { H1, M } from "@jambonz/ui-kit";
import LcrForm from "./form";
import { useApiData } from "src/api";
import { Lcr, LcrRoute } from "src/api/types";
import { useParams } from "react-router-dom";
export const EditLcr = () => {
  const params = useParams();
  const [lcrData, lcrRefect, lcrError] = useApiData<Lcr>(
    `Lcrs/${params.lcr_sid}`,
  );
  const [lcrRouteData, lcrRouteRefect, lcrRouteError] = useApiData<LcrRoute[]>(
    `LcrRoutes?lcr_sid=${params.lcr_sid}`,
  );
  return (
    <>
      <H1 className="h2">Edit outbound call routes</H1>
      <section>
        <M>
          Outbound call routing is used to select a carrier when there are
          multiple carriers available.
        </M>
      </section>
      <LcrForm
        lcrDataMap={{ data: lcrData, refetch: lcrRefect, error: lcrError }}
        lcrRouteDataMap={{
          data: lcrRouteData,
          refetch: lcrRouteRefect,
          error: lcrRouteError,
        }}
      />
    </>
  );
};

export default EditLcr;
