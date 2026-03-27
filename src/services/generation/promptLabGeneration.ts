import { AIServiceError } from "@/services/ai/errors";
import { generateWithAgent } from "@/services/ai";
import { BUILD_STAGE_SEQUENCE, getTemplateDefinition } from "@/lib/templates/genreTemplates";
import { getAgentPlatformLabel, toLineSeparated } from "@/lib/gameProjectUtils";
import { getOutputDefinition } from "@/services/generation/outputDefinitions";
import type {
  ArtifactType,
  BuildStage,
  GameDesignDoc,
  Project,
  VaultFile
} from "@/types";

interface PromptLabGenerationInput {
  buildStages?: BuildStage[];
  gameDesignDoc: GameDesignDoc;
  onChunk?: (chunk: string) => void;
  outputType: ArtifactType;
  project: Project;
  targetAgentPlatform?: string;
  vaultFiles?: VaultFile[];
}

const formatMarkdownSection = (title: string, body: string): string =>
  `## ${title}\n${body.trim() || "TBD"}`;

const buildWorkspaceContext = ({
  buildStages = [],
  gameDesignDoc,
  project,
  vaultFiles = []
}: Omit<PromptLabGenerationInput, "onChunk" | "outputType" | "targetAgentPlatform">): string => {
  const activeFiles = vaultFiles.filter((file) => file.isActiveContext);

  return [
    "# Project Context",
    `Title: ${project.title}`,
    `Pitch: ${project.oneLinePitch || "TBD"}`,
    `Genre: ${project.genre || "TBD"} / ${project.subgenre || "TBD"}`,
    `Scope: ${project.scopeCategory}`,
    `Platform Targets: ${project.platformTargets.join(", ") || "TBD"}`,
    `Agent Targets: ${project.agentTargets.map(getAgentPlatformLabel).join(", ") || "TBD"}`,
    "",
    formatMarkdownSection(
      "Concept",
      [
        `Player Fantasy: ${gameDesignDoc.concept.playerFantasy}`,
        `Target Audience: ${gameDesignDoc.concept.targetAudience}`,
        `Session Length: ${gameDesignDoc.concept.sessionLength}`,
        `Monetization: ${gameDesignDoc.concept.monetizationModel}`,
        `Comparable Games: ${gameDesignDoc.concept.comparableGames.join(", ")}`,
        `Differentiators: ${gameDesignDoc.concept.differentiators}`
      ].join("\n")
    ),
    formatMarkdownSection(
      "Design Pillars",
      [
        `Pillars:\n${toLineSeparated(gameDesignDoc.designPillars.pillars)}`,
        `Feel Statement: ${gameDesignDoc.designPillars.feelStatement}`,
        `Anti Goals:\n${toLineSeparated(gameDesignDoc.designPillars.antiGoals)}`,
        `Emotional Targets:\n${toLineSeparated(gameDesignDoc.designPillars.emotionalTargets)}`,
        `Readability: ${gameDesignDoc.designPillars.readabilityPrinciples}`
      ].join("\n")
    ),
    formatMarkdownSection(
      "Core Loop",
      [
        `Second-to-Second: ${gameDesignDoc.coreLoop.secondToSecond}`,
        `Minute-to-Minute: ${gameDesignDoc.coreLoop.minuteToMinute}`,
        `Session Loop: ${gameDesignDoc.coreLoop.sessionLoop}`,
        `Long-Term Progression: ${gameDesignDoc.coreLoop.longTermProgression}`,
        `Failure States: ${gameDesignDoc.coreLoop.failureStates}`,
        `Reward Cadence: ${gameDesignDoc.coreLoop.rewardCadence}`
      ].join("\n")
    ),
    formatMarkdownSection(
      "Controls & Feel",
      [
        `Control Scheme: ${gameDesignDoc.controlsFeel.controlScheme}`,
        `Camera Rules: ${gameDesignDoc.controlsFeel.cameraRules}`,
        `Movement Philosophy: ${gameDesignDoc.controlsFeel.movementPhilosophy}`,
        `Combat Feel: ${gameDesignDoc.controlsFeel.combatFeelGoals}`,
        `Responsiveness: ${gameDesignDoc.controlsFeel.responsivenessStandards}`,
        `Platform Input Notes: ${gameDesignDoc.controlsFeel.platformInputNotes}`,
        `Accessibility: ${gameDesignDoc.controlsFeel.accessibilityConsiderations}`
      ].join("\n")
    ),
    formatMarkdownSection(
      "Content Bible",
      [
        `Player Verbs: ${gameDesignDoc.contentBible.playerVerbs}`,
        `Enemies: ${gameDesignDoc.contentBible.enemies}`,
        `Weapons / Abilities: ${gameDesignDoc.contentBible.weaponsAbilities}`,
        `Encounters: ${gameDesignDoc.contentBible.encounters}`,
        `Levels / Missions: ${gameDesignDoc.contentBible.levelsMissions}`,
        `Bosses / Events: ${gameDesignDoc.contentBible.bossesSpecialEvents}`,
        `Pickups / Rewards: ${gameDesignDoc.contentBible.pickupsRewards}`,
        `UI / HUD: ${gameDesignDoc.contentBible.uiHudElements}`
      ].join("\n")
    ),
    formatMarkdownSection(
      "Art & Tone",
      [
        `Art Direction: ${gameDesignDoc.artTone.artDirection}`,
        `Tone Keywords: ${gameDesignDoc.artTone.toneKeywords.join(", ")}`,
        `Visual References: ${gameDesignDoc.artTone.visualReferences.join(", ")}`,
        `Negative References: ${gameDesignDoc.artTone.negativeReferences.join(", ")}`,
        `Animation Style: ${gameDesignDoc.artTone.animationStyle}`,
        `VFX Direction: ${gameDesignDoc.artTone.vfxDirection}`,
        `Audio / Music Direction: ${gameDesignDoc.artTone.audioMusicDirection}`
      ].join("\n")
    ),
    formatMarkdownSection(
      "Technical Design",
      [
        `Engine: ${gameDesignDoc.technicalDesign.engine || project.enginePreference}`,
        `Rendering Constraints: ${gameDesignDoc.technicalDesign.renderingConstraints}`,
        `Target Framerate: ${gameDesignDoc.technicalDesign.targetFramerate}`,
        `Performance Budget: ${gameDesignDoc.technicalDesign.memoryPerformanceBudget}`,
        `Save System: ${gameDesignDoc.technicalDesign.saveSystem}`,
        `Content Pipeline: ${gameDesignDoc.technicalDesign.contentPipeline}`,
        `Naming Conventions: ${gameDesignDoc.technicalDesign.namingConventions}`,
        `Folder Structure: ${gameDesignDoc.technicalDesign.folderStructure}`,
        `Platform Constraints: ${gameDesignDoc.technicalDesign.platformConstraints}`
      ].join("\n")
    ),
    formatMarkdownSection(
      "Active Vault Context",
      activeFiles.length > 0
        ? activeFiles.map((file) => `- ${file.name} (${file.category})`).join("\n")
        : "No active vault files."
    ),
    formatMarkdownSection(
      "Current Build Plan",
      buildStages.length > 0
        ? buildStages
            .map(
              (stage) =>
                `${stage.stageNumber}. ${stage.name} [${stage.status}] - ${stage.description}`
            )
            .join("\n")
        : "No build stages generated yet."
    )
  ].join("\n\n");
};

