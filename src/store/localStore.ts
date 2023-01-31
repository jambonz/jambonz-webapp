/**
 * The key used to store active Service Provider in localStorage
 */
const storeActiveSP = "activeServiceProvider";

/**
 * Methods to get/set the token from local storage
 */
export const getActiveSP = () => {
  return localStorage.getItem(storeActiveSP) || "";
};

export const setActiveSP = (sid: string) => {
  localStorage.setItem(storeActiveSP, sid);
};

/**
 * The key used to store active Filter in localStorage
 */
const storeActiveFilter = "activeFilter";

/**
 * Methods to get/set the token from local storage
 */
export const getActiveFlter = () => {
  return localStorage.getItem(storeActiveFilter) || "";
};

export const setActiveFilter = (accountSid: string) => {
  localStorage.setItem(storeActiveFilter, accountSid);
};
