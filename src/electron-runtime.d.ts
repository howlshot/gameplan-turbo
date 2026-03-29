import type { DesktopRuntimeContext } from "@/lib/runtimeMode";

declare global {
  interface Window {
    gameplanTurboDesktop?: DesktopRuntimeContext;
  }
}

export {};
