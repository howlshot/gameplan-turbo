import type { Brief, GameDesignDoc } from "@/types";

interface BriefCompletionMeta {
  projectName?: string;
  targetPlatformsCount?: number;
  techStackCount?: number;
}

interface GameDesignDocCompletionMeta {
  projectTitle?: string;
  agentTargetsCount?: number;
  platformTargetsCount?: number;
}

export const getBriefCompletionScore = (
  brief: Brief,
  meta: BriefCompletionMeta = {}
): number => {
  let score = 0;

  if (meta.projectName?.trim()) {
    score += 20;
  }

  if (brief.problem.trim()) {
    score += 25;
  }

  if (brief.targetUser.trim()) {
    score += 15;
  }

  if (brief.coreFeatures.filter((feature) => feature.text.trim()).length >= 1) {
    score += 25;
  }

  if ((meta.techStackCount ?? 0) > 0) {
    score += 10;
  }

  if ((meta.targetPlatformsCount ?? 0) > 0) {
    score += 5;
  }

  return score;
};

export const isBriefComplete = (
  brief: Brief,
  meta: BriefCompletionMeta = {}
): boolean => getBriefCompletionScore(brief, meta) >= 70;

export const getGameDesignDocCompletionScore = (
  gameDesignDoc: GameDesignDoc,
  meta: GameDesignDocCompletionMeta = {}
): number => {
  let score = 0;

  if (meta.projectTitle?.trim() || gameDesignDoc.concept.gameTitle.trim()) {
    score += 10;
  }

  if (gameDesignDoc.concept.oneLinePitch.trim()) {
    score += 10;
  }

  if (gameDesignDoc.concept.playerFantasy.trim()) {
    score += 10;
  }

  if (gameDesignDoc.designPillars.pillars.filter(Boolean).length >= 3) {
    score += 15;
  }

  if (gameDesignDoc.coreLoop.secondToSecond.trim()) {
    score += 10;
  }

  if (gameDesignDoc.controlsFeel.controlScheme.trim()) {
    score += 10;
  }

  if (gameDesignDoc.contentBible.playerVerbs.trim()) {
    score += 10;
  }

  if (gameDesignDoc.artTone.artDirection.trim()) {
    score += 10;
  }

  if (gameDesignDoc.technicalDesign.engine.trim()) {
    score += 5;
  }

  if ((meta.agentTargetsCount ?? 0) > 0) {
    score += 5;
  }

  if (
    (meta.platformTargetsCount ?? 0) > 0 ||
    gameDesignDoc.concept.platformTargets.length > 0
  ) {
    score += 5;
  }

  return score;
};

export const isGameDesignDocReady = (
  gameDesignDoc: GameDesignDoc,
  meta: GameDesignDocCompletionMeta = {}
): boolean => getGameDesignDocCompletionScore(gameDesignDoc, meta) >= 65;
