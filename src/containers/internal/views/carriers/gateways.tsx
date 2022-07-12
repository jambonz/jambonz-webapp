import React from "react";

import { Icons, Spinner } from "src/components";
import { useApiData } from "src/api";
import { hasLength } from "src/utils";

import type { Carrier, SipGateway } from "src/api/types";

type GatewaysProps = {
  carrier: Carrier;
};

export const Gateways = ({ carrier }: GatewaysProps) => {
  const [gateways, , error] = useApiData<SipGateway[]>(
    `SipGateways?voip_carrier_sid=${carrier.voip_carrier_sid}`
  );

  const renderGateways = () => {
    if (gateways) {
      const inbound = gateways.filter((g) => g.inbound);
      const outbound = gateways.filter((g) => g.outbound);

      return (
        <>
          <div>
            <div className={`i txt--${hasLength(inbound) ? "teal" : "grey"}`}>
              <Icons.LogIn />
              <span>{inbound.length} inbound</span>
            </div>
          </div>
          <div>
            <div className={`i txt--${hasLength(outbound) ? "teal" : "grey"}`}>
              <Icons.LogOut />
              <span>{outbound.length} outbound</span>
            </div>
          </div>
        </>
      );
    }
  };

  return (
    <>
      {!error && !gateways && (
        <div className="ispin txt--grey">
          <Spinner small />
          <span>Checking gateways...</span>
        </div>
      )}
      {error && (
        <div className="i txt--jam" title={error.msg}>
          <Icons.XCircle />
          <span>Gateways error</span>
        </div>
      )}
      {hasLength(gateways) && renderGateways()}
    </>
  );
};
