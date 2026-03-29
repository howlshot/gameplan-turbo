import db, { DEFAULT_PLATFORM_LAUNCHERS } from "@/lib/db";
import type { AIProviderConfig, AppSettings } from "@/types";

export type ProviderStorageLocation = "device" | "session";

export interface StoredAIProviderConfig extends AIProviderConfig {
  storageLocation: ProviderStorageLocation;
}

const SESSION_PROVIDER_STORAGE_KEY = "gameplan-turbo:session-ai-providers";
const SESSION_PROVIDER_STORAGE_EVENT = "gameplan-turbo:session-ai-providers-changed";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const normalizeProviderConfig = (value: unknown): AIProviderConfig | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = typeof value.id === "string" ? value.id : "";
  const provider = typeof value.provider === "string" ? value.provider : "";
  const apiKey = typeof value.apiKey === "string" ? value.apiKey : "";
  const model = typeof value.model === "string" ? value.model : "";
  const baseUrl = typeof value.baseUrl === "string" ? value.baseUrl : undefined;
  const authMethod =
    typeof value.authMethod === "string" ? value.authMethod : undefined;
  const isDefault = typeof value.isDefault === "boolean" ? value.isDefault : false;
  const createdAt =
    typeof value.createdAt === "number" && Number.isFinite(value.createdAt)
      ? value.createdAt
      : Date.now();

  if (!id || !provider || !model) {
    return null;
  }

  return {
    id,
    provider: provider as AIProviderConfig["provider"],
    apiKey,
    model,
    baseUrl,
    authMethod: authMethod as AIProviderConfig["authMethod"],
    isDefault,
    createdAt
  };
};

const readSessionProviderConfigs = (): AIProviderConfig[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.sessionStorage.getItem(SESSION_PROVIDER_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => normalizeProviderConfig(item))
      .filter((item): item is AIProviderConfig => item !== null);
  } catch {
    return [];
  }
};

const dispatchSessionProviderChange = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(SESSION_PROVIDER_STORAGE_EVENT));
};

const writeSessionProviderConfigs = (providers: AIProviderConfig[]): void => {
  if (typeof window === "undefined") {
    return;
  }

  if (providers.length === 0) {
    window.sessionStorage.removeItem(SESSION_PROVIDER_STORAGE_KEY);
  } else {
    window.sessionStorage.setItem(
      SESSION_PROVIDER_STORAGE_KEY,
      JSON.stringify(providers)
    );
  }

  dispatchSessionProviderChange();
};

const clearDefaultFlag = (
  providers: AIProviderConfig[]
): AIProviderConfig[] =>
  providers.map((provider) =>
    provider.isDefault ? { ...provider, isDefault: false } : provider
  );

const removeMatchingProvider = (
  providers: AIProviderConfig[],
  match: { id?: string; provider?: AIProviderConfig["provider"] }
): AIProviderConfig[] =>
  providers.filter(
    (item) =>
      (match.id ? item.id !== match.id : true) &&
      (match.provider ? item.provider !== match.provider : true)
  );

const upsertProvider = (
  providers: AIProviderConfig[],
  provider: AIProviderConfig
): AIProviderConfig[] => [
  ...removeMatchingProvider(providers, {
    id: provider.id,
    provider: provider.provider
  }),
  provider
];

const sortProvidersByPriority = (
  left: StoredAIProviderConfig,
  right: StoredAIProviderConfig
): number => {
  const leftPriority = left.storageLocation === "session" ? 2 : 0;
  const rightPriority = right.storageLocation === "session" ? 2 : 0;
  const leftDefaultBoost = left.isDefault ? 1 : 0;
  const rightDefaultBoost = right.isDefault ? 1 : 0;

  if (leftPriority + leftDefaultBoost !== rightPriority + rightDefaultBoost) {
    return rightPriority + rightDefaultBoost - (leftPriority + leftDefaultBoost);
  }

  return right.createdAt - left.createdAt;
};

const ensureAppSettings = async (): Promise<AppSettings> => {
  const existing = await db.appSettings.get("app-settings");
  if (existing) {
    return existing;
  }

  const settings: AppSettings = {
    id: "app-settings",
    theme: "dark",
    defaultProvider: null,
    enabledPlatformLaunchers: DEFAULT_PLATFORM_LAUNCHERS,
    streamingEnabled: true,
    userName: "",
    isOnboardingComplete: false,
    updatedAt: Date.now()
  };

  await db.appSettings.put(settings);
  return settings;
};

const syncDeviceDefaultProviderSetting = async (): Promise<void> => {
  const settings = await ensureAppSettings();
  const deviceProviders = await db.aiProviders.toArray();
  const defaultProvider =
    deviceProviders.find((provider) => provider.isDefault && provider.apiKey.trim()) ??
    deviceProviders.find((provider) => provider.apiKey.trim()) ??
    null;

  await db.appSettings.put({
    ...settings,
    defaultProvider: defaultProvider?.provider ?? null,
    updatedAt: Date.now()
  });
};

const tagProviders = (
  providers: AIProviderConfig[],
  storageLocation: ProviderStorageLocation
): StoredAIProviderConfig[] =>
  providers.map((provider) => ({
    ...provider,
    storageLocation
  }));

export const subscribeToSessionProviderChanges = (
  callback: () => void
): (() => void) => {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener(SESSION_PROVIDER_STORAGE_EVENT, callback);
  return () => {
    window.removeEventListener(SESSION_PROVIDER_STORAGE_EVENT, callback);
  };
};

