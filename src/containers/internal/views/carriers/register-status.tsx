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
          register_status.status === CARRIER_REG_OK ? "teal" : "jam"
        }`}
        title={register_status.reason || ""}
      >
        {register_status.status === CARRIER_REG_OK ? (
          <Icons.CheckCircle />
        ) : (
          <Icons.XCircle />
        )}
        <span>Status {register_status.status}</span>
      </div>
    );
  };

  return (
    <details className={register_status.status || "ok"}>
      <summary>{renderStatus()}</summary>
      <MS>
        <strong>Reason:</strong> {register_status.reason}
      </MS>
    </details>
  );
};
