import { generateBuildStages } from "@/services/generation/buildGeneration";
import type { BuildStage, GameDesignDoc, Project } from "@/types";

interface GenerateMediumWorkflowParams {
  gameDesignDoc: GameDesignDoc;
  platform: string;
  project: Project;
}

export const generateMediumWorkflow = async ({
  gameDesignDoc,
  platform,
  project
}: GenerateMediumWorkflowParams): Promise<Omit<BuildStage, "projectId">[]> => {
  return generateBuildStages({
    gameDesignDoc,
    project,
    targetPlatform: platform
  });
};
