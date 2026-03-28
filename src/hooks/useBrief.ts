import { useMemo } from "react";
import { useGameDesignDoc } from "@/hooks/useGameDesignDoc";
import type { Brief, CoreFeature } from "@/types";

interface UpdateBriefInput {
  coreFeatures?: CoreFeature[];
  inspirations?: string[];
  notes?: string;
  problem?: string;
  targetUser?: string;
}

const mapGameDesignDocToBrief = (
  projectId: string | undefined,
  doc: ReturnType<typeof useGameDesignDoc>["gameDesignDoc"]
): Brief | null => {
  if (!projectId || !doc) {
    return null;
  }

  const pillars = doc.designPillars.pillars.map((pillar, index) => ({
    id: `pillar-${index}`,
    order: index,
    text: pillar
  }));

  return {
    id: doc.id,
    projectId,
    problem: doc.concept.playerFantasy,
    targetUser: doc.concept.targetAudience,
    coreFeatures: pillars,
    inspirations: doc.artTone.visualReferences,
    notes: [
      doc.coreLoop.secondToSecond,
      doc.coreLoop.minuteToMinute,
      doc.coreLoop.sessionLoop
    ]
      .filter(Boolean)
      .join("\n\n"),
    updatedAt: doc.updatedAt
  };
};

export const useBrief = (projectId: string | undefined) => {
  const {
    gameDesignDoc,
    isLoading,
    initializeGameDesignDoc,
    updateGameDesignDoc
  } = useGameDesignDoc(projectId);

  const brief = useMemo(
    () => mapGameDesignDocToBrief(projectId, gameDesignDoc),
    [gameDesignDoc, projectId]
  );

  const updateBrief = async (updates: UpdateBriefInput): Promise<Brief | null> => {
    const nextPillars = updates.coreFeatures?.map((feature) => feature.text.trim()).filter(Boolean);
    const nextReferences = updates.inspirations?.filter(Boolean);

    const updatedDoc = await updateGameDesignDoc({
      concept: {
        playerFantasy: updates.problem,
        targetAudience: updates.targetUser
      },
      designPillars: {
        pillars: nextPillars
      },
      artTone: {
        visualReferences: nextReferences
      },
      coreLoop: {
        secondToSecond: updates.notes
      }
    });

    return mapGameDesignDocToBrief(projectId, updatedDoc);
  };

  return {
    brief,
    isLoading,
    updateBrief,
    initializeBrief: initializeGameDesignDoc
  };
};
