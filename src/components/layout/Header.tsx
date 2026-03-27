import { BrandMark } from "@/components/branding/BrandMark";
import { useProject } from "@/hooks/useProject";
import { APP_NAME, APP_WORKSPACE_STRAPLINE } from "@/lib/brand";
import { useProjectStore } from "@/stores/projectStore";

export const Header = (): JSX.Element => {
  const selectedProjectId = useProjectStore((state) => state.selectedProjectId);
  const { project } = useProject(selectedProjectId ?? undefined);

  return (
    <header className="glass-panel sticky top-0 z-40 h-14 border-b border-outline-variant/10 bg-[var(--surface-container-lowest)]/80 px-6 backdrop-blur-2xl">
      <div className="flex h-full items-center justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <BrandMark className="h-8 w-8 rounded-xl" />
          {project ? (
            <div className="flex min-w-0 items-center gap-3">
              <p className="truncate font-headline text-lg font-bold tracking-tight text-on-surface">
                {project.title}
              </p>
              <p className="hidden truncate text-[10px] uppercase tracking-[0.22em] text-on-surface-variant md:block">
                {APP_WORKSPACE_STRAPLINE}
              </p>
            </div>
          ) : (
            <div className="flex min-w-0 items-center gap-3">
              <p className="truncate font-headline text-lg font-bold tracking-tight text-on-surface">
                {APP_NAME}
              </p>
              <p className="hidden truncate text-[10px] uppercase tracking-[0.22em] text-on-surface-variant md:block">
                {APP_WORKSPACE_STRAPLINE}
              </p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
