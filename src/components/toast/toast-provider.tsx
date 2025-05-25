import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Toast } from "./index";
import type { Toast as ToastProps } from "src/store/types";
import { TOAST_TIME } from "src/constants";

// Define the context type
interface ToastContextType {
  toastSuccess: (message: React.ReactNode) => void;
  toastError: (message: React.ReactNode) => void;
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
    (type: "success" | "error", message: React.ReactNode) => {
      clearToast();

      // Handle React elements by rendering to string or extracting text content
      let processedMessage: string;

      if (React.isValidElement(message)) {
        // For React elements, convert to a simple string representation
        processedMessage = "Notification"; // Default fallback for React elements
      } else if (message === null || message === undefined) {
        processedMessage = ""; // Default empty string for null/undefined
      } else {
        // For primitive values and other objects
        processedMessage = String(message);
      }

      setToast({ type, message: processedMessage });

      // Auto-hide after specified time
      timeoutRef.current = window.setTimeout(() => {
        setToast(null);
      }, TOAST_TIME);
    },
    [clearToast],
  );

  // Exposed methods
  const toastSuccess = useCallback(
    (message: React.ReactNode) => {
      showToast("success", message);
    },
    [showToast],
  );

  const toastError = useCallback(
    (message: React.ReactNode) => {
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
