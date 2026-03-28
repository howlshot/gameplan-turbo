interface PlatformLaunchersProps {
  platforms: string[];
}

interface LauncherDefinition {
  icon: string;
  label: string;
  url: string;
}

const PLATFORM_MAP: Record<string, LauncherDefinition> = {
  codex: {
    icon: "terminal",
    label: "Codex",
    url: "https://platform.openai.com"
  },
  cursor: {
    icon: "arrow_right_alt",
    label: "Cursor",
    url: "https://cursor.com"
  },
  "claude-code": {
    icon: "code",
    label: "Claude Code",
    url: "https://claude.ai"
  },
  "qwen-code": {
    icon: "memory",
    label: "Qwen Code",
    url: "https://chat.qwen.ai"
  },
  perplexity: {
    icon: "help",
    label: "Perplexity",
    url: "https://www.perplexity.ai"
  },
  gemini: {
    icon: "auto_awesome",
    label: "Gemini",
    url: "https://gemini.google.com"
  },
  chatgpt: {
    icon: "chat",
    label: "ChatGPT",
    url: "https://chat.openai.com"
  },
  replit: {
    icon: "deployed_code",
    label: "Replit",
    url: "https://replit.com"
  },
  lovable: {
    icon: "favorite",
    label: "Lovable",
    url: "https://lovable.dev"
  },
  bolt: {
    icon: "bolt",
    label: "Bolt",
    url: "https://bolt.new"
  },
  v0: {
    icon: "web",
    label: "v0",
    url: "https://v0.dev"
  }
};

export const PlatformLaunchers = ({
  platforms
}: PlatformLaunchersProps): JSX.Element => {
  return (
    <div className="flex flex-wrap gap-2">
      {platforms.map((platform) => {
        const launcher = PLATFORM_MAP[platform.toLowerCase()];

        if (!launcher) {
          return null;
        }

        return (
          <button
            key={platform}
            type="button"
            onClick={() => window.open(launcher.url, "_blank", "noopener,noreferrer")}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-surface-container-high px-3 text-xs text-on-surface transition hover:bg-surface-bright"
          >
            <span className="material-symbols-outlined text-sm">
              {launcher.icon}
            </span>
            <span>{launcher.label}</span>
          </button>
        );
      })}
    </div>
  );
};
