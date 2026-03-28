import type {
  AgentPlatform,
  BuildStageKey,
  ConceptSection,
  ContentBibleSection,
  ControlsFeelSection,
  CoreLoopSection,
  DesignPillarsSection,
  GameDesignDoc,
  GameDesignDocSeed,
  GamePlatformTarget,
  Project,
  ScopeCategory,
  TechnicalDesignSection,
  TemplateId,
  ArtToneSection
} from "@/types";

export interface GameTemplateDefinition {
  id: TemplateId;
  kind: "preset" | "custom";
  label: string;
  description: string;
  genreLabel: string;
  defaultProject: Partial<Project>;
  defaultDoc: GameDesignDocSeed;
  stageFocus: Partial<Record<BuildStageKey, string>>;
}

export type GenreFamilyId =
  | "action"
  | "platformer"
  | "horror"
  | "strategy"
  | "puzzle"
  | "adventure"
  | "rpg"
  | "simulation"
  | "other";

export interface SubgenreDefinition {
  id: string;
  label: string;
  description: string;
  rationale: string;
  profileTemplateId?: TemplateId;
}

export interface GenreFamilyDefinition {
  id: GenreFamilyId;
  label: string;
  description: string;
  subgenres: SubgenreDefinition[];
}

const createBaseConcept = (
  scopeCategory: ScopeCategory = "small",
  platformTargets: GamePlatformTarget[] = ["pc", "web"]
): ConceptSection => ({
  gameTitle: "",
  oneLinePitch: "",
  playerFantasy: "",
  genre: "",
  subgenre: "",
  platformTargets,
  targetAudience: "",
  sessionLength: "",
  monetizationModel: "",
  comparableGames: [],
  scopeCategory,
  differentiators: ""
});

const createBaseDesignPillars = (): DesignPillarsSection => ({
  pillars: [],
  feelStatement: "",
  antiGoals: [],
  emotionalTargets: [],
  readabilityPrinciples: ""
});

const createBaseCoreLoop = (): CoreLoopSection => ({
  secondToSecond: "",
  minuteToMinute: "",
  sessionLoop: "",
  longTermProgression: "",
  failureStates: "",
  rewardCadence: ""
});

const createBaseControlsFeel = (): ControlsFeelSection => ({
  controlScheme: "",
  cameraRules: "",
  movementPhilosophy: "",
  combatFeelGoals: "",
  responsivenessStandards: "",
  platformInputNotes: "",
  accessibilityConsiderations: ""
});

const createBaseContentBible = (): ContentBibleSection => ({
  playerVerbs: "",
  enemies: "",
  weaponsAbilities: "",
  encounters: "",
  levelsMissions: "",
  bossesSpecialEvents: "",
  pickupsRewards: "",
  uiHudElements: ""
});

const createBaseArtTone = (): ArtToneSection => ({
  artDirection: "",
  toneKeywords: [],
  visualReferences: [],
  negativeReferences: [],
  animationStyle: "",
  vfxDirection: "",
  audioMusicDirection: ""
});

const createBaseTechnicalDesign = (): TechnicalDesignSection => ({
  engine: "",
  renderingConstraints: "",
  targetFramerate: "",
  memoryPerformanceBudget: "",
  saveSystem: "",
  contentPipeline: "",
  namingConventions: "",
  folderStructure: "",
  platformConstraints: ""
});

export const createEmptyGameDesignDoc = (
  projectId: string,
  seed?: GameDesignDocSeed
): GameDesignDoc => ({
  id: seed?.id ?? crypto.randomUUID(),
  projectId,
  concept: {
    ...createBaseConcept(),
    ...seed?.concept
  },
  designPillars: {
    ...createBaseDesignPillars(),
    ...seed?.designPillars
  },
  coreLoop: {
    ...createBaseCoreLoop(),
    ...seed?.coreLoop
  },
  controlsFeel: {
    ...createBaseControlsFeel(),
    ...seed?.controlsFeel
  },
  contentBible: {
    ...createBaseContentBible(),
    ...seed?.contentBible
  },
  artTone: {
    ...createBaseArtTone(),
    ...seed?.artTone
  },
  technicalDesign: {
    ...createBaseTechnicalDesign(),
    ...seed?.technicalDesign
  },
  updatedAt: seed?.updatedAt ?? Date.now()
});

export const AGENT_PLATFORM_OPTIONS: AgentPlatform[] = [
  "codex",
  "qwen-code",
  "cursor",
  "claude-code",
  "replit",
  "chatgpt",
  "gemini",
  "perplexity"
];

export const GAME_PLATFORM_OPTIONS: GamePlatformTarget[] = [
  "ios",
  "android",
  "pc",
  "web",
  "switch",
  "console"
];

export interface BuildStageDefinition {
  key: BuildStageKey;
  label: string;
  description: string;
}

const STANDARD_BUILD_STAGE_SEQUENCE: BuildStageDefinition[] = [
  {
    key: "foundation",
    label: "Foundation",
    description: "Project bootstrap, technical skeleton, naming, and baseline toolchain."
  },
  {
    key: "first-playable",
    label: "First Playable",
    description: "Reach a loop-complete build with one complete scenario and clear fail state."
  },
  {
    key: "core-controls",
    label: "Core Controls",
    description: "Input mapping, interaction cadence, and basic action responsiveness."
  },
  {
    key: "camera-movement",
    label: "Camera / Movement",
    description: "Motion rules, staging, rails or traversal, and readability during play."
  },
  {
    key: "combat-feel",
    label: "Combat Feel",
    description: "Timing, hit feedback, damage language, and player empowerment cues."
  },
  {
    key: "enemy-behavior",
    label: "Enemy Behavior",
    description: "Enemy roles, threat silhouettes, attack tells, and decision logic."
  },
  {
    key: "encounter-scripting",
    label: "Encounter Scripting",
    description: "Spawn timing, pacing, escalation, and authored beat structure."
  },
  {
    key: "hud-feedback",
    label: "HUD / Feedback",
    description: "Clarity, score feedback, hit confirms, failure messaging, and UI rhythm."
  },
  {
    key: "progression-meta",
    label: "Progression / Meta",
    description: "Unlocks, scoring layers, persistence, and repeat-session motivation."
  },
  {
    key: "content-slice",
    label: "Content Slice",
    description: "Vertical slice or representative chapter with polished representative content."
  },
  {
    key: "polish",
    label: "Polish",
    description: "Animation cleanup, VFX/audio tuning, balancing, and feel iteration."
  },
  {
    key: "packaging-release-prep",
    label: "Packaging / Release Prep",
    description: "Performance passes, platform packaging, QA checks, and release metadata."
  }
];

const LARGE_BUILD_STAGE_SEQUENCE: BuildStageDefinition[] = [
  {
    key: "scope-lock",
    label: "Scope Lock",
    description: "Lock the v1 promise, content ceilings, staffing assumptions, and explicit cut boundaries before production expands."
  },
  {
    key: "foundation",
    label: "Foundation",
    description: "Project bootstrap, naming, repository conventions, and the technical skeleton for a broader production run."
  },
  {
    key: "first-playable",
    label: "First Playable",
    description: "Reach a loop-complete build that proves the game can be played end to end with placeholder-friendly content."
  },
  {
    key: "core-controls",
    label: "Core Controls",
    description: "Lock the input model, interaction cadence, and low-level responsiveness standards."
  },
  {
    key: "camera-movement",
    label: "Camera / Movement",
    description: "Stabilize traversal, staging, rails or locomotion grammar, and readability under pressure."
  },
  {
    key: "combat-feel",
    label: "Combat / Interaction Feel",
    description: "Tune hit timing, action clarity, damage language, and player feedback until the core interaction loop feels right."
  },
  {
    key: "systems-foundation",
    label: "Systems Foundation",
    description: "Establish reusable gameplay systems, progression plumbing, and integration boundaries before content ramps up."
  },
  {
    key: "enemy-behavior",
    label: "Enemy / Encounter Foundations",
    description: "Define enemy roles, threat readability, encounter rules, and reusable behavior building blocks."
  },
  {
    key: "hud-feedback",
    label: "HUD / Feedback",
    description: "Lock clarity rules for HUD, alerts, score language, and response timing across the larger project surface."
  },
  {
    key: "progression-meta",
    label: "Progression / Meta",
    description: "Build the progression spine, persistence, unlock structure, and repeat-session motivation without overcommitting content."
  },
  {
    key: "content-pipeline",
    label: "Content Pipeline",
    description: "Prove that content authoring, asset ingest, naming, and testing pipelines can support broader production."
  },
  {
    key: "content-production",
    label: "Content Production",
    description: "Produce the planned content set within agreed budgets and dependency boundaries."
  },
  {
    key: "vertical-slice-integration",
    label: "Vertical Slice Integration",
    description: "Integrate gameplay, content, pipeline, and presentation into one representative slice that proves the production model works."
  },
  {
    key: "polish",
    label: "Polish / Optimization",
    description: "Refine balance, pacing, feedback, and performance without reopening fundamental design decisions."
  },
  {
    key: "qa-release-prep",
    label: "QA / Release Prep",
    description: "Run QA gates, packaging checks, compatibility passes, and release-readiness verification."
  }
];

export const BUILD_STAGE_SEQUENCE: BuildStageDefinition[] =
  STANDARD_BUILD_STAGE_SEQUENCE;

export const getBuildStageSequence = (
  scopeCategory: ScopeCategory
): BuildStageDefinition[] =>
  scopeCategory === "large"
    ? LARGE_BUILD_STAGE_SEQUENCE
    : STANDARD_BUILD_STAGE_SEQUENCE;

export const STARTER_MODE_ORDER: TemplateId[] = [
  "blank-game-project",
  "arcade-action-rail-shooter",
  "action-lite",
  "platformer",
  "twin-stick-shooter",
  "survival-horror-lite",
  "tactics-lite",
  "strategy-lite",
  "puzzle-action",
  "adventure-lite",
  "rpg-lite",
  "sim-lite",
  "custom-guided"
];

