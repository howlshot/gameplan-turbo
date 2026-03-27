import { getCodexBridgeUrl } from "@/lib/codexBridge";
import { AIServiceError, toAIServiceError } from "@/services/ai/errors";
import type { AICompleteParams, AIProvider } from "@/services/ai/types";

interface CodexBridgeResponse {
  content: string;
}

const buildPrompt = (params: AICompleteParams): string => {
  const messageBlock = params.messages
    .map(
      (message) =>
        `${message.role.toUpperCase()} MESSAGE:\n${message.content.trim()}`
    )
    .join("\n\n");

  return [
    "You are being called as a local Codex bridge for a browser-based planning tool.",
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

const requestCodexBridge = async (
  params: AICompleteParams,
  bridgeUrl?: string
): Promise<string> => {
  try {
    const response = await fetch(`${bridgeUrl ?? getCodexBridgeUrl()}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        model: params.model,
        prompt: buildPrompt(params)
      })
    });

    if (!response.ok) {
      const message = await response.text();
      throw new AIServiceError(
        "PROVIDER",
        message || "The Codex bridge request failed.",
        { status: response.status }
      );
    }

    const payload = (await response.json()) as CodexBridgeResponse;
    return payload.content.trim();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new AIServiceError(
        "PROVIDER",
        "The local Codex bridge is unavailable. Start it with `corepack pnpm codex:bridge` and try again.",
        {
          cause: error
        }
      );
    }

    throw toAIServiceError(
      error,
      "The local Codex bridge could not complete the request."
    );
  }
};

export const createCodexBridgeProvider = (
  model: string,
  bridgeUrl?: string
): AIProvider => ({
  complete: (params) => requestCodexBridge({ ...params, model }, bridgeUrl),
  streamComplete: async (params, onChunk) => {
    const content = await requestCodexBridge({ ...params, model }, bridgeUrl);
    if (content) {
      onChunk(content);
    }
  },
  validateKey: async () => {
    try {
      const response = await fetch(`${bridgeUrl ?? getCodexBridgeUrl()}/auth/status`, {
        headers: {
          Accept: "application/json"
        }
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
