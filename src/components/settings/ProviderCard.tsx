import { useCallback, useEffect, useRef, useState } from "react";
import {
  CUSTOM_BASE_URL_PRESETS
} from "@/lib/ai/customProviderUtils";
import { startOpenRouterOAuth } from "@/lib/ai/openRouterOAuth";
import { APP_FOLDER_PLACEHOLDER, APP_NAME } from "@/lib/brand";
import { PROVIDER_CATALOG } from "@/lib/ai/providerCatalog";
import { isHostedRuntime } from "@/lib/runtimeMode";
import { getToolLoginProviderMeta, type ToolLoginBridgeStatus } from "@/lib/toolLoginProviders";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import type { AIProvider } from "@/types";

export interface ProviderCardValue {
  id?: string;
  provider: AIProvider;
  model: string;
  baseUrl?: string;
  authMethod?: "api-key" | "local-bridge" | "oauth-pkce" | "tool-login";
  isDefault: boolean;
  hasKey: boolean;
  maskedKey: string;
}

interface ProviderCardProps {
  provider: ProviderCardValue;
  onSave: (input: {
    provider: AIProvider;
    apiKey: string;
    model: string;
    baseUrl?: string;
    authMethod?: "api-key" | "local-bridge" | "oauth-pkce" | "tool-login";
  }) => Promise<void>;
  onDisconnect: (providerId: string) => Promise<void>;
  onSetDefault: (providerId: string) => Promise<void>;
}

