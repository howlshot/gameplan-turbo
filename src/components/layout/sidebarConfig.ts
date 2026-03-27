import { getProjectStatusTone as getStatusTone } from "@/lib/gameProjectUtils";

export const PROJECT_LINKS = [
  { id: "concept", icon: "theater_comedy", label: "Concept" },
  { id: "design-pillars", icon: "diamond", label: "Design Pillars" },
  { id: "core-loop", icon: "cycle", label: "Core Loop" },
  { id: "controls-feel", icon: "sports_esports", label: "Controls & Feel" },
  { id: "content-bible", icon: "library_books", label: "Content Bible" },
  { id: "art-tone", icon: "palette", label: "Art & Tone" },
  { id: "technical-design", icon: "memory", label: "Technical Design" },
  { id: "build-plan", icon: "terminal", label: "Build Plan" },
  { id: "vault", icon: "inventory_2", label: "Vault" },
  { id: "prompt-lab", icon: "auto_awesome", label: "Prompt Lab" }
] as const;

export type ProjectLinkId = (typeof PROJECT_LINKS)[number]["id"];
export const PROJECT_LINK_IDS = PROJECT_LINKS.map((link) => link.id) as ProjectLinkId[];

export const isProjectLinkId = (value: string | null | undefined): value is ProjectLinkId =>
  typeof value === "string" &&
  PROJECT_LINK_IDS.includes(value as ProjectLinkId);

export const getProjectTabFromSearch = (
  search: string
): ProjectLinkId | null => {
  const tab = new URLSearchParams(search).get("tab");
  return isProjectLinkId(tab) ? tab : null;
};

export const getProjectTabPath = (
  projectId: string,
  tabId: ProjectLinkId
): string => `/project/${projectId}?tab=${tabId}`;

export const getProjectStatusTone = (status: string): string =>
  getStatusTone(status as never);
