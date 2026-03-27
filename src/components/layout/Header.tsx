import { BrandMark } from "@/components/branding/BrandMark";
import { useProject } from "@/hooks/useProject";
import { APP_NAME } from "@/lib/brand";
import { useProjectStore } from "@/stores/projectStore";

export const Header = (): JSX.Element => {
  const selectedProjectId = useProjectStore((state) => state.selectedProjectId);
  const { project } = useProject(selectedProjectId ?? undefined);

  return (
    <header className="glass-panel sticky top-0 z-40 h-16 border-b border-outline-variant/10 bg-[var(--surface-container-lowest)]/80 px-6 backdrop-blur-2xl">
      <div className="flex h-full items-center justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <BrandMark className="h-10 w-10 rounded-2xl" />
          {project ? (
            <div className="min-w-0">
              <p className="truncate font-headline text-lg font-bold tracking-tight text-on-surface">
                {project.title}
              </p>
              <p className="truncate text-xs uppercase tracking-[0.18em] text-on-surface-variant">
                {APP_NAME}
              </p>
            </div>
          ) : (
            <div>
              <p className="font-headline text-lg font-bold tracking-tight text-on-surface">
                {APP_NAME}
              </p>
              <p className="text-xs uppercase tracking-[0.18em] text-on-surface-variant">
                Local-first game preproduction workspace
              </p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
