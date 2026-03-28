import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PromptLabPage } from "@/pages/workspace/PromptLabPage";
import type { BuildStage, GameDesignDoc, Project } from "@/types";

let locationSearch = "";

vi.mock("react-router-dom", () => ({
  useParams: () => ({ projectId: "project-1" }),
  useNavigate: () => vi.fn(),
  useLocation: () => ({ search: locationSearch })
}));

vi.mock("@/hooks/useToast", () => ({
  useToast: () => ({
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn()
  })
}));

vi.mock("@/components/shared/OutputPanel", () => ({
  OutputPanel: () => <div>output-panel</div>
}));

vi.mock("@/hooks/useAIProviders", () => ({
  useAIProviders: () => ({
    defaultProvider: null
  })
}));

vi.mock("@/hooks/useProject", () => ({
  useProject: () =>
    ({
      project: {
        id: "project-1",
        title: "Nightline",
        name: "Nightline",
        oneLinePitch: "A staged horror game.",
        description: "A staged horror game.",
        status: "concept",
        scopeCategory: "large",
        genre: "Horror",
        subgenre: "Action Horror",
        platformTargets: ["pc"],
        agentTargets: ["codex"],
        targetPlatforms: ["codex"],
        targetAudience: "Horror players",
        sessionLength: "20-40 minutes",
        monetizationModel: "Premium",
        comparableGames: [],
        templateId: "survival-horror-lite",
        enginePreference: "Godot",
        techStack: [],
        createdAt: 1,
        updatedAt: 1
      } satisfies Project
    })
}));

vi.mock("@/hooks/useGameDesignDoc", () => ({
  useGameDesignDoc: () =>
    ({
      gameDesignDoc: {
        id: "doc-1",
        projectId: "project-1",
        concept: {
          gameTitle: "Nightline",
          oneLinePitch: "A staged horror game.",
          playerFantasy: "Survive one brutal night.",
          genre: "Horror",
          subgenre: "Action Horror",
          platformTargets: ["pc"],
          targetAudience: "Horror players",
          sessionLength: "20-40 minutes",
          monetizationModel: "Premium",
          comparableGames: [],
          scopeCategory: "large",
          differentiators: "Readable tension."
        },
        designPillars: {
          pillars: ["Readable threats"],
          feelStatement: "Tense",
          antiGoals: ["No bloat"],
          emotionalTargets: ["Dread"],
          readabilityPrinciples: "Readable at a glance."
        },
        coreLoop: {
          secondToSecond: "Move, react, survive.",
          minuteToMinute: "Clear rooms.",
          sessionLoop: "Reach safe rooms.",
          longTermProgression: "Unlock tools.",
          failureStates: "Lose health.",
          rewardCadence: "Sparse."
        },
        controlsFeel: {
          controlScheme: "Move and interact",
          cameraRules: "Tension with clarity",
          movementPhilosophy: "Deliberate",
          combatFeelGoals: "Costly combat",
          responsivenessStandards: "Reliable",
          platformInputNotes: "Controller first",
          accessibilityConsiderations: "High contrast"
        },
        contentBible: {
          playerVerbs: "Move, hide, react",
          enemies: "Two enemy families",
          weaponsAbilities: "Improvised tools",
          encounters: "Room-based pressure",
          levelsMissions: "One station chapter",
          bossesSpecialEvents: "One major escalation",
          pickupsRewards: "Ammo and keys",
          uiHudElements: "Health and prompts"
        },
        artTone: {
          artDirection: "Claustrophobic realism",
          toneKeywords: ["oppressive"],
          visualReferences: [],
          negativeReferences: [],
          animationStyle: "Grounded",
          vfxDirection: "Minimal",
          audioMusicDirection: "Sparse"
        },
        technicalDesign: {
          engine: "Godot",
          renderingConstraints: "",
          targetFramerate: "60 FPS",
          memoryPerformanceBudget: "",
          saveSystem: "",
          contentPipeline: "Scene-based",
          namingConventions: "",
          folderStructure: "",
          platformConstraints: "PC only"
        },
        updatedAt: 1
      } satisfies GameDesignDoc
    })
}));

vi.mock("@/hooks/useBuildStages", () => ({
  useBuildStages: () => ({
    stages: Array.from({ length: 12 }, (_, index) => ({
      id: `stage-${index + 1}`,
      projectId: "project-1",
      stageKey: "foundation",
      stageNumber: index + 1,
      name: `Stage ${index + 1}`,
      description: "Legacy stage",
      status: index === 0 ? "not-started" : "locked",
      promptContent: "Prompt",
      platform: "codex",
      createdAt: 1,
      updatedAt: 1
    })) satisfies BuildStage[],
    createStages: vi.fn(),
    updateStageStatus: vi.fn()
  })
}));

vi.mock("@/hooks/useVaultFiles", () => ({
  useVaultFiles: () => ({
    files: [],
    setAllFilesAsContext: vi.fn()
  })
}));

vi.mock("@/hooks/useArtifacts", () => ({
  useArtifacts: () => ({
    artifacts: [],
    createArtifact: vi.fn(),
    getLatestByType: () => null
  })
}));

describe("PromptLabPage", () => {
  beforeEach(() => {
    locationSearch = "";
  });

  it("defaults to guided planning and shows the roadmap-focused workflow", () => {
    render(<PromptLabPage />);

    expect(screen.getByText("Guided Planning")).toBeInTheDocument();
    expect(screen.getByText("Build Roadmap")).toBeInTheDocument();
    expect(screen.getByText("Add references before you generate")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /build roadmap/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Large Project Mode")).toBeInTheDocument();
  });

  it("shows the output library when the prompt-lab view is set to library", () => {
    locationSearch = "?tab=prompt-lab&view=library";

    render(<PromptLabPage />);

    expect(screen.getByText("Prompt Lab Output")).toBeInTheDocument();
    expect(screen.getAllByText("Output Library").length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/Typical generation takes around a minute/i).length
    ).toBeGreaterThan(0);
  });
});