const GENRE_FAMILIES: GenreFamilyDefinition[] = [
  {
    id: "action",
    label: "Action",
    description: "Fast-response games built around pressure, timing, and readable threat management.",
    subgenres: [
      {
        id: "rail-shooter",
        label: "Rail Shooter",
        description: "Authored camera rails, readable pop-up threats, and score-driven replay.",
        rationale:
          "Use this when you want short, choreographed action with tight readability, authored camera flow, and replayable score pressure.",
        profileTemplateId: "arcade-action-rail-shooter"
      },
      {
        id: "twin-stick-shooter",
        label: "Twin-Stick Shooter",
        description: "Arena pressure, crowd control, and upgrade-shaped combat loops.",
        rationale:
          "Use this when the game lives or dies on arena clarity, enemy pressure, and satisfying weapon-driven repeat runs.",
        profileTemplateId: "twin-stick-shooter"
      },
      {
        id: "arena-shooter",
        label: "Arena Shooter",
        description: "High-readability combat spaces with movement pressure and reusable enemy mixes.",
        rationale:
          "Use this when the core promise is readable arena combat, crowd-control decisions, and repeatable combat mastery.",
        profileTemplateId: "twin-stick-shooter"
      },
      {
        id: "character-action-lite",
        label: "Character Action",
        description: "Feel-first melee or hybrid combat with compact encounter depth and controlled scope.",
        rationale:
          "Use this when combat feel, expressive player verbs, and stylish readable encounters matter more than huge content breadth.",
        profileTemplateId: "action-lite"
      },
      {
        id: "fps",
        label: "First-Person Shooter",
        description: "First-person combat built around readable target acquisition, weapon feel, and spatial pressure.",
        rationale:
          "Use this when the game depends on first-person shooting, readable combat spaces, and strong weapon feel.",
        profileTemplateId: "action-lite"
      },
      {
        id: "run-and-gun",
        label: "Run-and-Gun",
        description: "Forward-driving action with pressure, clean target reads, and fast encounter rhythm.",
        rationale:
          "Use this when you want aggressive momentum, snappy weapon feel, and compact stages that reward constant action.",
        profileTemplateId: "action-lite"
      }
    ]
  },
  {
    id: "platformer",
    label: "Platformer",
    description: "Games built around traversal feel, hazard readability, and checkpoint cadence.",
    subgenres: [
      {
        id: "action-platformer",
        label: "Action Platformer",
        description: "Precise movement, readable hazards, and compact challenge escalation.",
        rationale:
          "Use this when jump feel, clean resets, and traversal readability matter more than broad system complexity.",
        profileTemplateId: "platformer"
      },
      {
        id: "precision-platformer",
        label: "Precision Platformer",
        description: "Tighter jump asks, cleaner hazard language, and retry-first challenge rooms.",
        rationale:
          "Use this when exact movement, fast resets, and highly readable challenge beats are the core appeal.",
        profileTemplateId: "platformer"
      },
      {
        id: "metroidvania-lite",
        label: "Metroidvania",
        description: "Compact exploration gating, traversal upgrades, and readable world re-use.",
        rationale:
          "Use this when you want backtracking and traversal unlocks, but need a tightly bounded scope and smaller content surface.",
        profileTemplateId: "platformer"
      }
    ]
  },
  {
    id: "horror",
    label: "Horror",
    description: "Tension-first games built around atmosphere, scarcity, and route planning.",
    subgenres: [
      {
        id: "survival-horror",
        label: "Survival Horror",
        description: "Resource pressure, safe-room pacing, and compact dread-heavy progression.",
        rationale:
          "Use this when the game should center on tension, meaningful scarcity, and careful route planning instead of raw combat volume.",
        profileTemplateId: "survival-horror-lite"
      },
      {
        id: "action-horror",
        label: "Action Horror",
        description: "Tension-first horror with more frequent combat and cleaner threat escalation.",
        rationale:
          "Use this when the game should feel tense and dangerous, but still support readable combat pressure as part of the loop.",
        profileTemplateId: "survival-horror-lite"
      },
      {
        id: "horror-adventure",
        label: "Horror Adventure",
        description: "Atmosphere, exploration, and narrative tension in a compact, readable structure.",
        rationale:
          "Use this when you want dread, exploration, and progression clarity without leaning fully on combat or giant maps.",
        profileTemplateId: "survival-horror-lite"
      }
    ]
  },
  {
    id: "strategy",
    label: "Strategy",
    description: "Readable decision-first games where planning and intent clarity matter most.",
    subgenres: [
      {
        id: "tactics",
        label: "Tactics",
        description: "Compact missions, readable enemy intent, and a deliberately small roster.",
        rationale:
          "Use this when the game should reward foresight, clear enemy intent reads, and compact mission structure over sprawling campaign breadth.",
        profileTemplateId: "tactics-lite"
      },
      {
        id: "tower-defense",
        label: "Tower Defense",
        description: "Readable lane pressure, build decisions, and compact escalation planning.",
        rationale:
          "Use this when the appeal is clear threat routing, strong placement decisions, and compact defensive progression.",
        profileTemplateId: "strategy-lite"
      },
      {
        id: "deckbuilder-lite",
        label: "Deckbuilder",
        description: "Small-card pools, readable synergies, and tightly bounded run structure.",
        rationale:
          "Use this when you want meaningful build decisions and replayable runs without a giant card-content burden.",
        profileTemplateId: "strategy-lite"
      }
    ]
  },
  {
    id: "puzzle",
    label: "Puzzle",
    description: "Rule-driven games built around clarity, twists, and elegant escalation.",
    subgenres: [
      {
        id: "puzzle-action",
        label: "Puzzle Action",
        description: "Teach-test-twist puzzle cadence with a small amount of action pressure.",
        rationale:
          "Use this when the core appeal is readable rules, short solve loops, and just enough pressure to keep the puzzle dynamic.",
        profileTemplateId: "puzzle-action"
      },
      {
        id: "logic-puzzle",
        label: "Logic Puzzle",
        description: "Rule-driven problem solving with minimal action noise and clean escalation.",
        rationale:
          "Use this when the game should focus on clarity, deduction, and elegant rule mastery above all else.",
        profileTemplateId: "puzzle-action"
      },
      {
        id: "physics-puzzle",
        label: "Physics Puzzle",
        description: "Readable simulation interactions, cause-and-effect setups, and short solve loops.",
        rationale:
          "Use this when the hook is manipulating space, momentum, or objects through understandable physical outcomes.",
        profileTemplateId: "puzzle-action"
      }
    ]
  },
  {
    id: "adventure",
    label: "Adventure",
    description: "Exploration and progression-first games built around pacing, discovery, and readable narrative context.",
    subgenres: [
      {
        id: "narrative-adventure",
        label: "Narrative Adventure",
        description: "Story-forward progression with compact interaction loops and strong scene clarity.",
        rationale:
          "Use this when the project centers on scene-to-scene momentum, player discovery, and readable narrative stakes.",
        profileTemplateId: "adventure-lite"
      },
      {
        id: "exploration-adventure",
        label: "Exploration Adventure",
        description: "Environmental discovery, light systemic friction, and compact route-based progression.",
        rationale:
          "Use this when the game is about exploring spaces, uncovering paths, and maintaining a strong sense of discovery.",
        profileTemplateId: "adventure-lite"
      }
    ]
  },
  {
    id: "rpg",
    label: "RPG",
    description: "Progression-first games built around character growth, readable encounters, and bounded systems depth.",
    subgenres: [
      {
        id: "action-rpg-lite",
        label: "Action RPG",
        description: "Progression and gear motivation wrapped around compact real-time combat loops.",
        rationale:
          "Use this when you want readable combat plus light progression and build identity without a huge content burden.",
        profileTemplateId: "rpg-lite"
      },
      {
        id: "turn-based-rpg-lite",
        label: "Turn-Based RPG",
        description: "Readable party progression, compact encounter loops, and bounded menu complexity.",
        rationale:
          "Use this when the project needs party growth and tactical pacing, but should stay far smaller than a full classic RPG.",
        profileTemplateId: "rpg-lite"
      }
    ]
  },
  {
    id: "simulation",
    label: "Simulation",
    description: "System-driven games built around upkeep loops, player expression, and readable resource pressure.",
    subgenres: [
      {
        id: "survival-craft-lite",
        label: "Survival Craft",
        description: "Resource gathering, survival pressure, and compact build loops without sandbox sprawl.",
        rationale:
          "Use this when the project depends on survival/resource loops but needs a tightly bounded content surface.",
        profileTemplateId: "sim-lite"
      },
      {
        id: "management-lite",
        label: "Management",
        description: "Readable systems, queue or staffing decisions, and compact scenario-based optimization.",
        rationale:
          "Use this when you want satisfying management decisions and visible system response without a giant simulation stack.",
        profileTemplateId: "sim-lite"
      }
    ]
  },
  {
    id: "other",
    label: "Other / Custom",
    description: "Bring your own genre framing and seed the design direction manually.",
    subgenres: []
  }
];

