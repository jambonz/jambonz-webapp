import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "src/components/toast/toast-provider";

import type { IMessage } from "src/store/types";

export const useRedirect = <Type>(
  collection: Type[] | undefined,
  redirect: string,
  message: IMessage,
) => {
  const navigate = useNavigate();
  const { toastError } = useToast();

  useEffect(() => {
    if (collection && !collection.length) {
      toastError(message);
      navigate(redirect);
    }
  }, [collection]);
};
