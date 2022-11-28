import React, { useReducer } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import {
  initialState,
  middleware,
  reducer,
  StateContext,
  StateProvider,
} from "src/store";
import { AuthContext } from "src/router/auth";
import { MSG_SOMETHING_WRONG } from "src/constants";

import { AuthStateContext, parseJwt } from "src/router/auth";
import type { UserLogin } from "src/api/types";

import userLogin from "../../cypress/fixtures/userLogin.json";
import {
  Action,
  AppStateContext,
  GlobalDispatch,
  State,
} from "src/store/types";

type TestProviderProps = Partial<AppStateContext> &
  Partial<AuthStateContext> & {
    children?: React.ReactNode;
  };

type LayoutProviderProps = TestProviderProps & {
  outlet: JSX.Element;
  Layout: React.ElementType;
};

export const signinError = () => Promise.reject(MSG_SOMETHING_WRONG);
export const signinSuccess = () => Promise.resolve(userLogin as UserLogin);
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
  const userJWT = parseJwt(userLogin.token);
  const [state, dispatch]: [State, React.Dispatch<Action<keyof State>>] =
    useReducer(reducer, { ...initialState, user: userJWT });

  const globalDispatch: GlobalDispatch = middleware(dispatch);
  const storeProps: AppStateContext = { state, dispatch: globalDispatch };

  return (
    <StateContext.Provider value={storeProps}>
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
    </StateContext.Provider>
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
