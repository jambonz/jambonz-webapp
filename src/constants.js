const { REACT_APP_API_BASE_URL } = process.env;
export const APP_API_BASE_URL = (window.JAMBONZ) ? window.JAMBONZ.APP_API_BASE_URL : REACT_APP_API_BASE_URL;
