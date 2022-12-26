import { withSuspense } from "./with-suspense";
import { useMobileMedia } from "../utils/use-mobile-media";
import { withAccessControl } from "./with-access-control";
import { withSelectState } from "./with-select-state";
import { useRedirect } from "./use-redirect";
import { useFilteredResults } from "./use-filtered-results";
import { useScopedRedirect } from "./use-scoped-redirect";
import {
  FQDN,
  FQDN_TOP_LEVEL,
  INVALID,
  IP,
  TCP_MAX_PORT,
  USER_ACCOUNT,
  USER_ADMIN,
  USER_SP,
} from "src/api/constants";

import type {
  Carrier,
  IpType,
  PasswordSettings,
  SpeechCredential,
  User,
  UserScopes,
} from "src/api/types";
import type { UserData } from "src/store/types";

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

export const isObject = (obj: unknown) => {
  /** null | undefined | Array will be "object" so exclude them */
  return typeof obj === "object" && hasValue(obj) && !Array.isArray(obj);
};

export const isValidPasswd = (
  password: string,
  passwordSettings: PasswordSettings
) => {
  if (passwordSettings) {
    return (
      password.length >= passwordSettings?.min_password_length &&
      (passwordSettings?.require_digit ? /\d/.test(password) : true) &&
      (passwordSettings?.require_special_character
        ? /[!@#$%^&*(),.?"';:{}|<>+~]/.test(password)
        : true)
    );
  }
  return false;
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

export const sortLocaleName = (
  a: Required<{ name: string }>,
  b: Required<{ name: string }>
) => a.name.localeCompare(b.name);

export const getUserScope = (user: User): UserScopes => {
  if (user.account_sid) {
    return USER_ACCOUNT;
  } else if (user.service_provider_sid) {
    return USER_SP;
  } else {
    return USER_ADMIN;
  }
};

export const isUserAccountScope = (accountSid: string, user?: UserData) => {
  return (
    user?.scope === USER_ACCOUNT &&
    (user?.account_sid !== accountSid || !accountSid)
  );
};

export const checkSelectOptions = (
  user?: UserData,
  resource?: SpeechCredential | Carrier
) => {
  if (user?.scope === USER_ACCOUNT) {
    if (!resource) {
      return false;
    }
    if (resource && resource?.account_sid) {
      return false;
    }
    if (resource && !resource?.account_sid) {
      return true;
    }
  }
  return true;
};

export const sortUsersAlpha = (a: User, b: User) => {
  const nameA = a.name.toLowerCase();
  const nameB = b.name.toLowerCase();
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }

  return 0;
};

export {
  withSuspense,
  useMobileMedia,
  withAccessControl,
  withSelectState,
  useRedirect,
  useFilteredResults,
  useScopedRedirect,
};
