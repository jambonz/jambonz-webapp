import { getUser, getServiceProviders } from "src/api";

import type { State, Action } from "./types";
import type { ServiceProvider, User } from "src/api/types";

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
  action.payload = (<ServiceProvider[]>action.payload).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

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

// export const toastAction = (state: State, action: Action): State => {
//   const toast = state.toast;
//   const found = toast.find((t) => t.id === action.payload.id);

//   if (found) {
//     toast.splice(toast.indexOf(found), 1);
//   } else {
//     toast.push(action.payload);
//   }

//   return {
//     ...state,
//     toast,
//   };
// };

export const userAsyncAction = async (): Promise<User> => {
  const response = await getUser("user_sid");
  return response.json;
};

export const serviceProvidersAsyncAction = async (): Promise<
  ServiceProvider[]
> => {
  const response = await getServiceProviders();
  return response.json;
};