import { createOpenAICompatibleProvider } from "@/services/ai/providers/openAICompatibleProvider";
import type { AIProvider } from "@/services/ai/types";

export const createMoonshotProvider = (
  apiKey: string,
  model: string
): AIProvider =>
  createOpenAICompatibleProvider({
    apiKey,
    baseURL: "https://api.moonshot.cn/v1",
    model,
    providerName: "Kimi / Moonshot"
  });
