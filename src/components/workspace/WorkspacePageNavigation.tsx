import { useNavigate, useParams } from "react-router-dom";
import {
  getProjectTabPath,
  PROJECT_LINKS,
  type ProjectLinkId
} from "@/components/layout/sidebarConfig";
import { useWebSurface } from "@/hooks/useWebSurface";
import { useUIStore } from "@/stores/uiStore";

interface WorkspacePageNavigationProps {
  currentTabId: ProjectLinkId;
}

export const WorkspacePageNavigation = ({
  currentTabId
}: WorkspacePageNavigationProps): JSX.Element | null => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const setActiveTab = useUIStore((state) => state.setActiveTab);
  const surface = useWebSurface();

  const currentIndex = PROJECT_LINKS.findIndex((link) => link.id === currentTabId);
  const previousLink =
    currentIndex > 0 ? PROJECT_LINKS[currentIndex - 1] : null;
  const nextLink =
    currentIndex >= 0 && currentIndex < PROJECT_LINKS.length - 1
      ? PROJECT_LINKS[currentIndex + 1]
      : null;

  if (!projectId || (currentIndex < 0 || (!previousLink && !nextLink))) {
    return null;
  }

  const navigateToLink = (linkId: ProjectLinkId): void => {
    setActiveTab(linkId);
    navigate(getProjectTabPath(projectId, linkId));
  };

  return (
    <div className="mt-8 flex flex-col gap-4 rounded-3xl border border-outline-variant/10 bg-surface px-5 py-5 shadow-[0_16px_48px_rgba(0,0,0,0.18)] sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
          Saved automatically
        </p>
        <p className="mt-2 text-sm leading-6 text-on-surface-variant">
          Continue when you are ready.{" "}
          {surface === "mobile-web"
            ? "Use the project section picker or bottom navigation to jump around."
            : "You can still jump anywhere from the sidebar."}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {previousLink ? (
          <button
            type="button"
            onClick={() => navigateToLink(previousLink.id)}
            className="inline-flex items-center justify-center rounded-2xl border border-outline-variant/15 bg-surface-container px-5 py-3 text-sm font-semibold text-on-surface transition hover:bg-surface-container-high"
          >
            Back to {previousLink.label}
          </button>
        ) : null}

        {nextLink ? (
          <button
            type="button"
            onClick={() => navigateToLink(nextLink.id)}
            className="gradient-cta glow-primary inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-on-primary"
          >
            Continue to {nextLink.label}
          </button>
        ) : null}
      </div>
    </div>
  );
};
