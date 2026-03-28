import { APP_BUILD_PLAN_FILE_NAME } from "@/lib/brand";
import { downloadAsFile } from "@/lib/utils";
import {
  getBuildStageSequence,
  getTemplateDefinition
} from "@/lib/templates/genreTemplates";
import type { BuildStage, GameDesignDoc, Project } from "@/types";

interface GenerateBuildStagesInput {
  gameDesignDoc: GameDesignDoc;
  planningNotes?: string;
  project: Project;
  targetPlatform: string;
}

interface BuildStageDraft {
  createdAt: number;
  description: string;
  id: string;
  name: string;
  platform: string;
  promptContent: string;
  stageNumber: number;
  stageKey: BuildStage["stageKey"];
  status: BuildStage["status"];
  updatedAt: number;
}

const joinOrTbd = (values: string[]): string =>
  values.map((value) => value.trim()).filter(Boolean).join(" | ") || "TBD";

const buildProjectSnapshot = (
  project: Project,
  gameDesignDoc: GameDesignDoc
): string[] => [
  `- Project: ${project.title}`,
  `- Pitch: ${project.oneLinePitch || "TBD"}`,
  `- Genre: ${project.genre || "TBD"} / ${project.subgenre || "TBD"}`,
  `- Scope: ${project.scopeCategory}`,
  `- Typical Session: ${gameDesignDoc.concept.sessionLength || "TBD"}`
];

const buildSharedGuardrails = (
  project: Project,
  gameDesignDoc: GameDesignDoc
): string[] => [
  `- Protect these pillars: ${joinOrTbd(gameDesignDoc.designPillars.pillars)}`,
  `- Preserve this player fantasy: ${gameDesignDoc.concept.playerFantasy || "TBD"}`,
  `- Avoid these anti-goals: ${joinOrTbd(gameDesignDoc.designPillars.antiGoals)}`,
  `- Keep the gameplay expression centered on: ${gameDesignDoc.coreLoop.secondToSecond || "TBD"}`,
  `- Respect platform and technical constraints: ${gameDesignDoc.technicalDesign.platformConstraints || "TBD"}`,
  `- Keep monetization assumptions aligned with: ${project.monetizationModel || "TBD"}`
];

