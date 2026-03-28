import { create } from "zustand";
import type { PlanningQuestion } from "@/lib/planningQuestions";

interface PromptLabSession {
  hasSkippedClarifyingRound: boolean;
  hasSkippedVaultPreflight: boolean;
  planningQuestions: PlanningQuestion[];
  targetPlatform?: string;
}

interface PromptLabSessionStoreState {
  sessions: Record<string, PromptLabSession>;
  setHasSkippedClarifyingRound: (projectId: string, skipped: boolean) => void;
  setHasSkippedVaultPreflight: (projectId: string, skipped: boolean) => void;
  setPlanningQuestions: (
    projectId: string,
    questions: PlanningQuestion[]
  ) => void;
  setTargetPlatform: (projectId: string, targetPlatform: string) => void;
}

const getSession = (
  sessions: Record<string, PromptLabSession>,
  projectId: string
): PromptLabSession => {
  const existing = sessions[projectId];

  return {
    hasSkippedClarifyingRound: existing?.hasSkippedClarifyingRound ?? false,
    hasSkippedVaultPreflight: existing?.hasSkippedVaultPreflight ?? false,
    planningQuestions: existing?.planningQuestions ?? [],
    targetPlatform: existing?.targetPlatform
  };
};

export const usePromptLabSessionStore = create<PromptLabSessionStoreState>(
  (set) => ({
    sessions: {},
    setHasSkippedClarifyingRound: (projectId, skipped) =>
      set((state) => ({
        sessions: {
          ...state.sessions,
          [projectId]: {
            ...getSession(state.sessions, projectId),
            hasSkippedClarifyingRound: skipped
          }
        }
      })),
    setHasSkippedVaultPreflight: (projectId, skipped) =>
      set((state) => ({
        sessions: {
          ...state.sessions,
          [projectId]: {
            ...getSession(state.sessions, projectId),
            hasSkippedVaultPreflight: skipped
          }
        }
      })),
    setPlanningQuestions: (projectId, questions) =>
      set((state) => ({
        sessions: {
          ...state.sessions,
          [projectId]: {
            ...getSession(state.sessions, projectId),
            planningQuestions: questions
          }
        }
      })),
    setTargetPlatform: (projectId, targetPlatform) =>
      set((state) => ({
        sessions: {
          ...state.sessions,
          [projectId]: {
            ...getSession(state.sessions, projectId),
            targetPlatform
          }
        }
      }))
  })
);
