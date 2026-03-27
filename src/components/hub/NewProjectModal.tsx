import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDialogAccessibility } from "@/hooks/useDialogAccessibility";
import { useProjects } from "@/hooks/useProjects";
import { useToast } from "@/hooks/useToast";
import { useProjectStore } from "@/stores/projectStore";
import {
  AGENT_PLATFORM_OPTIONS,
  GAME_PLATFORM_OPTIONS,
  getStarterModeDefinitions,
  getTemplateDefinition
} from "@/lib/templates/genreTemplates";
import {
  GameField,
  GameSelect,
  GameTextInput,
  MultiSelectPills,
  SingleSelectCards
} from "@/components/workspace/game/GameSectionLayout";
import {
  getScopeProfile,
  SCOPE_ORDER,
  SESSION_LENGTH_PRESETS,
  getSessionPreset
} from "@/lib/projectFraming";
import { cn } from "@/lib/utils";
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

interface CreationStep {
  id: 1 | 2;
  label: string;
  description: string;
}

const CREATION_STEPS: CreationStep[] = [
  {
    id: 1,
    label: "Core Identity",
    description: "Starter mode, title, pitch, and genre framing."
  },
  {
    id: 2,
    label: "Production Setup",
    description: "Scope, platforms, tools, and shipping setup."
  }
];

const DEFAULT_STARTER_MODE: TemplateId = "arcade-action-rail-shooter";

interface FormDefaults {
  agentTargets: AgentPlatform[];
  enginePreference: string;
  genre: string;
  platformTargets: GamePlatformTarget[];
  scopeCategory: ScopeCategory;
  sessionLength: string;
  subgenre: string;
  targetAudience: string;
}

const toTrimmedArray = (value: string): string[] =>
  Array.from(
    new Set(
      value
        .split(/[\n,]/)
        .map((token) => token.trim())
        .filter(Boolean)
    )
  );

const getStarterModeDefaults = (templateId: TemplateId): FormDefaults => {
  const template = getTemplateDefinition(templateId);
  const defaultProject = template.defaultProject;

  return {
    genre: defaultProject.genre ?? "",
    subgenre: defaultProject.subgenre ?? "",
    targetAudience: defaultProject.targetAudience ?? "",
    enginePreference: defaultProject.enginePreference ?? "",
    scopeCategory: defaultProject.scopeCategory ?? "small",
    sessionLength: defaultProject.sessionLength ?? "10-20 minutes",
    platformTargets: [...(defaultProject.platformTargets ?? ["pc", "web"])],
    agentTargets: [...(defaultProject.agentTargets ?? ["codex", "cursor"])]
  };
};

