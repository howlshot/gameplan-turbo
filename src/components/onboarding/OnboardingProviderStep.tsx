import type { RefObject } from "react";
import { BrandMark } from "@/components/branding/BrandMark";
import { CUSTOM_BASE_URL_PRESETS } from "@/lib/ai/customProviderUtils";
import {
  getCodexBridgeStartCommand,
  getCodexLoginCommand
} from "@/lib/codexBridge";
import {
  PROVIDER_CATALOG,
  PROVIDER_ORDER,
  getProviderConnectionGroup
} from "@/lib/ai/providerCatalog";
import {
  APP_FOLDER_PLACEHOLDER,
  APP_NAME
} from "@/lib/brand";
import type { AIProvider } from "@/types";

interface OnboardingProviderStepProps {
  apiKeyRef: RefObject<HTMLInputElement>;
  baseUrlRef: RefObject<HTMLInputElement>;
  modelRef: RefObject<HTMLInputElement>;
  errorMessage: string;
  isStartingOAuth: boolean;
  isStartingCodexLogin: boolean;
  isVerifying: boolean;
  onSkip: () => void;
  onStartOAuth: () => void;
  onStartCodexLogin: () => void;
  onSelectProvider: (provider: AIProvider) => void;
  onToggleApiVisibility: () => void;
  onVerify: () => void;
  selectedProvider: AIProvider;
  showApiKey: boolean;
}

