import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("gameplanTurboDesktop", {
  runtimeMode: "desktop" as const,
  appVersion: process.env.GAMEPLAN_TURBO_DESKTOP_APP_VERSION ?? "0.1.0",
  releaseUrl: process.env.GAMEPLAN_TURBO_DESKTOP_RELEASE_URL ?? "",
  bridgeUrls: {
    codex: process.env.GAMEPLAN_TURBO_DESKTOP_CODEX_BRIDGE_URL ?? "",
    claude: process.env.GAMEPLAN_TURBO_DESKTOP_CLAUDE_BRIDGE_URL ?? ""
  }
});
