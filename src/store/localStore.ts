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
 * Methods to get/set the account selected in the filter from local storage
 */
export const getActiveFilter = () => {
  checkLocation();
  return localStorage.getItem(storeActiveFilter) || "";
};

export const setActiveFilter = (accountSid: string) => {
  localStorage.setItem(storeActiveFilter, accountSid);
};

export const removeActiveFilter = () => {
  return localStorage.removeItem(storeActiveFilter);
};

/**
 * Methods to get/set the location from local storage
 */

const storedLocation = "location";

export const setLocation = () => {
  return localStorage.setItem(
    storedLocation,
    window.location.pathname.split("/")[2]
  );
};

export const getLocation = () => {
  return localStorage.getItem(storedLocation);
};

export const checkLocation = () => {
  const currentLocation = window.location.pathname.split("/")[2];
  const storedLocation = getLocation();

  if (currentLocation !== storedLocation) {
    return localStorage.removeItem(storeActiveFilter);
  }
};
