import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Toast } from "./index";
import type { IMessage, Toast as ToastProps } from "src/store/types";
import { TOAST_TIME } from "src/constants";

// Define the context type
interface ToastContextType {
  toastSuccess: (message: IMessage) => void;
  toastError: (message: IMessage) => void;
}

// Create the context with a default value
const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Provider component that makes toast functionality available to any
 * nested components that call useToast().
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toast, setToast] = useState<ToastProps | null>(null);
  const timeoutRef = useRef<number | null>(null);

  // Clear any existing toasts and timeouts
  const clearToast = useCallback(() => {
    setToast(null);
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Show a toast with the specified type and message
  const showToast = useCallback(
    (type: "success" | "error", message: IMessage) => {
      clearToast();

      setToast({ type, message });

      // Auto-hide after specified time
      timeoutRef.current = window.setTimeout(() => {
        setToast(null);
      }, TOAST_TIME);
    },
    [clearToast],
  );

  // Exposed methods
  const toastSuccess = useCallback(
    (message: IMessage) => {
      showToast("success", message);
    },
    [showToast],
  );

  const toastError = useCallback(
    (message: IMessage) => {
      showToast("error", message);
    },
    [showToast],
  );

  // Context value
  const contextValue = useMemo(
    () => ({
      toastSuccess,
      toastError,
    }),
    [toastSuccess, toastError],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {toast && <Toast type={toast.type} message={toast.message} />}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
};
