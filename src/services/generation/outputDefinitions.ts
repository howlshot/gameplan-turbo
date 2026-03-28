import type { AgentType, ArtifactType } from "@/types";

export interface PromptLabOutputDefinition {
  type: ArtifactType;
  agentType: AgentType;
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  fileLabel: string;
  recommendedPlatforms: string[];
}

export const PROMPT_LAB_OUTPUTS: PromptLabOutputDefinition[] = [
  {
    type: "game_pitch",
    agentType: "game-pitch",
    title: "One-Page Game Pitch",
    description: "A compact pitch for alignment, pitching, or fast concept validation.",
    emptyTitle: "No pitch generated yet",
    emptyDescription: "Generate a concise one-page pitch from your current concept and design pillars.",
    fileLabel: "GAME_PITCH.md",
    recommendedPlatforms: ["chatgpt", "gemini", "perplexity"]
  },
  {
    type: "mini_gdd",
    agentType: "mini-gdd",
    title: "Mini GDD",
    description: "A compact design doc optimized for first playable execution.",
    emptyTitle: "No mini GDD yet",
    emptyDescription: "Generate a compact design document with loops, controls, content, and constraints.",
    fileLabel: "MINI_GDD.md",
    recommendedPlatforms: ["codex", "cursor", "claude-code"]
  },
  {
    type: "full_gdd",
    agentType: "full-gdd",
    title: "Full Game Design Document",
    description: "A more complete design document for production guidance.",
    emptyTitle: "No full game design document yet",
    emptyDescription: "Generate a full game design document grounded in the workspace data.",
    fileLabel: "FULL_GDD.md",
    recommendedPlatforms: ["chatgpt", "gemini", "claude-code"]
  },
  {
    type: "vertical_slice_plan",
    agentType: "vertical-slice-plan",
    title: "Vertical Slice Plan",
    description: "What one representative slice proves the game works.",
    emptyTitle: "No vertical slice plan yet",
    emptyDescription: "Generate a vertical slice plan with acceptance criteria and cut lines.",
    fileLabel: "VERTICAL_SLICE_PLAN.md",
    recommendedPlatforms: ["codex", "cursor", "claude-code"]
  },
  {
    type: "milestone_roadmap",
    agentType: "milestone-roadmap",
    title: "Milestone Roadmap",
    description: "Milestones and exit criteria from preproduction to release prep.",
    emptyTitle: "No roadmap yet",
    emptyDescription: "Generate a milestone roadmap aligned to the build plan.",
    fileLabel: "MILESTONE_ROADMAP.md",
    recommendedPlatforms: ["chatgpt", "gemini", "perplexity"]
  },
  {
    type: "agent_system_prompt",
    agentType: "agent-system-prompt",
    title: "Agent System Prompt",
    description: "System prompt for Codex, Qwen Code, Cursor, Claude Code, or similar tools.",
    emptyTitle: "No system prompt yet",
    emptyDescription: "Generate a coding-agent system prompt grounded in the project’s game design and build stages.",
    fileLabel: "AGENT_SYSTEM_PROMPT.txt",
    recommendedPlatforms: ["codex", "qwen-code", "cursor", "claude-code"]
  },
  {
    type: "staged_implementation_prompts",
    agentType: "implementation-stage",
    title: "Staged Implementation Prompts",
    description: "Copy-ready prompts for each game build stage.",
    emptyTitle: "No stage prompts yet",
    emptyDescription: "Generate ordered stage prompts so the implementation stays coherent.",
    fileLabel: "STAGED_IMPLEMENTATION_PROMPTS.md",
    recommendedPlatforms: ["codex", "cursor", "claude-code", "qwen-code"]
  },
  {
    type: "art_prompt_packet",
    agentType: "art-prompt-packet",
    title: "Art Prompt Packet",
    description: "Visual briefing copy for concepting, moodboards, and image generation.",
    emptyTitle: "No art prompt packet yet",
    emptyDescription: "Generate a packet for art references, image prompting, and aesthetic alignment.",
    fileLabel: "ART_PROMPT_PACKET.md",
    recommendedPlatforms: ["chatgpt", "gemini"]
  },
  {
    type: "asset_grocery_list",
    agentType: "asset-grocery-list",
    title: "Asset Grocery List",
    description: "An asset inventory grouped by production priority.",
    emptyTitle: "No asset grocery list yet",
    emptyDescription: "Generate a practical asset list for first playable and slice planning.",
    fileLabel: "ASSET_GROCERY_LIST.md",
    recommendedPlatforms: ["codex", "cursor"]
  },
  {
    type: "playtest_checklist",
    agentType: "playtest-checklist",
    title: "Playtest Checklist",
    description: "Observation checklist for feel, clarity, and pacing.",
    emptyTitle: "No playtest checklist yet",
    emptyDescription: "Generate a short playtest checklist for the current game concept.",
    fileLabel: "PLAYTEST_CHECKLIST.md",
    recommendedPlatforms: ["chatgpt", "gemini"]
  },
  {
    type: "risk_register",
    agentType: "risk-register",
    title: "Risk Register",
    description: "Production and design risks with mitigation paths.",
    emptyTitle: "No risk register yet",
    emptyDescription: "Generate a risk register for scope, feel, clarity, and performance.",
    fileLabel: "RISK_REGISTER.md",
    recommendedPlatforms: ["chatgpt", "gemini", "perplexity"]
  },
  {
    type: "cut_list",
    agentType: "cut-list",
    title: "Cut List / Scope Triage",
    description: "What to cut, fake, or defer to protect the core fantasy.",
    emptyTitle: "No cut list yet",
    emptyDescription: "Generate a scope triage document that preserves the strongest version of the game.",
    fileLabel: "CUT_LIST.md",
    recommendedPlatforms: ["codex", "cursor", "claude-code"]
  },
  {
    type: "reference_research_prompt",
    agentType: "reference-research",
    title: "Reference Research Prompt",
    description: "A deep research prompt for genre, controls, market, and scope benchmarking.",
    emptyTitle: "No research prompt yet",
    emptyDescription: "Generate a reference research prompt for an external research model.",
    fileLabel: "REFERENCE_RESEARCH_PROMPT.md",
    recommendedPlatforms: ["perplexity", "gemini", "chatgpt"]
  }
];

export const getOutputDefinition = (
  type: ArtifactType
): PromptLabOutputDefinition | undefined =>
  PROMPT_LAB_OUTPUTS.find((definition) => definition.type === type);
