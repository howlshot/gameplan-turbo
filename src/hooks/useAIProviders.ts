import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { isProviderAvailableInCurrentRuntime } from "@/lib/providerRuntime";
import {
  deleteStoredProviderConfig,
  findStoredProviderConfig,
  listStoredProviderConfigs,
  setDefaultStoredProviderConfig,
  subscribeToSessionProviderChanges,
  type ProviderStorageLocation,
  saveStoredProviderConfig
} from "@/lib/providerStorage";
import { isHostedRuntime } from "@/lib/runtimeMode";
import type { AIProviderConfig } from "@/types";

export interface AIProviderSummary {
  id?: string;
  provider: AIProviderConfig["provider"];
  model: string;
  baseUrl?: string;
  authMethod?: AIProviderConfig["authMethod"];
  isDefault: boolean;
  hasKey: boolean;
  maskedKey: string;
  createdAt?: number;
  storageLocation: ProviderStorageLocation;
}

interface SaveProviderInput {
  id?: string;
  provider: AIProviderConfig["provider"];
  apiKey: string;
  model: string;
  baseUrl?: string;
  authMethod?: AIProviderConfig["authMethod"];
  isDefault?: boolean;
  rememberOnDevice?: boolean;
}

const maskApiKey = (apiKey: string): string => {
  if (!apiKey.trim()) {
    return "";
  }

  if (apiKey.length <= 10) {
    return `${apiKey.slice(0, 2)}...${apiKey.slice(-2)}`;
  }

  return `${apiKey.slice(0, 7)}...${apiKey.slice(-3)}`;
};

export const useAIProviders = () => {
  const [sessionVersion, setSessionVersion] = useState(0);

  useEffect(
    () =>
      subscribeToSessionProviderChanges(() => {
        setSessionVersion((current) => current + 1);
      }),
    []
  );

  const providersQuery = useLiveQuery(
    async (): Promise<AIProviderSummary[]> => {
      const configs = await listStoredProviderConfigs();

      return configs.map((config) => ({
        id: config.id,
        provider: config.provider,
        model: config.model,
        baseUrl: config.baseUrl,
        authMethod: config.authMethod,
        isDefault: config.isDefault,
        hasKey: Boolean(config.apiKey.trim()),
        maskedKey: maskApiKey(config.apiKey),
        createdAt: config.createdAt,
        storageLocation: config.storageLocation
      }));
    },
    [sessionVersion]
  );

  const providers = providersQuery ?? [];
  const runtimeAvailableProviders = providers.filter((provider) =>
    isProviderAvailableInCurrentRuntime(provider.provider)
  );
  const defaultProvider =
    runtimeAvailableProviders.find(
      (provider) => provider.isDefault && provider.storageLocation === "session"
    ) ??
    runtimeAvailableProviders.find((provider) => provider.isDefault) ??
    runtimeAvailableProviders.find(
      (provider) => provider.hasKey && provider.storageLocation === "session"
    ) ??
    runtimeAvailableProviders.find((provider) => provider.hasKey) ??
    null;
  const isLoading = providersQuery === undefined;

  const saveProvider = async (
    input: SaveProviderInput
  ): Promise<AIProviderConfig | null> => {
    try {
      const existing = await findStoredProviderConfig({
        id: input.id,
        provider: input.provider
      });
      const storageLocation: ProviderStorageLocation =
        isHostedRuntime() && input.rememberOnDevice !== true
          ? "session"
          : "device";
      const provider: AIProviderConfig = {
        id: input.id ?? existing?.id ?? crypto.randomUUID(),
        provider: input.provider,
        apiKey: input.apiKey.trim() || existing?.apiKey || "",
        model: input.model,
        isDefault: input.isDefault ?? existing?.isDefault ?? false,
        baseUrl: input.baseUrl ?? existing?.baseUrl,
        authMethod: input.authMethod ?? existing?.authMethod,
        createdAt: existing?.createdAt ?? Date.now()
      };

      await saveStoredProviderConfig(provider, storageLocation);

      return provider;
    } catch (error) {
      console.error("Failed to save AI provider.", error);
      return null;
    }
  };

  const deleteProvider = async (
    providerId: string,
    storageLocation: ProviderStorageLocation
  ): Promise<void> => {
    try {
      await deleteStoredProviderConfig(providerId, storageLocation);
    } catch (error) {
      console.error("Failed to delete AI provider.", error);
    }
  };

  const setDefault = async (
    providerId: string,
    storageLocation: ProviderStorageLocation
  ): Promise<void> => {
    try {
      await setDefaultStoredProviderConfig(providerId, storageLocation);
    } catch (error) {
      console.error("Failed to set default AI provider.", error);
    }
  };

  return {
    providers,
    defaultProvider,
    isLoading,
    saveProvider,
    deleteProvider,
    setDefault
  };
};
