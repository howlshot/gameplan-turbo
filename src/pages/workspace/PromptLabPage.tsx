import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BuildStageCard } from "@/components/workspace/BuildStageCard";
import { WorkspacePageNavigation } from "@/components/workspace/WorkspacePageNavigation";
import {
  GameField,
  GameSectionLayout,
  GameSelect
} from "@/components/workspace/game/GameSectionLayout";
import { getProjectTabPath } from "@/components/layout/sidebarConfig";
import { useAIProviders } from "@/hooks/useAIProviders";
import { useArtifacts } from "@/hooks/useArtifacts";
import { useBuildStages } from "@/hooks/useBuildStages";
import { useGameDesignDoc } from "@/hooks/useGameDesignDoc";
import { useProject } from "@/hooks/useProject";
import { useToast } from "@/hooks/useToast";
import { useVaultFiles } from "@/hooks/useVaultFiles";
import { getAiActionCopy } from "@/lib/ai/aiActionCopy";
import { getPreferredAgentPlatformForProvider } from "@/lib/ai/providerCatalog";
import { APP_LATEST_DESKTOP_RELEASE_URL } from "@/lib/brand";
import { isLegacyLargeBuildPlan } from "@/lib/buildPlanUtils";
import { getAgentPlatformLabel } from "@/lib/gameProjectUtils";
import { exportPlanningPackage } from "@/lib/planningPackageExport";
import {
  buildDraftFromExistingStages,
  parseRoadmapPolishResponse,
  type RoadmapDraftReview
} from "@/lib/roadmapDraft";
import {
  buildPlanningNotes,
  parsePlanningQuestions
} from "@/lib/planningQuestions";
import { isHostedRuntime } from "@/lib/runtimeMode";
import { generateWithAgent } from "@/services/ai";
import {
  exportAllPrompts,
  generateBuildStages,
  serializeBuildStages
} from "@/services/generation/buildGeneration";
import { getOutputDefinition } from "@/services/generation/outputDefinitions";
import { usePromptLabSessionStore } from "@/stores/promptLabSessionStore";
import type { ArtifactType, BuildStage, VaultFile } from "@/types";

const GENERATION_WAIT_NOTE =
  "This may take a while depending on your provider. Typical generation takes around a minute.";

const SUGGESTED_NEXT_OUTPUTS: ArtifactType[] = [
  "full_gdd",
  "milestone_roadmap",
  "risk_register",
  "staged_implementation_prompts"
];

const formatActiveVaultLabel = (file: VaultFile): string =>
  `${file.name} (${file.category})`;

const buildPlanningQuestionsPrompt = (
  projectTitle: string,
  targetToolLabel: string,
  context: string
): string =>
  [
    `Project: ${projectTitle}`,
    `Preferred implementation tool: ${targetToolLabel}`,
    "",
    "Review the game planning context below and ask 3 to 5 short, project-specific questions that would materially improve roadmap quality, prompt quality, or scope safety.",
    "Focus on missing design or production decisions, not code implementation.",
    "",
    "Context:",
    context
  ].join("\n");

const buildPlanningQuestionsContext = (
  projectTitle: string,
  gameDesignSummary: string,
  stageSummary: string,
  activeVaultFiles: VaultFile[]
): string =>
  [
    `Project: ${projectTitle}`,
    gameDesignSummary,
    `Current roadmap: ${stageSummary}`,
    activeVaultFiles.length > 0
      ? `Vault context: ${activeVaultFiles.map(formatActiveVaultLabel).join(", ")}`
      : "Vault context: none yet"
  ].join("\n");

const buildStagePlanningReviewPrompt = (
  stage: BuildStage,
  projectTitle: string,
  toolLabel: string
): string =>
  [
    "You are helping with game-production planning, not implementation.",
    "Review the stage brief below and make it easier for a developer to hand off into their real build environment.",
    "Do not write code, file diffs, or repo commands.",
    "",
    "Return exactly these sections:",
    "1. Key questions to answer first",
    "2. Risks or dependencies",
    "3. Prompt improvements",
    "4. Revised stage brief",
    "",
    `Project: ${projectTitle}`,
    `Stage: ${stage.name}`,
    `Recommended tool: ${toolLabel}`,
    "",
    "Current stage brief:",
    stage.promptContent
  ].join("\n");

