import { getBridgeRequestHeaders, parseBridgeErrorMessage } from "@/lib/bridgeAuth";
import { getClaudeBridgeUrl } from "@/lib/claudeBridge";
import { AIServiceError, toAIServiceError } from "@/services/ai/errors";
import type { AICompleteParams, AIProvider } from "@/services/ai/types";

interface ClaudeBridgeResponse {
  content: string;
}

const CLAUDE_BRIDGE_REQUEST_TIMEOUT_MS = 95_000;

const buildPrompt = (params: AICompleteParams): string => {
  const messageBlock = params.messages
    .map(
      (message) =>
        `${message.role.toUpperCase()} MESSAGE:\n${message.content.trim()}`
    )
    .join("\n\n");

  return [
    "You are being called as a local Claude Code bridge for a browser-based planning tool.",
    "Follow the system instructions exactly and answer only with the requested output.",
    "",
    "SYSTEM INSTRUCTIONS:",
    params.system.trim(),
    "",
    "CONVERSATION:",
    messageBlock
  ]
    .filter(Boolean)
    .join("\n");
};

const requestClaudeBridge = async (
  params: AICompleteParams,
  bridgeUrl?: string
): Promise<string> => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => {
    controller.abort("claude-bridge-timeout");
  }, CLAUDE_BRIDGE_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${bridgeUrl ?? getClaudeBridgeUrl()}/generate`, {
      method: "POST",
      headers: getBridgeRequestHeaders({
        "Content-Type": "application/json",
        Accept: "application/json"
      }),
      signal: controller.signal,
      body: JSON.stringify({
        model: params.model,
        prompt: buildPrompt(params)
      })
    });

    if (!response.ok) {
      const message = await parseBridgeErrorMessage(
        response,
        "The local Claude Code bridge could not complete the request."
      );
      throw new AIServiceError(
        "PROVIDER",
        message,
        { status: response.status }
      );
    }

    const payload = (await response.json()) as ClaudeBridgeResponse;
    return payload.content.trim();
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new AIServiceError(
        "PROVIDER",
        "The local Claude Code bridge took longer than 95 seconds to respond. Try a smaller output or retry.",
        {
          cause: error,
          status: 504
        }
      );
    }

    if (error instanceof TypeError) {
      throw new AIServiceError(
        "PROVIDER",
        "The local Claude Code bridge is unavailable. Relaunch the desktop app or start it with `corepack pnpm claude:bridge` and try again.",
        {
          cause: error
        }
      );
    }

    throw toAIServiceError(
      error,
      "The local Claude Code bridge could not complete the request."
    );
  } finally {
    window.clearTimeout(timeoutId);
  }
};

export const createClaudeCodeBridgeProvider = (
  model: string,
  bridgeUrl?: string
): AIProvider => ({
  complete: (params) => requestClaudeBridge({ ...params, model }, bridgeUrl),
  streamComplete: async (params, onChunk) => {
    const content = await requestClaudeBridge({ ...params, model }, bridgeUrl);
    if (content) {
      onChunk(content);
    }
  },
  validateKey: async () => {
    try {
      const response = await fetch(`${bridgeUrl ?? getClaudeBridgeUrl()}/auth/status`, {
        headers: getBridgeRequestHeaders({
          Accept: "application/json"
        })
      });

      if (!response.ok) {
        return false;
      }

      const status = (await response.json()) as { loggedIn?: boolean };
      return status.loggedIn === true;
    } catch {
      return false;
    }
  }
});
