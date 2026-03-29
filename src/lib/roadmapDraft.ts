import type { BuildStage, BuildStageKey } from "@/types";

interface RoadmapDraftStageInput {
  description?: string;
  name?: string;
  platform?: string;
  promptContent?: string;
  stageKey?: string;
}

interface RoadmapPolishResponseShape {
  summary?: string;
  sequencingIssues?: string[];
  risks?: string[];
  scopeCuts?: string[];
  revisedStages?: RoadmapDraftStageInput[];
}

export interface RoadmapDraftReview {
  rawResponse: string;
  revisedStages: BuildStage[];
  scopeCuts: string[];
  sequencingIssues: string[];
  sourceLabel: string;
  summary: string;
  title: string;
  risks: string[];
}

const extractJsonBlock = (content: string): string => {
  const fencedMatch = content.match(/```json\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const genericFenceMatch = content.match(/```\s*([\s\S]*?)```/i);
  if (genericFenceMatch?.[1]) {
    return genericFenceMatch[1].trim();
  }

  return content.trim();
};

const isBuildStageKey = (value: string): value is BuildStageKey =>
  [
    "scope-lock",
    "foundation",
    "first-playable",
    "core-controls",
    "camera-movement",
    "combat-feel",
    "systems-foundation",
    "enemy-behavior",
    "encounter-scripting",
    "hud-feedback",
    "progression-meta",
    "content-pipeline",
    "content-production",
    "content-slice",
    "vertical-slice-integration",
    "polish",
    "packaging-release-prep",
    "qa-release-prep"
  ].includes(value);

const normalizeList = (values: string[] | undefined): string[] =>
  Array.isArray(values)
    ? values
        .map((value) => value.trim())
        .filter(Boolean)
        .slice(0, 8)
    : [];

const createFallbackSummary = (title: string): string =>
  `Review the ${title.toLowerCase()} and apply it only if the sequencing, risks, and stage brief changes look better than your current roadmap.`;

export const buildDraftFromExistingStages = ({
  currentStages,
  nextStages,
  rawResponse,
  sourceLabel,
  summary,
  title,
  sequencingIssues = [],
  risks = [],
  scopeCuts = []
}: {
  currentStages: BuildStage[];
  nextStages: BuildStage[];
  rawResponse: string;
  risks?: string[];
  scopeCuts?: string[];
  sequencingIssues?: string[];
  sourceLabel: string;
  summary?: string;
  title: string;
}): RoadmapDraftReview => {
  const existingByKey = new Map(currentStages.map((stage) => [stage.stageKey, stage]));
  const now = Date.now();

  const revisedStages = nextStages.map((stage, index) => {
    const existing = existingByKey.get(stage.stageKey);

    return {
      ...stage,
      id: existing?.id ?? stage.id,
      projectId: existing?.projectId ?? stage.projectId,
      stageNumber: index + 1,
      status: existing?.status ?? stage.status,
      createdAt: existing?.createdAt ?? stage.createdAt,
      updatedAt: now
    };
  });

  return {
    rawResponse,
    revisedStages,
    scopeCuts,
    sequencingIssues,
    sourceLabel,
    summary: summary?.trim() || createFallbackSummary(title),
    title,
    risks
  };
};

export const parseRoadmapPolishResponse = ({
  content,
  currentStages
}: {
  content: string;
  currentStages: BuildStage[];
}): RoadmapDraftReview => {
  const parsed = JSON.parse(extractJsonBlock(content)) as RoadmapPolishResponseShape;

  if (!Array.isArray(parsed.revisedStages) || parsed.revisedStages.length === 0) {
    throw new Error("The connected AI did not return a revised roadmap draft.");
  }

  const existingByKey = new Map(currentStages.map((stage) => [stage.stageKey, stage]));
  const seenKeys = new Set<BuildStageKey>();
  const now = Date.now();

  const revisedStages = parsed.revisedStages.map((stage, index) => {
    if (!stage.stageKey || !isBuildStageKey(stage.stageKey)) {
      throw new Error("The roadmap draft included an unknown stage key.");
    }

    if (seenKeys.has(stage.stageKey)) {
      throw new Error("The roadmap draft included duplicate stage keys.");
    }
    seenKeys.add(stage.stageKey);

    const existing = existingByKey.get(stage.stageKey);
    if (!existing) {
      throw new Error("The roadmap draft no longer matches the current roadmap.");
    }

    const name = stage.name?.trim();
    const description = stage.description?.trim();
    const promptContent = stage.promptContent?.trim();

    if (!name || !description || !promptContent) {
      throw new Error("The roadmap draft was missing stage details.");
    }

    return {
      ...existing,
      stageNumber: index + 1,
      name,
      description,
      promptContent,
      platform: stage.platform?.trim() || existing.platform,
      updatedAt: now
    };
  });

  if (revisedStages.length !== currentStages.length) {
    throw new Error("The revised roadmap draft changed the number of stages.");
  }

  if (seenKeys.size !== currentStages.length) {
    throw new Error("The revised roadmap draft did not include every current stage.");
  }

  return {
    rawResponse: content,
    revisedStages,
    scopeCuts: normalizeList(parsed.scopeCuts),
    sequencingIssues: normalizeList(parsed.sequencingIssues),
    sourceLabel: "Polished roadmap draft",
    summary:
      parsed.summary?.trim() || createFallbackSummary("Polished roadmap draft"),
    title: "Polished roadmap draft",
    risks: normalizeList(parsed.risks)
  };
};
