import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const HOSTED_CONNECT_SOURCES = [
  "'self'",
  "https://api.openai.com",
  "https://api.anthropic.com",
  "https://generativelanguage.googleapis.com",
  "https://api.deepseek.com",
  "https://api.groq.com",
  "https://openrouter.ai",
  "https://openrouter.ai/api/v1",
  "https://open.bigmodel.cn",
  "https://api.moonshot.cn",
  "https://api.minimax.io"
];

const LOCAL_BRIDGE_CONNECT_SOURCES = [
  "http://127.0.0.1:*",
  "http://localhost:*"
];

const buildContentSecurityPolicy = (runtimeMode: "local" | "hosted"): string => {
  const connectSources =
    runtimeMode === "hosted"
      ? HOSTED_CONNECT_SOURCES
      : [...HOSTED_CONNECT_SOURCES, ...LOCAL_BRIDGE_CONNECT_SOURCES];

  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    `connect-src ${connectSources.join(" ")}`,
    "object-src 'none'",
    "base-uri 'self'"
  ].join("; ");
};

export default defineConfig(() => {
  const runtimeMode =
    process.env.VITE_APP_RUNTIME_MODE?.trim().toLowerCase() === "hosted"
      ? "hosted"
      : "local";

  return {
    plugins: [
      react(),
      {
        name: "gameplan-csp-meta",
        transformIndexHtml(html) {
          return html.replace("__APP_CSP__", buildContentSecurityPolicy(runtimeMode));
        }
      }
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url))
      }
    }
  };
});
