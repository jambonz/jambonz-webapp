import { useEffect, useState } from "react";

import { useSelectState } from "src/store";
import { getToken } from "src/router/auth";
import {
  DEV_BASE_URL,
  API_BASE_URL,
  API_LOGIN,
  API_USERS,
  API_SERVICE_PROVIDERS,
  API_API_KEYS,
  API_ACCOUNTS,
  API_APPLICATIONS,
} from "./constants";
import { ROUTE_LOGIN } from "src/router/routes";
import {
  SESS_UNAUTHORIZED,
  MSG_SESS_EXPIRED,
  MSG_SERVER_DOWN,
  MSG_SOMETHING_WRONG,
} from "src/constants";
import { PagedResponse, RecentCall, StatusCodes } from "./types";

import type {
  FetchError,
  FetchTransport,
  Payload,
  User,
  UserLogin,
  ServiceProvider,
  SidResponse,
  TokenResponse,
  EmptyResponse,
  SecretResponse,
  UseApiData,
  Application,
} from "./types";

/** Wrap all requests to normalize response handling */
const fetchTransport = <Type>(
  url: string,
  options: RequestInit
): Promise<FetchTransport<Type>> => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(url, options);
      const transport = {
        status: response.status,
        json: <Type>{},
      };

      // Redirect unauthorized
      if (response.status === StatusCodes.UNAUTHORIZED) {
        handleUnauthorized();
        reject();
      }

      // API error handling returns { msg: string; }
      // See @type StatusJSON and StatusEmpty in ./types
      if (
        response.status >= StatusCodes.BAD_REQUEST &&
        response.status <= StatusCodes.INTERNAL_SERVER_ERROR
      ) {
        try {
          const errJson = await response.json();
          reject(<FetchError>{
            status: response.status,
            ...errJson,
          });
        } catch (error) {
          reject(<FetchError>{
            status: response.status,
            msg: MSG_SOMETHING_WRONG,
          });
        }
      }

      // API success handling returns a valid JSON response
      // This could either be a DTO object or a generic response
      // See types for various responses in ./types
      if (
        response.status === StatusCodes.OK ||
        response.status === StatusCodes.CREATED
      ) {
        const json: Type = await response.json();

        transport.json = json;
      }

      resolve(transport);
      // TypeError "Failed to fetch"
      // net::ERR_CONNECTION_REFUSED
      // This is the case if the server is unreachable...
    } catch (error: unknown) {
      // Caveat -- we don't kill the app if this is a bad request on local dev server
      if (!url.includes(DEV_BASE_URL)) {
        handleUnreachable();
      }

      reject(<FetchError>{
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        msg: (error as TypeError).message,
      });
    }
  });
};

const getAuthHeaders = () => {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

/** Hard boot on 401 status code for unauthorized users */
/** Since you're unauthorized there's no harm just reloading the app from "/" */
/** We set a storage item for the dispatch message that is captured in the Login container */
const handleBadRequest = (msg: string) => {
  localStorage.clear();
  sessionStorage.clear();

  if (window.location.pathname !== ROUTE_LOGIN) {
    sessionStorage.setItem(SESS_UNAUTHORIZED, msg);
    window.location.href = ROUTE_LOGIN;
  }
};

const handleUnauthorized = () => {
  handleBadRequest(MSG_SESS_EXPIRED);
};

const handleUnreachable = () => {
  handleBadRequest(MSG_SERVER_DOWN);
};

/** All APIs need a wrapper utility that uses the FetchTransport */

export const postLogin = (payload: Payload) => {
  return fetchTransport<UserLogin>(API_LOGIN, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const postServiceProviders = (payload: Payload) => {
  return fetchTransport<SidResponse>(API_SERVICE_PROVIDERS, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: getAuthHeaders(),
  });
};

export const postApiKey = (payload: Payload) => {
  return fetchTransport<TokenResponse>(API_API_KEYS, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: getAuthHeaders(),
  });
};

export const postAccount = (payload: Payload) => {
  return fetchTransport<SidResponse>(API_ACCOUNTS, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: getAuthHeaders(),
  });
};

export const postSubspace = (sid: string, payload: Payload) => {
  return fetchTransport<SidResponse>(
    `${API_ACCOUNTS}/${sid}/SubspaceTeleport`,
    {
      method: "POST",
      body: JSON.stringify(payload),
      headers: getAuthHeaders(),
    }
  );
};

export const postApplication = (payload: Payload) => {
  return fetchTransport<SidResponse>(API_APPLICATIONS, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: getAuthHeaders(),
  });
};

