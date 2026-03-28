import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  getProjectTabFromSearch,
  getProjectTabPath
} from "@/components/layout/sidebarConfig";
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
const OutputLibraryPage = lazy(() =>
  import("@/pages/workspace/OutputLibraryPage").then((module) => ({
    default: module.OutputLibraryPage
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
  { id: "vault", label: "Vault" },
  { id: "prompt-lab", label: "Prompt Lab" },
  { id: "output-library", label: "Output Library" }
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
  shipped: 10
};

export const ProjectWorkspace = (): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { project, isLoading } = useProject(projectId);
  const activeTab = useUIStore((state) => state.activeTab);
  const setActiveTab = useUIStore((state) => state.setActiveTab);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const urlTab = getProjectTabFromSearch(location.search);
  const resolvedTab = urlTab ?? activeTab;

  useEffect(() => {
    if (!projectId) {
      return;
    }

    const params = new URLSearchParams(location.search);
    if (params.get("tab") === "prompt-lab" && params.get("view") === "library") {
      navigate(
        getProjectTabPath(projectId, "output-library", {
          output: params.get("output") ?? undefined
        }),
        { replace: true }
      );
      return;
    }

    if (params.get("tab") !== "build-plan") {
      return;
    }

    navigate(getProjectTabPath(projectId, "prompt-lab"), {
      replace: true
    });
  }, [location.search, navigate, projectId]);

  const currentStageIndex = useMemo(() => {
    const activeIndex = WORKSPACE_STAGES.findIndex((stage) => stage.id === resolvedTab);
    if (activeIndex >= 0) {
      return activeIndex;
    }

    return project ? STATUS_STAGE_INDEX[project.status] ?? 0 : 0;
  }, [project, resolvedTab]);

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
      {resolvedTab === "concept" ? (
        <ConceptPage />
      ) : resolvedTab === "design-pillars" ? (
        <DesignPillarsPage />
      ) : resolvedTab === "core-loop" ? (
        <CoreLoopPage />
      ) : resolvedTab === "controls-feel" ? (
        <ControlsFeelPage />
      ) : resolvedTab === "content-bible" ? (
        <ContentBiblePage />
      ) : resolvedTab === "art-tone" ? (
        <ArtTonePage />
      ) : resolvedTab === "technical-design" ? (
        <TechnicalDesignPage />
      ) : resolvedTab === "vault" ? (
        <VaultPage />
      ) : resolvedTab === "prompt-lab" ? (
        <PromptLabPage />
      ) : resolvedTab === "output-library" ? (
        <OutputLibraryPage />
      ) : (
        <ConceptPage />
      )}
    </Suspense>
  );

  const navigateToStage = (stageId: (typeof WORKSPACE_STAGES)[number]["id"]): void => {
    if (!projectId) {
      return;
    }

    setActiveTab(stageId);
    navigate(getProjectTabPath(projectId, stageId));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => navigateToStage(stage.id)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs transition hover:scale-[1.01] hover:text-on-surface",
                      isCompleted
                        ? "bg-secondary/20 text-secondary"
                        : isCurrent
                          ? "animate-pulse bg-primary/20 text-primary"
                          : "bg-surface-container text-outline"
                    )}
                  >
                    {stage.label}
                  </button>
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
    </section>
  );
};
