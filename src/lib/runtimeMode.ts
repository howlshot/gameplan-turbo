export type AppRuntimeMode = "local" | "hosted";

const LOCAL_HOSTNAMES = new Set(["127.0.0.1", "localhost", "::1"]);

const normalizeHostname = (hostname: string): string =>
  hostname.trim().replace(/^\[|\]$/g, "");

export const getAppRuntimeMode = (): AppRuntimeMode => {
  const override = import.meta.env.VITE_APP_RUNTIME_MODE?.trim().toLowerCase();

  if (override === "local" || override === "hosted") {
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
