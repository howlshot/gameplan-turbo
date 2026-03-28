import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

const mocks = vi.hoisted(() => ({
  onComplete: vi.fn(),
  saveProvider: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
  updateSettings: vi.fn(),
  startOpenRouterOAuth: vi.fn(),
  validateKey: vi.fn()
}));

vi.mock("@/hooks/useAIProviders", () => ({
  useAIProviders: () => ({
    saveProvider: mocks.saveProvider
  })
}));

vi.mock("@/hooks/useSettings", () => ({
  useSettings: () => ({
    settings: {
      userName: "",
      isOnboardingComplete: false
    },
    updateSettings: mocks.updateSettings
  })
}));

vi.mock("@/hooks/useToast", () => ({
  useToast: () => ({
    error: mocks.toastError,
    success: mocks.toastSuccess
  })
}));

vi.mock("@/hooks/useDialogAccessibility", () => ({
  useDialogAccessibility: () => ({ current: null })
}));

vi.mock("@/services/ai", () => ({
  createProviderFromConfig: vi.fn(async () => ({
    validateKey: mocks.validateKey
  }))
}));

vi.mock("@/lib/codexBridge", () => ({
  fetchCodexBridgeStatus: vi.fn(),
  getCodexBridgeStartCommand: () => "corepack pnpm codex:bridge",
  getCodexLoginCommand: () => "codex login",
  openCodexLoginFlow: vi.fn()
}));

vi.mock("@/lib/ai/openRouterOAuth", () => ({
  startOpenRouterOAuth: mocks.startOpenRouterOAuth
}));

describe("OnboardingFlow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.updateSettings.mockResolvedValue(null);
    mocks.validateKey.mockResolvedValue(true);
  });

  it("lets the user skip provider setup and continue onboarding", async () => {
    render(<OnboardingFlow onComplete={mocks.onComplete} />);

    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Skip for now/i })
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Skip for now/i }));

    expect(screen.getByText(/Quick Tour/i)).toBeInTheDocument();
    expect(mocks.saveProvider).not.toHaveBeenCalled();
  });

  it("lets the user connect OpenRouter with sign-in during onboarding", async () => {
    mocks.startOpenRouterOAuth.mockResolvedValue("openrouter-test-key");

    render(<OnboardingFlow onComplete={mocks.onComplete} />);

    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /OpenRouter/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /OpenRouter/i }));
    fireEvent.click(screen.getByRole("button", { name: /Sign in with OpenRouter/i }));

    await waitFor(() => {
      expect(mocks.saveProvider).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: "openrouter",
          apiKey: "openrouter-test-key",
          authMethod: "oauth-pkce",
          isDefault: true
        })
      );
    });

    expect(screen.getByText(/Quick Tour/i)).toBeInTheDocument();
  });
});
