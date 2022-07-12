import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { Router } from "./router";
import { StateProvider } from "./store";
import { AuthProvider } from "./router/auth";

import "./styles/index.scss";

const App = () => {
  return (
    <React.StrictMode>
      <StateProvider>
        <BrowserRouter>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </BrowserRouter>
      </StateProvider>
    </React.StrictMode>
  );
};

const root: Element = document.getElementById("root")!;

createRoot(root).render(<App />);
