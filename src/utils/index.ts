import { withSuspense } from "./with-suspense";
import { useMobileMedia } from "../utils/use-mobile-media";
import { withAccessControl } from "./with-access-control";
import { withSelectState } from "./with-select-state";
import { useRedirect } from "./use-redirect";
import {
  FQDN,
  FQDN_TOP_LEVEL,
  INVALID,
  IP,
  TCP_MAX_PORT,
} from "src/api/constants";

import type { IpType } from "src/api/types";

export const hasValue = <Type>(
  variable: Type | null | undefined
): variable is NonNullable<Type> => {
  return variable !== null && variable !== undefined;
};

export const hasLength = <Type>(
  variable: Type[] | null | undefined,
  minlength = 0
): variable is NonNullable<Type[]> => {
  return hasValue(variable) && variable.length > minlength;
};

export const isValidPasswd = (password: string) => {
  return (
    password.length >= 6 && /\d/.test(password) && /[a-zA-Z]/.test(password)
  );
};

export const isValidPort = (port: number) => {
  return (
    hasValue(port) &&
    /^[0-9]+$/.test(port.toString().trim()) &&
    parseInt(port.toString().trim(), 10) >= 0 &&
    parseInt(port.toString().trim(), 10) <= TCP_MAX_PORT
  );
};

export const getIpValidationType = (ipv4: string): IpType => {
  const type =
    /^((25[0-5]|2[0-4][0-9]|[0-1]?[0-9]?[0-9])\.){3}(25[0-5]|2[0-4][0-9]|[0-1]?[0-9]?[0-9])$/.test(
      ipv4.trim()
    )
      ? IP
      : /^([a-zA-Z0-9][^.]*)(\.[^.]+){2,}$/.test(ipv4.trim())
      ? FQDN
      : /^([a-zA-Z][^.]*)(\.[^.]+)$/.test(ipv4.trim())
      ? FQDN_TOP_LEVEL
      : INVALID;
  return type;
};

export const getObscured = (str: string, sub = 4, char = "*") => {
  const len = str.length - sub;
  const obscured = str.substring(0, len).replace(/[a-zA-Z0-9]/g, char);
  const revealed = str.substring(len);

  return `${obscured}${revealed}`;
};

export const getObscuredSecret = (str: string, sub = 6, char = "X") => {
  if (str.length <= sub) {
    return str;
  }

  const obscured = char.repeat(str.length - sub);
  const revealed = str.substring(0, sub);

  return `${revealed}${obscured}`;
};

export const getHumanDateTime = (date: string, fallbackText = "Never used") => {
  const currDate = new Date();
  const argDate = new Date(date);
  currDate.setHours(0, 0, 0, 0);
  argDate.setHours(0, 0, 0, 0);
  const daysDiff = Math.round(
    (currDate.getTime() - argDate.getTime()) / 1000 / 60 / 60 / 24
  );

  return daysDiff > 1
    ? `${daysDiff} days ago`
    : daysDiff === 1
    ? "Yesterday"
    : daysDiff === 0
    ? "Today"
    : fallbackText;
};

export const formatPhoneNumber = (number: string) => {
  const match = number.match(/^(1?)([2-9][0-9]{2})([2-9][0-9]{2})([0-9]{4})$/);

  if (match) {
    return `${match[1] ? `+${match[1]} ` : ""}(${match[2]}) ${match[3]}-${
      match[4]
    }`;
  }

  return number;
};

export const formatTime = (seconds: number) => {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

export {
  withSuspense,
  useMobileMedia,
  withAccessControl,
  withSelectState,
  useRedirect,
};
