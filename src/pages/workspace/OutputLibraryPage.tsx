import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { WorkspacePageNavigation } from "@/components/workspace/WorkspacePageNavigation";
import {
  GameField,
  GameSectionLayout,
  GameSelect
} from "@/components/workspace/game/GameSectionLayout";
import { getProjectTabPath } from "@/components/layout/sidebarConfig";
import { OutputPanel } from "@/components/shared/OutputPanel";
import { useAIProviders } from "@/hooks/useAIProviders";
import { useArtifacts } from "@/hooks/useArtifacts";
import { useBuildStages } from "@/hooks/useBuildStages";
import { useGameDesignDoc } from "@/hooks/useGameDesignDoc";
import { useProject } from "@/hooks/useProject";
import { useToast } from "@/hooks/useToast";
import { useVaultFiles } from "@/hooks/useVaultFiles";
import { getAgentPlatformLabel } from "@/lib/gameProjectUtils";
import { exportPlanningPackage } from "@/lib/planningPackageExport";
import { buildPlanningNotes } from "@/lib/planningQuestions";
import {
  getOutputDefinition,
  PROMPT_LAB_OUTPUTS
} from "@/services/generation/outputDefinitions";
import { generatePromptLabOutput } from "@/services/generation/promptLabGeneration";
import { usePromptLabSessionStore } from "@/stores/promptLabSessionStore";
import type { ArtifactType } from "@/types";

const GENERATION_WAIT_NOTE =
  "This may take a while depending on your provider. Typical generation takes around a minute.";

const isArtifactType = (value: string | null): value is ArtifactType =>
  PROMPT_LAB_OUTPUTS.some((definition) => definition.type === value);

const getActiveOutputFromSearch = (search: string): ArtifactType => {
  const output = new URLSearchParams(search).get("output");
  return isArtifactType(output) ? output : "full_gdd";
};

