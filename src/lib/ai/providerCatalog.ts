import type { AIProvider } from "@/types";

export interface ProviderCatalogEntry {
  provider: AIProvider;
  label: string;
  icon: string;
  helpUrl: string;
  keyLabel: string;
  defaultModel: string;
  models: string[];
  authMode?: "api-key" | "local-bridge";
}

export const PROVIDER_ORDER: AIProvider[] = [
  "codex",
  "anthropic",
  "openai",
  "google",
  "deepseek",
  "groq",
  "qwen",
  "custom"
];

export const PROVIDER_CATALOG: Record<AIProvider, ProviderCatalogEntry> = {
  codex: {
    provider: "codex",
    label: "Codex (ChatGPT login)",
    icon: "terminal",
    helpUrl: "https://developers.openai.com/codex/cli",
    keyLabel: "Codex bridge",
    defaultModel: "codex-default",
    models: ["codex-default", "gpt-5.3-codex", "gpt-5-codex", "gpt-5"],
    authMode: "local-bridge"
  },
  anthropic: {
    provider: "anthropic",
    label: "Anthropic",
    icon: "psychology",
    helpUrl: "https://console.anthropic.com/settings/keys",
    keyLabel: "Claude API key",
    defaultModel: "claude-3-5-sonnet-latest",
    models: ["claude-3-5-sonnet-latest", "claude-3-5-haiku-latest"]
  },
  openai: {
    provider: "openai",
    label: "OpenAI",
    icon: "chat",
    helpUrl: "https://platform.openai.com/api-keys",
    keyLabel: "OpenAI API key",
    defaultModel: "gpt-4o-mini",
    models: ["gpt-4o-mini", "gpt-4o"]
  },
  google: {
    provider: "google",
    label: "Google Gemini",
    icon: "auto_awesome",
    helpUrl: "https://aistudio.google.com/app/apikey",
    keyLabel: "Gemini API key",
    defaultModel: "gemini-1.5-pro",
    models: ["gemini-1.5-pro", "gemini-1.5-flash"]
  },
  deepseek: {
    provider: "deepseek",
    label: "DeepSeek",
    icon: "bolt",
    helpUrl: "https://platform.deepseek.com/api_keys",
    keyLabel: "DeepSeek API key",
    defaultModel: "deepseek-chat",
    models: ["deepseek-chat", "deepseek-reasoner"]
  },
  groq: {
    provider: "groq",
    label: "Groq",
    icon: "speed",
    helpUrl: "https://console.groq.com/keys",
    keyLabel: "Groq API key",
    defaultModel: "llama-3.3-70b-versatile",
    models: ["llama-3.3-70b-versatile", "mixtral-8x7b-32768"]
  },
  qwen: {
    provider: "qwen",
    label: "Qwen Code",
    icon: "code",
    helpUrl: "https://github.com/QwenLM/Qwen",
    keyLabel: "Qwen API key",
    defaultModel: "qwen-plus",
    models: ["qwen-plus", "qwen-max"]
  },
  custom: {
    provider: "custom",
    label: "Custom",
    icon: "api",
    helpUrl: "https://platform.openai.com/docs/api-reference",
    keyLabel: "Custom provider API key",
    defaultModel: "gpt-4o-mini",
    models: ["gpt-4o-mini"]
  }
};

export const PLATFORM_TOGGLE_OPTIONS = [
  { id: "codex", label: "Codex", icon: "terminal" },
  { id: "cursor", label: "Cursor", icon: "arrow_right_alt" },
  { id: "claude-code", label: "Claude Code", icon: "code" },
  { id: "qwen-code", label: "Qwen Code", icon: "code" },
  { id: "replit", label: "Replit", icon: "terminal" },
  { id: "perplexity", label: "Perplexity", icon: "help" },
  { id: "gemini", label: "Gemini", icon: "auto_awesome" },
  { id: "chatgpt", label: "ChatGPT", icon: "chat" }
] as const;

export const getProviderLabel = (provider: AIProvider): string =>
  PROVIDER_CATALOG[provider].label;
