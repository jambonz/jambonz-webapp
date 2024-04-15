import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { toastError } from "src/store";

import type { IMessage } from "src/store/types";

export const useRedirect = <Type>(
  collection: Type[] | undefined,
  redirect: string,
  message: IMessage,
) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (collection && !collection.length) {
      toastError(message);
      navigate(redirect);
    }
  }, [collection]);
};
