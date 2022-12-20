import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Account,
  Application,
  Carrier,
  SpeechCredential,
  User,
} from "src/api/types";

import { toastError, useSelectState } from "src/store";

import { IMessage, Scope, UserData } from "src/store/types";

export const useScopedRedirect = (
  access: Scope,
  redirect: string,
  user?: UserData,
  message?: IMessage,
  data?: Account | User | Application | Carrier | SpeechCredential
) => {
  const navigate = useNavigate();
  const currentServiceProvider = useSelectState("currentServiceProvider");

  useEffect(() => {
    if (
      data &&
      user?.access === Scope.account &&
      data?.account_sid !== user?.account_sid
    ) {
      toastError("You do not have access.");
      navigate(redirect);
    }

    if (
      data &&
      user?.access === 1 &&
      currentServiceProvider?.service_provider_sid !==
        user?.service_provider_sid
    ) {
      toastError("You do not have access.");
      navigate(redirect);
    }

    if (user && access > user.access) {
      if (message) toastError(message);

      navigate(redirect);
    }
  }, [user, currentServiceProvider, data]);
};
