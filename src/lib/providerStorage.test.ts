import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AIProviderConfig, AppSettings } from "@/types";

const state = vi.hoisted(() => ({
  providers: [] as AIProviderConfig[],
  settings: null as AppSettings | null
}));

vi.mock("@/lib/db", () => ({
  DEFAULT_PLATFORM_LAUNCHERS: ["steam"],
  default: {
    aiProviders: {
      toArray: vi.fn(async () => [...state.providers]),
      put: vi.fn(async (provider: AIProviderConfig) => {
        state.providers = [
          ...state.providers.filter((item) => item.id !== provider.id),
          provider
        ];
      }),
      delete: vi.fn(async (providerId: string) => {
        state.providers = state.providers.filter((item) => item.id !== providerId);
      }),
      update: vi.fn(async (providerId: string, updates: Partial<AIProviderConfig>) => {
        state.providers = state.providers.map((item) =>
          item.id === providerId ? { ...item, ...updates } : item
        );
      }),
      get: vi.fn(async (providerId: string) =>
        state.providers.find((item) => item.id === providerId) ?? undefined
      )
    },
    appSettings: {
      get: vi.fn(async () => state.settings),
      put: vi.fn(async (settings: AppSettings) => {
        state.settings = settings;
      })
    },
    transaction: vi.fn(async (...args: unknown[]) => {
      const callback = args.at(-1);
      if (typeof callback === "function") {
        return callback();
      }
      return undefined;
    })
  }
}));

import {
  getDefaultStoredProviderConfig,
  listStoredProviderConfigs,
  saveStoredProviderConfig,
  setDefaultStoredProviderConfig
} from "@/lib/providerStorage";

describe("providerStorage", () => {
  beforeEach(() => {
    state.providers = [];
    state.settings = {
      id: "app-settings",
      theme: "dark",
      defaultProvider: null,
      enabledPlatformLaunchers: ["steam"],
      streamingEnabled: true,
      userName: "",
      isOnboardingComplete: false,
      updatedAt: Date.now()
    };
    sessionStorage.clear();
  });

  it("prefers the hosted session default provider over a remembered device default", async () => {
    state.providers = [
      {
        id: "anthropic-device",
        provider: "anthropic",
        apiKey: "anthropic-device-key",
        model: "claude-sonnet",
        isDefault: true,
        createdAt: 1
      }
    ];

    await saveStoredProviderConfig(
      {
        id: "openrouter-session",
        provider: "openrouter",
        apiKey: "openrouter-session-key",
        model: "openrouter/auto",
        isDefault: true,
        createdAt: 2,
        authMethod: "oauth-pkce"
      },
      "session"
    );

    const defaultProvider = await getDefaultStoredProviderConfig();

    expect(defaultProvider?.provider).toBe("openrouter");
    expect(defaultProvider?.apiKey).toBe("openrouter-session-key");
  });

  it("moves a provider out of device storage when saved as session-only", async () => {
    state.providers = [
      {
        id: "anthropic-device",
        provider: "anthropic",
        apiKey: "anthropic-device-key",
        model: "claude-sonnet",
        isDefault: false,
        createdAt: 1
      }
    ];

    await saveStoredProviderConfig(
      {
        id: "anthropic-session",
        provider: "anthropic",
        apiKey: "anthropic-session-key",
        model: "claude-sonnet",
        isDefault: false,
        createdAt: 2
      },
      "session"
    );

    const providers = await listStoredProviderConfigs();

    expect(state.providers).toHaveLength(0);
    expect(providers).toEqual([
      expect.objectContaining({
        provider: "anthropic",
        apiKey: "anthropic-session-key",
        storageLocation: "session"
      })
    ]);
  });

  it("clears session defaults when a remembered device provider becomes default", async () => {
    sessionStorage.setItem(
      "gameplan-turbo:session-ai-providers",
      JSON.stringify([
        {
          id: "openrouter-session",
          provider: "openrouter",
          apiKey: "openrouter-session-key",
          model: "openrouter/auto",
          isDefault: true,
          createdAt: 2
        }
      ])
    );
    state.providers = [
      {
        id: "anthropic-device",
        provider: "anthropic",
        apiKey: "anthropic-device-key",
        model: "claude-sonnet",
        isDefault: false,
        createdAt: 1
      }
    ];

    await setDefaultStoredProviderConfig("anthropic-device", "device");

    const providers = await listStoredProviderConfigs();
    const sessionProvider = providers.find((item) => item.provider === "openrouter");
    const deviceProvider = providers.find((item) => item.provider === "anthropic");

    expect(deviceProvider?.isDefault).toBe(true);
    expect(sessionProvider?.isDefault).toBe(false);
  });
});
