import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { toastError } from "src/store";

import type { IMessage } from "src/store/types";
import type { Account, Carrier } from "src/api/types";

export const useRedirect = (
  collection: Account[] | Carrier[] | undefined,
  redirect: string,
  message: IMessage
) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (collection && !collection.length) {
      toastError(message);
      navigate(redirect);
    }
  }, [collection]);
};
