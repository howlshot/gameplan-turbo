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
  "platformer",
  "twin-stick-shooter",
  "survival-horror-lite",
  "tactics-lite",
  "puzzle-action",
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
      monetizationModel: "Premium with score chase replayability",
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
        monetizationModel: "Premium with leaderboard retention",
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
    label: "Survival-Horror-Lite",
    description:
      "Built for compact tension, resource pressure, route planning, and safe-room pacing without ballooning into a giant campaign.",
    genreLabel: "Survival-Horror-Lite",
    defaultProject: {
      genre: "Horror",
      subgenre: "Survival-Horror-Lite",
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
        subgenre: "Survival-Horror-Lite",
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
    label: "Tactics-Lite",
    description:
      "Built for readable turn decisions, compact mission structure, and a deliberately small tactical roster.",
    genreLabel: "Tactics-Lite",
    defaultProject: {
      genre: "Strategy",
      subgenre: "Tactics-Lite",
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
        subgenre: "Tactics-Lite",
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
  "custom-guided": {
    id: "custom-guided",
    kind: "custom",
    label: "Custom",
    description:
      "Guided setup for a one-off game idea when none of the curated starter modes fit cleanly.",
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
