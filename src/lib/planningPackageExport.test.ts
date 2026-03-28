import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { buildPlanningPackageBuffer } from "@/lib/planningPackageExport";
import type { BuildStage, GameDesignDoc, GeneratedArtifact, Project, VaultFile } from "@/types";

const project: Project = {
  id: "project-1",
  title: "Nightline Zero",
  name: "Nightline Zero",
  oneLinePitch: "A compact horror action game.",
  description: "A compact horror action game.",
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
};

const gameDesignDoc: GameDesignDoc = {
  id: "doc-1",
  projectId: "project-1",
  concept: {
    gameTitle: "Nightline Zero",
    oneLinePitch: "A compact horror action game.",
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
};

const stages: BuildStage[] = [
  {
    id: "stage-1",
    projectId: "project-1",
    stageKey: "foundation",
    stageNumber: 1,
    name: "Foundation",
    description: "Bootstrap the project.",
    status: "not-started",
    promptContent: "Build the foundation stage brief.",
    platform: "codex",
    createdAt: 1,
    updatedAt: 1
  }
];

const artifacts: GeneratedArtifact[] = [
  {
    id: "artifact-1",
    projectId: "project-1",
    type: "full_gdd",
    platform: "codex",
    content: "# Full GDD",
    contextNodes: [],
    agentSystemPromptId: "full-gdd-default",
    version: 1,
    charCount: 10,
    tokenEstimate: 3,
    createdAt: 1
  }
];

const vaultFiles: VaultFile[] = [
  {
    id: "vault-1",
    projectId: "project-1",
    name: "station-map.txt",
    size: 12,
    mimeType: "text/plain",
    category: "design-note",
    isActiveContext: true,
    data: (() => {
      const encoded = new TextEncoder().encode("sector a");
      return encoded.buffer.slice(
        encoded.byteOffset,
        encoded.byteOffset + encoded.byteLength
      );
    })(),
    uploadedAt: 1
  }
];

describe("buildPlanningPackageBuffer", () => {
  it("bundles design docs, roadmap, outputs, and references into one zip", async () => {
    const zipBuffer = await buildPlanningPackageBuffer({
      artifacts,
      gameDesignDoc,
      project,
      stages,
      vaultFiles
    });

    const zip = await JSZip.loadAsync(zipBuffer);
    const fileNames = Object.keys(zip.files);

    expect(fileNames).toContain("nightline-zero/README.md");
    expect(fileNames).toContain("nightline-zero/design/01-concept.md");
    expect(fileNames).toContain("nightline-zero/roadmap/BUILD_ROADMAP.md");
    expect(fileNames).toContain("nightline-zero/roadmap/stages/01-foundation.md");
    expect(fileNames).toContain("nightline-zero/outputs/FULL_GDD.md");
    expect(fileNames).toContain("nightline-zero/references/VAULT_CONTEXT.md");
    expect(fileNames).toContain("nightline-zero/references/files/01-station-map.txt");
  });
});