export const GAME_TEMPLATES: Record<TemplateId, GameTemplateDefinition> = {
  "blank-game-project": {
    id: "blank-game-project",
    kind: "preset",
    label: "Blank Game Project",
    description: "A clean game preproduction shell with no genre assumptions.",
    genreLabel: "Blank",
    defaultProject: {
      genre: "",
      subgenre: "",
      scopeCategory: "small",
      platformTargets: ["pc", "web"],
      agentTargets: ["codex", "cursor"],
      targetPlatforms: ["codex", "cursor"],
      monetizationModel: "Premium",
      sessionLength: "10-20 minutes",
      enginePreference: "",
      techStack: []
    },
    defaultDoc: {
      concept: createBaseConcept("small", ["pc", "web"]),
      designPillars: createBaseDesignPillars(),
      coreLoop: createBaseCoreLoop(),
      controlsFeel: createBaseControlsFeel(),
      contentBible: createBaseContentBible(),
      artTone: createBaseArtTone(),
      technicalDesign: createBaseTechnicalDesign()
    },
    stageFocus: {}
  },
  "arcade-action-rail-shooter": {
    id: "arcade-action-rail-shooter",
    kind: "preset",
    label: "Arcade Action / Rail Shooter",
    description:
      "Built for short-session action with choreographed camera rails, target readability, and score-driven replayability.",
    genreLabel: "Arcade Action / Rail Shooter",
    defaultProject: {
      genre: "Action",
      subgenre: "Rail Shooter",
      scopeCategory: "small",
      platformTargets: ["ios", "android", "pc"],
      agentTargets: ["codex", "cursor", "claude-code"],
      targetPlatforms: ["codex", "cursor", "claude-code"],
      targetAudience: "Arcade action fans who want short, replayable sessions.",
      sessionLength: "3-10 minutes",
      monetizationModel: "Premium",
      comparableGames: ["Virtua Cop", "Time Crisis", "House of the Dead"],
      enginePreference: "",
      techStack: []
    },
    defaultDoc: {
      concept: {
        ...createBaseConcept("small", ["ios", "android", "pc"]),
        genre: "Action",
        subgenre: "Rail Shooter",
        playerFantasy: "An elite agent clearing hostile set pieces under pressure.",
        targetAudience: "Players who want high-readability action and quick restarts.",
        sessionLength: "3-10 minutes",
        monetizationModel: "Premium",
        comparableGames: ["Virtua Cop", "Time Crisis", "House of the Dead"],
        scopeCategory: "small",
        differentiators:
          "Mobile-friendly mirrored utility buttons, clean pop-up readability, and tightly choreographed encounter rails."
      },
      designPillars: {
        pillars: [
          "Every threat must read instantly at a glance.",
          "The player should feel in control even while the camera is authored.",
          "Score pressure should reward accuracy, timing, and target prioritization."
        ],
        feelStatement:
          "Readable, snappy, and rhythmically escalating like an arcade cabinet tuned for repeat attempts.",
        antiGoals: [
          "Never turn into free-roam corridor shooting.",
          "Never bury the screen in unreadable VFX or UI clutter.",
          "Never ask the player to memorize hidden objectives."
        ],
        emotionalTargets: ["Urgency", "confidence", "precision", "score greed"],
        readabilityPrinciples:
          "Enemy silhouettes, telegraphs, interactables, and score windows must stay readable on handheld-sized screens."
      },
      coreLoop: {
        secondToSecond:
          "Snap aim, prioritize visible threats, pop enemies, reload or take cover, and recover combo cadence.",
        minuteToMinute:
          "Survive scripted waves, manage damage windows, cash in combos, and transition through authored set pieces.",
        sessionLoop:
          "Complete one run, chase a better score grade, unlock modifiers, and replay with cleaner execution.",
        longTermProgression:
          "Unlock new chapters, difficulty modifiers, weapon variants, and score milestones.",
        failureStates:
          "Health depletion, missed civilians/objectives, or collapsing combo pacing under pressure.",
        rewardCadence:
          "Frequent micro-rewards from hit confirms and combo ticks, with larger chapter-grade and unlock rewards after a run."
      },
      controlsFeel: {
        controlScheme:
          "Tap or drag to aim, hold for light lock, mirrored utility buttons for reload / cover / special.",
        cameraRules:
          "Camera follows authored rails with limited player aim deviation and clear target framing.",
        movementPhilosophy:
          "Author the traversal path; let the player own aim, timing, and utility management.",
        combatFeelGoals:
          "Shots should land with crisp impact timing, strong hit spark language, and zero mushy delay.",
        responsivenessStandards:
          "Input-to-feedback under one animation beat. Core actions should confirm immediately with audio and screen-space response.",
        platformInputNotes:
          "Touch builds need mirrored left/right utility variants and safe-thumb placement zones.",
        accessibilityConsiderations:
          "High-contrast target outlines, optional auto-reload assist, subtitle-safe HUD sizing, and reduced camera shake mode."
      },
      contentBible: {
        playerVerbs: "Aim, fire, tap critical points, reload, take cover, use special, protect civilians, chain combo.",
        enemies:
          "Peek shooters, shield carriers, rushing melee threats, armored anchors, and off-screen suppressors.",
        weaponsAbilities:
          "Sidearm, spread shot pickup, slow-time burst, armor breaker, and panic-clear special.",
        encounters:
          "Enemy pop-up sequences, flank reveals, hostage pressure moments, and mixed-height threat groups.",
        levelsMissions:
          "Short chapters built as tightly authored rail sequences with one signature gimmick each.",
        bossesSpecialEvents:
          "Vehicle chase, turret duel, helicopter pass, or arena anchor boss with readable phases.",
        pickupsRewards:
          "Score stars, health kits, ammo refresh, combo extenders, and temporary weapon swaps.",
        uiHudElements:
          "Reticle, health, reload meter, combo chain, chapter timer, score grade, mission alerts, and utility buttons."
      },
      artTone: {
        artDirection:
          "Stylized realism with clean silhouettes, strong foreground framing, and bright hit contrast over moody environments.",
        toneKeywords: ["Arcade", "neon tactical", "clean silhouettes", "high tension"],
        visualReferences: ["Virtua Cop sightlines", "Time Crisis cover rhythm", "arcade attract-mode clarity"],
        negativeReferences: ["muddy military gray", "overly realistic recoil chaos", "busy realistic HUDs"],
        animationStyle:
          "Exaggerated threat tells with readable anticipation and fast recoveries.",
        vfxDirection:
          "Short-lived hit flashes, directional tracer language, and restrained screen shake.",
        audioMusicDirection:
          "Punchy cabinet-era action cues, sharp reload feedback, and score-driven stingers."
      },
      technicalDesign: {
        engine: "",
        renderingConstraints:
          "Prioritize clean silhouettes and stable frame pacing over heavy post-processing.",
        targetFramerate: "60 FPS on target devices",
        memoryPerformanceBudget:
          "Small encounter pools, reusable enemy variants, and mobile-safe VFX budgets.",
        saveSystem:
          "Stage unlocks, settings, leaderboard-ready score history, and lightweight progression flags.",
        contentPipeline:
          "Author rails, spawn scripts, encounter sheets, and HUD data from lightweight data tables.",
        namingConventions:
          "Use encounter-first naming for rails, wave scripts, spawn markers, and pickup events.",
        folderStructure:
          "Separate rails, encounters, enemies, UI, pickups, audio cues, and scoring systems into explicit feature folders.",
        platformConstraints:
          "Design touch-safe interfaces first, then expand for controller and mouse support."
      }
    },
    stageFocus: {
      "enemy-behavior":
        "Prioritize enemy pop-up behavior, readable telegraphs, and role contrast across ranged, armored, and pressure units.",
      "encounter-scripting":
        "Plan wave timing, cover/reload loops, camera rail beats, civilian pressure moments, and combo-routing opportunities.",
      "hud-feedback":
        "Keep target readability, combo visibility, touch-button mirroring, and score reward cadence readable on small screens.",
      "first-playable":
        "Ship one short rail-shooter mission with full start-to-fail-to-score loop before expanding content."
    }
  },
  "action-lite": {
    id: "action-lite",
    kind: "preset",
    label: "Action",
    description:
      "Internal recommendation profile for compact feel-first action projects with readable encounters and controlled scope.",
    genreLabel: "Action",
    defaultProject: {
      genre: "Action",
      subgenre: "Character Action",
      scopeCategory: "small",
      platformTargets: ["pc", "web", "console"],
      agentTargets: ["codex", "cursor", "claude-code"],
      targetPlatforms: ["codex", "cursor", "claude-code"],
      targetAudience:
        "Players who want responsive combat, readable pressure, and short-to-medium sessions.",
      sessionLength: "10-20 minutes",
      monetizationModel: "Premium",
      comparableGames: ["Hades", "Hyper Light Drifter", "Broforce"],
      enginePreference: "",
      techStack: []
    },
    defaultDoc: {
      concept: {
        ...createBaseConcept("small", ["pc", "web", "console"]),
        genre: "Action",
        subgenre: "Character Action",
        playerFantasy:
          "Cut through readable enemy pressure with expressive actions and confident movement.",
        targetAudience:
          "Players who want responsive combat feel and readable short-form action mastery.",
        sessionLength: "10-20 minutes",
        monetizationModel: "Premium",
        comparableGames: ["Hades", "Hyper Light Drifter", "Broforce"],
        scopeCategory: "small",
        differentiators:
          "Compact encounter structure, strong combat readability, and a tightly bounded action verb set."
      },
      designPillars: {
        pillars: [
          "Action feel must land before content breadth expands.",
          "Every enemy or hazard should communicate pressure cleanly.",
          "Player verbs should stay expressive without exploding scope."
        ],
        feelStatement:
          "Responsive, punchy, and readable with compact encounters built around satisfying actions.",
        antiGoals: [
          "Never turn into unreadable crowd chaos.",
          "Never add move-list complexity that outruns production scope.",
          "Never bury feel under slow or muddy feedback."
        ],
        emotionalTargets: ["Momentum", "confidence", "pressure", "release"],
        readabilityPrinciples:
          "Enemy intent, incoming danger, and player action payoff should stay understandable at full speed."
      },
      coreLoop: {
        secondToSecond:
          "Read the next threat, commit to an action, confirm impact, and reposition before pressure spikes.",
        minuteToMinute:
          "Clear encounter sets, adapt to changing pressure, and sharpen execution through repeated short runs.",
        sessionLoop:
          "Play one concise combat slice, improve execution, unlock light variation, and run again.",
        longTermProgression:
          "Unlock small combat options, stage variations, and score or completion milestones.",
        failureStates:
          "Overcommitting into unreadable pressure, dropping control of space, or missing key defensive timings.",
        rewardCadence:
          "Immediate hit feedback and encounter clears, with larger rewards at stage or run completion."
      },
      controlsFeel: {
        controlScheme:
          "Direct movement plus a compact action set tuned around responsiveness and readable cooldown or timing windows.",
        cameraRules:
          "Frame pressure clearly and preserve player orientation during fast exchanges.",
        movementPhilosophy:
          "Movement should support confident aggression and quick recovery, not hesitation.",
        combatFeelGoals:
          "Every core action should feel immediate, legible, and worth using repeatedly.",
        responsivenessStandards:
          "Inputs should resolve cleanly with minimal delay and strong audio-visual confirmation.",
        platformInputNotes:
          "Controller and keyboard should both support confident action execution without awkward remapping pressure.",
        accessibilityConsiderations:
          "Readable incoming-threat cues, optional aim or input assists, and reduced flash or shake settings."
      },
      contentBible: {
        playerVerbs: "Move, attack, evade, interrupt, finish, recover, and push tempo.",
        enemies:
          "Readable melee pressure units, ranged disruptors, armored anchors, and mobility checks.",
        weaponsAbilities:
          "Compact weapon or move-set options with strong feel contrast and low overlap.",
        encounters:
          "Short combat beats, elite mixes, pacing spikes, and readable escalation layers.",
        levelsMissions:
          "Compact stages or arenas that prove combat feel without requiring giant content libraries.",
        bossesSpecialEvents:
          "Small multi-phase bosses or pressure events that test timing, space control, and clarity.",
        pickupsRewards:
          "Health, cooldown relief, temporary boosts, score rewards, and unlock tokens.",
        uiHudElements:
          "Health, cooldown or resource state, enemy warnings, score or performance feedback, and clear fail messaging."
      },
      artTone: {
        artDirection:
          "Clean silhouettes, strong impact language, and readable foreground action over decorative noise.",
        toneKeywords: ["Punchy", "kinetic", "readable", "confident"],
        visualReferences: ["indie action readability", "clear combat silhouettes"],
        negativeReferences: ["muddy impacts", "crowded effect stacks", "indistinct enemy shapes"],
        animationStyle:
          "Snappy anticipation, clear hit reaction, and readable recoveries that teach timing.",
        vfxDirection:
          "Short, high-clarity effects that emphasize timing and impact without obscuring space.",
        audioMusicDirection:
          "Strong impact cues, energetic pacing, and feedback that reinforces action timing."
      },
      technicalDesign: {
        engine: "",
        renderingConstraints:
          "Prioritize combat clarity, frame pacing, and consistent hit readability over heavy presentation layers.",
        targetFramerate: "60 FPS on target platforms",
        memoryPerformanceBudget:
          "Reusable encounter ingredients, pooled feedback effects, and compact enemy variant sets.",
        saveSystem:
          "Light progression flags, settings, and score or run-history persistence as needed.",
        contentPipeline:
          "Author combat beats, enemy role data, and tuning tables through reusable lightweight content definitions.",
        namingConventions:
          "Name encounters, enemy roles, and combat tuning assets by pressure function and stage context.",
        folderStructure:
          "Separate combat systems, enemies, encounters, progression, UI, and feedback assets.",
        platformConstraints:
          "Combat readability and stable response timing should take priority over visual density."
      }
    },
    stageFocus: {
      "first-playable":
        "Ship one compact combat loop with clear fail-recover flow before expanding stage count or move-set breadth.",
      "combat-feel":
        "Prioritize responsiveness, impact language, and readable timing windows before adding more content.",
      "enemy-behavior":
        "Focus on clear threat roles and readable pressure instead of large enemy rosters."
    }
  },
  platformer: {
    id: "platformer",
    kind: "preset",
    label: "Platformer",
    description:
      "Built for traversal feel, readable hazards, checkpoint rhythm, and compact challenge-driven content.",
    genreLabel: "Platformer",
    defaultProject: {
      genre: "Platformer",
      subgenre: "Action Platformer",
      scopeCategory: "small",
      platformTargets: ["pc", "web", "switch"],
      agentTargets: ["codex", "cursor"],
      targetPlatforms: ["codex", "cursor"],
      targetAudience: "Players who want precise movement, readable challenge, and fast retries.",
      sessionLength: "10-20 minutes",
      monetizationModel: "Premium",
      comparableGames: ["Celeste", "Super Meat Boy", "Pizza Tower"],
      enginePreference: "",
      techStack: []
    },
    defaultDoc: {
      concept: {
        ...createBaseConcept("small", ["pc", "web", "switch"]),
        genre: "Platformer",
        subgenre: "Action Platformer",
        playerFantasy: "Master movement lines and recover from near-miss mistakes with confidence.",
        targetAudience: "Players who want crisp traversal and readable challenge.",
        sessionLength: "10-20 minutes",
        monetizationModel: "Premium",
        comparableGames: ["Celeste", "Super Meat Boy", "Pizza Tower"],
        scopeCategory: "small",
        differentiators:
          "Strong jump feel, readable hazard language, and compact checkpointed challenge spaces."
      },
      designPillars: {
        pillars: [
          "Movement must feel trustworthy before content variety expands.",
          "Hazards and jump asks must read clearly before the player commits.",
          "Failure should reset quickly and teach the next attempt."
        ],
        feelStatement:
          "Precise, readable, and momentum-friendly without turning every challenge into chaos.",
        antiGoals: [
          "Never hide critical timing behind unclear VFX or camera framing.",
          "Never make reset friction worse than the challenge itself.",
          "Never add systems that distract from traversal mastery."
        ],
        emotionalTargets: ["Flow", "determination", "mastery", "relief"],
        readabilityPrinciples:
          "Landing zones, hazards, interactables, and timing windows should be readable within one glance."
      },
      coreLoop: {
        secondToSecond:
          "Read the next jump, move, commit, correct, recover, and reach the next safe rhythm point.",
        minuteToMinute:
          "Clear challenge rooms, learn obstacle patterns, hit checkpoints, and shave mistakes from each attempt.",
        sessionLoop:
          "Push through a chapter or challenge set, unlock the next zone, and replay to improve execution.",
        longTermProgression:
          "Open new routes, difficulty remix content, cosmetic rewards, or advanced movement challenges.",
        failureStates:
          "Missed jumps, hazard collisions, movement panic, or resource depletion in challenge variants.",
        rewardCadence:
          "Frequent checkpoint relief, clean-room clears, and chapter-level completion rewards."
      },
      controlsFeel: {
        controlScheme:
          "Direct movement, jump, and one support verb tuned around precision and quick resets.",
        cameraRules:
          "Camera frames landing zones and hazard reads without obscuring timing or overreacting to speed.",
        movementPhilosophy:
          "Every jump should communicate trust, commitment, and recoverability.",
        combatFeelGoals:
          "If combat exists, it should support movement rhythm instead of dominating it.",
        responsivenessStandards:
          "Movement should confirm immediately with stable acceleration, jump timing, and coyote/buffer support where appropriate.",
        platformInputNotes:
          "Controller and keyboard should both support reliable directional precision and restart speed.",
        accessibilityConsiderations:
          "High-contrast hazards, assist toggles for forgiveness, and reduced camera motion options."
      },
      contentBible: {
        playerVerbs: "Run, jump, wall interact, dash or support move, recover, restart.",
        enemies: "Simple mobile hazards, patrolling threats, projectile interrupters, and timing disruptors.",
        weaponsAbilities: "Movement verbs first, with light support abilities only if they reinforce traversal.",
        encounters: "Short challenge rooms, pursuit beats, alternating precision and speed sections.",
        levelsMissions: "Compact chapters or worlds with readable themes and checkpoint cadence.",
        bossesSpecialEvents:
          "Movement tests, chase sequences, or multi-stage obstacle finales rather than stat walls.",
        pickupsRewards: "Checkpoint flags, collectibles, movement unlocks, route markers, and cosmetic rewards.",
        uiHudElements: "Timer, collectible count, checkpoint state, support ability readouts, and restart affordances."
      },
      artTone: {
        artDirection:
          "Readable silhouettes, strong surface contrast, and clear motion arcs that support jump timing.",
        toneKeywords: ["Precise", "clean", "kinetic", "readable"],
        visualReferences: ["Celeste room readability", "arcade platformer silhouette clarity"],
        negativeReferences: ["muddy backgrounds", "overdetailed hazard silhouettes", "floaty unclear jumps"],
        animationStyle:
          "Snappy anticipation and follow-through that help the player read movement timing.",
        vfxDirection:
          "Short, supportive feedback that highlights movement success and failure without hiding hazards.",
        audioMusicDirection:
          "Rhythmic movement cues, clean failure stingers, and music that supports retry momentum."
      },
      technicalDesign: {
        engine: "",
        renderingConstraints:
          "Prioritize stable input feel, clean motion arcs, and readable hazard contrast over heavy effects.",
        targetFramerate: "60 FPS on target platforms",
        memoryPerformanceBudget:
          "Reusable hazard kits, modular room chunks, and restrained presentation layering.",
        saveSystem:
          "Checkpoint progression, assist settings, collectibles, and lightweight chapter completion data.",
        contentPipeline:
          "Author challenge rooms, checkpoint data, hazards, and movement tuning from lightweight scene data.",
        namingConventions:
          "Name rooms, hazards, checkpoints, and movement set pieces by chapter and purpose.",
        folderStructure:
          "Separate movement systems, hazards, rooms, checkpoints, UI, and collectible content.",
        platformConstraints:
          "Input latency and readability matter more than visual complexity on every target platform."
      }
    },
    stageFocus: {
      "first-playable":
        "Ship one compact traversal slice with checkpointing, readable hazards, and a complete fail-restart loop before broadening content.",
      "camera-movement":
        "Prioritize jump feel, camera framing of landing zones, and hazard readability during movement.",
      "content-slice":
        "Use one short chapter or challenge set to prove checkpoint cadence, movement mastery, and retry flow."
    }
  },
  "twin-stick-shooter": {
    id: "twin-stick-shooter",
    kind: "preset",
    label: "Twin-Stick Shooter",
    description:
      "Built for arena readability, crowd control pressure, and replayable combat loops with upgrade-driven variation.",
    genreLabel: "Twin-Stick Shooter",
    defaultProject: {
      genre: "Action",
      subgenre: "Twin-Stick Shooter",
      scopeCategory: "small",
      platformTargets: ["pc", "web", "console"],
      agentTargets: ["codex", "cursor", "claude-code"],
      targetPlatforms: ["codex", "cursor", "claude-code"],
      targetAudience: "Players who want readable arena pressure, strong weapon feel, and quick replay loops.",
      sessionLength: "10-20 minutes",
      monetizationModel: "Premium",
      comparableGames: ["Geometry Wars", "Enter the Gungeon", "Nex Machina"],
      enginePreference: "",
      techStack: []
    },
    defaultDoc: {
      concept: {
        ...createBaseConcept("small", ["pc", "web", "console"]),
        genre: "Action",
        subgenre: "Twin-Stick Shooter",
        playerFantasy: "Stay alive under pressure by controlling space, reading threats, and cashing in aggressive plays.",
        targetAudience:
          "Players who want high-mobility combat and readable crowd-management decisions.",
        sessionLength: "10-20 minutes",
        monetizationModel: "Premium",
        comparableGames: ["Geometry Wars", "Enter the Gungeon", "Nex Machina"],
        scopeCategory: "small",
        differentiators:
          "Arena clarity first, crisp weapon feel, and upgrade choices that amplify crowd-control decisions."
      },
      designPillars: {
        pillars: [
          "The player must always understand where the safe space is collapsing.",
          "Weapons should change decision-making, not just numbers.",
          "Arena pressure should escalate cleanly instead of becoming noisy."
        ],
        feelStatement:
          "Fast, crisp, and pressure-heavy with readable enemy swarms and strong weapon identity.",
        antiGoals: [
          "Never bury danger in unreadable bullet clutter.",
          "Never let upgrades invalidate core positioning decisions.",
          "Never let arenas devolve into repetitive empty circles."
        ],
        emotionalTargets: ["Pressure", "clarity", "relief", "power"],
        readabilityPrinciples:
          "Enemy silhouettes, projectile lanes, pickups, and safe routes should be readable during full-speed play."
      },
      coreLoop: {
        secondToSecond:
          "Move, aim, kite, burst priority threats, gather drops, and reposition before the arena collapses.",
        minuteToMinute:
          "Clear escalating waves, pick upgrades, adapt to enemy mixes, and recover from pressure spikes.",
        sessionLoop:
          "Run an arena route, chase cleaner clears, unlock modifiers, and replay with sharper builds.",
        longTermProgression:
          "Unlock weapons, upgrade modifiers, arena variants, and score or survival milestones.",
        failureStates:
          "Overrun positioning, unread projectile overlap, or poor upgrade decisions under pressure.",
        rewardCadence:
          "Frequent combat feedback, arena clear relief, upgrade picks, and run-end progression rewards."
      },
      controlsFeel: {
        controlScheme:
          "Move with one stick or WASD, aim independently, fire instantly, and trigger one or two specials.",
        cameraRules:
          "Keep the entire arena readable with stable framing and enough edge space to read incoming threats.",
        movementPhilosophy:
          "Movement should support aggressive space control, not hesitant stutter play.",
        combatFeelGoals:
          "Weapons must feel immediate, readable, and distinct while keeping the arena state legible.",
        responsivenessStandards:
          "Aim, dodge, and fire feedback should register immediately with clear hit and damage confirmation.",
        platformInputNotes:
          "Controller and mouse/keyboard should both support clean independent aim without input friction.",
        accessibilityConsiderations:
          "Projectile contrast options, aim assist tuning, and reduced screen shake or flash intensity."
      },
      contentBible: {
        playerVerbs: "Move, aim, fire, dodge, trigger special, collect drops, choose upgrades.",
        enemies:
          "Rushers, zoning shooters, shield carriers, area-denial threats, and burst elites.",
        weaponsAbilities:
          "Primary weapons, crowd-clear specials, movement escape tools, and build-shaping upgrades.",
        encounters: "Escalating arena waves, elite injections, hazard overlays, and pickup timing decisions.",
        levelsMissions: "Compact arena sets or biomes with one strong combat identity each.",
        bossesSpecialEvents:
          "Arena bosses that change movement lanes, pressure timing, or safe-space control.",
        pickupsRewards: "Health, ammo or heat relief, score drops, temporary buffs, and upgrade choices.",
        uiHudElements:
          "Health, cooldowns, weapon state, minimap or edge threat indicators, and upgrade choices."
      },
      artTone: {
        artDirection:
          "High-contrast arenas, strong projectile language, and enemy silhouettes built for crowd readability.",
        toneKeywords: ["Arcade", "intense", "clean contrast", "reactive"],
        visualReferences: ["Geometry Wars contrast", "arena readability in modern twin-stick shooters"],
        negativeReferences: ["muddy particles", "indistinct enemy colors", "screen-filling clutter"],
        animationStyle:
          "Rapid, readable anticipation for threats and clear weapon feedback with little visual waste.",
        vfxDirection:
          "Projectile and impact effects should be readable from peripheral vision without flooding the screen.",
        audioMusicDirection:
          "Aggressive rhythm-driven combat cues with clean pickup, damage, and arena-clear feedback."
      },
      technicalDesign: {
        engine: "",
        renderingConstraints:
          "Prioritize projectile clarity, enemy contrast, and frame stability during high-density combat.",
        targetFramerate: "60 FPS on target platforms",
        memoryPerformanceBudget:
          "Reusable enemy waves, pooled projectile effects, and constrained arena variants.",
        saveSystem:
          "Run history, unlocks, settings, and lightweight progression or leaderboard data.",
        contentPipeline:
          "Author waves, arena data, pickups, and upgrade tables through reusable combat data assets.",
        namingConventions:
          "Name waves, enemy roles, pickups, and arenas by biome and combat function.",
        folderStructure:
          "Separate combat systems, enemy roles, wave definitions, upgrades, arenas, and UI.",
        platformConstraints:
          "Maintain clear aim readability and projectile legibility on every supported display."
      }
    },
    stageFocus: {
      "first-playable":
        "Ship one arena with a complete survive-to-clear loop, pickup cadence, and readable enemy mix before widening content.",
      "enemy-behavior":
        "Prioritize threat role contrast, crowd-control pressure, and readable projectile patterns in the arena.",
      "hud-feedback":
        "Make health, cooldowns, pickup windows, and damage feedback readable during peak combat density."
    }
  },
  "survival-horror-lite": {
    id: "survival-horror-lite",
    kind: "preset",
    label: "Survival Horror",
    description:
      "Built for compact tension, resource pressure, route planning, and safe-room pacing without ballooning into a giant campaign.",
    genreLabel: "Survival Horror",
    defaultProject: {
      genre: "Horror",
      subgenre: "Survival Horror",
      scopeCategory: "small",
      platformTargets: ["pc", "console"],
      agentTargets: ["codex", "claude-code", "cursor"],
      targetPlatforms: ["codex", "claude-code", "cursor"],
      targetAudience: "Players who want tense exploration, scarce resources, and readable dread.",
      sessionLength: "20-40 minutes",
      monetizationModel: "Premium",
      comparableGames: ["Signalis", "Crow Country", "Resident Evil"],
      enginePreference: "",
      techStack: []
    },
    defaultDoc: {
      concept: {
        ...createBaseConcept("small", ["pc", "console"]),
        genre: "Horror",
        subgenre: "Survival Horror",
        playerFantasy: "Stay alive through caution, route planning, and tense resource tradeoffs.",
        targetAudience:
          "Players who want oppressive atmosphere, meaningful scarcity, and compact horror runs.",
        sessionLength: "20-40 minutes",
        monetizationModel: "Premium",
        comparableGames: ["Signalis", "Crow Country", "Resident Evil"],
        scopeCategory: "small",
        differentiators:
          "Small-scope horror built around tension, clear threat reads, and safe-room pacing instead of giant content breadth."
      },
      designPillars: {
        pillars: [
          "Tension should come from meaningful decisions, not cheap confusion.",
          "Scarcity must feel oppressive but fair.",
          "Every room should reinforce route-planning clarity."
        ],
        feelStatement:
          "Tense, deliberate, and atmospheric with scarce resources and clean threat readability.",
        antiGoals: [
          "Never rely on arbitrary instant-fail jump scares.",
          "Never hide progression in unreadable puzzle logic.",
          "Never expand into bloated campaign sprawl."
        ],
        emotionalTargets: ["Dread", "relief", "caution", "resolve"],
        readabilityPrinciples:
          "Interactive routes, item value, and threat states must remain legible even under low-light presentation."
      },
      coreLoop: {
        secondToSecond:
          "Scan, listen, move carefully, decide whether to spend or save resources, and secure the next safe route.",
        minuteToMinute:
          "Explore connected spaces, solve compact progression gates, preserve supplies, and return to safety.",
        sessionLoop:
          "Advance through a short chapter, unlock new routes, consolidate resources, and survive the next push.",
        longTermProgression:
          "Open new areas, improve preparedness, and reveal narrative or system twists without multiplying content families.",
        failureStates:
          "Resource starvation, route misreads, panic under pressure, or repeated damage without recovery.",
        rewardCadence:
          "Sparse but meaningful relief from safe rooms, key items, solved locks, and successful escapes."
      },
      controlsFeel: {
        controlScheme:
          "Direct movement, cautious interaction, limited combat, and deliberate inventory or utility access.",
        cameraRules:
          "Camera should create tension while keeping routes, threats, and interactables understandable.",
        movementPhilosophy:
          "Movement should reinforce vulnerability and deliberation without feeling sluggish.",
        combatFeelGoals:
          "Combat is a costly decision, not the default expression of power.",
        responsivenessStandards:
          "Interactions and defensive actions should feel reliable even when the character is under pressure.",
        platformInputNotes:
          "Controller-first readability with clear interaction prompts and no tiny UI dependencies.",
        accessibilityConsiderations:
          "Subtitle-safe UI, brightness and contrast aids, and low-flash alternatives for horror effects."
      },
      contentBible: {
        playerVerbs: "Move, inspect, conserve, unlock, evade, fight sparingly, retreat to safety.",
        enemies:
          "Persistent stalkers, corridor blockers, burst threats, and slow attrition enemies with readable tells.",
        weaponsAbilities:
          "Sparse defensive tools, limited firearms, healing items, and route-opening utilities.",
        encounters:
          "Room-to-room tension beats, resource drain decisions, soft chase pressure, and safe-room release valves.",
        levelsMissions:
          "Compact connected environments with lock-and-key loops and strong room identity.",
        bossesSpecialEvents:
          "Short escalation events, escape sequences, or resource-draining mini-boss confrontations.",
        pickupsRewards: "Ammo, healing, keys, notes, inventory expansions, and safe-room unlocks.",
        uiHudElements:
          "Minimal health state, inventory status, objective cues, map clarity, and interaction prompts."
      },
      artTone: {
        artDirection:
          "Oppressive atmosphere with clean interactable contrast and silhouettes that stay readable in low light.",
        toneKeywords: ["Tense", "claustrophobic", "deliberate", "oppressive"],
        visualReferences: ["Signalis readability", "retro-modern survival horror framing"],
        negativeReferences: ["overly muddy darkness", "cheap shock clutter", "overly busy inventory UI"],
        animationStyle:
          "Measured movement, readable threat anticipation, and sparing but impactful horror accents.",
        vfxDirection:
          "Low-frequency, high-impact effects that reinforce stress without obscuring space or routes.",
        audioMusicDirection:
          "Sparse ambience, anxiety-building stingers, and strong safe-room relief cues."
      },
      technicalDesign: {
        engine: "",
        renderingConstraints:
          "Preserve room readability, interactable contrast, and stable tension pacing over aggressive post-processing.",
        targetFramerate: "60 FPS on target platforms",
        memoryPerformanceBudget:
          "Compact room sets, reusable threat variants, and restrained cinematic overhead.",
        saveSystem:
          "Checkpoint or safe-room saves, settings persistence, inventory state, and chapter progression.",
        contentPipeline:
          "Author rooms, locks, item placement, threat states, and safe-room progression through lightweight data structures.",
        namingConventions:
          "Name rooms, locks, keys, and encounter states by zone and progression purpose.",
        folderStructure:
          "Separate rooms, interactables, threats, narrative notes, UI, and save-state logic.",
        platformConstraints:
          "Low-light presentation must stay readable on televisions and standard PC displays."
      }
    },
    stageFocus: {
      "first-playable":
        "Ship one tense exploration loop with scarcity, one safe-room cycle, and a complete fail-recover path before broadening the map.",
      "encounter-scripting":
        "Prioritize tension curves, safe-room pacing, route planning, and threat placement over raw encounter count.",
      "hud-feedback":
        "Keep inventory state, health pressure, interaction prompts, and navigation cues readable under low-light presentation."
    }
  },
  "tactics-lite": {
    id: "tactics-lite",
    kind: "preset",
    label: "Tactics",
    description:
      "Built for readable turn decisions, compact mission structure, and a deliberately small tactical roster.",
    genreLabel: "Tactics",
    defaultProject: {
      genre: "Strategy",
      subgenre: "Tactics",
      scopeCategory: "medium",
      platformTargets: ["pc", "switch"],
      agentTargets: ["codex", "cursor", "claude-code"],
      targetPlatforms: ["codex", "cursor", "claude-code"],
      targetAudience: "Players who want tactical clarity, compact missions, and meaningful unit choices.",
      sessionLength: "20-40 minutes",
      monetizationModel: "Premium",
      comparableGames: ["Into the Breach", "SteamWorld Heist", "Mario + Rabbids"],
      enginePreference: "",
      techStack: []
    },
    defaultDoc: {
      concept: {
        ...createBaseConcept("medium", ["pc", "switch"]),
        genre: "Strategy",
        subgenre: "Tactics",
        playerFantasy: "Solve hostile board states by reading enemy intent and committing to efficient tactical trades.",
        targetAudience:
          "Players who want a compact tactics game with clear enemy intent and manageable roster complexity.",
        sessionLength: "20-40 minutes",
        monetizationModel: "Premium",
        comparableGames: ["Into the Breach", "SteamWorld Heist", "Mario + Rabbids"],
        scopeCategory: "medium",
        differentiators:
          "Readable intent, small squad counts, and short mission structures that respect production limits."
      },
      designPillars: {
        pillars: [
          "Enemy intent must be readable before the player commits.",
          "Every unit ability should create distinct positional decisions.",
          "Mission scope must stay compact enough to tune well."
        ],
        feelStatement:
          "Readable, tense, and deliberate with satisfying turn-to-turn clarity instead of rules bloat.",
        antiGoals: [
          "Never bury decisions under giant rosters or opaque math.",
          "Never make a mission longer than its tactical idea can sustain.",
          "Never require sprawling narrative systems to justify the tactics."
        ],
        emotionalTargets: ["Control", "tension", "foresight", "satisfaction"],
        readabilityPrinciples:
          "Enemy intent, movement ranges, line of fire, and objective priority must be readable on every turn."
      },
      coreLoop: {
        secondToSecond:
          "Read intent, evaluate board state, sequence actions, commit, and learn from the enemy response.",
        minuteToMinute:
          "Advance through compact missions, adapt to new tactical wrinkles, and preserve squad strength.",
        sessionLoop:
          "Complete one mission set, improve the roster lightly, and move into the next tactical problem.",
        longTermProgression:
          "Unlock small squad expansions, ability variants, and mission modifiers without overwhelming tuning scope.",
        failureStates:
          "Mission objective collapse, attrition mismanagement, or unreadable tactical overextension.",
        rewardCadence:
          "Strong turn-resolution feedback, mission-clear relief, and lightweight roster progression rewards."
      },
      controlsFeel: {
        controlScheme:
          "Direct tile or position selection, fast preview tools, and minimal menu friction.",
        cameraRules:
          "Camera should favor tactical readability, intent preview, and objective clarity over cinematic motion.",
        movementPhilosophy:
          "Every movement option should communicate risk, reward, and positional consequence.",
        combatFeelGoals:
          "Turn resolution should feel decisive and legible without dragging out animations.",
        responsivenessStandards:
          "Selections, previews, and confirmations should be immediate and undo-friendly where possible.",
        platformInputNotes:
          "Mouse and controller navigation both need clear focus states and rapid intent inspection.",
        accessibilityConsiderations:
          "Readable grid overlays, color-safe intent markers, and scalable tactical UI density."
      },
      contentBible: {
        playerVerbs: "Move, flank, defend, reposition, deploy abilities, secure objectives, recover.",
        enemies:
          "Readable role-based enemies with clear intent markers and a compact roster size.",
        weaponsAbilities:
          "Small squad ability set with strong positional identity and low overlap.",
        encounters:
          "Short tactical maps with one or two mission twists instead of broad campaign complexity.",
        levelsMissions:
          "Compact mission nodes with strong objectives and limited supporting systems.",
        bossesSpecialEvents:
          "Commander encounters or map-rule events that pressure sequencing and objective control.",
        pickupsRewards:
          "Mission rewards, light progression choices, consumables, and tactical modifiers.",
        uiHudElements:
          "Intent markers, move ranges, action order, objective states, and quick unit summaries."
      },
      artTone: {
        artDirection:
          "Readable tactical silhouettes, clean board-state contrast, and restrained presentation noise.",
        toneKeywords: ["Deliberate", "readable", "strategic", "compact"],
        visualReferences: ["Into the Breach clarity", "board-game style intent readability"],
        negativeReferences: ["opaque VFX-heavy tactics", "tiny unreadable UI", "roster clutter"],
        animationStyle:
          "Decisive, efficient action resolution that preserves tactical scan speed.",
        vfxDirection:
          "Sparse, readable impact effects that clarify outcomes instead of distracting from the board.",
        audioMusicDirection:
          "Measured tactical cues, clean confirmation sounds, and restrained escalation music."
      },
      technicalDesign: {
        engine: "",
        renderingConstraints:
          "Prioritize tactical readability, intent overlays, and quick board-state comprehension.",
        targetFramerate: "60 FPS on target platforms",
        memoryPerformanceBudget:
          "Compact unit roster, reusable mission tiles, and restrained cinematic overhead.",
        saveSystem:
          "Mission progression, roster state, settings, and lightweight mid-run persistence where needed.",
        contentPipeline:
          "Author unit data, mission rules, map layouts, and AI intent tables through structured data.",
        namingConventions:
          "Name units, abilities, missions, and objective states by role and tactical function.",
        folderStructure:
          "Separate combat rules, unit data, mission content, AI intent logic, and tactical UI.",
        platformConstraints:
          "Readable text and intent overlays must survive handheld and couch-play display conditions."
      }
    },
    stageFocus: {
      "first-playable":
        "Ship one short tactical mission with clear enemy intent, objective resolution, and a complete turn loop before adding roster breadth.",
      "enemy-behavior":
        "Prioritize readable enemy intent, compact roster roles, and predictable tactical pressure.",
      "progression-meta":
        "Keep roster growth compact and meaningful so mission tuning stays manageable."
    }
  },
  "strategy-lite": {
    id: "strategy-lite",
    kind: "preset",
    label: "Strategy",
    description:
      "Internal recommendation profile for compact system-driven strategy projects with readable decisions and bounded content scope.",
    genreLabel: "Strategy",
    defaultProject: {
      genre: "Strategy",
      subgenre: "Strategy",
      scopeCategory: "medium",
      platformTargets: ["pc", "web", "switch"],
      agentTargets: ["codex", "cursor", "claude-code"],
      targetPlatforms: ["codex", "cursor", "claude-code"],
      targetAudience:
        "Players who want readable strategy, compact systems depth, and repeatable decision loops.",
      sessionLength: "20-40 minutes",
      monetizationModel: "Premium",
      comparableGames: ["Into the Breach", "Luck be a Landlord", "Mini Motorways"],
      enginePreference: "",
      techStack: []
    },
    defaultDoc: {
      concept: {
        ...createBaseConcept("medium", ["pc", "web", "switch"]),
        genre: "Strategy",
        subgenre: "Strategy",
        playerFantasy:
          "Solve pressure through foresight, small-scope systems mastery, and clean strategic tradeoffs.",
        targetAudience:
          "Players who want readable strategy systems and compact but meaningful decision depth.",
        sessionLength: "20-40 minutes",
        monetizationModel: "Premium",
        comparableGames: ["Into the Breach", "Luck be a Landlord", "Mini Motorways"],
        scopeCategory: "medium",
        differentiators:
          "Strategy-first readability with bounded content, compact system loops, and clear player ownership of outcomes."
      },
      designPillars: {
        pillars: [
          "Core decisions must stay readable under pressure.",
          "Systems depth should come from interaction quality, not sheer quantity.",
          "Production scope should stay small enough to tune cleanly."
        ],
        feelStatement:
          "Clear, deliberate, and systemically satisfying without sprawling into management bloat.",
        antiGoals: [
          "Never bury decisions under unreadable rule stacks.",
          "Never explode content breadth beyond what can be balanced well.",
          "Never make the player fight the interface to understand state."
        ],
        emotionalTargets: ["Control", "foresight", "tension", "satisfaction"],
        readabilityPrinciples:
          "Threat state, resource state, and next-best options should remain legible in one scan."
      },
      coreLoop: {
        secondToSecond:
          "Read the current state, commit to one strong decision, and watch the system respond clearly.",
        minuteToMinute:
          "Stabilize pressure, optimize a small strategic engine, and adapt to the next escalation.",
        sessionLoop:
          "Run one compact strategic scenario, unlock light variation, and replay with sharper decisions.",
        longTermProgression:
          "Unlock small strategic modifiers, new scenario twists, and deeper but bounded mastery goals.",
        failureStates:
          "State collapse from poor prioritization, opaque risk management, or overextended system complexity.",
        rewardCadence:
          "Frequent tactical feedback with stronger scenario-clear or run-complete payoff."
      },
      controlsFeel: {
        controlScheme:
          "Direct selection, clear previews, and low-friction controls that support quick strategic decisions.",
        cameraRules:
          "Camera and UI should prioritize board or state readability over decorative movement.",
        movementPhilosophy:
          "Any movement or placement decision should communicate consequence before commitment.",
        combatFeelGoals:
          "If combat exists, it should resolve clearly and support strategy readability instead of overpowering it.",
        responsivenessStandards:
          "Selections, previews, and confirmations should feel immediate and low-risk to inspect.",
        platformInputNotes:
          "Mouse and controller input both need strong focus states, quick inspection, and readable overlays.",
        accessibilityConsiderations:
          "Readable data layers, color-safe state markers, and scalable UI density for long sessions."
      },
      contentBible: {
        playerVerbs: "Inspect, place, commit, optimize, reroute, defend, and recover.",
        enemies:
          "Pressure systems, timed threats, or role-based opponents that create readable strategic choices.",
        weaponsAbilities:
          "Compact upgrade, placement, or card-like verbs with clear interaction value.",
        encounters:
          "Short strategic scenarios, escalation events, and replayable combinations of known rules.",
        levelsMissions:
          "Compact maps, challenge sets, or runs built around one strong strategic hook each.",
        bossesSpecialEvents:
          "Capstone scenarios that test system understanding and prioritization clarity.",
        pickupsRewards:
          "Upgrade choices, strategic modifiers, scenario unlocks, and mastery milestones.",
        uiHudElements:
          "Resource state, threat previews, objective or survival status, and quick-inspection affordances."
      },
      artTone: {
        artDirection:
          "Readable state language, clean system visualization, and low-noise presentation that supports decision-making.",
        toneKeywords: ["Readable", "deliberate", "systemic", "controlled"],
        visualReferences: ["clean strategy UI", "compact systemic readability"],
        negativeReferences: ["spreadsheet clutter", "opaque overlays", "overdecorated state presentation"],
        animationStyle:
          "Fast, readable transitions that clarify system response and decision results.",
        vfxDirection:
          "Restrained, information-first feedback that never obscures critical state.",
        audioMusicDirection:
          "Measured feedback and pacing cues that support concentration and escalation."
      },
      technicalDesign: {
        engine: "",
        renderingConstraints:
          "Prioritize UI readability, state clarity, and stable simulation response over visual spectacle.",
        targetFramerate: "60 FPS on target platforms",
        memoryPerformanceBudget:
          "Compact scenario sets, reusable system modules, and minimal presentation overhead.",
        saveSystem:
          "Scenario progress, settings, unlocks, and lightweight run-state persistence where needed.",
        contentPipeline:
          "Author scenarios, upgrades, rules, and progression modifiers through structured, reusable data.",
        namingConventions:
          "Name rules, upgrades, scenarios, and pressure systems by purpose and player-facing meaning.",
        folderStructure:
          "Separate rules, scenarios, progression, UI, and content definitions for clean iteration.",
        platformConstraints:
          "Maintain readable state presentation on desktop and couch-distance displays."
      }
    },
    stageFocus: {
      "first-playable":
        "Ship one compact strategic scenario with a complete decision-to-outcome loop before expanding system breadth.",
      "progression-meta":
        "Keep unlocks and modifiers bounded so tuning remains manageable.",
      "content-slice":
        "Use one tight scenario set to prove that the strategic loop is readable and worth repeating."
    }
  },
  "puzzle-action": {
    id: "puzzle-action",
    kind: "preset",
    label: "Puzzle-Action",
    description:
      "Built for teach-test-twist structure, clean rule clarity, and short session loops that reward elegant solutions.",
    genreLabel: "Puzzle-Action",
    defaultProject: {
      genre: "Puzzle",
      subgenre: "Puzzle-Action",
      scopeCategory: "small",
      platformTargets: ["ios", "web", "pc"],
      agentTargets: ["codex", "cursor"],
      targetPlatforms: ["codex", "cursor"],
      targetAudience: "Players who want clear rules, quick sessions, and satisfying action-driven puzzle solves.",
      sessionLength: "3-10 minutes",
      monetizationModel: "Premium",
      comparableGames: ["Lara Croft GO", "Monument Valley", "Baba Is You"],
      enginePreference: "",
      techStack: []
    },
    defaultDoc: {
      concept: {
        ...createBaseConcept("small", ["ios", "web", "pc"]),
        genre: "Puzzle",
        subgenre: "Puzzle-Action",
        playerFantasy: "Read a compact ruleset quickly, act decisively, and solve escalating scenario twists.",
        targetAudience:
          "Players who want elegant rules, readable spaces, and short action-puzzle sessions.",
        sessionLength: "3-10 minutes",
        monetizationModel: "Premium",
        comparableGames: ["Lara Croft GO", "Monument Valley", "Baba Is You"],
        scopeCategory: "small",
        differentiators:
          "Teach-test-twist puzzle cadence with just enough action pressure to keep solves dynamic."
      },
      designPillars: {
        pillars: [
          "Rules must be readable before challenge ramps up.",
          "Every twist should build on known logic instead of replacing it.",
          "Action pressure should sharpen the puzzle, not obscure it."
        ],
        feelStatement:
          "Clean, clever, and brisk with readable rule interactions and quick reset energy.",
        antiGoals: [
          "Never rely on hidden rule exceptions.",
          "Never let time pressure erase puzzle readability.",
          "Never sprawl into content volume that weakens the twist cadence."
        ],
        emotionalTargets: ["Clarity", "curiosity", "satisfaction", "momentum"],
        readabilityPrinciples:
          "Interactive rules, hazards, and solution states must be legible at a glance on small screens."
      },
      coreLoop: {
        secondToSecond:
          "Read the board, test a move, trigger the rule interaction, and adjust quickly when the twist appears.",
        minuteToMinute:
          "Solve a sequence of compact scenarios, absorb one new wrinkle, and move into a harder remix.",
        sessionLoop:
          "Clear a short puzzle batch, unlock the next mechanic remix, and replay for cleaner solutions.",
        longTermProgression:
          "Introduce a limited set of rules, remix them through curated scenarios, and unlock optional challenge modifiers.",
        failureStates:
          "Misread rules, trap the board state, or lose to time or action pressure in advanced scenarios.",
        rewardCadence:
          "Frequent solve payoff, short progression unlocks, and optional mastery rewards for cleaner clears."
      },
      controlsFeel: {
        controlScheme:
          "Tap or click interactions with minimal friction, instant rule feedback, and fast reset affordances.",
        cameraRules:
          "Keep the active puzzle space fully readable with zero wasted motion or hidden board state.",
        movementPhilosophy:
          "Any movement or action pressure should support puzzle readability and not compete with it.",
        combatFeelGoals:
          "If direct action exists, it should be simple, crisp, and subordinate to the puzzle rules.",
        responsivenessStandards:
          "Every interaction should confirm immediately with clear rule-state feedback.",
        platformInputNotes:
          "Touch-first readability with large interaction targets and no dependence on hover-only cues.",
        accessibilityConsiderations:
          "Color-safe rule markers, undo or reset clarity, and readable mobile-scale UI."
      },
      contentBible: {
        playerVerbs: "Inspect, move, trigger, rotate, swap, reset, and resolve rule interactions.",
        enemies:
          "Simple pressure agents, blockers, timers, or hazards that reinforce the puzzle rules.",
        weaponsAbilities:
          "Utility actions and rule-changing verbs rather than complex combat kits.",
        encounters:
          "Compact puzzle rooms, escalating remixes, timed variants, and clean teach-test-twist sequences.",
        levelsMissions:
          "Short puzzle sets grouped by mechanic family and escalation pattern.",
        bossesSpecialEvents:
          "Capstone puzzles or action-pressure finales that remix multiple known rules.",
        pickupsRewards:
          "Unlock keys, optional collectibles, hint currency, and mastery ratings.",
        uiHudElements:
          "Rule reminders, reset/undo state, objective cues, and minimal action-pressure indicators."
      },
      artTone: {
        artDirection:
          "Readable shapes, strong color-coded rule language, and low-noise spaces that support quick comprehension.",
        toneKeywords: ["Clean", "smart", "playful tension", "readable"],
        visualReferences: ["Monument Valley composition", "mobile puzzle readability"],
        negativeReferences: ["rule clutter", "tiny touch targets", "busy decorative noise"],
        animationStyle:
          "Clear state changes and elegant transitions that teach the rule interaction.",
        vfxDirection:
          "Minimal, high-clarity effects that highlight rule changes and successful solves.",
        audioMusicDirection:
          "Light rhythmic feedback, satisfying solve cues, and restrained pressure escalation."
      },
      technicalDesign: {
        engine: "",
        renderingConstraints:
          "Prioritize rule readability, touch-safe layout, and responsive interaction feedback.",
        targetFramerate: "60 FPS on target platforms",
        memoryPerformanceBudget:
          "Reusable puzzle elements, compact rule sets, and low-overhead presentation.",
        saveSystem:
          "Level progression, mastery ratings, hint or assist settings, and lightweight unlock tracking.",
        contentPipeline:
          "Author puzzle states, rule data, and escalation sequences from compact level definitions.",
        namingConventions:
          "Name rules, puzzle states, blockers, and tutorial beats by mechanic family and purpose.",
        folderStructure:
          "Separate rules, puzzle content, UI, tutorial scaffolding, and feedback systems.",
        platformConstraints:
          "Touch-safe interaction targets and readable state language are mandatory on mobile-class displays."
      }
    },
    stageFocus: {
      "first-playable":
        "Ship one teach-test-twist puzzle batch with full reset clarity and one strong rule interaction before adding more mechanics.",
      "hud-feedback":
        "Prioritize rule-state clarity, touch-safe interaction feedback, and obvious reset or undo affordances.",
      "content-slice":
        "Use one compact mechanic family to prove teach-test-twist pacing and action pressure readability."
    }
  },
  "adventure-lite": {
    id: "adventure-lite",
    kind: "preset",
    label: "Adventure",
    description:
      "Internal recommendation profile for compact exploration and narrative projects with readable progression and discovery.",
    genreLabel: "Adventure",
    defaultProject: {
      genre: "Adventure",
      subgenre: "Narrative Adventure",
      scopeCategory: "small",
      platformTargets: ["pc", "web", "switch"],
      agentTargets: ["codex", "cursor", "claude-code"],
      targetPlatforms: ["codex", "cursor", "claude-code"],
      targetAudience:
        "Players who want exploration, narrative momentum, and readable progression in compact sessions.",
      sessionLength: "20-40 minutes",
      monetizationModel: "Premium",
      comparableGames: ["Oxenfree", "A Short Hike", "Firewatch"],
      enginePreference: "",
      techStack: []
    },
    defaultDoc: {
      concept: {
        ...createBaseConcept("small", ["pc", "web", "switch"]),
        genre: "Adventure",
        subgenre: "Narrative Adventure",
        playerFantasy:
          "Uncover the next meaningful place, clue, or story beat through deliberate exploration.",
        targetAudience:
          "Players who want clear progression, atmosphere, and memorable small-scope exploration.",
        sessionLength: "20-40 minutes",
        monetizationModel: "Premium",
        comparableGames: ["Oxenfree", "A Short Hike", "Firewatch"],
        scopeCategory: "small",
        differentiators:
          "Compact spaces, clean progression logic, and strong scene-to-scene momentum over giant world scale."
      },
      designPillars: {
        pillars: [
          "Exploration must always reveal meaningful next-state information.",
          "Story or atmosphere should reinforce progression clarity instead of slowing it down.",
          "Spaces should be memorable without requiring giant content breadth."
        ],
        feelStatement:
          "Calm, focused, and discovery-driven with clear progression and strong sense-of-place.",
        antiGoals: [
          "Never hide progression in opaque adventure-game logic.",
          "Never sprawl into oversized maps that weaken authored pacing.",
          "Never let narrative density bury the playable loop."
        ],
        emotionalTargets: ["Curiosity", "presence", "relief", "discovery"],
        readabilityPrinciples:
          "Routes, interactables, and progression clues should stay readable without exhaustive re-scanning."
      },
      coreLoop: {
        secondToSecond:
          "Observe, move, interact, interpret the response, and choose the next place or clue to pursue.",
        minuteToMinute:
          "Advance through a compact environment, solve light progression gates, and reach the next meaningful reveal.",
        sessionLoop:
          "Complete one exploration or story slice, unlock the next chapter, and return for the next authored beat.",
        longTermProgression:
          "Open new paths, reveal story layers, and unlock small traversal or interaction extensions.",
        failureStates:
          "Progression confusion, pacing drag, or low-value exploration that weakens player momentum.",
        rewardCadence:
          "Frequent micro-discoveries with stronger payoff at chapter beats, reveals, or new-space unlocks."
      },
      controlsFeel: {
        controlScheme:
          "Low-friction movement and interaction tuned around readability, comfort, and scene pacing.",
        cameraRules:
          "Camera should frame space, characters, and routes clearly without fighting exploration.",
        movementPhilosophy:
          "Movement should support curiosity and presence, not friction or speed pressure.",
        combatFeelGoals:
          "If combat exists, it should be rare and subordinate to the exploration loop.",
        responsivenessStandards:
          "Interactions and traversal should respond cleanly without feeling over-tuned or twitchy.",
        platformInputNotes:
          "Controller and mouse input should both preserve comfortable navigation and clear interaction prompts.",
        accessibilityConsiderations:
          "Readable prompts, subtitle-safe pacing, contrast support, and low-motion camera options."
      },
      contentBible: {
        playerVerbs: "Explore, inspect, converse, collect, unlock, route, and interpret.",
        enemies:
          "Optional environmental pressure, light antagonists, or rare blockers that reinforce exploration stakes.",
        weaponsAbilities:
          "Light utility verbs, traversal helpers, or story-context actions rather than combat kits.",
        encounters:
          "Exploration beats, interaction clusters, route reveals, and authored scene transitions.",
        levelsMissions:
          "Compact environments or chapters with strong identity and readable progression arcs.",
        bossesSpecialEvents:
          "High-tension reveals, chase moments, or capstone interaction sequences rather than stat-based bosses.",
        pickupsRewards:
          "Story artifacts, route keys, traversal unlocks, optional discoveries, and chapter rewards.",
        uiHudElements:
          "Objective cues, interaction prompts, map or route clarity, dialogue state, and minimal progression reminders."
      },
      artTone: {
        artDirection:
          "Strong place-making, readable interactables, and composition that rewards curiosity without clutter.",
        toneKeywords: ["Atmospheric", "readable", "curious", "authored"],
        visualReferences: ["small-scale narrative exploration", "clear route framing"],
        negativeReferences: ["cluttered scene dressing", "opaque adventure item logic", "overbearing HUDs"],
        animationStyle:
          "Measured interactions and movement that support presence and readability.",
        vfxDirection:
          "Subtle guidance and scene punctuation rather than aggressive effect-heavy feedback.",
        audioMusicDirection:
          "Atmospheric cues, place-defining ambience, and restrained emotional escalation."
      },
      technicalDesign: {
        engine: "",
        renderingConstraints:
          "Prioritize legible spaces, stable scene transitions, and clean interaction feedback.",
        targetFramerate: "60 FPS on target platforms",
        memoryPerformanceBudget:
          "Compact authored spaces, reusable interaction systems, and restrained cinematic overhead.",
        saveSystem:
          "Chapter progress, settings, collectible state, and lightweight checkpoint persistence.",
        contentPipeline:
          "Author environments, interaction nodes, progression flags, and narrative beats through reusable data structures.",
        namingConventions:
          "Name scenes, interaction clusters, routes, and progression gates by chapter and purpose.",
        folderStructure:
          "Separate scenes, narrative content, interactions, progression flags, UI, and audio cues.",
        platformConstraints:
          "Exploration readability and subtitle-safe presentation should hold across desktop and handheld-class displays."
      }
    },
    stageFocus: {
      "first-playable":
        "Ship one compact exploration slice with clear progression, scene payoff, and a complete start-to-finish loop before broadening content.",
      "content-slice":
        "Use one tightly authored chapter or area to prove atmosphere, route clarity, and pacing.",
      "hud-feedback":
        "Keep interaction prompts, route guidance, and objective state readable without over-HUDing the screen."
    }
  },
  "rpg-lite": {
    id: "rpg-lite",
    kind: "preset",
    label: "RPG",
    description:
      "Internal recommendation profile for bounded character-growth projects with readable combat and progression systems.",
    genreLabel: "RPG",
    defaultProject: {
      genre: "RPG",
      subgenre: "Action RPG",
      scopeCategory: "medium",
      platformTargets: ["pc", "switch", "console"],
      agentTargets: ["codex", "cursor", "claude-code"],
      targetPlatforms: ["codex", "cursor", "claude-code"],
      targetAudience:
        "Players who want readable progression, character growth, and compact combat or encounter loops.",
      sessionLength: "20-40 minutes",
      monetizationModel: "Premium",
      comparableGames: ["CrossCode", "Sea of Stars", "Bastion"],
      enginePreference: "",
      techStack: []
    },
    defaultDoc: {
      concept: {
        ...createBaseConcept("medium", ["pc", "switch", "console"]),
        genre: "RPG",
        subgenre: "Action RPG",
        playerFantasy:
          "Grow a character through readable combat, meaningful upgrades, and compact quest or encounter arcs.",
        targetAudience:
          "Players who want progression and identity-building without a massive campaign footprint.",
        sessionLength: "20-40 minutes",
        monetizationModel: "Premium",
        comparableGames: ["CrossCode", "Sea of Stars", "Bastion"],
        scopeCategory: "medium",
        differentiators:
          "Compact progression systems, bounded content scope, and readable combat or encounter loops."
      },
      designPillars: {
        pillars: [
          "Progression should create clear identity, not spreadsheet sprawl.",
          "Combat and growth systems must stay readable together.",
          "Content volume should remain small enough to polish well."
        ],
        feelStatement:
          "Readable, rewarding, and progression-driven with strong player identity and bounded scope.",
        antiGoals: [
          "Never balloon into a content-heavy campaign that outpaces production limits.",
          "Never bury upgrade value behind opaque math or menu friction.",
          "Never make narrative, combat, and progression all expand at once."
        ],
        emotionalTargets: ["Ownership", "growth", "clarity", "momentum"],
        readabilityPrinciples:
          "Build choices, combat consequences, and next progression steps should remain easy to understand."
      },
      coreLoop: {
        secondToSecond:
          "Engage an encounter or challenge, spend abilities or actions, and convert success into growth.",
        minuteToMinute:
          "Clear compact objectives, gather progression value, and make one or two meaningful build decisions.",
        sessionLoop:
          "Complete a short quest chain, improve the character, and push into the next bounded content slice.",
        longTermProgression:
          "Unlock class flavor, gear or skill choices, and a compact end-state build arc without giant system sprawl.",
        failureStates:
          "Unclear build consequences, pacing drag, or combat complexity that overwhelms the progression loop.",
        rewardCadence:
          "Frequent encounter rewards with stronger build or chapter payoffs at steady intervals."
      },
      controlsFeel: {
        controlScheme:
          "Direct movement or menu input with low-friction combat or ability selection and clear progression affordances.",
        cameraRules:
          "Camera should keep encounters, routes, and important pickup or interaction state readable.",
        movementPhilosophy:
          "Traversal should support progression pacing, not become an unrelated complexity sink.",
        combatFeelGoals:
          "Combat should reinforce character identity and reward growth without becoming unreadable.",
        responsivenessStandards:
          "Input, menu, and combat feedback should all feel immediate enough to keep growth loops satisfying.",
        platformInputNotes:
          "Controller-first readability with clear menu focus and low-friction input switching where needed.",
        accessibilityConsiderations:
          "Readable numbers and state indicators, scalable text, and reduced visual clutter in combat and menus."
      },
      contentBible: {
        playerVerbs: "Fight, defend, cast, interact, upgrade, equip, and progress.",
        enemies:
          "Compact enemy families with readable roles and enough variation to support player-growth decisions.",
        weaponsAbilities:
          "Small skill trees, gear options, or class verbs with strong identity and manageable overlap.",
        encounters:
          "Short quests, compact dungeons, or bounded battles built around clear progression payoff.",
        levelsMissions:
          "Small hubs, routes, or chapters that support character growth without a giant world map burden.",
        bossesSpecialEvents:
          "Identity-testing boss fights or narrative capstones that pay off build decisions.",
        pickupsRewards:
          "Experience, gear, upgrade currency, quest rewards, and unlock milestones.",
        uiHudElements:
          "Health or resource state, cooldowns or turn info, quest clarity, and build or equipment feedback."
      },
      artTone: {
        artDirection:
          "Readable combat and progression state with enough style to support character identity and world flavor.",
        toneKeywords: ["Rewarding", "readable", "heroic", "compact"],
        visualReferences: ["compact indie RPG readability", "clean progression UI"],
        negativeReferences: ["menu overload", "muddy item readability", "bloated world presentation"],
        animationStyle:
          "Clear action or turn resolution with strong upgrade payoff feedback.",
        vfxDirection:
          "Readable ability feedback that supports identity without flooding the screen.",
        audioMusicDirection:
          "Progression-forward reward cues, clear combat signals, and strong area identity through music."
      },
      technicalDesign: {
        engine: "",
        renderingConstraints:
          "Prioritize progression readability, stable combat feedback, and menu clarity over high-complexity presentation.",
        targetFramerate: "60 FPS on target platforms",
        memoryPerformanceBudget:
          "Compact enemy sets, bounded gear or skill catalogs, and reusable encounter spaces.",
        saveSystem:
          "Character progress, quest state, settings, and lightweight checkpoint or chapter persistence.",
        contentPipeline:
          "Author encounters, progression data, item tables, and quest states through reusable structured content.",
        namingConventions:
          "Name skills, gear, encounters, and progression states by role and player-facing meaning.",
        folderStructure:
          "Separate combat, progression, quest content, UI, and inventory or ability systems.",
        platformConstraints:
          "Text readability, menu clarity, and stable combat pacing should hold across couch and desktop play."
      }
    },
    stageFocus: {
      "first-playable":
        "Ship one compact progression loop with readable combat and one meaningful build decision before adding more content families.",
      "progression-meta":
        "Keep build choices strong and bounded so progression remains readable and tuneable.",
      "content-slice":
        "Use one short quest or dungeon slice to prove that combat, progression, and pacing reinforce each other."
    }
  },
  "sim-lite": {
    id: "sim-lite",
    kind: "preset",
    label: "Simulation",
    description:
      "Internal recommendation profile for bounded simulation projects with readable resource loops and manageable systems depth.",
    genreLabel: "Simulation",
    defaultProject: {
      genre: "Simulation",
      subgenre: "Management",
      scopeCategory: "medium",
      platformTargets: ["pc", "web"],
      agentTargets: ["codex", "cursor", "claude-code"],
      targetPlatforms: ["codex", "cursor", "claude-code"],
      targetAudience:
        "Players who want satisfying resource loops, visible system response, and compact simulation depth.",
      sessionLength: "20-40 minutes",
      monetizationModel: "Premium",
      comparableGames: ["Mini Motorways", "Potion Craft", "Against the Storm"],
      enginePreference: "",
      techStack: []
    },
    defaultDoc: {
      concept: {
        ...createBaseConcept("medium", ["pc", "web"]),
        genre: "Simulation",
        subgenre: "Management",
        playerFantasy:
          "Stabilize a living system through smart prioritization, readable resource pressure, and compact optimization loops.",
        targetAudience:
          "Players who want visible simulation feedback and manageable but satisfying systems depth.",
        sessionLength: "20-40 minutes",
        monetizationModel: "Premium",
        comparableGames: ["Mini Motorways", "Potion Craft", "Against the Storm"],
        scopeCategory: "medium",
        differentiators:
          "Readable systems, bounded content demands, and tight scenario loops that foreground player decisions."
      },
      designPillars: {
        pillars: [
          "System response must stay legible while complexity grows.",
          "The player should always know which pressure is currently most important.",
          "Simulation depth should remain production-friendly and tuneable."
        ],
        feelStatement:
          "Readable, absorbing, and systemically satisfying without becoming a giant spreadsheet sandbox.",
        antiGoals: [
          "Never bury player decisions under invisible simulation rules.",
          "Never add more systems than can be explained and tuned clearly.",
          "Never let long-session drag replace meaningful decision cadence."
        ],
        emotionalTargets: ["Control", "optimization", "pressure", "relief"],
        readabilityPrinciples:
          "Resource state, bottlenecks, and system consequences should remain understandable in one scan."
      },
      coreLoop: {
        secondToSecond:
          "Inspect system state, fix the biggest bottleneck, and observe how the loop stabilizes or escalates.",
        minuteToMinute:
          "Balance resources, unlock small improvements, and adapt to the next pressure event.",
        sessionLoop:
          "Complete one compact scenario or run, improve efficiency, and retry with sharper priorities.",
        longTermProgression:
          "Unlock small systemic variations, new scenario modifiers, and optimized play patterns.",
        failureStates:
          "System collapse from missed bottlenecks, unreadable feedback, or poorly paced escalation.",
        rewardCadence:
          "Frequent micro-relief from stabilizing systems, with stronger payoff at scenario clears and milestone unlocks."
      },
      controlsFeel: {
        controlScheme:
          "Direct management actions, quick inspection tools, and low-friction feedback on system changes.",
        cameraRules:
          "Camera or viewport should prioritize bottleneck visibility and easy state scanning.",
        movementPhilosophy:
          "Navigation should be quick and subordinate to system understanding rather than a challenge of its own.",
        combatFeelGoals:
          "If conflict exists, it should serve the management loop rather than dominate it.",
        responsivenessStandards:
          "System updates and player actions should feel immediate enough to support rapid iteration and learning.",
        platformInputNotes:
          "Mouse-first clarity with controller support only if it can preserve fast inspection and action loops.",
        accessibilityConsiderations:
          "Readable metrics, color-safe state signaling, scalable text, and low-noise alert hierarchies."
      },
      contentBible: {
        playerVerbs: "Inspect, allocate, build, route, optimize, stabilize, and react.",
        enemies:
          "Environmental pressure, demand spikes, shortages, or hostile systems that create readable management tension.",
        weaponsAbilities:
          "Tools, upgrades, policies, or construction verbs instead of traditional combat kits.",
        encounters:
          "Escalation events, bottleneck spikes, survival phases, and compact optimization scenarios.",
        levelsMissions:
          "Short runs, scenarios, or maps built around one dominant management problem each.",
        bossesSpecialEvents:
          "Large pressure spikes, timed crises, or end-of-run survival tests that validate system mastery.",
        pickupsRewards:
          "Upgrade currency, new build options, efficiency boosts, and scenario completion rewards.",
        uiHudElements:
          "Resource state, bottleneck alerts, timers, demand curves, and clear action affordances."
      },
      artTone: {
        artDirection:
          "Readable systems visualization and low-noise presentation that helps the player scan state quickly.",
        toneKeywords: ["Systemic", "clean", "absorbing", "readable"],
        visualReferences: ["compact management UI", "clear simulation dashboards"],
        negativeReferences: ["metric overload", "tiny unreadable labels", "noisy alert spam"],
        animationStyle:
          "Clear cause-and-effect changes that reinforce how the simulation responds.",
        vfxDirection:
          "Information-first feedback that highlights state changes and critical alerts without clutter.",
        audioMusicDirection:
          "Steady system cues, clear alert hierarchies, and music that supports concentration."
      },
      technicalDesign: {
        engine: "",
        renderingConstraints:
          "Prioritize state readability, quick simulation response, and UI clarity over decorative density.",
        targetFramerate: "60 FPS on target platforms",
        memoryPerformanceBudget:
          "Bounded scenario count, reusable simulation rules, and restrained visual layering.",
        saveSystem:
          "Scenario progress, unlocks, settings, and lightweight run or checkpoint persistence.",
        contentPipeline:
          "Author rules, scenarios, resources, and event tables through reusable data-driven systems.",
        namingConventions:
          "Name resources, rules, alerts, and scenarios by function and player-facing meaning.",
        folderStructure:
          "Separate simulation rules, scenarios, UI, progression, and alerting or tutorial systems.",
        platformConstraints:
          "Text, metrics, and alert readability must remain strong on standard desktop displays."
      }
    },
    stageFocus: {
      foundation:
        "Prioritize readable core systems, instrumentation, and stable simulation feedback before layering more content.",
      "progression-meta":
        "Keep unlocks and scenario modifiers small enough that the core system remains comprehensible.",
      "content-slice":
        "Use one compact scenario to prove the simulation loop is readable, absorbing, and repeatable."
    }
  },
  "custom-guided": {
    id: "custom-guided",
    kind: "custom",
    label: "Custom",
    description:
      "Guided setup for a one-off game idea when none of the curated genre recommendations fit cleanly.",
    genreLabel: "Custom",
    defaultProject: {
      genre: "",
      subgenre: "",
      scopeCategory: "small",
      platformTargets: ["pc", "web"],
      agentTargets: ["codex", "cursor"],
      targetPlatforms: ["codex", "cursor"],
      monetizationModel: "Premium",
      sessionLength: "10-20 minutes",
      enginePreference: "",
      techStack: []
    },
    defaultDoc: {
      concept: createBaseConcept("small", ["pc", "web"]),
      designPillars: createBaseDesignPillars(),
      coreLoop: createBaseCoreLoop(),
      controlsFeel: createBaseControlsFeel(),
      contentBible: createBaseContentBible(),
      artTone: createBaseArtTone(),
      technicalDesign: createBaseTechnicalDesign()
    },
    stageFocus: {}
  }
};

