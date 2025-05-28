import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { StateProvider } from "./store";
import { AuthProvider } from "./router/auth";
import { Router } from "./router";

import "./styles/index.scss";
import { ToastProvider } from "./components/toast/toast-provider";

const root: Element = document.getElementById("root")!;

createRoot(root).render(
  <React.StrictMode>
    <ToastProvider>
      <StateProvider>
        <BrowserRouter>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </BrowserRouter>
      </StateProvider>
    </ToastProvider>
  </React.StrictMode>,
);
