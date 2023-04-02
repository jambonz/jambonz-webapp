import React from "react";
import { CarrierRegisterStatus } from "src/api/types";
import { Icons } from "src/components";
import { CARRIER_REG_OK } from "src/api/constants";
import { MS } from "@jambonz/ui-kit";

type CarrierRegisterStatusProps = {
  register_status: CarrierRegisterStatus;
};

export const RegisterStatus = ({
  register_status,
}: CarrierRegisterStatusProps) => {
  const renderStatus = () => {
    return (
      <div
        className={`i txt--${
          register_status.status
            ? register_status.status === CARRIER_REG_OK
              ? "teal"
              : "jam"
            : "jean"
        }`}
        title={register_status.reason || "Not Started"}
      >
        {register_status.status === CARRIER_REG_OK ? (
          <Icons.CheckCircle />
        ) : (
          <Icons.XCircle />
        )}
        <span>
          {register_status.status
            ? `Status ${register_status.status}`
            : "Not Started"}
        </span>
      </div>
    );
  };

  return (
    <details className={register_status.status || "not-tested"}>
      <summary>{renderStatus()}</summary>
      <MS>
        <strong>Reason:</strong> {register_status.reason || "Not Started"}
      </MS>
    </details>
  );
};
