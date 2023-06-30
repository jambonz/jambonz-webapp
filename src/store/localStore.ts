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

export const removeActiveSP = () => {
  localStorage.removeItem(storeActiveSP);
};

/**
 * The key used to store active Filter in localStorage
 */
const storeAccountFilter = "accountFilter";

/**
 * Methods to get/set the account selected in the filter from local storage
 */
export const getAccountFilter = () => {
  checkLocation();
  return localStorage.getItem(storeAccountFilter) || "";
};

export const setAccountFilter = (accountSid: string) => {
  localStorage.setItem(storeAccountFilter, accountSid);
};

export const removeAccountFilter = () => {
  return localStorage.removeItem(storeAccountFilter);
};

/**
 * Methods to get/set the RecentCalls and Alerts selected filters from local storage
 */

const storeQueryFilter = "queryFilter";

export const setQueryFilter = (combinedFilterString: string) => {
  return localStorage.setItem(storeQueryFilter, combinedFilterString);
};

export const getQueryFilter = () => {
  checkLocation();
  return localStorage.getItem(storeQueryFilter) || "";
};

export const removeQueryFilter = () => {
  return localStorage.removeItem(storeQueryFilter);
};

/**Oauth2 */
const oauthStateKey = "oauth-state";
export const getOauthState = () => {
  return localStorage.getItem(oauthStateKey) || "";
};

export const setOauthState = (token: string) => {
  localStorage.setItem(oauthStateKey, token);
};

export const removeOauthState = () => {
  return localStorage.removeItem(oauthStateKey);
};

const locationBeforeOauthKey = "location-before-oauth";

export const getLocationBeforeOauth = () => {
  return localStorage.getItem(locationBeforeOauthKey) || "";
};

export const setLocationBeforeOauth = (token: string) => {
  localStorage.setItem(locationBeforeOauthKey, token);
};

export const removeLocationBeforeOauth = () => {
  return localStorage.removeItem(locationBeforeOauthKey);
};

// Email register
const rootDomainKey = "root-domain";
export const setRootDomain = (domain: string) => {
  return localStorage.setItem(rootDomainKey, domain);
};

export const getRootDomain = () => {
  return localStorage.getItem(rootDomainKey);
};

export const removeRootDomain = () => {
  return localStorage.removeItem(rootDomainKey);
};

/**
 * Methods to get/set the location from local storage
 */

const storeLocation = "location";

export const setLocation = () => {
  return localStorage.setItem(
    storeLocation,
    window.location.pathname.split("/")[2]
  );
};

export const getLocation = () => {
  return localStorage.getItem(storeLocation);
};

export const checkLocation = () => {
  const currentLocation = window.location.pathname.split("/")[2];
  const storedLocation = getLocation();

  if (currentLocation !== storedLocation) {
    localStorage.removeItem(storeQueryFilter);
    localStorage.removeItem(storeAccountFilter);
    return;
  }
};
