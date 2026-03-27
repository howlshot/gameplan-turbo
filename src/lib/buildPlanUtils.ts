import { getBuildStageSequence } from "@/lib/templates/genreTemplates";
import type { BuildStage, ScopeCategory } from "@/types";

export const isLegacyLargeBuildPlan = (
  scopeCategory: ScopeCategory,
  stages: BuildStage[]
): boolean => {
  if (scopeCategory !== "large" || stages.length === 0) {
    return false;
  }

  return (
    stages.length < getBuildStageSequence("large").length &&
    !stages.some((stage) => stage.stageKey === "scope-lock")
  );
};
