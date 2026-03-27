import { useParams } from "react-router-dom";
import {
  GameField,
  GameSectionLayout,
  GameTextarea
} from "@/components/workspace/game/GameSectionLayout";
import { useGameDesignDoc } from "@/hooks/useGameDesignDoc";
import { useProject } from "@/hooks/useProject";
import { useProjects } from "@/hooks/useProjects";

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
    <GameSectionLayout
      eyebrow="Technical Direction"
      title="Technical Design"
      description="Keep this engine-agnostic when possible, but be explicit about performance targets, pipeline limits, naming, and content authoring rules."
    >
      <GameField label="Engine Preference">
        <GameTextarea
          className="min-h-[120px]"
          value={gameDesignDoc.technicalDesign.engine || project.enginePreference}
          placeholder="Godot, Unity, custom stack, or engine-agnostic notes."
          onChange={(event) => {
            const value = event.target.value;
            void Promise.all([
              updateProject(project.id, { enginePreference: value }),
              updateGameDesignDoc({
                technicalDesign: {
                  engine: value
                }
              })
            ]);
          }}
        />
      </GameField>

      <div className="grid gap-6 lg:grid-cols-2">
        {technicalFields.map(([key, label]) => (
          <GameField key={key} label={label}>
            <GameTextarea
              value={gameDesignDoc.technicalDesign[key]}
              onChange={(event) => {
                void updateGameDesignDoc({
                  technicalDesign: {
                    [key]: event.target.value
                  }
                });
              }}
            />
          </GameField>
        ))}
      </div>
    </GameSectionLayout>
  );
};
