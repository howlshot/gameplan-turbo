import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { getProjectTabPath } from "@/components/layout/sidebarConfig";
import { useDialogAccessibility } from "@/hooks/useDialogAccessibility";
import { useAIProviders } from "@/hooks/useAIProviders";
import { useWebSurface } from "@/hooks/useWebSurface";
import { useProjects } from "@/hooks/useProjects";
import { useToast } from "@/hooks/useToast";
import { useProjectStore } from "@/stores/projectStore";
import {
  AGENT_PLATFORM_OPTIONS,
  GAME_PLATFORM_OPTIONS,
  getGenreFamilyDefinition,
  getGenreFamilyDefinitions,
  getSubgenreDefinition,
  getTemplateDefinition,
  inferTemplateIdFromGenreSelection
} from "@/lib/templates/genreTemplates";
import { getPreferredAgentPlatformForProvider } from "@/lib/ai/providerCatalog";
import {
  GameField,
  GameSelect,
  GameTextInput,
  MultiSelectPills,
  SingleSelectCards
} from "@/components/workspace/game/GameSectionLayout";
import {
  getScopeProfile,
  getSessionPreset,
  SCOPE_ORDER,
  SESSION_LENGTH_PRESETS
} from "@/lib/projectFraming";
import {
  CUSTOM_ENGINE_VALUE,
  ENGINE_OPTIONS,
  getEngineSelectValue
} from "@/lib/engineOptions";
import { cn } from "@/lib/utils";
import type {
  AgentPlatform,
  GamePlatformTarget,
  ScopeCategory,
  TemplateId
} from "@/types";
import type { GenreFamilyId } from "@/lib/templates/genreTemplates";

interface NewProjectModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

interface CreationStep {
  id: 1 | 2;
  label: string;
  description: string;
}

interface FormDefaults {
  agentTargets: AgentPlatform[];
  enginePreference: string;
  platformTargets: GamePlatformTarget[];
  scopeCategory: ScopeCategory;
  sessionLength: string;
  targetAudience: string;
}

type RecommendedFieldKey =
  | "scopeCategory"
  | "sessionLength"
  | "platformTargets"
  | "agentTargets"
  | "targetAudience"
  | "enginePreference";

type RecommendationOwnership = Record<RecommendedFieldKey, boolean>;

const CREATION_STEPS: CreationStep[] = [
  {
    id: 1,
    label: "Core Identity",
    description: "Title, pitch, genre."
  },
  {
    id: 2,
    label: "Production Setup",
    description: "Scope, platforms, tools."
  }
];

const DEFAULT_TEMPLATE_ID: TemplateId = "blank-game-project";

const INITIAL_RECOMMENDATION_OWNERSHIP: RecommendationOwnership = {
  scopeCategory: false,
  sessionLength: false,
  platformTargets: false,
  agentTargets: false,
  targetAudience: false,
  enginePreference: false
};

const toTrimmedArray = (value: string): string[] =>
  Array.from(
    new Set(
      value
        .split(/[\n,]/)
        .map((token) => token.trim())
        .filter(Boolean)
    )
  );

const areArraysEqual = (left: string[], right: string[]): boolean =>
  left.length === right.length &&
  left.every((value, index) => value === right[index]);

const getRecommendationDefaults = (
  templateId: TemplateId,
  preferredAgentTarget?: AgentPlatform | null
): FormDefaults => {
  const template = getTemplateDefinition(templateId);
  const defaultProject = template.defaultProject;
  const defaultAgentTargets = preferredAgentTarget
    ? [preferredAgentTarget]
    : [...(defaultProject.agentTargets ?? ["codex", "cursor"])];

  return {
    targetAudience: defaultProject.targetAudience ?? "",
    enginePreference: defaultProject.enginePreference ?? "",
    scopeCategory: defaultProject.scopeCategory ?? "small",
    sessionLength: defaultProject.sessionLength ?? "10-20 minutes",
    platformTargets: [...(defaultProject.platformTargets ?? ["pc", "web"])],
    agentTargets: defaultAgentTargets
  };
};

