import { useParams } from "react-router-dom";
import {
  GameField,
  GameSectionLayout,
  GameSelect,
  GameTextInput,
  GameTextarea,
  MultiSelectPills
} from "@/components/workspace/game/GameSectionLayout";
import { useGameDesignDoc } from "@/hooks/useGameDesignDoc";
import { useProject } from "@/hooks/useProject";
import { useProjects } from "@/hooks/useProjects";
import {
  AGENT_PLATFORM_OPTIONS,
  GAME_PLATFORM_OPTIONS
} from "@/lib/templates/genreTemplates";
import { splitCommaSeparated, toCommaSeparated } from "@/lib/gameProjectUtils";
import type { AgentPlatform, GamePlatformTarget, ScopeCategory } from "@/types";

const scopeOptions: ScopeCategory[] = ["tiny", "small", "medium"];

export const ConceptPage = (): JSX.Element => {
  const { projectId } = useParams();
  const { project } = useProject(projectId);
  const { updateProject } = useProjects();
  const { gameDesignDoc, updateGameDesignDoc } = useGameDesignDoc(projectId);

  if (!project || !gameDesignDoc) {
    return (
      <GameSectionLayout
        title="Concept"
        description="Loading your game concept workspace."
      >
        <div className="h-64 animate-pulse rounded-3xl bg-surface-container-high" />
      </GameSectionLayout>
    );
  }

  const concept = gameDesignDoc.concept;

  const updateConcept = async (
    field: keyof typeof concept,
    value: string | string[] | GamePlatformTarget[] | ScopeCategory
  ): Promise<void> => {
    await updateGameDesignDoc({
      concept: {
        [field]: value
      }
    });
  };

  const updateProjectHeader = async (
    updates: Partial<Parameters<typeof updateProject>[1]>
  ): Promise<void> => {
    await updateProject(project.id, updates);
  };

  const toggleGamePlatform = async (value: string): Promise<void> => {
    const next = concept.platformTargets.includes(value as GamePlatformTarget)
      ? concept.platformTargets.filter((item) => item !== value)
      : [...concept.platformTargets, value as GamePlatformTarget];

    await Promise.all([
      updateConcept("platformTargets", next),
      updateProjectHeader({ platformTargets: next })
    ]);
  };

  const toggleAgentPlatform = async (value: string): Promise<void> => {
    const next = project.agentTargets.includes(value as AgentPlatform)
      ? project.agentTargets.filter((item) => item !== value)
      : [...project.agentTargets, value as AgentPlatform];

    await updateProjectHeader({
      agentTargets: next,
      targetPlatforms: next
    });
  };

  return (
    <GameSectionLayout
      eyebrow="Project Core"
      title="Concept"
      description="Frame the game before you ask an AI agent to build anything. This page defines the promise, the player fantasy, the audience, and the guardrails that keep scope under control."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <GameField label="Game Title">
            <GameTextInput
              value={project.title}
              placeholder="Nightline Zero"
              onChange={(event) => {
                const value = event.target.value;
                void Promise.all([
                  updateProjectHeader({ title: value, name: value }),
                  updateConcept("gameTitle", value)
                ]);
              }}
            />
          </GameField>

          <GameField label="One-Line Pitch">
            <GameTextInput
              value={project.oneLinePitch}
              placeholder="A touch-first rail shooter about surviving choreographed urban ambushes."
              onChange={(event) => {
                const value = event.target.value;
                void Promise.all([
                  updateProjectHeader({ oneLinePitch: value, description: value }),
                  updateConcept("oneLinePitch", value)
                ]);
              }}
            />
          </GameField>

          <GameField label="Player Fantasy">
            <GameTextarea
              value={concept.playerFantasy}
              placeholder="What fantasy is the player buying into?"
              onChange={(event) => {
                void updateConcept("playerFantasy", event.target.value);
              }}
            />
          </GameField>

          <div className="grid gap-6 md:grid-cols-2">
            <GameField label="Genre">
              <GameTextInput
                value={project.genre}
                placeholder="Action"
                onChange={(event) => {
                  const value = event.target.value;
                  void Promise.all([
                    updateProjectHeader({ genre: value }),
                    updateConcept("genre", value)
                  ]);
                }}
              />
            </GameField>

            <GameField label="Subgenre">
              <GameTextInput
                value={project.subgenre}
                placeholder="Rail Shooter"
                onChange={(event) => {
                  const value = event.target.value;
                  void Promise.all([
                    updateProjectHeader({ subgenre: value }),
                    updateConcept("subgenre", value)
                  ]);
                }}
              />
            </GameField>
          </div>

          <GameField label="Comparable Games" description="Comma-separated references help the prompt lab stay grounded.">
            <GameTextarea
              className="min-h-[120px]"
              value={toCommaSeparated(project.comparableGames)}
              placeholder="Virtua Cop, Time Crisis, House of the Dead"
              onChange={(event) => {
                const value = splitCommaSeparated(event.target.value);
                void Promise.all([
                  updateProjectHeader({ comparableGames: value }),
                  updateConcept("comparableGames", value)
                ]);
              }}
            />
          </GameField>
        </div>

        <div className="space-y-6">
          <GameField label="Scope Category">
            <GameSelect
              value={project.scopeCategory}
              onChange={(event) => {
                const value = event.target.value as ScopeCategory;
                void Promise.all([
                  updateProjectHeader({ scopeCategory: value }),
                  updateConcept("scopeCategory", value)
                ]);
              }}
            >
              {scopeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </GameSelect>
          </GameField>

          <div className="grid gap-6 md:grid-cols-2">
            <GameField label="Target Audience">
              <GameTextInput
                value={project.targetAudience}
                placeholder="Arcade action fans who play in short bursts"
                onChange={(event) => {
                  const value = event.target.value;
                  void Promise.all([
                    updateProjectHeader({ targetAudience: value }),
                    updateConcept("targetAudience", value)
                  ]);
                }}
              />
            </GameField>

            <GameField label="Session Length">
              <GameTextInput
                value={project.sessionLength}
                placeholder="5-12 minutes"
                onChange={(event) => {
                  const value = event.target.value;
                  void Promise.all([
                    updateProjectHeader({ sessionLength: value }),
                    updateConcept("sessionLength", value)
                  ]);
                }}
              />
            </GameField>
          </div>

          <GameField label="Monetization Model">
            <GameTextInput
              value={project.monetizationModel}
              placeholder="Premium, premium + DLC, free with ads, etc."
              onChange={(event) => {
                const value = event.target.value;
                void Promise.all([
                  updateProjectHeader({ monetizationModel: value }),
                  updateConcept("monetizationModel", value)
                ]);
              }}
            />
          </GameField>

          <GameField
            label="Platform Targets"
            description="Where the finished game ships."
          >
            <MultiSelectPills
              selectedValues={concept.platformTargets}
              onToggle={(value) => void toggleGamePlatform(value)}
              options={GAME_PLATFORM_OPTIONS.map((platform) => ({
                label: platform,
                value: platform
              }))}
            />
          </GameField>

          <GameField
            label="Preferred AI Build Tools"
            description="These are the assistants you plan to use for implementation prompts."
          >
            <MultiSelectPills
              selectedValues={project.agentTargets}
              onToggle={(value) => void toggleAgentPlatform(value)}
              options={AGENT_PLATFORM_OPTIONS.map((platform) => ({
                label: platform,
                value: platform
              }))}
            />
          </GameField>

          <GameField label="Differentiators and Scope Guardrails">
            <GameTextarea
              value={concept.differentiators}
              placeholder="What makes this game worth building, and what must stay out to protect scope?"
              onChange={(event) => {
                void updateConcept("differentiators", event.target.value);
              }}
            />
          </GameField>
        </div>
      </div>
    </GameSectionLayout>
  );
};
