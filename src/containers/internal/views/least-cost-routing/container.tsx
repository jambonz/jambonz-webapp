import React from "react";
import { LcrRoute } from "src/api/types";
import Card from "./card";
import { hasLength } from "src/utils";
import update from "immutability-helper";
import { deleteLcrRoute } from "src/api";
import { toastError, toastSuccess } from "src/store";
import { SelectorOption } from "src/components/forms/selector";
import { NOT_AVAILABLE_PREFIX } from "src/constants";

type ContainerProps = {
  lcrRoute: [LcrRoute[], React.Dispatch<React.SetStateAction<LcrRoute[]>>];
  carrierSelectorOptions: SelectorOption[];
};

export const Container = ({
  lcrRoute: [lcrRoutes, setLcrRoutes],
  carrierSelectorOptions,
}: ContainerProps) => {
  const moveCard = (dragIndex: number, hoverIndex: number) => {
    setLcrRoutes((prevCards) =>
      update(prevCards, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, prevCards[dragIndex]],
        ],
      })
    );
  };

  const updateLcrRoute = (index: number, key: string, value: unknown) => {
    setLcrRoutes(
      lcrRoutes.map((lr, i) => (i === index ? { ...lr, [key]: value } : lr))
    );
  };

  const updateLcrCarrierSetEntries = (
    index1: number,
    index2: number,
    key: string,
    value: unknown
  ) => {
    setLcrRoutes(
      lcrRoutes.map((lr, i) =>
        i === index1
          ? {
              ...lr,
              lcr_carrier_set_entries: lr.lcr_carrier_set_entries?.map(
                (entry, j) =>
                  j === index2
                    ? {
                        ...entry,
                        [key]: value,
                      }
                    : entry
              ),
            }
          : lr
      )
    );
  };

  const handleRouteDelete = (r: LcrRoute | undefined, index: number) => {
    if (
      r &&
      r.lcr_route_sid &&
      !r.lcr_route_sid.startsWith(NOT_AVAILABLE_PREFIX)
    ) {
      deleteLcrRoute(r.lcr_route_sid)
        .then(() => {
          toastSuccess("Least cost routing rule successfully deleted");
        })
        .catch((error) => {
          toastError(error);
        });
    }
    setLcrRoutes(lcrRoutes.filter((g2, i) => i !== index));
  };

  return (
    <>
      {hasLength(lcrRoutes) &&
        lcrRoutes.map((lr, i) => (
          <Card
            key={lr.lcr_route_sid}
            lr={lr}
            index={i}
            moveCard={moveCard}
            updateLcrRoute={updateLcrRoute}
            updateLcrCarrierSetEntries={updateLcrCarrierSetEntries}
            handleRouteDelete={handleRouteDelete}
            carrierSelectorOptions={carrierSelectorOptions}
          />
        ))}
    </>
  );
};

export default Container;
