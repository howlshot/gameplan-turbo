var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
var HOSTED_CONNECT_SOURCES = [
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
var LOCAL_BRIDGE_CONNECT_SOURCES = [
    "http://127.0.0.1:*",
    "http://localhost:*"
];
var buildContentSecurityPolicy = function (runtimeMode) {
    var connectSources = runtimeMode === "hosted"
        ? HOSTED_CONNECT_SOURCES
        : __spreadArray(__spreadArray([], HOSTED_CONNECT_SOURCES, true), LOCAL_BRIDGE_CONNECT_SOURCES, true);
    return [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        "img-src 'self' data: blob: https:",
        "connect-src ".concat(connectSources.join(" ")),
        "object-src 'none'",
        "base-uri 'self'"
    ].join("; ");
};
export default defineConfig(function () {
    var _a;
    var runtimeMode = ((_a = process.env.VITE_APP_RUNTIME_MODE) === null || _a === void 0 ? void 0 : _a.trim().toLowerCase()) === "hosted"
        ? "hosted"
        : "local";
    return {
        plugins: [
            react(),
            {
                name: "gameplan-csp-meta",
                transformIndexHtml: function (html) {
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
