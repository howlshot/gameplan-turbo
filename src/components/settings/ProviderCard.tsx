import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchCodexBridgeStatus,
  getCodexBridgeStartCommand,
  getCodexLoginCommand,
  openCodexLoginFlow,
  type CodexBridgeStatus
} from "@/lib/codexBridge";
import { PROVIDER_CATALOG } from "@/lib/ai/providerCatalog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import type { AIProvider } from "@/types";

export interface ProviderCardValue {
  id?: string;
  provider: AIProvider;
  model: string;
  isDefault: boolean;
  hasKey: boolean;
  maskedKey: string;
}

interface ProviderCardProps {
  provider: ProviderCardValue;
  onSave: (provider: AIProvider, apiKey: string) => Promise<void>;
  onSetDefault: (providerId: string) => Promise<void>;
}

export const ProviderCard = ({
  provider,
  onSave,
  onSetDefault
}: ProviderCardProps): JSX.Element => {
  const toast = useToast();
  const config = PROVIDER_CATALOG[provider.provider];
  const providerId = provider.id;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isStartingLogin, setIsStartingLogin] = useState(false);
  const [bridgeStatusMessage, setBridgeStatusMessage] = useState("");
  const [isCheckingBridge, setIsCheckingBridge] = useState(false);
  const [isBridgeReady, setIsBridgeReady] = useState<boolean | null>(null);
  const isLocalBridgeProvider = config.authMode === "local-bridge";
  const isConnected = isLocalBridgeProvider ? isBridgeReady === true : provider.hasKey;
  const statusLabel = isLocalBridgeProvider
    ? isCheckingBridge
      ? "Checking"
      : isConnected
        ? "Bridge Ready"
        : "Bridge Offline"
    : provider.hasKey
      ? "Connected"
      : "Disconnected";

  const handleSave = async (): Promise<void> => {
    const value = inputRef.current?.value.trim() ?? "";
    if (!value) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave(provider.provider, value);
      setIsEditing(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } finally {
      setIsSaving(false);
    }
  };

  const checkBridgeStatus = useCallback(async (): Promise<CodexBridgeStatus | null> => {
    setIsCheckingBridge(true);

    try {
      const status = await fetchCodexBridgeStatus();

      if (!status.cliAvailable) {
        setIsBridgeReady(false);
        setBridgeStatusMessage("Codex CLI is not installed on this machine.");
      } else if (!status.loggedIn) {
        setIsBridgeReady(false);
        setBridgeStatusMessage(
          `Bridge is online, but Codex is not logged in. Run \`${getCodexLoginCommand()}\` first.`
        );
      } else {
        setIsBridgeReady(true);
        setBridgeStatusMessage(
          `Bridge ready. ${status.loginMethod ?? "ChatGPT"} login detected.`
        );
      }

      return status;
    } catch {
      setIsBridgeReady(false);
      setBridgeStatusMessage(
        `Bridge offline. Start it with \`${getCodexBridgeStartCommand()}\`.`
      );
      return null;
    } finally {
      setIsCheckingBridge(false);
    }
  }, []);

  const handleLocalBridgeConnect = useCallback(async (): Promise<void> => {
    const status = await checkBridgeStatus();

    if (!status?.ok || !status.loggedIn) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave(provider.provider, "codex-cli-bridge");
    } finally {
      setIsSaving(false);
    }
  }, [checkBridgeStatus, onSave, provider.provider]);

  const handleOpenLogin = useCallback(async (): Promise<void> => {
    setIsStartingLogin(true);

    try {
      await openCodexLoginFlow();
      setBridgeStatusMessage(
        "Codex login flow opened. Finish sign-in in the Terminal/browser window, then click Check Status."
      );
      toast.success("Opened the Codex login flow.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not open the Codex login flow.";
      setBridgeStatusMessage(message);
      toast.error(message);
    } finally {
      setIsStartingLogin(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isLocalBridgeProvider) {
      void checkBridgeStatus();
    }
  }, [checkBridgeStatus, isLocalBridgeProvider, provider.hasKey]);

  return (
    <article className="flex min-h-[220px] flex-col justify-between rounded-2xl border border-outline-variant/10 bg-surface-container-low p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-container-lowest text-primary">
          <span className="material-symbols-outlined">{config.icon}</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "h-2.5 w-2.5 rounded-full",
              isConnected ? "bg-secondary" : "bg-tertiary"
            )}
          />
          <span
            className={cn(
              "font-mono text-[10px] uppercase tracking-[0.2em]",
              isConnected ? "text-secondary" : "text-tertiary"
            )}
          >
            {statusLabel}
          </span>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-headline text-sm font-semibold text-on-surface">
            {config.label}
          </h3>
          {providerId ? (
            <button
              type="button"
              onClick={() => void onSetDefault(providerId)}
              className={cn(
                "rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
                provider.isDefault
                  ? "bg-primary/10 text-primary"
                  : "bg-surface text-on-surface-variant hover:text-on-surface"
              )}
            >
              {provider.isDefault ? "Default" : "Set Default"}
            </button>
          ) : null}
        </div>

        {isLocalBridgeProvider ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm leading-6 text-on-surface-variant">
              Uses your local Codex CLI session. No API key is stored in the app.
            </p>
            <p className="rounded-xl border border-outline-variant/10 bg-surface px-4 py-3 font-mono text-[11px] leading-5 text-on-surface-variant">
              {bridgeStatusMessage || "Checking local Codex bridge status..."}
            </p>
            <div className="space-y-2 rounded-xl border border-outline-variant/10 bg-surface px-4 py-4 text-sm leading-6 text-on-surface-variant">
              <p className="font-semibold text-on-surface">First-time setup</p>
              <p>1. Open Terminal.</p>
              <p>
                2. Run <code>{getCodexLoginCommand()}</code>
              </p>
              <p>3. Finish the ChatGPT sign-in in your browser.</p>
              <p>4. Switch Terminal into your Preflight Game OS folder.</p>
              <p>
                If needed, run <code>cd /path/to/preflight-game-os</code>
              </p>
              <p>
                5. Run <code>{getCodexBridgeStartCommand()}</code>
              </p>
              <p>6. Leave that Terminal window open.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isStartingLogin}
                onClick={() => void handleOpenLogin()}
                className="rounded-xl bg-surface px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface disabled:opacity-60"
              >
                {isStartingLogin ? "Opening..." : "Open Sign-In"}
              </button>
              <button
                type="button"
                disabled={isSaving || isCheckingBridge}
                onClick={() => void handleLocalBridgeConnect()}
                className="rounded-xl bg-primary/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary transition hover:bg-primary/15 disabled:opacity-60"
              >
                {isSaving
                  ? "Connecting..."
                  : provider.hasKey
                    ? "Reconnect"
                    : "Connect Bridge"}
              </button>
              <button
                type="button"
                disabled={isCheckingBridge}
                onClick={() => void checkBridgeStatus()}
                className="rounded-xl bg-surface px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface disabled:opacity-60"
              >
                {isCheckingBridge ? "Checking..." : "Check Status"}
              </button>
            </div>
            <p className="text-xs leading-5 text-on-surface-variant">
              If you use the Desktop launcher, it will usually start the bridge for you.
            </p>
          </div>
        ) : isEditing ? (
          <div className="mt-4 space-y-3">
            <input
              ref={inputRef}
              type="password"
              autoFocus
              placeholder={`Paste your ${config.keyLabel.toLowerCase()}`}
              className="w-full rounded-xl border border-outline-variant/15 bg-surface px-4 py-3 font-mono text-sm text-on-surface outline-none transition focus:border-primary/40"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => void handleSave()}
                className="rounded-xl bg-primary/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary transition hover:bg-primary/15 disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-xl bg-surface px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
              {provider.hasKey ? provider.maskedKey : "No key connected"}
            </p>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="rounded-full p-2 text-on-surface-variant transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-surface hover:text-primary"
            >
              <span className="material-symbols-outlined text-base">edit</span>
            </button>
          </div>
        )}
      </div>
    </article>
  );
};