export const OutputLibraryPage = (): JSX.Element => {
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { project } = useProject(projectId);
  const { gameDesignDoc } = useGameDesignDoc(projectId);
  const { stages } = useBuildStages(projectId);
  const { files } = useVaultFiles(projectId);
  const { artifacts, createArtifact, getLatestByType } = useArtifacts(projectId);
  const { defaultProvider } = useAIProviders();
  const promptLabSession = usePromptLabSessionStore((state) =>
    projectId ? state.sessions[projectId] : undefined
  );
  const setTargetPlatform = usePromptLabSessionStore(
    (state) => state.setTargetPlatform
  );

  const availableTargets = useMemo(
    () => project?.agentTargets ?? ["codex", "cursor", "claude-code"],
    [project?.agentTargets]
  );
  const targetPlatform =
    promptLabSession?.targetPlatform ?? availableTargets[0] ?? "codex";
  const planningNotes = useMemo(
    () => buildPlanningNotes(promptLabSession?.planningQuestions ?? []),
    [promptLabSession?.planningQuestions]
  );
  const activeOutput = getActiveOutputFromSearch(location.search);
  const [streamingByType, setStreamingByType] = useState<
    Partial<Record<ArtifactType, string>>
  >({});
  const [loadingByType, setLoadingByType] = useState<
    Partial<Record<ArtifactType, boolean>>
  >({});
  const [isExportingPlanningPackage, setIsExportingPlanningPackage] =
    useState(false);

  const setActiveOutput = (outputType: ArtifactType): void => {
    if (!projectId) {
      return;
    }

    navigate(
      getProjectTabPath(projectId, "output-library", { output: outputType }),
      { replace: outputType === activeOutput }
    );
  };

  const navigateToSettings = (): void => {
    navigate("/settings");
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

  const handleGenerateOutput = async (outputType: ArtifactType): Promise<void> => {
    if (!project || !gameDesignDoc) {
      toast.error("Project context is still loading.");
      return;
    }

    const definition = getOutputDefinition(outputType);
    if (!definition) {
      return;
    }

    setActiveOutput(outputType);
    setLoadingByType((current) => ({ ...current, [outputType]: true }));
    setStreamingByType((current) => ({ ...current, [outputType]: "" }));

    try {
      const content = await generatePromptLabOutput({
        buildStages: stages,
        gameDesignDoc,
        onChunk: (chunk) =>
          setStreamingByType((current) => ({
            ...current,
            [outputType]: `${current[outputType] ?? ""}${chunk}`
          })),
        outputType,
        planningNotes,
        project,
        targetAgentPlatform: targetPlatform,
        vaultFiles: files
      });

      await createArtifact({
        agentSystemPromptId: `${definition.agentType}-default`,
        content,
        contextNodes: [
          "concept",
          "design-pillars",
          "core-loop",
          "controls-feel",
          "content-bible",
          "art-tone",
          "technical-design",
          "build-roadmap",
          ...files
            .filter((file) => file.isActiveContext)
            .map((file) => `vault:${file.id}`)
        ],
        platform: targetPlatform,
        type: outputType,
        version: artifacts.filter((artifact) => artifact.type === outputType).length + 1
      });

      toast.success(`${definition.title} generated.`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Generation failed. Check Settings and try again."
      );
    } finally {
      setLoadingByType((current) => ({ ...current, [outputType]: false }));
    }
  };

  if (!project || !gameDesignDoc) {
    return (
      <GameSectionLayout
        title="Output Library"
        description="Loading output library workspace."
      >
        <div className="h-64 animate-pulse rounded-3xl bg-surface-container-high" />
      </GameSectionLayout>
    );
  }

  return (
    <GameSectionLayout
      eyebrow="Download Center"
      title="Output Library"
      description="Generate the individual planning documents, prompts, and export bundles that support the roadmap."
    >
      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="rounded-3xl border border-outline-variant/10 bg-surface p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
              Output Library
            </p>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">
              Generate individual planning documents and prompt artifacts. Active vault files and any clarifying answers will be used automatically.
            </p>
            <p className="mt-3 rounded-2xl border border-outline-variant/10 bg-surface-container px-4 py-3 text-sm leading-6 text-on-surface-variant">
              Download individual files from each output panel here, or export the full planning package as a zip when you want the whole bundle together.
            </p>
            {!defaultProvider ? (
              <p className="mt-3 rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm leading-6 text-on-surface-variant">
                Output generation here uses your connected AI. Downloads and planning-package export still work anytime, but generating a new output requires connecting a provider first.
              </p>
            ) : null}
            {planningNotes ? (
              <p className="mt-3 rounded-2xl border border-secondary/15 bg-secondary/5 px-4 py-3 text-sm leading-6 text-on-surface-variant">
                Your clarifying answers are active for this generation session and will be included in the next output you generate.
              </p>
            ) : null}
          </div>

          <div className="rounded-3xl border border-outline-variant/10 bg-surface p-4">
            <GameField label="Output Target">
              <GameSelect
                value={targetPlatform}
                onChange={(event) =>
                  projectId
                    ? setTargetPlatform(projectId, event.target.value)
                    : undefined
                }
              >
                {availableTargets.map((platform) => (
                  <option key={platform} value={platform}>
                    {getAgentPlatformLabel(platform)}
                  </option>
                ))}
              </GameSelect>
            </GameField>

            <div className="mt-4 space-y-2">
              {PROMPT_LAB_OUTPUTS.map((definition) => {
                const latestArtifact = getLatestByType(definition.type);
                const isActive = activeOutput === definition.type;

                return (
                  <button
                    key={definition.type}
                    type="button"
                    onClick={() => setActiveOutput(definition.type)}
                    className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                      isActive
                        ? "border-primary/30 bg-primary/10"
                        : "border-outline-variant/10 bg-surface-container hover:border-primary/15 hover:bg-surface-container-high"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-headline text-lg font-semibold text-on-surface">
                          {definition.title}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                          {definition.description}
                        </p>
                      </div>
                      {latestArtifact ? (
                        <span className="rounded-full bg-secondary/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-secondary">
                          v{latestArtifact.version}
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {PROMPT_LAB_OUTPUTS.filter(
            (definition) => definition.type === activeOutput
          ).map((definition) => {
            const latestArtifact = getLatestByType(definition.type);
            const isLoading = Boolean(loadingByType[definition.type]);
            const streamingContent = streamingByType[definition.type] ?? "";

            return (
              <div key={definition.type} className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-outline-variant/10 bg-surface p-5">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary">
                      Prompt Lab Output
                    </p>
                    <h2 className="mt-2 font-headline text-2xl font-semibold text-on-surface">
                      {definition.title}
                    </h2>
                    <p className="mt-2 text-sm text-on-surface-variant">
                      {definition.description}
                    </p>
                    <p className="mt-3 text-sm text-on-surface-variant">
                      {GENERATION_WAIT_NOTE}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => void handleExportPlanningPackage()}
                      disabled={isExportingPlanningPackage}
                      className="rounded-2xl border border-outline-variant/15 bg-surface-container px-4 py-3 text-sm font-semibold text-on-surface transition hover:bg-surface-container-high disabled:opacity-50"
                    >
                      {isExportingPlanningPackage
                        ? "Exporting Planning Package…"
                        : "Export Planning Package (.zip)"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        defaultProvider
                          ? void handleGenerateOutput(definition.type)
                          : navigateToSettings()
                      }
                      className="gradient-cta glow-primary rounded-2xl px-4 py-3 text-sm font-semibold text-on-primary"
                    >
                      {defaultProvider
                        ? "Generate Output"
                        : "Connect AI to generate"}
                    </button>
                  </div>
                </div>

                <OutputPanel
                  title={definition.title}
                  content={latestArtifact?.content ?? null}
                  fileLabel={definition.fileLabel}
                  platforms={definition.recommendedPlatforms}
                  isLoading={isLoading}
                  isStreaming={isLoading && streamingContent.length > 0}
                  streamingContent={streamingContent}
                  emptyTitle={definition.emptyTitle}
                  emptyDescription={definition.emptyDescription}
                  emptyIcon="terminal"
                />
              </div>
            );
          })}
        </div>
      </div>

      <WorkspacePageNavigation currentTabId="output-library" />
    </GameSectionLayout>
  );
};
