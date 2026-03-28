import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "@/App";
import { initializeBridgeTokenFromUrl } from "@/lib/bridgeAuth";
import "@/index.css";

initializeBridgeTokenFromUrl();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_relativeSplatPath: true,
        v7_startTransition: true
      }}
    >
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
