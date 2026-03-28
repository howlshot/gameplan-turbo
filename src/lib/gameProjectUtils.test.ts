import { describe, expect, it } from "vitest";
import { createEmptyGameDesignDoc } from "@/lib/templates/genreTemplates";
import {
  getNextProjectPhase,
  getPreviousProjectPhase,
  getProjectPhaseRecommendation,
  normalizeProjectPhase
} from "@/lib/gameProjectUtils";
import type { BuildStage, Project } from "@/types";

const createProject = (status: Project["status"], oneLinePitch = ""): Pick<
  Project,
  "status" | "oneLinePitch"
> => ({
  status,
  oneLinePitch
});

const createStage = (
  stageKey: BuildStage["stageKey"],
  status: BuildStage["status"]
): BuildStage => ({
  id: `${stageKey}-${status}`,
  projectId: "project-1",
  stageKey,
  stageNumber: 1,
  name: stageKey,
  description: `${stageKey} description`,
  status,
  promptContent: "prompt",
  platform: "codex",
  createdAt: 1,
  updatedAt: 1
});

describe("gameProjectUtils phase helpers", () => {
  it("normalizes legacy statuses into canonical phases", () => {
    expect(normalizeProjectPhase("researching")).toBe("preproduction");
    expect(normalizeProjectPhase("building")).toBe("production");
    expect(normalizeProjectPhase("shipped")).toBe("release-prep");
  });

  it("steps forward and backward across the canonical phase order", () => {
    expect(getPreviousProjectPhase("concept")).toBeNull();
    expect(getNextProjectPhase("concept")).toBe("preproduction");
    expect(getPreviousProjectPhase("playtesting")).toBe("production");
    expect(getNextProjectPhase("release-prep")).toBeNull();
  });

  it("suggests preproduction when enough early planning signals are present", () => {
    const gameDesignDoc = createEmptyGameDesignDoc("project-1", {
      designPillars: {
        pillars: ["Scarcity should feel fair."]
      },
      coreLoop: {
        secondToSecond: "Search, evade, recover."
      }
    });

    const recommendation = getProjectPhaseRecommendation({
      buildStages: [],
      gameDesignDoc,
      project: createProject("concept", "Survive one dangerous night.")
    });

    expect(recommendation.recommendedNextPhase).toBe("preproduction");
  });

  it("suggests production once core roadmap execution has begun", () => {
    const recommendation = getProjectPhaseRecommendation({
      buildStages: [createStage("foundation", "in-progress")],
      gameDesignDoc: createEmptyGameDesignDoc("project-1"),
      project: createProject("preproduction", "Pitch")
    });

    expect(recommendation.recommendedNextPhase).toBe("production");
  });

  it("suggests playtesting after vertical slice integration is complete", () => {
    const recommendation = getProjectPhaseRecommendation({
      buildStages: [createStage("vertical-slice-integration", "complete")],
      gameDesignDoc: createEmptyGameDesignDoc("project-1"),
      project: createProject("production", "Pitch")
    });

    expect(recommendation.recommendedNextPhase).toBe("playtesting");
  });

  it("suggests release prep after polish or release-prep work starts", () => {
    const recommendation = getProjectPhaseRecommendation({
      buildStages: [createStage("polish", "complete")],
      gameDesignDoc: createEmptyGameDesignDoc("project-1"),
      project: createProject("playtesting", "Pitch")
    });

    expect(recommendation.recommendedNextPhase).toBe("release-prep");
  });
});
