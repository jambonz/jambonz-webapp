import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMe, postRegister } from "src/api";
import {
  DEFAULT_SERVICE_PROVIDER_SID,
  GITHUB_CLIENT_ID,
  GOOGLE_CLIENT_ID,
  BASE_URL,
} from "src/api/constants";
import { Spinner } from "src/components";
import { useToast } from "src/components/toast/toast-provider";
import { setToken } from "src/router/auth";
import {
  ROUTE_INTERNAL_ACCOUNTS,
  ROUTE_LOGIN,
  ROUTE_REGISTER,
  ROUTE_REGISTER_SUB_DOMAIN,
} from "src/router/routes";
import {
  getLocationBeforeOauth,
  getOauthState,
  removeLocationBeforeOauth,
  removeOauthState,
  setRootDomain,
} from "src/store/localStore";

export const OauthCallback = () => {
  const { toastError } = useToast();
  const queryParams = new URLSearchParams(location.search);
  const code = queryParams.get("code");
  const newState = queryParams.get("state");
  const originalState = getOauthState();
  const previousLocation = getLocationBeforeOauth();
  const { provider } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    if (provider !== "github" && provider !== "google") {
      toastError(`${provider} is not a valid OAuth provider`);
      navigate(ROUTE_LOGIN);
      return;
    }
    if (!code || !originalState || !newState || newState !== originalState) {
      toastError("Invalid state");
      navigate(ROUTE_LOGIN);
    }

    let oauth2_client_id;
    let oauth2_redirect_uri;

    if (provider === "github") {
      oauth2_client_id = GITHUB_CLIENT_ID;
      oauth2_redirect_uri = `${BASE_URL}/oauth-callback/github`;
    } else if (provider === "google") {
      oauth2_client_id = GOOGLE_CLIENT_ID;
      oauth2_redirect_uri = `${BASE_URL}/oauth-callback/google`;
    }

    removeOauthState();
    removeLocationBeforeOauth();

    postRegister({
      service_provider_sid: DEFAULT_SERVICE_PROVIDER_SID,
      provider,
      oauth2_code: code || "",
      oauth2_state: originalState,
      oauth2_client_id,
      oauth2_redirect_uri,
      locationBeforeAuth: previousLocation,
    })
      .then(({ json }) => {
        setToken(json.jwt);
        setRootDomain(json.root_domain);
        if (previousLocation === "/register") {
          navigate(ROUTE_REGISTER_SUB_DOMAIN);
        } else {
          getMe()
            .then(({ json: me }) => {
              if (!me.account?.sip_realm) {
                navigate(ROUTE_REGISTER_SUB_DOMAIN);
              } else {
                navigate(`${ROUTE_INTERNAL_ACCOUNTS}/${json.account_sid}/edit`);
              }
            })
            .catch((error) => {
              toastError(error.msg);
            });
        }
      })
      .catch(() => {
        navigate(ROUTE_REGISTER);
      });
  }, []);
  return <Spinner />;
};

export default OauthCallback;
