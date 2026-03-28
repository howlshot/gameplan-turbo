import { getBridgeRequestHeaders, parseBridgeErrorMessage } from "@/lib/bridgeAuth";

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
  let response: Response;

  try {
    response = await fetch(`${getCodexBridgeUrl()}/auth/status`, {
      headers: getBridgeRequestHeaders({
        Accept: "application/json"
      })
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "Could not reach the local Codex bridge. Start it with `corepack pnpm codex:bridge` or relaunch the desktop app."
      );
    }

    throw error;
  }

  if (!response.ok) {
    throw new Error(
      await parseBridgeErrorMessage(
        response,
        `Codex bridge status request failed (${response.status}).`
      )
    );
  }

  return (await response.json()) as CodexBridgeStatus;
};

export const openCodexLoginFlow = async (): Promise<void> => {
  let response: Response;

  try {
    response = await fetch(`${getCodexBridgeUrl()}/auth/open-login`, {
      method: "POST",
      headers: getBridgeRequestHeaders({
        Accept: "application/json"
      })
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "Could not reach the local Codex bridge. Start it with `corepack pnpm codex:bridge` or relaunch the desktop app, then try again."
      );
    }

    throw error;
  }

  if (!response.ok) {
    throw new Error(
      await parseBridgeErrorMessage(response, "Could not open the Codex login flow.")
    );
  }
};
