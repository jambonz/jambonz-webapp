const { REACT_APP_API_BASE_URL, REACT_APP_ENABLE_ACCOUNT_LIMITS_ALL } = process.env;
export const APP_API_BASE_URL = (window.JAMBONZ) ? window.JAMBONZ.APP_API_BASE_URL : REACT_APP_API_BASE_URL;
export const APP_ENABLE_ACCOUNT_LIMITS_ALL = (window.JAMBONZ) ? window.JAMBONZ.REACT_APP_ENABLE_ACCOUNT_LIMITS_ALL : JSON.parse(REACT_APP_ENABLE_ACCOUNT_LIMITS_ALL);
export const LIMITS = [
    // {
    //   label: "Max registered devices (0=unlimited)",
    //   category: "device",
    // },
    // {
    //   label: "Max api calls per minute (0=unlimited)",
    //   category: "api_rate",
    // },
    {
      label: "Max calls",
      category: "voice_call_session",
    }
  ];
  console.log(`REACT_APP_API_BASE_URL: ${REACT_APP_API_BASE_URL}, APP_ENABLE_ACCOUNT_LIMITS_ALL: ${APP_ENABLE_ACCOUNT_LIMITS_ALL}`);
  console.log(`typeof APP_ENABLE_ACCOUNT_LIMITS_ALL: ${typeof APP_ENABLE_ACCOUNT_LIMITS_ALL}`);
  if (APP_ENABLE_ACCOUNT_LIMITS_ALL || APP_ENABLE_ACCOUNT_LIMITS_ALL === "true") {
    LIMITS.push({
      label: "Licensed calls",
      category: "voice_call_session_license",
    });
    LIMITS.push({
      label: "Max minutes",
      category: "voice_call_minutes",
    });
    LIMITS.push({
      label: "Licensed minutes",
      category: "voice_call_minutes_license",
    });
  }
  console.log(`LIMITS: ${JSON.stringify(LIMITS)}`);
  