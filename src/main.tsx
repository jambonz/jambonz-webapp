import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { StateProvider } from "./store";
import { AuthProvider } from "./router/auth";
import { Router } from "./router";

import "./styles/index.scss";

const root: Element = document.getElementById("root")!;

createRoot(root).render(
  <React.StrictMode>
    <StateProvider>
      <BrowserRouter>
        <AuthProvider>
          <Router />
        </AuthProvider>
      </BrowserRouter>
    </StateProvider>
  </React.StrictMode>,
);
