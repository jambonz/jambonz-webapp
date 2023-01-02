import React, { useEffect, useState } from "react";
import { MS } from "jambonz-ui";

import { CRED_NOT_TESTED, CRED_OK, USER_ACCOUNT } from "src/api/constants";
import { Icons, Spinner } from "src/components";
import { useApiData } from "src/api";
import { getStatus, getReason } from "./utils";

import type { SpeechCredential, CredentialTestResult } from "src/api/types";
import { useSelectState } from "src/store";

type CredentialStatusProps = {
  cred: SpeechCredential;
  showSummary?: boolean;
};

export const CredentialStatus = ({
  cred,
  showSummary = false,
}: CredentialStatusProps) => {
  const user = useSelectState("user");
  const currentServiceProvider = useSelectState("currentServiceProvider");
  const [apiUrl, setApiUrl] = useState("");
  const [testResult, testRefetch, testError] =
    useApiData<CredentialTestResult>(apiUrl);
  const notTestedTxt =
    "In order to test your credentials you need to enable TTS/STT.";

  const renderStatus = () => {
    if (testResult) {
      const status = getStatus(cred, testResult);
      const reason = getReason(cred, testResult);

      return (
        <div
          className={`i txt--${
            status === CRED_OK
              ? "teal"
              : status === CRED_NOT_TESTED
              ? "jean"
              : "jam"
          }`}
          title={status === CRED_NOT_TESTED ? notTestedTxt : reason}
        >
          {status === CRED_OK ? <Icons.CheckCircle /> : <Icons.XCircle />}
          <span>Status {status}</span>
        </div>
      );
    }
  };

  /** Update test render without useEffect */
  /** https://beta.reactjs.org/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes */
  const [prevCred, setPrevCred] = useState<SpeechCredential>();

  if (cred && prevCred !== cred) {
    setPrevCred(cred);
    testRefetch();
  }

  useEffect(() => {
    if (user && user.scope === USER_ACCOUNT) {
      setApiUrl(
        `Accounts/${user.account_sid}/SpeechCredentials/${cred.speech_credential_sid}/test`
      );
    } else if (currentServiceProvider) {
      setApiUrl(
        `ServiceProviders/${currentServiceProvider.service_provider_sid}/SpeechCredentials/${cred.speech_credential_sid}/test`
      );
    }
  }, [user, cred, currentServiceProvider]);

  return (
    <>
      {!testError && !testResult && (
        <div className="ispin txt--grey">
          <Spinner small />
          <span>Checking status...</span>
        </div>
      )}
      {testError && (
        <div className="i txt--jam" title={testError.msg}>
          <Icons.XCircle />
          <span>Status error</span>
        </div>
      )}
      {testResult &&
        (showSummary ? (
          <details className={getStatus(cred, testResult).replace(/\s/, "-")}>
            <summary>{renderStatus()}</summary>
            {getStatus(cred, testResult) === CRED_NOT_TESTED ? (
              <MS>{notTestedTxt}</MS>
            ) : (
              <MS>{getReason(cred, testResult)}</MS>
            )}
          </details>
        ) : (
          renderStatus()
        ))}
    </>
  );
};
