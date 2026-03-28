import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PromptLabPage } from "@/pages/workspace/PromptLabPage";
import type { BuildStage, GameDesignDoc, Project } from "@/types";

let defaultProviderValue: { provider: string } | null = null;

vi.mock("react-router-dom", () => ({
  useParams: () => ({ projectId: "project-1" }),
  useNavigate: () => vi.fn()
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
    defaultProvider: defaultProviderValue
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
    artifacts: []
  })
}));

vi.mock("@/stores/promptLabSessionStore", () => ({
  usePromptLabSessionStore: (selector: (state: unknown) => unknown) =>
    selector({
      sessions: {
        "project-1": {
          hasSkippedClarifyingRound: true,
          hasSkippedVaultPreflight: false,
          planningQuestions: [],
          targetPlatform: "codex"
        }
      },
      setPlanningQuestions: vi.fn(),
      setHasSkippedVaultPreflight: vi.fn(),
      setHasSkippedClarifyingRound: vi.fn(),
      setTargetPlatform: vi.fn()
    })
}));

describe("PromptLabPage", () => {
  it("shows the guided planning roadmap workflow without the old internal view switcher", () => {
    defaultProviderValue = null;
    render(<PromptLabPage />);

    expect(screen.getByText("Build Roadmap")).toBeInTheDocument();
    expect(screen.getByText("Add references before you generate")).toBeInTheDocument();
    expect(
      screen.getByText(/you can export a full planning package here/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /build roadmap/i })
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /connect ai to generate/i }).length
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", { name: /export planning package/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Large Project Mode")).toBeInTheDocument();
    expect(screen.queryByText("Output Library")).not.toBeInTheDocument();
  });

  it("uses the connected provider name in planning actions while keeping stage recommendations separate", () => {
    defaultProviderValue = { provider: "claude-code" };

    render(<PromptLabPage />);

    expect(
      screen.getAllByRole("button", { name: /ask planning questions with claude code/i })
        .length
    ).toBeGreaterThan(0);
    expect(screen.getByText(/planning help here uses your connected ai:/i)).toBeInTheDocument();
    expect(screen.getAllByText(/recommended tool: codex/i).length).toBeGreaterThan(0);
  });
});
