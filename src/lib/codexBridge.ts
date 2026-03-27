const DEFAULT_CODEX_BRIDGE_URL = "http://127.0.0.1:8765";

export interface CodexBridgeStatus {
  ok: boolean;
  bridgeVersion?: string;
  codexVersion?: string;
  cliAvailable: boolean;
  loggedIn: boolean;
  loginMethod?: string | null;
  message: string;
}

export const getCodexBridgeUrl = (): string =>
  (
    import.meta.env.VITE_CODEX_BRIDGE_URL ??
    DEFAULT_CODEX_BRIDGE_URL
  ).trim();

export const getCodexBridgeStartCommand = (): string =>
  "corepack pnpm codex:bridge";

export const getCodexLoginCommand = (): string => "codex login";

export const fetchCodexBridgeStatus = async (): Promise<CodexBridgeStatus> => {
  const response = await fetch(`${getCodexBridgeUrl()}/auth/status`, {
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Codex bridge status request failed (${response.status}).`);
  }

  return (await response.json()) as CodexBridgeStatus;
};
