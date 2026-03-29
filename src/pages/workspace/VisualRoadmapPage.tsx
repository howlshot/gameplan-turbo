import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProjectTabPath } from "@/components/layout/sidebarConfig";
import { WorkspacePageNavigation } from "@/components/workspace/WorkspacePageNavigation";
import { GameSectionLayout } from "@/components/workspace/game/GameSectionLayout";
import { useBuildStages } from "@/hooks/useBuildStages";
import { useProject } from "@/hooks/useProject";
import { useToast } from "@/hooks/useToast";
import { exportAllPrompts } from "@/services/generation/buildGeneration";
import type { BuildStage, BuildStageStatus } from "@/types";

const STATUS_OPTIONS: Array<{
  label: string;
  value: Exclude<BuildStageStatus, "locked">;
}> = [
  { label: "Not Started", value: "not-started" },
  { label: "In Progress", value: "in-progress" },
  { label: "Complete", value: "complete" }
];

export const VisualRoadmapPage = (): JSX.Element => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { project } = useProject(projectId);
  const { stages, reorderStages, updateStage, updateStageStatus } =
    useBuildStages(projectId);
  const [draftFields, setDraftFields] = useState<
    Record<string, { description: string; name: string }>
  >({});

  useEffect(() => {
    setDraftFields((current) => ({
      ...current,
      ...Object.fromEntries(
        stages.map((stage) => [
          stage.id,
          {
            name: current[stage.id]?.name ?? stage.name,
            description: current[stage.id]?.description ?? stage.description
          }
        ])
      )
    }));
  }, [stages]);

  const canExportRoadmap = stages.length > 0;
  const timelineHeight = useMemo(
    () => Math.max((stages.length - 1) * 132, 0),
    [stages.length]
  );

  const handleMoveStage = async (
    stageId: string,
    direction: "earlier" | "later"
  ): Promise<void> => {
    const currentIndex = stages.findIndex((stage) => stage.id === stageId);
    if (currentIndex < 0) {
      return;
    }

    const targetIndex =
      direction === "earlier" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= stages.length) {
      return;
    }

    const nextOrder = [...stages];
    const [movedStage] = nextOrder.splice(currentIndex, 1);
    nextOrder.splice(targetIndex, 0, movedStage);

    await reorderStages(nextOrder.map((stage) => stage.id));
    toast.success(
      `${movedStage.name} moved ${direction === "earlier" ? "earlier" : "later"} in the roadmap.`
    );
  };

  const commitField = async (
    stage: BuildStage,
    field: "name" | "description"
  ): Promise<void> => {
    const nextValue = draftFields[stage.id]?.[field]?.trim();
    const currentValue = stage[field].trim();
    const finalValue = nextValue || currentValue;

    if (finalValue === currentValue) {
      setDraftFields((current) => ({
        ...current,
        [stage.id]: {
          name: field === "name" ? currentValue : current[stage.id]?.name ?? stage.name,
          description:
            field === "description"
              ? currentValue
              : current[stage.id]?.description ?? stage.description
        }
      }));
      return;
    }

    await updateStage(stage.id, { [field]: finalValue });
  };

  if (!project) {
    return (
      <GameSectionLayout
        title="Visual Roadmap"
        description="Loading roadmap workspace."
      >
        <div className="h-64 animate-pulse rounded-3xl bg-surface-container-high" />
      </GameSectionLayout>
    );
  }

  return (
    <GameSectionLayout
      eyebrow="Timeline View"
      title="Visual Roadmap"
      description="This is another live view of the same build roadmap from Prompt Lab. Edit stage names, descriptions, order, and status here, and the changes stay in sync."
    >
      <div className="rounded-3xl border border-outline-variant/10 bg-surface p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
              Live roadmap editor
            </p>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-on-surface-variant">
              Update status, reorder the stage sequence, or tighten stage titles and descriptions here. Keep full brief review and AI roadmap polish in Prompt Lab.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                projectId && navigate(getProjectTabPath(projectId, "prompt-lab"))
              }
              className="rounded-2xl border border-outline-variant/15 bg-surface-container px-4 py-3 text-sm font-semibold text-on-surface transition hover:bg-surface-container-high"
            >
              Open Prompt Lab
            </button>
            <button
              type="button"
              disabled={!canExportRoadmap}
              onClick={() => exportAllPrompts(stages)}
              className="rounded-2xl border border-outline-variant/15 bg-surface px-4 py-3 text-sm font-semibold text-on-surface transition hover:bg-surface-container-high disabled:opacity-50"
            >
              Export Roadmap Briefs
            </button>
          </div>
        </div>
      </div>

      {stages.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-outline-variant/20 bg-surface px-6 py-16 text-center">
          <p className="font-headline text-2xl font-semibold text-on-surface">
            No visual roadmap yet
          </p>
          <p className="mt-3 text-sm text-on-surface-variant">
            Generate the build roadmap in Prompt Lab first, then use this view to edit and track it visually.
          </p>
          <button
            type="button"
            onClick={() =>
              projectId && navigate(getProjectTabPath(projectId, "prompt-lab"))
            }
            className="gradient-cta glow-primary mt-6 rounded-2xl px-5 py-3 text-sm font-semibold text-on-primary"
          >
            Go to Prompt Lab
          </button>
        </div>
      ) : (
        <section className="relative rounded-3xl border border-outline-variant/10 bg-surface p-6">
          <div
            aria-hidden="true"
            className="absolute left-[2.45rem] top-14 hidden w-px bg-outline-variant/15 md:block"
            style={{ height: `${timelineHeight}px` }}
          />

          <div className="space-y-6">
            {stages.map((stage, index) => {
              const draftName = draftFields[stage.id]?.name ?? stage.name;
              const draftDescription =
                draftFields[stage.id]?.description ?? stage.description;

              return (
                <article
                  key={stage.id}
                  className="relative grid gap-4 rounded-3xl border border-outline-variant/10 bg-surface-container p-5 md:grid-cols-[56px_minmax(0,1fr)]"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/12 font-mono text-sm font-semibold text-primary">
                      {stage.stageNumber.toString().padStart(2, "0")}
                    </div>
                    <span className="rounded-full bg-surface px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">
                      {stage.platform}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex-1 space-y-3">
                        <input
                          value={draftName}
                          onChange={(event) =>
                            setDraftFields((current) => ({
                              ...current,
                              [stage.id]: {
                                name: event.target.value,
                                description: draftDescription
                              }
                            }))
                          }
                          onBlur={() => void commitField(stage, "name")}
                          className="w-full rounded-2xl border border-outline-variant/10 bg-surface-container-lowest px-4 py-3 text-lg font-semibold text-on-surface outline-none transition focus:border-primary/40"
                        />
                        <textarea
                          value={draftDescription}
                          onChange={(event) =>
                            setDraftFields((current) => ({
                              ...current,
                              [stage.id]: {
                                name: draftName,
                                description: event.target.value
                              }
                            }))
                          }
                          onBlur={() => void commitField(stage, "description")}
                          className="min-h-28 w-full resize-y rounded-2xl border border-outline-variant/10 bg-surface-container-lowest px-4 py-3 text-sm leading-6 text-on-surface-variant outline-none transition focus:border-primary/40"
                        />
                      </div>

                      <div className="flex w-full flex-col gap-3 lg:w-56">
                        <select
                          value={stage.status === "locked" ? "not-started" : stage.status}
                          onChange={(event) =>
                            void updateStageStatus(
                              stage.id,
                              event.target.value as BuildStageStatus
                            )
                          }
                          className="rounded-2xl border border-outline-variant/10 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary/40"
                        >
                          {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => void handleMoveStage(stage.id, "earlier")}
                            className="rounded-2xl border border-outline-variant/10 bg-surface px-3 py-3 text-sm font-semibold text-on-surface transition hover:bg-surface-container-high disabled:opacity-40"
                          >
                            Move Earlier
                          </button>
                          <button
                            type="button"
                            disabled={index === stages.length - 1}
                            onClick={() => void handleMoveStage(stage.id, "later")}
                            className="rounded-2xl border border-outline-variant/10 bg-surface px-3 py-3 text-sm font-semibold text-on-surface transition hover:bg-surface-container-high disabled:opacity-40"
                          >
                            Move Later
                          </button>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs leading-6 text-on-surface-variant">
                      Saved when status changes, order changes, or a text field loses focus.
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <WorkspacePageNavigation currentTabId="visual-roadmap" />
    </GameSectionLayout>
  );
};
