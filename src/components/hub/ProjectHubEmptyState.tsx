interface ProjectHubEmptyStateProps {
  onCreateProject: () => void;
}

export const ProjectHubEmptyState = ({
  onCreateProject
}: ProjectHubEmptyStateProps): JSX.Element => {
  return (
    <div className="py-16 text-center sm:py-24">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary/40">
        <span className="material-symbols-outlined text-5xl">stadia_controller</span>
      </div>
      <h2 className="mt-6 font-headline text-2xl font-bold text-on-surface sm:text-[28px]">
        No game projects yet.
      </h2>
      <p className="mt-3 text-outline">
        Capture the concept, lock the pillars, and build from a real first-playable plan.
      </p>
      <button
        type="button"
        onClick={onCreateProject}
        className="gradient-cta glow-primary mt-8 rounded-xl px-5 py-3 text-sm font-semibold text-on-primary"
      >
        Create your first game project
      </button>

      <div className="mt-10 grid grid-cols-1 gap-4 md:mt-12 md:grid-cols-3">
        {[
          ["Concept to GDD", "Turn a vague idea into a pitch, mini GDD, or full GDD."],
          ["Stage-by-Stage Build", "Generate a sane order of work for first playable, content slice, and polish."],
          ["Prompt-Ready Outputs", "Export copy-ready prompts for Codex, Cursor, Claude Code, and Qwen Code."]
        ].map(([title, description]) => (
          <div
            key={title}
            className="rounded-2xl border border-outline-variant/10 bg-surface-container p-5 text-left"
          >
            <h3 className="font-headline text-lg font-semibold text-on-surface">
              {title}
            </h3>
            <p className="mt-2 text-sm text-on-surface-variant">{description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