const buildFullRoadmapPolishPrompt = ({
  activeVaultFiles,
  currentStages,
  planningNotes,
  projectTitle,
  targetToolLabel
}: {
  activeVaultFiles: VaultFile[];
  currentStages: BuildStage[];
  planningNotes?: string;
  projectTitle: string;
  targetToolLabel: string;
}): string =>
  [
    "You are refining a game-production roadmap for planning only.",
    "Do not write code, repo commands, implementation steps, or file diffs.",
    "Review the current staged roadmap and return a stronger version if sequencing, scope, or handoff quality can be improved.",
    "",
    "Return strict JSON with this exact shape:",
    "{",
    '  "summary": "short paragraph",',
    '  "sequencingIssues": ["issue"],',
    '  "risks": ["risk"],',
    '  "scopeCuts": ["cut"],',
    '  "revisedStages": [',
    '    {',
    '      "stageKey": "foundation",',
    '      "name": "Foundation",',
    '      "description": "short description",',
    '      "promptContent": "full revised stage brief",',
    '      "platform": "codex"',
    "    }",
    "  ]",
    "}",
    "",
    "Rules:",
    "- Return the full roadmap, not a partial patch.",
    "- Keep the same number of stages as the current roadmap.",
    "- Keep the same stage keys, but you may reorder them in revisedStages if the sequence should change.",
    "- Every revised stage needs a handoff-ready promptContent.",
    "- Use scope cuts only when they materially reduce delivery risk.",
    "",
    `Project: ${projectTitle}`,
    `Preferred implementation tool: ${targetToolLabel}`,
    activeVaultFiles.length > 0
      ? `Active vault context: ${activeVaultFiles.map(formatActiveVaultLabel).join(", ")}`
      : "Active vault context: none",
    ...(planningNotes ? ["", "Clarifying Notes:", planningNotes] : []),
    "",
    "Current Roadmap:",
    serializeBuildStages(currentStages)
  ].join("\n");

const hydrateGeneratedStages = (
  projectId: string,
  generatedStages: Awaited<ReturnType<typeof generateBuildStages>>
): BuildStage[] =>
  generatedStages.map((stage) => ({
    ...stage,
    projectId
  }));

