import { useMemo, useState } from "react";
import { AgentPromptsSection } from "@/components/settings/AgentPromptsSection";
import { AppearanceSection } from "@/components/settings/AppearanceSection";
import { DiagnosticsCard } from "@/components/settings/DiagnosticsCard";
import { PlatformLaunchersSection } from "@/components/settings/PlatformLaunchersSection";
import { ProviderSettingsSection } from "@/components/settings/ProviderSettingsSection";
import { RoutingSettingsSection } from "@/components/settings/RoutingSettingsSection";
import { StorageSection } from "@/components/settings/StorageSection";
import { UsageLogsModal } from "@/components/settings/UsageLogsModal";
import { useAIProviders } from "@/hooks/useAIProviders";
import { useAgentPrompts } from "@/hooks/useAgentPrompts";
import { useSettings } from "@/hooks/useSettings";
import { useToast } from "@/hooks/useToast";
import type { UsageLogEntry } from "@/lib/appData";
import { clearAllAppData, exportAppData, getUsageLogs } from "@/lib/appData";
import { getSanitizedCustomApiKey } from "@/lib/ai/customProviderUtils";
import { PROVIDER_CATALOG } from "@/lib/ai/providerCatalog";
import { APP_EXPORT_FILE_NAME, APP_NAME } from "@/lib/brand";
import type { ProviderStorageLocation } from "@/lib/providerStorage";
import { isDesktopRuntime, isHostedRuntime } from "@/lib/runtimeMode";
import { getToolLoginProviderMeta } from "@/lib/toolLoginProviders";
import { createProviderFromConfig } from "@/services/ai";
import {
  buildProviderCards,
  downloadJsonFile
} from "@/pages/settings/settingsPageHelpers";
import type { AIProvider } from "@/types";

