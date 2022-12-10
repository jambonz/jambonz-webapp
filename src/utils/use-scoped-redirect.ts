import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { toastError } from "src/store";

import type { IMessage, Scope, UserData } from "src/store/types";

export const useScopedRedirect = (
  access: Scope,
  redirect: string,
  user?: UserData,
  message?: IMessage
) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (user && access >= user.access) {
      if (message) toastError(message);

      navigate(redirect);
    }
  }, [user]);
};