export const ProviderCard = ({
  provider,
  onSave,
  onDisconnect,
  onSetDefault
}: ProviderCardProps): JSX.Element => {
  const toast = useToast();
  const config = PROVIDER_CATALOG[provider.provider];
  const providerId = provider.id;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const baseUrlRef = useRef<HTMLInputElement | null>(null);
  const modelRef = useRef<HTMLInputElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isStartingLogin, setIsStartingLogin] = useState(false);
  const [isStartingOAuth, setIsStartingOAuth] = useState(false);
  const [bridgeStatusMessage, setBridgeStatusMessage] = useState("");
  const [isCheckingBridge, setIsCheckingBridge] = useState(false);
  const [isBridgeReady, setIsBridgeReady] = useState<boolean | null>(null);
  const authMode = config.authMode ?? "api-key";
  const toolLoginProvider = getToolLoginProviderMeta(provider.provider);
  const isHostedBridgeUnavailable =
    Boolean(toolLoginProvider) && isHostedRuntime();
  const supportsOAuthPkce = authMode === "oauth-pkce";
  const isCustomProvider = provider.provider === "custom";
  const isConnected = toolLoginProvider
    ? isHostedBridgeUnavailable
      ? false
      : isBridgeReady === true
    : provider.hasKey;
  const statusLabel = toolLoginProvider
    ? isHostedBridgeUnavailable
      ? "Local Only"
      : isCheckingBridge
        ? "Checking"
        : isConnected
          ? "Bridge Ready"
          : "Bridge Offline"
    : provider.hasKey
      ? "Connected"
      : "Disconnected";
  const bridgeOfflineMessage = toolLoginProvider
    ? `Bridge offline. Relaunch the desktop app or start it with \`${toolLoginProvider.startCommand}\`.`
    : "";
  const canDisconnect = Boolean(providerId);

  const handleSave = async (): Promise<void> => {
    const value = inputRef.current?.value.trim() ?? "";
    const nextBaseUrl = baseUrlRef.current?.value.trim() ?? provider.baseUrl ?? "";
    const nextModel = modelRef.current?.value.trim() ?? provider.model;
    if ((!value && !provider.hasKey) || !nextModel || (isCustomProvider && !nextBaseUrl)) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        provider: provider.provider,
        apiKey: value,
        model: nextModel,
        baseUrl: isCustomProvider ? nextBaseUrl : undefined,
        authMethod: "api-key"
      });
      setIsEditing(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } finally {
      setIsSaving(false);
    }
  };

  const checkBridgeStatus = useCallback(async (): Promise<ToolLoginBridgeStatus | null> => {
    if (!toolLoginProvider) {
      return null;
    }

    if (isHostedBridgeUnavailable) {
      setIsBridgeReady(false);
      setBridgeStatusMessage(
        `${toolLoginProvider.label} is available only when Gameplan Turbo is running locally.`
      );
      return null;
    }

    setIsCheckingBridge(true);

    try {
      const status = await toolLoginProvider.fetchStatus();

      if (!status.cliAvailable) {
        setIsBridgeReady(false);
        setBridgeStatusMessage(`${toolLoginProvider.cliName} is not installed on this machine.`);
      } else if (!status.loggedIn) {
        setIsBridgeReady(false);
        setBridgeStatusMessage(
          `Bridge is online, but ${toolLoginProvider.label} is not logged in. Run \`${toolLoginProvider.loginCommand}\` first.`
        );
      } else {
        setIsBridgeReady(true);
        setBridgeStatusMessage(
          status.loginMethod
            ? `Bridge ready. ${status.loginMethod} login detected.`
            : `Bridge ready. ${toolLoginProvider.fallbackReadyMessage}`
        );
      }

      return status;
    } catch {
      setIsBridgeReady(false);
      setBridgeStatusMessage(bridgeOfflineMessage);
      return null;
    } finally {
      setIsCheckingBridge(false);
    }
  }, [bridgeOfflineMessage, isHostedBridgeUnavailable, toolLoginProvider]);

  const handleToolLoginConnect = useCallback(async (): Promise<void> => {
    if (!toolLoginProvider) {
      return;
    }

    if (isHostedBridgeUnavailable) {
      toast.error(
        `${toolLoginProvider.label} uses a local bridge and is only available when running Gameplan Turbo locally.`
      );
      return;
    }

    const status = await checkBridgeStatus();

    if (!status?.ok || !status.loggedIn) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        provider: provider.provider,
        apiKey: toolLoginProvider.sentinelApiKey,
        model: provider.model,
        authMethod: authMode
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    authMode,
    checkBridgeStatus,
    isHostedBridgeUnavailable,
    onSave,
    provider.model,
    provider.provider,
    toast,
    toolLoginProvider
  ]);

  const handleOpenLogin = useCallback(async (): Promise<void> => {
    if (!toolLoginProvider) {
      return;
    }

    if (isHostedBridgeUnavailable) {
      toast.error(
        `${toolLoginProvider.label} sign-in is available only in local desktop mode.`
      );
      return;
    }

    setIsStartingLogin(true);

    try {
      await toolLoginProvider.openLoginFlow();
      setBridgeStatusMessage(
        `${toolLoginProvider.label} login flow opened. Finish sign-in in the Terminal/browser window, then click Check Status.`
      );
      toast.success(`Opened the ${toolLoginProvider.label} login flow.`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : `Could not open the ${toolLoginProvider.label} login flow.`;
      setBridgeStatusMessage(message);
      toast.error(message);
    } finally {
      setIsStartingLogin(false);
    }
  }, [isHostedBridgeUnavailable, toast, toolLoginProvider]);

  const handleOpenRouterConnect = useCallback(async (): Promise<void> => {
    setIsStartingOAuth(true);

    try {
      const apiKey = await startOpenRouterOAuth();
      await onSave({
        provider: provider.provider,
        apiKey,
        model: provider.model,
        authMethod: "oauth-pkce"
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Could not connect ${config.label} right now.`
      );
    } finally {
      setIsStartingOAuth(false);
    }
  }, [config.label, onSave, provider.provider, toast]);

  useEffect(() => {
    if (toolLoginProvider && !isHostedBridgeUnavailable) {
      void checkBridgeStatus();
    }
  }, [checkBridgeStatus, isHostedBridgeUnavailable, provider.hasKey, toolLoginProvider]);

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
          <div className="flex items-center gap-2">
            {canDisconnect ? (
              <button
                type="button"
                onClick={() => {
                  if (providerId) {
                    void onDisconnect(providerId);
                  }
                }}
                className="rounded-full bg-surface px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-tertiary transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-surface-container-high hover:text-on-surface"
              >
                Disconnect
              </button>
            ) : null}
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
        </div>

        {toolLoginProvider ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm leading-6 text-on-surface-variant">
              {toolLoginProvider.usesSentence}
            </p>
            {isHostedBridgeUnavailable ? (
              <>
                <p className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 font-mono text-[11px] leading-5 text-on-surface-variant">
                  {toolLoginProvider.label} is available only in local desktop mode.
                </p>
                <div className="space-y-2 rounded-xl border border-outline-variant/10 bg-surface px-4 py-4 text-sm leading-6 text-on-surface-variant">
                  <p className="font-semibold text-on-surface">Use this when running locally</p>
                  <p>
                    {toolLoginProvider.label} relies on a bridge that talks to your local
                    CLI session, so it is intentionally disabled on the hosted web app.
                  </p>
                  <p>
                    Use <strong>OpenRouter</strong> or an <strong>API key</strong>
                    provider here, or run {APP_NAME} locally if you want to connect{" "}
                    {toolLoginProvider.label}.
                  </p>
                </div>
              </>
            ) : (
              <>
                <p className="rounded-xl border border-outline-variant/10 bg-surface px-4 py-3 font-mono text-[11px] leading-5 text-on-surface-variant">
                  {bridgeStatusMessage || `Checking ${toolLoginProvider.connectionLabel} status...`}
                </p>
                <div className="space-y-2 rounded-xl border border-outline-variant/10 bg-surface px-4 py-4 text-sm leading-6 text-on-surface-variant">
                  <p className="font-semibold text-on-surface">First-time setup</p>
                  {toolLoginProvider.launcherUsuallyStartsBridge ? (
                    <p>
                      If you launched {APP_NAME} from the desktop app, it will usually
                      start this bridge for you. Use the steps below only if relaunching
                      the app does not bring the bridge online.
                    </p>
                  ) : null}
                  <p>1. Open Terminal.</p>
                  <p>
                    2. Run <code>{toolLoginProvider.loginCommand}</code>
                  </p>
                  <p>3. Finish the {toolLoginProvider.signInLabel} sign-in in your browser.</p>
                  <p>4. Switch Terminal into your {APP_NAME} folder.</p>
                  <p>
                    If needed, run <code>cd {APP_FOLDER_PLACEHOLDER}</code>
                  </p>
                  <p>
                    5. Run <code>{toolLoginProvider.startCommand}</code>
                  </p>
                  <p>6. Leave that Terminal window open.</p>
                </div>
                <div className="space-y-2 rounded-xl border border-primary/15 bg-primary/5 px-4 py-4 text-sm leading-6 text-on-surface-variant">
                  <p className="font-semibold text-on-surface">What each button does</p>
                  <p>
                    <strong>{toolLoginProvider.openLoginButtonLabel}</strong> opens the
                    {toolLoginProvider.signInLabel} sign-in flow.
                  </p>
                  <p>
                    <strong>Check Status</strong> confirms that the bridge is running and
                    the CLI is logged in.
                  </p>
                  <p>
                    <strong>{toolLoginProvider.connectButtonLabel}</strong> saves that
                    running session into {APP_NAME}.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isStartingLogin}
                    onClick={() => void handleOpenLogin()}
                    className="rounded-xl bg-surface px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface disabled:opacity-60"
                  >
                    {isStartingLogin ? "Opening..." : toolLoginProvider.openLoginButtonLabel}
                  </button>
                  <button
                    type="button"
                    disabled={isSaving || isCheckingBridge}
                    onClick={() => void handleToolLoginConnect()}
                    className="rounded-xl bg-primary/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary transition hover:bg-primary/15 disabled:opacity-60"
                  >
                    {isSaving
                      ? "Connecting..."
                      : provider.hasKey
                        ? "Reconnect"
                        : toolLoginProvider.connectButtonLabel}
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
                  Relaunch the desktop app first if the bridge is offline. If that does not
                  work, start it manually with <code>{toolLoginProvider.startCommand}</code>.
                </p>
              </>
            )}
          </div>
        ) : isEditing ? (
          <div className="mt-4 space-y-3">
            {isCustomProvider ? (
              <div className="space-y-3 rounded-xl border border-outline-variant/10 bg-surface px-4 py-4">
                <label className="block">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">
                    Base URL
                  </span>
                  <input
                    ref={baseUrlRef}
                    type="url"
                    autoFocus
                    defaultValue={provider.baseUrl ?? CUSTOM_BASE_URL_PRESETS[0].value}
                    placeholder="https://your-endpoint.example.com/v1"
                    className="mt-2 w-full rounded-xl border border-outline-variant/15 bg-surface-container-lowest px-4 py-3 font-mono text-sm text-on-surface outline-none transition focus:border-primary/40"
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  {CUSTOM_BASE_URL_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        if (baseUrlRef.current) {
                          baseUrlRef.current.value = preset.value;
                        }
                      }}
                      className="rounded-full bg-surface-container-lowest px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <label className="block">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">
                    Model ID
                  </span>
                  <input
                    ref={modelRef}
                    type="text"
                    defaultValue={provider.model}
                    placeholder="gpt-4o-mini or your local model id"
                    className="mt-2 w-full rounded-xl border border-outline-variant/15 bg-surface-container-lowest px-4 py-3 font-mono text-sm text-on-surface outline-none transition focus:border-primary/40"
                  />
                </label>
                <p className="text-xs leading-5 text-on-surface-variant">
                  Use this for OpenAI-compatible gateways like LM Studio, Ollama,
                  vLLM, Together, or Fireworks. Local endpoints can use a placeholder key.
                </p>
              </div>
            ) : null}
            <input
              ref={inputRef}
              type="password"
              autoFocus={!isCustomProvider}
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
        ) : supportsOAuthPkce ? (
          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-4 text-sm leading-6 text-on-surface-variant">
              <p className="font-semibold text-on-surface">Sign in first</p>
              <p className="mt-2">
                Connect {config.label} with a browser sign-in, or paste an API key
                if you prefer to manage credentials manually.
              </p>
              <div className="mt-4 space-y-2 rounded-xl border border-outline-variant/10 bg-surface px-4 py-4">
                <p className="font-semibold text-on-surface">What happens next</p>
                <p>1. Click <strong>Sign in with OpenRouter</strong>.</p>
                <p>2. Approve the sign-in in your browser or popup window.</p>
                <p>3. Return here. The connection should complete automatically.</p>
                <p>
                  If no browser window appears, allow popups for this app and try again.
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isStartingOAuth}
                  onClick={() => void handleOpenRouterConnect()}
                  className="rounded-xl bg-primary/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary transition hover:bg-primary/15 disabled:opacity-60"
                >
                  {isStartingOAuth ? "Opening..." : "Sign in with OpenRouter"}
                </button>
                <a
                  href={config.helpUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-surface px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
                >
                  Learn More
                </a>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                {provider.hasKey ? provider.maskedKey : "No key connected"}
              </p>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="rounded-full p-2 text-on-surface-variant transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-surface hover:text-primary"
              >
                <span className="material-symbols-outlined text-base">vpn_key</span>
              </button>
            </div>
            <p className="text-xs leading-5 text-on-surface-variant">
              Success looks like a masked key here and a <strong>Connected</strong> status
              on the card. If you already have an OpenRouter key, you can also paste it
              manually instead of using browser sign-in.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
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
            {isCustomProvider ? (
              <div className="rounded-xl border border-outline-variant/10 bg-surface px-4 py-3 text-sm leading-6 text-on-surface-variant">
                <p className="font-semibold text-on-surface">OpenAI-compatible endpoint</p>
                <p className="mt-2 font-mono text-[11px] break-all">
                  {provider.baseUrl ?? "No base URL configured"}
                </p>
                <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.12em]">
                  Model: {provider.model}
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </article>
  );
};
