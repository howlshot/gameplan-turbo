import { describe, expect, it } from "vitest";
import {
  CUSTOM_BASE_URL_PRESETS,
  getSanitizedCustomApiKey,
  isLikelyLocalBaseUrl
} from "@/lib/ai/customProviderUtils";

describe("customProviderUtils", () => {
  it("recognizes local OpenAI-compatible endpoints", () => {
    expect(isLikelyLocalBaseUrl("http://127.0.0.1:1234/v1")).toBe(true);
    expect(isLikelyLocalBaseUrl("http://localhost:11434/v1")).toBe(true);
    expect(isLikelyLocalBaseUrl("https://api.openrouter.ai/v1")).toBe(false);
  });

  it("uses a placeholder key for local endpoints when no key is supplied", () => {
    expect(
      getSanitizedCustomApiKey("", CUSTOM_BASE_URL_PRESETS[0].value)
    ).toBe("local-openai-compatible");
    expect(
      getSanitizedCustomApiKey("real-key", CUSTOM_BASE_URL_PRESETS[0].value)
    ).toBe("real-key");
  });
});
