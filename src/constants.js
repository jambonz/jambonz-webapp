const { REACT_APP_API_BASE_URL, REACT_APP_ENABLE_ACCOUNT_LIMITS_ALL } = process.env;
export const APP_API_BASE_URL = (window.JAMBONZ) ? window.JAMBONZ.APP_API_BASE_URL : REACT_APP_API_BASE_URL;
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

  if (REACT_APP_ENABLE_ACCOUNT_LIMITS_ALL) {
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