import { memo, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useArtifacts } from "@/hooks/useArtifacts";
import { useBuildStages } from "@/hooks/useBuildStages";
import { useGameDesignDoc } from "@/hooks/useGameDesignDoc";
import { useProjects } from "@/hooks/useProjects";
import { useToast } from "@/hooks/useToast";
import { getAgentPlatformLabel } from "@/lib/gameProjectUtils";
import { cn, formatDate } from "@/lib/utils";
import { useProjectStore } from "@/stores/projectStore";
import type {
  AgentPlatform,
  GamePlatformTarget,
  Project,
  ProjectStatus,
  ScopeCategory
} from "@/types";

interface ProjectCardProps {
  project: Project;
  isInBatchMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (projectId: string) => void;
}

const getGradientForProject = (projectId: string): string => {
  let hash = 0;
  for (let i = 0; i < projectId.length; i++) {
    hash = projectId.charCodeAt(i) + ((hash << 5) - hash);
  }

  const gradients = [
    "linear-gradient(145deg, rgba(103, 227, 188, 0.13) 0%, rgba(10,10,15,0) 60%)",
    "linear-gradient(145deg, rgba(255, 167, 98, 0.16) 0%, rgba(10,10,15,0) 62%)",
    "linear-gradient(145deg, rgba(118, 154, 255, 0.15) 0%, rgba(10,10,15,0) 62%)",
    "linear-gradient(145deg, rgba(255, 220, 124, 0.12) 0%, rgba(10,10,15,0) 62%)"
  ];

  return gradients[Math.abs(hash) % gradients.length];
};

const scopeOrder: ScopeCategory[] = ["tiny", "small", "medium"];
const statusOptions: ProjectStatus[] = [
  "concept",
  "preproduction",
  "production",
  "playtesting",
  "release-prep"
];

const formatChipLabel = (value: string): string =>
  value
    .split("-")
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");

