import { createOpenAICompatibleProvider } from "@/services/ai/providers/openAICompatibleProvider";
import type { AIProvider } from "@/services/ai/types";

export const createGlmProvider = (
  apiKey: string,
  model: string
): AIProvider =>
  createOpenAICompatibleProvider({
    apiKey,
    baseURL: "https://open.bigmodel.cn/api/paas/v4",
    model,
    providerName: "GLM / Zhipu"
  });
