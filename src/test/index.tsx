import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { StateProvider } from "src/store";
import { AuthContext } from "src/router/auth";
import { MSG_SOMETHING_WRONG } from "src/constants";

import type { AuthStateContext } from "src/router/auth";

import userLogin from "../../cypress/fixtures/userLogin.json";

type TestProviderProps = Partial<AuthStateContext> & {
  children?: React.ReactNode;
};

type LayoutProviderProps = TestProviderProps & {
  outlet: JSX.Element;
  Layout: React.ElementType;
};

export const signinError = () => Promise.reject(MSG_SOMETHING_WRONG);
export const signinSuccess = () => Promise.resolve(userLogin);
export const signout = () => undefined;
export const authProps: AuthStateContext = {
  token: "",
  signin: signinSuccess,
  signout,
  authorized: false,
};

/**
 * Use this when you simply need to wrap with state and auth
 */
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

/**
 * Use this when you also need to test the react-router-dom layouts
 */
export const LayoutProvider = ({
  Layout,
  outlet,
  ...restProps
}: LayoutProviderProps) => {
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
            <Route path="*" element={<Layout />}>
              <Route path="*" element={outlet} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthContext.Provider>
    </StateProvider>
  );
};
