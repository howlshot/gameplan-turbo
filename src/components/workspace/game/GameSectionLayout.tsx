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
    <section className="mx-auto max-w-6xl px-6 py-8">
      <div className="rounded-[28px] border border-outline-variant/10 bg-surface-container p-6 shadow-[0_20px_80px_rgba(0,0,0,0.25)]">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary">
            {eyebrow}
          </p>
          <h1 className="mt-3 font-headline text-4xl font-bold tracking-tight text-on-surface">
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
  description?: string;
  label: string;
}

export const GameField = ({
  children,
  description,
  label
}: GameFieldProps): JSX.Element => {
  return (
    <label className="block">
      <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant">
        {label}
      </span>
      {description ? (
        <span className="mt-2 block text-xs leading-5 text-outline">
          {description}
        </span>
      ) : null}
      <div className="mt-3">{children}</div>
    </label>
  );
};

const inputBase =
  "w-full rounded-2xl border border-outline-variant/15 bg-surface px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary/40 focus:bg-surface-container-lowest";

export const GameTextInput = forwardRef(function GameTextInput(
  {
    className,
    ...props
  }: InputHTMLAttributes<HTMLInputElement>,
  ref: ForwardedRef<HTMLInputElement>
): JSX.Element {
  return <input ref={ref} {...props} className={cn(inputBase, className)} />;
});

export const GameTextarea = forwardRef(function GameTextarea(
  {
    className,
    ...props
  }: TextareaHTMLAttributes<HTMLTextAreaElement>,
  ref: ForwardedRef<HTMLTextAreaElement>
): JSX.Element {
  return (
    <textarea
      ref={ref}
      {...props}
      className={cn(inputBase, "min-h-[140px] resize-y leading-6", className)}
    />
  );
});

export const GameSelect = forwardRef(function GameSelect(
  {
    className,
    children,
    ...props
  }: SelectHTMLAttributes<HTMLSelectElement>,
  ref: ForwardedRef<HTMLSelectElement>
): JSX.Element {
  return (
    <select ref={ref} {...props} className={cn(inputBase, className)}>
      {children}
    </select>
  );
});

interface OptionPill {
  label: string;
  value: string;
}

interface MultiSelectPillsProps {
  onToggle: (value: string) => void;
  options: OptionPill[];
  selectedValues: string[];
}

export const MultiSelectPills = ({
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
              "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition",
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
  title: string;
  tone?: "default" | "warning";
  value: string;
}

interface SingleSelectCardsProps {
  cards: ChoiceCard[];
  onSelect: (value: string) => void;
  selectedValue: string;
}

export const SingleSelectCards = ({
  cards,
  onSelect,
  selectedValue
}: SingleSelectCardsProps): JSX.Element => {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const isSelected = card.value === selectedValue;
        const isWarning = card.tone === "warning";
        return (
          <button
            key={card.value}
            type="button"
            onClick={() => onSelect(card.value)}
            className={cn(
              "rounded-2xl border p-4 text-left transition",
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
                card.eyebrow ? "mt-2" : ""
              )}
            >
              {card.title}
            </p>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">
              {card.description}
            </p>
          </button>
        );
      })}
    </div>
  );
};
