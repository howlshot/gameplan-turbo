import { useLocation, useNavigate } from "react-router-dom";
import { getProjectTabFromSearch, getProjectTabPath } from "@/components/layout/sidebarConfig";
import { cn } from "@/lib/utils";
import { useProjectStore } from "@/stores/projectStore";

const MOBILE_NAV_ITEMS = [
  { id: "home", icon: "home", label: "Home" },
  { id: "roadmap", icon: "timeline", label: "Roadmap" },
  { id: "outputs", icon: "folder_zip", label: "Outputs" },
  { id: "settings", icon: "settings", label: "Settings" }
] as const;

type MobileNavItemId = (typeof MOBILE_NAV_ITEMS)[number]["id"];

export const MobileBottomNav = (): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedProjectId = useProjectStore((state) => state.selectedProjectId);
  const activeProjectTab = getProjectTabFromSearch(location.search);

  const resolvePath = (itemId: MobileNavItemId): string => {
    switch (itemId) {
      case "settings":
        return "/settings";
      case "roadmap":
        return selectedProjectId
          ? getProjectTabPath(selectedProjectId, "prompt-lab")
          : "/";
      case "outputs":
        return selectedProjectId
          ? getProjectTabPath(selectedProjectId, "output-library")
          : "/";
      case "home":
      default:
        return "/";
    }
  };

  const getIsActive = (itemId: MobileNavItemId): boolean => {
    if (itemId === "settings") {
      return location.pathname === "/settings";
    }

    if (itemId === "home") {
      return location.pathname === "/";
    }

    if (!location.pathname.startsWith("/project/")) {
      return false;
    }

    if (itemId === "roadmap") {
      return activeProjectTab === "prompt-lab" || activeProjectTab === "visual-roadmap";
    }

    if (itemId === "outputs") {
      return activeProjectTab === "output-library";
    }

    return false;
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-outline-variant/10 bg-[var(--surface-container-lowest)]/95 px-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] pt-2 backdrop-blur-2xl md:hidden">
      <div className="grid grid-cols-4 gap-1">
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive = getIsActive(item.id);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(resolvePath(item.id))}
              className={cn(
                "flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition",
                isActive
                  ? "bg-primary/12 text-primary"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              )}
            >
              <span className="material-symbols-outlined text-[22px]">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
