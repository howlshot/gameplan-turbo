import { downloadAsFile } from "@/lib/utils";
import {
  BUILD_STAGE_SEQUENCE,
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
    `Player Fantasy: ${gameDesignDoc.concept.playerFantasy || "TBD"}`,
    `Design Pillars: ${gameDesignDoc.designPillars.pillars.join(" | ") || "TBD"}`,
    `Core Loop: ${gameDesignDoc.coreLoop.secondToSecond || "TBD"}`,
    `Controls: ${gameDesignDoc.controlsFeel.controlScheme || "TBD"}`,
    `Technical Constraints: ${gameDesignDoc.technicalDesign.platformConstraints || "TBD"}`
  ].join("\n");
};

const buildStagePrompt = (
  stage: (typeof BUILD_STAGE_SEQUENCE)[number],
  project: Project,
  gameDesignDoc: GameDesignDoc,
  targetPlatform: string
): string => {
  const template = getTemplateDefinition(project.templateId);
  const templateFocus = template.stageFocus[stage.key];

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
    "## Acceptance Criteria",
    "- The stage produces a tangible improvement that can be playtested or reviewed.",
    "- The implementation preserves readability, feel goals, and target frame pacing.",
    "- The output is documented well enough for the next stage prompt to build on it.",
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
  return BUILD_STAGE_SEQUENCE.map((stage, index) => ({
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

  downloadAsFile(content, "preflight-game-os-build-plan.md");
};
