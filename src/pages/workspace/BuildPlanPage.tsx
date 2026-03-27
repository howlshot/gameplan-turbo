import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { BuildStageCard } from "@/components/workspace/BuildStageCard";
import { WorkspacePageNavigation } from "@/components/workspace/WorkspacePageNavigation";
import {
  GameField,
  GameSectionLayout,
  GameSelect
} from "@/components/workspace/game/GameSectionLayout";
import { useBuildStages } from "@/hooks/useBuildStages";
import { useAIProviders } from "@/hooks/useAIProviders";
import { useGameDesignDoc } from "@/hooks/useGameDesignDoc";
import { useProject } from "@/hooks/useProject";
import { useToast } from "@/hooks/useToast";
import { isLegacyLargeBuildPlan } from "@/lib/buildPlanUtils";
import { getAgentPlatformLabel } from "@/lib/gameProjectUtils";
import { getPreferredAgentPlatformForProvider } from "@/lib/ai/providerCatalog";
import { generateWithAgent } from "@/services/ai";
import { generateBuildStages, exportAllPrompts } from "@/services/generation/buildGeneration";
import type { BuildStage } from "@/types";

export const BuildPlanPage = (): JSX.Element => {
  const { projectId } = useParams();
  const toast = useToast();
  const { project } = useProject(projectId);
  const { gameDesignDoc } = useGameDesignDoc(projectId);
  const { stages, createStages, updateStageStatus } = useBuildStages(projectId);
  const { defaultProvider } = useAIProviders();
  const [targetPlatform, setTargetPlatform] = useState("codex");

  const availableTargets = useMemo(
    () => project?.agentTargets ?? ["codex", "cursor", "claude-code"],
    [project?.agentTargets]
  );

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

  const handleGenerate = async (): Promise<void> => {
    if (!project || !gameDesignDoc) {
      toast.error("Project context is still loading.");
      return;
    }

    const nextStages = await generateBuildStages({
      gameDesignDoc,
      project,
      targetPlatform
    });

    await createStages(nextStages);
    toast.success("Build plan generated.");
  };

  if (!project || !gameDesignDoc) {
    return (
      <GameSectionLayout title="Build Plan" description="Loading build plan workspace.">
        <div className="h-64 animate-pulse rounded-3xl bg-surface-container-high" />
      </GameSectionLayout>
    );
  }

  const isLargeMode = project.scopeCategory === "large";
  const legacyLargePlan = isLegacyLargeBuildPlan(project.scopeCategory, stages);
  const totalStages = stages.reduce(
    (max, stage) => Math.max(max, stage.stageNumber),
    0
  );
  const nextActionStage =
    stages.find((stage) => stage.status === "not-started") ??
    stages.find((stage) => stage.status === "in-progress") ??
    null;
  const targetLabel = getAgentPlatformLabel(targetPlatform);
  const connectedToolPlatform = defaultProvider
    ? getPreferredAgentPlatformForProvider(defaultProvider.provider)
    : null;

  return (
    <GameSectionLayout
      eyebrow="Implementation Flow"
      title="Build Plan"
      description="Turn the design doc into an ordered sequence of implementation passes. The prompts here are intentionally staged so Codex, Cursor, Claude Code, and similar tools stay aligned."
    >
      {isLargeMode ? (
        <div
          className={`rounded-3xl border px-5 py-4 ${
            legacyLargePlan
              ? "border-amber-300/25 bg-amber-500/10"
              : "border-amber-300/15 bg-amber-500/5"
          }`}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-amber-100">
            Large Project Mode
          </p>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">
            Build Plan is using the expanded indie-studio production model with
            milestone gates, content-budget discipline, and integration-focused stages.
          </p>
          {legacyLargePlan ? (
            <p className="mt-2 text-sm leading-6 text-amber-100/90">
              This project still has the older 12-stage plan. Regenerate Build Plan
              to upgrade it to the 15-stage large-project sequence.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-6 rounded-3xl border border-outline-variant/10 bg-surface p-5 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div>
          <p className="text-sm leading-6 text-on-surface-variant">
            This build plan is generated locally from the game design document, so it still works before any AI provider is configured.
          </p>
        </div>
        <div className="space-y-4">
          <GameField label="Prompt Target">
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
          <button
            type="button"
            onClick={() => void handleGenerate()}
            className="gradient-cta glow-primary w-full rounded-2xl px-4 py-3 text-sm font-semibold text-on-primary"
          >
            {stages.length > 0 ? "Regenerate Build Plan" : "Generate Build Plan"}
          </button>
          <button
            type="button"
            onClick={() => exportAllPrompts(stages)}
            disabled={stages.length === 0}
            className="w-full rounded-2xl border border-outline-variant/15 bg-surface-container px-4 py-3 text-sm text-on-surface disabled:opacity-50"
          >
            Export All Stage Prompts
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {stages.length > 0 ? (
          <>
            {nextActionStage ? (
              <div className="rounded-3xl border border-primary/15 bg-primary/5 px-5 py-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
                  Next recommended action
                </p>
                <p className="mt-2 text-sm leading-6 text-on-surface">
                  Open <span className="font-semibold">{nextActionStage.name}</span>
                  {connectedToolPlatform === nextActionStage.platform ? (
                    <>
                      , then click{" "}
                      <span className="font-semibold">
                        Send to {getAgentPlatformLabel(nextActionStage.platform)}
                      </span>{" "}
                      below to run it with your connected tool. You can still copy
                      the prompt if you want to inspect or paste it manually.
                    </>
                  ) : (
                    <>
                      , copy its prompt into{" "}
                      <span className="font-semibold">{targetLabel}</span>, start
                      the work there, then return here and mark the stage as started.
                    </>
                  )}
                </p>
              </div>
            ) : null}

            {stages.map((stage) => (
              <BuildStageCard
                key={stage.id}
                directSendLabel={
                  connectedToolPlatform === stage.platform
                    ? `Send to ${getAgentPlatformLabel(stage.platform)}`
                    : undefined
                }
                stage={stage}
                totalStages={totalStages}
                isNextRecommended={nextActionStage?.id === stage.id}
                onDirectSend={
                  connectedToolPlatform === stage.platform
                    ? async (nextStage) =>
                        generateWithAgent(
                          "implementation-stage",
                          nextStage.promptContent,
                          undefined,
                          project.id
                        )
                    : undefined
                }
                onStatusChange={(nextStage) => void cycleStatus(nextStage)}
              />
            ))}
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-outline-variant/20 bg-surface px-6 py-16 text-center">
            <p className="font-headline text-2xl font-semibold text-on-surface">
              No build plan yet
            </p>
            <p className="mt-3 text-sm text-on-surface-variant">
              Generate the first staged plan once the concept and design sections are populated.
            </p>
          </div>
        )}
      </div>

      <WorkspacePageNavigation currentTabId="build-plan" />
    </GameSectionLayout>
  );
};
