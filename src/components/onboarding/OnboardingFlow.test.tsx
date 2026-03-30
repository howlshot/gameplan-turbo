import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

const mocks = vi.hoisted(() => ({
  hostedRuntime: false,
  desktopRuntime: false,
  webSurface: "desktop-web" as "desktop-web" | "mobile-web",
  onComplete: vi.fn(),
  saveProvider: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
  updateSettings: vi.fn(),
  startOpenRouterOAuth: vi.fn(),
  validateKey: vi.fn(),
  fetchCodexBridgeStatus: vi.fn(),
  fetchClaudeBridgeStatus: vi.fn(),
  openCodexLoginFlow: vi.fn(),
  openClaudeLoginFlow: vi.fn()
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

vi.mock("@/lib/runtimeMode", () => ({
  isDesktopRuntime: () => mocks.desktopRuntime,
  isHostedRuntime: () => mocks.hostedRuntime
}));

vi.mock("@/hooks/useWebSurface", () => ({
  useWebSurface: () => mocks.webSurface
}));

vi.mock("@/services/ai", () => ({
  createProviderFromConfig: vi.fn(async () => ({
    validateKey: mocks.validateKey
  }))
}));

vi.mock("@/lib/codexBridge", () => ({
  fetchCodexBridgeStatus: mocks.fetchCodexBridgeStatus,
  getCodexBridgeStartCommand: () => "corepack pnpm codex:bridge",
  getCodexLoginCommand: () => "codex login",
  openCodexLoginFlow: mocks.openCodexLoginFlow
}));

vi.mock("@/lib/claudeBridge", () => ({
  fetchClaudeBridgeStatus: mocks.fetchClaudeBridgeStatus,
  getClaudeBridgeStartCommand: () => "corepack pnpm claude:bridge",
  getClaudeLoginCommand: () => "claude auth login",
  openClaudeLoginFlow: mocks.openClaudeLoginFlow
}));

vi.mock("@/lib/ai/openRouterOAuth", () => ({
  startOpenRouterOAuth: mocks.startOpenRouterOAuth
}));

describe("OnboardingFlow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hostedRuntime = false;
    mocks.desktopRuntime = false;
    mocks.webSurface = "desktop-web";
    mocks.updateSettings.mockResolvedValue(null);
    mocks.validateKey.mockResolvedValue(true);
    mocks.fetchCodexBridgeStatus.mockResolvedValue({
      ok: true,
      cliAvailable: true,
      loggedIn: true,
      loginMethod: "ChatGPT",
      message: "ok"
    });
    mocks.fetchClaudeBridgeStatus.mockResolvedValue({
      ok: true,
      cliAvailable: true,
      loggedIn: true,
      loginMethod: "Claude",
      message: "ok"
    });
  });

  it("lets the user skip provider setup and continue onboarding", async () => {
    render(<OnboardingFlow onComplete={mocks.onComplete} />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Skip for now/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Skip for now/i }));

    expect(screen.getByText(/Quick Tour/i)).toBeInTheDocument();
    expect(mocks.saveProvider).not.toHaveBeenCalled();
  });

  it("lets the user connect OpenRouter with sign-in during onboarding", async () => {
    mocks.startOpenRouterOAuth.mockResolvedValue("openrouter-test-key");

    render(<OnboardingFlow onComplete={mocks.onComplete} />);

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

  it("defaults hosted providers to session-only storage unless remember is checked", async () => {
    mocks.hostedRuntime = true;
    mocks.startOpenRouterOAuth.mockResolvedValue("openrouter-test-key");

    render(<OnboardingFlow onComplete={mocks.onComplete} />);

    fireEvent.click(screen.getByRole("button", { name: /OpenRouter/i }));

    const rememberCheckbox = screen.getByRole("checkbox", {
      name: /Remember on this device/i
    });

    expect(rememberCheckbox).not.toBeChecked();

    fireEvent.click(screen.getByRole("button", { name: /Sign in with OpenRouter/i }));

    await waitFor(() => {
      expect(mocks.saveProvider).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: "openrouter",
          rememberOnDevice: false
        })
      );
    });
  });

  it("lets the user connect Claude Code through the tool-login workflow", async () => {
    render(<OnboardingFlow onComplete={mocks.onComplete} />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Claude Code/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Claude Code/i }));
    fireEvent.click(
      screen.getByRole("button", { name: /Continue with Claude Code/i })
    );

    await waitFor(() => {
      expect(mocks.saveProvider).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: "claude-code",
          apiKey: "claude-code-bridge",
          authMethod: "tool-login",
          isDefault: true
        })
      );
    });

    expect(screen.getByText(/Quick Tour/i)).toBeInTheDocument();
  });

  it("uses the mobile provider path selector on the mobile web surface", async () => {
    mocks.webSurface = "mobile-web";

    render(<OnboardingFlow onComplete={mocks.onComplete} />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Stay in browser/i })).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /Anthropic/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Codex \(ChatGPT login\)/i })
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Use desktop sign-in/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Codex \(ChatGPT login\)/i })
      ).toBeInTheDocument();
    });

    expect(screen.queryByRole("button", { name: /Anthropic/i })).not.toBeInTheDocument();
  });

  it("marks Claude Code as local-only in the hosted app", async () => {
    mocks.hostedRuntime = true;

    render(<OnboardingFlow onComplete={mocks.onComplete} />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Claude Code/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Claude Code/i }));

    expect(
      screen.getByText(/Codex and Claude Code need the desktop app because they connect through local bridges/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Available in Local Desktop Mode/i })
    ).toBeDisabled();
  });

  it("uses desktop-oriented guidance for tool-login in desktop runtime", async () => {
    mocks.desktopRuntime = true;
    mocks.fetchClaudeBridgeStatus.mockResolvedValue({
      ok: true,
      cliAvailable: true,
      loggedIn: false,
      loginMethod: null,
      message: "not logged in"
    });

    render(<OnboardingFlow onComplete={mocks.onComplete} />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Claude Code/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Claude Code/i }));
    fireEvent.click(
      screen.getByRole("button", { name: /Continue with Claude Code/i })
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Use `Open Claude Sign-In`, finish sign-in in your browser/i)
      ).toBeInTheDocument();
    });
  });
});
