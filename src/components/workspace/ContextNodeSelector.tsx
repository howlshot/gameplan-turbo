import { useEffect } from "react";
import { useArtifacts } from "@/hooks/useArtifacts";
import { useBuildStages } from "@/hooks/useBuildStages";
import { useGameDesignDoc } from "@/hooks/useGameDesignDoc";
import { useVaultFiles } from "@/hooks/useVaultFiles";
import { cn } from "@/lib/utils";

interface ContextNodeSelectorProps {
  isOpen: boolean;
  onChangeNodes: (nodes: string[]) => void;
  projectId: string;
  selectedNodes: string[];
}

interface ContextNodeRow {
  id: string;
  icon: string;
  label: string;
  available: boolean;
}

export const ContextNodeSelector = ({
  isOpen,
  onChangeNodes,
  projectId,
  selectedNodes
}: ContextNodeSelectorProps): JSX.Element => {
  const { gameDesignDoc } = useGameDesignDoc(projectId);
  const { artifacts } = useArtifacts(projectId);
  const { stages } = useBuildStages(projectId);
  const { files, setAllFilesAsContext } = useVaultFiles(projectId);

  const hasConceptContent = Boolean(
    gameDesignDoc?.concept.gameTitle ||
      gameDesignDoc?.concept.oneLinePitch ||
      gameDesignDoc?.concept.playerFantasy ||
      gameDesignDoc?.designPillars.pillars.length ||
      gameDesignDoc?.coreLoop.secondToSecond
  );

  const activeContextFiles = files.filter((file) => file.isActiveContext);
  const artifactTypes = new Set(artifacts.map((artifact) => artifact.type));

  useEffect(() => {
    if (isOpen && activeContextFiles.length > 0 && selectedNodes.length === 0) {
      onChangeNodes(activeContextFiles.map((file) => `vault:${file.id}`));
    }
  }, [activeContextFiles, isOpen, onChangeNodes, selectedNodes.length]);

  useEffect(() => {
    if (isOpen && files.length > 0 && activeContextFiles.length === 0) {
      void setAllFilesAsContext();
    }
  }, [activeContextFiles.length, files.length, isOpen, setAllFilesAsContext]);

  const rows: ContextNodeRow[] = [
    { id: "concept", icon: "theater_comedy", label: "Concept", available: hasConceptContent },
    {
      id: "design-pillars",
      icon: "diamond",
      label: "Design Pillars",
      available: Boolean(gameDesignDoc?.designPillars.pillars.length)
    },
    {
      id: "core-loop",
      icon: "cycle",
      label: "Core Loop",
      available: Boolean(gameDesignDoc?.coreLoop.secondToSecond)
    },
    {
      id: "build-roadmap",
      icon: "terminal",
      label: "Build Roadmap",
      available: stages.length > 0
    },
    {
      id: "full-gdd",
      icon: "article",
      label: "Full GDD",
      available: artifactTypes.has("full_gdd")
    }
  ];

  const toggleNode = (nodeId: string): void => {
    onChangeNodes(
      selectedNodes.includes(nodeId)
        ? selectedNodes.filter((value) => value !== nodeId)
        : [...selectedNodes, nodeId]
    );
  };

  return (
    <aside
      className={cn(
        "glass-panel absolute right-0 top-0 z-20 h-full w-72 border-l border-outline-variant/15 bg-surface-container shadow-2xl transition-transform duration-200",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="border-b border-outline-variant/10 px-5 py-4">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary">
          Context Nodes
        </p>
        <h2 className="mt-2 font-headline text-xl font-semibold text-on-surface">
          Inject design context
        </h2>
      </div>

      <div className="space-y-6 px-5 py-5">
        <div className="space-y-3">
          {rows.map((row) => (
            <label
              key={row.id}
              className={cn(
                "flex items-center justify-between rounded-xl border px-3 py-3",
                row.available
                  ? "border-outline-variant/10 bg-surface"
                  : "border-outline-variant/10 bg-surface/60 opacity-60"
              )}
            >
              <span className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedNodes.includes(row.id)}
                  disabled={!row.available}
                  onChange={() => toggleNode(row.id)}
                  className="h-4 w-4 rounded border-outline-variant/20 bg-surface"
                />
                <span className="material-symbols-outlined text-base text-on-surface-variant">
                  {row.icon}
                </span>
                <span className="text-sm text-on-surface">{row.label}</span>
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.2em]",
                  row.available
                    ? "bg-secondary/10 text-secondary"
                    : "bg-surface-container-high text-outline"
                )}
              >
                {row.available ? "Available" : "Missing"}
              </span>
            </label>
          ))}
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">
            Active Vault Files
          </p>
          <div className="mt-3 space-y-2">
            {activeContextFiles.length > 0 ? (
              activeContextFiles.map((file) => {
                const nodeId = `vault:${file.id}`;

                return (
                  <label
                    key={file.id}
                    className="flex items-center gap-3 rounded-xl border border-outline-variant/10 bg-surface px-3 py-3"
                  >
                    <input
                      type="checkbox"
                      checked={selectedNodes.includes(nodeId)}
                      onChange={() => toggleNode(nodeId)}
                      className="h-4 w-4 rounded border-outline-variant/20 bg-surface"
                    />
                    <span className="material-symbols-outlined text-base text-on-surface-variant">
                      inventory_2
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm text-on-surface">{file.name}</p>
                      <p className="text-xs text-outline">{file.category}</p>
                    </div>
                  </label>
                );
              })
            ) : (
              <div className="rounded-xl border border-outline-variant/10 bg-surface px-3 py-4 text-sm text-outline">
                No active vault files yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
