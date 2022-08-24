import type { Dispatch } from "react";

import type { User, ServiceProvider } from "src/api/types";

export type IMessage = string | JSX.Element;

export type Toast = {
  type: "success" | "error";
  message: IMessage;
};

export interface ACL {
  hasAdminAuth: boolean;
  hasMSTeamsFqdn: boolean;
}

export interface FeatureFlag {
  development: boolean;
}

export interface State {
  /** logged in user */
  user: User | null;
  /** global toast notifications  */
  toast: Toast | null;
  /** feature flags from vite ENV */
  featureFlags: FeatureFlag;
  /** access controls */
  accessControl: ACL;
  /** available service providers */
  serviceProviders: ServiceProvider[];
  /** current selected service provider */
  currentServiceProvider: ServiceProvider | null;
}

/** Generic interface enforces type-safety with global dispatch */
export interface Action<Type extends keyof State> {
  /** Basically this is the event type */
  type: Type;
  /** Payloads have various shapes based on DTOs */
  payload?: State[Type];
}

/** Global dispatch enforces type-safety between (type <=> payload) */
export interface GlobalDispatch {
  <Type extends keyof State>(action: Action<Type>): void;
}

export interface MiddleWare {
  (dispatch: Dispatch<Action<keyof State>>): GlobalDispatch;
}

export interface AppStateContext {
  /** Global data store */
  state: State;
  /** Globsl dispatch method */
  dispatch: GlobalDispatch;
}
