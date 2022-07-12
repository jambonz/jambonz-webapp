import { getObscuredSecret } from "src/utils";

import type { GoogleServiceKey } from "src/vendor/types";
import type {
  CredentialStatus,
  CredentialTestResult,
  SpeechCredential,
} from "src/api/types";
import { CRED_FAIL, CRED_NOT_TESTED, CRED_OK } from "src/api/constants";

export const getObscuredGoogleServiceKey = (key: GoogleServiceKey) => {
  const keyHeader = "-----BEGIN PRIVATE KEY-----\n";

  return {
    ...key,
    private_key: `${keyHeader}${getObscuredSecret(
      key.private_key.slice(keyHeader.length, key.private_key.length)
    )}`,
  };
};

export const getUsage = (cred: SpeechCredential) => {
  return cred.use_for_tts && cred.use_for_stt
    ? "TTS/STT"
    : cred.use_for_tts
    ? "TTS"
    : cred.use_for_stt
    ? "STT"
    : "Not in use";
};

export const getStatus = (
  cred: SpeechCredential,
  testResult: CredentialTestResult
): CredentialStatus => {
  if (
    (cred.use_for_tts &&
      cred.use_for_stt &&
      testResult.tts.status === CRED_OK &&
      testResult.stt.status === CRED_OK) ||
    (cred.use_for_tts && testResult.tts.status === CRED_OK) ||
    (cred.use_for_stt && testResult.stt.status === CRED_OK)
  ) {
    return CRED_OK;
  }

  if (
    testResult.tts.status === CRED_NOT_TESTED &&
    testResult.stt.status === CRED_NOT_TESTED
  ) {
    return CRED_NOT_TESTED;
  }

  return CRED_FAIL;
};

export const getReason = (
  cred: SpeechCredential,
  testResult: CredentialTestResult
) => {
  const ok = "Connection test successful";

  if (cred.use_for_tts && cred.use_for_stt) {
    if (
      testResult.tts.status === CRED_OK &&
      testResult.stt.status === CRED_OK
    ) {
      return ok;
    }

    if (testResult.tts.reason && testResult.stt.reason) {
      if (testResult.tts.reason === testResult.stt.reason) {
        return testResult?.tts.reason;
      }

      return `TTS: ${testResult.tts.reason}. STT: ${testResult.stt.reason}.`;
    }

    if (testResult.tts.reason) {
      return `TTS: ${testResult.tts.reason}`;
    }

    if (testResult.stt.reason) {
      return `STT: ${testResult.stt.reason}`;
    }
  }

  if (cred.use_for_tts) {
    return testResult.tts.status === CRED_OK ? ok : testResult.tts.reason;
  }

  if (cred.use_for_stt) {
    return testResult.stt.status === CRED_OK ? ok : testResult.stt.reason;
  }

  return "";
};
