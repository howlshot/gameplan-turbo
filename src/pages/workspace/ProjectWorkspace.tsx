import { Suspense, lazy, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FloatingActionButton } from "@/components/shared/FloatingActionButton";
import { ContextNodeSelector } from "@/components/workspace/ContextNodeSelector";
import { useProject } from "@/hooks/useProject";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/uiStore";

const ConceptPage = lazy(() =>
  import("@/pages/workspace/ConceptPage").then((module) => ({
    default: module.ConceptPage
  }))
);
const DesignPillarsPage = lazy(() =>
  import("@/pages/workspace/DesignPillarsPage").then((module) => ({
    default: module.DesignPillarsPage
  }))
);
const CoreLoopPage = lazy(() =>
  import("@/pages/workspace/CoreLoopPage").then((module) => ({
    default: module.CoreLoopPage
  }))
);
const ControlsFeelPage = lazy(() =>
  import("@/pages/workspace/ControlsFeelPage").then((module) => ({
    default: module.ControlsFeelPage
  }))
);
const ContentBiblePage = lazy(() =>
  import("@/pages/workspace/ContentBiblePage").then((module) => ({
    default: module.ContentBiblePage
  }))
);
const ArtTonePage = lazy(() =>
  import("@/pages/workspace/ArtTonePage").then((module) => ({
    default: module.ArtTonePage
  }))
);
const TechnicalDesignPage = lazy(() =>
  import("@/pages/workspace/TechnicalDesignPage").then((module) => ({
    default: module.TechnicalDesignPage
  }))
);
const BuildPlanPage = lazy(() =>
  import("@/pages/workspace/BuildPlanPage").then((module) => ({
    default: module.BuildPlanPage
  }))
);
const VaultPage = lazy(() =>
  import("@/pages/workspace/VaultPage").then((module) => ({
    default: module.VaultPage
  }))
);
const PromptLabPage = lazy(() =>
  import("@/pages/workspace/PromptLabPage").then((module) => ({
    default: module.PromptLabPage
  }))
);

const PageLoader = () => (
  <div className="flex h-full items-center justify-center">
    <div className="rounded-2xl border border-outline-variant/10 bg-surface-container px-6 py-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
        Loading Workspace
      </p>
      <div className="mt-3 h-2 w-48 overflow-hidden rounded-full bg-surface-container-high">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
      </div>
    </div>
  </div>
);

const WORKSPACE_STAGES = [
  { id: "concept", label: "Concept" },
  { id: "design-pillars", label: "Pillars" },
  { id: "core-loop", label: "Loop" },
  { id: "controls-feel", label: "Feel" },
  { id: "content-bible", label: "Content" },
  { id: "art-tone", label: "Art" },
  { id: "technical-design", label: "Tech" },
  { id: "build-plan", label: "Build" },
  { id: "vault", label: "Vault" },
  { id: "prompt-lab", label: "Prompt Lab" }
] as const;

const STATUS_STAGE_INDEX: Record<string, number> = {
  concept: 0,
  ideation: 0,
  preproduction: 2,
  researching: 2,
  designing: 3,
  production: 7,
  building: 7,
  playtesting: 8,
  "release-prep": 9,
  shipped: 9
};

export const ProjectWorkspace = (): JSX.Element => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { project, isLoading } = useProject(projectId);
  const activeTab = useUIStore((state) => state.activeTab);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);

  const currentStageIndex = useMemo(() => {
    const activeIndex = WORKSPACE_STAGES.findIndex((stage) => stage.id === activeTab);
    if (activeIndex >= 0) {
      return activeIndex;
    }

    return project ? STATUS_STAGE_INDEX[project.status] ?? 0 : 0;
  }, [activeTab, project]);

  if (!isLoading && !project) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-2xl bg-surface-container p-8 text-center">
          <h1 className="font-headline text-3xl font-bold text-on-surface">
            Project not found
          </h1>
          <p className="mt-3 text-on-surface-variant">
            The requested workspace could not be loaded.
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="gradient-cta glow-primary mt-6 rounded-xl px-4 py-3 text-sm font-semibold text-on-primary"
          >
            Back to Game Hub
          </button>
        </div>
      </section>
    );
  }

  const renderActiveContent = (): JSX.Element => (
    <Suspense fallback={<PageLoader />}>
      {activeTab === "concept" ? (
        <ConceptPage />
      ) : activeTab === "design-pillars" ? (
        <DesignPillarsPage />
      ) : activeTab === "core-loop" ? (
        <CoreLoopPage />
      ) : activeTab === "controls-feel" ? (
        <ControlsFeelPage />
      ) : activeTab === "content-bible" ? (
        <ContentBiblePage />
      ) : activeTab === "art-tone" ? (
        <ArtTonePage />
      ) : activeTab === "technical-design" ? (
        <TechnicalDesignPage />
      ) : activeTab === "build-plan" ? (
        <BuildPlanPage />
      ) : activeTab === "vault" ? (
        <VaultPage />
      ) : activeTab === "prompt-lab" ? (
        <PromptLabPage />
      ) : (
        <ConceptPage />
      )}
    </Suspense>
  );

  return (
    <section className="-mx-6 -my-8 flex min-h-[calc(100vh-3.5rem)] flex-col">
      <div className="sticky top-0 z-30 border-b border-outline-variant/10 bg-surface/80 px-8 py-4 backdrop-blur-md">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="transition hover:text-on-surface"
              >
                Game Hub
              </button>
              <span>/</span>
              <span className="text-on-surface">{project?.title ?? "Loading..."}</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {WORKSPACE_STAGES.map((stage, index) => {
                const isCompleted = index < currentStageIndex;
                const isCurrent = index === currentStageIndex;

                return (
                  <span
                    key={stage.id}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs",
                      isCompleted
                        ? "bg-secondary/20 text-secondary"
                        : isCurrent
                          ? "animate-pulse bg-primary/20 text-primary"
                          : "bg-surface-container text-outline"
                    )}
                  >
                    {stage.label}
                  </span>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSelectorOpen((current) => !current)}
            className="rounded-xl border border-outline-variant/15 bg-surface-container px-4 py-3 text-sm text-on-surface transition hover:bg-surface-container-high"
          >
            Context Nodes
          </button>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        {renderActiveContent()}

        {projectId ? (
          <ContextNodeSelector
            isOpen={isSelectorOpen}
            projectId={projectId}
            selectedNodes={selectedNodes}
            onChangeNodes={setSelectedNodes}
          />
        ) : null}
      </div>

      <FloatingActionButton />
    </section>
  );
};
