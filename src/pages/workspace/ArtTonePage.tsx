import { useParams } from "react-router-dom";
import {
  GameField,
  GameSectionLayout,
  GameTextarea
} from "@/components/workspace/game/GameSectionLayout";
import { WorkspacePageNavigation } from "@/components/workspace/WorkspacePageNavigation";
import { useGameDesignDoc } from "@/hooks/useGameDesignDoc";
import { splitLineSeparated, toLineSeparated } from "@/lib/gameProjectUtils";

export const ArtTonePage = (): JSX.Element => {
  const { projectId } = useParams();
  const { gameDesignDoc, updateGameDesignDoc } = useGameDesignDoc(projectId);

  if (!gameDesignDoc) {
    return (
      <GameSectionLayout title="Art & Tone" description="Loading art and tone workspace.">
        <div className="h-64 animate-pulse rounded-3xl bg-surface-container-high" />
      </GameSectionLayout>
    );
  }

  const section = gameDesignDoc.artTone;

  return (
    <GameSectionLayout
      eyebrow="Creative Direction"
      title="Art & Tone"
      description="Define the look, mood, animation language, and audio direction before production improvisation turns into inconsistency."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <GameField label="Art Direction">
          <GameTextarea
            value={section.artDirection}
            onChange={(event) => {
              void updateGameDesignDoc({
                artTone: {
                  artDirection: event.target.value
                }
              });
            }}
          />
        </GameField>

        <GameField label="Animation Style">
          <GameTextarea
            value={section.animationStyle}
            onChange={(event) => {
              void updateGameDesignDoc({
                artTone: {
                  animationStyle: event.target.value
                }
              });
            }}
          />
        </GameField>

        <GameField label="Tone Keywords" description="One keyword per line.">
          <GameTextarea
            value={toLineSeparated(section.toneKeywords)}
            onChange={(event) => {
              void updateGameDesignDoc({
                artTone: {
                  toneKeywords: splitLineSeparated(event.target.value)
                }
              });
            }}
          />
        </GameField>

        <GameField label="Visual References" description="One reference per line.">
          <GameTextarea
            value={toLineSeparated(section.visualReferences)}
            onChange={(event) => {
              void updateGameDesignDoc({
                artTone: {
                  visualReferences: splitLineSeparated(event.target.value)
                }
              });
            }}
          />
        </GameField>

        <GameField label="Negative References" description="One anti-reference per line.">
          <GameTextarea
            value={toLineSeparated(section.negativeReferences)}
            onChange={(event) => {
              void updateGameDesignDoc({
                artTone: {
                  negativeReferences: splitLineSeparated(event.target.value)
                }
              });
            }}
          />
        </GameField>

        <div className="space-y-6">
          <GameField label="VFX Direction">
            <GameTextarea
              value={section.vfxDirection}
              onChange={(event) => {
                void updateGameDesignDoc({
                  artTone: {
                    vfxDirection: event.target.value
                  }
                });
              }}
            />
          </GameField>

          <GameField label="Audio / Music Direction">
            <GameTextarea
              value={section.audioMusicDirection}
              onChange={(event) => {
                void updateGameDesignDoc({
                  artTone: {
                    audioMusicDirection: event.target.value
                  }
                });
              }}
            />
          </GameField>
        </div>
      </div>

      <WorkspacePageNavigation currentTabId="art-tone" />
    </GameSectionLayout>
  );
};
