import {
  fetchClaudeBridgeStatus,
  getClaudeBridgeStartCommand,
  getClaudeLoginCommand,
  openClaudeLoginFlow,
  type ClaudeBridgeStatus
} from "@/lib/claudeBridge";
import {
  fetchCodexBridgeStatus,
  getCodexBridgeStartCommand,
  getCodexLoginCommand,
  openCodexLoginFlow,
  type CodexBridgeStatus
} from "@/lib/codexBridge";
import type { AIProvider } from "@/types";

export type ToolLoginProviderId = "codex" | "claude-code";

export interface ToolLoginBridgeStatus {
  ok: boolean;
  bridgeVersion?: string;
  cliVersion?: string | null;
  cliAvailable: boolean;
  loggedIn: boolean;
  loginMethod?: string | null;
  message: string;
}

export interface ToolLoginProviderMeta {
  provider: ToolLoginProviderId;
  label: string;
  cliName: string;
  signInLabel: string;
  connectionLabel: string;
  launcherUsuallyStartsBridge: boolean;
  loginCommand: string;
  startCommand: string;
  sentinelApiKey: string;
  usesSentence: string;
  helpSentence: string;
  openLoginButtonLabel: string;
  connectButtonLabel: string;
  continueButtonLabel: string;
  fallbackReadyMessage: string;
  fetchStatus: () => Promise<ToolLoginBridgeStatus>;
  openLoginFlow: () => Promise<void>;
}

const toToolLoginStatus = (
  status: CodexBridgeStatus | ClaudeBridgeStatus
): ToolLoginBridgeStatus => ({
  ok: status.ok,
  bridgeVersion: status.bridgeVersion,
  cliVersion:
    "codexVersion" in status
      ? status.codexVersion ?? null
      : "claudeVersion" in status
        ? status.claudeVersion ?? null
        : null,
  cliAvailable: status.cliAvailable,
  loggedIn: status.loggedIn,
  loginMethod: status.loginMethod ?? null,
  message: status.message
});

const TOOL_LOGIN_PROVIDERS: Record<ToolLoginProviderId, ToolLoginProviderMeta> = {
  codex: {
    provider: "codex",
    label: "Codex",
    cliName: "Codex CLI",
    signInLabel: "ChatGPT",
    connectionLabel: "Codex bridge",
    launcherUsuallyStartsBridge: true,
    loginCommand: getCodexLoginCommand(),
    startCommand: getCodexBridgeStartCommand(),
    sentinelApiKey: "codex-cli-bridge",
    usesSentence: "Uses your local Codex CLI session. No API key is stored in the app.",
    helpSentence:
      "No API key is needed here. Gameplan Turbo can use your local Codex CLI session if you want AI generation right away, but you can also skip this step and connect later in Settings.",
    openLoginButtonLabel: "Open ChatGPT Sign-In",
    connectButtonLabel: "Connect Bridge",
    continueButtonLabel: "Continue with Codex",
    fallbackReadyMessage: "ChatGPT login detected.",
    fetchStatus: async () => toToolLoginStatus(await fetchCodexBridgeStatus()),
    openLoginFlow: openCodexLoginFlow
  },
  "claude-code": {
    provider: "claude-code",
    label: "Claude Code",
    cliName: "Claude Code CLI",
    signInLabel: "Claude",
    connectionLabel: "Claude Code bridge",
    launcherUsuallyStartsBridge: true,
    loginCommand: getClaudeLoginCommand(),
    startCommand: getClaudeBridgeStartCommand(),
    sentinelApiKey: "claude-code-bridge",
    usesSentence:
      "Uses your local Claude Code login. No API key is stored in the app.",
    helpSentence:
      "No API key is needed here. Gameplan Turbo can use your local Claude Code session if you want AI generation right away, but you can also skip this step and connect later in Settings.",
    openLoginButtonLabel: "Open Claude Sign-In",
    connectButtonLabel: "Connect Bridge",
    continueButtonLabel: "Continue with Claude Code",
    fallbackReadyMessage: "Claude login detected.",
    fetchStatus: async () => toToolLoginStatus(await fetchClaudeBridgeStatus()),
    openLoginFlow: openClaudeLoginFlow
  }
};

export const isToolLoginProvider = (
  provider: AIProvider
): provider is ToolLoginProviderId =>
  Object.prototype.hasOwnProperty.call(TOOL_LOGIN_PROVIDERS, provider);

export const getToolLoginProviderMeta = (
  provider: AIProvider
): ToolLoginProviderMeta | null =>
  isToolLoginProvider(provider) ? TOOL_LOGIN_PROVIDERS[provider] : null;
