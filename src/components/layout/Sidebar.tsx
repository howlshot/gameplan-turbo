import { Link, useLocation, useNavigate } from "react-router-dom";
import { BrandMark } from "@/components/branding/BrandMark";
import { useProject } from "@/hooks/useProject";
import {
  getProjectStatusTone,
  getProjectTabPath,
  PROJECT_LINKS,
  type ProjectLinkId
} from "@/components/layout/sidebarConfig";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { useProjectStore } from "@/stores/projectStore";
import { useUIStore } from "@/stores/uiStore";

interface SidebarProps {
  mode?: "desktop" | "mobile";
  onNavigateComplete?: () => void;
  onRequestClose?: () => void;
}

export const Sidebar = ({
  mode = "desktop",
  onNavigateComplete,
  onRequestClose
}: SidebarProps): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const activeTab = useUIStore((state) => state.activeTab);
  const setSidebarCollapsed = useUIStore((state) => state.setSidebarCollapsed);
  const setActiveTab = useUIStore((state) => state.setActiveTab);
  const selectedProjectId = useProjectStore((state) => state.selectedProjectId);
  const { project } = useProject(selectedProjectId ?? undefined);
  const isMobile = mode === "mobile";
  const isCollapsed = isMobile ? false : sidebarCollapsed;

  const isProjectsView = location.pathname === "/";
  const isSettingsView = location.pathname === "/settings";

  const navigateToProjects = (): void => {
    setActiveTab("projects");
    navigate("/");
    onNavigateComplete?.();
  };

  const navigateToProjectTab = (tabId: ProjectLinkId): void => {
    if (!selectedProjectId) {
      return;
    }

    setActiveTab(tabId);
    navigate(getProjectTabPath(selectedProjectId, tabId));
    onNavigateComplete?.();
  };

  return (
    <aside
      className={cn(
        isMobile
          ? "flex h-full w-[min(22rem,calc(100vw-1rem))] flex-col bg-[var(--surface-container-lowest)] px-2 py-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
          : "fixed inset-y-0 left-0 z-50 flex min-h-screen flex-col bg-[var(--surface-container-lowest)] px-2 py-4 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        isCollapsed ? "w-16" : "w-60"
      )}
    >
      {!isCollapsed ? (
        <div className="mb-4 flex items-center gap-3 px-4">
          <BrandMark className="h-11 w-11 rounded-2xl" />
          <div className="min-w-0">
            <p className="truncate font-headline text-lg font-bold tracking-tight text-on-surface">
              {APP_NAME}
            </p>
            <p className="text-[11px] uppercase tracking-[0.22em] text-on-surface-variant">
              {APP_TAGLINE}
            </p>
          </div>
          {isMobile ? (
            <button
              type="button"
              onClick={onRequestClose}
              className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-outline-variant/10 bg-surface-container text-on-surface transition hover:bg-surface-container-high"
              aria-label="Close navigation"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          ) : null}
        </div>
      ) : null}

      {/* Project Info Card - Only when expanded */}
      {!isCollapsed && project && (
        <div className="mb-6 overflow-hidden rounded-xl bg-surface px-3 py-3 mx-2">
          <p className="truncate font-headline text-sm font-semibold text-on-surface">
            {project.title}
          </p>
          <span
            className={cn(
              "mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]",
              getProjectStatusTone(project.status)
            )}
          >
            {project.status}
          </span>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-2">
        <nav className="space-y-1">
          <button
            type="button"
            onClick={navigateToProjects}
            className={cn(
              "relative flex w-full items-center justify-start gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition",
              isProjectsView
                ? "text-primary"
                : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            <span className={cn("material-symbols-outlined text-lg", isProjectsView && "fill-1")}>apps</span>
            {!isCollapsed ? <span className="truncate">Game Hub</span> : null}
          </button>

          {selectedProjectId
            ? PROJECT_LINKS.map((link) => {
                const isActive =
                  location.pathname.startsWith("/project/") && activeTab === link.id;

                return (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => navigateToProjectTab(link.id)}
                    className={cn(
                      "relative flex w-full items-center justify-start gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition",
                      isActive
                        ? "text-primary"
                        : "text-on-surface-variant hover:text-on-surface"
                    )}
                  >
                    <span className={cn("material-symbols-outlined text-lg", isActive && "fill-1")}>
                      {link.icon}
                    </span>
                    {!isCollapsed ? <span className="truncate">{link.label}</span> : null}
                  </button>
                );
              })
            : null}
        </nav>
      </div>

      {/* Bottom Section - Settings + Toggle */}
      <div className="mt-6 border-t border-surface-container px-2 pt-4 space-y-2">
        <Link
          to="/settings"
          onClick={() => {
            setActiveTab("settings");
            onNavigateComplete?.();
          }}
          className={cn(
            "relative flex w-full items-center justify-start gap-3 rounded-xl px-3 py-2.5 text-sm transition",
            isSettingsView
              ? "text-primary"
              : "text-on-surface-variant hover:text-on-surface"
          )}
        >
          <span className={cn("material-symbols-outlined text-lg", isSettingsView && "fill-1")}>settings</span>
          {!isCollapsed ? <span className="truncate">Settings</span> : null}
        </Link>

        {!isMobile ? (
          <div className="py-2">
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!isCollapsed)}
              className={cn(
                "flex h-10 w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm transition-all duration-300",
                isCollapsed
                  ? "bg-primary text-on-primary shadow-glow-primary"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              )}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <span className="material-symbols-outlined text-lg">
                {isCollapsed ? "chevron_right" : "chevron_left"}
              </span>
              {!isCollapsed ? <span className="truncate">Collapse</span> : null}
            </button>
          </div>
        ) : null}
      </div>
    </aside>
  );
};
