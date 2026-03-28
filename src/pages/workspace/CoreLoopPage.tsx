import { useParams } from "react-router-dom";
import {
  GameField,
  GameSectionLayout,
  GameTextarea
} from "@/components/workspace/game/GameSectionLayout";
import { WorkspacePageNavigation } from "@/components/workspace/WorkspacePageNavigation";
import { useGameDesignDoc } from "@/hooks/useGameDesignDoc";

const loopFields = [
  ["secondToSecond", "Second-to-Second Loop", "What the player is doing moment to moment."],
  ["minuteToMinute", "Minute-to-Minute Loop", "How pressure and recovery work over a short sequence."],
  ["sessionLoop", "Session Loop", "What defines one complete run or play session."],
  ["longTermProgression", "Long-Term Progression", "What keeps the player coming back after the first session."],
  ["failureStates", "Failure States", "How the player loses, stalls, or resets."],
  ["rewardCadence", "Reward Cadence", "How and when the game pays the player back."]
] as const;

export const CoreLoopPage = (): JSX.Element => {
  const { projectId } = useParams();
  const { gameDesignDoc, updateGameDesignDoc } = useGameDesignDoc(projectId);

  if (!gameDesignDoc) {
    return (
      <GameSectionLayout title="Core Loop" description="Loading core loop workspace.">
        <div className="h-64 animate-pulse rounded-3xl bg-surface-container-high" />
      </GameSectionLayout>
    );
  }

  return (
    <GameSectionLayout
      eyebrow="Gameplay Logic"
      title="Core Loop"
      description="Define the loops clearly enough that an AI coding agent can identify what the first playable must contain and what can wait."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {loopFields.map(([key, label, description]) => (
          <GameField key={key} label={label} description={description}>
            <GameTextarea
              value={gameDesignDoc.coreLoop[key]}
              onChange={(event) => {
                void updateGameDesignDoc({
                  coreLoop: {
                    [key]: event.target.value
                  }
                });
              }}
            />
          </GameField>
        ))}
      </div>

      <WorkspacePageNavigation currentTabId="core-loop" />
    </GameSectionLayout>
  );
};
