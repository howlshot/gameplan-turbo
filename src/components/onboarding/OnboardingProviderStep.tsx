import type { RefObject } from "react";
import { BrandMark } from "@/components/branding/BrandMark";
import { CUSTOM_BASE_URL_PRESETS } from "@/lib/ai/customProviderUtils";
import { getToolLoginProviderMeta } from "@/lib/toolLoginProviders";
import { isDesktopRuntime, isHostedRuntime } from "@/lib/runtimeMode";
import {
  PROVIDER_CATALOG,
  PROVIDER_ORDER,
  getProviderConnectionGroup
} from "@/lib/ai/providerCatalog";
import {
  APP_LATEST_DESKTOP_RELEASE_URL,
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
  isStartingToolLogin: boolean;
  isVerifying: boolean;
  onSkip: () => void;
  onStartOAuth: () => void;
  onStartToolLogin: () => void;
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
  isStartingToolLogin,
  isVerifying,
  onSkip,
  onStartOAuth,
  onStartToolLogin,
  onSelectProvider,
  onToggleApiVisibility,
  onVerify,
  selectedProvider,
  showApiKey
}: OnboardingProviderStepProps): JSX.Element => {
  const providerConfig = PROVIDER_CATALOG[selectedProvider];
  const authMode = providerConfig.authMode ?? "api-key";
  const toolLoginProvider = getToolLoginProviderMeta(selectedProvider);
  const isHostedBridgeUnavailable =
    Boolean(toolLoginProvider) && isHostedRuntime();
  const supportsOAuthPkce = authMode === "oauth-pkce";
  const isCustomProvider = selectedProvider === "custom";
  const desktopRuntime = isDesktopRuntime();
  const signInProviders = PROVIDER_ORDER.filter(
    (provider) => getProviderConnectionGroup(provider) === "sign-in"
  );
  const apiKeyProviders = PROVIDER_ORDER.filter(
    (provider) => getProviderConnectionGroup(provider) === "api-key"
  );
  const hostedRuntime = isHostedRuntime();

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
          <div className="mt-4 rounded-xl border border-outline-variant/10 bg-surface px-4 py-3 text-sm leading-6 text-on-surface-variant">
            <p className="font-semibold text-on-surface">Best first path</p>
            <p className="mt-2">
              Use <strong>OpenRouter</strong> or an <strong>API key</strong> if you
              want AI in the browser right away. Use <strong>Skip for now</strong> if
              you just want to map the game and generate the roadmap first.
            </p>
          </div>
        </div>
        {hostedRuntime ? (
          <div className="mx-auto mt-4 max-w-2xl rounded-2xl border border-outline-variant/15 bg-surface-container-lowest px-5 py-4 text-left">
            <p className="font-medium text-on-surface">Using the browser-hosted version?</p>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">
              OpenRouter and API-key providers work here. Codex and Claude Code
              need the local desktop version because they connect through local bridges.
            </p>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">
              If your main goal is to use Codex or Claude Code sign-in, skip the browser
              setup and install the desktop app first.
            </p>
            <div className="mt-4">
              <a
                href={APP_LATEST_DESKTOP_RELEASE_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-xl bg-primary/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary transition hover:bg-primary/15"
              >
                Download Desktop
              </a>
            </div>
          </div>
        ) : null}
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
            {toolLoginProvider
              ? toolLoginProvider.connectionLabel
              : isCustomProvider
                ? "Custom provider connection"
                : providerConfig.keyLabel}
            </label>
            {toolLoginProvider ? (
              <span className="text-xs text-primary">
                {isHostedBridgeUnavailable
                  ? "Local desktop mode only"
                  : `Uses local ${toolLoginProvider.signInLabel} login`}
              </span>
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

          {toolLoginProvider ? (
            <div className="space-y-4 rounded-xl border border-outline-variant/15 bg-surface-container-lowest px-5 py-4 text-sm leading-6 text-on-surface-variant">
              {isHostedBridgeUnavailable ? (
                <>
                  <p>{toolLoginProvider.helpSentence}</p>
                  <div className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-3">
                    <p className="font-semibold text-on-surface">Available in local desktop mode</p>
                    <p className="mt-2">
                      {toolLoginProvider.label} uses a local bridge, so it is intentionally
                      unavailable in the browser-hosted version of {APP_NAME}.
                    </p>
                    <p className="mt-2">
                      For the hosted app, choose <strong>OpenRouter</strong> or an
                      <strong> API key</strong> provider. If you want bridge-based sign-in,
                      run {APP_NAME} locally and reconnect {toolLoginProvider.label} there.
                    </p>
                    <div className="mt-4">
                      <a
                        href={APP_LATEST_DESKTOP_RELEASE_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-xl bg-primary/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary transition hover:bg-primary/15"
                      >
                        Download Desktop
                      </a>
                    </div>
                  </div>
                  <div className="rounded-xl border border-outline-variant/10 bg-surface px-4 py-3">
                    <p className="font-semibold text-on-surface">What works here</p>
                    <p className="mt-2">
                      You can still explore the app, build the roadmap, and export planning
                      files without AI, or connect a hosted provider on this screen.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <p>
                    {toolLoginProvider.helpSentence}
                  </p>
                  <div className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-3">
                    <p className="font-semibold text-on-surface">Fastest path</p>
                    <p className="mt-2">
                      If you launched the app using the Desktop icon, try{" "}
                      <button
                        type="button"
                        onClick={onStartToolLogin}
                        disabled={isStartingToolLogin}
                        className="font-semibold text-primary underline decoration-primary/40 underline-offset-4 transition hover:text-primary/80 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {toolLoginProvider.openLoginButtonLabel}
                      </button>{" "}
                      first. The bridge should usually already be running.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-on-surface">If the bridge did not start automatically</p>
                    {desktopRuntime ? (
                      <>
                        <p>1. Click <strong>{toolLoginProvider.openLoginButtonLabel}</strong>.</p>
                        <p>
                          2. Finish the {toolLoginProvider.signInLabel} sign-in flow that opens in your browser.
                        </p>
                        <p>3. Come back here and click <strong>Check Status</strong>.</p>
                        <p>
                          4. When the bridge is ready, click <strong>{toolLoginProvider.continueButtonLabel}</strong>.
                        </p>
                      </>
                    ) : (
                      <>
                        <p>1. Open Terminal.</p>
                        <p>
                          2. Run <code>{toolLoginProvider.loginCommand}</code>
                        </p>
                        <p>
                          3. Finish the {toolLoginProvider.signInLabel} sign-in flow that opens in your browser.
                        </p>
                        <p>4. In Terminal, switch to your {APP_NAME} folder.</p>
                        <p>
                          If needed, run <code>cd {APP_FOLDER_PLACEHOLDER}</code>
                        </p>
                        <p>
                          5. Run <code>{toolLoginProvider.startCommand}</code>
                        </p>
                        <p>6. Leave that Terminal window open while you use the app.</p>
                        <p>
                          7. Come back here and click <strong>{toolLoginProvider.continueButtonLabel}</strong>.
                        </p>
                      </>
                    )}
                  </div>
                  <div className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-3">
                    <p className="font-semibold text-on-surface">What the buttons mean</p>
                    <p className="mt-2">
                      <strong>{toolLoginProvider.openLoginButtonLabel}</strong> starts the
                      {toolLoginProvider.signInLabel} sign-in flow. <strong>{toolLoginProvider.continueButtonLabel}</strong>
                      checks the bridge and saves that running session into {APP_NAME}.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={onStartToolLogin}
                      disabled={isStartingToolLogin}
                      className="rounded-xl bg-primary/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary transition hover:bg-primary/15 disabled:opacity-60"
                    >
                      {isStartingToolLogin ? "Opening..." : toolLoginProvider.openLoginButtonLabel}
                    </button>
                  </div>
                  <div className="rounded-xl border border-outline-variant/10 bg-surface px-4 py-3">
                    <p className="font-semibold text-on-surface">What success looks like</p>
                    <p className="mt-2">
                      {desktopRuntime
                        ? (
                            <>
                              Settings will show <strong>Bridge Ready</strong> once the desktop-managed connection is live.
                            </>
                          )
                        : (
                            <>
                              The bridge terminal should stay running, and Settings will show
                              <strong> Bridge Ready</strong> once connected.
                            </>
                          )}
                    </p>
                  </div>
                  <p className="text-xs">
                    {desktopRuntime
                      ? "If the sign-in button cannot reach the bridge, relaunch the desktop app and try again."
                      : "If the sign-in button says it cannot reach the bridge, relaunch the desktop app first. If that still does not work, use the manual fallback steps above."}
                  </p>
                </>
              )}
            </div>
          ) : supportsOAuthPkce ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-primary/15 bg-primary/5 px-5 py-4 text-sm leading-6 text-on-surface-variant">
                <p className="font-semibold text-on-surface">Sign in with OpenRouter</p>
                <p className="mt-2">
                  Use browser sign-in if you want the fastest setup. You can also paste
                  an OpenRouter API key below if you already have one.
                </p>
                <div className="mt-4 space-y-2 rounded-xl border border-outline-variant/10 bg-surface px-4 py-4">
                  <p className="font-semibold text-on-surface">What happens next</p>
                  <p>1. Click <strong>Sign in with OpenRouter</strong>.</p>
                  <p>2. Approve the sign-in in your browser or popup window.</p>
                  <p>3. Return here. We will save the connection automatically.</p>
                  <p>If nothing opens, allow popups for this app and try again.</p>
                </div>
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
              <p className="text-xs leading-5 text-on-surface-variant">
                After a successful browser sign-in, you should move straight to the next
                onboarding step. If you already have an OpenRouter key, you can paste it
                below instead.
              </p>
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
            disabled={isVerifying || isHostedBridgeUnavailable}
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
                <span>
                  {isHostedBridgeUnavailable
                    ? "Available in Local Desktop Mode"
                    : toolLoginProvider
                      ? toolLoginProvider.continueButtonLabel
                      : "Verify & Continue"}
                </span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 flex flex-col gap-2 text-xs text-outline/80 md:flex-row md:items-center md:justify-between">
        <p>Stored locally in your browser or desktop app.</p>
        <p>Skip AI now and connect a provider later in Settings.</p>
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
