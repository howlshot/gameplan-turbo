import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BuildStageCard } from "@/components/workspace/BuildStageCard";
import type { BuildStage } from "@/types";

const stage: BuildStage = {
  id: "stage-1",
  projectId: "project-1",
  stageKey: "scope-lock",
  stageNumber: 1,
  name: "Scope Lock",
  description: "Freeze the v1 plan.",
  status: "not-started",
  promptContent: "Prompt",
  platform: "codex",
  createdAt: 1,
  updatedAt: 1
};

describe("BuildStageCard", () => {
  it("renders dynamic progress dots based on the provided stage count", () => {
    render(
      <BuildStageCard
        stage={stage}
        totalStages={15}
        onStatusChange={vi.fn()}
      />
    );

    expect(screen.getAllByTestId("stage-progress-dot")).toHaveLength(15);
  });
});
