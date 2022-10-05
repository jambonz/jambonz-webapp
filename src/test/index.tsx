import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { StateProvider } from "src/store";
import { AuthContext } from "src/router/auth";
import { MSG_SOMETHING_WRONG } from "src/constants";

import type { AuthStateContext } from "src/router/auth";

import userLogin from "../../cypress/fixtures/userLogin.json";

interface TestProviderProps extends Partial<AuthStateContext> {
  children: React.ReactNode;
}

export const signinError = () => Promise.reject(MSG_SOMETHING_WRONG);
export const signinSuccess = () => Promise.resolve(userLogin);
export const signout = () => undefined;
export const authProps: AuthStateContext = {
  token: "",
  signin: signinSuccess,
  signout,
  authorized: false,
};

export const TestProvider = ({ children, ...restProps }: TestProviderProps) => {
  return (
    <StateProvider>
      <AuthContext.Provider
        value={{
          ...authProps,
          ...restProps,
        }}
      >
        <BrowserRouter>
          <Routes>
            <Route path="*" element={children} />
          </Routes>
        </BrowserRouter>
      </AuthContext.Provider>
    </StateProvider>
  );
};