export const ProjectCard = memo(
  ({
    project,
    isInBatchMode = false,
    isSelected = false,
    onToggleSelect
  }: ProjectCardProps): JSX.Element => {
    const navigate = useNavigate();
    const { updateProject, deleteProject } = useProjects();
    const { gameDesignDoc } = useGameDesignDoc(project.id);
    const { artifacts } = useArtifacts(project.id);
    const { stages } = useBuildStages(project.id);
    const toast = useToast();
    const selectProject = useProjectStore((state) => state.selectProject);
    const [isEditing, setIsEditing] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [draftTitle, setDraftTitle] = useState(project.title);
    const [draftPitch, setDraftPitch] = useState(project.oneLinePitch);
    const [draftGenre, setDraftGenre] = useState(project.genre);
    const [draftSubgenre, setDraftSubgenre] = useState(project.subgenre);
    const [draftScope, setDraftScope] = useState<ScopeCategory>(project.scopeCategory);
    const [draftStatus, setDraftStatus] = useState<ProjectStatus>(project.status);
    const [draftPlatformTargets, setDraftPlatformTargets] = useState<GamePlatformTarget[]>(
      project.platformTargets
    );
    const [draftAgentTargets, setDraftAgentTargets] = useState<AgentPlatform[]>(
      project.agentTargets
    );

    const cardGradient = useMemo(() => getGradientForProject(project.id), [project.id]);
    const completedStages = stages.filter((stage) => stage.status === "complete").length;
    const progress = stages.length === 0 ? 0 : Math.round((completedStages / stages.length) * 100);
    const artifactCount = artifacts.length;
    const pillarsCount = gameDesignDoc?.designPillars.pillars.length ?? 0;

    const openProject = (): void => {
      if (isInBatchMode || isEditing) {
        onToggleSelect?.(project.id);
        return;
      }

      selectProject(project.id);
      navigate(`/project/${project.id}`);
    };

    const toggleDraftPlatform = (value: GamePlatformTarget): void => {
      setDraftPlatformTargets((current) =>
        current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value]
      );
    };

    const toggleDraftAgent = (value: AgentPlatform): void => {
      setDraftAgentTargets((current) =>
        current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value]
      );
    };

    const handleSaveEdit = async (): Promise<void> => {
      await updateProject(project.id, {
        title: draftTitle,
        name: draftTitle,
        oneLinePitch: draftPitch,
        description: draftPitch,
        genre: draftGenre,
        subgenre: draftSubgenre,
        scopeCategory: draftScope,
        status: draftStatus,
        platformTargets: draftPlatformTargets,
        agentTargets: draftAgentTargets,
        targetPlatforms: draftAgentTargets
      });

      toast.success("Game project updated.");
      setIsEditing(false);
    };

    const handleDelete = async (event: React.MouseEvent): Promise<void> => {
      event.stopPropagation();
      setIsMenuOpen(false);
      const confirmed = window.confirm(
        `Delete "${project.title}"? This action cannot be undone.`
      );
      if (!confirmed) return;
      await deleteProject(project.id);
      toast.success("Game project deleted.");
    };

    if (isEditing) {
      return (
        <article
          className="glass-panel group relative rounded-xl border border-outline-variant/10 p-5"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.22em] text-on-surface-variant">
                  Title
                </span>
                <input
                  type="text"
                  value={draftTitle}
                  onChange={(event) => setDraftTitle(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-outline-variant/15 bg-surface px-3 py-2 text-sm text-on-surface outline-none focus:border-primary/40"
                />
              </label>
              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.22em] text-on-surface-variant">
                  One-Line Pitch
                </span>
                <input
                  type="text"
                  value={draftPitch}
                  onChange={(event) => setDraftPitch(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-outline-variant/15 bg-surface px-3 py-2 text-sm text-on-surface outline-none focus:border-primary/40"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.22em] text-on-surface-variant">
                  Genre
                </span>
                <input
                  type="text"
                  value={draftGenre}
                  onChange={(event) => setDraftGenre(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-outline-variant/15 bg-surface px-3 py-2 text-sm text-on-surface outline-none focus:border-primary/40"
                />
              </label>
              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.22em] text-on-surface-variant">
                  Subgenre
                </span>
                <input
                  type="text"
                  value={draftSubgenre}
                  onChange={(event) => setDraftSubgenre(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-outline-variant/15 bg-surface px-3 py-2 text-sm text-on-surface outline-none focus:border-primary/40"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.22em] text-on-surface-variant">
                  Scope
                </span>
                <select
                  value={draftScope}
                  onChange={(event) => setDraftScope(event.target.value as ScopeCategory)}
                  className="mt-2 w-full rounded-xl border border-outline-variant/15 bg-surface px-3 py-2 text-sm text-on-surface outline-none focus:border-primary/40"
                >
                  {scopeOrder.map((scope) => (
                    <option key={scope} value={scope}>
                      {scope}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.22em] text-on-surface-variant">
                  Status
                </span>
                <select
                  value={draftStatus}
                  onChange={(event) => setDraftStatus(event.target.value as ProjectStatus)}
                  className="mt-2 w-full rounded-xl border border-outline-variant/15 bg-surface px-3 py-2 text-sm text-on-surface outline-none focus:border-primary/40"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {formatChipLabel(status)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="space-y-3">
              <span className="text-[11px] uppercase tracking-[0.22em] text-on-surface-variant">
                Game Platforms
              </span>
              <div className="flex flex-wrap gap-2">
                {(["ios", "android", "pc", "web", "switch", "console"] as GamePlatformTarget[]).map(
                  (platform) => (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => toggleDraftPlatform(platform)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.18em] transition",
                        draftPlatformTargets.includes(platform)
                          ? "border-primary/40 bg-primary/15 text-primary"
                          : "border-outline-variant/15 bg-surface text-on-surface-variant"
                      )}
                    >
                      {platform}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[11px] uppercase tracking-[0.22em] text-on-surface-variant">
                Agent Targets
              </span>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    "codex",
                    "qwen-code",
                    "cursor",
                    "claude-code",
                    "replit",
                    "chatgpt",
                    "gemini",
                    "perplexity"
                  ] as AgentPlatform[]
                ).map((platform) => (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => toggleDraftAgent(platform)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.18em] transition",
                      draftAgentTargets.includes(platform)
                        ? "border-secondary/40 bg-secondary/15 text-secondary"
                        : "border-outline-variant/15 bg-surface text-on-surface-variant"
                    )}
                  >
                    {getAgentPlatformLabel(platform)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-lg bg-surface px-3 py-1.5 text-xs text-on-surface-variant"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSaveEdit()}
                className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
              >
                Save
              </button>
            </div>
          </div>
        </article>
      );
    }

    return (
      <article
        role="button"
        tabIndex={0}
        onClick={openProject}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openProject();
          }
        }}
        className="glass-panel group relative overflow-hidden rounded-3xl border border-outline-variant/10 p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-glow-primary"
        style={{ background: cardGradient }}
      >
        <div className="noise-texture absolute inset-0 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4">
            <StatusBadge status={project.status} />

            {isInBatchMode ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleSelect?.(project.id);
                }}
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all",
                  isSelected
                    ? "border-primary bg-primary text-on-primary"
                    : "border-outline-variant bg-surface text-transparent hover:border-primary/40"
                )}
              >
                <span className="material-symbols-outlined text-sm">
                  {isSelected ? "check" : ""}
                </span>
              </button>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsMenuOpen((current) => !current);
                  }}
                  aria-label="Project options"
                  className="rounded-full p-2 text-on-surface-variant transition hover:bg-surface hover:text-on-surface"
                >
                  <span className="material-symbols-outlined">more_horiz</span>
                </button>
                {isMenuOpen ? (
                  <div
                    className="absolute right-0 z-20 mt-2 w-44 rounded-2xl border border-outline-variant/15 bg-surface-container p-2 shadow-2xl"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsEditing(true);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-on-surface hover:bg-surface"
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={(event) => void handleDelete(event)}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-tertiary hover:bg-surface"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                      Delete
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="mt-4">
            <h3 className="font-headline text-2xl font-bold tracking-tight text-on-surface">
              {project.title}
            </h3>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-on-surface-variant">
              {project.oneLinePitch || "No one-line pitch yet."}
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {[project.genre, project.subgenre, project.scopeCategory]
              .filter(Boolean)
              .map((chip) => (
                <span
                  key={chip}
                  className="rounded-full bg-surface px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-on-surface-variant"
                >
                  {chip}
                </span>
              ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-outline-variant/10 bg-surface px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-on-surface-variant">
                Build Progress
              </p>
              <p className="mt-2 font-headline text-2xl font-semibold text-on-surface">
                {progress}%
              </p>
            </div>
            <div className="rounded-2xl border border-outline-variant/10 bg-surface px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-on-surface-variant">
                Pillars Locked
              </p>
              <p className="mt-2 font-headline text-2xl font-semibold text-on-surface">
                {pillarsCount}
              </p>
            </div>
            <div className="rounded-2xl border border-outline-variant/10 bg-surface px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-on-surface-variant">
                Prompt Outputs
              </p>
              <p className="mt-2 font-headline text-2xl font-semibold text-on-surface">
                {artifactCount}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-on-surface-variant">
              Platforms
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {project.platformTargets.map((platform) => (
                <span
                  key={platform}
                  className="rounded-full bg-primary/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-primary"
                >
                  {formatChipLabel(platform)}
                </span>
              ))}
              {project.agentTargets.map((platform) => (
                <span
                  key={platform}
                  className="rounded-full bg-secondary/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-secondary"
                >
                  {getAgentPlatformLabel(platform)}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-outline-variant/10 pt-4 text-xs text-on-surface-variant">
            <span>Updated {formatDate(project.updatedAt)}</span>
            <span>{completedStages} stages complete</span>
          </div>
        </div>
      </article>
    );
  }
);

ProjectCard.displayName = "ProjectCard";
