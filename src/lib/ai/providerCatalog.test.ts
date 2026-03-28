import { describe, expect, it } from "vitest";
import {
  PROVIDER_CATALOG,
  PROVIDER_ORDER,
  getPreferredAgentPlatformForProvider,
  getProviderConnectionGroup
} from "@/lib/ai/providerCatalog";

describe("providerCatalog", () => {
  it("includes the new providers in stable order", () => {
    expect(PROVIDER_ORDER).toEqual([
      "codex",
      "claude-code",
      "openrouter",
      "anthropic",
      "openai",
      "google",
      "deepseek",
      "groq",
      "qwen",
      "glm",
      "moonshot",
      "minimax",
      "custom"
    ]);
  });

  it("treats OpenRouter as sign-in first while keeping API key support", () => {
    expect(PROVIDER_CATALOG.openrouter.authMode).toBe("oauth-pkce");
    expect(PROVIDER_CATALOG.openrouter.supportsApiKey).toBe(true);
    expect(getProviderConnectionGroup("openrouter")).toBe("sign-in");
  });

  it("treats Claude Code as a sign-in provider while leaving Anthropic on API keys", () => {
    expect(PROVIDER_CATALOG["claude-code"].authMode).toBe("tool-login");
    expect(getProviderConnectionGroup("claude-code")).toBe("sign-in");
    expect(getProviderConnectionGroup("anthropic")).toBe("api-key");
  });

  it("keeps the new hosted providers on the API-key path", () => {
    expect(getProviderConnectionGroup("glm")).toBe("api-key");
    expect(getProviderConnectionGroup("moonshot")).toBe("api-key");
    expect(getProviderConnectionGroup("minimax")).toBe("api-key");
  });

  it("maps Claude Code directly while keeping Anthropic and OpenRouter neutral", () => {
    expect(getPreferredAgentPlatformForProvider("claude-code")).toBe("claude-code");
    expect(getPreferredAgentPlatformForProvider("anthropic")).toBeNull();
    expect(getPreferredAgentPlatformForProvider("openrouter")).toBeNull();
  });
});