const buildStageRelevantNotes = (
  stageKey: BuildStage["stageKey"],
  gameDesignDoc: GameDesignDoc
): string[] => {
  const { artTone, contentBible, controlsFeel, coreLoop, designPillars, technicalDesign } =
    gameDesignDoc;

  switch (stageKey) {
    case "scope-lock":
      return [
        `- Differentiators and scope guardrails: ${gameDesignDoc.concept.differentiators || "TBD"}`,
        `- Anti-goals already identified: ${joinOrTbd(designPillars.antiGoals)}`,
        `- Target audience: ${gameDesignDoc.concept.targetAudience || "TBD"}`
      ];
    case "foundation":
      return [
        `- Engine/runtime: ${technicalDesign.engine || "TBD"}`,
        `- Folder structure: ${technicalDesign.folderStructure || "TBD"}`,
        `- Naming conventions: ${technicalDesign.namingConventions || "TBD"}`,
        `- Content pipeline: ${technicalDesign.contentPipeline || "TBD"}`
      ];
    case "first-playable":
      return [
        `- Session loop target: ${coreLoop.sessionLoop || "TBD"}`,
        `- Failure model: ${coreLoop.failureStates || "TBD"}`,
        `- First playable content slice: ${contentBible.levelsMissions || "TBD"}`,
        `- Required HUD elements: ${contentBible.uiHudElements || "TBD"}`
      ];
    case "core-controls":
      return [
        `- Control scheme: ${controlsFeel.controlScheme || "TBD"}`,
        `- Movement philosophy: ${controlsFeel.movementPhilosophy || "TBD"}`,
        `- Responsiveness standard: ${controlsFeel.responsivenessStandards || "TBD"}`,
        `- Platform input notes: ${controlsFeel.platformInputNotes || "TBD"}`
      ];
    case "camera-movement":
      return [
        `- Camera rules: ${controlsFeel.cameraRules || "TBD"}`,
        `- Movement philosophy: ${controlsFeel.movementPhilosophy || "TBD"}`,
        `- Readability principle: ${designPillars.readabilityPrinciples || "TBD"}`
      ];
    case "combat-feel":
      return [
        `- Combat feel goals: ${controlsFeel.combatFeelGoals || "TBD"}`,
        `- Weapons and abilities: ${contentBible.weaponsAbilities || "TBD"}`,
        `- Failure model: ${coreLoop.failureStates || "TBD"}`
      ];
    case "enemy-behavior":
      return [
        `- Enemy roster: ${contentBible.enemies || "TBD"}`,
        `- Encounter constraints: ${contentBible.encounters || "TBD"}`,
        `- Combat feel target: ${controlsFeel.combatFeelGoals || "TBD"}`
      ];
    case "encounter-scripting":
      return [
        `- Encounter scripting target: ${contentBible.encounters || "TBD"}`,
        `- Level or mission structure: ${contentBible.levelsMissions || "TBD"}`,
        `- Special events or bosses: ${contentBible.bossesSpecialEvents || "TBD"}`
      ];
    case "hud-feedback":
      return [
        `- UI/HUD elements: ${contentBible.uiHudElements || "TBD"}`,
        `- Accessibility constraints: ${controlsFeel.accessibilityConsiderations || "TBD"}`,
        `- Readability principles: ${designPillars.readabilityPrinciples || "TBD"}`
      ];
    case "progression-meta":
      return [
        `- Long-term progression: ${coreLoop.longTermProgression || "TBD"}`,
        `- Reward cadence: ${coreLoop.rewardCadence || "TBD"}`,
        `- Pickups and rewards: ${contentBible.pickupsRewards || "TBD"}`
      ];
    case "content-slice":
      return [
        `- Content slice target: ${contentBible.levelsMissions || "TBD"}`,
        `- Bosses or special events: ${contentBible.bossesSpecialEvents || "TBD"}`,
        `- Art direction guardrail: ${artTone.artDirection || "TBD"}`
      ];
    case "systems-foundation":
      return [
        `- Core loop foundation: ${coreLoop.secondToSecond || "TBD"}`,
        `- Save system needs: ${technicalDesign.saveSystem || "TBD"}`,
        `- Content pipeline dependency: ${technicalDesign.contentPipeline || "TBD"}`
      ];
    case "content-pipeline":
      return [
        `- Content pipeline: ${technicalDesign.contentPipeline || "TBD"}`,
        `- Folder structure: ${technicalDesign.folderStructure || "TBD"}`,
        `- Naming conventions: ${technicalDesign.namingConventions || "TBD"}`,
        `- Engine/runtime: ${technicalDesign.engine || "TBD"}`
      ];
    case "content-production":
      return [
        `- Production content target: ${contentBible.levelsMissions || "TBD"}`,
        `- Enemy and encounter breadth: ${contentBible.enemies || "TBD"} / ${contentBible.encounters || "TBD"}`,
        `- UI/HUD coverage: ${contentBible.uiHudElements || "TBD"}`
      ];
    case "vertical-slice-integration":
      return [
        `- Loop expression to prove: ${coreLoop.secondToSecond || "TBD"}`,
        `- Session loop to prove: ${coreLoop.sessionLoop || "TBD"}`,
        `- Art/tone integration target: ${artTone.artDirection || "TBD"}`
      ];
    case "polish":
      return [
        `- Art/tone polish target: ${artTone.artDirection || "TBD"}`,
        `- Audio/music direction: ${artTone.audioMusicDirection || "TBD"}`,
        `- Performance target: ${technicalDesign.targetFramerate || "TBD"}`
      ];
    case "packaging-release-prep":
    case "qa-release-prep":
      return [
        `- Platform constraints: ${technicalDesign.platformConstraints || "TBD"}`,
        `- Save system expectations: ${technicalDesign.saveSystem || "TBD"}`,
        `- Accessibility considerations: ${controlsFeel.accessibilityConsiderations || "TBD"}`
      ];
    default:
      return [
        `- Controls / feel: ${controlsFeel.combatFeelGoals || "TBD"}`,
        `- Encounter / content constraints: ${contentBible.encounters || "TBD"}`,
        `- Art / tone constraints: ${artTone.artDirection || "TBD"}`
      ];
  }
};

const LARGE_STAGE_DEFAULTS: Partial<Record<BuildStage["stageKey"], string>> = {
  "scope-lock":
    "Freeze the v1 promise, content ceilings, milestone assumptions, and explicit cut boundaries before production expands.",
  foundation:
    "Build a production-safe technical base with naming, foldering, and integration rules that can scale to a broader project.",
  "first-playable":
    "Prove the whole loop works with placeholders before asset-heavy production begins.",
  "core-controls":
    "Lock the input model, interaction cadence, and low-level responsiveness standards.",
  "camera-movement":
    "Define the movement and camera grammar every later encounter or mission beat will depend on.",
  "combat-feel":
    "Stabilize interaction feel so later systems and content tuning are not chasing a moving target.",
  "systems-foundation":
    "Establish reusable gameplay systems and dependency boundaries before scaling content.",
  "enemy-behavior":
    "Define reusable enemy and encounter foundations that production content can safely build on.",
  "hud-feedback":
    "Lock clarity and feedback rules so production content remains readable and consistent.",
  "progression-meta":
    "Build the progression spine without multiplying content obligations prematurely.",
  "content-pipeline":
    "Prove the asset and content pipeline can support a broader production surface without chaos.",
  "content-production":
    "Produce content against explicit budgets and dependency rules, not open-ended ambition.",
  "vertical-slice-integration":
    "Show that gameplay, content, pipeline, and presentation integrate cleanly into a representative slice.",
  polish:
    "Polish and optimize the locked production surface without reopening fundamental design decisions.",
  "qa-release-prep":
    "Verify readiness through QA, packaging, compatibility, and release-gate checks."
};

