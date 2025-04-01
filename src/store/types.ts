import React from "react";

import type { UserJWT, ServiceProvider, Lcr } from "src/api/types";

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

export enum Scope {
  "account" = 0,
  "service_provider" = 1,
  "admin" = 2,
}

export interface UserData extends UserJWT {
  access: Scope;
  read_only_feature: boolean;
}

export interface State {
  /** logged in user */
  user?: UserData;
  /** global toast notifications  */
  toast?: Toast;
  /** feature flags from vite ENV */
  featureFlags: FeatureFlag;
  /** access controls */
  accessControl: ACL;
  /** available service providers */
  serviceProviders: ServiceProvider[];
  /** Least route routing */
  lcr?: Lcr;
  /** current selected service provider */
  currentServiceProvider?: ServiceProvider;
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
  (dispatch: React.Dispatch<Action<keyof State>>): GlobalDispatch;
}

export interface AppStateContext {
  /** Global data store */
  state: State;
  /** Global dispatch method */
  dispatch: GlobalDispatch;
}
