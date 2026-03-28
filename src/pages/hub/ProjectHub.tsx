import { useMemo, useRef, useState } from "react";
import { NewProjectModal } from "@/components/hub/NewProjectModal";
import { ProjectCard } from "@/components/hub/ProjectCard";
import { ProjectHubControls } from "@/components/hub/ProjectHubControls";
import { ProjectHubEmptyState } from "@/components/hub/ProjectHubEmptyState";
import {
  parseImportedProjects,
  type FilterValue,
  type SortValue,
  type ViewMode
} from "@/components/hub/projectHubConfig";
import { useProjects } from "@/hooks/useProjects";
import { useSettings } from "@/hooks/useSettings";
import { useToast } from "@/hooks/useToast";
import { APP_NAME } from "@/lib/brand";
import { cn, formatDate } from "@/lib/utils";

export const ProjectHub = (): JSX.Element => {
  const { projects, isLoading, importProjectBundle, deleteProject } = useProjects();
  const { settings } = useSettings();
  const toast = useToast();
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [sortBy, setSortBy] = useState<SortValue>("updated");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());

  const filteredProjects = useMemo(() => {
    const nextProjects =
      filter === "all"
        ? [...projects]
        : projects.filter((project) => project.status === filter);

    if (sortBy === "name") {
      return nextProjects.sort((left, right) => left.title.localeCompare(right.title));
    }

    if (sortBy === "created") {
      return nextProjects.sort((left, right) => right.createdAt - left.createdAt);
    }

    return nextProjects.sort((left, right) => right.updatedAt - left.updatedAt);
  }, [filter, projects, sortBy]);

  const lastActive = projects.length > 0 ? formatDate(projects[0].updatedAt) : "just now";

  const handleImportClick = (): void => {
    importInputRef.current?.click();
  };

  const handleToggleBatchMode = (): void => {
    setIsBatchMode(!isBatchMode);
    setSelectedProjects(new Set());
  };

  const handleToggleSelectProject = (projectId: string): void => {
    setSelectedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  };

  const handleSelectAll = (): void => {
    if (selectedProjects.size === filteredProjects.length) {
      setSelectedProjects(new Set());
    } else {
      setSelectedProjects(new Set(filteredProjects.map((project) => project.id)));
    }
  };

  const handleBatchDelete = async (): Promise<void> => {
    const confirmed = window.confirm(
      `Delete ${selectedProjects.size} game project(s)? This action cannot be undone.`
    );
    if (!confirmed) return;

    for (const projectId of selectedProjects) {
      await deleteProject(projectId);
    }

    toast.success(`Deleted ${selectedProjects.size} game project(s).`);
    setSelectedProjects(new Set());
    setIsBatchMode(false);
  };

  const handleImportChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const payload = JSON.parse(await file.text());
      const importedProjects = parseImportedProjects(payload);

      for (const bundle of importedProjects) {
        await importProjectBundle(bundle);
      }

      toast.success(`Imported ${importedProjects.length} game project(s).`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Import failed. Invalid JSON.";
      toast.error(message);
    }
  };

  return (
    <>
      <section className="mx-auto w-full max-w-7xl px-8 py-10">
        <div className="rounded-[32px] border border-outline-variant/10 bg-surface-container px-8 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">
                Game Hub
              </p>
              <h1 className="mt-3 font-headline text-5xl font-bold tracking-tighter text-on-surface">
                {settings?.userName?.trim()
                  ? `${settings.userName.trim()}, build the game before the scope drifts.`
                  : "Build the game before the scope drifts."}
              </h1>
              <p className="mt-4 text-sm leading-6 text-on-surface-variant">
                {projects.length} game projects in orbit. Last active {lastActive}. {APP_NAME} stays local-first, preserves your vault context, and turns design
                intent into staged prompts for AI coding agents.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {isBatchMode ? (
                <>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="rounded-xl border border-outline-variant/15 bg-surface px-5 py-3 text-sm text-on-surface transition hover:bg-surface-container-high"
                  >
                    {selectedProjects.size === filteredProjects.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleBatchDelete()}
                    disabled={selectedProjects.size === 0}
                    className="rounded-xl bg-tertiary px-5 py-3 text-sm font-semibold text-on-tertiary transition disabled:opacity-50"
                  >
                    Delete ({selectedProjects.size})
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleBatchMode}
                    className="rounded-xl border border-outline-variant/15 bg-surface px-5 py-3 text-sm text-on-surface transition hover:bg-surface-container-high"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="gradient-cta glow-primary rounded-xl px-5 py-3 text-sm font-semibold text-on-primary"
                  >
                    New Game Project
                  </button>
                  <button
                    type="button"
                    onClick={handleImportClick}
                    className="rounded-xl border border-outline-variant/15 bg-surface px-5 py-3 text-sm text-on-surface transition hover:bg-surface-container-high"
                  >
                    Import JSON
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleBatchMode}
                    className="rounded-xl border border-outline-variant/15 bg-surface px-5 py-3 text-sm text-on-surface transition hover:bg-surface-container-high"
                  >
                    Select Multiple
                  </button>
                  <input
                    ref={importInputRef}
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={(event) => void handleImportChange(event)}
                  />
                </>
              )}
            </div>
          </div>

          <ProjectHubControls
            filter={filter}
            onChangeFilter={setFilter}
            onChangeSort={setSortBy}
            onChangeViewMode={setViewMode}
            sortBy={sortBy}
            viewMode={viewMode}
          />
        </div>

        <div className="mt-10">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-80 animate-pulse rounded-3xl bg-surface-container-high"
                />
              ))}
            </div>
          ) : filteredProjects.length > 0 ? (
            <div
              className={cn(
                "grid gap-6",
                viewMode === "grid"
                  ? "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
                  : "grid-cols-1"
              )}
            >
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isInBatchMode={isBatchMode}
                  isSelected={selectedProjects.has(project.id)}
                  onToggleSelect={handleToggleSelectProject}
                />
              ))}
            </div>
          ) : (
            <ProjectHubEmptyState onCreateProject={() => setIsModalOpen(true)} />
          )}
        </div>
      </section>

      <NewProjectModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
};
