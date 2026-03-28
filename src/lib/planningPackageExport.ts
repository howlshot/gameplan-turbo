import { APP_NAME } from "@/lib/brand";
import { downloadFileData } from "@/lib/fileUpload";
import { serializeBuildStages } from "@/services/generation/buildGeneration";
import { getOutputDefinition } from "@/services/generation/outputDefinitions";
import type { BuildStage, GameDesignDoc, GeneratedArtifact, Project, VaultFile } from "@/types";

interface ExportPlanningPackageInput {
  artifacts: GeneratedArtifact[];
  gameDesignDoc: GameDesignDoc;
  project: Project;
  stages: BuildStage[];
  vaultFiles: VaultFile[];
}

const sanitizePathSegment = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "untitled";

const formatText = (value: string): string => value.trim() || "TBD";

const formatList = (values: string[]): string =>
  values.filter((value) => value.trim()).map((value) => `- ${value.trim()}`).join("\n") || "- TBD";

const buildSection = (title: string, fields: Array<[string, string]>): string =>
  [
    `# ${title}`,
    "",
    ...fields.flatMap(([label, value]) => [`## ${label}`, value || "TBD", ""])
  ].join("\n").trim();

const buildPackageReadme = ({
  artifacts,
  project,
  stages,
  vaultFiles
}: Pick<ExportPlanningPackageInput, "artifacts" | "project" | "stages" | "vaultFiles">): string =>
  [
    `# ${project.title} Planning Package`,
    "",
    `Exported from ${APP_NAME} on ${new Date().toLocaleString()}.`,
    "",
    "## What is inside",
    "- `design/` — current design-doc snapshots",
    "- `roadmap/` — the build roadmap and individual stage briefs",
    "- `outputs/` — the latest generated Prompt Lab outputs by type",
    "- `references/` — vault context summary and exported vault files",
    "",
    "## Project snapshot",
    `- Genre: ${project.genre || "TBD"} / ${project.subgenre || "TBD"}`,
    `- Scope: ${project.scopeCategory}`,
    `- Typical Session: ${project.sessionLength || "TBD"}`,
    `- Engine Preference: ${project.enginePreference || "TBD"}`,
    `- Ships On: ${project.platformTargets.join(", ").toUpperCase() || "TBD"}`,
    `- Build With: ${project.agentTargets.join(", ") || "TBD"}`,
    "",
    "## Included export counts",
    `- Roadmap stages: ${stages.length}`,
    `- Latest Prompt Lab outputs: ${new Set(artifacts.map((artifact) => artifact.type)).size}`,
    `- Vault files: ${vaultFiles.length}`
  ].join("\n");

const buildConceptDoc = (project: Project, gameDesignDoc: GameDesignDoc): string =>
  buildSection("Concept", [
    ["Game Title", formatText(gameDesignDoc.concept.gameTitle || project.title)],
    ["One-Line Pitch", formatText(gameDesignDoc.concept.oneLinePitch)],
    ["Player Fantasy", formatText(gameDesignDoc.concept.playerFantasy)],
    ["Genre", `${project.genre || "TBD"} / ${project.subgenre || "TBD"}`],
    ["Scope", project.scopeCategory],
    ["Typical Session", formatText(gameDesignDoc.concept.sessionLength)],
    ["Target Audience", formatText(gameDesignDoc.concept.targetAudience)],
    ["Monetization Model", formatText(gameDesignDoc.concept.monetizationModel)],
    ["Differentiators", formatText(gameDesignDoc.concept.differentiators)],
    ["Comparable Games", formatList(gameDesignDoc.concept.comparableGames)]
  ]);

const buildDesignPillarsDoc = (gameDesignDoc: GameDesignDoc): string =>
  buildSection("Design Pillars", [
    ["Non-Negotiable Pillars", formatList(gameDesignDoc.designPillars.pillars)],
    ["Feel Statement", formatText(gameDesignDoc.designPillars.feelStatement)],
    ["Anti-Goals", formatList(gameDesignDoc.designPillars.antiGoals)],
    ["Emotional Targets", formatList(gameDesignDoc.designPillars.emotionalTargets)],
    ["Readability Principles", formatText(gameDesignDoc.designPillars.readabilityPrinciples)]
  ]);

