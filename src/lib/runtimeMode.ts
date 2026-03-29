export interface DesktopRuntimeContext {
  appVersion: string;
  bridgeUrls: {
    claude: string;
    codex: string;
  };
  releaseUrl: string;
  runtimeMode: "desktop";
}

export type AppRuntimeMode = "local" | "hosted" | "desktop";

const LOCAL_HOSTNAMES = new Set(["127.0.0.1", "localhost", "::1"]);

const normalizeHostname = (hostname: string): string =>
  hostname.trim().replace(/^\[|\]$/g, "");

export const getDesktopRuntimeContext = (): DesktopRuntimeContext | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.gameplanTurboDesktop ?? null;
};

export const getAppRuntimeMode = (): AppRuntimeMode => {
  const desktopRuntime = getDesktopRuntimeContext();
  if (desktopRuntime?.runtimeMode === "desktop") {
    return "desktop";
  }

  const override = import.meta.env.VITE_APP_RUNTIME_MODE?.trim().toLowerCase();

  if (override === "local" || override === "hosted" || override === "desktop") {
    return override;
  }

  if (typeof window === "undefined") {
    return "local";
  }

  return LOCAL_HOSTNAMES.has(normalizeHostname(window.location.hostname))
    ? "local"
    : "hosted";
};

export const isHostedRuntime = (): boolean => getAppRuntimeMode() === "hosted";

export const isLocalRuntime = (): boolean => getAppRuntimeMode() === "local";

export const isDesktopRuntime = (): boolean => getAppRuntimeMode() === "desktop";

export const isLocalCapableRuntime = (): boolean => {
  const mode = getAppRuntimeMode();
  return mode === "local" || mode === "desktop";
};
