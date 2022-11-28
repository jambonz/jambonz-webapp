import React, { useReducer, useContext } from "react";

import { TOAST_TIME } from "src/constants";
import {
  genericAction,
  userAsyncAction,
  serviceProvidersAction,
  serviceProvidersAsyncAction,
  currentServiceProviderAction,
} from "./actions";

import type {
  IMessage,
  Toast,
  State,
  Action,
  MiddleWare,
  GlobalDispatch,
  AppStateContext,
  FeatureFlag,
  ACL,
} from "./types";

export const initialState: State = {
  featureFlags: {
    /** Placeholder since we may need feature-flags in the future... */
    development: import.meta.env.DEV,
  },
  accessControl: {
    hasAdminAuth: true,
    hasMSTeamsFqdn: false,
  },
  serviceProviders: [],
};

export const reducer: React.Reducer<State, Action<keyof State>> = (
  state,
  action
) => {
  switch (action.type) {
    case "user":
    case "toast":
      return genericAction(state, action);
    case "serviceProviders":
      return serviceProvidersAction(state, action);
    case "currentServiceProvider":
      return currentServiceProviderAction(state, action);
    default:
      throw new Error();
  }
};

let toastTimeout: number;

/** Async middlewares */
/** Proxies dispatch to reducer */
export const middleware: MiddleWare = (dispatch) => {
  /** This generic implementation enforces global dispatch type-safety */
  return <Type extends keyof State>(action: Action<Type>) => {
    switch (action.type) {
      case "toast":
        if (toastTimeout) {
          clearTimeout(toastTimeout);
        }
        toastTimeout = setTimeout(() => {
          dispatch({ type: "toast" });
        }, TOAST_TIME);
        return dispatch(action);
      case "user":
        return userAsyncAction().then((payload) => {
          dispatch({ ...action, payload });
        });
      case "serviceProviders":
        return serviceProvidersAsyncAction().then((payload) => {
          dispatch({ ...action, payload });
        });
      default:
        return dispatch(action);
    }
  };
};

export const StateContext = React.createContext<AppStateContext>(null!);

/** This will let us make a hook so dispatch is accessible anywhere */
let globalDispatch: GlobalDispatch;

export const StateProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch]: [State, React.Dispatch<Action<keyof State>>] =
    useReducer(reducer, initialState);

  globalDispatch = middleware(dispatch);

  const value: AppStateContext = { state, dispatch: globalDispatch };

  return (
    <StateContext.Provider value={value}>{children}</StateContext.Provider>
  );
};

/** Dispatch can be used anywhere -- even outside of the React tree */
export const useDispatch = (): GlobalDispatch => {
  return globalDispatch;
};

/** Toast dispatch helpers to make component code less cumbersome */
const toastDispatch = (payload: Toast) => {
  globalDispatch({
    type: "toast",
    payload,
  });
};

export const toastError = (msg: IMessage) => {
  toastDispatch({
    type: "error",
    message: msg,
  });
};

export const toastSuccess = (msg: IMessage) => {
  toastDispatch({
    type: "success",
    message: msg,
  });
};

/** Wrapper hook for state context */
export const useStateContext = () => {
  const { state } = useContext(StateContext);

  return state;
};

/** Wrapper hook for generic state selector */
/** Usage: const serviceProviders = useSelectState("serviceProviders") */
export const useSelectState = <Key extends keyof State>(key: Key) => {
  const state = useStateContext();

  return state[key];
};

/** Wrapper for implementing feature flag UI etc... */
export const useFeatureFlag = <Flag extends keyof FeatureFlag>(flag: Flag) => {
  const featureFlags = useSelectState("featureFlags");

  return featureFlags[flag];
};

/** Wrapper for implementing access control UI etc... */
export const useAccessControl = <Acl extends keyof ACL>(acl: Acl) => {
  const accessControl = useSelectState("accessControl");

  return accessControl[acl];
};
