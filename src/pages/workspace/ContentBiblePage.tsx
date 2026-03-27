import { useParams } from "react-router-dom";
import {
  GameField,
  GameSectionLayout,
  GameTextarea
} from "@/components/workspace/game/GameSectionLayout";
import { useGameDesignDoc } from "@/hooks/useGameDesignDoc";

const contentFields = [
  ["playerVerbs", "Player Verbs"],
  ["enemies", "Enemies"],
  ["weaponsAbilities", "Weapons / Abilities"],
  ["encounters", "Encounters"],
  ["levelsMissions", "Levels / Missions"],
  ["bossesSpecialEvents", "Bosses / Special Events"],
  ["pickupsRewards", "Pickups / Rewards"],
  ["uiHudElements", "UI / HUD Elements"]
] as const;

export const ContentBiblePage = (): JSX.Element => {
  const { projectId } = useParams();
  const { gameDesignDoc, updateGameDesignDoc } = useGameDesignDoc(projectId);

  if (!gameDesignDoc) {
    return (
      <GameSectionLayout
        title="Content Bible"
        description="Loading content bible workspace."
      >
        <div className="h-64 animate-pulse rounded-3xl bg-surface-container-high" />
      </GameSectionLayout>
    );
  }

  return (
    <GameSectionLayout
      eyebrow="Playable Content"
      title="Content Bible"
      description="Capture the nouns and verbs of the game. This is the reference layer for enemies, encounters, pickups, HUD, and mission structure."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {contentFields.map(([key, label]) => (
          <GameField key={key} label={label}>
            <GameTextarea
              value={gameDesignDoc.contentBible[key]}
              onChange={(event) => {
                void updateGameDesignDoc({
                  contentBible: {
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