export const SettingsPage = (): JSX.Element => {
  const toast = useToast();
  const { settings, updateSettings } = useSettings();
  const { providers, defaultProvider, isLoading: isProvidersLoading, saveProvider, deleteProvider, setDefault } =
    useAIProviders();
  const { prompts, isLoading: isPromptsLoading, updatePrompt, resetToDefault } =
    useAgentPrompts();
  const hostedRuntime = isHostedRuntime();
  const desktopRuntime = isDesktopRuntime();
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [usageLogs, setUsageLogs] = useState<UsageLogEntry[]>([]);

  const providerCards = useMemo(() => buildProviderCards(providers), [providers]);

  const connectedCount = providers.filter((provider) => provider.hasKey).length;
  const availableModels = defaultProvider
    ? PROVIDER_CATALOG[defaultProvider.provider].models
    : PROVIDER_CATALOG.anthropic.models;

  const handleSaveProvider = async (
    input: {
      provider: AIProvider;
      apiKey: string;
      model: string;
      baseUrl?: string;
      authMethod?: "api-key" | "local-bridge" | "oauth-pkce" | "tool-login";
      rememberOnDevice?: boolean;
    }
  ): Promise<void> => {
    const existing = providers.find((item) => item.provider === input.provider);
    const config = PROVIDER_CATALOG[input.provider];
    const toolLoginProvider = getToolLoginProviderMeta(input.provider);
    const resolvedApiKey =
      input.provider === "custom"
        ? getSanitizedCustomApiKey(input.apiKey, input.baseUrl ?? "")
        : input.apiKey;

    if (toolLoginProvider) {
      if (hostedRuntime) {
        toast.error(
          `${toolLoginProvider.label} is available only when Gameplan Turbo is running locally. Use OpenRouter or an API-key provider in the hosted app.`
        );
        return;
      }

      try {
        const status = await toolLoginProvider.fetchStatus();

        if (!status.cliAvailable) {
          toast.error(`${toolLoginProvider.cliName} was not found on this machine.`);
          return;
        }

        if (!status.loggedIn) {
          toast.error(
            desktopRuntime
              ? `${toolLoginProvider.label} is not logged in yet. Use ${toolLoginProvider.openLoginButtonLabel} on the provider card, finish sign-in in your browser, then retry.`
              : `${toolLoginProvider.label} is not logged in. Run \`${toolLoginProvider.loginCommand}\` and retry.`
          );
          return;
        }
      } catch {
        toast.error(
          desktopRuntime
            ? `${toolLoginProvider.connectionLabel} is offline. Relaunch the desktop app and try again.`
            : `${toolLoginProvider.connectionLabel} is offline. Relaunch the desktop app or start it with \`${toolLoginProvider.startCommand}\`.`
        );
        return;
      }
    }

    if (!toolLoginProvider) {
      try {
        const providerClient = await createProviderFromConfig({
          id: existing?.id ?? `${input.provider}-settings`,
          provider: input.provider,
          apiKey: resolvedApiKey,
          model: input.model,
          baseUrl: input.baseUrl,
          authMethod: input.authMethod,
          isDefault: existing?.isDefault ?? connectedCount === 0,
          createdAt: existing?.createdAt ?? Date.now()
        });

        await providerClient.validateKey(resolvedApiKey);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : `Could not verify ${config.label}.`
        );
        return;
      }
    }

    const result = await saveProvider({
      id: existing?.id,
      provider: input.provider,
      apiKey: toolLoginProvider
        ? toolLoginProvider.sentinelApiKey
        : resolvedApiKey,
      authMethod: input.authMethod,
      rememberOnDevice: input.rememberOnDevice,
      isDefault: existing?.isDefault ?? connectedCount === 0,
      model: input.model,
      baseUrl: input.baseUrl
    });

    if (result) {
      toast.success(`${config.label} connected.`);
    } else {
      toast.error(`Could not save ${config.label}.`);
    }
  };

  const handleToggleLauncher = (launcherId: string): void => {
    const isEnabled = settings?.enabledPlatformLaunchers.includes(launcherId) ?? false;
    const next = isEnabled
      ? settings?.enabledPlatformLaunchers.filter((value) => value !== launcherId) ?? []
      : [...(settings?.enabledPlatformLaunchers ?? []), launcherId];
    void updateSettings({ enabledPlatformLaunchers: next });
    toast.success("Launcher updated.");
  };

  const handleOpenLogs = async (): Promise<void> => {
    const logs = await getUsageLogs();
    setUsageLogs(logs);
    setIsLogsOpen(true);
  };

  const handleClearAllData = async (): Promise<void> => {
    const confirmed = window.confirm(
      `Clear all local ${APP_NAME} data? This will remove projects, design docs, vault files, prompts, and settings.`
    );

    if (!confirmed) {
      return;
    }

    await clearAllAppData();
    window.location.reload();
  };

  return (
    <>
      <section className="mx-auto max-w-[1600px] px-6 py-8">
        <header className="mb-8">
          <h1 className="font-headline text-headline-2xl font-bold text-on-surface">
            Workspace Settings
          </h1>
          <p className="mt-2 font-mono text-label-sm uppercase tracking-[0.24em] text-on-surface-variant">
            Providers, prompts, storage, and launch targets
          </p>
        </header>

        {/* Settings Grid - Full Width */}
        <div className="space-y-6">
          <ProviderSettingsSection
            connectedCount={connectedCount}
            isLoading={isProvidersLoading}
            onDisconnectProvider={async (
              providerId,
              storageLocation: ProviderStorageLocation
            ) => {
              await deleteProvider(providerId, storageLocation);
              toast.success("Provider disconnected.");
            }}
            onSaveProvider={handleSaveProvider}
            onSetDefault={async (
              providerId,
              storageLocation: ProviderStorageLocation
            ) => {
              await setDefault(providerId, storageLocation);
              toast.success("Default provider updated.");
            }}
            providerCards={providerCards}
          />

          {/* Intelligence Routing + Platform Launchers - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RoutingSettingsSection
              availableModels={availableModels}
              defaultProviderId={defaultProvider?.id}
              defaultProviderModel={defaultProvider?.model}
              isStreamingEnabled={settings?.streamingEnabled ?? true}
              onToggleStreaming={() =>
                void updateSettings({ streamingEnabled: !settings?.streamingEnabled })
              }
              onUpdateModel={(model) => {
                if (!defaultProvider?.id) {
                  return;
                }

                void saveProvider({
                  id: defaultProvider.id,
                  provider: defaultProvider.provider,
                  apiKey: "",
                  isDefault: true,
                  model
                });
              }}
            />

            <PlatformLaunchersSection
              enabledLaunchers={settings?.enabledPlatformLaunchers ?? []}
              onToggleLauncher={handleToggleLauncher}
            />
          </div>

          <AppearanceSection
            userName={settings?.userName ?? ""}
            onChangeUserName={(userName) => void updateSettings({ userName })}
          />

          <AgentPromptsSection
            isLoading={isPromptsLoading}
            onReset={async (promptId) => {
              const saved = await resetToDefault(promptId);
              if (saved) {
                toast.success("Agent prompt reset.");
              } else {
                toast.error("Could not reset the agent prompt.");
              }
            }}
            onSave={async (promptId, content) => {
              const saved = await updatePrompt(promptId, { content, isDefault: false });
              if (saved) {
                toast.success("Agent prompt updated.");
              } else {
                toast.error("Could not update the agent prompt.");
              }
            }}
            prompts={prompts}
          />

          {/* Storage & Diagnostics - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StorageSection
              onClearAllData={() => void handleClearAllData()}
              onExportJson={() =>
                void (async () => {
                  const payload = await exportAppData();
                  downloadJsonFile(payload, APP_EXPORT_FILE_NAME);
                  toast.success("Workspace JSON exported.");
                })()
              }
              onOpenLogs={() => void handleOpenLogs()}
            />

            <DiagnosticsCard />
          </div>
        </div>
      </section>

      <UsageLogsModal
        entries={usageLogs}
        isOpen={isLogsOpen}
        onClose={() => setIsLogsOpen(false)}
      />
    </>
  );
};
