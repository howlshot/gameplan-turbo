import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProviderCard } from "@/components/settings/ProviderCard";

const mocks = vi.hoisted(() => ({
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
  fetchStatus: vi.fn(),
  openLoginFlow: vi.fn()
}));

vi.mock("@/hooks/useToast", () => ({
  useToast: () => ({
    error: mocks.toastError,
    success: mocks.toastSuccess
  })
}));

vi.mock("@/lib/toolLoginProviders", () => ({
  getToolLoginProviderMeta: (provider: string) =>
    provider === "claude-code"
      ? {
          provider: "claude-code",
          label: "Claude Code",
          cliName: "Claude Code CLI",
          signInLabel: "Claude",
          connectionLabel: "Claude Code bridge",
          loginCommand: "claude auth login",
          startCommand: "corepack pnpm claude:bridge",
          sentinelApiKey: "claude-code-bridge",
          usesSentence:
            "Uses your local Claude Code login. No API key is stored in the app.",
          helpSentence: "",
          openLoginButtonLabel: "Open Claude Sign-In",
          connectButtonLabel: "Connect Bridge",
          continueButtonLabel: "Continue with Claude Code",
          fallbackReadyMessage: "Claude login detected.",
          fetchStatus: mocks.fetchStatus,
          openLoginFlow: mocks.openLoginFlow
        }
      : null
}));

describe("ProviderCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.fetchStatus.mockResolvedValue({
      ok: false,
      cliAvailable: false,
      loggedIn: false,
      message: "missing"
    });
  });

  it("renders the Claude Code tool-login workflow", async () => {
    render(
      <ProviderCard
        provider={{
          provider: "claude-code",
          model: "claude-code-default",
          hasKey: false,
          maskedKey: "",
          isDefault: false
        }}
        onSave={vi.fn()}
        onSetDefault={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(mocks.fetchStatus).toHaveBeenCalled();
    });

    expect(screen.getByText(/Uses your local Claude Code login/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Open Claude Sign-In/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Connect Bridge/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Checking\.\.\.|Check Status/i })
    ).toBeInTheDocument();
  });

  it("opens the Claude login flow from the card", async () => {
    mocks.openLoginFlow.mockResolvedValue(undefined);

    render(
      <ProviderCard
        provider={{
          provider: "claude-code",
          model: "claude-code-default",
          hasKey: false,
          maskedKey: "",
          isDefault: false
        }}
        onSave={vi.fn()}
        onSetDefault={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Open Claude Sign-In/i }));

    await waitFor(() => {
      expect(mocks.openLoginFlow).toHaveBeenCalled();
    });
  });
});