export const NewProjectModal = ({
  isOpen,
  onOpenChange
}: NewProjectModalProps): JSX.Element | null => {
  const navigate = useNavigate();
  const { createProject } = useProjects();
  const { defaultProvider } = useAIProviders();
  const surface = useWebSurface();
  const isMobileSurface = surface === "mobile-web";
  const toast = useToast();
  const selectProject = useProjectStore((state) => state.selectProject);

  const titleRef = useRef<HTMLInputElement>(null);
  const customSessionRef = useRef<HTMLInputElement>(null);
  const customGenreRef = useRef<HTMLInputElement>(null);

  const genreFamilies = useMemo(() => getGenreFamilyDefinitions(), []);
  const preferredAgentTarget = useMemo(
    () =>
      defaultProvider
        ? getPreferredAgentPlatformForProvider(defaultProvider.provider)
        : null,
    [defaultProvider]
  );
  const defaultRecommendation = useMemo(
    () => getRecommendationDefaults(DEFAULT_TEMPLATE_ID, preferredAgentTarget),
    [preferredAgentTarget]
  );

  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState("");
  const [pitch, setPitch] = useState("");
  const [genreFamilyId, setGenreFamilyId] = useState<GenreFamilyId | "">("");
  const [subgenreId, setSubgenreId] = useState("");
  const [targetAudience, setTargetAudience] = useState(
    defaultRecommendation.targetAudience
  );
  const [enginePreference, setEnginePreference] = useState(
    defaultRecommendation.enginePreference
  );
  const [engineSelection, setEngineSelection] = useState(
    getEngineSelectValue(defaultRecommendation.enginePreference)
  );
  const [scopeCategory, setScopeCategory] = useState<ScopeCategory>(
    defaultRecommendation.scopeCategory
  );
  const [sessionLength, setSessionLength] = useState(
    defaultRecommendation.sessionLength
  );
  const [platformTargets, setPlatformTargets] = useState<GamePlatformTarget[]>(
    defaultRecommendation.platformTargets
  );
  const [agentTargets, setAgentTargets] = useState<AgentPlatform[]>(
    defaultRecommendation.agentTargets
  );
  const [customGenre, setCustomGenre] = useState("");
  const [customSubgenre, setCustomSubgenre] = useState("");
  const [customPlayerFantasy, setCustomPlayerFantasy] = useState("");
  const [customPlayPattern, setCustomPlayPattern] = useState("");
  const [customFeelKeywords, setCustomFeelKeywords] = useState("");
  const [showTitleError, setShowTitleError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recommendationOwnership, setRecommendationOwnership] =
    useState<RecommendationOwnership>(INITIAL_RECOMMENDATION_OWNERSHIP);

  const isOtherGenrePath = genreFamilyId === "other";
  const selectedGenreFamily = useMemo(
    () =>
      genreFamilyId ? getGenreFamilyDefinition(genreFamilyId) ?? null : null,
    [genreFamilyId]
  );
  const selectedSubgenre = useMemo(
    () =>
      genreFamilyId && !isOtherGenrePath && subgenreId
        ? getSubgenreDefinition(genreFamilyId, subgenreId) ?? null
        : null,
    [genreFamilyId, isOtherGenrePath, subgenreId]
  );

  const resolvedTemplateId = useMemo(
    () =>
      inferTemplateIdFromGenreSelection({
        genreFamilyId,
        subgenreId,
        customGenre,
        customSubgenre,
        customPlayerFantasy,
        customPlayPattern,
        customFeelKeywords
      }),
    [
      customFeelKeywords,
      customGenre,
      customPlayPattern,
      customPlayerFantasy,
      customSubgenre,
      genreFamilyId,
      subgenreId
    ]
  );
  const selectedTemplate = useMemo(
    () => getTemplateDefinition(resolvedTemplateId),
    [resolvedTemplateId]
  );
  const recommendedDefaults = useMemo(
    () => getRecommendationDefaults(resolvedTemplateId, preferredAgentTarget),
    [preferredAgentTarget, resolvedTemplateId]
  );
  const recommendedScopeProfile = useMemo(
    () => getScopeProfile(recommendedDefaults.scopeCategory),
    [recommendedDefaults.scopeCategory]
  );
  const recommendedSessionPreset = useMemo(
    () => getSessionPreset(recommendedDefaults.sessionLength),
    [recommendedDefaults.sessionLength]
  );
  const activeScopeProfile = useMemo(
    () => getScopeProfile(scopeCategory),
    [scopeCategory]
  );
  const activeSessionPreset = useMemo(
    () => getSessionPreset(sessionLength),
    [sessionLength]
  );
  const isCustomSession = activeSessionPreset === null;
  const isCustomEngine = engineSelection === CUSTOM_ENGINE_VALUE;
  const hasRecommendationOverrides = useMemo(
    () => Object.values(recommendationOwnership).some(Boolean),
    [recommendationOwnership]
  );
  const recommendationTitle = useMemo(() => {
    if (selectedSubgenre && selectedGenreFamily) {
      return `${selectedGenreFamily.label} -> ${selectedSubgenre.label}`;
    }

    if (isOtherGenrePath) {
      return customGenre.trim()
        ? `${customGenre.trim()}${customSubgenre.trim() ? ` -> ${customSubgenre.trim()}` : ""}`
        : "Other / Custom";
    }

    return "Neutral baseline";
  }, [
    customGenre,
    customSubgenre,
    isOtherGenrePath,
    selectedGenreFamily,
    selectedSubgenre
  ]);
  const recommendationDescription = useMemo(() => {
    if (selectedSubgenre) {
      return selectedSubgenre.rationale;
    }

    if (isOtherGenrePath) {
      return resolvedTemplateId === "custom-guided"
        ? "Your custom framing will stay editable while the project uses a lightweight guided baseline behind the scenes."
        : "Use the freeform fields to describe your own genre path. Until then, Gameplan Turbo keeps a neutral blank-project baseline."
        ;
    }

    return "Choose a genre family and subgenre to load tailored recommendations. Until then, the project stays on the blank baseline.";
  }, [isOtherGenrePath, resolvedTemplateId, selectedSubgenre]);

  const resetForm = useCallback((): void => {
    setStep(1);
    setTitle("");
    setPitch("");
    setGenreFamilyId("");
    setSubgenreId("");
    setTargetAudience(defaultRecommendation.targetAudience);
    setEnginePreference(defaultRecommendation.enginePreference);
    setEngineSelection(getEngineSelectValue(defaultRecommendation.enginePreference));
    setScopeCategory(defaultRecommendation.scopeCategory);
    setSessionLength(defaultRecommendation.sessionLength);
    setPlatformTargets(defaultRecommendation.platformTargets);
    setAgentTargets(defaultRecommendation.agentTargets);
    setCustomGenre("");
    setCustomSubgenre("");
    setCustomPlayerFantasy("");
    setCustomPlayPattern("");
    setCustomFeelKeywords("");
    setRecommendationOwnership(INITIAL_RECOMMENDATION_OWNERSHIP);
    setShowTitleError(false);
    setIsSubmitting(false);
  }, [defaultRecommendation]);

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

  useEffect(() => {
    if (!isOpen || !isOtherGenrePath) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      customGenreRef.current?.focus();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, isOtherGenrePath]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setScopeCategory((current) =>
      recommendationOwnership.scopeCategory ||
      current === recommendedDefaults.scopeCategory
        ? current
        : recommendedDefaults.scopeCategory
    );
    setSessionLength((current) =>
      recommendationOwnership.sessionLength ||
      current === recommendedDefaults.sessionLength
        ? current
        : recommendedDefaults.sessionLength
    );
    setTargetAudience((current) =>
      recommendationOwnership.targetAudience ||
      current === recommendedDefaults.targetAudience
        ? current
        : recommendedDefaults.targetAudience
    );
    setEnginePreference((current) =>
      recommendationOwnership.enginePreference ||
      current === recommendedDefaults.enginePreference
        ? current
        : recommendedDefaults.enginePreference
    );
    setEngineSelection((current) =>
      recommendationOwnership.enginePreference
        ? current
        : getEngineSelectValue(recommendedDefaults.enginePreference)
    );
    setPlatformTargets((current) =>
      recommendationOwnership.platformTargets ||
      areArraysEqual(current, recommendedDefaults.platformTargets)
        ? current
        : recommendedDefaults.platformTargets
    );
    setAgentTargets((current) =>
      recommendationOwnership.agentTargets ||
      areArraysEqual(current, recommendedDefaults.agentTargets)
        ? current
        : recommendedDefaults.agentTargets
    );
  }, [
    isOpen,
    recommendationOwnership.agentTargets,
    recommendationOwnership.enginePreference,
    recommendationOwnership.platformTargets,
    recommendationOwnership.scopeCategory,
    recommendationOwnership.sessionLength,
    recommendationOwnership.targetAudience,
    recommendedDefaults.agentTargets,
    recommendedDefaults.enginePreference,
    recommendedDefaults.platformTargets,
    recommendedDefaults.scopeCategory,
    recommendedDefaults.sessionLength,
    recommendedDefaults.targetAudience
  ]);

  const markFieldAsOwned = useCallback((field: RecommendedFieldKey): void => {
    setRecommendationOwnership((current) =>
      current[field]
        ? current
        : {
            ...current,
            [field]: true
          }
    );
  }, []);

  const handleGenreFamilyChange = useCallback((nextValue: string): void => {
    const nextGenreFamily = nextValue as GenreFamilyId | "";

    setGenreFamilyId(nextGenreFamily);
    setSubgenreId("");
  }, []);

  const togglePlatform = (platform: string): void => {
    markFieldAsOwned("platformTargets");
    setPlatformTargets((current) =>
      current.includes(platform as GamePlatformTarget)
        ? current.filter((value) => value !== platform)
        : [...current, platform as GamePlatformTarget]
    );
  };

  const toggleAgentTarget = (platform: string): void => {
    markFieldAsOwned("agentTargets");
    setAgentTargets((current) =>
      current.includes(platform as AgentPlatform)
        ? current.filter((value) => value !== platform)
        : [...current, platform as AgentPlatform]
    );
  };

  const handleResetToRecommendations = useCallback((): void => {
    setRecommendationOwnership(INITIAL_RECOMMENDATION_OWNERSHIP);
    setScopeCategory(recommendedDefaults.scopeCategory);
    setSessionLength(recommendedDefaults.sessionLength);
    setTargetAudience(recommendedDefaults.targetAudience);
    setEnginePreference(recommendedDefaults.enginePreference);
    setEngineSelection(getEngineSelectValue(recommendedDefaults.enginePreference));
    setPlatformTargets(recommendedDefaults.platformTargets);
    setAgentTargets(recommendedDefaults.agentTargets);
  }, [recommendedDefaults]);

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
    const trimmedGenre = isOtherGenrePath
      ? customGenre.trim()
      : selectedGenreFamily?.label ?? "";
    const trimmedSubgenre = isOtherGenrePath
      ? customSubgenre.trim()
      : selectedSubgenre?.label ?? "";
    const customToneKeywords = toTrimmedArray(customFeelKeywords);
    const shouldSeedCustomDoc = resolvedTemplateId === "custom-guided";

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
      templateId: resolvedTemplateId,
      platformTargets,
      agentTargets,
      targetPlatforms: agentTargets,
      targetAudience: targetAudience.trim(),
      sessionLength: sessionLength.trim(),
      monetizationModel:
        selectedTemplate.defaultProject.monetizationModel ?? "Premium",
      enginePreference: enginePreference.trim(),
      comparableGames: selectedTemplate.defaultProject.comparableGames ?? [],
      gameDesignDoc: shouldSeedCustomDoc
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
    navigate(getProjectTabPath(project.id, "concept"));
  }, [
    agentTargets,
    createProject,
    customFeelKeywords,
    customGenre,
    customPlayPattern,
    customPlayerFantasy,
    customSubgenre,
    enginePreference,
    isOtherGenrePath,
    navigate,
    onOpenChange,
    pitch,
    platformTargets,
    resetForm,
    resolvedTemplateId,
    scopeCategory,
    selectProject,
    selectedGenreFamily?.label,
    selectedSubgenre?.label,
    selectedTemplate.defaultProject.comparableGames,
    selectedTemplate.defaultProject.monetizationModel,
    sessionLength,
    targetAudience,
    title,
    toast
  ]);

  if (!isOpen) return null;

  const modal = (
    <div
      className={`fixed inset-0 z-[80] overscroll-contain bg-surface-dim/80 backdrop-blur-sm ${
        isMobileSurface
          ? "flex items-end justify-center px-0 py-0"
          : "flex items-center justify-center px-4 py-6"
      }`}
      onClick={closeModal}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-project-title"
        className={`glass-panel flex w-full flex-col overflow-hidden overscroll-contain border border-outline-variant/15 bg-surface-container shadow-2xl ${
          isMobileSurface
            ? "h-[100dvh] max-h-[100dvh] rounded-none"
            : "max-h-[calc(100vh-3rem)] max-w-6xl rounded-3xl"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-outline-variant/10 bg-surface-container px-4 py-3 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 max-w-3xl flex-1">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary">
                New Game Project
              </p>
              <h2
                id="new-project-title"
                className="mt-2 font-headline text-xl font-bold tracking-tight text-on-surface sm:text-2xl"
              >
                Start a new game design workspace
              </h2>
            </div>

            <div className="flex flex-col items-stretch gap-3 lg:w-[360px] lg:items-end">
              <button
                type="button"
                onClick={closeModal}
                className="self-end rounded-full p-2 text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              <div className="grid w-full gap-2 sm:grid-cols-2">
                {CREATION_STEPS.map((creationStep) => {
                  const isActive = creationStep.id === step;
                  const isComplete = creationStep.id < step;

                  return (
                    <div
                      key={creationStep.id}
                      className={cn(
                        "rounded-2xl border px-3.5 py-2.5 transition",
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
                      <p className="mt-1 font-headline text-sm font-semibold text-on-surface">
                        {creationStep.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">
          {step === 1 ? (
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
              <div className="space-y-4">
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
                    placeholder="A compact horror game about surviving one unsafe night in a sealed station."
                    onChange={(event) => setPitch(event.target.value)}
                  />
                </GameField>

                <div className="grid gap-4 md:grid-cols-2">
                  <GameField
                    label="Genre Family"
                    description="Choose a broad category first. Recommendations stay editable."
                  >
                    <GameSelect
                      aria-label="Genre Family"
                      value={genreFamilyId}
                      onChange={(event) =>
                        handleGenreFamilyChange(event.target.value)
                      }
                    >
                      <option value="">Choose a genre family</option>
                      {genreFamilies.map((genreFamily) => (
                        <option key={genreFamily.id} value={genreFamily.id}>
                          {genreFamily.label}
                        </option>
                      ))}
                    </GameSelect>
                  </GameField>

                  {isOtherGenrePath ? (
                    <GameField label="Genre">
                      <GameTextInput
                        ref={customGenreRef}
                        type="text"
                        value={customGenre}
                        placeholder="Immersive Sim"
                        onChange={(event) => setCustomGenre(event.target.value)}
                      />
                    </GameField>
                  ) : (
                    <GameField
                      label="Subgenre"
                      description={
                        genreFamilyId
                          ? "Pick the closest subgenre to load targeted recommendations."
                          : "Choose a genre family first."
                      }
                    >
                      <GameSelect
                        aria-label="Subgenre"
                        value={subgenreId}
                        onChange={(event) => setSubgenreId(event.target.value)}
                        disabled={!genreFamilyId}
                      >
                        <option value="">
                          {genreFamilyId
                            ? "Choose a subgenre"
                            : "Choose a genre family first"}
                        </option>
                        {selectedGenreFamily?.subgenres.map((subgenre) => (
                          <option key={subgenre.id} value={subgenre.id}>
                            {subgenre.label}
                          </option>
                        ))}
                      </GameSelect>
                    </GameField>
                  )}
                </div>

                {isOtherGenrePath ? (
                  <div className="rounded-3xl border border-primary/15 bg-surface px-5 py-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary">
                      Other / Custom
                    </p>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <GameField label="Subgenre">
                        <GameTextInput
                          type="text"
                          value={customSubgenre}
                          placeholder="Stealth Puzzle"
                          onChange={(event) => setCustomSubgenre(event.target.value)}
                        />
                      </GameField>
                    </div>

                    <div className="mt-4 grid gap-4">
                      <GameField label="Player Fantasy">
                        <GameTextInput
                          type="text"
                          value={customPlayerFantasy}
                          placeholder="Outsmart escalating threats with careful observation and decisive actions."
                          onChange={(event) =>
                            setCustomPlayerFantasy(event.target.value)
                          }
                        />
                      </GameField>

                      <GameField label="Primary Play Pattern">
                        <GameTextInput
                          type="text"
                          value={customPlayPattern}
                          placeholder="Read the space, commit to one strong move, then reposition before the next twist."
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
                        <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                          Use comma-separated keywords. These seed the feel statement
                          and tone vocabulary if you stay on the custom path.
                        </p>
                      </GameField>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="space-y-3">
                <div className="rounded-3xl border border-outline-variant/10 bg-surface p-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary">
                    Recommended Setup
                  </p>
                  <p className="mt-3 font-headline text-lg font-semibold text-on-surface">
                    {recommendationTitle}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                    {recommendationDescription}
                  </p>

                  <div className="mt-4 space-y-2.5 text-sm leading-6 text-on-surface-variant">
                    <p>
                      <span className="font-semibold text-on-surface">
                        Recommended scope:
                      </span>{" "}
                      {recommendedScopeProfile.label}.
                    </p>
                    <p>
                      <span className="font-semibold text-on-surface">
                        Typical session:
                      </span>{" "}
                      {recommendedDefaults.sessionLength}.
                    </p>
                    <p>
                      <span className="font-semibold text-on-surface">
                        Platform targets:
                      </span>{" "}
                      {recommendedDefaults.platformTargets.join(", ").toUpperCase()}.
                    </p>
                    <p>
                      <span className="font-semibold text-on-surface">
                        AI tool bias:
                      </span>{" "}
                      {recommendedDefaults.agentTargets.join(", ").toUpperCase()}.
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border border-outline-variant/10 bg-surface px-5 py-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary">
                    Recommendation Rules
                  </p>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                    Step 2 starts from the current genre recommendation. Manual edits
                    become user-owned until you reset them.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-col gap-4 rounded-3xl border border-outline-variant/10 bg-surface px-5 py-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary">
                    Recommendation Profile
                  </p>
                  <p className="mt-2.5 font-headline text-lg font-semibold text-on-surface">
                    {recommendationTitle}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                    {recommendationDescription}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-primary">
                    <span className="rounded-full border border-outline-variant/15 bg-surface-container px-3 py-1">
                      {recommendedScopeProfile.label}
                    </span>
                    <span className="rounded-full border border-outline-variant/15 bg-surface-container px-3 py-1">
                      {recommendedDefaults.sessionLength}
                    </span>
                    <span className="rounded-full border border-outline-variant/15 bg-surface-container px-3 py-1">
                      {recommendedDefaults.platformTargets.length} platform targets
                    </span>
                    <span className="rounded-full border border-outline-variant/15 bg-surface-container px-3 py-1">
                      {recommendedDefaults.agentTargets.length} tool targets
                    </span>
                  </div>
                </div>
                <div className="space-y-2.5 lg:min-w-[220px]">
                  <button
                    type="button"
                    onClick={handleResetToRecommendations}
                    className="w-full rounded-2xl border border-outline-variant/15 bg-surface-container px-4 py-3 text-sm text-on-surface"
                  >
                    Reset to recommendations
                  </button>
                  <p className="text-xs leading-5 text-on-surface-variant">
                    {hasRecommendationOverrides
                      ? "One or more production fields are currently user-owned."
                      : "You are still using the current recommendation baseline."}
                  </p>
                </div>
              </div>

              <GameField
                label="Scope"
                description="Choose the production ceiling for v1, not the fantasy size of the game."
              >
                <SingleSelectCards
                  layoutVariant="modal-compact"
                  selectedValue={scopeCategory}
                  onSelect={(value) => {
                    markFieldAsOwned("scopeCategory");
                    setScopeCategory(value as ScopeCategory);
                  }}
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

              <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                <div className="space-y-5">
                  <GameField
                    label="Typical Session"
                    description="Typical one-sitting play time, not total completion time."
                  >
                    <GameSelect
                      value={activeSessionPreset?.label ?? "__custom__"}
                      onChange={(event) => {
                        markFieldAsOwned("sessionLength");
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
                        onChange={(event) => {
                          markFieldAsOwned("sessionLength");
                          setSessionLength(event.target.value);
                        }}
                      />
                    ) : null}
                    <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                      {activeSessionPreset?.summary ??
                        "Use a custom session target when the intended play rhythm does not match the preset ranges."}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-on-surface-variant">
                      Recommended baseline:{" "}
                      {recommendedSessionPreset?.label ??
                        recommendedDefaults.sessionLength}
                      .
                    </p>
                  </GameField>

                  <div className="grid gap-4 md:grid-cols-2">
                    <GameField label="Target Audience">
                      <GameTextInput
                        type="text"
                        value={targetAudience}
                        placeholder="Players who want readable pressure and fast runs"
                        onChange={(event) => {
                          markFieldAsOwned("targetAudience");
                          setTargetAudience(event.target.value);
                        }}
                      />
                    </GameField>

                    <GameField label="Engine Preference">
                      <GameSelect
                        value={engineSelection}
                        onChange={(event) => {
                          markFieldAsOwned("enginePreference");
                          const value = event.target.value;
                          setEngineSelection(value);
                          setEnginePreference(
                            value === CUSTOM_ENGINE_VALUE ? "" : value
                          );
                        }}
                      >
                        {ENGINE_OPTIONS.map((option) => (
                          <option key={option.value || "blank"} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </GameSelect>
                      {isCustomEngine ? (
                        <GameTextInput
                          className="mt-3"
                          type="text"
                          value={enginePreference}
                          placeholder="Use a custom engine or runtime"
                          onChange={(event) => {
                            markFieldAsOwned("enginePreference");
                            setEnginePreference(event.target.value);
                          }}
                        />
                      ) : null}
                      <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                        Pick a common engine or stay engine-agnostic. Use Custom for
                        another runtime or proprietary stack.
                      </p>
                    </GameField>
                  </div>
                </div>

                <div className="space-y-5">
                  <GameField
                    label="Game Platform Targets"
                    description="Recommended from genre, but fully editable."
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
                    description="Defaults to your connected provider when it maps cleanly, then stays fully editable."
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
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-on-surface-variant">
                      <li>Local-first planning before any AI key is added.</li>
                      <li>Clear first-playable framing and prompt-ready build stages.</li>
                      <li>Genre-led recommendations that stay under user control.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 border-t border-outline-variant/10 bg-surface-container/95 px-4 py-3.5 backdrop-blur-xl sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
                Step {step} of {CREATION_STEPS.length}
              </p>
              <p className="mt-1.5 text-sm text-on-surface-variant">
                {step === 1
                  ? "Lock the project identity first."
                  : "Review production defaults, then create the shell."}
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

  return createPortal(modal, document.body);
};
