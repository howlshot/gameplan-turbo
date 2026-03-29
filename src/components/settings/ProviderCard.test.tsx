import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProviderCard } from "@/components/settings/ProviderCard";

const mocks = vi.hoisted(() => ({
  hostedRuntime: false,
  desktopRuntime: false,
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

vi.mock("@/lib/runtimeMode", () => ({
  isDesktopRuntime: () => mocks.desktopRuntime,
  isHostedRuntime: () => mocks.hostedRuntime
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
    mocks.hostedRuntime = false;
    mocks.desktopRuntime = false;
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
        onDisconnect={vi.fn()}
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
        onDisconnect={vi.fn()}
        onSave={vi.fn()}
        onSetDefault={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Open Claude Sign-In/i }));

    await waitFor(() => {
      expect(mocks.openLoginFlow).toHaveBeenCalled();
    });
  });

  it("shows disconnect for connected providers and triggers it", async () => {
    const onDisconnect = vi.fn();

    render(
      <ProviderCard
        provider={{
          id: "claude-provider",
          provider: "claude-code",
          model: "claude-code-default",
          hasKey: true,
          maskedKey: "claude...",
          isDefault: false
        }}
        onDisconnect={onDisconnect}
        onSave={vi.fn()}
        onSetDefault={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Disconnect/i }));

    await waitFor(() => {
      expect(onDisconnect).toHaveBeenCalledWith("claude-provider", "device");
    });
  });

  it("shows local-only guidance for tool-login providers in hosted mode", async () => {
    mocks.hostedRuntime = true;

    render(
      <ProviderCard
        provider={{
          provider: "claude-code",
          model: "claude-code-default",
          hasKey: false,
          maskedKey: "",
          isDefault: false
        }}
        onDisconnect={vi.fn()}
        onSave={vi.fn()}
        onSetDefault={vi.fn()}
      />
    );

    expect(
      screen.getByText(/available only in local desktop mode/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Open Claude Sign-In/i })
    ).not.toBeInTheDocument();
    expect(mocks.fetchStatus).not.toHaveBeenCalled();
  });

  it("shows desktop-managed instructions in desktop runtime", async () => {
    mocks.desktopRuntime = true;
    mocks.fetchStatus.mockResolvedValue({
      ok: false,
      cliAvailable: true,
      loggedIn: false,
      message: "not logged in"
    });

    render(
      <ProviderCard
        provider={{
          provider: "claude-code",
          model: "claude-code-default",
          hasKey: false,
          maskedKey: "",
          isDefault: false
        }}
        onDisconnect={vi.fn()}
        onSave={vi.fn()}
        onSetDefault={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/desktop app manages the local bridge/i)).toBeInTheDocument();
    });

    expect(screen.queryByText(/Open Terminal/i)).not.toBeInTheDocument();
  });

  it("defaults hosted API-key providers to session-only unless remember is checked", async () => {
    mocks.hostedRuntime = true;
    const onSave = vi.fn();

    render(
      <ProviderCard
        provider={{
          provider: "anthropic",
          model: "claude-sonnet",
          hasKey: false,
          maskedKey: "",
          isDefault: false,
          storageLocation: "device"
        }}
        onDisconnect={vi.fn()}
        onSave={onSave}
        onSetDefault={vi.fn()}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Edit Anthropic connection/i })
    );
    fireEvent.change(
      screen.getByPlaceholderText(/Paste your .* api key/i),
      { target: { value: "anthropic-test-key" } }
    );

    const rememberCheckbox = screen.getByRole("checkbox", {
      name: /Remember on this device/i
    });

    expect(rememberCheckbox).not.toBeChecked();

    fireEvent.click(screen.getByRole("button", { name: /Save/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: "anthropic",
          rememberOnDevice: false
        })
      );
    });
  });
});