export const clearSessionProviderConfigs = (): void => {
  writeSessionProviderConfigs([]);
};

export const listStoredProviderConfigs = async (): Promise<
  StoredAIProviderConfig[]
> => {
  const deviceProviders = await db.aiProviders.toArray();
  const sessionProviders = readSessionProviderConfigs();
  const byProvider = new Map<
    AIProviderConfig["provider"],
    StoredAIProviderConfig
  >();

  for (const provider of tagProviders(deviceProviders, "device")) {
    byProvider.set(provider.provider, provider);
  }

  for (const provider of tagProviders(sessionProviders, "session")) {
    byProvider.set(provider.provider, provider);
  }

  return Array.from(byProvider.values()).sort(sortProvidersByPriority);
};

export const findStoredProviderConfig = async (match: {
  id?: string;
  provider?: AIProviderConfig["provider"];
}): Promise<StoredAIProviderConfig | null> => {
  const providers = await listStoredProviderConfigs();

  return (
    providers.find(
      (provider) =>
        (match.id ? provider.id === match.id : true) &&
        (match.provider ? provider.provider === match.provider : true)
    ) ?? null
  );
};

export const getDefaultStoredProviderConfig = async (): Promise<AIProviderConfig | null> => {
  const sessionProviders = readSessionProviderConfigs();
  const deviceProviders = await db.aiProviders.toArray();

  const defaultSessionProvider = sessionProviders.find(
    (provider) => provider.isDefault && provider.apiKey.trim()
  );
  if (defaultSessionProvider) {
    return defaultSessionProvider;
  }

  const defaultDeviceProvider = deviceProviders.find(
    (provider) => provider.isDefault && provider.apiKey.trim()
  );
  if (defaultDeviceProvider) {
    return defaultDeviceProvider;
  }

  const nextProvider = [...sessionProviders, ...deviceProviders]
    .filter((provider) => provider.apiKey.trim())
    .sort((left, right) => right.createdAt - left.createdAt)[0];

  return nextProvider ?? null;
};

export const saveStoredProviderConfig = async (
  provider: AIProviderConfig,
  storageLocation: ProviderStorageLocation
): Promise<void> => {
  if (storageLocation === "session") {
    const sessionProviders = readSessionProviderConfigs();
    const nextSessionProviders = upsertProvider(
      provider.isDefault ? clearDefaultFlag(sessionProviders) : sessionProviders,
      provider
    );

    writeSessionProviderConfigs(nextSessionProviders);

    await db.transaction("rw", db.aiProviders, db.appSettings, async () => {
      const deviceProviders = await db.aiProviders.toArray();
      const matchingDeviceProviders = deviceProviders.filter(
        (item) => item.provider === provider.provider || item.id === provider.id
      );

      for (const item of matchingDeviceProviders) {
        await db.aiProviders.delete(item.id);
      }

      await syncDeviceDefaultProviderSetting();
    });

    return;
  }

  let sessionProviders = readSessionProviderConfigs();
  sessionProviders = removeMatchingProvider(sessionProviders, {
    id: provider.id,
    provider: provider.provider
  });
  if (provider.isDefault) {
    sessionProviders = clearDefaultFlag(sessionProviders);
  }
  writeSessionProviderConfigs(sessionProviders);

  await db.transaction("rw", db.aiProviders, db.appSettings, async () => {
    const deviceProviders = await db.aiProviders.toArray();
    const matchingDeviceProviders = deviceProviders.filter(
      (item) => item.provider === provider.provider && item.id !== provider.id
    );

    if (provider.isDefault) {
      for (const item of deviceProviders) {
        if (item.isDefault) {
          await db.aiProviders.update(item.id, { isDefault: false });
        }
      }
    }

    for (const item of matchingDeviceProviders) {
      await db.aiProviders.delete(item.id);
    }

    await db.aiProviders.put(provider);
    await syncDeviceDefaultProviderSetting();
  });
};

export const deleteStoredProviderConfig = async (
  providerId: string,
  storageLocation: ProviderStorageLocation
): Promise<void> => {
  if (storageLocation === "session") {
    const sessionProviders = readSessionProviderConfigs();
    writeSessionProviderConfigs(
      sessionProviders.filter((provider) => provider.id !== providerId)
    );
    return;
  }

  await db.transaction("rw", db.aiProviders, db.appSettings, async () => {
    await db.aiProviders.delete(providerId);
    await syncDeviceDefaultProviderSetting();
  });
};

export const setDefaultStoredProviderConfig = async (
  providerId: string,
  storageLocation: ProviderStorageLocation
): Promise<void> => {
  if (storageLocation === "session") {
    const sessionProviders = readSessionProviderConfigs();
    writeSessionProviderConfigs(
      sessionProviders.map((provider) => ({
        ...provider,
        isDefault: provider.id === providerId
      }))
    );
    return;
  }

  const sessionProviders = clearDefaultFlag(readSessionProviderConfigs());
  writeSessionProviderConfigs(sessionProviders);

  await db.transaction("rw", db.aiProviders, db.appSettings, async () => {
    const deviceProviders = await db.aiProviders.toArray();
    for (const provider of deviceProviders) {
      if (provider.isDefault) {
        await db.aiProviders.update(provider.id, { isDefault: false });
      }
    }

    await db.aiProviders.update(providerId, { isDefault: true });
    await syncDeviceDefaultProviderSetting();
  });
};

export const isProviderStoredOnDevice = (
  storageLocation: ProviderStorageLocation
): boolean => storageLocation === "device";
