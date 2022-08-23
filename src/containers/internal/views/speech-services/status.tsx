import React, { useEffect, useState } from "react";
import { MS } from "jambonz-ui";

import { API_SERVICE_PROVIDERS, CRED_NOT_TESTED } from "src/api/constants";
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

  const renderStatus = () => {
    if (testResult) {
      return (
        <div
          className={`i txt--${
            getStatus(cred, testResult) === "ok"
              ? "teal"
              : getStatus(cred, testResult) === "not tested"
              ? "grey"
              : "jam"
          }`}
          title={getReason(cred, testResult)}
        >
          {getStatus(cred, testResult) === "ok" ? (
            <Icons.CheckCircle />
          ) : (
            <Icons.XCircle />
          )}
          <span>Status {getStatus(cred, testResult)}</span>
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
        (showSummary && getStatus(cred, testResult) !== CRED_NOT_TESTED ? (
          <details className={getStatus(cred, testResult).replace(/\s/, "-")}>
            <summary>{renderStatus()}</summary>
            <MS>{getReason(cred, testResult)}</MS>
          </details>
        ) : (
          renderStatus()
        ))}
    </>
  );
};
