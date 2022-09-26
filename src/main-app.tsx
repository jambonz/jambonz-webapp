import React from "react";
import { BrowserRouter } from "react-router-dom";

import { StateProvider } from "./store";
import { AuthProvider } from "./router/auth";

/** Export `MainApp` so it can be used in Cypress component tests */
export const MainApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <React.StrictMode>
      <StateProvider>
        <BrowserRouter>
          <AuthProvider>{children}</AuthProvider>
        </BrowserRouter>
      </StateProvider>
    </React.StrictMode>
  );
};
