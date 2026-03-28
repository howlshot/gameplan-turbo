import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OutputLibraryPage } from "@/pages/workspace/OutputLibraryPage";
import type { BuildStage, GameDesignDoc, Project } from "@/types";

vi.mock("react-router-dom", () => ({
  useParams: () => ({ projectId: "project-1" }),
  useNavigate: () => vi.fn(),
  useLocation: () => ({ search: "?tab=output-library&output=full_gdd" })
}));

vi.mock("@/hooks/useToast", () => ({
  useToast: () => ({
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn()
  })
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
        scopeCategory: "small",
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
          scopeCategory: "small",
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
    stages: [
      {
        id: "stage-1",
        projectId: "project-1",
        stageKey: "foundation",
        stageNumber: 1,
        name: "Foundation",
        description: "Bootstrap the project.",
        status: "not-started",
        promptContent: "Prompt",
        platform: "codex",
        createdAt: 1,
        updatedAt: 1
      }
    ] satisfies BuildStage[]
  })
}));

vi.mock("@/hooks/useVaultFiles", () => ({
  useVaultFiles: () => ({
    files: []
  })
}));

vi.mock("@/hooks/useArtifacts", () => ({
  useArtifacts: () => ({
    artifacts: [],
    createArtifact: vi.fn(),
    getLatestByType: () => null
  })
}));

vi.mock("@/components/shared/OutputPanel", () => ({
  OutputPanel: () => <div>output-panel</div>
}));

vi.mock("@/stores/promptLabSessionStore", () => ({
  usePromptLabSessionStore: (selector: (state: unknown) => unknown) =>
    selector({
      sessions: {
        "project-1": {
          hasSkippedClarifyingRound: false,
          hasSkippedVaultPreflight: false,
          planningQuestions: [
            {
              id: "planning-question-1",
              question: "What is the first playable target?",
              rationale: "Scope clarity matters.",
              answer: "One floor slice."
            }
          ],
          targetPlatform: "codex"
        }
      },
      setTargetPlatform: vi.fn()
    })
}));

describe("OutputLibraryPage", () => {
  it("shows the output library export message and planning package action", () => {
    render(<OutputLibraryPage />);

    expect(
      screen.getByRole("heading", { name: "Output Library" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/download individual files from each output panel here/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /export planning package/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /connect ai to generate/i })
    ).toBeInTheDocument();
  });
});
