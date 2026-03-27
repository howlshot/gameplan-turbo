export const PROJECT_TABS = [
  { id: "concept", icon: "theater_comedy", label: "Concept", shortcut: "⌘1" },
  { id: "design-pillars", icon: "diamond", label: "Design Pillars", shortcut: "⌘2" },
  { id: "core-loop", icon: "cycle", label: "Core Loop", shortcut: "⌘3" },
  { id: "controls-feel", icon: "sports_esports", label: "Controls & Feel", shortcut: "⌘4" },
  { id: "content-bible", icon: "library_books", label: "Content Bible", shortcut: "⌘5" },
  { id: "art-tone", icon: "palette", label: "Art & Tone", shortcut: "⌘6" },
  { id: "technical-design", icon: "memory", label: "Technical Design", shortcut: "⌘7" },
  { id: "build-plan", icon: "terminal", label: "Build Plan", shortcut: "⌘8" },
  { id: "vault", icon: "inventory_2", label: "Vault", shortcut: "⌘9" },
  { id: "prompt-lab", icon: "auto_awesome", label: "Prompt Lab", shortcut: "⌘0" }
] as const;

export const NAVIGATION_ITEMS = [
  { id: "home", icon: "home", label: "Game Hub", shortcut: "⌘H" },
  { id: "settings", icon: "settings", label: "Settings", shortcut: "⌘," }
] as const;

export const PLATFORM_LINKS = [
  { id: "codex", icon: "terminal", label: "Codex", url: "https://platform.openai.com" },
  { id: "cursor", icon: "arrow_right_alt", label: "Cursor", url: "https://cursor.com" },
  { id: "claude-code", icon: "code", label: "Claude Code", url: "https://claude.ai" },
  { id: "qwen-code", icon: "memory", label: "Qwen Code", url: "https://chat.qwen.ai" },
  { id: "perplexity", icon: "help", label: "Perplexity", url: "https://www.perplexity.ai" },
  { id: "gemini", icon: "auto_awesome", label: "Gemini", url: "https://gemini.google.com" },
  { id: "chatgpt", icon: "chat", label: "ChatGPT", url: "https://chat.openai.com" }
] as const;
