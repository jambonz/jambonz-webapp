import React, { useEffect, useState } from "react";
import { MS } from "jambonz-ui";

import {
  API_SERVICE_PROVIDERS,
  CRED_NOT_TESTED,
  CRED_OK,
} from "src/api/constants";
import { Icons, Spinner } from "src/components";
import { getFetch } from "src/api";
import { getStatus, getReason } from "./utils";

import type {
  ServiceProvider,
  SpeechCredential,
  CredentialTestResult,
} from "src/api/types";

type CredentialStatusProps = {
  cred: SpeechCredential;
  showSummary?: boolean;
  serviceProvider: ServiceProvider | null;
};

export const CredentialStatus = ({
  cred,
  showSummary = false,
  serviceProvider,
}: CredentialStatusProps) => {
  const [testResult, setTestResult] = useState<CredentialTestResult | null>(
    null
  );
  const [testError, setTestError] = useState<TypeError | null>(null);
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
              ? "grey"
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

  useEffect(() => {
    let ignore = false;

    if (serviceProvider) {
      getFetch<CredentialTestResult>(
        `${API_SERVICE_PROVIDERS}/${serviceProvider.service_provider_sid}/SpeechCredentials/${cred.speech_credential_sid}/test`
      )
        .then(({ json }) => {
          if (!ignore) {
            setTestResult(json);
          }
        })
        .catch((error: TypeError) => {
          if (!ignore) {
            setTestError(error);
          }
        });
    }

    return function cleanup() {
      ignore = true;
    };
  }, [cred]);

  return (
    <>
      {!testError && !testResult && (
        <div className="ispin txt--grey">
          <Spinner small />
          <span>Checking status...</span>
        </div>
      )}
      {testError && (
        <div className="i txt--jam" title={testError.message}>
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
