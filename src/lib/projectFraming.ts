import type { ScopeCategory } from "@/types";

export interface ScopeProfile {
  id: ScopeCategory;
  label: string;
  summary: string;
  guardrails: string[];
  tone?: "default" | "warning";
  warningMessage?: string;
}

export interface SessionLengthPreset {
  id: string;
  label: string;
  summary: string;
}

export const SCOPE_ORDER: ScopeCategory[] = ["tiny", "small", "medium", "large"];

export const SCOPE_PROFILES: ScopeProfile[] = [
  {
    id: "tiny",
    label: "Tiny",
    summary: "One strong mechanic, almost no content breadth, minimal production surface.",
    guardrails: [
      "1 core mode or run structure",
      "1 environment set or presentation wrapper",
      "1-3 enemy or obstacle types",
      "No secondary progression system unless it is trivial"
    ]
  },
  {
    id: "small",
    label: "Small",
    summary:
      "One polished core loop with limited variety and realistic v1 scope for an individual or small team.",
    guardrails: [
      "1 main mode with a clear first-playable path",
      "2-4 environment or chapter variants",
      "3-8 enemies or encounter ingredients",
      "Light progression or replay motivation only"
    ]
  },
  {
    id: "medium",
    label: "Medium",
    summary: "Multiple content layers and systems, still indie-sized but with noticeably higher production risk.",
    guardrails: [
      "Multiple content sets or mission families",
      "Broader progression and tuning overhead",
      "More asset burden and balancing passes",
      "Needs stronger cut discipline to avoid slipping past v1"
    ]
  },
  {
    id: "large",
    label: "Large",
    summary:
      "Broad game scope with a high risk of slipping past v1. Valid for planning, but not the default target for this tool.",
    guardrails: [
      "Expect multiple systems, content families, and production dependencies",
      "Requires aggressive milestone cuts to stay shippable",
      "Needs stronger scheduling, asset discipline, and fallback plans",
      "Treat this as a warning sign unless the team and runway are clearly real"
    ],
    tone: "warning",
    warningMessage:
      "Large is allowed for honest planning, but Preflight Game OS is still optimized for finishable tiny-to-medium projects."
  }
];

export const SESSION_LENGTH_PRESETS: SessionLengthPreset[] = [
  {
    id: "burst",
    label: "1-3 minutes",
    summary: "Ultra-short sessions, score attack, idle moments should be nearly zero."
  },
  {
    id: "arcade",
    label: "3-10 minutes",
    summary: "Quick arcade loops, strong restart energy, ideal for score chase or mobile action."
  },
  {
    id: "compact",
    label: "10-20 minutes",
    summary: "Short but substantial sessions with room for escalation and a fuller content slice."
  },
  {
    id: "extended",
    label: "20-40 minutes",
    summary: "Longer runs or missions, more room for setup, progression beats, and fatigue risk."
  },
  {
    id: "long-form",
    label: "40+ minutes",
    summary: "Campaign-style sessions; requires more save, pacing, and retention design."
  }
];

export const getScopeProfile = (
  scopeCategory: ScopeCategory
): ScopeProfile =>
  SCOPE_PROFILES.find((profile) => profile.id === scopeCategory) ??
  SCOPE_PROFILES[1];

export const getSessionPreset = (
  sessionLength: string
): SessionLengthPreset | null =>
  SESSION_LENGTH_PRESETS.find((preset) => preset.label === sessionLength) ?? null;
