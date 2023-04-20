import React from "react";
import { H1 } from "@jambonz/ui-kit";
import LcrForm from "./form";
import { useApiData } from "src/api";
import { Lcr, LcrRoute } from "src/api/types";
import { useParams } from "react-router-dom";
export const EditLcr = () => {
  const params = useParams();
  const [lcrData, lcrRefect, lcrError] = useApiData<Lcr>(
    `Lcrs/${params.lcr_sid}`
  );
  const [lcrRouteData, lcrRouteRefect, lcrRouteError] = useApiData<LcrRoute[]>(
    `LcrRoutes?lcr_sid=${params.lcr_sid}`
  );
  return (
    <>
      <H1 className="h2">Edit least cost routing</H1>
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
