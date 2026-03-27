import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PromptLabPage } from "@/pages/workspace/PromptLabPage";
import type { BuildStage, GameDesignDoc, Project } from "@/types";

vi.mock("react-router-dom", () => ({
  useParams: () => ({ projectId: "project-1" })
}));

vi.mock("@/hooks/useToast", () => ({
  useToast: () => ({
    error: vi.fn(),
    success: vi.fn()
  })
}));

vi.mock("@/components/shared/OutputPanel", () => ({
  OutputPanel: () => <div>output-panel</div>
}));

vi.mock("@/hooks/useProject", () => ({
  useProject: () =>
    ({
      project: {
        id: "project-1",
        title: "Nightline",
        name: "Nightline",
        oneLinePitch: "A staged action game.",
        description: "A staged action game.",
        status: "concept",
        scopeCategory: "large",
        genre: "Action",
        subgenre: "Rail Shooter",
        platformTargets: ["pc"],
        agentTargets: ["codex"],
        targetPlatforms: ["codex"],
        targetAudience: "Action players",
        sessionLength: "10-20 minutes",
        monetizationModel: "Premium",
        comparableGames: [],
        templateId: "blank-game-project",
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
          oneLinePitch: "A staged action game.",
          playerFantasy: "Be a precision action specialist.",
          genre: "Action",
          subgenre: "Rail Shooter",
          platformTargets: ["pc"],
          targetAudience: "Action players",
          sessionLength: "10-20 minutes",
          monetizationModel: "Premium",
          comparableGames: [],
          scopeCategory: "large",
          differentiators: "Strong readability."
        },
        designPillars: {
          pillars: ["Readable threats"],
          feelStatement: "Snappy",
          antiGoals: ["No bloat"],
          emotionalTargets: ["Urgency"],
          readabilityPrinciples: "Readable at a glance."
        },
        coreLoop: {
          secondToSecond: "Aim and fire.",
          minuteToMinute: "Survive waves.",
          sessionLoop: "Complete missions.",
          longTermProgression: "Unlock upgrades.",
          failureStates: "Lose health.",
          rewardCadence: "Frequent."
        },
        controlsFeel: {
          controlScheme: "Aim and fire",
          cameraRules: "Authored rails",
          movementPhilosophy: "Player owns actions",
          combatFeelGoals: "Immediate impact",
          responsivenessStandards: "Fast",
          platformInputNotes: "PC pad and mouse",
          accessibilityConsiderations: "High contrast"
        },
        contentBible: {
          playerVerbs: "Aim, fire, reload",
          enemies: "Basic enemies",
          weaponsAbilities: "Pistol",
          encounters: "Scripted waves",
          levelsMissions: "One city mission",
          bossesSpecialEvents: "Boss set piece",
          pickupsRewards: "Score stars",
          uiHudElements: "Reticle and health"
        },
        artTone: {
          artDirection: "Stylized realism",
          toneKeywords: ["clean"],
          visualReferences: [],
          negativeReferences: [],
          animationStyle: "Snappy",
          vfxDirection: "Readable",
          audioMusicDirection: "Arcade"
        },
        technicalDesign: {
          engine: "Godot",
          renderingConstraints: "",
          targetFramerate: "60 FPS",
          memoryPerformanceBudget: "",
          saveSystem: "",
          contentPipeline: "Imported scenes and prefabs",
          namingConventions: "",
          folderStructure: "",
          platformConstraints: "Mid-range mobile and PC"
        },
        updatedAt: 1
      } satisfies GameDesignDoc
    })
}));

vi.mock("@/hooks/useBuildStages", () => ({
  useBuildStages: () =>
    ({
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
      })) satisfies BuildStage[]
    })
}));

vi.mock("@/hooks/useVaultFiles", () => ({
  useVaultFiles: () => ({ files: [] })
}));

vi.mock("@/hooks/useArtifacts", () => ({
  useArtifacts: () => ({
    artifacts: [],
    createArtifact: vi.fn(),
    getLatestByType: () => null
  })
}));

describe("PromptLabPage", () => {
  it("shows the large-project mode callout and legacy-plan note", () => {
    render(<PromptLabPage />);

    expect(screen.getByText("Large Project Mode")).toBeInTheDocument();
    expect(
      screen.getByText(/align staged implementation prompts with Large Project Mode/i)
    ).toBeInTheDocument();
  });
});
