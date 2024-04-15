import React from "react";
import { Icon } from "@jambonz/ui-kit";
import { Identifier, XYCoord } from "dnd-core";
import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { LcrRoute } from "src/api/types";
import { Icons } from "src/components";
import { Selector } from "src/components/forms";
import { SelectorOption } from "src/components/forms/selector";
import "./styles.scss";

interface DragItem {
  index: number;
  type: string;
}

const ItemTypes = {
  CARD: "card",
};

type CardProps = {
  lr: LcrRoute;
  index: number;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
  updateLcrRoute: (index: number, key: string, value: unknown) => void;
  updateLcrCarrierSetEntries: (
    index1: number,
    index2: number,
    key: string,
    value: unknown,
  ) => void;
  handleRouteDelete: (lr: LcrRoute, index: number) => void;
  carrierSelectorOptions: SelectorOption[];
};

export const Card = ({
  lr,
  index,
  moveCard,
  updateLcrRoute,
  updateLcrCarrierSetEntries,
  handleRouteDelete,
  carrierSelectorOptions,
}: CardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null }
  >({
    accept: ItemTypes.CARD,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveCard(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: () => {
      return { index };
    },
    collect: (monitor) => {
      return { isDragging: monitor.isDragging() };
    },
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`lcr lcr--route lcr-card lcr-card-${
        isDragging ? "disappear" : "appear"
      }`}
      // eslint-disable-next-line react/no-unknown-property
      handler-id={handlerId}
    >
      <div>
        <input
          id={`lcr_route_regex_${index}`}
          name={`lcr_route_regex_${index}`}
          type="text"
          placeholder="Digit prefix or regex"
          required
          value={lr.regex || ""}
          onChange={(e) => {
            updateLcrRoute(index, "regex", e.target.value);
          }}
        />

        <Selector
          id={`lcr_carrier_set_entry_carrier_${index}`}
          name={`lcr_carrier_set_entry_carrier_${index}`}
          value={
            lr.lcr_carrier_set_entries && lr.lcr_carrier_set_entries.length > 0
              ? lr.lcr_carrier_set_entries[0].voip_carrier_sid
                ? lr.lcr_carrier_set_entries[0].voip_carrier_sid
                : ""
              : ""
          }
          required
          options={carrierSelectorOptions}
          onChange={(e) => {
            updateLcrCarrierSetEntries(
              index,
              0,
              "voip_carrier_sid",
              e.target.value,
            );
          }}
        />
      </div>
      <button
        className="btnty btn__delete"
        title="Delete route"
        type="button"
        onClick={() => handleRouteDelete(lr, index)}
      >
        <Icon>
          <Icons.Trash2 />
        </Icon>
      </button>
    </div>
  );
};
export default Card;
