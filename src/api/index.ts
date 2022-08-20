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

import type {
  FetchError,
  FetchTransport,
  User,
  UserLogin,
  ServiceProvider,
  SidResponse,
  TokenResponse,
  EmptyResponse,
  SecretResponse,
  UseApiData,
  Alert,
  PagedResponse,
  RecentCall,
  UserLoginPayload,
  UserUpdatePayload,
  ApiKey,
  Account,
  Application,
} from "./types";
import { StatusCodes } from "./types";

/** Wrap all requests to normalize response handling */
const fetchTransport = <Type>(
  url: string,
  options: RequestInit
): Promise<FetchTransport<Type>> => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(url, options);
      const transport: FetchTransport<Type> = {
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
        // Handle blobs -- e.g. pcap file API for RecentCalls
        if (
          options.headers!["Content-Type" as keyof HeadersInit] ===
          "application/octet-stream"
        ) {
          const blob: Blob = await response.blob();

          transport.blob = blob;
        } else {
          const json: Type = await response.json();

          transport.json = json;
        }
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

/** Wrapper for fetching Blobs -- API use case is RecentCalls pcap files */

export const getBlob = (url: string) => {
  return fetchTransport(url, {
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/octet-stream",
    },
  });
};

/** Simple wrappers for fetchTransport calls to any API, :GET, :POST, :PUT, :DELETE */

export const getFetch = <Type>(url: string) => {
  return fetchTransport<Type>(url, {
    headers: getAuthHeaders(),
  });
};

export const postFetch = <Type, Payload>(url: string, payload: Payload) => {
  return fetchTransport<Type>(url, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: getAuthHeaders(),
  });
};

export const putFetch = <Type, Payload>(url: string, payload: Payload) => {
  return fetchTransport<Type>(url, {
    method: "PUT",
    body: JSON.stringify(payload),
    headers: getAuthHeaders(),
  });
};

export const deleteFetch = <Type>(url: string) => {
  return fetchTransport<Type>(url, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
};

/** All APIs need a wrapper utility that uses the FetchTransport */

export const postLogin = (payload: UserLoginPayload) => {
  return fetchTransport<UserLogin>(API_LOGIN, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

/** Named wrappers for `postFetch` */

export const postServiceProviders = (payload: Partial<ServiceProvider>) => {
  return postFetch<SidResponse, Partial<ServiceProvider>>(
    API_SERVICE_PROVIDERS,
    payload
  );
};

export const postApiKey = (payload: Partial<ApiKey>) => {
  return postFetch<TokenResponse, Partial<ApiKey>>(API_API_KEYS, payload);
};

export const postAccount = (payload: Partial<Account>) => {
  return postFetch<SidResponse, Partial<Account>>(API_ACCOUNTS, payload);
};

export const postApplication = (payload: Partial<Application>) => {
  return postFetch<SidResponse, Partial<Application>>(
    API_APPLICATIONS,
    payload
  );
};

/** Named wrappers for `putFetch` */

export const putUser = (sid: string, payload: UserUpdatePayload) => {
  return putFetch<EmptyResponse, UserUpdatePayload>(
    `${API_USERS}/${sid}`,
    payload
  );
};

export const putServiceProvider = (
  sid: string,
  payload: Partial<ServiceProvider>
) => {
  return putFetch<EmptyResponse, Partial<ServiceProvider>>(
    `${API_SERVICE_PROVIDERS}/${sid}`,
    payload
  );
};

export const putAccount = (sid: string, payload: Partial<Account>) => {
  return putFetch<EmptyResponse, Partial<Account>>(
    `${API_ACCOUNTS}/${sid}`,
    payload
  );
};

export const putApplication = (sid: string, payload: Partial<Application>) => {
  return putFetch<EmptyResponse, Partial<Application>>(
    `${API_APPLICATIONS}/${sid}`,
    payload
  );
};

/** Named wrappers for `deleteFetch` */

export const deleteServiceProvider = (sid: string) => {
  return deleteFetch<EmptyResponse>(`${API_SERVICE_PROVIDERS}/${sid}`);
};

export const deleteApiKey = (sid: string) => {
  return deleteFetch<EmptyResponse>(`${API_API_KEYS}/${sid}`);
};

export const deleteAccount = (sid: string) => {
  return deleteFetch<EmptyResponse>(`${API_ACCOUNTS}/${sid}`);
};

export const deleteApplication = (sid: string) => {
  return deleteFetch<EmptyResponse>(`${API_APPLICATIONS}/${sid}`);
};

/** Named wrappers for `getFetch` */

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

/** Wrappers for APIs that can have a mock dev server response */

export const getRecentCalls = (sid: string) => {
  return getFetch<PagedResponse<RecentCall>>(
    import.meta.env.DEV
      ? `${DEV_BASE_URL}/Accounts/${sid}/RecentCalls`
      : `${API_ACCOUNTS}/${sid}/RecentCalls`
  );
};

export const getPcap = (sid: string, callSid: string) => {
  return getBlob(
    import.meta.env.DEV
      ? `${DEV_BASE_URL}/Accounts/${sid}/RecentCalls/${callSid}/pcap`
      : `${API_ACCOUNTS}/${sid}/RecentCalls/${callSid}/pcap`
  );
};

export const getAlerts = (sid: string) => {
  return getFetch<PagedResponse<Alert>>(
    import.meta.env.DEV
      ? `${DEV_BASE_URL}/Accounts/${sid}/Alerts`
      : `${API_ACCOUNTS}/${sid}/Alerts`
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
