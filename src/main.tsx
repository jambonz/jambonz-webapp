import React from "react";
import { createRoot } from "react-dom/client";

import { MainApp } from "./main-app";
import { Router } from "./router";

import "./styles/index.scss";

const root: Element = document.getElementById("root")!;

createRoot(root).render(
  <MainApp>
    <Router />
  </MainApp>
);
