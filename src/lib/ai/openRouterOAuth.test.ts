import { beforeEach, describe, expect, it, vi } from "vitest";
import { startOpenRouterOAuth } from "@/lib/ai/openRouterOAuth";

const waitForNextTick = async (): Promise<void> => {
  await Promise.resolve();
  await Promise.resolve();
};

const waitForCondition = async (
  predicate: () => boolean,
  timeoutMs = 1000
): Promise<void> => {
  const startedAt = Date.now();

  while (!predicate()) {
    if (Date.now() - startedAt > timeoutMs) {
      throw new Error("Timed out waiting for condition.");
    }

    await waitForNextTick();
  }
};

describe("openRouterOAuth", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
    window.history.replaceState({}, "", "/");
    vi.spyOn(crypto.subtle, "digest").mockResolvedValue(new Uint8Array([1, 2, 3]).buffer);
  });

  it("includes a state parameter and clears session keys after a successful exchange", async () => {
    const popup = { closed: false };
    const openSpy = vi.spyOn(window, "open").mockReturnValue(popup as Window);
    const fetchSpy = vi.spyOn(window, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ key: "openrouter-key" }), {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      })
    );

    const signInPromise = startOpenRouterOAuth();
    await waitForCondition(() => openSpy.mock.calls.length > 0);

    const authUrl = new URL(openSpy.mock.calls[0][0] as string);
    const expectedState = authUrl.searchParams.get("state");

    expect(expectedState).toBeTruthy();
    expect(sessionStorage.getItem("gameplan-turbo:openrouter-state")).toBe(expectedState);

    window.dispatchEvent(
      new MessageEvent("message", {
        origin: window.location.origin,
        data: {
          type: "gameplan-turbo:openrouter-oauth",
          code: "test-code",
          state: expectedState
        }
      })
    );

    await expect(signInPromise).resolves.toBe("openrouter-key");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem("gameplan-turbo:openrouter-code-verifier")).toBeNull();
    expect(sessionStorage.getItem("gameplan-turbo:openrouter-state")).toBeNull();
  });

  it("rejects the sign-in if the callback state does not match", async () => {
    const openSpy = vi.spyOn(window, "open").mockReturnValue({ closed: false } as Window);

    const signInPromise = startOpenRouterOAuth();
    await waitForCondition(() => openSpy.mock.calls.length > 0);
    await waitForCondition(() => sessionStorage.getItem("gameplan-turbo:openrouter-state") !== null);
    await waitForNextTick();

    window.dispatchEvent(
      new MessageEvent("message", {
        origin: window.location.origin,
        data: {
          type: "gameplan-turbo:openrouter-oauth",
          code: "test-code",
          state: "wrong-state"
        }
      })
    );

    await expect(signInPromise).rejects.toThrow(/invalid state/i);
    expect(sessionStorage.getItem("gameplan-turbo:openrouter-code-verifier")).toBeNull();
    expect(sessionStorage.getItem("gameplan-turbo:openrouter-state")).toBeNull();
  });
});
