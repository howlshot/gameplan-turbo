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
import type { TechnicalDesignSection } from "@/types";

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
    />
  );
};

interface TechnicalDesignEditorProps {
  enginePreference: string;
  technicalDesign: TechnicalDesignSection;
  onUpdateEnginePreference: (value: string) => void;
  onUpdateTechnicalField: (
    key: (typeof technicalFields)[number][0],
    value: string
  ) => void;
}

const TechnicalDesignEditor = ({
  enginePreference,
  technicalDesign,
  onUpdateEnginePreference,
  onUpdateTechnicalField
}: TechnicalDesignEditorProps): JSX.Element => {
  const currentEnginePreference =
    technicalDesign.engine || enginePreference;
  const [engineSelection, setEngineSelection] = useState(
    getEngineSelectValue(currentEnginePreference)
  );

  useEffect(() => {
    setEngineSelection(getEngineSelectValue(currentEnginePreference));
  }, [currentEnginePreference]);

  return (
    <GameSectionLayout
      eyebrow="Technical Direction"
      title="Technical Design"
      description="Keep this engine-agnostic when possible, but be explicit about performance targets, pipeline limits, naming, and content authoring rules."
    >
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
    </GameSectionLayout>
  );
};
