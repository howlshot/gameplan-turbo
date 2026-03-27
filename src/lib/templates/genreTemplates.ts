import type {
  AgentPlatform,
  BuildStageKey,
  ConceptSection,
  ContentBibleSection,
  ControlsFeelSection,
  CoreLoopSection,
  DesignPillarsSection,
  GameDesignDoc,
  GamePlatformTarget,
  Project,
  ScopeCategory,
  TechnicalDesignSection,
  TemplateId,
  ArtToneSection
} from "@/types";

export interface GameTemplateDefinition {
  id: TemplateId;
  label: string;
  description: string;
  genreLabel: string;
  defaultProject: Partial<Project>;
  defaultDoc: Partial<GameDesignDoc>;
  stageFocus: Partial<Record<BuildStageKey, string>>;
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
  seed?: Partial<GameDesignDoc>
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

export const GAME_TEMPLATES: Record<TemplateId, GameTemplateDefinition> = {
  "blank-game-project": {
    id: "blank-game-project",
    label: "Blank Game Project",
    description: "A clean game preproduction shell with no genre assumptions.",
    genreLabel: "Blank",
    defaultProject: {
      genre: "Action",
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
      sessionLength: "5-12 minutes",
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
        sessionLength: "5-12 minutes",
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
  }
};

export const getTemplateDefinition = (
  templateId: TemplateId
): GameTemplateDefinition => GAME_TEMPLATES[templateId];
