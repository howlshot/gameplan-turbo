import { AIServiceError } from "@/services/ai/errors";
import { generateWithAgent } from "@/services/ai";
import {
  getBuildStageSequence,
  getTemplateDefinition
} from "@/lib/templates/genreTemplates";
import { getAgentPlatformLabel, toLineSeparated } from "@/lib/gameProjectUtils";
import { getOutputDefinition } from "@/services/generation/outputDefinitions";
import type {
  ArtifactType,
  BuildStage,
  GameDesignDoc,
  Project,
  VaultFile
} from "@/types";

export interface PromptLabGenerationInput {
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

const isLargeProjectMode = (project: Project): boolean =>
  project.scopeCategory === "large";

const buildLargeModeContext = (
  project: Project,
  gameDesignDoc: GameDesignDoc
): string =>
  [
    "Project Mode: Indie-studio large",
    `Session Target: ${gameDesignDoc.concept.sessionLength || "TBD"}`,
    `Engine / Pipeline Baseline: ${
      gameDesignDoc.technicalDesign.engine || project.enginePreference || "TBD"
    }`,
    "Production Rule: every system or content family should name its dependency boundary and cut fallback before it expands.",
    "Output Rule: roadmap, slice, and risk outputs should optimize for milestone gates, content budgets, and integration proof."
  ].join("\n");

const buildLargeProductionAssumptions = (
  project: Project,
  gameDesignDoc: GameDesignDoc
): string =>
  [
    "This project is operating in Large Project Mode, which means broader scope with explicit production discipline.",
    `Platform set: ${project.platformTargets.join(", ") || "TBD"}`,
    `Session target: ${gameDesignDoc.concept.sessionLength || "TBD"}`,
    `Technical baseline: ${
      gameDesignDoc.technicalDesign.engine || project.enginePreference || "TBD"
    }`,
    "Assume milestone gates, aggressive cuts, and placeholder-friendly production until the vertical slice integration gate is passed."
  ].join("\n");

const buildLargeContentBudgets = (gameDesignDoc: GameDesignDoc): string =>
  [
    `Player verbs budget: ${gameDesignDoc.contentBible.playerVerbs || "Freeze the shipped verb set before content production scales."}`,
    `Enemy/content family budget: ${gameDesignDoc.contentBible.enemies || "Define exact enemy role counts and encounter families."}`,
    `Mission / level budget: ${gameDesignDoc.contentBible.levelsMissions || "Define chapter or mission family ceilings up front."}`,
    `Boss / special-event budget: ${gameDesignDoc.contentBible.bossesSpecialEvents || "Set an upper bound for signature set pieces before production."}`,
    `Presentation budget: ${gameDesignDoc.contentBible.uiHudElements || "Lock HUD states and feedback surfaces before broad content expansion."}`
  ].join("\n");

const buildLargeDependencyMap = (
  project: Project,
  gameDesignDoc: GameDesignDoc
): string =>
  [
    `Controls and camera grammar must stabilize before encounter scaling: ${gameDesignDoc.controlsFeel.cameraRules || "TBD"}`,
    "Systems foundation must be stable before progression/meta and content production expand.",
    `Content pipeline must be proven before production breadth: ${gameDesignDoc.technicalDesign.contentPipeline || "TBD"}`,
    "Vertical slice integration depends on one representative content set, locked feedback rules, and stable performance targets.",
    `Performance and platform constraints remain a release gate: ${gameDesignDoc.technicalDesign.targetFramerate || project.platformTargets.join(", ") || "TBD"}`
  ].join("\n");

const buildLargeCutBoundaries = (gameDesignDoc: GameDesignDoc): string =>
  [
    `Must protect: ${
      gameDesignDoc.designPillars.pillars.map((pillar) => `- ${pillar}`).join("\n") ||
      "- Core fantasy and readability pillars"
    }`,
    `Cut first: ${
      gameDesignDoc.designPillars.antiGoals.map((goal) => `- ${goal}`).join("\n") ||
      "- Any breadth that does not strengthen the first playable or slice proof"
    }`,
    "- Cut entire content families before destabilizing the core loop or controls.",
    "- Fake presentation and stand in asset quality before slipping gameplay proof gates."
  ].join("\n");

const buildRoadmapExitCriteria = (
  project: Project,
  stageKey: BuildStage["stageKey"],
  templateFocus: string | undefined
): string => {
  if (!isLargeProjectMode(project)) {
    return (
      templateFocus ||
      "Stage output is stable enough to hand to the next implementation pass."
    );
  }

  const largeExitCriteria: Partial<Record<BuildStage["stageKey"], string>> = {
    "scope-lock":
      "The v1 promise, content ceilings, and cut boundaries are written down and stable enough to govern production decisions.",
    foundation:
      "Repository, naming, foldering, and technical conventions are stable enough for multiple stages to build on safely.",
    "first-playable":
      "A loop-complete build exists and proves the project is worth scaling beyond placeholder-heavy validation.",
    "core-controls":
      "Interaction standards are stable enough that content production will not be invalidated by later feel rewrites.",
    "camera-movement":
      "Movement and staging rules are clear enough to support encounter and mission production.",
    "combat-feel":
      "Core interaction feedback is stable enough to become the quality bar for later production content.",
    "systems-foundation":
      "Reusable systems and dependency boundaries are established and documented.",
    "enemy-behavior":
      "Enemy and encounter rules are reusable, readable, and ready for content production.",
    "hud-feedback":
      "HUD and feedback grammar are stable enough to support broader content and playtesting.",
    "progression-meta":
      "Progression structure is stable enough to guide production priorities without multiplying content too early.",
    "content-pipeline":
      "The team can author, ingest, and validate content through a repeatable pipeline.",
    "content-production":
      "Planned content is being produced against clear budgets and dependency rules.",
    "vertical-slice-integration":
      "Gameplay proof and pipeline proof both hold inside one representative slice.",
    polish:
      "The locked production surface is tuned and performant without re-opening foundational systems.",
    "qa-release-prep":
      "QA, compatibility, packaging, and release-readiness gates are complete."
  };

  return (
    largeExitCriteria[stageKey] ||
    templateFocus ||
    "Stage output is stable enough to hand to the next implementation pass."
  );
};

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
    ...(isLargeProjectMode(project)
      ? [formatMarkdownSection("Large Project Mode", buildLargeModeContext(project, gameDesignDoc))]
      : []),
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

