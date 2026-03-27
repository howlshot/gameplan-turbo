import type { AgentPlatform, ProjectStatus } from "@/types";

export const splitCommaSeparated = (value: string): string[] =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const splitLineSeparated = (value: string): string[] =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

export const toCommaSeparated = (items: string[]): string => items.join(", ");

export const toLineSeparated = (items: string[]): string => items.join("\n");

export const getProjectStatusLabel = (status: ProjectStatus): string => {
  switch (status) {
    case "concept":
      return "Concept";
    case "preproduction":
      return "Preproduction";
    case "production":
      return "Production";
    case "playtesting":
      return "Playtesting";
    case "release-prep":
      return "Release Prep";
    case "ideation":
      return "Ideation";
    case "researching":
      return "Researching";
    case "designing":
      return "Designing";
    case "building":
      return "Building";
    case "shipped":
      return "Shipped";
    default:
      return status;
  }
};

export const getProjectStatusTone = (status: ProjectStatus): string => {
  switch (status) {
    case "concept":
    case "ideation":
      return "bg-outline/10 text-outline";
    case "preproduction":
    case "researching":
    case "designing":
      return "bg-tertiary/10 text-tertiary";
    case "production":
    case "building":
      return "bg-primary/10 text-primary";
    case "playtesting":
      return "bg-secondary/10 text-secondary";
    case "release-prep":
    case "shipped":
      return "bg-secondary/20 text-secondary";
    default:
      return "bg-surface-container text-on-surface-variant";
  }
};

export const getProjectStatusDotTone = (status: ProjectStatus): string => {
  switch (status) {
    case "production":
    case "building":
      return "bg-primary animate-pulse";
    case "playtesting":
    case "release-prep":
    case "shipped":
      return "bg-secondary";
    case "preproduction":
    case "researching":
    case "designing":
      return "bg-tertiary";
    case "concept":
    case "ideation":
    default:
      return "bg-outline";
  }
};

export const getAgentPlatformLabel = (platform: AgentPlatform | string): string => {
  switch (platform) {
    case "qwen-code":
      return "Qwen Code";
    case "claude-code":
      return "Claude Code";
    default:
      return platform.replace(/-/g, " ");
  }
};
