import { createOpenAICompatibleProvider } from "@/services/ai/providers/openAICompatibleProvider";
import type { AIProvider } from "@/services/ai/types";

export const createOpenRouterProvider = (
  apiKey: string,
  model: string
): AIProvider =>
  createOpenAICompatibleProvider({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
    model,
    providerName: "OpenRouter"
  });
