import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { OutputPanel } from "@/components/shared/OutputPanel";
import { WorkspacePageNavigation } from "@/components/workspace/WorkspacePageNavigation";
import {
  GameField,
  GameSectionLayout,
  GameSelect
} from "@/components/workspace/game/GameSectionLayout";
import { useArtifacts } from "@/hooks/useArtifacts";
import { useBuildStages } from "@/hooks/useBuildStages";
import { useGameDesignDoc } from "@/hooks/useGameDesignDoc";
import { useProject } from "@/hooks/useProject";
import { useToast } from "@/hooks/useToast";
import { isLegacyLargeBuildPlan } from "@/lib/buildPlanUtils";
import { getAgentPlatformLabel } from "@/lib/gameProjectUtils";
import { getOutputDefinition, PROMPT_LAB_OUTPUTS } from "@/services/generation/outputDefinitions";
import { generatePromptLabOutput } from "@/services/generation/promptLabGeneration";
import { useVaultFiles } from "@/hooks/useVaultFiles";
import type { ArtifactType } from "@/types";

export const PromptLabPage = (): JSX.Element => {
  const { projectId } = useParams();
  const toast = useToast();
  const { project } = useProject(projectId);
  const { gameDesignDoc } = useGameDesignDoc(projectId);
  const { stages } = useBuildStages(projectId);
  const { files } = useVaultFiles(projectId);
  const { artifacts, createArtifact, getLatestByType } = useArtifacts(projectId);
  const [targetPlatform, setTargetPlatform] = useState("codex");
  const [activeOutput, setActiveOutput] = useState<ArtifactType>("full_gdd");
  const [streamingByType, setStreamingByType] = useState<Partial<Record<ArtifactType, string>>>({});
  const [loadingByType, setLoadingByType] = useState<Partial<Record<ArtifactType, boolean>>>({});

  const availableTargets = useMemo(
    () => project?.agentTargets ?? ["codex", "cursor", "claude-code"],
    [project?.agentTargets]
  );

  const handleGenerate = async (outputType: ArtifactType): Promise<void> => {
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
          "build-plan",
          ...files.filter((file) => file.isActiveContext).map((file) => `vault:${file.id}`)
        ],
        platform: targetPlatform,
        type: outputType,
        version: artifacts.filter((artifact) => artifact.type === outputType).length + 1
      });

      toast.success(`${definition.title} generated.`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Generation failed. Check Settings and try again."
      );
    } finally {
      setLoadingByType((current) => ({ ...current, [outputType]: false }));
    }
  };

  if (!project || !gameDesignDoc) {
    return (
      <GameSectionLayout title="Prompt Lab" description="Loading prompt lab workspace.">
        <div className="h-64 animate-pulse rounded-3xl bg-surface-container-high" />
      </GameSectionLayout>
    );
  }

  const isLargeMode = project.scopeCategory === "large";
  const legacyLargePlan = isLegacyLargeBuildPlan(project.scopeCategory, stages);

  return (
    <GameSectionLayout
      eyebrow="Output Engine"
      title="Prompt Lab"
      description="Generate copy-ready outputs for planning, pitching, staging AI implementation, art direction, playtests, and scope control. The lab works with AI providers when configured and falls back to deterministic local outputs when they are not."
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
              This project still has the older 12-stage build plan. Regenerating
              Build Plan will align staged implementation prompts with Large
              Project Mode.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-6 rounded-3xl border border-outline-variant/10 bg-surface p-5 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div>
          <p className="text-sm leading-6 text-on-surface-variant">
            Use the target selector to bias system prompts and staged implementation copy toward the AI tool you actually plan to use.
          </p>
        </div>
        <GameField label="Primary Agent Target">
          <GameSelect
            value={targetPlatform}
            onChange={(event) => setTargetPlatform(event.target.value)}
          >
            {availableTargets.map((platform) => (
              <option key={platform} value={platform}>
                {getAgentPlatformLabel(platform)}
              </option>
            ))}
          </GameSelect>
        </GameField>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="rounded-3xl border border-outline-variant/10 bg-surface p-4">
          <div className="space-y-2">
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

        <div className="space-y-6">
          {PROMPT_LAB_OUTPUTS.filter((definition) => definition.type === activeOutput).map(
            (definition) => {
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
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleGenerate(definition.type)}
                      className="gradient-cta glow-primary rounded-2xl px-4 py-3 text-sm font-semibold text-on-primary"
                    >
                      Generate Output
                    </button>
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
            }
          )}
        </div>
      </div>

      <WorkspacePageNavigation currentTabId="prompt-lab" />
    </GameSectionLayout>
  );
};
