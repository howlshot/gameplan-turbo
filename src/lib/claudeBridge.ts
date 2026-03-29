import { getBridgeRequestHeaders, parseBridgeErrorMessage } from "@/lib/bridgeAuth";
import { getDesktopRuntimeContext, isDesktopRuntime } from "@/lib/runtimeMode";

const DEFAULT_CLAUDE_BRIDGE_URL = "http://127.0.0.1:8766";

export interface ClaudeBridgeStatus {
  ok: boolean;
  bridgeVersion?: string;
  claudeVersion?: string | null;
  cliAvailable: boolean;
  loggedIn: boolean;
  loginMethod?: string | null;
  message: string;
}

export const getClaudeBridgeUrl = (): string =>
  (
    getDesktopRuntimeContext()?.bridgeUrls.claude ??
    import.meta.env.VITE_CLAUDE_BRIDGE_URL ??
    DEFAULT_CLAUDE_BRIDGE_URL
  ).trim();

export const getClaudeBridgeStartCommand = (): string =>
  "corepack pnpm claude:bridge";

export const getClaudeLoginCommand = (): string => "claude auth login";

export const fetchClaudeBridgeStatus = async (): Promise<ClaudeBridgeStatus> => {
  let response: Response;

  try {
    response = await fetch(`${getClaudeBridgeUrl()}/auth/status`, {
      headers: getBridgeRequestHeaders({
        Accept: "application/json"
      })
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        isDesktopRuntime()
          ? "Could not reach the local Claude Code bridge. Relaunch the desktop app and try again."
          : "Could not reach the local Claude Code bridge. Relaunch the desktop app or start it with `corepack pnpm claude:bridge`."
      );
    }

    throw error;
  }

  if (!response.ok) {
    throw new Error(
      await parseBridgeErrorMessage(
        response,
        `Claude Code bridge status request failed (${response.status}).`
      )
    );
  }

  return (await response.json()) as ClaudeBridgeStatus;
};

export const openClaudeLoginFlow = async (): Promise<void> => {
  let response: Response;

  try {
    response = await fetch(`${getClaudeBridgeUrl()}/auth/open-login`, {
      method: "POST",
      headers: getBridgeRequestHeaders({
        Accept: "application/json"
      })
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        isDesktopRuntime()
          ? "Could not reach the local Claude Code bridge. Relaunch the desktop app and try again."
          : "Could not reach the local Claude Code bridge. Relaunch the desktop app or start it with `corepack pnpm claude:bridge`, then try again."
      );
    }

    throw error;
  }

  if (!response.ok) {
    throw new Error(
      await parseBridgeErrorMessage(
        response,
        "Could not open the Claude Code login flow."
      )
    );
  }
};
