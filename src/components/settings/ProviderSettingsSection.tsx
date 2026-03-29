import { ProviderCard } from "@/components/settings/ProviderCard";
import type { AIProviderSummary } from "@/hooks/useAIProviders";
import { getProviderConnectionGroup } from "@/lib/ai/providerCatalog";
import { APP_LATEST_DESKTOP_RELEASE_URL } from "@/lib/brand";
import { isHostedRuntime } from "@/lib/runtimeMode";
import type { AIProvider } from "@/types";

interface ProviderSettingsSectionProps {
  connectedCount: number;
  isLoading: boolean;
  providerCards: AIProviderSummary[];
  onDisconnectProvider: (providerId: string) => Promise<void>;
  onSaveProvider: (input: {
    provider: AIProvider;
    apiKey: string;
    model: string;
    baseUrl?: string;
    authMethod?: "api-key" | "local-bridge" | "oauth-pkce" | "tool-login";
  }) => Promise<void>;
  onSetDefault: (providerId: string) => Promise<void>;
}

export const ProviderSettingsSection = ({
  connectedCount,
  isLoading,
  onDisconnectProvider,
  providerCards,
  onSaveProvider,
  onSetDefault
}: ProviderSettingsSectionProps): JSX.Element => {
  const hostedRuntime = isHostedRuntime();
  const signInProviders = providerCards.filter(
    (provider) => getProviderConnectionGroup(provider.provider) === "sign-in"
  );
  const apiKeyProviders = providerCards.filter(
    (provider) => getProviderConnectionGroup(provider.provider) === "api-key"
  );

  const renderGrid = (providersToRender: AIProviderSummary[]) => (
    <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {isLoading
        ? Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-[220px] animate-pulse rounded-2xl bg-surface-container-high"
            />
          ))
        : providersToRender.map((provider) => (
            <ProviderCard
              key={provider.provider}
              provider={provider}
              onDisconnect={onDisconnectProvider}
              onSave={onSaveProvider}
              onSetDefault={onSetDefault}
            />
          ))}
    </div>
  );

  return (
    <section className="rounded-2xl border border-outline-variant/10 bg-surface-container p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">key</span>
          <h2 className="font-headline text-2xl font-semibold text-on-surface">
            AI Providers
          </h2>
        </div>
        <span className="rounded-full bg-secondary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-secondary">
          {connectedCount} core links active
        </span>
      </div>

      <div className="mt-6 space-y-8">
        {hostedRuntime ? (
          <div className="rounded-2xl border border-primary/15 bg-primary/5 px-5 py-4 text-sm leading-6 text-on-surface-variant">
            <p className="font-semibold text-on-surface">Hosted web mode</p>
            <p className="mt-2">
              OpenRouter and API-key providers work in the browser-hosted app. Codex
              and Claude Code use local bridges and are available when Gameplan Turbo
              is running locally.
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
        <div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">login</span>
            <div>
              <h3 className="font-headline text-lg font-semibold text-on-surface">
                Sign in
              </h3>
              <p className="text-sm leading-6 text-on-surface-variant">
                Connect through a browser login or local tool bridge. Browser sign-in
                opens a normal web flow. Tool-login providers ask you to sign in first,
                then confirm the running bridge.
              </p>
            </div>
          </div>
          {renderGrid(signInProviders)}
        </div>

        <div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">key</span>
            <div>
              <h3 className="font-headline text-lg font-semibold text-on-surface">
                API key
              </h3>
              <p className="text-sm leading-6 text-on-surface-variant">
                Add an API key for hosted providers that use direct key auth.
              </p>
            </div>
          </div>
          {renderGrid(apiKeyProviders)}
        </div>
      </div>
    </section>
  );
};
