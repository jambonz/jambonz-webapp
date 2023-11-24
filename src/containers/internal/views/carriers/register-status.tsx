import React from "react";
import { Carrier } from "src/api/types";
import { Icons } from "src/components";
import { CARRIER_REG_OK } from "src/api/constants";
import { MS } from "@jambonz/ui-kit";
import { PcapButton } from "./pcap";

type CarrierProps = {
  carrier: Carrier;
};

export const RegisterStatus = ({ carrier }: CarrierProps) => {
  const getReason = () => {
    return carrier.register_status.reason
      ? typeof carrier.register_status.reason === "string"
        ? carrier.register_status.reason
        : "Not Started"
      : "Not Started";
  };
  const renderStatus = () => {
    return (
      <div
        className={`i txt--${
          carrier.register_status.status
            ? carrier.register_status.status === CARRIER_REG_OK
              ? "teal"
              : "jam"
            : "jean"
        }`}
        title={getReason()}
      >
        {carrier.register_status.status === CARRIER_REG_OK ? (
          <Icons.CheckCircle />
        ) : (
          <Icons.XCircle />
        )}
        <span>
          {carrier.register_status.status
            ? `Status ${carrier.register_status.status}`
            : "Not Started"}
        </span>
      </div>
    );
  };

  return (
    <details className={carrier.register_status.status || "not-tested"}>
      <summary>{renderStatus()}</summary>
      <MS>
        <strong>Reason:</strong> {getReason()}
      </MS>
      <PcapButton
        accountSid={carrier.account_sid || ""}
        serviceProviderSid={carrier.service_provider_sid}
        sipCallId={carrier.register_status.callId || ""}
      />
    </details>
  );
};
