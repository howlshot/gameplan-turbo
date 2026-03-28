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
      headers: {
        Accept: "application/json"
      }
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "Could not reach the local Claude Code bridge. Relaunch the desktop app or start it with `corepack pnpm claude:bridge`."
      );
    }

    throw error;
  }

  if (!response.ok) {
    throw new Error(
      `Claude Code bridge status request failed (${response.status}).`
    );
  }

  return (await response.json()) as ClaudeBridgeStatus;
};

export const openClaudeLoginFlow = async (): Promise<void> => {
  let response: Response;

  try {
    response = await fetch(`${getClaudeBridgeUrl()}/auth/open-login`, {
      method: "POST",
      headers: {
        Accept: "application/json"
      }
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "Could not reach the local Claude Code bridge. Relaunch the desktop app or start it with `corepack pnpm claude:bridge`, then try again."
      );
    }

    throw error;
  }

  if (!response.ok) {
    let message = "Could not open the Claude Code login flow.";

    try {
      const payload = (await response.json()) as { error?: string };
      if (payload.error) {
        message = payload.error;
      }
    } catch {
      // Ignore JSON parse failures and use the fallback message.
    }

    throw new Error(message);
  }
};
