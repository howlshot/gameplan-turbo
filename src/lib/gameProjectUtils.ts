import type {
  AgentPlatform,
  BuildStage,
  GameDesignDoc,
  Project,
  ProjectStatus
} from "@/types";

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

export const CANONICAL_PROJECT_PHASES = [
  "concept",
  "preproduction",
  "production",
  "playtesting",
  "release-prep"
] as const;

export type CanonicalProjectPhase = (typeof CANONICAL_PROJECT_PHASES)[number];

const LEGACY_STATUS_TO_PHASE: Record<string, CanonicalProjectPhase> = {
  ideation: "concept",
  researching: "preproduction",
  designing: "preproduction",
  building: "production",
  shipped: "release-prep"
};

const hasTextContent = (value: string | null | undefined): boolean =>
  typeof value === "string" && value.trim().length > 0;

const hasListContent = (value: string[] | null | undefined): boolean =>
  Array.isArray(value) && value.some((item) => item.trim().length > 0);

const hasDesignPillarsContent = (gameDesignDoc: GameDesignDoc | null | undefined): boolean => {
  if (!gameDesignDoc) {
    return false;
  }

  return (
    hasListContent(gameDesignDoc.designPillars.pillars) ||
    hasTextContent(gameDesignDoc.designPillars.feelStatement) ||
    hasListContent(gameDesignDoc.designPillars.antiGoals) ||
    hasListContent(gameDesignDoc.designPillars.emotionalTargets) ||
    hasTextContent(gameDesignDoc.designPillars.readabilityPrinciples)
  );
};

const hasCoreLoopContent = (gameDesignDoc: GameDesignDoc | null | undefined): boolean => {
  if (!gameDesignDoc) {
    return false;
  }

  return [
    gameDesignDoc.coreLoop.secondToSecond,
    gameDesignDoc.coreLoop.minuteToMinute,
    gameDesignDoc.coreLoop.sessionLoop,
    gameDesignDoc.coreLoop.longTermProgression,
    gameDesignDoc.coreLoop.failureStates,
    gameDesignDoc.coreLoop.rewardCadence
  ].some(hasTextContent);
};

const hasControlsFeelContent = (gameDesignDoc: GameDesignDoc | null | undefined): boolean => {
  if (!gameDesignDoc) {
    return false;
  }

  return [
    gameDesignDoc.controlsFeel.controlScheme,
    gameDesignDoc.controlsFeel.cameraRules,
    gameDesignDoc.controlsFeel.movementPhilosophy,
    gameDesignDoc.controlsFeel.combatFeelGoals,
    gameDesignDoc.controlsFeel.responsivenessStandards,
    gameDesignDoc.controlsFeel.platformInputNotes,
    gameDesignDoc.controlsFeel.accessibilityConsiderations
  ].some(hasTextContent);
};

const isStageStarted = (stage: BuildStage): boolean =>
  stage.status === "in-progress" || stage.status === "complete";

const isStageAtLeastInProgress = (
  stages: BuildStage[],
  stageKeys: BuildStage["stageKey"][]
): boolean =>
  stages.some((stage) => stageKeys.includes(stage.stageKey) && isStageStarted(stage));

const isStageComplete = (
  stages: BuildStage[],
  stageKey: BuildStage["stageKey"]
): boolean => stages.some((stage) => stage.stageKey === stageKey && stage.status === "complete");

export const normalizeProjectPhase = (status: ProjectStatus): CanonicalProjectPhase =>
  CANONICAL_PROJECT_PHASES.includes(status as CanonicalProjectPhase)
    ? (status as CanonicalProjectPhase)
    : (LEGACY_STATUS_TO_PHASE[status] ?? "concept");

export const getProjectPhaseIndex = (status: ProjectStatus): number =>
  CANONICAL_PROJECT_PHASES.indexOf(normalizeProjectPhase(status));

export const getPreviousProjectPhase = (
  status: ProjectStatus
): CanonicalProjectPhase | null => {
  const currentIndex = getProjectPhaseIndex(status);
  return currentIndex > 0 ? CANONICAL_PROJECT_PHASES[currentIndex - 1] : null;
};

export const getNextProjectPhase = (
  status: ProjectStatus
): CanonicalProjectPhase | null => {
  const currentIndex = getProjectPhaseIndex(status);
  return currentIndex < CANONICAL_PROJECT_PHASES.length - 1
    ? CANONICAL_PROJECT_PHASES[currentIndex + 1]
    : null;
};

export interface ProjectPhaseRecommendation {
  currentPhase: CanonicalProjectPhase;
  rationale: string;
  recommendedNextPhase: CanonicalProjectPhase | null;
}

export const getProjectPhaseRecommendation = ({
  buildStages,
  gameDesignDoc,
  project
}: {
  buildStages: BuildStage[];
  gameDesignDoc: GameDesignDoc | null | undefined;
  project: Pick<Project, "oneLinePitch" | "status">;
}): ProjectPhaseRecommendation => {
  const currentPhase = normalizeProjectPhase(project.status);
  const currentPhaseIndex = CANONICAL_PROJECT_PHASES.indexOf(currentPhase);

  const preproductionSignals = [
    hasTextContent(project.oneLinePitch),
    hasDesignPillarsContent(gameDesignDoc),
    hasCoreLoopContent(gameDesignDoc),
    hasControlsFeelContent(gameDesignDoc),
    buildStages.length > 0
  ];

  const preproductionReadinessCount = preproductionSignals.filter(Boolean).length;

  const candidates: Array<{
    phase: CanonicalProjectPhase;
    rationale: string;
    shouldRecommend: boolean;
  }> = [
    {
      phase: "preproduction",
      rationale:
        "The project now has enough design coverage and roadmap structure to move out of concept and into preproduction planning.",
      shouldRecommend: preproductionReadinessCount >= 3
    },
    {
      phase: "production",
      rationale:
        "Core execution has started on the roadmap, so the project is ready to be tracked as active production.",
      shouldRecommend:
        buildStages.length > 0 &&
        isStageAtLeastInProgress(buildStages, [
          "foundation",
          "first-playable",
          "core-controls",
          "systems-foundation"
        ])
    },
    {
      phase: "playtesting",
      rationale:
        "The vertical slice integration gate is complete, which makes the project ready for structured playtesting.",
      shouldRecommend: isStageComplete(buildStages, "vertical-slice-integration")
    },
    {
      phase: "release-prep",
      rationale:
        "Polish or release-prep work is underway, so the project is ready to be tracked in release preparation.",
      shouldRecommend:
        isStageComplete(buildStages, "polish") ||
        isStageAtLeastInProgress(buildStages, [
          "qa-release-prep",
          "packaging-release-prep"
        ])
    }
  ];

  const nextRecommendation =
    candidates.find(
      (candidate) =>
        candidate.shouldRecommend &&
        CANONICAL_PROJECT_PHASES.indexOf(candidate.phase) > currentPhaseIndex
    ) ?? null;

  return {
    currentPhase,
    recommendedNextPhase: nextRecommendation?.phase ?? null,
    rationale:
      nextRecommendation?.rationale ??
      "No phase change is recommended yet. Keep working through the current roadmap and design signals."
  };
};
