import { BrandMark } from "@/components/branding/BrandMark";
import { APP_NAME } from "@/lib/brand";

interface OnboardingNameStepProps {
  name: string;
  onChangeName: (value: string) => void;
  onContinue: () => void;
}

export const OnboardingNameStep = ({
  name,
  onChangeName,
  onContinue
}: OnboardingNameStepProps): JSX.Element => {
  return (
    <div className="p-10">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <BrandMark className="h-16 w-16 rounded-2xl" />
        </div>
        <h1 className="font-headline text-4xl font-bold tracking-tight text-on-surface">
          Welcome to {APP_NAME}
        </h1>
        <p className="mt-3 text-on-surface-variant">
          Let’s set up your local-first game design workspace.
        </p>
      </div>

      <div className="mt-10">
        <label className="mb-3 block font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
          What should we call you?
        </label>
        <input
          data-autofocus
          type="text"
          value={name}
          onChange={(event) => onChangeName(event.target.value)}
          placeholder="Your name"
          className="w-full rounded-xl border border-outline-variant/15 bg-surface-container-lowest px-5 py-4 text-on-surface outline-none transition focus:border-primary/40"
        />
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="gradient-cta glow-primary mt-10 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 font-semibold text-on-primary"
      >
        <span>Continue</span>
        <span className="material-symbols-outlined text-base">arrow_forward</span>
      </button>
    </div>
  );
};
