import { useCallback, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import db from "@/lib/db";
import { createEmptyGameDesignDoc } from "@/lib/templates/genreTemplates";
import type { GameDesignDoc } from "@/types";

interface UpdateGameDesignDocInput {
  concept?: Partial<GameDesignDoc["concept"]>;
  designPillars?: Partial<GameDesignDoc["designPillars"]>;
  coreLoop?: Partial<GameDesignDoc["coreLoop"]>;
  controlsFeel?: Partial<GameDesignDoc["controlsFeel"]>;
  contentBible?: Partial<GameDesignDoc["contentBible"]>;
  artTone?: Partial<GameDesignDoc["artTone"]>;
  technicalDesign?: Partial<GameDesignDoc["technicalDesign"]>;
}

export const useGameDesignDoc = (projectId: string | undefined) => {
  const gameDesignDocQuery = useLiveQuery(
    async (): Promise<GameDesignDoc | null> => {
      if (!projectId) {
        return null;
      }

      return (
        (await db.gameDesignDocs.where("projectId").equals(projectId).first()) ?? null
      );
    },
    [projectId]
  );

  const initializeGameDesignDoc = useCallback(async (): Promise<GameDesignDoc | null> => {
    if (!projectId) {
      return null;
    }

    const current = await db.gameDesignDocs.where("projectId").equals(projectId).first();
    if (current) {
      return current;
    }

    const nextDoc = createEmptyGameDesignDoc(projectId);
    await db.gameDesignDocs.add(nextDoc);
    return nextDoc;
  }, [projectId]);

  useEffect(() => {
    if (projectId && gameDesignDocQuery === null) {
      void initializeGameDesignDoc();
    }
  }, [projectId, gameDesignDocQuery, initializeGameDesignDoc]);

  const updateGameDesignDoc = async (
    updates: UpdateGameDesignDocInput
  ): Promise<GameDesignDoc | null> => {
    if (!projectId) {
      return null;
    }

    try {
      const current =
        (await db.gameDesignDocs.where("projectId").equals(projectId).first()) ??
        createEmptyGameDesignDoc(projectId);

      const nextDoc: GameDesignDoc = {
        ...current,
        concept: {
          ...current.concept,
          ...updates.concept
        },
        designPillars: {
          ...current.designPillars,
          ...updates.designPillars
        },
        coreLoop: {
          ...current.coreLoop,
          ...updates.coreLoop
        },
        controlsFeel: {
          ...current.controlsFeel,
          ...updates.controlsFeel
        },
        contentBible: {
          ...current.contentBible,
          ...updates.contentBible
        },
        artTone: {
          ...current.artTone,
          ...updates.artTone
        },
        technicalDesign: {
          ...current.technicalDesign,
          ...updates.technicalDesign
        },
        updatedAt: Date.now()
      };

      await db.gameDesignDocs.put(nextDoc);
      return nextDoc;
    } catch (error) {
      console.error("Failed to update game design doc.", error);
      return null;
    }
  };

  return {
    gameDesignDoc: gameDesignDocQuery ?? null,
    isLoading: gameDesignDocQuery === undefined,
    updateGameDesignDoc,
    initializeGameDesignDoc
  };
};
