/**
 * Based on https://usehooks.com/useAuth/
 */
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";

import { postLogin, postLogout } from "src/api";
import { StatusCodes } from "src/api/types";
import {
  ROUTE_CREATE_PASSWORD,
  ROUTE_INTERNAL_ACCOUNTS,
  ROUTE_INTERNAL_APPLICATIONS,
  ROUTE_LOGIN,
} from "./routes";
import {
  SESS_OLD_PASSWORD,
  SESS_USER_SID,
  SESS_FLASH_MSG,
  MSG_LOGGED_OUT,
  MSG_INCORRECT_CREDS,
  MSG_SOMETHING_WRONG,
  MSG_SERVER_DOWN,
} from "src/constants";

import type { UserLogin } from "src/api/types";
import { USER_ACCOUNT } from "src/api/constants";
import type { UserData } from "src/store/types";

interface SignIn {
  (username: string, password: string): Promise<UserLogin>;
}

export interface AuthStateContext {
  token: string;
  signin: SignIn;
  signout: () => void;
  authorized: boolean;
}

/**
 * The auth context for React
 */
export const AuthContext = React.createContext<AuthStateContext>(null!);

/**
 * Hook for child components to get the auth object
 */
export const useAuth = (): AuthStateContext => {
  return useContext(AuthContext);
};

/**
 * The key used to store our token in localStorage
 */
const storageKey = "token";

/**
 * Methods to get/set the token from local storage
 */
export const getToken = () => {
  return localStorage.getItem(storageKey) || "";
};

export const setToken = (token: string) => {
  localStorage.setItem(storageKey, token);
};

/**
 * Decode data from a JWT
 * https://stackoverflow.com/questions/38552003/how-to-decode-jwt-token-in-javascript-without-using-a-library
 */
export const parseJwt = (token: string) => {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map((c) => {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
};

/**
 * Provider hook that creates auth object and handles state
 */
export const useProvideAuth = (): AuthStateContext => {
  let token = getToken();
  let userData: UserData;
  const navigate = useNavigate();
  const authorized = token ? true : false;

  const signin: SignIn = (username, password) => {
    return new Promise((resolve, reject) => {
      postLogin({ username, password })
        .then((response) => {
          if (response.status === StatusCodes.OK) {
            token = response.json.token;
            setToken(token);
            userData = parseJwt(token);

            if (response.json.force_change) {
              sessionStorage.setItem(SESS_USER_SID, response.json.user_sid);
              sessionStorage.setItem(SESS_OLD_PASSWORD, password);
              navigate(ROUTE_CREATE_PASSWORD);
            } else {
              navigate(
                userData.scope !== USER_ACCOUNT
                  ? ROUTE_INTERNAL_ACCOUNTS
                  : ROUTE_INTERNAL_APPLICATIONS
              );
            }

            resolve(response.json);
          }
        })
        .catch((error) => {
          if (
            error.status > StatusCodes.BAD_REQUEST &&
            error.status < StatusCodes.INTERNAL_SERVER_ERROR
          ) {
            reject(MSG_INCORRECT_CREDS);
          }

          if (error.status === StatusCodes.INTERNAL_SERVER_ERROR) {
            reject(MSG_SERVER_DOWN);
          }

          reject(MSG_SOMETHING_WRONG);
        });
    });
  };

  const signout = () => {
    return new Promise((resolve, reject) => {
      window.location.href = ROUTE_LOGIN;
      postLogout()
        .then((response) => {
          if (response.status === StatusCodes.OK) {
            localStorage.clear();
            sessionStorage.clear();
            sessionStorage.setItem(SESS_FLASH_MSG, MSG_LOGGED_OUT);
            resolve(response.json);
          }
        })
        .catch((error) => {
          localStorage.clear();
          sessionStorage.clear();
          sessionStorage.setItem(SESS_FLASH_MSG, MSG_LOGGED_OUT);
          window.location.href = ROUTE_LOGIN;
          if (error) {
            reject(error);
          }
          reject(MSG_SOMETHING_WRONG);
        });
    });
  };

  return {
    token,
    signin,
    signout,
    authorized,
  };
};

/**
 * Provider component that wraps your app and makes auth object
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useProvideAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};
