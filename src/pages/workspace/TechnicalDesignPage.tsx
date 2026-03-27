import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  GameField,
  GameSelect,
  GameSectionLayout,
  GameTextInput,
  GameTextarea
} from "@/components/workspace/game/GameSectionLayout";
import { useGameDesignDoc } from "@/hooks/useGameDesignDoc";
import { useProject } from "@/hooks/useProject";
import { useProjects } from "@/hooks/useProjects";
import {
  CUSTOM_ENGINE_VALUE,
  ENGINE_OPTIONS,
  getEngineSelectValue
} from "@/lib/engineOptions";
import { WorkspacePageNavigation } from "@/components/workspace/WorkspacePageNavigation";
import { getTemplateDefinition } from "@/lib/templates/genreTemplates";
import type { TechnicalDesignSection, TemplateId } from "@/types";

const technicalFields = [
  ["renderingConstraints", "Rendering Constraints"],
  ["targetFramerate", "Target Framerate"],
  ["memoryPerformanceBudget", "Memory / Performance Budget"],
  ["saveSystem", "Save System"],
  ["contentPipeline", "Content Pipeline"],
  ["namingConventions", "Naming Conventions"],
  ["folderStructure", "Folder Structure"],
  ["platformConstraints", "Platform Constraints"]
] as const;

const TECHNICAL_STARTER_FIELDS = [
  "saveSystem",
  "contentPipeline",
  "namingConventions",
  "folderStructure"
] as const;

const GENERIC_TECHNICAL_STARTERS: Pick<
  TechnicalDesignSection,
  (typeof TECHNICAL_STARTER_FIELDS)[number]
> = {
  saveSystem:
    "Keep saves lightweight: settings, progression flags, and the minimum state needed to resume cleanly.",
  contentPipeline:
    "Start with lightweight data files or scriptable objects for levels, encounters, items, and tuning values before building a heavy toolchain.",
  namingConventions:
    "Name files by gameplay role first, then type or variant, so content stays readable as the project grows.",
  folderStructure:
    "Keep folders simple at first: gameplay, content, UI, audio, art, and data. Split deeper only once the first playable proves the real boundaries."
};

const NOT_SURE_YET_VALUE =
  "Not sure yet. Keep this lightweight until the first playable proves what the project actually needs.";

export const TechnicalDesignPage = (): JSX.Element => {
  const { projectId } = useParams();
  const { project } = useProject(projectId);
  const { updateProject } = useProjects();
  const { gameDesignDoc, updateGameDesignDoc } = useGameDesignDoc(projectId);

  if (!project || !gameDesignDoc) {
    return (
      <GameSectionLayout
        title="Technical Design"
        description="Loading technical design workspace."
      >
        <div className="h-64 animate-pulse rounded-3xl bg-surface-container-high" />
      </GameSectionLayout>
    );
  }

  return (
    <TechnicalDesignEditor
      enginePreference={project.enginePreference}
      templateId={project.templateId}
      technicalDesign={gameDesignDoc.technicalDesign}
      onUpdateEnginePreference={(value) => {
        void Promise.all([
          updateProject(project.id, { enginePreference: value }),
          updateGameDesignDoc({
            technicalDesign: {
              engine: value
            }
          })
        ]);
      }}
      onUpdateTechnicalField={(key, value) => {
        void updateGameDesignDoc({
          technicalDesign: {
            [key]: value
          }
        });
      }}
      onUpdateTechnicalFields={(values) => {
        void updateGameDesignDoc({
          technicalDesign: values
        });
      }}
    />
  );
};

interface TechnicalDesignEditorProps {
  enginePreference: string;
  onUpdateTechnicalFields: (values: Partial<TechnicalDesignSection>) => void;
  technicalDesign: TechnicalDesignSection;
  templateId: TemplateId;
  onUpdateEnginePreference: (value: string) => void;
  onUpdateTechnicalField: (
    key: (typeof technicalFields)[number][0],
    value: string
  ) => void;
}

