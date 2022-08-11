import { withSuspense } from "./with-suspense";
import { useMobileMedia } from "../utils/use-mobile-media";
import { withAccessControl } from "./with-access-control";
import { withSelectState } from "./with-select-state";

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

export { withSuspense, useMobileMedia, withAccessControl, withSelectState };
