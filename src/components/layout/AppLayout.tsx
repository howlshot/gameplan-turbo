import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useMatch } from "react-router-dom";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { getProjectTabFromSearch } from "@/components/layout/sidebarConfig";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { CommandPalette } from "@/components/shared/CommandPalette";
import { useCommandPalette } from "@/hooks/useCommandPalette";
import { useWebSurface } from "@/hooks/useWebSurface";
import { useProjectStore } from "@/stores/projectStore";
import { useUIStore } from "@/stores/uiStore";

export const AppLayout = (): JSX.Element => {
  const location = useLocation();
  const projectMatch = useMatch("/project/:projectId");
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const activeTab = useUIStore((state) => state.activeTab);
  const setActiveTab = useUIStore((state) => state.setActiveTab);
  const selectProject = useProjectStore((state) => state.selectProject);
  const mainRef = useRef<HTMLElement>(null);
  const surface = useWebSurface();
  const isMobileSurface = surface === "mobile-web";
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useCommandPalette();

  // Scroll main content to top on every route change
  useEffect(() => {
    // Force scroll to top immediately
    const timer = setTimeout(() => {
      if (mainRef.current) {
        mainRef.current.scrollTop = 0;
      }
      // Also scroll window as fallback
      window.scrollTo(0, 0);
    }, 0);
    
    return () => clearTimeout(timer);
  }, [location.pathname, location.search, location.state]);

  useEffect(() => {
    const projectId = projectMatch?.params.projectId ?? null;
    selectProject(projectId);
  }, [projectMatch?.params.projectId, selectProject]);

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const urlProjectTab = getProjectTabFromSearch(location.search);

    if (location.pathname === "/" && activeTab !== "projects") {
      setActiveTab("projects");
      return;
    }

    if (location.pathname === "/settings" && activeTab !== "settings") {
      setActiveTab("settings");
      return;
    }

    if (projectMatch) {
      if (urlProjectTab && activeTab !== urlProjectTab) {
        setActiveTab(urlProjectTab);
        return;
      }

      if (!urlProjectTab && activeTab === "projects") {
        setActiveTab("concept");
      }
    }
  }, [activeTab, location.pathname, location.search, projectMatch, setActiveTab]);

  return (
    <div className="relative min-h-screen bg-surface-container-lowest text-on-surface">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-secondary/5 blur-[100px]" />
        <div className="noise-texture absolute inset-0 opacity-70" />
      </div>

      <div className="relative flex">
        {!isMobileSurface ? <Sidebar /> : null}

        <div
          className={`flex min-h-screen flex-1 flex-col transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isMobileSurface ? "" : sidebarCollapsed ? "pl-16" : "pl-60"
          }`}
        >
          <Header
            surface={surface}
            onOpenNavigation={
              isMobileSurface ? () => setIsMobileSidebarOpen(true) : undefined
            }
          />
          <main
            ref={mainRef}
            key={location.pathname}
            className={`relative z-10 flex-1 overflow-y-auto ${
              isMobileSurface ? "px-4 py-4 pb-28" : "px-6 py-8"
            }`}
          >
            <Outlet />
          </main>

          {isMobileSurface ? <MobileBottomNav /> : null}
        </div>

        {isMobileSurface && isMobileSidebarOpen ? (
          <div className="fixed inset-0 z-[90] md:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-surface-dim/80 backdrop-blur-sm"
              aria-label="Close navigation"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="relative h-full">
              <Sidebar
                mode="mobile"
                onNavigateComplete={() => setIsMobileSidebarOpen(false)}
                onRequestClose={() => setIsMobileSidebarOpen(false)}
              />
            </div>
          </div>
        ) : null}

        <CommandPalette />
      </div>
    </div>
  );
};
