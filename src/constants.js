let { NODE_ENV, REACT_APP_API_BASE_URL } = process.env;
export const APP_API_BASE_URL = (NODE_ENV === "production")
  ? window.JAMBONZ.APP_API_BASE_URL 
  : REACT_APP_API_BASE_URL;