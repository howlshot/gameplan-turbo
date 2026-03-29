import { useLiveQuery } from "dexie-react-hooks";
import db from "@/lib/db";
import { getBuildStageSequence } from "@/lib/templates/genreTemplates";
import type { BuildStage, BuildStageKey, BuildStageStatus } from "@/types";

interface CreateBuildStageInput {
  description: string;
  name: string;
  platform: string;
  promptContent: string;
  stageKey?: BuildStageKey;
  stageNumber: number;
  status?: BuildStageStatus;
}

type UpdateBuildStageInput = Partial<
  Pick<
    BuildStage,
    | "description"
    | "name"
    | "platform"
    | "promptContent"
    | "stageNumber"
    | "status"
  >
>;

const getFallbackStageKey = (stageNumber: number): BuildStageKey => {
  const defaultSequence = getBuildStageSequence("small");
  return (
    defaultSequence[stageNumber - 1]?.key ??
    defaultSequence[defaultSequence.length - 1].key
  );
};

export const useBuildStages = (projectId: string | undefined) => {
  const stagesQuery = useLiveQuery(
    async (): Promise<BuildStage[]> => {
      if (!projectId) {
        return [];
      }

      return db.buildStages.where("projectId").equals(projectId).sortBy("stageNumber");
    },
    [projectId]
  );

  const stages = stagesQuery ?? [];
  const isLoading = stagesQuery === undefined;

  const createStages = async (
    inputs: CreateBuildStageInput[]
  ): Promise<BuildStage[]> => {
    if (!projectId) {
      return [];
    }

    try {
      const now = Date.now();
      const nextStages = inputs.map((input) => ({
        id: crypto.randomUUID(),
        projectId,
        stageKey: input.stageKey ?? getFallbackStageKey(input.stageNumber),
        stageNumber: input.stageNumber,
        name: input.name,
        description: input.description,
        status: input.status ?? "not-started",
        promptContent: input.promptContent,
        platform: input.platform,
        createdAt: now,
        updatedAt: now
      }));

      await db.transaction("rw", db.buildStages, async () => {
        await db.buildStages.where("projectId").equals(projectId).delete();
        await db.buildStages.bulkPut(nextStages);
      });
      return nextStages;
    } catch (error) {
      console.error("Failed to create build stages.", error);
      return [];
    }
  };

  const updateStageStatus = async (
    stageId: string,
    status: BuildStageStatus
  ): Promise<void> => {
    await updateStage(stageId, { status });
  };

  const updateStage = async (
    stageId: string,
    updates: UpdateBuildStageInput
  ): Promise<void> => {
    try {
      await db.buildStages.update(stageId, {
        ...updates,
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error("Failed to update build stage.", error);
    }
  };

  const updateStagePrompt = async (
    stageId: string,
    promptContent: string
  ): Promise<void> => {
    await updateStage(stageId, { promptContent });
  };

  const replaceStages = async (nextStages: BuildStage[]): Promise<BuildStage[]> => {
    if (!projectId) {
      return [];
    }

    try {
      await db.transaction("rw", db.buildStages, async () => {
        await db.buildStages.where("projectId").equals(projectId).delete();
        await db.buildStages.bulkPut(nextStages);
      });

      return nextStages;
    } catch (error) {
      console.error("Failed to replace build stages.", error);
      return [];
    }
  };

  const reorderStages = async (orderedStageIds: string[]): Promise<void> => {
    if (!projectId) {
      return;
    }

    const stageMap = new Map(stages.map((stage) => [stage.id, stage]));
    const nextStages = orderedStageIds
      .map((stageId) => stageMap.get(stageId))
      .filter((stage): stage is BuildStage => Boolean(stage))
      .map((stage, index) => ({
        ...stage,
        stageNumber: index + 1,
        updatedAt: Date.now()
      }));

    if (nextStages.length !== stages.length) {
      return;
    }

    await replaceStages(nextStages);
  };

  return {
    stages,
    isLoading,
    createStages,
    replaceStages,
    reorderStages,
    updateStage,
    updateStageStatus,
    updateStagePrompt
  };
};
