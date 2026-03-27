import { afterEach, describe, expect, it } from "vitest";
import {
  APP_CHECKPOINT_STORAGE_KEY,
  LEGACY_CHECKPOINT_STORAGE_KEY
} from "@/lib/brand";
import {
  clearCheckpoint,
  DEFAULT_CHECKPOINT_CONFIG,
  loadCheckpoint,
  saveCheckpoint,
  type GenerationCheckpoint
} from "@/services/ai/checkpoint";

const sampleCheckpoint: GenerationCheckpoint = {
  projectId: "project-1",
  agentType: "design",
  content: "checkpoint content",
  tokenCount: 512,
  timestamp: Date.now(),
  status: "in-progress"
};

describe("checkpoint compatibility", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("saves checkpoints under the Gameplan Turbo storage key", () => {
    saveCheckpoint(sampleCheckpoint);

    expect(localStorage.getItem(DEFAULT_CHECKPOINT_CONFIG.storageKey)).toBe(
      JSON.stringify(sampleCheckpoint)
    );
    expect(DEFAULT_CHECKPOINT_CONFIG.storageKey).toBe(APP_CHECKPOINT_STORAGE_KEY);
  });

  it("loads a legacy checkpoint and mirrors it to the new storage key", () => {
    localStorage.setItem(
      LEGACY_CHECKPOINT_STORAGE_KEY,
      JSON.stringify(sampleCheckpoint)
    );

    expect(loadCheckpoint()).toEqual(sampleCheckpoint);
    expect(localStorage.getItem(APP_CHECKPOINT_STORAGE_KEY)).toBe(
      JSON.stringify(sampleCheckpoint)
    );
  });

  it("clears both current and legacy checkpoint keys", () => {
    localStorage.setItem(APP_CHECKPOINT_STORAGE_KEY, JSON.stringify(sampleCheckpoint));
    localStorage.setItem(
      LEGACY_CHECKPOINT_STORAGE_KEY,
      JSON.stringify(sampleCheckpoint)
    );

    clearCheckpoint();

    expect(localStorage.getItem(APP_CHECKPOINT_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(LEGACY_CHECKPOINT_STORAGE_KEY)).toBeNull();
  });
});
