import React, { useEffect, useRef, useState } from "react";
import { Button, P, M, MS } from "jambonz-ui";

import { ClipBoard, Modal } from "src/components";
import { Checkzone, Passwd } from "src/components/forms";
import { useApiData, postSubspace, deleteSubspace } from "src/api";

import type { Dispatch, SetStateAction } from "react";
import type { UseAccountData } from "./form";
import type { Sbc, SubspaceEntryPoint } from "src/api/types";
import { toastError, toastSuccess } from "src/store";

type SubspaceProps = {
  id: [string, Dispatch<SetStateAction<string>>];
  secret: [string, Dispatch<SetStateAction<string>>];
  account: UseAccountData;
  sipRealm: string;
};

export const Subspace = ({
  account,
  sipRealm,
  id: [subspaceId, setSubspaceId],
  secret: [subspaceSecret, setSubspaceSecret],
}: SubspaceProps) => {
  const otherRealmRef = useRef<HTMLInputElement>(null);
  const [initialCheck, setInitialCheck] = useState(false);
  const [modal, setModal] = useState(false);
  const [subSipRealm, setSubSipRealm] = useState("");
  const [otherRealm, setOtherRealm] = useState("");
  const [isRequest, setIsRequest] = useState(false);
  const [destinations, setDestinations] = useState<SubspaceEntryPoint[] | null>(
    null
  );
  const [sbcs] = useApiData<Sbc[]>("Sbcs");

  const resetState = () => {
    setModal(false);
    setOtherRealm("");
    setSubSipRealm("");
    setIsRequest(false);
  };

  const toggleModal = () => {
    if (modal) {
      setOtherRealm("");
      setSubSipRealm("");
    }
    setModal(!modal);
  };

  const handleEnable = () => {
    if (account && account.data) {
      setIsRequest(true);

      const destination = otherRealm || subSipRealm;

      postSubspace(account.data.account_sid, { destination })
        .then(() => {
          toastSuccess("Successfully enabled subspace teleport.");
          resetState();
          account.refetch();
        })
        .catch((error) => {
          toastError(error.msg);
          resetState();
        });
    }
  };

  const handleDisable = () => {
    if (account && account.data) {
      setIsRequest(true);

      deleteSubspace(account.data.account_sid)
        .then(() => {
          toastSuccess("Successfully disabled subspace teleport.");
          resetState();
          account.refetch();
        })
        .catch((error) => {
          toastError(error.msg);
          resetState();
        });
    }
  };

  useEffect(() => {
    if (subspaceId && subspaceSecret) {
      setInitialCheck(true);
    } else {
      setInitialCheck(false);
    }

    if (account.data?.subspace_sip_teleport_destinations) {
      setDestinations(
        JSON.parse(
          account.data.subspace_sip_teleport_destinations
        ) as SubspaceEntryPoint[]
      );
    }
  }, [subspaceId, subspaceSecret]);

  return (
    <>
      <fieldset>
        <label htmlFor="subspace">Feature:</label>
        <Checkzone
          hidden
          id="subspace"
          name="subspace"
          label="Subspace Teleport"
          initialCheck={initialCheck}
        >
          <label htmlFor="name">Subspace Client ID</label>
          <input
            id="subspace_client_id"
            type="text"
            name="subspace_client_id"
            placeholder="Subspace Client ID"
            value={subspaceId}
            onChange={(e) => setSubspaceId(e.target.value)}
          />
          <label htmlFor="name">Subspace Slient Secret</label>
          <Passwd
            id="subspace_client_secret"
            name="subspace_client_secret"
            placeholder="Subspace Client Secret"
            value={subspaceSecret}
            setValue={setSubspaceSecret}
          />
          {destinations && destinations.length > 0 && (
            <>
              <M>
                Subspace is now enabled. To send your traffic through Subspace:
              </M>
              {destinations.map((entrypoint) => {
                return (
                  <div key={entrypoint.transport_type}>
                    <MS>
                      Send {entrypoint.transport_type.split("_").join(" and ")}{" "}
                      traffic to:
                    </MS>
                    <ClipBoard text={entrypoint.address} />
                  </div>
                );
              })}
            </>
          )}
          {account.data?.subspace_client_id &&
            account.data?.subspace_client_secret && (
              <>
                {account.data?.subspace_sip_teleport_id ? (
                  <Button
                    type="button"
                    small
                    subStyle="grey"
                    onClick={toggleModal}
                  >
                    Disable
                  </Button>
                ) : (
                  <Button type="button" small onClick={toggleModal}>
                    Enable
                  </Button>
                )}
              </>
            )}
        </Checkzone>
      </fieldset>
      {modal && (
        <Modal
          disabled={isRequest}
          handleCancel={toggleModal}
          handleSubmit={
            account.data?.subspace_sip_teleport_id
              ? handleDisable
              : handleEnable
          }
        >
          <>
            {isRequest ? (
              <P>
                {account.data?.subspace_sip_teleport_id
                  ? "Disabling"
                  : "Enabling"}{" "}
                subspace teleport...
              </P>
            ) : (
              <>
                {account.data?.subspace_sip_teleport_id ? (
                  <>
                    <P>
                      Are you sure you want to delete your Subspace SIP
                      Teleport?
                    </P>
                  </>
                ) : (
                  <>
                    <P>Have Subspace send SIP to:</P>
                    <div>
                      <label htmlFor={sipRealm}>
                        <input
                          id={sipRealm}
                          type="radio"
                          name="subspace_sip_realm"
                          checked={subSipRealm === sipRealm}
                          onChange={() => {
                            setOtherRealm("");
                            setSubSipRealm(sipRealm);
                          }}
                        />
                        <span>{sipRealm}</span>
                      </label>
                      {sbcs &&
                        sbcs.map((sbc) => {
                          const sbcRealm = `${sbc.ipv4}:${sbc.port}`;

                          return (
                            <label
                              htmlFor={sbc.sbc_address_sid}
                              key={sbc.sbc_address_sid}
                            >
                              <input
                                id={sbc.sbc_address_sid}
                                type="radio"
                                name="subspace_sip_realm"
                                checked={subSipRealm === sbcRealm}
                                onChange={() => {
                                  setOtherRealm("");
                                  setSubSipRealm(sbcRealm);
                                }}
                              />
                              <span>{sbcRealm}</span>
                            </label>
                          );
                        })}
                      <label htmlFor="other">
                        <input
                          id="other"
                          type="radio"
                          name="subspace_sip_realm"
                          checked={subSipRealm === "other"}
                          onChange={() => {
                            setSubSipRealm("other");
                            setTimeout(() => otherRealmRef.current?.focus(), 0);
                          }}
                        />
                        <span>Other</span>
                      </label>
                    </div>
                    {subSipRealm === "other" && (
                      <input
                        ref={otherRealmRef}
                        type="text"
                        name="subspace_sip_realm"
                        value={otherRealm}
                        placeholder="IP address or DNS name"
                        onChange={(e) => setOtherRealm(e.target.value)}
                      />
                    )}
                  </>
                )}
              </>
            )}
          </>
        </Modal>
      )}
    </>
  );
};
