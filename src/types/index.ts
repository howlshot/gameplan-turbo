export type LegacyProjectStatus =
  | "ideation"
  | "researching"
  | "designing"
  | "building"
  | "shipped";

export type ProjectStatus =
  | LegacyProjectStatus
  | "concept"
  | "preproduction"
  | "production"
  | "playtesting"
  | "release-prep";

export type ScopeCategory = "tiny" | "small" | "medium" | "large";

export type GamePlatformTarget =
  | "ios"
  | "android"
  | "pc"
  | "web"
  | "switch"
  | "console";

export type AgentPlatform =
  | "codex"
  | "qwen-code"
  | "cursor"
  | "claude-code"
  | "replit"
  | "chatgpt"
  | "gemini"
  | "perplexity"
  | "lovable"
  | "bolt"
  | "v0"
  | "other";

export type Platform = AgentPlatform;

export type AIProvider =
  | "codex"
  | "anthropic"
  | "openai"
  | "google"
  | "deepseek"
  | "groq"
  | "qwen"
  | "custom";

export type AgentType =
  | "game-pitch"
  | "mini-gdd"
  | "full-gdd"
  | "vertical-slice-plan"
  | "milestone-roadmap"
  | "agent-system-prompt"
  | "implementation-stage"
  | "art-prompt-packet"
  | "asset-grocery-list"
  | "playtest-checklist"
  | "risk-register"
  | "cut-list"
  | "reference-research"
  | "research"
  | "design"
  | "prd"
  | "system-instructions"
  | "rules-file"
  | "build-foundation"
  | "build-database"
  | "build-feature"
  | "build-audit"
  | "build-deployment";

export type ArtifactType =
  | "game_pitch"
  | "mini_gdd"
  | "full_gdd"
  | "vertical_slice_plan"
  | "milestone_roadmap"
  | "agent_system_prompt"
  | "staged_implementation_prompts"
  | "art_prompt_packet"
  | "asset_grocery_list"
  | "playtest_checklist"
  | "risk_register"
  | "cut_list"
  | "reference_research_prompt"
  | "research_prompt"
  | "design_prompt"
  | "prd"
  | "system_instructions"
  | "rules_file"
  | "build_prompt";

export type VaultCategory =
  | "reference-screenshot"
  | "moodboard"
  | "design-note"
  | "mechanic-writeup"
  | "mockup"
  | "playtest-note"
  | "tech-constraint"
  | "asset-list"
  | "research"
  | "design"
  | "export"
  | "other";

export type BuildStageStatus =
  | "locked"
  | "not-started"
  | "in-progress"
  | "complete";

export type BuildStageKey =
  | "scope-lock"
  | "foundation"
  | "first-playable"
  | "core-controls"
  | "camera-movement"
  | "combat-feel"
  | "systems-foundation"
  | "enemy-behavior"
  | "encounter-scripting"
  | "hud-feedback"
  | "progression-meta"
  | "content-pipeline"
  | "content-production"
  | "content-slice"
  | "vertical-slice-integration"
  | "polish"
  | "packaging-release-prep"
  | "qa-release-prep";

export type CredentialCategory = "api_key" | "database" | "oauth" | "other";

export type AppTheme = "dark" | "light" | "system";

export type TemplateId =
  | "blank-game-project"
  | "arcade-action-rail-shooter"
  | "action-lite"
  | "platformer"
  | "twin-stick-shooter"
  | "survival-horror-lite"
  | "tactics-lite"
  | "strategy-lite"
  | "puzzle-action"
  | "adventure-lite"
  | "rpg-lite"
  | "sim-lite"
  | "custom-guided";

export interface CoreFeature {
  id: string;
  text: string;
  order: number;
}

