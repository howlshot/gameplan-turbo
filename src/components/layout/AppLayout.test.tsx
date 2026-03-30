import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppLayout } from "@/components/layout/AppLayout";

const mocks = vi.hoisted(() => ({
  webSurface: "desktop-web" as "desktop-web" | "mobile-web",
  sidebarCollapsed: false,
  activeTab: "projects",
  setActiveTab: vi.fn(),
  selectProject: vi.fn()
}));

vi.mock("@/components/layout/Header", () => ({
  Header: ({
    onOpenNavigation
  }: {
    onOpenNavigation?: () => void;
  }) => (
    <div>
      <span>Header</span>
      {onOpenNavigation ? (
        <button type="button" onClick={onOpenNavigation}>
          Open navigation
        </button>
      ) : null}
    </div>
  )
}));

vi.mock("@/components/layout/Sidebar", () => ({
  Sidebar: ({
    mode = "desktop",
    onRequestClose
  }: {
    mode?: "desktop" | "mobile";
    onRequestClose?: () => void;
  }) => (
    <div>
      <span>{mode === "mobile" ? "Mobile Sidebar" : "Desktop Sidebar"}</span>
      {onRequestClose ? (
        <button type="button" onClick={onRequestClose}>
          Close mobile sidebar
        </button>
      ) : null}
    </div>
  )
}));

vi.mock("@/components/layout/MobileBottomNav", () => ({
  MobileBottomNav: () => <div>Mobile Bottom Navigation</div>
}));

vi.mock("@/components/shared/CommandPalette", () => ({
  CommandPalette: () => null
}));

vi.mock("@/hooks/useCommandPalette", () => ({
  useCommandPalette: vi.fn()
}));

vi.mock("@/hooks/useWebSurface", () => ({
  useWebSurface: () => mocks.webSurface
}));

vi.mock("@/stores/projectStore", () => ({
  useProjectStore: (selector: (state: { selectProject: typeof mocks.selectProject }) => unknown) =>
    selector({ selectProject: mocks.selectProject })
}));

vi.mock("@/stores/uiStore", () => ({
  useUIStore: (
    selector: (state: {
      sidebarCollapsed: boolean;
      activeTab: string;
      setActiveTab: typeof mocks.setActiveTab;
    }) => unknown
  ) =>
    selector({
      sidebarCollapsed: mocks.sidebarCollapsed,
      activeTab: mocks.activeTab,
      setActiveTab: mocks.setActiveTab
    })
}));

describe("AppLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.webSurface = "desktop-web";
    mocks.sidebarCollapsed = false;
    mocks.activeTab = "projects";
  });

  const renderLayout = (initialEntry = "/"): void => {
    render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<div>Outlet Content</div>} />
            <Route path="/project/:projectId" element={<div>Project Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
  };

  it("renders the desktop sidebar on the desktop web surface", () => {
    renderLayout("/");

    expect(screen.getByText("Desktop Sidebar")).toBeInTheDocument();
    expect(
      screen.queryByText("Mobile Bottom Navigation")
    ).not.toBeInTheDocument();
  });

  it("uses the mobile shell and drawer navigation on the mobile web surface", () => {
    mocks.webSurface = "mobile-web";

    renderLayout("/");

    expect(screen.queryByText("Desktop Sidebar")).not.toBeInTheDocument();
    expect(screen.getByText("Mobile Bottom Navigation")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Open navigation/i }));

    expect(screen.getByText("Mobile Sidebar")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Close mobile sidebar/i }));

    expect(screen.queryByText("Mobile Sidebar")).not.toBeInTheDocument();
  });
});
