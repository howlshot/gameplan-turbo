import { memo } from "react";
import { cn } from "@/lib/utils";
import {
  getProjectStatusDotTone,
  getProjectStatusLabel,
  getProjectStatusTone
} from "@/lib/gameProjectUtils";
import type { ProjectStatus } from "@/types";

interface StatusBadgeProps {
  status: ProjectStatus;
}

export const StatusBadge = memo(({ status }: StatusBadgeProps): JSX.Element => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider",
        getProjectStatusTone(status)
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", getProjectStatusDotTone(status))} />
      <span>{getProjectStatusLabel(status)}</span>
    </span>
  );
});

StatusBadge.displayName = "StatusBadge";
