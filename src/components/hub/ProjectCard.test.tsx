import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProjectCard } from "@/components/hub/ProjectCard";

const navigate = vi.fn();
const updateProject = vi.fn();
const successToast = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => navigate
}));

vi.mock("@/hooks/useProjects", () => ({
  useProjects: () => ({
    updateProject
  })
}));

vi.mock("@/hooks/useToast", () => ({
  useToast: () => ({
    success: successToast
  })
}));

vi.mock("@/hooks/useArtifacts", () => ({
  useArtifacts: () => ({
    artifacts: []
  })
}));

vi.mock("@/hooks/useBuildStages", () => ({
  useBuildStages: () => ({
    stages: [
      {
        id: "stage-1",
        projectId: "project-1",
        stageKey: "foundation",
        stageNumber: 1,
        name: "Foundation",
        description: "desc",
        status: "in-progress",
        promptContent: "prompt",
        platform: "codex",
        createdAt: 1,
        updatedAt: 1
      }
    ]
  })
}));

vi.mock("@/hooks/useGameDesignDoc", () => ({
  useGameDesignDoc: () => ({
    gameDesignDoc: {
      designPillars: {
        pillars: ["Readable fear"],
        feelStatement: "",
        antiGoals: [],
        emotionalTargets: [],
        readabilityPrinciples: ""
      },
      coreLoop: {
        secondToSecond: "",
        minuteToMinute: "",
        sessionLoop: "",
        longTermProgression: "",
        failureStates: "",
        rewardCadence: ""
      },
      controlsFeel: {
        controlScheme: "",
        cameraRules: "",
        movementPhilosophy: "",
        combatFeelGoals: "",
        responsivenessStandards: "",
        platformInputNotes: "",
        accessibilityConsiderations: ""
      }
    }
  })
}));

vi.mock("@/stores/projectStore", () => ({
  useProjectStore: (selector: (state: unknown) => unknown) =>
    selector({
      selectProject: vi.fn()
    })
}));

describe("ProjectCard", () => {
  it("shows manual phase controls and applies the suggested phase", async () => {
    render(
      <ProjectCard
        project={{
          id: "project-1",
          title: "Nightline Zero",
          name: "Nightline Zero",
          oneLinePitch: "Escape one haunted floor.",
          description: "",
          status: "preproduction",
          scopeCategory: "small",
          genre: "Horror",
          subgenre: "Action Horror",
          platformTargets: ["pc"],
          agentTargets: ["codex"],
          targetPlatforms: ["codex"],
          targetAudience: "",
          sessionLength: "",
          monetizationModel: "",
          comparableGames: [],
          templateId: "survival-horror-lite",
          enginePreference: "",
          techStack: [],
          createdAt: 1,
          updatedAt: 1
        }}
      />
    );

    expect(screen.getByRole("button", { name: "Back" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Advance" })).toBeEnabled();
    expect(screen.getByText("Suggested Next Phase")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Use Suggestion" }));

    await waitFor(() => {
      expect(updateProject).toHaveBeenCalledWith("project-1", {
        status: "production"
      });
    });
  });

  it("disables manual phase movement at the ends of the lifecycle", () => {
    const { rerender } = render(
      <ProjectCard
        project={{
          id: "project-2",
          title: "Concept",
          name: "Concept",
          oneLinePitch: "",
          description: "",
          status: "concept",
          scopeCategory: "small",
          genre: "",
          subgenre: "",
          platformTargets: ["pc"],
          agentTargets: ["codex"],
          targetPlatforms: ["codex"],
          targetAudience: "",
          sessionLength: "",
          monetizationModel: "",
          comparableGames: [],
          templateId: "blank-game-project",
          enginePreference: "",
          techStack: [],
          createdAt: 1,
          updatedAt: 1
        }}
      />
    );

    expect(screen.getByRole("button", { name: "Back" })).toBeDisabled();

    rerender(
      <ProjectCard
        project={{
          id: "project-3",
          title: "Release Prep",
          name: "Release Prep",
          oneLinePitch: "",
          description: "",
          status: "release-prep",
          scopeCategory: "small",
          genre: "",
          subgenre: "",
          platformTargets: ["pc"],
          agentTargets: ["codex"],
          targetPlatforms: ["codex"],
          targetAudience: "",
          sessionLength: "",
          monetizationModel: "",
          comparableGames: [],
          templateId: "blank-game-project",
          enginePreference: "",
          techStack: [],
          createdAt: 1,
          updatedAt: 1
        }}
      />
    );

    expect(screen.getByRole("button", { name: "Advance" })).toBeDisabled();
  });
});
