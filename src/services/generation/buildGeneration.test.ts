import { describe, expect, it } from "vitest";
import { generateBuildStages } from "@/services/generation/buildGeneration";
import type { GameDesignDoc, Project } from "@/types";

const createProject = (scopeCategory: Project["scopeCategory"]): Project => ({
  id: "project-1",
  title: "Nightline",
  name: "Nightline",
  oneLinePitch: "A staged action game.",
  description: "A staged action game.",
  status: "concept",
  scopeCategory,
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
});

const createGameDesignDoc = (scopeCategory: Project["scopeCategory"]): GameDesignDoc => ({
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
    scopeCategory,
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
});

describe("generateBuildStages", () => {
  it("uses the expanded large-project stage sequence", async () => {
    const project = createProject("large");
    const gameDesignDoc = createGameDesignDoc("large");

    const stages = await generateBuildStages({
      gameDesignDoc,
      project,
      targetPlatform: "codex"
    });

    expect(stages).toHaveLength(15);
    expect(stages[0]?.stageKey).toBe("scope-lock");
    expect(stages[stages.length - 1]?.stageKey).toBe("qa-release-prep");
    expect(stages[0]?.promptContent).toContain("## Large Project Mode Requirements");
    expect(stages[0]?.promptContent).toContain("cut boundary");
  });

  it("applies light template bias for new starter modes", async () => {
    const project = {
      ...createProject("small"),
      genre: "Platformer",
      subgenre: "Action Platformer",
      templateId: "platformer" as const
    };
    const gameDesignDoc = {
      ...createGameDesignDoc("small"),
      concept: {
        ...createGameDesignDoc("small").concept,
        genre: "Platformer",
        subgenre: "Action Platformer"
      }
    };

    const stages = await generateBuildStages({
      gameDesignDoc,
      project,
      targetPlatform: "codex"
    });

    const cameraStage = stages.find((stage) => stage.stageKey === "camera-movement");

    expect(cameraStage?.promptContent).toContain("jump feel");
    expect(cameraStage?.promptContent).toContain("landing zones");
  });

  it("threads clarifying notes into generated roadmap briefs", async () => {
    const project = createProject("small");
    const gameDesignDoc = createGameDesignDoc("small");

    const stages = await generateBuildStages({
      gameDesignDoc,
      planningNotes: "Question: What is the target run length?\nAnswer: Keep it under 25 minutes.",
      project,
      targetPlatform: "codex"
    });

    expect(stages[0]?.promptContent).toContain("Clarifying Notes");
    expect(stages[0]?.promptContent).toContain("Keep it under 25 minutes");
  });
});