const buildCoreLoopDoc = (gameDesignDoc: GameDesignDoc): string =>
  buildSection("Core Loop", [
    ["Second-to-Second", formatText(gameDesignDoc.coreLoop.secondToSecond)],
    ["Minute-to-Minute", formatText(gameDesignDoc.coreLoop.minuteToMinute)],
    ["Session Loop", formatText(gameDesignDoc.coreLoop.sessionLoop)],
    ["Long-Term Progression", formatText(gameDesignDoc.coreLoop.longTermProgression)],
    ["Failure States", formatText(gameDesignDoc.coreLoop.failureStates)],
    ["Reward Cadence", formatText(gameDesignDoc.coreLoop.rewardCadence)]
  ]);

const buildControlsFeelDoc = (gameDesignDoc: GameDesignDoc): string =>
  buildSection("Controls & Feel", [
    ["Control Scheme", formatText(gameDesignDoc.controlsFeel.controlScheme)],
    ["Camera Rules", formatText(gameDesignDoc.controlsFeel.cameraRules)],
    ["Movement Philosophy", formatText(gameDesignDoc.controlsFeel.movementPhilosophy)],
    ["Combat Feel Goals", formatText(gameDesignDoc.controlsFeel.combatFeelGoals)],
    ["Responsiveness Standards", formatText(gameDesignDoc.controlsFeel.responsivenessStandards)],
    ["Platform-Specific Input Notes", formatText(gameDesignDoc.controlsFeel.platformInputNotes)],
    ["Accessibility Considerations", formatText(gameDesignDoc.controlsFeel.accessibilityConsiderations)]
  ]);

const buildContentBibleDoc = (gameDesignDoc: GameDesignDoc): string =>
  buildSection("Content Bible", [
    ["Player Verbs", formatText(gameDesignDoc.contentBible.playerVerbs)],
    ["Enemies", formatText(gameDesignDoc.contentBible.enemies)],
    ["Weapons & Abilities", formatText(gameDesignDoc.contentBible.weaponsAbilities)],
    ["Encounters", formatText(gameDesignDoc.contentBible.encounters)],
    ["Levels & Missions", formatText(gameDesignDoc.contentBible.levelsMissions)],
    ["Bosses & Special Events", formatText(gameDesignDoc.contentBible.bossesSpecialEvents)],
    ["Pickups & Rewards", formatText(gameDesignDoc.contentBible.pickupsRewards)],
    ["UI & HUD Elements", formatText(gameDesignDoc.contentBible.uiHudElements)]
  ]);

const buildArtToneDoc = (gameDesignDoc: GameDesignDoc): string =>
  buildSection("Art & Tone", [
    ["Art Direction", formatText(gameDesignDoc.artTone.artDirection)],
    ["Tone Keywords", formatList(gameDesignDoc.artTone.toneKeywords)],
    ["Visual References", formatList(gameDesignDoc.artTone.visualReferences)],
    ["Negative References", formatList(gameDesignDoc.artTone.negativeReferences)],
    ["Animation Style", formatText(gameDesignDoc.artTone.animationStyle)],
    ["VFX Direction", formatText(gameDesignDoc.artTone.vfxDirection)],
    ["Audio & Music Direction", formatText(gameDesignDoc.artTone.audioMusicDirection)]
  ]);

const buildTechnicalDesignDoc = (gameDesignDoc: GameDesignDoc): string =>
  buildSection("Technical Design", [
    ["Engine", formatText(gameDesignDoc.technicalDesign.engine)],
    ["Rendering Constraints", formatText(gameDesignDoc.technicalDesign.renderingConstraints)],
    ["Target Framerate", formatText(gameDesignDoc.technicalDesign.targetFramerate)],
    ["Memory / Performance Budget", formatText(gameDesignDoc.technicalDesign.memoryPerformanceBudget)],
    ["Save System", formatText(gameDesignDoc.technicalDesign.saveSystem)],
    ["Content Pipeline", formatText(gameDesignDoc.technicalDesign.contentPipeline)],
    ["Naming Conventions", formatText(gameDesignDoc.technicalDesign.namingConventions)],
    ["Folder Structure", formatText(gameDesignDoc.technicalDesign.folderStructure)],
    ["Platform Constraints", formatText(gameDesignDoc.technicalDesign.platformConstraints)]
  ]);