const buildLargeProjectRequirements = (
  project: Project,
  stageKey: BuildStage["stageKey"]
): string[] => {
  if (project.scopeCategory !== "large") {
    return [];
  }

  return [
    "Set explicit content counts or system boundaries before building; do not operate on implied scope.",
    "Prefer reusable foundations and pipeline proof before breadth.",
    "Keep placeholders where they protect schedule or unblock integration.",
    "Document upstream and downstream dependencies for this stage.",
    stageKey === "content-production" || stageKey === "vertical-slice-integration"
      ? "Treat throughput and integration readiness as first-class deliverables, not side effects."
      : "Do not pull future-stage work forward unless it directly removes a dependency risk."
  ];
};

const buildAcceptanceCriteria = (
  project: Project,
  stageKey: BuildStage["stageKey"]
): string[] => {
  const baseCriteria = [
    "The stage produces a tangible improvement that can be playtested or reviewed.",
    "The implementation preserves readability, feel goals, and target frame pacing.",
    "The output is documented well enough for the next stage prompt to build on it."
  ];

  if (project.scopeCategory !== "large") {
    return baseCriteria;
  }

  return [
    ...baseCriteria,
    "The stage defines the exact systems or content counts touched in this pass so scope does not silently expand.",
    "Dependencies, blockers, and integration risks are called out before the work is handed off to the next agent or milestone.",
    "Placeholder versus final-content policy is explicit for everything touched in this stage.",
    stageKey === "scope-lock"
      ? "The stage leaves behind a written v1 ceiling and a concrete cut boundary for later tradeoff decisions."
      : "The stage leaves behind a clean handoff note that explains what is stable, what remains risky, and what the next stage can assume."
  ];
};

const buildStagePrompt = (
  stage: ReturnType<typeof getBuildStageSequence>[number],
  project: Project,
  gameDesignDoc: GameDesignDoc,
  targetPlatform: string,
  planningNotes?: string
): string => {
  const template = getTemplateDefinition(project.templateId);
  const templateFocus =
    template.stageFocus[stage.key] ||
    (project.scopeCategory === "large"
      ? LARGE_STAGE_DEFAULTS[stage.key]
      : undefined);
  const largeRequirements = buildLargeProjectRequirements(project, stage.key);
  const acceptanceCriteria = buildAcceptanceCriteria(project, stage.key);
  const projectSnapshot = buildProjectSnapshot(project, gameDesignDoc);
  const sharedGuardrails = buildSharedGuardrails(project, gameDesignDoc);
  const stageRelevantNotes = buildStageRelevantNotes(stage.key, gameDesignDoc);

  return [
    `# ${stage.label}`,
    "",
    `Target Tool: ${targetPlatform}`,
    `Stage Goal: ${stage.description}`,
    "",
    "## Quick Project Snapshot",
    ...projectSnapshot,
    "",
    "## Shared Guardrails",
    ...sharedGuardrails,
    "",
    "## Stage-Specific Focus",
    templateFocus || "Advance the project without compromising the design pillars or scope guardrails.",
    "",
    ...(planningNotes
      ? ["## Clarifying Notes", planningNotes, ""]
      : []),
    "## In Scope",
    "- Implement only the systems required for this stage.",
    "- Keep the work aligned to the current design document and technical constraints.",
    "- Leave placeholders where content would otherwise balloon scope.",
    "",
    "## Out of Scope",
    "- Do not pull future-stage content into this pass.",
    "- Do not add admin tooling, live-service features, or SaaS-style CRUD surfaces.",
    "- Do not rewrite finished systems unless they block this stage.",
    "",
    ...(largeRequirements.length > 0
      ? [
          "## Large Project Mode Requirements",
          ...largeRequirements.map((requirement) => `- ${requirement}`),
          ""
        ]
      : []),
    "## Acceptance Criteria",
    ...acceptanceCriteria.map((criterion) => `- ${criterion}`),
    "",
    "## Stage-Relevant Notes",
    ...stageRelevantNotes
  ].join("\n");
};

export const generateBuildStages = async ({
  gameDesignDoc,
  planningNotes,
  project,
  targetPlatform
}: GenerateBuildStagesInput): Promise<BuildStageDraft[]> => {
  const now = Date.now();
  const stageSequence = getBuildStageSequence(project.scopeCategory);

  return stageSequence.map((stage, index) => ({
    createdAt: now,
    description: stage.description,
    id: crypto.randomUUID(),
    name: stage.label,
    platform: targetPlatform,
    promptContent: buildStagePrompt(
      stage,
      project,
      gameDesignDoc,
      targetPlatform,
      planningNotes
    ),
    stageNumber: index + 1,
    stageKey: stage.key,
    status: index === 0 ? "not-started" : "locked",
    updatedAt: now
  }));
};

export const serializeBuildStages = (stages: BuildStage[]): string =>
  stages
    .map(
      (stage) =>
        `# ${stage.stageNumber}. ${stage.name}\n\nStatus: ${stage.status}\n\n${stage.promptContent}`
    )
    .join("\n\n---\n\n");

export const exportAllPrompts = (stages: BuildStage[]): void => {
  downloadAsFile(serializeBuildStages(stages), APP_BUILD_PLAN_FILE_NAME);
};