export const getStarterModeDefinitions = (): GameTemplateDefinition[] =>
  STARTER_MODE_ORDER.map((templateId) => GAME_TEMPLATES[templateId]);

export const isTemplateId = (value: unknown): value is TemplateId =>
  typeof value === "string" &&
  STARTER_MODE_ORDER.includes(value as TemplateId);

export const getTemplateDefinition = (
  templateId: TemplateId
): GameTemplateDefinition => GAME_TEMPLATES[templateId];

export const getGenreFamilyDefinitions = (): GenreFamilyDefinition[] =>
  GENRE_FAMILIES;

export const getGenreFamilyDefinition = (
  genreFamilyId: GenreFamilyId
): GenreFamilyDefinition | undefined =>
  GENRE_FAMILIES.find((family) => family.id === genreFamilyId);

export const getSubgenreDefinition = (
  genreFamilyId: GenreFamilyId,
  subgenreId: string
): SubgenreDefinition | undefined =>
  getGenreFamilyDefinition(genreFamilyId)?.subgenres.find(
    (subgenre) => subgenre.id === subgenreId
  );

interface InferTemplateIdInput {
  customFeelKeywords?: string;
  customGenre?: string;
  customPlayPattern?: string;
  customPlayerFantasy?: string;
  customSubgenre?: string;
  genreFamilyId?: GenreFamilyId | "";
  subgenreId?: string;
}

export const inferTemplateIdFromGenreSelection = ({
  customFeelKeywords = "",
  customGenre = "",
  customPlayPattern = "",
  customPlayerFantasy = "",
  customSubgenre = "",
  genreFamilyId = "",
  subgenreId = ""
}: InferTemplateIdInput): TemplateId => {
  if (genreFamilyId === "other") {
    const hasCustomFraming = [
      customGenre,
      customSubgenre,
      customPlayerFantasy,
      customPlayPattern,
      customFeelKeywords
    ].some((value) => value.trim().length > 0);

    return hasCustomFraming ? "custom-guided" : "blank-game-project";
  }

  if (!genreFamilyId || !subgenreId) {
    return "blank-game-project";
  }

  const subgenre = getSubgenreDefinition(genreFamilyId, subgenreId);
  return subgenre?.profileTemplateId ?? "blank-game-project";
};