const buildVaultContextDoc = (vaultFiles: VaultFile[]): string => {
  if (vaultFiles.length === 0) {
    return "# Vault Context\n\nNo vault files exported with this planning package yet.";
  }

  return [
    "# Vault Context",
    "",
    "## Exported files",
    ...vaultFiles.flatMap((file, index) => [
      `### ${index + 1}. ${file.name}`,
      `- Category: ${file.category}`,
      `- Active Context: ${file.isActiveContext ? "Yes" : "No"}`,
      `- MIME Type: ${file.mimeType}`,
      `- Size: ${file.size} bytes`,
      ""
    ])
  ].join("\n").trim();
};

const buildStageBrief = (stage: BuildStage, totalStages: number): string =>
  [
    `# ${stage.stageNumber}. ${stage.name}`,
    "",
    `Status: ${stage.status}`,
    `Stage: ${stage.stageNumber} of ${totalStages}`,
    `Recommended Tool: ${stage.platform}`,
    "",
    "## Description",
    stage.description,
    "",
    "## Stage Brief",
    stage.promptContent
  ].join("\n");

const getLatestArtifactsByType = (artifacts: GeneratedArtifact[]): GeneratedArtifact[] => {
  const latestByType = new Map<string, GeneratedArtifact>();

  artifacts
    .slice()
    .sort((left, right) => right.createdAt - left.createdAt)
    .forEach((artifact) => {
      if (!latestByType.has(artifact.type)) {
        latestByType.set(artifact.type, artifact);
      }
    });

  return Array.from(latestByType.values());
};

export const buildPlanningPackageBuffer = async ({
  artifacts,
  gameDesignDoc,
  project,
  stages,
  vaultFiles
}: ExportPlanningPackageInput): Promise<ArrayBuffer> => {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  const rootFolder = sanitizePathSegment(project.title || project.name || "game-project");
  const totalStages = stages.length;

  zip.file(
    `${rootFolder}/README.md`,
    buildPackageReadme({ artifacts, project, stages, vaultFiles })
  );

  zip.file(`${rootFolder}/design/01-concept.md`, buildConceptDoc(project, gameDesignDoc));
  zip.file(`${rootFolder}/design/02-design-pillars.md`, buildDesignPillarsDoc(gameDesignDoc));
  zip.file(`${rootFolder}/design/03-core-loop.md`, buildCoreLoopDoc(gameDesignDoc));
  zip.file(`${rootFolder}/design/04-controls-feel.md`, buildControlsFeelDoc(gameDesignDoc));
  zip.file(`${rootFolder}/design/05-content-bible.md`, buildContentBibleDoc(gameDesignDoc));
  zip.file(`${rootFolder}/design/06-art-tone.md`, buildArtToneDoc(gameDesignDoc));
  zip.file(`${rootFolder}/design/07-technical-design.md`, buildTechnicalDesignDoc(gameDesignDoc));

  if (stages.length > 0) {
    zip.file(`${rootFolder}/roadmap/BUILD_ROADMAP.md`, serializeBuildStages(stages));
    stages.forEach((stage) => {
      const stageFileName = `${String(stage.stageNumber).padStart(2, "0")}-${sanitizePathSegment(stage.name)}.md`;
      zip.file(
        `${rootFolder}/roadmap/stages/${stageFileName}`,
        buildStageBrief(stage, totalStages)
      );
    });
  }

  getLatestArtifactsByType(artifacts).forEach((artifact) => {
    const definition = getOutputDefinition(artifact.type);
    const fileName =
      definition?.fileLabel || `${sanitizePathSegment(artifact.type)}-v${artifact.version}.md`;
    zip.file(`${rootFolder}/outputs/${fileName}`, artifact.content);
  });

  zip.file(`${rootFolder}/references/VAULT_CONTEXT.md`, buildVaultContextDoc(vaultFiles));
  vaultFiles.forEach((file, index) => {
    zip.file(
      `${rootFolder}/references/files/${String(index + 1).padStart(2, "0")}-${file.name}`,
      new Uint8Array(file.data)
    );
  });

  return zip.generateAsync({ type: "arraybuffer" });
};

export const exportPlanningPackage = async (
  input: ExportPlanningPackageInput
): Promise<void> => {
  const data = await buildPlanningPackageBuffer(input);
  const fileName = `${sanitizePathSegment(input.project.title || input.project.name)}-planning-package.zip`;
  downloadFileData(data, fileName, "application/zip");
};
