import { getObscuredSecret } from "src/utils";

import type { GoogleServiceKey } from "src/vendor/types";
import type {
  CredentialTest,
  CredentialTestResult,
  SpeechCredential,
} from "src/api/types";

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
): CredentialTest["status"] => {
  if (
    (cred.use_for_tts &&
      cred.use_for_stt &&
      testResult?.tts.status === "ok" &&
      testResult?.stt.status === "ok") ||
    (cred.use_for_tts && testResult?.tts.status === "ok") ||
    (cred.use_for_stt && testResult?.stt.status === "ok")
  ) {
    return "ok";
  }

  if (
    testResult?.tts.status === "not tested" &&
    testResult?.stt.status === "not tested"
  ) {
    return "not tested";
  }

  return "fail";
};

export const getReason = (
  cred: SpeechCredential,
  testResult: CredentialTestResult
): CredentialTest["reason"] => {
  const ok = "Connection test successful";

  if (cred.use_for_tts && cred.use_for_stt) {
    if (testResult?.tts.status === "ok" && testResult?.stt.status === "ok") {
      return ok;
    }

    if (testResult?.tts.reason && testResult?.stt.reason) {
      if (testResult?.tts.reason === testResult?.stt.reason) {
        return testResult?.tts.reason;
      }

      return `TTS: ${testResult?.tts.reason}. STT: ${testResult?.stt.reason}.`;
    }

    if (testResult?.tts.reason) {
      return `TTS: ${testResult?.tts.reason}`;
    }

    if (testResult?.stt.reason) {
      return `STT: ${testResult?.stt.reason}`;
    }
  }

  if (cred.use_for_tts) {
    return testResult?.tts.status === "ok" ? ok : testResult?.tts.reason;
  }

  if (cred.use_for_stt) {
    return testResult?.stt.status === "ok" ? ok : testResult?.stt.reason;
  }

  return "";
};
