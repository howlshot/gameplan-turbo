import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TechnicalDesignPage } from "@/pages/workspace/TechnicalDesignPage";
import type { GameDesignDoc, Project } from "@/types";

let currentProject: Project | null = null;
let currentGameDesignDoc: GameDesignDoc | null = null;

const mocks = vi.hoisted(() => ({
  updateGameDesignDoc: vi.fn(),
  updateProject: vi.fn()
}));

vi.mock("react-router-dom", () => ({
  useParams: () => ({ projectId: "project-1" }),
  useNavigate: () => vi.fn()
}));

vi.mock("@/hooks/useProject", () => ({
  useProject: () => ({
    project: currentProject
  })
}));

vi.mock("@/hooks/useProjects", () => ({
  useProjects: () => ({
    updateProject: mocks.updateProject
  })
}));

vi.mock("@/hooks/useGameDesignDoc", () => ({
  useGameDesignDoc: () => ({
    gameDesignDoc: currentGameDesignDoc,
    updateGameDesignDoc: mocks.updateGameDesignDoc
  })
}));

describe("TechnicalDesignPage", () => {
  beforeEach(() => {
    mocks.updateGameDesignDoc.mockReset();
    mocks.updateProject.mockReset();

    currentProject = null;
    currentGameDesignDoc = null;
  });

  it("can transition from loading to loaded without a hook-order crash", () => {
    const view = render(<TechnicalDesignPage />);

    expect(
      screen.getByText(/Loading technical design workspace/i)
    ).toBeInTheDocument();

    currentProject = {
      id: "project-1",
      title: "Night Watch",
      name: "Night Watch",
      oneLinePitch: "A tense survival prototype.",
      description: "A tense survival prototype.",
      status: "concept",
      scopeCategory: "small",
      genre: "Horror",
      subgenre: "Survival Horror",
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
    };

    currentGameDesignDoc = {
      id: "doc-1",
      projectId: "project-1",
      concept: {
        gameTitle: "Night Watch",
        oneLinePitch: "A tense survival prototype.",
        playerFantasy: "Survive the station.",
        genre: "Horror",
        subgenre: "Survival Horror",
        platformTargets: ["pc"],
        targetAudience: "Horror players",
        sessionLength: "20-40 minutes",
        monetizationModel: "Premium",
        comparableGames: [],
        scopeCategory: "small",
        differentiators: "Compact tension loop."
      },
      designPillars: {
        pillars: [],
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
      },
      contentBible: {
        playerVerbs: "",
        enemies: "",
        weaponsAbilities: "",
        encounters: "",
        levelsMissions: "",
        bossesSpecialEvents: "",
        pickupsRewards: "",
        uiHudElements: ""
      },
      artTone: {
        artDirection: "",
        toneKeywords: [],
        visualReferences: [],
        negativeReferences: [],
        animationStyle: "",
        vfxDirection: "",
        audioMusicDirection: ""
      },
      technicalDesign: {
        engine: "Godot",
        renderingConstraints: "Mid-range PCs",
        targetFramerate: "60 FPS",
        memoryPerformanceBudget: "",
        saveSystem: "",
        contentPipeline: "",
        namingConventions: "",
        folderStructure: "",
        platformConstraints: ""
      },
      updatedAt: 1
    };

    view.rerender(<TechnicalDesignPage />);

    expect(
      screen.getByRole("combobox", { name: /Engine Preference/i })
    ).toHaveValue("Godot");
    expect(
      screen.getByDisplayValue("Mid-range PCs")
    ).toBeInTheDocument();
  });

  it("can fill blank technical fields with starter suggestions", () => {
    currentProject = {
      id: "project-1",
      title: "Night Watch",
      name: "Night Watch",
      oneLinePitch: "A tense survival prototype.",
      description: "A tense survival prototype.",
      status: "concept",
      scopeCategory: "small",
      genre: "Horror",
      subgenre: "Survival Horror",
      platformTargets: ["pc"],
      agentTargets: ["codex"],
      targetPlatforms: ["codex"],
      targetAudience: "Horror players",
      sessionLength: "20-40 minutes",
      monetizationModel: "Premium",
      comparableGames: [],
      templateId: "survival-horror-lite",
      enginePreference: "",
      techStack: [],
      createdAt: 1,
      updatedAt: 1
    };

    currentGameDesignDoc = {
      id: "doc-1",
      projectId: "project-1",
      concept: {
        gameTitle: "Night Watch",
        oneLinePitch: "A tense survival prototype.",
        playerFantasy: "Survive the station.",
        genre: "Horror",
        subgenre: "Survival Horror",
        platformTargets: ["pc"],
        targetAudience: "Horror players",
        sessionLength: "20-40 minutes",
        monetizationModel: "Premium",
        comparableGames: [],
        scopeCategory: "small",
        differentiators: "Compact tension loop."
      },
      designPillars: {
        pillars: [],
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
      },
      contentBible: {
        playerVerbs: "",
        enemies: "",
        weaponsAbilities: "",
        encounters: "",
        levelsMissions: "",
        bossesSpecialEvents: "",
        pickupsRewards: "",
        uiHudElements: ""
      },
      artTone: {
        artDirection: "",
        toneKeywords: [],
        visualReferences: [],
        negativeReferences: [],
        animationStyle: "",
        vfxDirection: "",
        audioMusicDirection: ""
      },
      technicalDesign: {
        engine: "",
        renderingConstraints: "",
        targetFramerate: "",
        memoryPerformanceBudget: "",
        saveSystem: "",
        contentPipeline: "",
        namingConventions: "",
        folderStructure: "",
        platformConstraints: ""
      },
      updatedAt: 1
    };

    render(<TechnicalDesignPage />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Fill blank fields with starter suggestions/i
      })
    );

    expect(mocks.updateGameDesignDoc).toHaveBeenCalledWith({
      technicalDesign: expect.objectContaining({
        contentPipeline: expect.stringMatching(/Author rooms, locks, item placement/i),
        folderStructure: expect.stringMatching(/Separate rooms, interactables, threats/i),
        namingConventions: expect.stringMatching(/Name rooms, locks, keys/i),
        saveSystem: expect.stringMatching(/Checkpoint or safe-room saves/i)
      })
    });
  });

  it("can mark all blank technical fields for later", () => {
    currentProject = {
      id: "project-1",
      title: "Night Watch",
      name: "Night Watch",
      oneLinePitch: "A tense survival prototype.",
      description: "A tense survival prototype.",
      status: "concept",
      scopeCategory: "small",
      genre: "Horror",
      subgenre: "Survival Horror",
      platformTargets: ["pc"],
      agentTargets: ["codex"],
      targetPlatforms: ["codex"],
      targetAudience: "Horror players",
      sessionLength: "20-40 minutes",
      monetizationModel: "Premium",
      comparableGames: [],
      templateId: "survival-horror-lite",
      enginePreference: "",
      techStack: [],
      createdAt: 1,
      updatedAt: 1
    };

    currentGameDesignDoc = {
      id: "doc-1",
      projectId: "project-1",
      concept: {
        gameTitle: "Night Watch",
        oneLinePitch: "A tense survival prototype.",
        playerFantasy: "Survive the station.",
        genre: "Horror",
        subgenre: "Survival Horror",
        platformTargets: ["pc"],
        targetAudience: "Horror players",
        sessionLength: "20-40 minutes",
        monetizationModel: "Premium",
        comparableGames: [],
        scopeCategory: "small",
        differentiators: "Compact tension loop."
      },
      designPillars: {
        pillars: [],
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
      },
      contentBible: {
        playerVerbs: "",
        enemies: "",
        weaponsAbilities: "",
        encounters: "",
        levelsMissions: "",
        bossesSpecialEvents: "",
        pickupsRewards: "",
        uiHudElements: ""
      },
      artTone: {
        artDirection: "",
        toneKeywords: [],
        visualReferences: [],
        negativeReferences: [],
        animationStyle: "",
        vfxDirection: "",
        audioMusicDirection: ""
      },
      technicalDesign: {
        engine: "",
        renderingConstraints: "",
        targetFramerate: "",
        memoryPerformanceBudget: "",
        saveSystem: "",
        contentPipeline: "",
        namingConventions: "",
        folderStructure: "",
        platformConstraints: ""
      },
      updatedAt: 1
    };

    render(<TechnicalDesignPage />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Mark all blank technical fields for later/i
      })
    );

    expect(mocks.updateGameDesignDoc).toHaveBeenCalledWith({
      technicalDesign: {
        renderingConstraints: expect.stringMatching(/Not sure yet/i),
        targetFramerate: expect.stringMatching(/Not sure yet/i),
        memoryPerformanceBudget: expect.stringMatching(/Not sure yet/i),
        saveSystem: expect.stringMatching(/Not sure yet/i),
        contentPipeline: expect.stringMatching(/Not sure yet/i),
        namingConventions: expect.stringMatching(/Not sure yet/i),
        folderStructure: expect.stringMatching(/Not sure yet/i),
        platformConstraints: expect.stringMatching(/Not sure yet/i)
      }
    });
  });
});
