const LOCAL_HOST_PATTERNS = [
  /^https?:\/\/localhost(?::\d+)?/i,
  /^https?:\/\/127(?:\.\d{1,3}){3}(?::\d+)?/i,
  /^https?:\/\/0\.0\.0\.0(?::\d+)?/i
];

export const CUSTOM_BASE_URL_PRESETS = [
  {
    id: "lm-studio",
    label: "LM Studio (local)",
    value: "http://127.0.0.1:1234/v1"
  },
  {
    id: "ollama",
    label: "Ollama OpenAI API (local)",
    value: "http://127.0.0.1:11434/v1"
  },
  {
    id: "vllm",
    label: "vLLM / OpenAI-compatible server",
    value: "http://127.0.0.1:8000/v1"
  }
] as const;

export const isLikelyLocalBaseUrl = (baseUrl: string): boolean =>
  LOCAL_HOST_PATTERNS.some((pattern) => pattern.test(baseUrl.trim()));

export const getSanitizedCustomApiKey = (
  apiKey: string,
  baseUrl: string
): string => {
  const trimmedKey = apiKey.trim();
  if (trimmedKey) {
    return trimmedKey;
  }

  return isLikelyLocalBaseUrl(baseUrl) ? "local-openai-compatible" : "";
};
