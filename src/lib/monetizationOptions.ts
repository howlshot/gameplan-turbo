export interface MonetizationOption {
  description: string;
  label: string;
  value: string;
}

export const CUSTOM_MONETIZATION_VALUE = "__custom__";

export const MONETIZATION_OPTIONS: MonetizationOption[] = [
  {
    label: "Undecided / still exploring",
    value: "",
    description:
      "Leave this open if the business model is still undecided. You can keep design work moving and lock monetization later."
  },
  {
    label: "Premium",
    value: "Premium",
    description:
      "One upfront purchase. Best when the game is sold as a complete product with no ongoing monetization pressure."
  },
  {
    label: "Premium + DLC / expansion",
    value: "Premium + DLC / expansion",
    description:
      "Sell the base game up front, then add optional paid content later if the core game earns more depth."
  },
  {
    label: "Free-to-play + cosmetics",
    value: "Free-to-play + cosmetics",
    description:
      "Free entry with optional cosmetic or convenience spending. Works best when the core loop supports retention without pay pressure."
  },
  {
    label: "Free with ads",
    value: "Free with ads",
    description:
      "Ad-supported play, usually for short-session mobile loops. Only a fit if interruptions will not poison the feel."
  },
  {
    label: "Free demo + full unlock",
    value: "Free demo + full unlock",
    description:
      "Offer a free slice, then convert to a one-time purchase. Useful when the first playable is a strong proof of value."
  },
  {
    label: "Subscription / platform deal",
    value: "Subscription / platform deal",
    description:
      "Plan around inclusion in a subscription bundle, platform fund, or similar partner-supported launch model."
  },
  {
    label: "Custom",
    value: CUSTOM_MONETIZATION_VALUE,
    description:
      "Use a custom description when the model is a hybrid or needs platform-specific nuance."
  }
];

const KNOWN_MONETIZATION_VALUES = new Set(
  MONETIZATION_OPTIONS.filter(
    (option) => option.value !== CUSTOM_MONETIZATION_VALUE
  ).map((option) => option.value)
);

export const normalizeMonetizationValue = (value: string): string => {
  const trimmedValue = value.trim();

  if (trimmedValue === "") {
    return "";
  }

  if (KNOWN_MONETIZATION_VALUES.has(trimmedValue)) {
    return trimmedValue;
  }

  if (trimmedValue.toLowerCase().startsWith("premium")) {
    return "Premium";
  }

  return CUSTOM_MONETIZATION_VALUE;
};

export const getMonetizationOption = (
  value: string
): MonetizationOption | undefined =>
  MONETIZATION_OPTIONS.find((option) => option.value === value);
