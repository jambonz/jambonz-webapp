import React, { useEffect, useState } from "react";

import { API_SIP_GATEWAY } from "src/api/constants";
import { Icons, Spinner } from "src/components";
import { getFetch } from "src/api";

import type { Carrier, SipGateway } from "src/api/types";
import { hasLength } from "src/utils";

type GatewaysProps = {
  carrier: Carrier;
};

export const Gateways = ({ carrier }: GatewaysProps) => {
  const [gateways, setGateways] = useState<SipGateway[]>();
  const [error, setError] = useState<TypeError>();

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

  useEffect(() => {
    let ignore = false;

    getFetch<SipGateway[]>(
      `${API_SIP_GATEWAY}?voip_carrier_sid=${carrier.voip_carrier_sid}`
    )
      .then(({ json }) => {
        if (!ignore) {
          setGateways(json);
        }
      })
      .catch((error: TypeError) => {
        if (!ignore) {
          setError(error);
        }
      });

    return function cleanup() {
      ignore = true;
    };
  }, [carrier]);

  return (
    <>
      {!error && !gateways && (
        <div className="ispin txt--grey">
          <Spinner small />
          <span>Checking gateways...</span>
        </div>
      )}
      {error && (
        <div className="i txt--jam" title={error.message}>
          <Icons.XCircle />
          <span>Gateways error</span>
        </div>
      )}
      {hasLength(gateways) && renderGateways()}
    </>
  );
};
