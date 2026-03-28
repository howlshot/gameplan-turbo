export interface PlanningQuestion {
  answer: string;
  id: string;
  question: string;
  rationale: string;
}

export const buildPlanningNotes = (
  questions: PlanningQuestion[]
): string | undefined => {
  const answeredQuestions = questions.filter(
    (question) => question.answer.trim().length > 0
  );

  if (answeredQuestions.length === 0) {
    return undefined;
  }

  return answeredQuestions
    .map(
      (question) =>
        `Question: ${question.question}\nAnswer: ${question.answer.trim()}`
    )
    .join("\n\n");
};

export const parsePlanningQuestions = (content: string): PlanningQuestion[] => {
  try {
    const parsed = JSON.parse(content) as Array<{
      question?: string;
      rationale?: string;
    }>;

    if (Array.isArray(parsed)) {
      return parsed
        .filter((item) => typeof item.question === "string" && item.question.trim().length > 0)
        .slice(0, 5)
        .map((item, index) => ({
          answer: "",
          id: `planning-question-${index + 1}`,
          question: item.question!.trim(),
          rationale: item.rationale?.trim() || "This will sharpen the roadmap and prompt handoff."
        }));
    }
  } catch {
    // Fall through to line-based parsing.
  }

  return content
    .split("\n")
    .map((line) => line.replace(/^[\-\d.\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 5)
    .map((question, index) => ({
      answer: "",
      id: `planning-question-${index + 1}`,
      question,
      rationale: "This will sharpen the roadmap and prompt handoff."
    }));
};