export const OnboardingProviderStep = ({
  apiKeyRef,
  baseUrlRef,
  modelRef,
  errorMessage,
  isStartingOAuth,
  isStartingCodexLogin,
  isVerifying,
  onSkip,
  onStartOAuth,
  onStartCodexLogin,
  onSelectProvider,
  onToggleApiVisibility,
  onVerify,
  selectedProvider,
  showApiKey
}: OnboardingProviderStepProps): JSX.Element => {
  const providerConfig = PROVIDER_CATALOG[selectedProvider];
  const authMode = providerConfig.authMode ?? "api-key";
  const isLocalBridgeProvider = authMode === "local-bridge";
  const supportsOAuthPkce = authMode === "oauth-pkce";
  const isCustomProvider = selectedProvider === "custom";
  const signInProviders = PROVIDER_ORDER.filter(
    (provider) => getProviderConnectionGroup(provider) === "sign-in"
  );
  const apiKeyProviders = PROVIDER_ORDER.filter(
    (provider) => getProviderConnectionGroup(provider) === "api-key"
  );

  return (
    <div className="p-10">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-on-surface">
          Connect your AI provider
        </h1>
        <p className="mt-3 text-on-surface-variant">
          AI setup is optional. You can explore {APP_NAME}, generate the build
          roadmap, and come back to connect AI later in Settings.
        </p>
        <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-primary/15 bg-primary/5 px-5 py-4 text-left">
          <p className="font-medium text-on-surface">Just exploring first?</p>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">
            Skip this step for now. Planning, roadmap generation, and tracking
            still work without AI. Connect a provider later when you want help
            generating prompts or polishing briefs.
          </p>
        </div>
      </div>

      <form
        className="mt-10"
        onSubmit={(event) => {
          event.preventDefault();
          onVerify();
        }}
      >
        <label className="mb-4 block font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
          Select Provider
        </label>
        <div className="space-y-6">
          <div>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
              Sign in
            </p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {signInProviders.map((provider) => {
                const item = PROVIDER_CATALOG[provider];
                const isSelected = provider === selectedProvider;

                return (
                  <button
                    key={provider}
                    type="button"
                    onClick={() => onSelectProvider(provider)}
                    className={`rounded-xl border p-4 text-center transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                      isSelected
                        ? "border-primary bg-primary/10 text-on-surface"
                        : "border-outline-variant/20 bg-surface-container-lowest text-on-surface-variant"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-3xl ${
                        isSelected ? "text-primary" : "opacity-50"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <p className="mt-3 font-headline text-sm font-semibold">{item.label}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
              API key
            </p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {apiKeyProviders.map((provider) => {
                const item = PROVIDER_CATALOG[provider];
                const isSelected = provider === selectedProvider;

                return (
                  <button
                    key={provider}
                    type="button"
                    onClick={() => onSelectProvider(provider)}
                    className={`rounded-xl border p-4 text-center transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                      isSelected
                        ? "border-primary bg-primary/10 text-on-surface"
                        : "border-outline-variant/20 bg-surface-container-lowest text-on-surface-variant"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-3xl ${
                        isSelected ? "text-primary" : "opacity-50"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <p className="mt-3 font-headline text-sm font-semibold">{item.label}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-10">
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
            {isLocalBridgeProvider
              ? "Codex Bridge"
              : isCustomProvider
                ? "Custom provider connection"
                : providerConfig.keyLabel}
            </label>
            {isLocalBridgeProvider ? (
              <span className="text-xs text-primary">Uses local Codex login</span>
            ) : supportsOAuthPkce ? (
              <span className="text-xs text-primary">
                Sign in or use an API key
              </span>
            ) : (
              <a
                href={providerConfig.helpUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary transition hover:underline"
              >
                How to get your API key
              </a>
            )}
          </div>

          {isLocalBridgeProvider ? (
            <div className="space-y-4 rounded-xl border border-outline-variant/15 bg-surface-container-lowest px-5 py-4 text-sm leading-6 text-on-surface-variant">
              <p>
                No API key is needed here. {APP_NAME} can use your local Codex CLI
                session if you want AI generation right away, but you can also skip
                this step and connect later in Settings.
              </p>
              <div className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-3">
                <p className="font-semibold text-on-surface">Fastest path</p>
                <p className="mt-2">
                  If you launched the app using the Desktop icon, try{" "}
                  <button
                    type="button"
                    onClick={onStartCodexLogin}
                    disabled={isStartingCodexLogin}
                    className="font-semibold text-primary underline decoration-primary/40 underline-offset-4 transition hover:text-primary/80 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Open ChatGPT Sign-In
                  </button>{" "}
                  first. The bridge is usually already running.
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-on-surface">Manual fallback</p>
                <p>1. Open Terminal.</p>
                <p>
                  2. Run <code>{getCodexLoginCommand()}</code>
                </p>
                <p>3. Finish the ChatGPT sign-in flow that opens in your browser.</p>
                <p>4. In Terminal, switch to your {APP_NAME} folder.</p>
                <p>
                  If needed, run <code>cd {APP_FOLDER_PLACEHOLDER}</code>
                </p>
                <p>
                  5. Run <code>{getCodexBridgeStartCommand()}</code>
                </p>
                <p>6. Leave that Terminal window open while you use the app.</p>
                <p>7. Come back here and click <strong>Continue with Codex</strong>.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onStartCodexLogin}
                  disabled={isStartingCodexLogin}
                  className="rounded-xl bg-primary/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary transition hover:bg-primary/15 disabled:opacity-60"
                >
                  {isStartingCodexLogin ? "Opening..." : "Open ChatGPT Sign-In"}
                </button>
              </div>
              <div className="rounded-xl border border-outline-variant/10 bg-surface px-4 py-3">
                <p className="font-semibold text-on-surface">What success looks like</p>
                <p className="mt-2">
                  The bridge terminal should stay running, and Settings will show
                  <strong> Bridge Ready</strong> once connected.
                </p>
              </div>
              <p className="text-xs">
                If the sign-in button says it cannot reach the bridge, use the
                manual fallback steps above, then try the button again.
              </p>
            </div>
          ) : supportsOAuthPkce ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-primary/15 bg-primary/5 px-5 py-4 text-sm leading-6 text-on-surface-variant">
                <p className="font-semibold text-on-surface">Sign in with OpenRouter</p>
                <p className="mt-2">
                  Use browser sign-in if you want the fastest setup. You can also paste
                  an OpenRouter API key below if you already have one.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={onStartOAuth}
                    disabled={isStartingOAuth}
                    className="rounded-xl bg-primary/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary transition hover:bg-primary/15 disabled:opacity-60"
                  >
                    {isStartingOAuth ? "Opening..." : "Sign in with OpenRouter"}
                  </button>
                  <a
                    href={providerConfig.helpUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-surface px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
                  >
                    Learn more
                  </a>
                </div>
              </div>

              <div className="relative">
                <input
                  ref={apiKeyRef}
                  data-autofocus
                  type={showApiKey ? "text" : "password"}
                  placeholder={`Paste your ${providerConfig.keyLabel.toLowerCase()}`}
                  className="w-full rounded-xl border border-outline-variant/15 bg-surface-container-lowest px-5 py-4 pr-14 font-mono text-sm text-on-surface outline-none transition focus:border-primary/40"
                />
                <button
                  type="button"
                  onClick={onToggleApiVisibility}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant transition hover:text-on-surface"
                >
                  <span className="material-symbols-outlined">
                    {showApiKey ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>
          ) : isCustomProvider ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-primary/15 bg-primary/5 px-5 py-4 text-sm leading-6 text-on-surface-variant">
                <p className="font-semibold text-on-surface">Connect any OpenAI-compatible endpoint</p>
                <p className="mt-2">
                  Point Gameplan Turbo at a hosted provider or a local server like
                  LM Studio, Ollama, or vLLM. Local endpoints can use a placeholder key.
                </p>
              </div>

              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                  Base URL
                </span>
                <input
                  ref={baseUrlRef}
                  data-autofocus
                  type="url"
                  defaultValue={CUSTOM_BASE_URL_PRESETS[0].value}
                  placeholder="https://your-endpoint.example.com/v1"
                  className="mt-2 w-full rounded-xl border border-outline-variant/15 bg-surface-container-lowest px-5 py-4 font-mono text-sm text-on-surface outline-none transition focus:border-primary/40"
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
                    className="rounded-full bg-surface px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                  Model ID
                </span>
                <input
                  ref={modelRef}
                  type="text"
                  defaultValue={providerConfig.defaultModel}
                  placeholder="gpt-4o-mini or your local model id"
                  className="mt-2 w-full rounded-xl border border-outline-variant/15 bg-surface-container-lowest px-5 py-4 font-mono text-sm text-on-surface outline-none transition focus:border-primary/40"
                />
              </label>

              <div className="relative">
                <input
                  ref={apiKeyRef}
                  type={showApiKey ? "text" : "password"}
                  placeholder="Paste an API key, or leave blank for local endpoints"
                  className="w-full rounded-xl border border-outline-variant/15 bg-surface-container-lowest px-5 py-4 pr-14 font-mono text-sm text-on-surface outline-none transition focus:border-primary/40"
                />
                <button
                  type="button"
                  onClick={onToggleApiVisibility}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant transition hover:text-on-surface"
                >
                  <span className="material-symbols-outlined">
                    {showApiKey ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <input
                ref={apiKeyRef}
                data-autofocus
                type={showApiKey ? "text" : "password"}
                placeholder={`Paste your ${providerConfig.keyLabel.toLowerCase()}`}
                className="w-full rounded-xl border border-outline-variant/15 bg-surface-container-lowest px-5 py-4 pr-14 font-mono text-sm text-on-surface outline-none transition focus:border-primary/40"
              />
              <button
                type="button"
                onClick={onToggleApiVisibility}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant transition hover:text-on-surface"
              >
                <span className="material-symbols-outlined">
                  {showApiKey ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          )}

          {errorMessage ? (
            <div className="mt-4 rounded-xl border border-tertiary/20 bg-tertiary/10 px-4 py-3 text-sm text-tertiary">
              {errorMessage}
            </div>
          ) : null}
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onSkip}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-outline-variant/15 bg-surface px-5 py-4 text-sm font-semibold text-on-surface transition hover:bg-surface-container-high"
          >
            Skip for now
          </button>

          <button
            type="submit"
            disabled={isVerifying}
            className="gradient-cta glow-primary flex w-full items-center justify-center gap-3 rounded-xl px-5 py-4 font-semibold text-on-primary disabled:opacity-70"
          >
            {isVerifying ? (
              <>
                <span className="material-symbols-outlined animate-spin text-base">
                  progress_activity
                </span>
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>{isLocalBridgeProvider ? "Continue with Codex" : "Verify & Continue"}</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 flex flex-col gap-3 text-[10px] uppercase tracking-[0.22em] text-outline/60 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">verified_user</span>
          <span>Encrypted on-device</span>
        </div>
        <div className="flex gap-4">
          <span>Privacy</span>
          <span>Terms</span>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-8 left-8 hidden font-mono text-[10px] uppercase tracking-[0.24em] text-primary/40 md:block">
        <p>Latency: 24ms</p>
        <p className="mt-1">Region: EU-WEST</p>
        <p className="mt-1">Uptime: 99.98%</p>
      </div>

      <div className="pointer-events-none absolute right-8 top-8 hidden text-right font-mono text-[10px] uppercase tracking-[0.24em] text-primary/40 md:block">
        <div className="flex items-center justify-end gap-2">
          <BrandMark className="h-7 w-7 rounded-xl" />
          <p>{APP_NAME}</p>
        </div>
        <p className="mt-1">Local-First</p>
      </div>
    </div>
  );
};