const TechnicalDesignEditor = ({
  enginePreference,
  onUpdateTechnicalFields,
  technicalDesign,
  templateId,
  onUpdateEnginePreference,
  onUpdateTechnicalField
}: TechnicalDesignEditorProps): JSX.Element => {
  const currentEnginePreference =
    technicalDesign.engine || enginePreference;
  const [engineSelection, setEngineSelection] = useState(
    getEngineSelectValue(currentEnginePreference)
  );
  const templateSuggestions =
    getTemplateDefinition(templateId).defaultDoc.technicalDesign ??
    GENERIC_TECHNICAL_STARTERS;

  useEffect(() => {
    setEngineSelection(getEngineSelectValue(currentEnginePreference));
  }, [currentEnginePreference]);

  const applyTechnicalStarterState = (
    mode: "starter" | "not-sure-yet"
  ): void => {
    const updates: Partial<TechnicalDesignSection> = {};

    TECHNICAL_STARTER_FIELDS.forEach((field) => {
      if (technicalDesign[field].trim().length > 0) {
        return;
      }

      updates[field] =
        mode === "starter"
          ? templateSuggestions[field] || GENERIC_TECHNICAL_STARTERS[field]
          : NOT_SURE_YET_VALUE;
    });

    if (Object.keys(updates).length > 0) {
      onUpdateTechnicalFields(updates);
    }
  };

  return (
    <GameSectionLayout
      eyebrow="Technical Direction"
      title="Technical Design"
      description="This page is optional early on. Use it to lock technical constraints when you know them, or leave fields light and tighten them after the first playable."
    >
      <div className="rounded-3xl border border-outline-variant/10 bg-surface px-5 py-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
          Optional for early-stage indies
        </p>
        <p className="mt-3 text-sm leading-6 text-on-surface-variant">
          If folder structure, content pipeline, or save strategy feel premature,
          you do not need to solve them perfectly right now. Fill blank fields
          with starter suggestions, mark them for later, or return after the
          first playable is stable. Prompt Lab can also expand this later.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => applyTechnicalStarterState("starter")}
            className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary/30 hover:bg-primary/15"
          >
            Fill blank fields with starter suggestions
          </button>
          <button
            type="button"
            onClick={() => applyTechnicalStarterState("not-sure-yet")}
            className="rounded-2xl border border-outline-variant/15 bg-surface-container px-4 py-2 text-sm font-semibold text-on-surface transition hover:bg-surface-container-high"
          >
            Mark blank fields for later
          </button>
        </div>
      </div>

      <GameField label="Engine Preference">
        <GameSelect
          value={engineSelection}
          onChange={(event) => {
            const value = event.target.value;
            setEngineSelection(value);
            onUpdateEnginePreference(value === CUSTOM_ENGINE_VALUE ? "" : value);
          }}
        >
          {ENGINE_OPTIONS.map((option) => (
            <option key={option.value || "blank"} value={option.value}>
              {option.label}
            </option>
          ))}
        </GameSelect>
        {engineSelection === CUSTOM_ENGINE_VALUE ? (
          <GameTextInput
            className="mt-3"
            value={currentEnginePreference}
            placeholder="Use a custom engine or runtime"
            onChange={(event) => onUpdateEnginePreference(event.target.value)}
          />
        ) : null}
        <p className="mt-3 text-sm leading-6 text-on-surface-variant">
          Choose a common engine, stay engine-agnostic, or use Custom for another
          runtime or proprietary stack.
        </p>
      </GameField>

      <div className="grid gap-6 lg:grid-cols-2">
        {technicalFields.map(([key, label]) => (
          <GameField key={key} label={label}>
            <GameTextarea
              value={technicalDesign[key]}
              onChange={(event) => {
                onUpdateTechnicalField(key, event.target.value);
              }}
            />
          </GameField>
        ))}
      </div>

      <WorkspacePageNavigation currentTabId="technical-design" />
    </GameSectionLayout>
  );
};
