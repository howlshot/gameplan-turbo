import { APP_BUILD_PLAN_FILE_NAME } from "@/lib/brand";
import { downloadAsFile } from "@/lib/utils";
import {
  getBuildStageSequence,
  getTemplateDefinition
} from "@/lib/templates/genreTemplates";
import type { BuildStage, GameDesignDoc, Project } from "@/types";

interface GenerateBuildStagesInput {
  gameDesignDoc: GameDesignDoc;
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

const buildSharedStageContext = (
  project: Project,
  gameDesignDoc: GameDesignDoc
): string => {
  return [
    `Project: ${project.title}`,
    `Pitch: ${project.oneLinePitch || "TBD"}`,
    `Genre: ${project.genre || "TBD"} / ${project.subgenre || "TBD"}`,
    `Scope: ${project.scopeCategory}`,
    `Session Length: ${gameDesignDoc.concept.sessionLength || "TBD"}`,
    `Player Fantasy: ${gameDesignDoc.concept.playerFantasy || "TBD"}`,
    `Design Pillars: ${gameDesignDoc.designPillars.pillars.join(" | ") || "TBD"}`,
    `Core Loop: ${gameDesignDoc.coreLoop.secondToSecond || "TBD"}`,
    `Controls: ${gameDesignDoc.controlsFeel.controlScheme || "TBD"}`,
    `Technical Constraints: ${gameDesignDoc.technicalDesign.platformConstraints || "TBD"}`
  ].join("\n");
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
  targetPlatform: string
): string => {
  const template = getTemplateDefinition(project.templateId);
  const templateFocus =
    template.stageFocus[stage.key] ||
    (project.scopeCategory === "large"
      ? LARGE_STAGE_DEFAULTS[stage.key]
      : undefined);
  const largeRequirements = buildLargeProjectRequirements(project, stage.key);
  const acceptanceCriteria = buildAcceptanceCriteria(project, stage.key);

  return [
    `# ${stage.label}`,
    "",
    `Target Tool: ${targetPlatform}`,
    `Stage Goal: ${stage.description}`,
    "",
    "## Project Context",
    buildSharedStageContext(project, gameDesignDoc),
    "",
    "## Stage-Specific Focus",
    templateFocus || "Advance the project without compromising the design pillars or scope guardrails.",
    "",
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
    "## Notes",
    `- Controls / feel: ${gameDesignDoc.controlsFeel.combatFeelGoals || "TBD"}`,
    `- Encounter / content constraints: ${gameDesignDoc.contentBible.encounters || "TBD"}`,
    `- Art / tone constraints: ${gameDesignDoc.artTone.artDirection || "TBD"}`
  ].join("\n");
};

export const generateBuildStages = async ({
  gameDesignDoc,
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
    promptContent: buildStagePrompt(stage, project, gameDesignDoc, targetPlatform),
    stageNumber: index + 1,
    stageKey: stage.key,
    status: index === 0 ? "not-started" : "locked",
    updatedAt: now
  }));
};

export const exportAllPrompts = (stages: BuildStage[]): void => {
  const content = stages
    .map(
      (stage) =>
        `# ${stage.stageNumber}. ${stage.name}\n\nStatus: ${stage.status}\n\n${stage.promptContent}`
    )
    .join("\n\n---\n\n");

  downloadAsFile(content, APP_BUILD_PLAN_FILE_NAME);
};
