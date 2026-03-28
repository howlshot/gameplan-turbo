import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AIServiceError } from "@/services/ai/errors";
import { createClaudeCodeBridgeProvider } from "@/services/ai/providers/claudeCodeBridgeProvider";

describe("createClaudeCodeBridgeProvider", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("aborts long-running requests with a clear timeout error", async () => {
    global.fetch = vi.fn((_input, init) => {
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          reject(new DOMException("Aborted", "AbortError"));
        });
      });
    }) as typeof fetch;

    const provider = createClaudeCodeBridgeProvider(
      "claude-code-default",
      "http://127.0.0.1:8766"
    );

    const request = provider.complete({
      model: "claude-code-default",
      system: "Return a test payload.",
      messages: [
        {
          role: "user",
          content: "Generate something."
        }
      ]
    });
    const assertion = expect(request).rejects.toEqual(
      expect.objectContaining<Partial<AIServiceError>>({
        code: "PROVIDER",
        message:
          "The local Claude Code bridge took longer than 95 seconds to respond. Try a smaller output or retry.",
        status: 504
      })
    );

    await vi.advanceTimersByTimeAsync(95_000);
    await assertion;
  });
});
