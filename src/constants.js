const { REACT_APP_API_BASE_URL } = process.env;
export const APP_API_BASE_URL = (window.JAMBONZ) ? window.JAMBONZ.APP_API_BASE_URL : REACT_APP_API_BASE_URL;
export const LIMITS = [
    // {
    //   label: "Max registered devices",
    //   category: "device",
    // },
    // {
    //   label: "Max api calls per minute",
    //   category: "api_rate",
    // },
    {
      label: "Max concurrent calls",
      category: "voice_call_session",
    },
  ];