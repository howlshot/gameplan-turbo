import { fireEvent, render, screen } from "@testing-library/react";
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

  it("renders structured planning questions instead of raw JSON", async () => {
    render(
      <BuildStageCard
        stage={stage}
        totalStages={15}
        planningAssistLabel="Ask planning questions with Codex"
        planningAssistResponseLabel="Codex planning notes"
        onPlanningAssist={vi.fn().mockResolvedValue(
          JSON.stringify([
            {
              question: "What camera format is the first playable using?",
              rationale: "This affects visibility and encounter readability."
            }
          ])
        )}
        onStatusChange={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /ask planning questions with codex/i }));

    expect(await screen.findByText("Question 1")).toBeInTheDocument();
    expect(
      screen.getByText("What camera format is the first playable using?")
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/\[\s*\{/)
    ).not.toBeInTheDocument();
  });

  it("lets the user answer stage planning questions inline", async () => {
    render(
      <BuildStageCard
        stage={stage}
        totalStages={15}
        planningAssistLabel="Ask planning questions with Codex"
        planningAssistResponseLabel="Codex planning notes"
        onPlanningAssist={vi.fn().mockResolvedValue(
          JSON.stringify([
            {
              question: "What camera format is the first playable using?",
              rationale: "This affects visibility and encounter readability."
            }
          ])
        )}
        onStatusChange={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /ask planning questions with codex/i }));

    const answerField = await screen.findByPlaceholderText(
      /type your answer here/i
    );
    fireEvent.change(answerField, { target: { value: "Over-the-shoulder third-person." } });

    expect(answerField).toHaveValue("Over-the-shoulder third-person.");
    expect(
      screen.getByText(/answers stay on this stage card and do not need a separate submit/i)
    ).toBeInTheDocument();
  });
});
