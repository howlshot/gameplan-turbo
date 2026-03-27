import { APP_ICON_PATH, APP_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
  imageClassName?: string;
}

export const BrandMark = ({
  className,
  imageClassName
}: BrandMarkProps): JSX.Element => {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center overflow-hidden rounded-2xl border border-outline-variant/15 bg-surface-container-highest shadow-[0_10px_30px_rgba(0,0,0,0.18)]",
        className
      )}
    >
      <img
        src={APP_ICON_PATH}
        alt={`${APP_NAME} icon`}
        className={cn("h-full w-full object-cover", imageClassName)}
      />
    </span>
  );
};
