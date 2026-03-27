import { useParams } from "react-router-dom";
import {
  GameField,
  GameSectionLayout,
  GameTextarea
} from "@/components/workspace/game/GameSectionLayout";
import { useGameDesignDoc } from "@/hooks/useGameDesignDoc";
import { splitLineSeparated, toLineSeparated } from "@/lib/gameProjectUtils";

export const DesignPillarsPage = (): JSX.Element => {
  const { projectId } = useParams();
  const { gameDesignDoc, updateGameDesignDoc } = useGameDesignDoc(projectId);

  if (!gameDesignDoc) {
    return (
      <GameSectionLayout
        title="Design Pillars"
        description="Loading your design pillar workspace."
      >
        <div className="h-64 animate-pulse rounded-3xl bg-surface-container-high" />
      </GameSectionLayout>
    );
  }

  const section = gameDesignDoc.designPillars;

  return (
    <GameSectionLayout
      eyebrow="Design Doctrine"
      title="Design Pillars"
      description="Write the non-negotiables here. These become the rules every generated prompt has to protect."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <GameField
          label="Non-Negotiable Pillars"
          description="One idea per line. Aim for three to five pillars."
        >
          <GameTextarea
            value={toLineSeparated(section.pillars)}
            placeholder={"Readable threat silhouettes\nFast, satisfying hit feedback\nShort-session replayability"}
            onChange={(event) => {
              void updateGameDesignDoc({
                designPillars: {
                  pillars: splitLineSeparated(event.target.value)
                }
              });
            }}
          />
        </GameField>

        <GameField label="What The Game Must Feel Like">
          <GameTextarea
            value={section.feelStatement}
            placeholder="Describe the sensory and emotional truth the player should feel during play."
            onChange={(event) => {
              void updateGameDesignDoc({
                designPillars: {
                  feelStatement: event.target.value
                }
              });
            }}
          />
        </GameField>

        <GameField label="What The Game Must Never Become" description="One anti-goal per line.">
          <GameTextarea
            value={toLineSeparated(section.antiGoals)}
            placeholder={"Bloated with upgrade trees\nMuddy visual communication\nLong dead-air traversal"}
            onChange={(event) => {
              void updateGameDesignDoc({
                designPillars: {
                  antiGoals: splitLineSeparated(event.target.value)
                }
              });
            }}
          />
        </GameField>

        <GameField label="Primary Emotional Targets" description="One emotional target per line.">
          <GameTextarea
            value={toLineSeparated(section.emotionalTargets)}
            placeholder={"Urgency\nPrecision\nConfidence"}
            onChange={(event) => {
              void updateGameDesignDoc({
                designPillars: {
                  emotionalTargets: splitLineSeparated(event.target.value)
                }
              });
            }}
          />
        </GameField>
      </div>

      <GameField label="Readability Principles">
        <GameTextarea
          className="min-h-[220px]"
          value={section.readabilityPrinciples}
          placeholder="State the visual, animation, UI, and VFX rules that keep the game legible."
          onChange={(event) => {
            void updateGameDesignDoc({
              designPillars: {
                readabilityPrinciples: event.target.value
              }
            });
          }}
        />
      </GameField>
    </GameSectionLayout>
  );
};
