import { isToolLoginProvider } from "@/lib/toolLoginProviders";
import { isLocalRuntime } from "@/lib/runtimeMode";
import type { AIProvider } from "@/types";

export const isProviderAvailableInCurrentRuntime = (
  provider: AIProvider
): boolean => !isToolLoginProvider(provider) || isLocalRuntime();

export const getHostedRuntimeProviderMessage = (provider: AIProvider): string | null =>
  isToolLoginProvider(provider)
    ? "This sign-in method uses a local bridge and is available only when Gameplan Turbo is running locally."
    : null;