  return getBuildStageSequence(project.scopeCategory).map(
    (stage, index) =>
      `### ${index + 1}. ${stage.label}\n- ${stage.description}${
        isLargeProjectMode(project)
          ? "\n- Large Mode Gate: Define content boundaries, dependency risks, placeholder policy, and handoff notes for this stage."
          : ""
      }`
  ).join("\n\n");
};

export const buildOfflineOutput = ({
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
  const stageSequence = getBuildStageSequence(project.scopeCategory);
  const isLarge = isLargeProjectMode(project);

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
        buildWorkspaceContext({ buildStages, gameDesignDoc, project, vaultFiles }),
        ...(isLarge
          ? [
              formatMarkdownSection(
                "Production Assumptions",
                buildLargeProductionAssumptions(project, gameDesignDoc)
              ),
              formatMarkdownSection(
                "Content Budgets",
                buildLargeContentBudgets(gameDesignDoc)
              ),
              formatMarkdownSection(
                "Dependency Map",
                buildLargeDependencyMap(project, gameDesignDoc)
              ),
              formatMarkdownSection(
                "Cut Boundaries",
                buildLargeCutBoundaries(gameDesignDoc)
              )
            ]
          : [])
      ].join("\n\n");
    case "vertical_slice_plan":
      if (isLarge) {
        return [
          sharedHeader,
          "## Slice Goal",
          "Prove both gameplay quality and production viability with one representative slice.",
          "## Gameplay Proof",
          `- Validate the core loop: ${gameDesignDoc.coreLoop.secondToSecond || "TBD"}\n- Validate feel targets: ${gameDesignDoc.controlsFeel.combatFeelGoals || "TBD"}\n- Validate readability rules: ${gameDesignDoc.designPillars.readabilityPrinciples || "TBD"}`,
          "## Pipeline Proof",
          `- Prove the content pipeline: ${gameDesignDoc.technicalDesign.contentPipeline || "TBD"}\n- Prove integration boundaries between systems, content, HUD, and presentation.\n- Prove placeholder-to-final replacement can happen without rework spikes.`,
          "## Required Systems",
          `- ${stageSequence[0]?.label}\n- ${stageSequence[1]?.label}\n- ${stageSequence[2]?.label}\n- ${stageSequence[6]?.label}\n- ${stageSequence[10]?.label}\n- ${stageSequence[12]?.label}`,
          "## Representative Content",
          `${gameDesignDoc.contentBible.levelsMissions || "One representative mission or chapter family."}\n\n${gameDesignDoc.contentBible.enemies || "At least one representative spread of enemy roles."}`,
          "## Success Criteria",
          "- Gameplay proof is obvious in the first minute and remains readable under pressure.",
          `- ${buildRoadmapExitCriteria(project, "vertical-slice-integration", template.stageFocus["vertical-slice-integration"])}`,
          "- Pipeline proof demonstrates stable content ingest, integration, and replacement workflow."
        ].join("\n\n");
      }

      return [
        sharedHeader,
        "## Slice Goal",
        "Prove the core loop, the target readability, and the feel of the game with one polished slice.",
        "## Required Systems",
        `- ${stageSequence[0]?.label}\n- ${stageSequence[1]?.label}\n- ${stageSequence[2]?.label}\n- ${stageSequence[3]?.label}`,
        "## Representative Content",
        `${gameDesignDoc.contentBible.levelsMissions || "One representative level."}\n\n${gameDesignDoc.contentBible.enemies || "At least two enemy roles."}`,
        "## Success Criteria",
        `- Player fantasy is obvious within the first minute.\n- ${template.stageFocus["first-playable"] || "The first playable loop works without placeholders hiding the design problem."}\n- Frame pacing and readability hold on target platforms.`
      ].join("\n\n");
    case "milestone_roadmap":
      return [
        sharedHeader,
        stageSequence.map(
          (stage, index) =>
            `## ${index + 1}. ${stage.label}\nGoal: ${stage.description}\nExit Criteria: ${
              buildRoadmapExitCriteria(project, stage.key, template.stageFocus[stage.key])
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
        "Call out risks to clarity, framerate, scope, or touch usability before implementing.",
        ...(isLarge
          ? [
              "This project is in Large Project Mode. Respect milestone gates, content budgets, dependency boundaries, and cut discipline.",
              "Do not widen system or content scope without naming the dependency impact and the cut fallback.",
              "Leave explicit handoff notes so the next agent or milestone can continue without rediscovering production constraints."
            ]
          : [])
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
      if (isLarge) {
        return [
          sharedHeader,
          "## First Playable",
          `- Core player actions: ${gameDesignDoc.contentBible.playerVerbs || "TBD"}\n- Minimal enemy roles: ${gameDesignDoc.contentBible.enemies || "TBD"}\n- Minimal HUD / feedback states: ${gameDesignDoc.contentBible.uiHudElements || "TBD"}`,
          "## Slice Integration",
          `- Representative encounters: ${gameDesignDoc.contentBible.encounters || "TBD"}\n- Representative mission or level family: ${gameDesignDoc.contentBible.levelsMissions || "TBD"}\n- Pipeline-critical art/audio/VFX replacements: ${gameDesignDoc.artTone.audioMusicDirection || "TBD"}`,
          "## Production Backlog",
          `- Expansion content families: ${gameDesignDoc.contentBible.bossesSpecialEvents || "TBD"}\n- Deferred polish / presentation passes that should not block slice proof`
        ].join("\n\n");
      }

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
      if (isLarge) {
        return [
          sharedHeader,
          "## Risks",
          `- Content bloat beyond planned budgets: Mitigation: lock exact content ceilings before production.`,
          "- Throughput mismatch: Mitigation: prove content pipeline and representative authoring speed before scaling breadth.",
          "- Dependency churn across systems and content: Mitigation: document handoff assumptions and integration ownership every stage.",
          `- Readability breakdown at production scale: Mitigation: enforce ${gameDesignDoc.designPillars.readabilityPrinciples || "target readability rules"} as a milestone gate.`,
          `- Performance drift under final-content pressure: Mitigation: hold ${gameDesignDoc.technicalDesign.targetFramerate || "target framerate"} as a release gate throughout content production.`,
          activeVault.length > 0
            ? `- Reference or direction drift: Mitigation: review active references (${activeVault
                .map((file) => file.name)
                .join(", ")}) at each major milestone.`
            : "- Missing production context: Mitigation: upload playtest notes, tech constraints, and key reference boards before content production expands."
        ].join("\n\n");
      }

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
      if (isLarge) {
        return [
          sharedHeader,
          "## Systems Cuts",
          gameDesignDoc.designPillars.antiGoals.map((goal) => `- ${goal}`).join("\n") ||
            "- Cut secondary systems before destabilizing the core loop.",
          "## Content Cuts",
          "- Cut entire mission, level, enemy, or boss families before cutting across every area evenly.",
          "## Presentation Cuts",
          "- Fake or defer presentation quality where it does not affect gameplay proof or pipeline proof.",
          "## Polish Cuts",
          "- Defer non-critical polish until the vertical slice integration gate and production throughput are stable.",
          "## Must Keep",
          gameDesignDoc.designPillars.pillars.map((pillar) => `- ${pillar}`).join("\n") ||
            "- Preserve the strongest version of the core fantasy."
        ].join("\n\n");
      }

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
    isLargeProjectMode(input.project)
      ? "This project is in Large Project Mode. Make the output more prescriptive about milestone gates, content budgets, dependency boundaries, integration proof, and cut discipline while staying indie-studio in scale."
      : "",
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
