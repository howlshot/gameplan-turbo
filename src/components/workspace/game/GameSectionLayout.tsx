import type {
  ForwardedRef,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes
} from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface GameSectionLayoutProps {
  children: ReactNode;
  description: string;
  eyebrow?: string;
  title: string;
}

export const GameSectionLayout = ({
  children,
  description,
  eyebrow = "Game Design",
  title
}: GameSectionLayoutProps): JSX.Element => {
  return (
    <section className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-8">
      <div className="rounded-[24px] border border-outline-variant/10 bg-surface-container p-4 shadow-[0_20px_80px_rgba(0,0,0,0.25)] sm:rounded-[28px] sm:p-6">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary">
            {eyebrow}
          </p>
          <h1 className="mt-3 font-headline text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-on-surface-variant">
            {description}
          </p>
        </div>
        <div className="mt-8 space-y-6">{children}</div>
      </div>
    </section>
  );
};

interface GameFieldProps {
  children?: React.ReactNode;
  density?: "default" | "compact";
  description?: string;
  label: string;
}

export const GameField = ({
  children,
  density = "default",
  description,
  label
}: GameFieldProps): JSX.Element => {
  return (
    <label className="block">
      <span
        className={cn(
          "block font-semibold uppercase text-on-surface-variant",
          density === "compact"
            ? "text-[10px] tracking-[0.2em]"
            : "text-[11px] tracking-[0.22em]"
        )}
      >
        {label}
      </span>
      {description ? (
        <span
          className={cn(
            "block text-outline",
            density === "compact"
              ? "mt-1.5 text-[11px] leading-4"
              : "mt-2 text-xs leading-5"
          )}
        >
          {description}
        </span>
      ) : null}
      <div className={cn(density === "compact" ? "mt-2" : "mt-3")}>
        {children}
      </div>
    </label>
  );
};

type FieldDensity = "default" | "compact";

const inputBase =
  "w-full rounded-2xl border border-outline-variant/15 bg-surface text-on-surface outline-none transition focus:border-primary/40 focus:bg-surface-container-lowest";

const getInputDensityClasses = (density: FieldDensity): string =>
  density === "compact" ? "px-3.5 py-2.5 text-sm" : "px-4 py-3 text-sm";

interface DenseInputProps {
  density?: FieldDensity;
}

export const GameTextInput = forwardRef(function GameTextInput(
  {
    className,
    density = "default",
    ...props
  }: InputHTMLAttributes<HTMLInputElement> & DenseInputProps,
  ref: ForwardedRef<HTMLInputElement>
): JSX.Element {
  return (
    <input
      ref={ref}
      {...props}
      className={cn(inputBase, getInputDensityClasses(density), className)}
    />
  );
});

export const GameTextarea = forwardRef(function GameTextarea(
  {
    className,
    density = "default",
    ...props
  }: TextareaHTMLAttributes<HTMLTextAreaElement> & DenseInputProps,
  ref: ForwardedRef<HTMLTextAreaElement>
): JSX.Element {
  return (
    <textarea
      ref={ref}
      {...props}
      className={cn(
        inputBase,
        getInputDensityClasses(density),
        density === "compact" ? "min-h-[112px] resize-y leading-5" : "min-h-[140px] resize-y leading-6",
        className
      )}
    />
  );
});

export const GameSelect = forwardRef(function GameSelect(
  {
    className,
    children,
    density = "default",
    ...props
  }: SelectHTMLAttributes<HTMLSelectElement> & DenseInputProps,
  ref: ForwardedRef<HTMLSelectElement>
): JSX.Element {
  return (
    <select
      ref={ref}
      {...props}
      className={cn(inputBase, getInputDensityClasses(density), className)}
    >
      {children}
    </select>
  );
});

interface OptionPill {
  label: string;
  value: string;
}

interface MultiSelectPillsProps {
  density?: FieldDensity;
  onToggle: (value: string) => void;
  options: OptionPill[];
  selectedValues: string[];
}

