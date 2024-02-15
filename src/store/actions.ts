import {
  getLcrs,
  getServiceProviders,
  listServiceProvidersPaginated,
} from "src/api";
import { sortLocaleName } from "src/utils";
import { getToken, parseJwt } from "src/router/auth";

import type { State, Action, UserData } from "./types";
import { Scope } from "./types";
import { Lcr, ServiceProvider } from "src/api/types";
import { PAGINATION } from "src/api/constants";

/** A generic action assumes action.type is ALWAYS our state key */
/** Since this is how we're designing our state interface we cool */
export const genericAction = (state: State, action: Action<keyof State>) => {
  return {
    ...state,
    [action.type]: action.payload,
  };
};

export const serviceProvidersAction = (
  state: State,
  action: Action<keyof State>
) => {
  // Sorts for consistent list view
  action.payload = (<ServiceProvider[]>action.payload).sort(sortLocaleName);

  // Sets initial currentServiceProvider
  if (!state.currentServiceProvider) {
    state.currentServiceProvider = (<ServiceProvider[]>action.payload)[0];
    state.accessControl.hasMSTeamsFqdn = (<ServiceProvider[]>action.payload)[0]
      .ms_teams_fqdn
      ? true
      : false;
  } else {
    const serviceProvider = action.payload.find(
      (sp: ServiceProvider) =>
        sp.service_provider_sid ===
        state.currentServiceProvider?.service_provider_sid
    );
    // The `serviceProvider` will be undefined if this is after a DELETE
    // For this case we want to just reset to the first provider in the list
    // Otherwise this is a PUT or POST and the app will update accordingly
    state.currentServiceProvider =
      serviceProvider || (<ServiceProvider[]>action.payload)[0];
    state.accessControl.hasMSTeamsFqdn = state.currentServiceProvider
      ?.ms_teams_fqdn
      ? true
      : false;
  }

  return genericAction(state, action);
};

export const currentServiceProviderAction = (
  state: State,
  action: Action<keyof State>
) => {
  // Set MS Teams Tenants ACL condition
  state.accessControl.hasMSTeamsFqdn = (<ServiceProvider>action.payload)
    .ms_teams_fqdn
    ? true
    : false;

  return genericAction(state, action);
};

export const userAsyncAction = async (): Promise<UserData> => {
  const token = getToken();
  const userData = parseJwt(token);

  // Add `access` as enum for client-side usage
  return { ...userData, access: Scope[userData.scope] };
};

export const serviceProvidersAsyncAction = async (): Promise<
  ServiceProvider[]
> => {
  if (PAGINATION) {
    const query = {
      limit: 25,
      page: 1,
    };
    const response = await listServiceProvidersPaginated(query);
    return response.json.data;
  }

  const response = await getServiceProviders();
  return response.json;
};

export const lcrAsyncAction = async (): Promise<Lcr> => {
  const { json } = await getLcrs();
  if (json && json.length > 0) {
    return json[0];
  }
  return {} as Lcr;
};
