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

  it("keeps the new hosted providers on the API-key path", () => {
    expect(getProviderConnectionGroup("glm")).toBe("api-key");
    expect(getProviderConnectionGroup("moonshot")).toBe("api-key");
    expect(getProviderConnectionGroup("minimax")).toBe("api-key");
  });

  it("does not force a build-tool bias for OpenRouter", () => {
    expect(getPreferredAgentPlatformForProvider("openrouter")).toBeNull();
  });
});
