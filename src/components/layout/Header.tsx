import { BrandMark } from "@/components/branding/BrandMark";
import { useProject } from "@/hooks/useProject";
import type { WebSurface } from "@/hooks/useWebSurface";
import { APP_NAME, APP_WORKSPACE_STRAPLINE } from "@/lib/brand";
import { useProjectStore } from "@/stores/projectStore";

interface HeaderProps {
  onOpenNavigation?: () => void;
  surface?: WebSurface;
}

export const Header = ({
  onOpenNavigation,
  surface = "desktop-web"
}: HeaderProps): JSX.Element => {
  const selectedProjectId = useProjectStore((state) => state.selectedProjectId);
  const { project } = useProject(selectedProjectId ?? undefined);
  const isMobileSurface = surface === "mobile-web";

  return (
    <header
      className={`glass-panel sticky top-0 z-40 border-b border-outline-variant/10 bg-[var(--surface-container-lowest)]/80 backdrop-blur-2xl ${
        isMobileSurface ? "h-16 px-4" : "h-14 px-6"
      }`}
    >
      <div className="flex h-full items-center justify-between">
        <div className="flex min-w-0 items-center gap-3">
          {isMobileSurface ? (
            <button
              type="button"
              onClick={onOpenNavigation}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-outline-variant/10 bg-surface-container text-on-surface transition hover:bg-surface-container-high"
              aria-label="Open navigation"
            >
              <span className="material-symbols-outlined text-[20px]">menu</span>
            </button>
          ) : null}
          <BrandMark className="h-8 w-8 rounded-xl" />
          {project ? (
            <div className="flex min-w-0 items-center gap-3">
              <p
                className={`truncate font-headline font-bold tracking-tight text-on-surface ${
                  isMobileSurface ? "text-base" : "text-lg"
                }`}
              >
                {project.title}
              </p>
              <p className="hidden truncate text-[10px] uppercase tracking-[0.22em] text-on-surface-variant md:block">
                {APP_WORKSPACE_STRAPLINE}
              </p>
            </div>
          ) : (
            <div className="flex min-w-0 items-center gap-3">
              <p
                className={`truncate font-headline font-bold tracking-tight text-on-surface ${
                  isMobileSurface ? "text-base" : "text-lg"
                }`}
              >
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
