import { describe, expect, it } from "vitest";
import { isLegacyLargeBuildPlan } from "@/lib/buildPlanUtils";
import type { BuildStage } from "@/types";

const createStage = (
  stageNumber: number,
  stageKey: BuildStage["stageKey"]
): BuildStage => ({
  id: `${stageKey}-${stageNumber}`,
  projectId: "project-1",
  stageKey,
  stageNumber,
  name: stageKey,
  description: "Test stage",
  status: "not-started",
  promptContent: "Prompt",
  platform: "codex",
  createdAt: 1,
  updatedAt: 1
});

describe("isLegacyLargeBuildPlan", () => {
  it("detects pre-upgrade large plans", () => {
    const legacyStages = Array.from({ length: 12 }, (_, index) =>
      createStage(index + 1, "foundation")
    );

    expect(isLegacyLargeBuildPlan("large", legacyStages)).toBe(true);
  });

  it("does not flag current large plans", () => {
    const currentStages = [
      createStage(1, "scope-lock"),
      createStage(2, "foundation")
    ];

    expect(isLegacyLargeBuildPlan("large", currentStages)).toBe(false);
  });

  it("does not flag non-large projects", () => {
    expect(isLegacyLargeBuildPlan("small", [createStage(1, "foundation")])).toBe(
      false
    );
  });
});
