import { withSuspense } from "./with-suspense";
import { useMobileMedia } from "../utils/use-mobile-media";
import { withAccessControl } from "./with-access-control";
import { withSelectState } from "./with-select-state";

export const hasValue = <T>(
  variable: T | undefined
): variable is NonNullable<T> => {
  return variable !== null && variable !== undefined;
};

export const hasLength = <T>(
  variable: T[] | null | undefined,
  minimum = 0
): variable is NonNullable<T[]> => {
  return hasValue(variable) && variable.length > minimum;
};

export const isValidPasswd = (password: string) => {
  return (
    password.length >= 6 && /\d/.test(password) && /[a-zA-Z]/.test(password)
  );
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

export { withSuspense, useMobileMedia, withAccessControl, withSelectState };