export const MultiSelectPills = ({
  density = "default",
  onToggle,
  options,
  selectedValues
}: MultiSelectPillsProps): JSX.Element => {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selectedValues.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onToggle(option.value)}
            className={cn(
              "rounded-full border font-semibold uppercase transition",
              density === "compact"
                ? "px-3 py-1.5 text-[10px] tracking-[0.16em]"
                : "px-4 py-2 text-xs tracking-[0.18em]",
              isSelected
                ? "border-primary/40 bg-primary/15 text-primary"
                : "border-outline-variant/15 bg-surface text-on-surface-variant hover:border-primary/20 hover:text-on-surface"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

interface ChoiceCard {
  description: string;
  eyebrow?: string;
  meta?: string[];
  title: string;
  tone?: "default" | "warning";
  value: string;
}

interface SingleSelectCardsProps {
  cards: ChoiceCard[];
  layoutVariant?:
    | "default"
    | "modal-compact"
    | "mobile-compact"
    | "starter-mode";
  onSelect: (value: string) => void;
  selectedValue: string;
}

export const SingleSelectCards = ({
  cards,
  layoutVariant = "default",
  onSelect,
  selectedValue
}: SingleSelectCardsProps): JSX.Element => {
  return (
    <div
      data-layout-variant={layoutVariant}
      className={cn(
        "grid gap-3",
        layoutVariant === "modal-compact"
          ? "grid-cols-1 md:grid-cols-2"
          : layoutVariant === "mobile-compact"
            ? "grid-cols-1"
          : layoutVariant === "starter-mode"
            ? "grid-cols-1 md:grid-cols-2"
          : "md:grid-cols-2 xl:grid-cols-4"
      )}
    >
      {cards.map((card) => {
        const isSelected = card.value === selectedValue;
        const isWarning = card.tone === "warning";
        return (
          <button
            key={card.value}
            type="button"
            onClick={() => onSelect(card.value)}
            className={cn(
              "flex flex-col justify-start rounded-2xl border text-left transition",
              layoutVariant === "mobile-compact"
                ? "min-h-0 gap-1 px-4 py-3.5"
                : "min-h-[168px] p-4",
              isSelected
                ? isWarning
                  ? "border-amber-400/40 bg-amber-500/10 shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
                  : "border-primary/40 bg-primary/10 shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
                : isWarning
                  ? "border-amber-300/15 bg-surface hover:border-amber-300/35 hover:bg-surface-container-lowest"
                  : "border-outline-variant/10 bg-surface hover:border-primary/20 hover:bg-surface-container-lowest"
            )}
          >
            {card.eyebrow ? (
              <p
                className={cn(
                  "font-mono text-[10px] uppercase tracking-[0.18em]",
                  isWarning ? "text-amber-200" : "text-primary"
                )}
              >
                {card.eyebrow}
              </p>
            ) : null}
            <p
              className={cn(
                "font-headline text-base font-semibold",
                isWarning && isSelected ? "text-amber-50" : "text-on-surface",
                card.eyebrow
                  ? layoutVariant === "mobile-compact"
                    ? "mt-1"
                    : "mt-2"
                  : ""
              )}
            >
              {card.title}
            </p>
            <p
              className={cn(
                "text-on-surface-variant",
                layoutVariant === "mobile-compact"
                  ? "mt-1 text-xs leading-5"
                  : "mt-2 text-sm leading-6"
              )}
            >
              {card.description}
            </p>
            {card.meta && card.meta.length > 0 ? (
              <div
                className={cn(
                  "flex flex-wrap gap-2",
                  layoutVariant === "mobile-compact" ? "mt-3" : "mt-4"
                )}
              >
                {card.meta.map((meta) => (
                  <span
                    key={`${card.value}-${meta}`}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                      isSelected
                        ? isWarning
                          ? "border-amber-300/30 bg-amber-400/10 text-amber-50"
                          : "border-primary/30 bg-primary/10 text-primary"
                        : "border-outline-variant/10 bg-surface-container-low text-on-surface-variant"
                    )}
                  >
                    {meta}
                  </span>
                ))}
              </div>
            ) : null}
          </button>
        );
      })}
    </div>
  );
};
