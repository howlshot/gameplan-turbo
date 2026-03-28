import { beforeEach, describe, expect, it } from "vitest";
import {
  getBridgeRequestHeaders,
  getBridgeSessionToken,
  initializeBridgeTokenFromUrl
} from "@/lib/bridgeAuth";

describe("bridgeAuth", () => {
  beforeEach(() => {
    sessionStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  it("stores the bridge token from the URL and removes it from browser history", () => {
    window.history.replaceState(
      {},
      "",
      "/settings?tab=providers#bridgeToken=test-bridge-token"
    );

    initializeBridgeTokenFromUrl();

    expect(getBridgeSessionToken()).toBe("test-bridge-token");
    expect(window.location.pathname).toBe("/settings");
    expect(window.location.search).toBe("?tab=providers");
    expect(window.location.hash).toBe("");
  });

  it("adds the stored bridge token to bridge requests", () => {
    sessionStorage.setItem("gameplan-turbo:bridge-token", "bridge-token");

    expect(getBridgeRequestHeaders({ Accept: "application/json" })).toEqual({
      Accept: "application/json",
      "X-Gameplan-Bridge-Token": "bridge-token"
    });
  });
});
