import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDialogAccessibility } from "@/hooks/useDialogAccessibility";
import { useProjects } from "@/hooks/useProjects";
import { useToast } from "@/hooks/useToast";
import { useProjectStore } from "@/stores/projectStore";
import {
  AGENT_PLATFORM_OPTIONS,
  GAME_PLATFORM_OPTIONS,
  GAME_TEMPLATES
} from "@/lib/templates/genreTemplates";
import {
  GameField,
  GameSelect,
  GameTextInput,
  MultiSelectPills
} from "@/components/workspace/game/GameSectionLayout";
import type {
  AgentPlatform,
  GamePlatformTarget,
  ScopeCategory,
  TemplateId
} from "@/types";

interface NewProjectModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export const NewProjectModal = ({
  isOpen,
  onOpenChange
}: NewProjectModalProps): JSX.Element | null => {
  const navigate = useNavigate();
  const { createProject } = useProjects();
  const toast = useToast();
  const selectProject = useProjectStore((state) => state.selectProject);

  const titleRef = useRef<HTMLInputElement>(null);
  const pitchRef = useRef<HTMLInputElement>(null);
  const genreRef = useRef<HTMLInputElement>(null);
  const subgenreRef = useRef<HTMLInputElement>(null);
  const audienceRef = useRef<HTMLInputElement>(null);
  const sessionLengthRef = useRef<HTMLInputElement>(null);
  const engineRef = useRef<HTMLInputElement>(null);

  const [templateId, setTemplateId] = useState<TemplateId>("arcade-action-rail-shooter");
  const [scopeCategory, setScopeCategory] = useState<ScopeCategory>("small");
  const [platformTargets, setPlatformTargets] = useState<GamePlatformTarget[]>([
    "ios",
    "android",
    "pc"
  ]);
  const [agentTargets, setAgentTargets] = useState<AgentPlatform[]>([
    "codex",
    "cursor",
    "claude-code"
  ]);
  const [showTitleError, setShowTitleError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = useCallback((): void => {
    if (titleRef.current) titleRef.current.value = "";
    if (pitchRef.current) pitchRef.current.value = "";
    if (genreRef.current) genreRef.current.value = "Action";
    if (subgenreRef.current) subgenreRef.current.value = "Rail Shooter";
    if (audienceRef.current) audienceRef.current.value = "";
    if (sessionLengthRef.current) sessionLengthRef.current.value = "5-12 minutes";
    if (engineRef.current) engineRef.current.value = "";
    setTemplateId("arcade-action-rail-shooter");
    setScopeCategory("small");
    setPlatformTargets(["ios", "android", "pc"]);
    setAgentTargets(["codex", "cursor", "claude-code"]);
    setShowTitleError(false);
    setIsSubmitting(false);
  }, []);

  const dialogRef = useDialogAccessibility<HTMLDivElement>(isOpen, () => {
    resetForm();
    onOpenChange(false);
  });

  useEffect(() => {
    if (isOpen && titleRef.current) {
      setTimeout(() => titleRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const selectedTemplate = useMemo(
    () => GAME_TEMPLATES[templateId],
    [templateId]
  );

  const togglePlatform = (platform: string): void => {
    setPlatformTargets((current) =>
      current.includes(platform as GamePlatformTarget)
        ? current.filter((value) => value !== platform)
        : [...current, platform as GamePlatformTarget]
    );
  };

  const toggleAgentTarget = (platform: string): void => {
    setAgentTargets((current) =>
      current.includes(platform as AgentPlatform)
        ? current.filter((value) => value !== platform)
        : [...current, platform as AgentPlatform]
    );
  };

  const handleSubmit = useCallback(async (): Promise<void> => {
    const title = titleRef.current?.value.trim() ?? "";
    const oneLinePitch = pitchRef.current?.value.trim() ?? "";

    if (!title) {
      setShowTitleError(true);
      titleRef.current?.focus();
      return;
    }

    setIsSubmitting(true);

    const project = await createProject({
      title,
      name: title,
      oneLinePitch,
      description: oneLinePitch,
      genre: genreRef.current?.value.trim() ?? "",
      subgenre: subgenreRef.current?.value.trim() ?? "",
      scopeCategory,
      templateId,
      platformTargets,
      agentTargets,
      targetPlatforms: agentTargets,
      targetAudience: audienceRef.current?.value.trim() ?? "",
      sessionLength: sessionLengthRef.current?.value.trim() ?? "",
      monetizationModel:
        selectedTemplate.defaultProject.monetizationModel ?? "Premium",
      enginePreference: engineRef.current?.value.trim() ?? "",
      comparableGames: selectedTemplate.defaultProject.comparableGames ?? []
    });

    if (!project) {
      toast.error("Game project creation failed.");
      setIsSubmitting(false);
      return;
    }

    selectProject(project.id);
    resetForm();
    onOpenChange(false);
    toast.success("Game project created.");
    navigate(`/project/${project.id}`);
  }, [
    agentTargets,
    createProject,
    navigate,
    onOpenChange,
    platformTargets,
    resetForm,
    scopeCategory,
    selectProject,
    selectedTemplate.defaultProject.comparableGames,
    selectedTemplate.defaultProject.monetizationModel,
    templateId,
    toast
  ]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface-dim/80 px-4 backdrop-blur-sm"
      onClick={() => {
        resetForm();
        onOpenChange(false);
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-project-title"
        className="glass-panel w-full max-w-4xl rounded-3xl border border-outline-variant/15 bg-surface-container p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary">
              New Game Project
            </p>
            <h2
              id="new-project-title"
              className="mt-2 font-headline text-3xl font-bold tracking-tight text-on-surface"
            >
              Start a new game design workspace
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
            className="rounded-full p-2 text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="space-y-5">
            <GameField label="Template">
              <GameSelect
                value={templateId}
                onChange={(event) => setTemplateId(event.target.value as TemplateId)}
              >
                {Object.values(GAME_TEMPLATES).map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.label}
                  </option>
                ))}
              </GameSelect>
            </GameField>

            <GameField label="Game Title">
              <GameTextInput
                ref={titleRef}
                type="text"
                placeholder="Nightline Zero"
                defaultValue=""
              />
              {showTitleError ? (
                <p className="mt-2 text-sm text-tertiary">Game title is required.</p>
              ) : null}
            </GameField>

            <GameField label="One-Line Pitch">
              <GameTextInput
                ref={pitchRef}
                type="text"
                placeholder="A touch-first rail shooter about surviving choreographed ambushes."
                defaultValue=""
              />
            </GameField>

            <div className="grid gap-5 md:grid-cols-2">
              <GameField label="Genre">
                <GameTextInput ref={genreRef} type="text" defaultValue="Action" />
              </GameField>
              <GameField label="Subgenre">
                <GameTextInput ref={subgenreRef} type="text" defaultValue="Rail Shooter" />
              </GameField>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <GameField label="Scope">
                <GameSelect
                  value={scopeCategory}
                  onChange={(event) =>
                    setScopeCategory(event.target.value as ScopeCategory)
                  }
                >
                  <option value="tiny">tiny</option>
                  <option value="small">small</option>
                  <option value="medium">medium</option>
                </GameSelect>
              </GameField>
              <GameField label="Session Length">
                <GameTextInput
                  ref={sessionLengthRef}
                  type="text"
                  defaultValue="5-12 minutes"
                />
              </GameField>
            </div>

            <GameField label="Target Audience">
              <GameTextInput
                ref={audienceRef}
                type="text"
                placeholder="Arcade action fans who want short, high-readability runs"
              />
            </GameField>

            <GameField label="Engine Preference">
              <GameTextInput
                ref={engineRef}
                type="text"
                placeholder="Leave blank to stay engine-agnostic"
              />
            </GameField>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-outline-variant/10 bg-surface p-5">
              <p className="font-headline text-xl font-semibold text-on-surface">
                {selectedTemplate.label}
              </p>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                {selectedTemplate.description}
              </p>
            </div>

            <GameField
              label="Game Platform Targets"
              description="Choose where the finished game should ship."
            >
              <MultiSelectPills
                selectedValues={platformTargets}
                onToggle={togglePlatform}
                options={GAME_PLATFORM_OPTIONS.map((platform) => ({
                  label: platform,
                  value: platform
                }))}
              />
            </GameField>

            <GameField
              label="Preferred AI Build Tools"
              description="These targets shape the generated implementation prompts."
            >
              <MultiSelectPills
                selectedValues={agentTargets}
                onToggle={toggleAgentTarget}
                options={AGENT_PLATFORM_OPTIONS.map((platform) => ({
                  label: platform,
                  value: platform
                }))}
              />
            </GameField>

            <div className="rounded-3xl border border-outline-variant/10 bg-surface p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary">
                v1 Bias
              </p>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-on-surface-variant">
                <li>Local-first and useful before any AI key is added.</li>
                <li>Optimized for smaller action and arcade-style games.</li>
                <li>Prompt-ready for Codex, Cursor, Claude Code, and Qwen Code.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
            className="rounded-2xl border border-outline-variant/15 bg-surface px-5 py-3 text-sm text-on-surface"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
            className="gradient-cta glow-primary rounded-2xl px-5 py-3 text-sm font-semibold text-on-primary disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Game Project"}
          </button>
        </div>
      </div>
    </div>
  );
};