const buildOfflineBuildPlanMarkdown = (project: Project, buildStages?: BuildStage[]): string => {
  const stages = buildStages ?? [];
  if (stages.length > 0) {
    return stages
      .map(
        (stage) =>
          `### ${stage.stageNumber}. ${stage.name}\n- Status: ${stage.status}\n- Focus: ${stage.description}\n\n${stage.promptContent}`
      )
      .join("\n\n");
  }

  return BUILD_STAGE_SEQUENCE.map(
    (stage, index) => `### ${index + 1}. ${stage.label}\n- ${stage.description}`
  ).join("\n\n");
};

const buildOfflineOutput = ({
  buildStages = [],
  gameDesignDoc,
  outputType,
  project,
  targetAgentPlatform = "codex",
  vaultFiles = []
}: PromptLabGenerationInput): string => {
  const template = getTemplateDefinition(project.templateId);
  const activeVault = vaultFiles.filter((file) => file.isActiveContext);
  const sharedHeader = `# ${project.title}\n\n${project.oneLinePitch || "TBD"}`;

  switch (outputType) {
    case "game_pitch":
      return [
        sharedHeader,
        "## Player Fantasy",
        gameDesignDoc.concept.playerFantasy || "TBD",
        "## Why This Game",
        gameDesignDoc.concept.differentiators || "TBD",
        "## Design Pillars",
        gameDesignDoc.designPillars.pillars.map((pillar) => `- ${pillar}`).join("\n") || "- TBD",
        "## Session Shape",
        `Audience: ${gameDesignDoc.concept.targetAudience || "TBD"}\nSession: ${gameDesignDoc.concept.sessionLength || "TBD"}`,
        "## Scope Guardrails",
        gameDesignDoc.designPillars.antiGoals.map((goal) => `- ${goal}`).join("\n") || "- TBD"
      ].join("\n\n");
    case "mini_gdd":
      return [
        sharedHeader,
        "## Core Loop",
        `${gameDesignDoc.coreLoop.secondToSecond}\n\n${gameDesignDoc.coreLoop.sessionLoop}`.trim(),
        "## Controls & Feel",
        `${gameDesignDoc.controlsFeel.controlScheme}\n\n${gameDesignDoc.controlsFeel.combatFeelGoals}`.trim(),
        "## Content Slice",
        `${gameDesignDoc.contentBible.enemies}\n\n${gameDesignDoc.contentBible.encounters}`.trim(),
        "## Art & Tone",
        `${gameDesignDoc.artTone.artDirection}\n\n${gameDesignDoc.artTone.audioMusicDirection}`.trim(),
        "## Technical Constraints",
        `${gameDesignDoc.technicalDesign.engine || project.enginePreference}\n\n${gameDesignDoc.technicalDesign.targetFramerate}`.trim()
      ].join("\n\n");
    case "full_gdd":
      return [
        sharedHeader,
        buildWorkspaceContext({ buildStages, gameDesignDoc, project, vaultFiles })
      ].join("\n\n");
    case "vertical_slice_plan":
      return [
        sharedHeader,
        "## Slice Goal",
        "Prove the core loop, the target readability, and the feel of the game with one polished slice.",
        "## Required Systems",
        `- ${BUILD_STAGE_SEQUENCE[0].label}\n- ${BUILD_STAGE_SEQUENCE[1].label}\n- ${BUILD_STAGE_SEQUENCE[2].label}\n- ${BUILD_STAGE_SEQUENCE[3].label}`,
        "## Representative Content",
        `${gameDesignDoc.contentBible.levelsMissions || "One representative level."}\n\n${gameDesignDoc.contentBible.enemies || "At least two enemy roles."}`,
        "## Success Criteria",
        `- Player fantasy is obvious within the first minute.\n- ${template.stageFocus["first-playable"] || "The first playable loop works without placeholders hiding the design problem."}\n- Frame pacing and readability hold on target platforms.`
      ].join("\n\n");
    case "milestone_roadmap":
      return [
        sharedHeader,
        BUILD_STAGE_SEQUENCE.map(
          (stage, index) =>
            `## ${index + 1}. ${stage.label}\nGoal: ${stage.description}\nExit Criteria: ${
              template.stageFocus[stage.key] || "Stage output is stable enough to hand to the next implementation pass."
            }`
        ).join("\n\n")
      ].join("\n\n");
    case "agent_system_prompt":
      return [
        `You are working on ${project.title}, a ${project.genre || "game"} project.`,
        `Target tool: ${getAgentPlatformLabel(targetAgentPlatform as never)}.`,
        "Read the game design context before making changes.",
        "Protect the design pillars, scope guardrails, and feel goals. Do not turn this into a generic SaaS-style app.",
        "Deliver work in staged increments aligned to the build plan.",
        "Prefer readable, testable implementations that preserve performance and input responsiveness.",
        "Call out risks to clarity, framerate, scope, or touch usability before implementing."
      ].join("\n\n");
    case "staged_implementation_prompts":
      return [
        sharedHeader,
        buildOfflineBuildPlanMarkdown(project, buildStages)
      ].join("\n\n");
    case "art_prompt_packet":
      return [
        sharedHeader,
        "## Visual North Star",
        gameDesignDoc.artTone.artDirection || "TBD",
        "## Tone Keywords",
        gameDesignDoc.artTone.toneKeywords.map((keyword) => `- ${keyword}`).join("\n") || "- TBD",
        "## Positive References",
        gameDesignDoc.artTone.visualReferences.map((reference) => `- ${reference}`).join("\n") || "- TBD",
        "## Negative References",
        gameDesignDoc.artTone.negativeReferences.map((reference) => `- ${reference}`).join("\n") || "- TBD",
        "## Prompt Snippets",
        `- Focus on ${gameDesignDoc.designPillars.readabilityPrinciples || "high readability"}.\n- Preserve ${gameDesignDoc.controlsFeel.cameraRules || "the camera grammar"}.\n- Use ${gameDesignDoc.artTone.animationStyle || "animation language"} and ${gameDesignDoc.artTone.vfxDirection || "VFX language"}.`
      ].join("\n\n");
    case "asset_grocery_list":
      return [
        sharedHeader,
        "## First Playable",
        `- Player: ${gameDesignDoc.contentBible.playerVerbs || "Core player actions"}\n- Enemies: ${gameDesignDoc.contentBible.enemies || "Two enemy types"}\n- HUD: ${gameDesignDoc.contentBible.uiHudElements || "Minimal HUD"}`,
        "## Vertical Slice",
        `- Encounters: ${gameDesignDoc.contentBible.encounters || "Representative encounter set"}\n- Levels: ${gameDesignDoc.contentBible.levelsMissions || "One polished slice"}\n- Audio/VFX: ${gameDesignDoc.artTone.audioMusicDirection || "Feedback pass"}`,
        "## Later",
        `- Bosses: ${gameDesignDoc.contentBible.bossesSpecialEvents || "Deferred boss content"}`
      ].join("\n\n");
    case "playtest_checklist":
      return [
        sharedHeader,
        "## Checklist",
        "- Is the player fantasy obvious within the first 30 seconds?",
        "- Are threats readable before they attack?",
        "- Does movement / aiming feel immediate?",
        "- Do failure states feel fair and understandable?",
        "- Does the reward cadence motivate another run?",
        "- Are HUD and touch targets legible on the smallest target screen?",
        "## Notes Template",
        "What confused players?\nWhat delighted players?\nWhere did pacing sag?\nWhat should be cut or clarified?"
      ].join("\n\n");
    case "risk_register":
      return [
        sharedHeader,
        "## Risks",
        `- Scope creep beyond ${project.scopeCategory}: Mitigation: freeze content count early.`,
        `- Readability breakdown: Mitigation: enforce ${gameDesignDoc.designPillars.readabilityPrinciples || "target readability rules"}.`,
        `- Feel mismatch: Mitigation: prototype ${gameDesignDoc.controlsFeel.controlScheme || "controls"} before expanding content.`,
        `- Performance drift: Mitigation: hold ${gameDesignDoc.technicalDesign.targetFramerate || "target framerate"} as a release gate.`,
        activeVault.length > 0
          ? `- Vault context conflict: Mitigation: review active references (${activeVault
              .map((file) => file.name)
              .join(", ")}) each milestone.`
          : "- Missing reference context: Mitigation: upload playtest notes and key references before content expansion."
      ].join("\n\n");
    case "cut_list":
      return [
        sharedHeader,
        "## Must Keep",
        gameDesignDoc.designPillars.pillars.map((pillar) => `- ${pillar}`).join("\n") || "- Core fantasy",
        "## Cut Now",
        gameDesignDoc.designPillars.antiGoals.map((goal) => `- ${goal}`).join("\n") || "- Anything not supporting the first playable.",
        "## Fake For Slice",
        "- Use stand-in content where it does not affect feel validation.",
        "## Revisit Later",
        "- Expansion content after first playable and slice metrics are healthy."
      ].join("\n\n");
    case "reference_research_prompt":
      return [
        `# Deep Research Request: ${project.title}`,
        `Research the market, genre norms, control patterns, pacing expectations, comparable productions, and platform constraints for a ${project.subgenre || project.genre} game aimed at ${project.targetAudience || "the current target audience"}.`,
        "Focus on scope-relevant findings for a small AI-assisted team. Include genre benchmarks, onboarding patterns, failure-state design, readability rules, monetization expectations, and production-risk comparisons.",
        "Return the findings as: Executive Summary, Comparable Games, Control & Feel Benchmarks, Readability Standards, Production Scope Signals, Platform Constraints, Risks, and Actionable Recommendations."
      ].join("\n\n");
    default:
      return sharedHeader;
  }
};

export const generatePromptLabOutput = async (
  input: PromptLabGenerationInput
): Promise<string> => {
  const definition = getOutputDefinition(input.outputType);
  if (!definition) {
    return buildOfflineOutput(input);
  }

  const context = buildWorkspaceContext({
    buildStages: input.buildStages,
    gameDesignDoc: input.gameDesignDoc,
    project: input.project,
    vaultFiles: input.vaultFiles
  });

  const userPrompt = [
    `Generate the following output: ${definition.title}.`,
    input.targetAgentPlatform
      ? `Primary target tool: ${getAgentPlatformLabel(input.targetAgentPlatform as never)}.`
      : "",
    "Use the project context below. Preserve the design pillars and keep the result tightly scoped.",
    context
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    return await generateWithAgent(
      definition.agentType,
      userPrompt,
      input.onChunk,
      input.project.id
    );
  } catch (error) {
    if (error instanceof AIServiceError && error.code === "NO_PROVIDER") {
      return buildOfflineOutput(input);
    }
    throw error;
  }
};