export const PromptLabPage = (): JSX.Element => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { project } = useProject(projectId);
  const { gameDesignDoc } = useGameDesignDoc(projectId);
  const { stages, createStages, replaceStages, updateStageStatus } =
    useBuildStages(projectId);
  const { files } = useVaultFiles(projectId);
  const { artifacts } = useArtifacts(projectId);
  const { defaultProvider } = useAIProviders();
  const promptLabSession = usePromptLabSessionStore((state) =>
    projectId ? state.sessions[projectId] : undefined
  );
  const setPlanningQuestions = usePromptLabSessionStore(
    (state) => state.setPlanningQuestions
  );
  const setHasSkippedVaultPreflight = usePromptLabSessionStore(
    (state) => state.setHasSkippedVaultPreflight
  );
  const setHasSkippedClarifyingRound = usePromptLabSessionStore(
    (state) => state.setHasSkippedClarifyingRound
  );
  const setTargetPlatform = usePromptLabSessionStore(
    (state) => state.setTargetPlatform
  );

  const activeVaultFiles = useMemo(
    () => files.filter((file) => file.isActiveContext),
    [files]
  );
  const hostedRuntime = isHostedRuntime();
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [isExportingPlanningPackage, setIsExportingPlanningPackage] =
    useState(false);
  const [isPolishingRoadmap, setIsPolishingRoadmap] = useState(false);
  const [pendingScrollStageId, setPendingScrollStageId] = useState<string | null>(
    null
  );
  const [highlightedStageId, setHighlightedStageId] = useState<string | null>(
    null
  );
  const [isLoadingPlanningQuestions, setIsLoadingPlanningQuestions] =
    useState(false);
  const [roadmapDraft, setRoadmapDraft] = useState<RoadmapDraftReview | null>(
    null
  );

  const availableTargets = useMemo(
    () => project?.agentTargets ?? ["codex", "cursor", "claude-code"],
    [project?.agentTargets]
  );
  const targetPlatform =
    promptLabSession?.targetPlatform ?? availableTargets[0] ?? "codex";
  const planningQuestions = promptLabSession?.planningQuestions ?? [];
  const hasSkippedVaultPreflight =
    promptLabSession?.hasSkippedVaultPreflight ?? false;
  const hasSkippedClarifyingRound =
    promptLabSession?.hasSkippedClarifyingRound ?? false;
  const connectedToolPlatform = defaultProvider
    ? getPreferredAgentPlatformForProvider(defaultProvider.provider)
    : null;
  const aiActionCopy = useMemo(
    () =>
      getAiActionCopy({
        connectedProvider: defaultProvider?.provider ?? null,
        selectedTargetPlatform: targetPlatform
      }),
    [defaultProvider?.provider, targetPlatform]
  );
  const planningNotes = useMemo(
    () => buildPlanningNotes(planningQuestions),
    [planningQuestions]
  );
  const needsClarifyingRound =
    Boolean(defaultProvider) &&
    !hasSkippedClarifyingRound &&
    planningQuestions.length === 0;

  const navigateToVault = (): void => {
    if (!projectId) {
      return;
    }

    navigate(getProjectTabPath(projectId, "vault"));
  };

  const navigateToSettings = (): void => {
    navigate("/settings");
  };

  const cycleStatus = async (stage: BuildStage): Promise<void> => {
    const nextStatus =
      stage.status === "not-started"
        ? "in-progress"
        : stage.status === "in-progress"
          ? "complete"
          : stage.status === "complete"
            ? "not-started"
            : "locked";

    await updateStageStatus(stage.id, nextStatus);

    if (nextStatus === "complete") {
      const nextStage = stages.find(
        (candidate) => candidate.stageNumber === stage.stageNumber + 1
      );
      if (nextStage && nextStage.status === "locked") {
        await updateStageStatus(nextStage.id, "not-started");
      }
    }
  };

  const handleGeneratePlanningQuestions = async (): Promise<void> => {
    if (!project || !gameDesignDoc) {
      toast.error("Project context is still loading.");
      return;
    }

    if (!defaultProvider) {
      toast.warning(
        hostedRuntime
          ? "Connect OpenRouter or an API-key provider in Settings to run a clarifying round in the hosted app."
          : "Connect an AI provider in Settings to run a clarifying round."
      );
      return;
    }

    const projectContext = buildPlanningQuestionsContext(
      project.title,
      [
        `Pitch: ${project.oneLinePitch || "TBD"}`,
        `Genre: ${project.genre || "TBD"} / ${project.subgenre || "TBD"}`,
        `Scope: ${project.scopeCategory}`,
        `Typical Session: ${gameDesignDoc.concept.sessionLength || "TBD"}`,
        `Player Fantasy: ${gameDesignDoc.concept.playerFantasy || "TBD"}`,
        `Design Pillars: ${
          gameDesignDoc.designPillars.pillars.join(" | ") || "TBD"
        }`,
        `Core Loop: ${gameDesignDoc.coreLoop.secondToSecond || "TBD"}`,
        `Technical Constraints: ${
          gameDesignDoc.technicalDesign.platformConstraints || "TBD"
        }`
      ].join("\n"),
      stages.length > 0
        ? stages
            .map((stage) => `${stage.stageNumber}. ${stage.name} [${stage.status}]`)
            .join(" | ")
        : "No roadmap generated yet",
      activeVaultFiles
    );

    setIsLoadingPlanningQuestions(true);
    try {
      const response = await generateWithAgent(
        "planning-questions",
        buildPlanningQuestionsPrompt(
          project.title,
          aiActionCopy.selectedTargetLabel ?? getAgentPlatformLabel(targetPlatform),
          projectContext
        ),
        undefined,
        project.id
      );
      setPlanningQuestions(project.id, parsePlanningQuestions(response));
      setHasSkippedClarifyingRound(project.id, false);
      toast.success("Planning questions ready.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not generate planning questions right now."
      );
    } finally {
      setIsLoadingPlanningQuestions(false);
    }
  };

  const handleGenerateRoadmap = async (): Promise<void> => {
    if (!project || !gameDesignDoc) {
      toast.error("Project context is still loading.");
      return;
    }

    setIsGeneratingRoadmap(true);

    try {
      const generatedStages = await generateBuildStages({
        gameDesignDoc,
        planningNotes,
        project,
        targetPlatform
      });

      if (stages.length > 0) {
        const hydratedStages = hydrateGeneratedStages(project.id, generatedStages);
        setRoadmapDraft(
          buildDraftFromExistingStages({
            currentStages: stages,
            nextStages: hydratedStages,
            rawResponse: serializeBuildStages(hydratedStages),
            sourceLabel: "Regenerated roadmap draft",
            summary:
              "Review the regenerated roadmap and apply it only if it better matches the latest design context and clarifying notes.",
            title: "Regenerated roadmap draft"
          })
        );
        toast.success("Regenerated roadmap draft ready for review.");
        return;
      }

      const nextStages = await createStages(generatedStages);
      setPendingScrollStageId(
        nextStages.find((stage) => stage.status === "not-started")?.id ??
          nextStages[0]?.id ??
          null
      );
      toast.success("Build roadmap generated.");
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const handlePolishRoadmap = async (): Promise<void> => {
    if (!project || !defaultProvider || stages.length === 0) {
      return;
    }

    setIsPolishingRoadmap(true);
    try {
      const response = await generateWithAgent(
        "roadmap-polish",
        buildFullRoadmapPolishPrompt({
          activeVaultFiles,
          currentStages: stages,
          planningNotes,
          projectTitle: project.title,
          targetToolLabel:
            aiActionCopy.connectedToolLabel ??
            aiActionCopy.selectedTargetLabel ??
            getAgentPlatformLabel(targetPlatform)
        }),
        undefined,
        project.id
      );

      setRoadmapDraft(
        parseRoadmapPolishResponse({
          content: response,
          currentStages: stages
        })
      );
      toast.success("Polished roadmap draft ready for review.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not polish the roadmap right now."
      );
    } finally {
      setIsPolishingRoadmap(false);
    }
  };

  const handleApplyRoadmapDraft = async (): Promise<void> => {
    if (!roadmapDraft) {
      return;
    }

    const appliedStages = await replaceStages(roadmapDraft.revisedStages);
    const nextStages =
      Array.isArray(appliedStages) && appliedStages.length > 0
        ? appliedStages
        : roadmapDraft.revisedStages;
    setPendingScrollStageId(
      nextStages.find((stage) => stage.status === "not-started")?.id ??
        nextStages.find((stage) => stage.status === "in-progress")?.id ??
        nextStages[0]?.id ??
        null
    );
    setRoadmapDraft(null);
    toast.success("Roadmap draft applied.");
  };

  const handleExportPlanningPackage = async (): Promise<void> => {
    if (!project || !gameDesignDoc) {
      toast.error("Project context is still loading.");
      return;
    }

    setIsExportingPlanningPackage(true);
    try {
      await exportPlanningPackage({
        artifacts,
        gameDesignDoc,
        project,
        stages,
        vaultFiles: files
      });
      toast.success("Planning package exported.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not export the planning package right now."
      );
    } finally {
      setIsExportingPlanningPackage(false);
    }
  };

  useEffect(() => {
    if (!pendingScrollStageId) {
      return;
    }

    const stageExists = stages.some((stage) => stage.id === pendingScrollStageId);
    if (!stageExists) {
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      const stageElement = document.querySelector<HTMLElement>(
        `[data-build-stage-id="${pendingScrollStageId}"]`
      );
      const primaryAction = stageElement?.querySelector<HTMLElement>(
        "[data-build-stage-primary-action='true']"
      );
      (primaryAction ?? stageElement)?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
      setHighlightedStageId(pendingScrollStageId);
      setPendingScrollStageId(null);
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [pendingScrollStageId, stages]);

  useEffect(() => {
    if (!highlightedStageId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setHighlightedStageId(null);
    }, 3500);

    return () => window.clearTimeout(timeoutId);
  }, [highlightedStageId]);

  if (!project || !gameDesignDoc) {
    return (
      <GameSectionLayout
        title="Prompt Lab"
        description="Loading prompt lab workspace."
      >
        <div className="h-64 animate-pulse rounded-3xl bg-surface-container-high" />
      </GameSectionLayout>
    );
  }

  const isLargeMode = project.scopeCategory === "large";
  const legacyLargePlan = isLegacyLargeBuildPlan(project.scopeCategory, stages);
  const nextActionStage =
    stages.find((stage) => stage.status === "not-started") ??
    stages.find((stage) => stage.status === "in-progress") ??
    null;
  const totalStages = stages.reduce(
    (max, stage) => Math.max(max, stage.stageNumber),
    0
  );

  return (
    <GameSectionLayout
      eyebrow="Planning Engine"
      title="Prompt Lab"
      description="Guide planning, gather context, let AI ask a few project-specific questions, then generate a build roadmap and send supporting docs to Output Library."
    >
      {isLargeMode ? (
        <div className="rounded-3xl border border-amber-300/15 bg-amber-500/5 px-5 py-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-amber-100">
            Large Project Mode
          </p>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">
            Prompt Lab will generate more prescriptive production guidance for
            this project, including milestone gates, content budgets, dependency
            boundaries, and cut-discipline framing.
          </p>
          {legacyLargePlan ? (
            <p className="mt-2 text-sm leading-6 text-amber-100/90">
              This project still has the older 12-stage roadmap. Regenerating
              the build roadmap will align staged implementation prompts with
              Large Project Mode.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-4 rounded-3xl border border-outline-variant/10 bg-surface p-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
        <div className="space-y-4">
          <p className="text-sm leading-6 text-on-surface-variant">
            Start with references, run one short clarifying round if AI is connected, then generate and track the build roadmap.
          </p>
          <p className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm leading-6 text-on-surface-variant">
            {GENERATION_WAIT_NOTE}
          </p>
        </div>

        <GameField label="Primary Agent Target">
          <GameSelect
            value={targetPlatform}
            onChange={(event) =>
              setTargetPlatform(project.id, event.target.value)
            }
          >
            {availableTargets.map((platform) => (
              <option key={platform} value={platform}>
                {getAgentPlatformLabel(platform)}
              </option>
            ))}
          </GameSelect>
        </GameField>
      </div>

      <div className="space-y-6">
        <section className="rounded-3xl border border-outline-variant/10 bg-surface p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
                Vault Context
              </p>
              <h2 className="mt-2 font-headline text-2xl font-semibold text-on-surface">
                Add references before you generate
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-on-surface-variant">
                Vault files are recommended context for roadmap generation. Upload mocks, screenshots, notes, or technical references first if you have them. You can still continue without them.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={navigateToVault}
                className="rounded-2xl border border-outline-variant/15 bg-surface-container px-4 py-3 text-sm font-semibold text-on-surface transition hover:bg-surface-container-high"
              >
                {activeVaultFiles.length > 0
                  ? "Manage Vault Context"
                  : "Add References First"}
              </button>
              {activeVaultFiles.length === 0 ? (
                <button
                  type="button"
                  onClick={() => setHasSkippedVaultPreflight(project.id, true)}
                  className="rounded-2xl border border-outline-variant/15 bg-surface px-4 py-3 text-sm text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
                >
                  Skip for now
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-4">
            {activeVaultFiles.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {activeVaultFiles.map((file) => (
                  <span
                    key={file.id}
                    className="rounded-full bg-surface-container-high px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-on-surface-variant"
                  >
                    {file.name}
                  </span>
                ))}
              </div>
            ) : hasSkippedVaultPreflight ? (
              <p className="text-sm text-on-surface-variant">
                Continuing without vault context for now.
              </p>
            ) : (
              <p className="text-sm text-on-surface-variant">
                No active vault files yet.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-outline-variant/10 bg-surface p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
                Clarifying Round
              </p>
              <h2 className="mt-2 font-headline text-2xl font-semibold text-on-surface">
                Let AI ask the project-specific questions first
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-on-surface-variant">
                Use one short AI planning pass to surface the missing decisions that will make the roadmap and prompt outputs more useful.
              </p>
            </div>

            {defaultProvider ? (
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void handleGeneratePlanningQuestions()}
                  disabled={isLoadingPlanningQuestions}
                  className="rounded-2xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition hover:border-primary/35 hover:bg-primary/15 disabled:opacity-50"
                >
                  {isLoadingPlanningQuestions
                    ? "Preparing questions…"
                    : aiActionCopy.planningAssistLabel}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHasSkippedClarifyingRound(project.id, true);
                    setPlanningQuestions(project.id, []);
                  }}
                  className="rounded-2xl border border-outline-variant/15 bg-surface-container px-4 py-3 text-sm text-on-surface transition hover:bg-surface-container-high"
                >
                  Skip this round
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={navigateToSettings}
                  className="rounded-2xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition hover:border-primary/35 hover:bg-primary/15"
                >
                  Connect AI to generate
                </button>
              </div>
            )}
          </div>

          {!defaultProvider ? (
            <div className="mt-4 space-y-3">
              <p className="text-sm leading-6 text-on-surface-variant">
                No AI provider is connected. You can still generate the roadmap locally and keep planning without AI.
              </p>
              <p className="rounded-2xl border border-outline-variant/10 bg-surface-container px-4 py-3 text-sm leading-6 text-on-surface-variant">
                Connect AI if you want project-specific question generation here. Roadmap generation still works without it.
                {hostedRuntime
                  ? " In the hosted app, OpenRouter and API-key providers are the fastest path."
                  : ""}
              </p>
              {hostedRuntime ? (
                <p className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm leading-6 text-on-surface-variant">
                  Want Codex or Claude Code instead? Download the desktop app for local bridge sign-in:{" "}
                  <a
                    href={APP_LATEST_DESKTOP_RELEASE_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-primary underline decoration-primary/40 underline-offset-4"
                  >
                    latest desktop release
                  </a>
                  .
                </p>
              ) : null}
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <p className="rounded-2xl border border-outline-variant/10 bg-surface-container px-4 py-3 text-sm leading-6 text-on-surface-variant">
                Planning help here uses your connected AI:{" "}
                <span className="font-semibold text-on-surface">
                  {aiActionCopy.connectedToolLabel}
                </span>
                . The roadmap itself still generates locally.
              </p>
              {planningQuestions.length > 0 ? (
                <div className="space-y-4">
                  {planningQuestions.map((question, index) => (
                    <div
                      key={question.id}
                      className="rounded-2xl border border-outline-variant/10 bg-surface-container p-4"
                    >
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                        Question {index + 1}
                      </p>
                      <p className="mt-2 text-base font-medium text-on-surface">
                        {question.question}
                      </p>
                      <p className="mt-2 text-sm text-on-surface-variant">
                        {question.rationale}
                      </p>
                      <textarea
                        value={question.answer}
                        onChange={(event) =>
                          setPlanningQuestions(
                            project.id,
                            planningQuestions.map((item) =>
                              item.id === question.id
                                ? { ...item, answer: event.target.value }
                                : item
                            )
                          )
                        }
                        placeholder="Answer if you know it now. Leave blank if it is still open."
                        className="mt-3 min-h-28 w-full resize-y rounded-2xl border border-outline-variant/10 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary/40"
                      />
                    </div>
                  ))}
                  <div className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-4 text-sm leading-6 text-on-surface-variant">
                    <p className="font-medium text-on-surface">
                      Answers are used automatically in the next generation pass.
                    </p>
                    <p className="mt-1">
                      You do not need to submit them separately. They are kept in this planning round and will be folded into the next roadmap or output generation without overwriting the main design doc.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm leading-6 text-on-surface-variant">
                  {hasSkippedClarifyingRound
                    ? "Clarifying round skipped. You can generate the roadmap directly."
                    : "Run this once if you want the roadmap to ask better questions before it locks into a direction."}
                </p>
              )}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-outline-variant/10 bg-surface p-5">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
                Build Roadmap
              </p>
              <h2 className="mt-2 font-headline text-2xl font-semibold text-on-surface">
                Generate the staged roadmap
              </h2>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                This creates the persistent stage timeline, handoff briefs, and checkpoint order for the project. It does not build the game for you.
              </p>
              <p className="mt-3 rounded-2xl border border-outline-variant/10 bg-surface-container px-4 py-3 text-sm leading-6 text-on-surface-variant">
                After roadmap generation, you can export a full planning package here. Individual generated files can be created and downloaded separately from Output Library.
              </p>
              {planningNotes ? (
                <p className="mt-3 rounded-2xl border border-secondary/15 bg-secondary/5 px-4 py-3 text-sm leading-6 text-on-surface-variant">
                  Your clarifying answers will be folded into this roadmap generation pass automatically.
                </p>
              ) : null}
            </div>

            <div className="space-y-4">
              <GameField label="Roadmap Target">
                <GameSelect
                  value={targetPlatform}
                  onChange={(event) =>
                    setTargetPlatform(project.id, event.target.value)
                  }
                >
                  {availableTargets.map((platform) => (
                    <option key={platform} value={platform}>
                      {getAgentPlatformLabel(platform)}
                    </option>
                  ))}
                </GameSelect>
              </GameField>
              <button
                type="button"
                onClick={() => void handleGenerateRoadmap()}
                disabled={needsClarifyingRound || isGeneratingRoadmap}
                className="gradient-cta glow-primary w-full rounded-2xl px-4 py-3 text-sm font-semibold text-on-primary disabled:opacity-50"
              >
                {isGeneratingRoadmap
                  ? "Generating roadmap…"
                  : stages.length > 0
                    ? "Regenerate Build Roadmap"
                    : "Generate Build Roadmap"}
              </button>
              {stages.length > 0 ? (
                defaultProvider ? (
                  <button
                    type="button"
                    onClick={() => void handlePolishRoadmap()}
                    disabled={isPolishingRoadmap}
                    className="w-full rounded-2xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition hover:border-primary/35 hover:bg-primary/15 disabled:opacity-50"
                  >
                    {isPolishingRoadmap
                      ? "Polishing roadmap…"
                      : aiActionCopy.roadmapPolishLabel}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={navigateToSettings}
                    className="w-full rounded-2xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition hover:border-primary/35 hover:bg-primary/15"
                  >
                    {aiActionCopy.connectAiLabel}
                  </button>
                )
              ) : null}
              <button
                type="button"
                onClick={() => exportAllPrompts(stages)}
                disabled={stages.length === 0}
                className="w-full rounded-2xl border border-outline-variant/15 bg-surface-container px-4 py-3 text-sm text-on-surface disabled:opacity-50"
              >
                Export Roadmap Briefs
              </button>
              <button
                type="button"
                onClick={() => void handleExportPlanningPackage()}
                disabled={isExportingPlanningPackage}
                className="w-full rounded-2xl border border-outline-variant/15 bg-surface px-4 py-3 text-sm text-on-surface transition hover:bg-surface-container-high disabled:opacity-50"
              >
                {isExportingPlanningPackage
                  ? "Exporting Planning Package…"
                  : "Export Planning Package (.zip)"}
              </button>
              {needsClarifyingRound ? (
                <p className="text-sm text-on-surface-variant">
                  Run or skip the clarifying round first so the roadmap can use the latest planning context.
                </p>
              ) : null}
              {stages.length > 0 ? (
                <p className="text-sm text-on-surface-variant">
                  Roadmap polish creates a review draft only. Your current roadmap stays untouched until you apply the draft.
                </p>
              ) : null}
            </div>
          </div>
        </section>

        {roadmapDraft ? (
          <section className="rounded-3xl border border-secondary/15 bg-secondary/5 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-secondary">
                  {roadmapDraft.sourceLabel}
                </p>
                <h3 className="mt-2 font-headline text-2xl font-semibold text-on-surface">
                  {roadmapDraft.title}
                </h3>
                <p className="mt-3 max-w-4xl text-sm leading-6 text-on-surface-variant">
                  {roadmapDraft.summary}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void handleApplyRoadmapDraft()}
                  className="gradient-cta glow-primary rounded-2xl px-4 py-3 text-sm font-semibold text-on-primary"
                >
                  Apply Draft
                </button>
                <button
                  type="button"
                  onClick={() => setRoadmapDraft(null)}
                  className="rounded-2xl border border-outline-variant/15 bg-surface px-4 py-3 text-sm font-semibold text-on-surface transition hover:bg-surface-container-high"
                >
                  Discard Draft
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-outline-variant/10 bg-surface px-4 py-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                  Sequencing issues
                </p>
                {roadmapDraft.sequencingIssues.length > 0 ? (
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-on-surface-variant">
                    {roadmapDraft.sequencingIssues.map((issue) => (
                      <li key={issue}>• {issue}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                    No sequencing changes were called out beyond the revised stage order below.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-outline-variant/10 bg-surface px-4 py-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                  Risks
                </p>
                {roadmapDraft.risks.length > 0 ? (
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-on-surface-variant">
                    {roadmapDraft.risks.map((risk) => (
                      <li key={risk}>• {risk}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                    No new roadmap-level risks were called out.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-outline-variant/10 bg-surface px-4 py-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                  Scope cuts
                </p>
                {roadmapDraft.scopeCuts.length > 0 ? (
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-on-surface-variant">
                    {roadmapDraft.scopeCuts.map((cut) => (
                      <li key={cut}>• {cut}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                    No additional cuts were recommended in this draft.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-outline-variant/10 bg-surface px-4 py-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                Revised stage order
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {roadmapDraft.revisedStages.map((stage) => (
                  <span
                    key={stage.id}
                    className="rounded-full bg-surface-container-high px-3 py-1 text-xs text-on-surface"
                  >
                    {stage.stageNumber}. {stage.name}
                  </span>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {stages.length > 0 ? (
          <section className="space-y-4">
            {nextActionStage ? (
              <div className="rounded-3xl border border-primary/15 bg-primary/5 px-5 py-5 shadow-[0_12px_32px_rgba(116,88,255,0.08)]">
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary">
                  Next recommended action
                </p>
                <p className="mt-3 text-lg font-semibold leading-8 text-on-surface sm:text-xl">
                  Open <span className="text-primary">{nextActionStage.name}</span> and
                  review the stage brief.{" "}
                  {defaultProvider ? (
                    <span className="text-primary">{aiActionCopy.planningAssistLabel}</span>
                  ) : (
                    <span className="text-primary">
                      Connect AI if you want planning help, or copy the stage brief
                    </span>
                  )}
                  .
                </p>
                <p className="mt-3 max-w-4xl text-sm leading-6 text-on-surface-variant sm:text-base">
                  Use the AI action to tighten the handoff if you want help, but keep implementation in your actual build environment. Mark the stage as started when real build work begins.
                </p>
                {defaultProvider &&
                connectedToolPlatform &&
                connectedToolPlatform !== nextActionStage.platform ? (
                  <p className="mt-3 text-sm leading-6 text-on-surface-variant sm:text-base">
                    This stage still recommends{" "}
                    <span className="font-semibold text-on-surface">
                      {getAgentPlatformLabel(nextActionStage.platform)}
                    </span>{" "}
                    for implementation handoff. Your connected AI is only being used here for planning help.
                  </p>
                ) : null}
                {!defaultProvider ? (
                  <p className="mt-3 text-sm leading-6 text-on-surface-variant sm:text-base">
                    No provider is connected yet, so stage-level planning help will ask you to connect AI first. Copying briefs and tracking stage status still work now.
                    {hostedRuntime
                      ? " In the hosted app, use OpenRouter or an API-key provider if you want planning help here."
                      : ""}
                  </p>
                ) : null}
              </div>
            ) : null}

            {stages.map((stage) => {
              const stageActionCopy = getAiActionCopy({
                connectedProvider: defaultProvider?.provider ?? null,
                stageRecommendedPlatform: stage.platform
              });

              return (
                <BuildStageCard
                  actionToolLabel={stageActionCopy.connectedToolLabel}
                  connectAiLabel={stageActionCopy.connectAiLabel}
                  key={stage.id}
                  planningAssistLabel={
                    defaultProvider ? stageActionCopy.roadmapPolishLabel : undefined
                  }
                  planningAssistResponseLabel={
                    defaultProvider
                      ? stageActionCopy.planningAssistResponseLabel
                      : undefined
                  }
                  highlightPrimaryAction={highlightedStageId === stage.id}
                  isActionSpotlighted={highlightedStageId === stage.id}
                  isNextRecommended={nextActionStage?.id === stage.id}
                  onConnectToAI={!defaultProvider ? navigateToSettings : undefined}
                  onPlanningAssist={
                    defaultProvider
                      ? async (nextStage) =>
                          generateWithAgent(
                            "roadmap-polish",
                            buildStagePlanningReviewPrompt(
                              nextStage,
                              project.title,
                              getAgentPlatformLabel(nextStage.platform)
                            ),
                            undefined,
                            project.id
                          )
                      : undefined
                  }
                  onStatusChange={(nextStage) => void cycleStatus(nextStage)}
                  stage={stage}
                  totalStages={totalStages}
                />
              );
            })}

            <div className="rounded-3xl border border-outline-variant/10 bg-surface p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
                Suggested next outputs
              </p>
              <h3 className="mt-2 font-headline text-xl font-semibold text-on-surface">
                Generate the docs that support this roadmap
              </h3>
              <div className="mt-4 flex flex-wrap gap-3">
                {SUGGESTED_NEXT_OUTPUTS.map((outputType) => {
                  const definition = getOutputDefinition(outputType);
                  if (!definition) {
                    return null;
                  }

                  return (
                    <button
                      key={outputType}
                      type="button"
                      onClick={() =>
                        navigate(
                          getProjectTabPath(project.id, "output-library", {
                            output: outputType
                          })
                        )
                      }
                      className="rounded-2xl border border-outline-variant/15 bg-surface-container px-4 py-3 text-sm font-semibold text-on-surface transition hover:bg-surface-container-high"
                    >
                      {definition.title}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        ) : (
          <div className="rounded-3xl border border-dashed border-outline-variant/20 bg-surface px-6 py-16 text-center">
            <p className="font-headline text-2xl font-semibold text-on-surface">
              No build roadmap yet
            </p>
            <p className="mt-3 text-sm text-on-surface-variant">
              Generate the first roadmap after you have enough concept, design, and context to guide the stage order.
            </p>
          </div>
        )}
      </div>

      <WorkspacePageNavigation currentTabId="prompt-lab" />
    </GameSectionLayout>
  );
};