export interface Project {
  id: string;
  title: string;
  name: string;
  oneLinePitch: string;
  description: string;
  status: ProjectStatus;
  scopeCategory: ScopeCategory;
  genre: string;
  subgenre: string;
  platformTargets: GamePlatformTarget[];
  agentTargets: AgentPlatform[];
  targetPlatforms: AgentPlatform[];
  targetAudience: string;
  sessionLength: string;
  monetizationModel: string;
  comparableGames: string[];
  templateId: TemplateId;
  enginePreference: string;
  techStack: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Brief {
  id: string;
  projectId: string;
  problem: string;
  targetUser: string;
  coreFeatures: CoreFeature[];
  inspirations: string[];
  notes: string;
  updatedAt: number;
}

export interface ConceptSection {
  gameTitle: string;
  oneLinePitch: string;
  playerFantasy: string;
  genre: string;
  subgenre: string;
  platformTargets: GamePlatformTarget[];
  targetAudience: string;
  sessionLength: string;
  monetizationModel: string;
  comparableGames: string[];
  scopeCategory: ScopeCategory;
  differentiators: string;
}

export interface DesignPillarsSection {
  pillars: string[];
  feelStatement: string;
  antiGoals: string[];
  emotionalTargets: string[];
  readabilityPrinciples: string;
}

export interface CoreLoopSection {
  secondToSecond: string;
  minuteToMinute: string;
  sessionLoop: string;
  longTermProgression: string;
  failureStates: string;
  rewardCadence: string;
}

export interface ControlsFeelSection {
  controlScheme: string;
  cameraRules: string;
  movementPhilosophy: string;
  combatFeelGoals: string;
  responsivenessStandards: string;
  platformInputNotes: string;
  accessibilityConsiderations: string;
}

export interface ContentBibleSection {
  playerVerbs: string;
  enemies: string;
  weaponsAbilities: string;
  encounters: string;
  levelsMissions: string;
  bossesSpecialEvents: string;
  pickupsRewards: string;
  uiHudElements: string;
}

export interface ArtToneSection {
  artDirection: string;
  toneKeywords: string[];
  visualReferences: string[];
  negativeReferences: string[];
  animationStyle: string;
  vfxDirection: string;
  audioMusicDirection: string;
}

export interface TechnicalDesignSection {
  engine: string;
  renderingConstraints: string;
  targetFramerate: string;
  memoryPerformanceBudget: string;
  saveSystem: string;
  contentPipeline: string;
  namingConventions: string;
  folderStructure: string;
  platformConstraints: string;
}

export interface GameDesignDoc {
  id: string;
  projectId: string;
  concept: ConceptSection;
  designPillars: DesignPillarsSection;
  coreLoop: CoreLoopSection;
  controlsFeel: ControlsFeelSection;
  contentBible: ContentBibleSection;
  artTone: ArtToneSection;
  technicalDesign: TechnicalDesignSection;
  updatedAt: number;
}

export interface GameDesignDocSeed {
  id?: string;
  projectId?: string;
  concept?: Partial<ConceptSection>;
  designPillars?: Partial<DesignPillarsSection>;
  coreLoop?: Partial<CoreLoopSection>;
  controlsFeel?: Partial<ControlsFeelSection>;
  contentBible?: Partial<ContentBibleSection>;
  artTone?: Partial<ArtToneSection>;
  technicalDesign?: Partial<TechnicalDesignSection>;
  updatedAt?: number;
}

export interface GeneratedArtifact {
  id: string;
  projectId: string;
  type: ArtifactType;
  platform: string;
  content: string;
  contextNodes: string[];
  agentSystemPromptId: string;
  version: number;
  charCount: number;
  tokenEstimate: number;
  createdAt: number;
}

export interface VaultFile {
  id: string;
  projectId: string;
  name: string;
  size: number;
  mimeType: string;
  category: VaultCategory;
  isActiveContext: boolean;
  data: ArrayBuffer;
  uploadedAt: number;
}

export interface BuildStage {
  id: string;
  projectId: string;
  stageKey: BuildStageKey;
  stageNumber: number;
  name: string;
  description: string;
  status: BuildStageStatus;
  promptContent: string;
  platform: string;
  createdAt: number;
  updatedAt: number;
}

export interface AIProviderConfig {
  id: string;
  provider: AIProvider;
  apiKey: string;
  model: string;
  baseUrl?: string;
  isDefault: boolean;
  createdAt: number;
}

export interface AgentSystemPrompt {
  id: string;
  agentType: AgentType;
  label: string;
  content: string;
  isDefault: boolean;
  updatedAt: number;
}

export interface AppSettings {
  id: string;
  theme: AppTheme;
  defaultProvider: AIProvider | null;
  enabledPlatformLaunchers: string[];
  streamingEnabled: boolean;
  userName: string;
  isOnboardingComplete: boolean;
  updatedAt: number;
}

export interface ProjectVersion {
  id: string;
  projectId: string;
  version: string;
  name: string;
  description: string;
  zipData?: ArrayBuffer;
  zipSize: number;
  liveUrl?: string;
  createdAt: number;
}

export interface Credential {
  id: string;
  projectId: string;
  name: string;
  value: string;
  category: CredentialCategory;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}