export const putUser = (sid: string, payload: Payload) => {
  return fetchTransport<EmptyResponse>(`${API_USERS}/${sid}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    headers: getAuthHeaders(),
  });
};

export const putServiceProvider = (sid: string, payload: Payload) => {
  return fetchTransport<EmptyResponse>(`${API_SERVICE_PROVIDERS}/${sid}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    headers: getAuthHeaders(),
  });
};

export const putAccount = (sid: string, payload: Payload) => {
  return fetchTransport<EmptyResponse>(`${API_ACCOUNTS}/${sid}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    headers: getAuthHeaders(),
  });
};

export const deleteServiceProvider = (sid: string) => {
  return fetchTransport<EmptyResponse>(`${API_SERVICE_PROVIDERS}/${sid}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
};

export const deleteApiKey = (sid: string) => {
  return fetchTransport<EmptyResponse>(`${API_API_KEYS}/${sid}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
};

export const deleteAccount = (sid: string) => {
  return fetchTransport<EmptyResponse>(`${API_ACCOUNTS}/${sid}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
};

export const deleteSubspace = (sid: string) => {
  return fetchTransport<EmptyResponse>(
    `${API_ACCOUNTS}/${sid}/SubspaceTeleport`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );
};

export const deleteApplication = (sid: string) => {
  return fetchTransport<EmptyResponse>(`${API_APPLICATIONS}/${sid}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
};

/** Simple wrapper for :GET fetchTransport calls to any API */

export const getFetch = <Type>(url: string) => {
  return fetchTransport<Type>(url, {
    headers: getAuthHeaders(),
  });
};

/** Specific use cases for wrapping `getFetch` */

export const getUser = (sid: string) => {
  return getFetch<User>(`${API_USERS}/${sid}`);
};

export const getServiceProviders = () => {
  return getFetch<ServiceProvider[]>(API_SERVICE_PROVIDERS);
};

export const getAccountWebhook = (sid: string) => {
  return getFetch<SecretResponse>(
    `${API_ACCOUNTS}/${sid}/WebhookSecret?regenerate=true`
  );
};

export const getApplications = () => {
  return getFetch<Application[]>(API_APPLICATIONS);
};

/** Wrappers for APIs that can have a mock dev server response */

export const getRecentCalls = (sid: string) => {
  return getFetch<PagedResponse<RecentCall>>(
    import.meta.env.DEV
      ? `${DEV_BASE_URL}/Accounts/${sid}/RecentCalls`
      : `${API_ACCOUNTS}/${sid}/RecentCalls`
  );
};

/** Hooks for components to fetch data with refetch method */

/** :GET /{apiPath} -- this is generic for any fetch of data collections */
export const useApiData: UseApiData = <Type>(apiPath: string) => {
  const [result, setResult] = useState<Type | null>(null);
  const [error, setError] = useState<FetchError | null>(null);
  const [refetch, setRefetch] = useState(0);

  const refetcher = () => {
    setRefetch(refetch + 1);
  };

  useEffect(() => {
    let ignore = false;

    getFetch<Type>(`${API_BASE_URL}/${apiPath}`)
      .then(({ json }) => {
        if (!ignore) {
          setResult(json!);
        }
      })
      .catch((error) => {
        if (!ignore) {
          setError(error);
        }
      });

    return function cleanup() {
      ignore = true;
    };
  }, [refetch]);

  return [result, refetcher, error];
};

/** Only for a couple routes but makes these fetches nice at the component level */
/** Wrapping up the currentServiceProvider logic here also streamlines component use */
/** :GET /ServiceProviders/:service_provider_sid/ApiKeys */
/** :GET /ServiceProviders/:service_provider_sid/Accounts */
export const useServiceProviderData: UseApiData = <Type>(apiPath: string) => {
  const currentServiceProvider = useSelectState("currentServiceProvider");
  const [result, setResult] = useState<Type | null>(null);
  const [error, setError] = useState<FetchError | null>(null);
  const [refetch, setRefetch] = useState(0);

  const refetcher = () => {
    setRefetch(refetch + 1);
  };

  useEffect(() => {
    let ignore = false;

    if (currentServiceProvider) {
      getFetch<Type>(
        `${API_SERVICE_PROVIDERS}/${currentServiceProvider.service_provider_sid}/${apiPath}`
      )
        .then(({ json }) => {
          if (!ignore) {
            setResult(json!);
          }
        })
        .catch((error) => {
          if (!ignore) {
            setError(error);
          }
        });
    }

    return function cleanup() {
      ignore = true;
    };
  }, [currentServiceProvider, refetch]);

  return [result, refetcher, error];
};
