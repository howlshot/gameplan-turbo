import { useState } from "react";

interface OnboardingTutorialStepProps {
  onComplete: () => void;
}

const FEATURES = [
  {
    icon: "theater_comedy",
    title: "Game Concept",
    description: "Capture the title, fantasy, audience, scope, and comparable games."
  },
  {
    icon: "diamond",
    title: "Design Pillars",
    description: "Lock the feel targets, anti-goals, and readability rules."
  },
  {
    icon: "sports_esports",
    title: "Controls & Feel",
    description: "Define controls, camera grammar, responsiveness, and touch constraints."
  },
  {
    icon: "article",
    title: "Prompt Lab",
    description: "Generate pitches, GDDs, system prompts, cut lists, and playtest docs."
  },
  {
    icon: "terminal",
    title: "Build Plan",
    description: "Stage first playable, combat feel, encounters, HUD, and polish."
  },
  {
    icon: "folder",
    title: "Design Vault",
    description: "Store screenshots, moodboards, mechanic notes, mockups, and playtest files."
  }
] as const;

export const OnboardingTutorialStep = ({
  onComplete
}: OnboardingTutorialStepProps): JSX.Element => {
  const [currentFeature, setCurrentFeature] = useState(0);

  const handleNext = () => {
    if (currentFeature < FEATURES.length - 1) {
      setCurrentFeature(currentFeature + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const feature = FEATURES[currentFeature];

  return (
    <div className="p-10">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-on-surface">
          Quick Tour
        </h1>
        <p className="mt-3 text-on-surface-variant">
          Here’s what Preflight Game OS is built to do.
        </p>
      </div>

      {/* Feature Display */}
      <div className="mt-10 rounded-2xl border border-outline-variant/10 bg-surface-container p-8">
        {/* Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <span className="material-symbols-outlined text-4xl">{feature.icon}</span>
        </div>

        {/* Title */}
        <h2 className="mt-6 font-headline text-2xl font-semibold text-on-surface">
          {feature.title}
        </h2>

        {/* Description */}
        <p className="mt-3 text-center text-on-surface-variant">
          {feature.description}
        </p>

        {/* Progress Dots */}
        <div className="mt-8 flex justify-center gap-2">
          {FEATURES.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentFeature(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentFeature
                  ? "w-8 bg-primary"
                  : "w-2 bg-surface-container-high"
              }`}
              aria-label={`Go to feature ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-3">
        <button
          type="button"
          onClick={handleNext}
          className="gradient-cta glow-primary flex items-center justify-center gap-2 rounded-xl px-5 py-4 font-semibold text-on-primary"
        >
          {currentFeature < FEATURES.length - 1 ? (
            <>
              <span>Next Feature</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </>
          ) : (
            <>
              <span>Get Started</span>
              <span className="material-symbols-outlined text-base">check</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleSkip}
          className="flex items-center justify-center gap-2 rounded-xl px-5 py-4 text-sm text-on-surface-variant transition hover:text-on-surface"
        >
          Skip Tour
        </button>
      </div>
    </div>
  );
};
