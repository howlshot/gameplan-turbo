import type { TemplateId } from "@/types";

interface ConceptFieldGuidance {
  oneLinePitchPlaceholder: string;
  playerFantasyDescription: string;
  playerFantasyPlaceholder: string;
}

interface GetConceptFieldGuidanceInput {
  genre?: string;
  subgenre?: string;
  templateId?: TemplateId;
}

const GENERIC_GUIDANCE: ConceptFieldGuidance = {
  oneLinePitchPlaceholder:
    'Example: "A compact horror game about escaping a sealed station where every shortcut makes the next room more dangerous."',
  playerFantasyDescription:
    'What fantasy is the player buying into? Example: "Feel like a capable but pressured survivor who can improvise under stress without ever feeling fully safe."',
  playerFantasyPlaceholder:
    'Example: "Feel like a capable but pressured survivor who can improvise under stress without ever feeling fully safe."'
};

const GUIDANCE_BY_SUBGENRE: Record<string, ConceptFieldGuidance> = {
  "action horror": {
    oneLinePitchPlaceholder:
      'Example: "A tense action-horror sprint through a quarantined district where every firefight burns scarce ammo and attracts worse threats."',
    playerFantasyDescription:
      'What fantasy is the player buying into? Example for Action Horror: "Feel like a dangerous but never comfortable survivor who can fight back, push forward, and barely stay ahead of the nightmare."',
    playerFantasyPlaceholder:
      'Example: "Feel like a dangerous but never comfortable survivor who can fight back, push forward, and barely stay ahead of the nightmare."'
  },
  "survival horror": {
    oneLinePitchPlaceholder:
      'Example: "A compact survival-horror game about escaping a failing research block where every detour costs ammo, health, or time."',
    playerFantasyDescription:
      'What fantasy is the player buying into? Example for Survival Horror: "Feel like a careful survivor who stays alive through planning, restraint, and last-second nerve."',
    playerFantasyPlaceholder:
      'Example: "Feel like a careful survivor who stays alive through planning, restraint, and last-second nerve."'
  },
  "horror adventure": {
    oneLinePitchPlaceholder:
      'Example: "A horror adventure about uncovering what happened in an abandoned hotel while every clue pulls you deeper into danger."',
    playerFantasyDescription:
      'What fantasy is the player buying into? Example for Horror Adventure: "Feel like an uneasy investigator pushing through dread to uncover the truth."',
    playerFantasyPlaceholder:
      'Example: "Feel like an uneasy investigator pushing through dread to uncover the truth."'
  },
  "rail shooter": {
    oneLinePitchPlaceholder:
      'Example: "A touch-first rail shooter about surviving choreographed urban ambushes and cashing in clean score chains."',
    playerFantasyDescription:
      'What fantasy is the player buying into? Example for Rail Shooter: "Feel like an elite response agent clearing high-pressure set pieces with speed, accuracy, and total control."',
    playerFantasyPlaceholder:
      'Example: "Feel like an elite response agent clearing high-pressure set pieces with speed, accuracy, and total control."'
  },
  "twin-stick shooter": {
    oneLinePitchPlaceholder:
      'Example: "A twin-stick shooter about holding collapsing arenas with crowd-control weapons and last-second movement saves."',
    playerFantasyDescription:
      'What fantasy is the player buying into? Example for Twin-Stick Shooter: "Feel like a survivor who wins by reading pressure, kiting threats, and turning chaos into control."',
    playerFantasyPlaceholder:
      'Example: "Feel like a survivor who wins by reading pressure, kiting threats, and turning chaos into control."'
  },
  "arena shooter": {
    oneLinePitchPlaceholder:
      'Example: "An arena shooter about mastering compact combat spaces where movement, target priority, and weapon rhythm decide everything."',
    playerFantasyDescription:
      'What fantasy is the player buying into? Example for Arena Shooter: "Feel like a combat specialist who dominates a lethal space through speed, clarity, and mechanical control."',
    playerFantasyPlaceholder:
      'Example: "Feel like a combat specialist who dominates a lethal space through speed, clarity, and mechanical control."'
  },
  "first-person shooter": {
    oneLinePitchPlaceholder:
      'Example: "A first-person shooter about breaching a hostile facility where weapon feel, target reads, and route pressure define survival."',
    playerFantasyDescription:
      'What fantasy is the player buying into? Example for First-Person Shooter: "Feel like a sharp, mobile shooter who clears pressure through aim, positioning, and weapon confidence."',
    playerFantasyPlaceholder:
      'Example: "Feel like a sharp, mobile shooter who clears pressure through aim, positioning, and weapon confidence."'
  },
  "character action": {
    oneLinePitchPlaceholder:
      'Example: "A character action game about carving through elite threats with stylish combos, tight cancels, and readable pressure windows."',
    playerFantasyDescription:
      'What fantasy is the player buying into? Example for Character Action: "Feel like a stylish high-skill fighter who turns danger into expression and control."',
    playerFantasyPlaceholder:
      'Example: "Feel like a stylish high-skill fighter who turns danger into expression and control."'
  },
  "run-and-gun": {
    oneLinePitchPlaceholder:
      'Example: "A run-and-gun sprint through collapsing warzones where constant momentum and clean target reads keep the run alive."',
    playerFantasyDescription:
      'What fantasy is the player buying into? Example for Run-and-Gun: "Feel unstoppable in motion, but only if you stay aggressive, accurate, and always one step ahead."',
    playerFantasyPlaceholder:
      'Example: "Feel unstoppable in motion, but only if you stay aggressive, accurate, and always one step ahead."'
  },
  "action platformer": {
    oneLinePitchPlaceholder:
      'Example: "An action platformer about crossing a ruined city where sharp jumps, clean combat beats, and quick resets keep momentum high."',
    playerFantasyDescription:
      'What fantasy is the player buying into? Example for Action Platformer: "Feel agile, decisive, and always in flow as movement and combat chain together cleanly."',
    playerFantasyPlaceholder:
      'Example: "Feel agile, decisive, and always in flow as movement and combat chain together cleanly."'
  },
  "precision platformer": {
    oneLinePitchPlaceholder:
      'Example: "A precision platformer about surviving brutal traversal rooms where every jump is readable, fair, and worth mastering."',
    playerFantasyDescription:
      'What fantasy is the player buying into? Example for Precision Platformer: "Feel locked in, improving through execution until impossible spaces become manageable."',
    playerFantasyPlaceholder:
      'Example: "Feel locked in, improving through execution until impossible spaces become manageable."'
  },
  metroidvania: {
    oneLinePitchPlaceholder:
      'Example: "A compact metroidvania about reopening a haunted district through traversal unlocks, careful backtracking, and escalating threat zones."',
    playerFantasyDescription:
      'What fantasy is the player buying into? Example for Metroidvania: "Feel like an explorer steadily mastering a hostile world by unlocking routes and hidden advantages."',
    playerFantasyPlaceholder:
      'Example: "Feel like an explorer steadily mastering a hostile world by unlocking routes and hidden advantages."'
  },
  tactics: {
    oneLinePitchPlaceholder:
      'Example: "A compact tactics game about surviving short missions where enemy intent is readable but every positioning mistake matters."',
    playerFantasyDescription:
      'What fantasy is the player buying into? Example for Tactics: "Feel like a calm battlefield planner who wins by reading intent and making clean tradeoffs."',
    playerFantasyPlaceholder:
      'Example: "Feel like a calm battlefield planner who wins by reading intent and making clean tradeoffs."'
  },
  "tower defense": {
    oneLinePitchPlaceholder:
      'Example: "A tower defense game about holding fractured routes where every placement choice shapes the next wave."',
    playerFantasyDescription:
      'What fantasy is the player buying into? Example for Tower Defense: "Feel like a defensive planner who turns impossible pressure into a solved, controllable system."',
    playerFantasyPlaceholder:
      'Example: "Feel like a defensive planner who turns impossible pressure into a solved, controllable system."'
  },
  deckbuilder: {
    oneLinePitchPlaceholder:
      'Example: "A compact deckbuilder about surviving escalating runs by building small, readable card synergies under pressure."',
    playerFantasyDescription:
      'What fantasy is the player buying into? Example for Deckbuilder: "Feel clever and adaptive, building tight synergies that turn bad odds into momentum."',
    playerFantasyPlaceholder:
      'Example: "Feel clever and adaptive, building tight synergies that turn bad odds into momentum."'
  },
  "puzzle action": {
    oneLinePitchPlaceholder:
      'Example: "A puzzle-action game about solving trap rooms under light combat pressure before the next rule twist closes in."',
    playerFantasyDescription:
      'What fantasy is the player buying into? Example for Puzzle Action: "Feel smart under pressure, solving clean systems fast enough to stay alive."',
    playerFantasyPlaceholder:
      'Example: "Feel smart under pressure, solving clean systems fast enough to stay alive."'
  },
  "logic puzzle": {
    oneLinePitchPlaceholder:
      'Example: "A logic puzzle game about decoding a shifting ruleset where each solution teaches the next leap in reasoning."',
    playerFantasyDescription:
      'What fantasy is the player buying into? Example for Logic Puzzle: "Feel like a focused problem-solver who sees the hidden pattern before the game fully explains it."',
    playerFantasyPlaceholder:
      'Example: "Feel like a focused problem-solver who sees the hidden pattern before the game fully explains it."'
  },
  "physics puzzle": {
    oneLinePitchPlaceholder:
      'Example: "A physics puzzle game about chaining cause-and-effect interactions to clear spaces that initially look impossible."',
    playerFantasyDescription:
      'What fantasy is the player buying into? Example for Physics Puzzle: "Feel inventive and curious, solving spaces by understanding how the world actually behaves."',
    playerFantasyPlaceholder:
      'Example: "Feel inventive and curious, solving spaces by understanding how the world actually behaves."'
  },
  "narrative adventure": {
    oneLinePitchPlaceholder:
      'Example: "A narrative adventure about guiding one fragile relationship through a city where every scene changes what trust looks like."',
    playerFantasyDescription:
      'What fantasy is the player buying into? Example for Narrative Adventure: "Feel like the person carrying the emotional weight of the story through every choice and reveal."',
    playerFantasyPlaceholder:
      'Example: "Feel like the person carrying the emotional weight of the story through every choice and reveal."'
  },
  "exploration adventure": {
    oneLinePitchPlaceholder:
      'Example: "An exploration adventure about charting a forgotten coast where each route opens new history, tools, and risks."',
    playerFantasyDescription:
      'What fantasy is the player buying into? Example for Exploration Adventure: "Feel like a curious explorer uncovering a place that slowly starts making sense."',
    playerFantasyPlaceholder:
      'Example: "Feel like a curious explorer uncovering a place that slowly starts making sense."'
  },
  "action rpg": {
    oneLinePitchPlaceholder:
      'Example: "An action RPG about clearing corrupted districts while building a compact kit of weapons, abilities, and gear synergies."',
    playerFantasyDescription:
      'What fantasy is the player buying into? Example for Action RPG: "Feel like a growing hero whose build choices make every fight more expressive and personal."',
    playerFantasyPlaceholder:
      'Example: "Feel like a growing hero whose build choices make every fight more expressive and personal."'
  },
  "turn-based rpg": {
    oneLinePitchPlaceholder:
      'Example: "A turn-based RPG about surviving compact party battles where role synergy and timing decide every outcome."',
    playerFantasyDescription:
      'What fantasy is the player buying into? Example for Turn-Based RPG: "Feel like a party leader who wins by planning, sequencing, and building the right team identity."',
    playerFantasyPlaceholder:
      'Example: "Feel like a party leader who wins by planning, sequencing, and building the right team identity."'
  },
  "survival craft": {
    oneLinePitchPlaceholder:
      'Example: "A survival craft game about keeping one small shelter alive as weather, hunger, and resource risk keep tightening the loop."',
    playerFantasyDescription:
      'What fantasy is the player buying into? Example for Survival Craft: "Feel self-reliant and resourceful, turning a harsh place into something barely sustainable."',
    playerFantasyPlaceholder:
      'Example: "Feel self-reliant and resourceful, turning a harsh place into something barely sustainable."'
  },
  management: {
    oneLinePitchPlaceholder:
      'Example: "A management game about keeping a failing business alive through readable systems, smart scheduling, and tight resource tradeoffs."',
    playerFantasyDescription:
      'What fantasy is the player buying into? Example for Management: "Feel like the person holding a complex operation together through foresight and discipline."',
    playerFantasyPlaceholder:
      'Example: "Feel like the person holding a complex operation together through foresight and discipline."'
  }
};