export const NewProjectModal = ({
  isOpen,
  onOpenChange
}: NewProjectModalProps): JSX.Element | null => {
  const navigate = useNavigate();
  const { createProject } = useProjects();
  const toast = useToast();
  const selectProject = useProjectStore((state) => state.selectProject);

  const titleRef = useRef<HTMLInputElement>(null);
  const customSessionRef = useRef<HTMLInputElement>(null);
  const customGenreRef = useRef<HTMLInputElement>(null);

  const starterModes = useMemo(() => getStarterModeDefinitions(), []);
  const defaultStarterMode = useMemo(
    () => getStarterModeDefaults(DEFAULT_STARTER_MODE),
    []
  );

  const [step, setStep] = useState<1 | 2>(1);
  const [templateId, setTemplateId] = useState<TemplateId>(DEFAULT_STARTER_MODE);
  const [title, setTitle] = useState("");
  const [pitch, setPitch] = useState("");
  const [genre, setGenre] = useState(defaultStarterMode.genre);
  const [subgenre, setSubgenre] = useState(defaultStarterMode.subgenre);
  const [targetAudience, setTargetAudience] = useState(
    defaultStarterMode.targetAudience
  );
  const [enginePreference, setEnginePreference] = useState(
    defaultStarterMode.enginePreference
  );
  const [scopeCategory, setScopeCategory] = useState<ScopeCategory>(
    defaultStarterMode.scopeCategory
  );
  const [sessionLength, setSessionLength] = useState(
    defaultStarterMode.sessionLength
  );
  const [platformTargets, setPlatformTargets] = useState<GamePlatformTarget[]>(
    defaultStarterMode.platformTargets
  );
  const [agentTargets, setAgentTargets] = useState<AgentPlatform[]>(
    defaultStarterMode.agentTargets
  );
  const [customGenre, setCustomGenre] = useState("");
  const [customSubgenre, setCustomSubgenre] = useState("");
  const [customPlayerFantasy, setCustomPlayerFantasy] = useState("");
  const [customPlayPattern, setCustomPlayPattern] = useState("");
  const [customFeelKeywords, setCustomFeelKeywords] = useState("");
  const [showTitleError, setShowTitleError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = useCallback((): void => {
    setStep(1);
    setTemplateId(DEFAULT_STARTER_MODE);
    setTitle("");
    setPitch("");
    setGenre(defaultStarterMode.genre);
    setSubgenre(defaultStarterMode.subgenre);
    setTargetAudience(defaultStarterMode.targetAudience);
    setEnginePreference(defaultStarterMode.enginePreference);
    setScopeCategory(defaultStarterMode.scopeCategory);
    setSessionLength(defaultStarterMode.sessionLength);
    setPlatformTargets(defaultStarterMode.platformTargets);
    setAgentTargets(defaultStarterMode.agentTargets);
    setCustomGenre("");
    setCustomSubgenre("");
    setCustomPlayerFantasy("");
    setCustomPlayPattern("");
    setCustomFeelKeywords("");
    setShowTitleError(false);
    setIsSubmitting(false);
  }, [defaultStarterMode]);

  const closeModal = useCallback((): void => {
    resetForm();
    onOpenChange(false);
  }, [onOpenChange, resetForm]);

  const dialogRef = useDialogAccessibility<HTMLDivElement>(isOpen, closeModal);

  useEffect(() => {
    if (!isOpen || step !== 1 || !titleRef.current) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      titleRef.current?.focus();
    }, 100);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, step]);

  const selectedTemplate = useMemo(
    () => getTemplateDefinition(templateId),
    [templateId]
  );
  const isCustomStarterMode = selectedTemplate.kind === "custom";
  const activeScopeProfile = useMemo(
    () => getScopeProfile(scopeCategory),
    [scopeCategory]
  );
  const activeSessionPreset = useMemo(
    () => getSessionPreset(sessionLength),
    [sessionLength]
  );
  const templateScopeProfile = useMemo(
    () =>
      selectedTemplate.defaultProject.scopeCategory
        ? getScopeProfile(selectedTemplate.defaultProject.scopeCategory)
        : null,
    [selectedTemplate.defaultProject.scopeCategory]
  );
  const isCustomSession = activeSessionPreset === null;

  const handleStarterModeChange = useCallback((nextTemplateId: TemplateId): void => {
    const defaults = getStarterModeDefaults(nextTemplateId);
    setTemplateId(nextTemplateId);
    setGenre(defaults.genre);
    setSubgenre(defaults.subgenre);
    setTargetAudience(defaults.targetAudience);
    setEnginePreference(defaults.enginePreference);
    setScopeCategory(defaults.scopeCategory);
    setSessionLength(defaults.sessionLength);
    setPlatformTargets(defaults.platformTargets);
    setAgentTargets(defaults.agentTargets);

    if (nextTemplateId === "custom-guided") {
      window.setTimeout(() => {
        customGenreRef.current?.focus();
      }, 0);
    }
  }, []);

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

  const handleNextStep = (): void => {
    if (!title.trim()) {
      setShowTitleError(true);
      titleRef.current?.focus();
      return;
    }

    setShowTitleError(false);
    setStep(2);
  };

  const handleSubmit = useCallback(async (): Promise<void> => {
    const trimmedTitle = title.trim();
    const trimmedPitch = pitch.trim();
    const trimmedGenre = (isCustomStarterMode ? customGenre : genre).trim();
    const trimmedSubgenre = (isCustomStarterMode ? customSubgenre : subgenre).trim();
    const customToneKeywords = toTrimmedArray(customFeelKeywords);

    if (!trimmedTitle) {
      setShowTitleError(true);
      setStep(1);
      titleRef.current?.focus();
      return;
    }

    setIsSubmitting(true);

    const project = await createProject({
      title: trimmedTitle,
      name: trimmedTitle,
      oneLinePitch: trimmedPitch,
      description: trimmedPitch,
      genre: trimmedGenre,
      subgenre: trimmedSubgenre,
      scopeCategory,
      templateId,
      platformTargets,
      agentTargets,
      targetPlatforms: agentTargets,
      targetAudience: targetAudience.trim(),
      sessionLength: sessionLength.trim(),
      monetizationModel:
        selectedTemplate.defaultProject.monetizationModel ?? "Premium",
      enginePreference: enginePreference.trim(),
      comparableGames: selectedTemplate.defaultProject.comparableGames ?? [],
      gameDesignDoc: isCustomStarterMode
        ? {
            concept: {
              playerFantasy: customPlayerFantasy.trim()
            },
            coreLoop: {
              secondToSecond: customPlayPattern.trim()
            },
            designPillars: {
              feelStatement: customToneKeywords.join(", ")
            },
            artTone: {
              toneKeywords: customToneKeywords
            }
          }
        : undefined
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
    customFeelKeywords,
    customGenre,
    customPlayPattern,
    customPlayerFantasy,
    customSubgenre,
    createProject,
    enginePreference,
    genre,
    isCustomStarterMode,
    navigate,
    onOpenChange,
    pitch,
    platformTargets,
    resetForm,
    scopeCategory,
    selectProject,
    selectedTemplate.defaultProject.comparableGames,
    selectedTemplate.defaultProject.monetizationModel,
    sessionLength,
    subgenre,
    targetAudience,
    templateId,
    title,
    toast
  ]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface-dim/80 px-4 py-8 backdrop-blur-sm"
      onClick={closeModal}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-project-title"
        className="glass-panel flex max-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-outline-variant/15 bg-surface-container shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-outline-variant/10 bg-surface-container px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary">
                New Game Project
              </p>
              <h2
                id="new-project-title"
                className="mt-2 font-headline text-3xl font-bold tracking-tight text-on-surface"
              >
                Start a new game design workspace
              </h2>
              <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                Create the project core first, then lock the production setup without
                cramming every decision into one screen.
              </p>
            </div>
            <button
              type="button"
              onClick={closeModal}
              className="rounded-full p-2 text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {CREATION_STEPS.map((creationStep) => {
              const isActive = creationStep.id === step;
              const isComplete = creationStep.id < step;

              return (
                <div
                  key={creationStep.id}
                  className={cn(
                    "min-w-[220px] rounded-2xl border px-4 py-3 transition",
                    isActive
                      ? "border-primary/30 bg-primary/10"
                      : isComplete
                        ? "border-secondary/25 bg-secondary/10"
                        : "border-outline-variant/10 bg-surface"
                  )}
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                    Step {creationStep.id}
                  </p>
                  <p className="mt-2 font-headline text-base font-semibold text-on-surface">
                    {creationStep.label}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                    {creationStep.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {step === 1 ? (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-5">
                <GameField
                  label="Starter Mode"
                  description="Pick a curated mode bias or start from a guided custom setup."
                >
                  <SingleSelectCards
                    layoutVariant="starter-mode"
                    selectedValue={templateId}
                    onSelect={(value) =>
                      handleStarterModeChange(value as TemplateId)
                    }
                    cards={starterModes.map((starterMode) => {
                      const scopeProfile = starterMode.defaultProject.scopeCategory
                        ? getScopeProfile(starterMode.defaultProject.scopeCategory)
                        : null;

                      return {
                        value: starterMode.id,
                        title: starterMode.label,
                        description: starterMode.description,
                        eyebrow:
                          starterMode.kind === "custom"
                            ? "Guided Setup"
                            : undefined,
                        meta: [
                          scopeProfile?.label ?? "Flexible",
                          starterMode.defaultProject.sessionLength ?? "TBD"
                        ]
                      };
                    })}
                  />
                </GameField>

                <GameField label="Game Title">
                  <GameTextInput
                    ref={titleRef}
                    data-autofocus
                    type="text"
                    value={title}
                    placeholder="Nightline Zero"
                    onChange={(event) => {
                      setTitle(event.target.value);
                      if (event.target.value.trim()) {
                        setShowTitleError(false);
                      }
                    }}
                  />
                  {showTitleError ? (
                    <p className="mt-2 text-sm text-tertiary">
                      Game title is required before continuing.
                    </p>
                  ) : null}
                </GameField>

                <GameField label="One-Line Pitch">
                  <GameTextInput
                    type="text"
                    value={pitch}
                    placeholder="A touch-first rail shooter about surviving choreographed ambushes."
                    onChange={(event) => setPitch(event.target.value)}
                  />
                </GameField>

                {isCustomStarterMode ? (
                  <div className="rounded-3xl border border-primary/15 bg-surface px-5 py-5">
                    <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary">
                      Guided Custom Setup
                    </p>
                    <div className="mt-4 grid gap-5 md:grid-cols-2">
                      <GameField label="Genre">
                        <GameTextInput
                          ref={customGenreRef}
                          type="text"
                          value={customGenre}
                          placeholder="Strategy"
                          onChange={(event) => setCustomGenre(event.target.value)}
                        />
                      </GameField>
                      <GameField label="Subgenre">
                        <GameTextInput
                          type="text"
                          value={customSubgenre}
                          placeholder="Deckbuilder Lite"
                          onChange={(event) => setCustomSubgenre(event.target.value)}
                        />
                      </GameField>
                    </div>

                    <div className="mt-5 grid gap-5">
                      <GameField label="Player Fantasy">
                        <GameTextInput
                          type="text"
                          value={customPlayerFantasy}
                          placeholder="Outsmart escalating threats with clever chain reactions."
                          onChange={(event) =>
                            setCustomPlayerFantasy(event.target.value)
                          }
                        />
                      </GameField>

                      <GameField label="Primary Play Pattern">
                        <GameTextInput
                          type="text"
                          value={customPlayPattern}
                          placeholder="Read the arena, trigger one strong interaction, and reposition before the next twist."
                          onChange={(event) =>
                            setCustomPlayPattern(event.target.value)
                          }
                        />
                      </GameField>

                      <GameField label="Feel Keywords">
                        <GameTextInput
                          type="text"
                          value={customFeelKeywords}
                          placeholder="tense, readable, punchy"
                          onChange={(event) =>
                            setCustomFeelKeywords(event.target.value)
                          }
                        />
                        <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                          Use comma-separated keywords. These seed the feel statement
                          and tone vocabulary for the new project.
                        </p>
                      </GameField>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-5 md:grid-cols-2">
                    <GameField label="Genre">
                      <GameTextInput
                        type="text"
                        value={genre}
                        onChange={(event) => setGenre(event.target.value)}
                      />
                    </GameField>
                    <GameField label="Subgenre">
                      <GameTextInput
                        type="text"
                        value={subgenre}
                        onChange={(event) => setSubgenre(event.target.value)}
                      />
                    </GameField>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl border border-outline-variant/10 bg-surface p-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary">
                    Selected Starter Mode
                  </p>
                  <p className="mt-3 font-headline text-xl font-semibold text-on-surface">
                    {selectedTemplate.label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                    {selectedTemplate.description}
                  </p>

                  <div className="mt-5 space-y-3 text-sm leading-6 text-on-surface-variant">
                    <p>
                      <span className="font-semibold text-on-surface">
                        Default scope:
                      </span>{" "}
                      {templateScopeProfile?.label ?? "Flexible"}.
                    </p>
                    <p>
                      <span className="font-semibold text-on-surface">
                        Typical session:
                      </span>{" "}
                      {selectedTemplate.defaultProject.sessionLength || "TBD"}.
                    </p>
                    <p>
                      <span className="font-semibold text-on-surface">
                        Default tool bias:
                      </span>{" "}
                      {(selectedTemplate.defaultProject.agentTargets ?? [])
                        .join(", ")
                        .toUpperCase() || "None"}.
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border border-outline-variant/10 bg-surface px-5 py-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary">
                    {isCustomStarterMode ? "Custom Mode" : "Fast Path"}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                    {isCustomStarterMode
                      ? "Custom stays lightweight: define the fantasy, loop seed, and tone keywords here, then shape production constraints in Step 2."
                      : "Only the game title is required to keep moving. Step 2 handles production setup, tools, and scope framing."}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <GameField
                label="Scope"
                description="Choose the production ceiling for v1, not the fantasy size of the game."
              >
                <SingleSelectCards
                  layoutVariant="modal-compact"
                  selectedValue={scopeCategory}
                  onSelect={(value) => setScopeCategory(value as ScopeCategory)}
                  cards={SCOPE_ORDER.map((scopeCategoryValue) => {
                    const profile = getScopeProfile(scopeCategoryValue);

                    return {
                      value: profile.id,
                      title: profile.label,
                      description: profile.summary,
                      tone: profile.tone,
                      eyebrow:
                        profile.tone === "warning" ? "Warning Tier" : undefined
                    };
                  })}
                />
                <div
                  className={
                    activeScopeProfile.tone === "warning"
                      ? "mt-4 rounded-2xl border border-amber-300/20 bg-amber-500/5 px-4 py-4"
                      : "mt-4 rounded-2xl border border-outline-variant/10 bg-surface px-4 py-4"
                  }
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                    {activeScopeProfile.tone === "warning"
                      ? "Large Scope Warning"
                      : "Scope Guardrails"}
                  </p>
                  {activeScopeProfile.warningMessage ? (
                    <p className="mt-3 text-sm leading-6 text-amber-100/90">
                      {activeScopeProfile.warningMessage}
                    </p>
                  ) : null}
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-on-surface-variant">
                    {activeScopeProfile.guardrails.map((guardrail) => (
                      <li key={guardrail}>{guardrail}</li>
                    ))}
                  </ul>
                </div>
              </GameField>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                <div className="space-y-6">
                  <GameField
                    label="Session Length"
                    description="Typical one-sitting play time, not total completion time."
                  >
                    <GameSelect
                      value={activeSessionPreset?.label ?? "__custom__"}
                      onChange={(event) => {
                        const value = event.target.value;
                        if (value === "__custom__") {
                          setSessionLength((current) =>
                            activeSessionPreset ? "" : current
                          );
                          window.setTimeout(() => {
                            customSessionRef.current?.focus();
                          }, 0);
                          return;
                        }

                        setSessionLength(value);
                      }}
                    >
                      {SESSION_LENGTH_PRESETS.map((preset) => (
                        <option key={preset.id} value={preset.label}>
                          {preset.label}
                        </option>
                      ))}
                      <option value="__custom__">Custom</option>
                    </GameSelect>
                    {isCustomSession ? (
                      <GameTextInput
                        ref={customSessionRef}
                        className="mt-3"
                        type="text"
                        value={sessionLength}
                        placeholder="Use a custom session target"
                        onChange={(event) => setSessionLength(event.target.value)}
                      />
                    ) : null}
                    <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                      {activeSessionPreset?.summary ??
                        "Use a custom session target when your intended play rhythm does not match the preset ranges."}
                    </p>
                  </GameField>

                  <div className="grid gap-5 md:grid-cols-2">
                    <GameField label="Target Audience">
                      <GameTextInput
                        type="text"
                        value={targetAudience}
                        placeholder="Arcade action fans who want short, high-readability runs"
                        onChange={(event) => setTargetAudience(event.target.value)}
                      />
                    </GameField>

                    <GameField label="Engine Preference">
                      <GameTextInput
                        type="text"
                        value={enginePreference}
                        placeholder="Leave blank to stay engine-agnostic"
                        onChange={(event) => setEnginePreference(event.target.value)}
                      />
                    </GameField>
                  </div>
                </div>

                <div className="space-y-6">
                  <GameField
                    label="Game Platform Targets"
                    description="Pick the platforms this v1 should actually ship on."
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
                    description="Choose the agents this project should generate prompts for."
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

                  <div className="rounded-3xl border border-outline-variant/10 bg-surface px-5 py-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary">
                      What This Workspace Optimizes For
                    </p>
                    <ul className="mt-4 space-y-2 text-sm leading-6 text-on-surface-variant">
                      <li>Local-first planning before any AI key is added.</li>
                      <li>Clear first-playable framing and prompt-ready build stages.</li>
                      <li>Small-to-medium game scopes by default, with large mode kept milestone-driven.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-outline-variant/10 bg-surface-container px-6 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
                Step {step} of {CREATION_STEPS.length}
              </p>
              <p className="mt-2 text-sm text-on-surface-variant">
                {step === 1
                  ? "Lock the project identity before moving into production decisions."
                  : "Finish the production setup, then create the project shell."}
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-2xl border border-outline-variant/15 bg-surface px-5 py-3 text-sm text-on-surface"
              >
                Cancel
              </button>

              {step === 2 ? (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-2xl border border-outline-variant/15 bg-surface px-5 py-3 text-sm text-on-surface"
                >
                  Back
                </button>
              ) : null}

              {step === 1 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="gradient-cta glow-primary rounded-2xl px-5 py-3 text-sm font-semibold text-on-primary"
                >
                  Next: Production Setup
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleSubmit()}
                  disabled={isSubmitting}
                  className="gradient-cta glow-primary rounded-2xl px-5 py-3 text-sm font-semibold text-on-primary disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Game Project"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
