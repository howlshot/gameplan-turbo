import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { VisualRoadmapPage } from "@/pages/workspace/VisualRoadmapPage";
import type { BuildStage } from "@/types";

const {
  navigate,
  toastSuccess,
  reorderStages,
  updateStage,
  updateStageStatus,
  exportAllPrompts
} = vi.hoisted(() => ({
  navigate: vi.fn(),
  toastSuccess: vi.fn(),
  reorderStages: vi.fn(),
  updateStage: vi.fn(),
  updateStageStatus: vi.fn(),
  exportAllPrompts: vi.fn()
}));

let stagesValue: BuildStage[] = [];

const buildStages = (): BuildStage[] => [
  {
    id: "stage-1",
    projectId: "project-1",
    stageKey: "foundation",
    stageNumber: 1,
    name: "Foundation",
    description: "Set up the technical base.",
    status: "not-started",
    promptContent: "Prompt 1",
    platform: "codex",
    createdAt: 1,
    updatedAt: 1
  },
  {
    id: "stage-2",
    projectId: "project-1",
    stageKey: "first-playable",
    stageNumber: 2,
    name: "First Playable",
    description: "Prove one loop.",
    status: "in-progress",
    promptContent: "Prompt 2",
    platform: "codex",
    createdAt: 1,
    updatedAt: 1
  }
];

vi.mock("react-router-dom", () => ({
  useParams: () => ({ projectId: "project-1" }),
  useNavigate: () => navigate
}));

vi.mock("@/hooks/useProject", () => ({
  useProject: () => ({
    project: {
      id: "project-1",
      title: "Nightline"
    }
  })
}));

vi.mock("@/hooks/useToast", () => ({
  useToast: () => ({
    success: toastSuccess
  })
}));

vi.mock("@/hooks/useBuildStages", () => ({
  useBuildStages: () => ({
    stages: stagesValue,
    reorderStages,
    updateStage,
    updateStageStatus
  })
}));

vi.mock("@/services/generation/buildGeneration", () => ({
  exportAllPrompts
}));

describe("VisualRoadmapPage", () => {
  beforeEach(() => {
    stagesValue = buildStages();
    navigate.mockReset();
    toastSuccess.mockReset();
    reorderStages.mockReset();
    updateStage.mockReset();
    updateStageStatus.mockReset();
    exportAllPrompts.mockReset();
  });

  it("renders the existing roadmap and saves inline field edits", async () => {
    render(<VisualRoadmapPage />);

    expect(screen.getByDisplayValue("Foundation")).toBeInTheDocument();

    const nameField = screen.getByDisplayValue("Foundation");
    fireEvent.change(nameField, { target: { value: "Foundation Revised" } });
    fireEvent.blur(nameField);

    await waitFor(() => {
      expect(updateStage).toHaveBeenCalledWith("stage-1", {
        name: "Foundation Revised"
      });
    });
  });

  it("updates stage status and order on the fly", async () => {
    render(<VisualRoadmapPage />);

    fireEvent.change(screen.getAllByRole("combobox")[0], {
      target: { value: "complete" }
    });

    await waitFor(() => {
      expect(updateStageStatus).toHaveBeenCalledWith("stage-1", "complete");
    });

    fireEvent.click(screen.getAllByRole("button", { name: /move later/i })[0]);

    await waitFor(() => {
      expect(reorderStages).toHaveBeenCalledWith(["stage-2", "stage-1"]);
    });
  });
});