const GUIDANCE_BY_TEMPLATE: Partial<Record<TemplateId, ConceptFieldGuidance>> = {
  "arcade-action-rail-shooter": GUIDANCE_BY_SUBGENRE["rail-shooter"],
  "survival-horror-lite": GUIDANCE_BY_SUBGENRE["survival-horror"],
  "twin-stick-shooter": GUIDANCE_BY_SUBGENRE["twin-stick-shooter"],
  platformer: GUIDANCE_BY_SUBGENRE["action-platformer"],
  "tactics-lite": GUIDANCE_BY_SUBGENRE.tactics,
  "puzzle-action": GUIDANCE_BY_SUBGENRE["puzzle action"],
  "action-lite": GUIDANCE_BY_SUBGENRE["character action"],
  "strategy-lite": GUIDANCE_BY_SUBGENRE["tower defense"],
  "adventure-lite": GUIDANCE_BY_SUBGENRE["narrative adventure"],
  "rpg-lite": GUIDANCE_BY_SUBGENRE["action rpg"],
  "sim-lite": GUIDANCE_BY_SUBGENRE["survival craft"]
};

export const getConceptFieldGuidance = ({
  genre = "",
  subgenre = "",
  templateId
}: GetConceptFieldGuidanceInput): ConceptFieldGuidance => {
  const normalizedSubgenre = subgenre.trim().toLowerCase();
  const normalizedGenre = genre.trim().toLowerCase();

  if (normalizedSubgenre && GUIDANCE_BY_SUBGENRE[normalizedSubgenre]) {
    return GUIDANCE_BY_SUBGENRE[normalizedSubgenre];
  }

  if (templateId && GUIDANCE_BY_TEMPLATE[templateId]) {
    return GUIDANCE_BY_TEMPLATE[templateId] ?? GENERIC_GUIDANCE;
  }

  if (normalizedGenre === "horror") {
    return GUIDANCE_BY_SUBGENRE["survival-horror"];
  }

  if (normalizedGenre === "action") {
    return GUIDANCE_BY_SUBGENRE["character action"];
  }

  return GENERIC_GUIDANCE;
};
