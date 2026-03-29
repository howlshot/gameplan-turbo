import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PromptLabPage } from "@/pages/workspace/PromptLabPage";
import type { BuildStage, GameDesignDoc, Project } from "@/types";

const {
  navigate,
  successToast,
  errorToast,
  warningToast,
  createStages,
  replaceStages,
  updateStageStatus,
  generateWithAgent,
  exportAllPrompts,
  setPlanningQuestions,
  setHasSkippedVaultPreflight,
  setHasSkippedClarifyingRound,
  setTargetPlatform
} = vi.hoisted(() => ({
  navigate: vi.fn(),
  successToast: vi.fn(),
  errorToast: vi.fn(),
  warningToast: vi.fn(),
  createStages: vi.fn(),
  replaceStages: vi.fn(),
  updateStageStatus: vi.fn(),
  generateWithAgent: vi.fn(),
  exportAllPrompts: vi.fn(),
  setPlanningQuestions: vi.fn(),
  setHasSkippedVaultPreflight: vi.fn(),
  setHasSkippedClarifyingRound: vi.fn(),
  setTargetPlatform: vi.fn()
}));

let defaultProviderValue: { provider: string } | null = null;

const stageKeys = [
  "scope-lock",
  "foundation",
  "first-playable",
  "core-controls"
] as const;

const buildStages = (): BuildStage[] =>
  stageKeys.map((stageKey, index) => ({
    id: `stage-${index + 1}`,
    projectId: "project-1",
    stageKey,
    stageNumber: index + 1,
    name:
      stageKey === "scope-lock"
        ? "Scope Lock"
        : stageKey === "foundation"
          ? "Foundation"
          : stageKey === "first-playable"
            ? "First Playable"
            : "Core Controls",
    description: `Description ${index + 1}`,
    status: index === 0 ? "not-started" : "locked",
    promptContent: `Prompt ${index + 1}`,
    platform: "codex",
    createdAt: 1,
    updatedAt: 1
  }));

let stagesValue: BuildStage[] = buildStages();

const generatedDraftStages = stageKeys.map((stageKey, index) => ({
  id: `generated-${index + 1}`,
  stageKey,
  stageNumber: index + 1,
  name: `Generated ${index + 1}`,
  description: `Generated description ${index + 1}`,
  status: index === 0 ? "not-started" : "locked",
  promptContent: `Generated prompt ${index + 1}`,
  platform: "codex",
  createdAt: 1,
  updatedAt: 1
}));

vi.mock("react-router-dom", () => ({
  useParams: () => ({ projectId: "project-1" }),
  useNavigate: () => navigate
}));

vi.mock("@/hooks/useToast", () => ({
  useToast: () => ({
    error: errorToast,
    success: successToast,
    warning: warningToast
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
    stages: stagesValue,
    createStages,
    replaceStages,
    updateStageStatus
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
      setPlanningQuestions,
      setHasSkippedVaultPreflight,
      setHasSkippedClarifyingRound,
      setTargetPlatform
    })
}));

vi.mock("@/services/ai", () => ({
  generateWithAgent
}));

vi.mock("@/services/generation/buildGeneration", () => ({
  exportAllPrompts,
  generateBuildStages: vi.fn(async () => generatedDraftStages),
  serializeBuildStages: (stages: BuildStage[]) =>
    stages.map((stage) => `${stage.stageNumber}. ${stage.name}`).join("\n")
}));

describe("PromptLabPage", () => {
  beforeEach(() => {
    defaultProviderValue = null;
    stagesValue = buildStages();
    createStages.mockReset();
    replaceStages.mockReset();
    updateStageStatus.mockReset();
    generateWithAgent.mockReset();
    exportAllPrompts.mockReset();
    navigate.mockReset();
    successToast.mockReset();
    errorToast.mockReset();
    warningToast.mockReset();
  });

  it("shows the guided planning roadmap workflow without the old internal view switcher", () => {
    render(<PromptLabPage />);

    expect(screen.getByText("Build Roadmap")).toBeInTheDocument();
    expect(screen.getByText("Add references before you generate")).toBeInTheDocument();
    expect(
      screen.getByText(/you can export a full planning package here/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /regenerate build roadmap/i })
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /connect ai to generate/i }).length
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", { name: /export planning package/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Large Project Mode")).toBeInTheDocument();
    expect(screen.queryByText("Guided Planning")).not.toBeInTheDocument();
  });

  it("uses the connected provider name in roadmap polish actions while keeping recommendations separate", () => {
    defaultProviderValue = { provider: "claude-code" };

    render(<PromptLabPage />);

    expect(
      screen.getAllByRole("button", { name: /polish with claude code/i }).length
    ).toBeGreaterThan(0);
    expect(
      screen.getByText(/planning help here uses your connected ai:/i)
    ).toBeInTheDocument();
    expect(screen.getAllByText(/recommended tool: codex/i).length).toBeGreaterThan(0);
  });

  it("creates a regeneration draft instead of overwriting the current roadmap immediately", async () => {
    render(<PromptLabPage />);

    fireEvent.click(
      screen.getByRole("button", { name: /regenerate build roadmap/i })
    );

    expect(
      await screen.findByRole("heading", { name: /regenerated roadmap draft/i })
    ).toBeInTheDocument();
    expect(createStages).not.toHaveBeenCalled();
    expect(replaceStages).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /apply draft/i }));

    await waitFor(() => {
      expect(replaceStages).toHaveBeenCalledTimes(1);
    });
  });

  it("creates a polished roadmap draft without overwriting the current roadmap immediately", async () => {
    defaultProviderValue = { provider: "claude-code" };
    generateWithAgent.mockResolvedValue(
      JSON.stringify({
        summary: "Tighten the first four stages before content spread expands.",
        sequencingIssues: ["Move controls validation before content work."],
        risks: ["Current stage order proves content too early."],
        scopeCuts: ["Defer advanced camera variants until after first playable."],
        revisedStages: stagesValue.map((stage) => ({
          stageKey: stage.stageKey,
          name: `${stage.name} Revised`,
          description: `${stage.description} Revised`,
          promptContent: `${stage.promptContent} Revised`,
          platform: stage.platform
        }))
      })
    );

    render(<PromptLabPage />);

    fireEvent.click(screen.getAllByRole("button", { name: /polish with claude code/i })[0]);

    expect(
      await screen.findByRole("heading", { name: /polished roadmap draft/i })
    ).toBeInTheDocument();
    expect(replaceStages).not.toHaveBeenCalled();
    expect(screen.getByText(/move controls validation before content work/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /apply draft/i }));

    await waitFor(() => {
      expect(replaceStages).toHaveBeenCalledTimes(1);
    });
  });
});
