import { generateBuildStages } from "@/services/generation/buildGeneration";
import type { BuildStage, GameDesignDoc, Project } from "@/types";

interface GenerateQuickWorkflowParams {
  gameDesignDoc: GameDesignDoc;
  platform: string;
  project: Project;
}

export const generateQuickWorkflow = async ({
  gameDesignDoc,
  platform,
  project
}: GenerateQuickWorkflowParams): Promise<Omit<BuildStage, "projectId">[]> => {
  return generateBuildStages({
    gameDesignDoc,
    project,
    targetPlatform: platform
  });
};
