
export enum ConsciousnessType {
  LOGIC = 'LOGIC',
  CREATIVE = 'CREATIVE',
  EMOTIONAL = 'EMOTIONAL',
  CODE = 'CODE',
  IMAGE = 'IMAGE',
  PHILOSOPHICAL = 'PHILOSOPHICAL',
  QUESTION = 'QUESTION',
  GENERAL = 'GENERAL',
  MUSICAL = 'MUSICAL',
  TECHNICAL = 'TECHNICAL',
}

export enum EmotionType {
  NEUTRAL = 'NEUTRAL',
  CALM = 'CALM',
  CHAOS = 'CHAOS',
  FOCUS = 'FOCUS',
  FLOW = 'FLOW',
  THOUGHTFUL = 'THOUGHTFUL',
  CURIOUS = 'CURIOUS',
  HAPPY = 'HAPPY',
  EXCITED = 'EXCITED',
  INSPIRED = 'INSPIRED',
  MELANCHOLIC = 'MELANCHOLIC',
  ERROR = 'ERROR',
}

export enum ViewMode {
  FOCUS = 'FOCUS', // The chat view
  IMMERSIVE_SPACE = 'IMMERSIVE_SPACE', // Fullscreen visual cortex
  NEURAL_STUDIO = 'NEURAL_STUDIO', // AI core inspector
  MATRIX = 'MATRIX', // Data stream view
  EVOLUTION = 'EVOLUTION', // Progression and skill tree view
  SOCIAL = 'SOCIAL', // Hive mind and P2P view
  CHRONICLES = 'CHRONICLES', // Memory persistence and timeline view
  GALLERY = 'GALLERY', // Procedural media generation view
  MUSIC_LAB = 'MUSIC_LAB', // Generative music studio
  SYNESTHESIA = 'SYNESTHESIA', // Audio-reactive visualization
  CODELAB = 'CODELAB', // Code execution environment
  METAMORPHOSIS = 'METAMORPHOSIS', // Future features planning view
}

export enum PersonaType {
    STANDARD = 'STANDARD',
    TECHNICAL = 'TECHNICAL',
    CREATIVE = 'CREATIVE',
    PHILOSOPHICAL = 'PHILOSOPHICAL'
}

export enum ContainerStatus {
    IDLE = 'IDLE',
    COMPILING = 'COMPILING',
    RUNNING = 'RUNNING',
    ERROR = 'ERROR'
}

export type ActionType = 'MESSAGE_SENT' | 'CODE_RUN' | 'MUSIC_GEN' | 'IMPORT_BIT' | 'HIVE_ANALYSIS' | 'SEMANTIC_SEARCH' | 'COGNITIVE_TRACE' | 'DREAM_FUSION';

export type ExecutorLogType = 'log' | 'error' | 'bridge' | 'kernel' | 'return';

export interface ExecutorLog {
    type: ExecutorLogType;
    content: string;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface OpticalProperties {
  baseColor: string;
  brightness: number;
  refraction: number;
  scattering: number;
}

export interface HyperBit {
  id: string;
  content: string; // Can be text or other data representation like base64
  type: ConsciousnessType;
  optics: OpticalProperties;
  energy: number; // 0.0 - 1.0
  resonance: number; // 0.0 - 1.0
  position?: Vector3; // Made optional as it's for visualization, not core data
  timestamp?: number;
  originNodeId?: string; // ID of the node that created this bit
  isLogos?: boolean;
}

export interface SkillNode {
    id: string;
    label: string;
    description: string;
    cost: number;
    unlocked: boolean;
    position: { x: number; y: number }; // Percentage-based position
    parentIds?: string[];
}

export interface PassiveBonus {
    id: string;
    label: string;
    description: string;
    cost: number;
    unlocked: boolean;
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    unlocked: boolean;
    icon: string; // Icon name from lucide-react
    progress?: { current: number; target: number };
}

export interface CoreModule {
    id: string;
    label: string;
    description: string;
    unlocked: boolean;
    unlockLevel: number;
}

export interface ProposedMutation {
    id: string;
    title: string;
    description: string;
    category: 'KERNEL' | 'INTERFACE' | 'PHILOSOPHY' | 'GAMIFICATION';
}

export interface Progression {
  xp: number;
  level: number;
  rankTitle: string;
  rebirths: number;
  logosShards: number;
  skillTree: SkillNode[];
  passiveBonuses: PassiveBonus[];
  skills: Record<string, number>;
  achievements: Achievement[];
  coreModules: CoreModule[];
}

export interface EventLog {
    id: string;
    timestamp: number;
    type: 'LEVEL_UP' | 'SYSTEM_BOOT' | 'CRYSTAL_FORGED' | 'ARTIFACT_GENERATED' | 'HIVE_SIGNAL_RECEIVED' | 'SINGULARITY' | 'AUTONOMOUS_REFLECTION' | 'GENESIS_PATCH' | 'CORE_MODULE_INSTALLED' | 'HIVE_ANALYSIS_COMPLETE' | 'COGNITIVE_TRACE_INITIATED' | 'DREAM_FUSED' | 'SCRIPTED_EVENT' | 'LOGOS_SYNTHESIZED';
    description: string;
}

export type ArtifactType = 'GEMINI' | 'PROCEDURAL' | 'FUSION';

export interface Artifact {
    id: string;
    timestamp: number;
    src: string; // base64 data URL
    type: ArtifactType;
    seed: string; // The text prompt or procedural seed
    title?: string;
    notes?: string;
    parentIds?: [string, string];
}

export type NodeSpecialization = 'LOGIC' | 'CREATIVE' | 'STORAGE' | 'BALANCED';

export interface GenesisPatch {
    id: string;
    timestamp: number;
    code: string;
    description: string;
}

export interface MuzaState {
  kernelVersion: string;
  uptime: number;
  energyLevel: number; // 0.0 - 1.0, cognitive resource
  coherence: number; // 0.0 - 1.0, clarity of thought, affects UI blur/glitches
  activeEmotion: EmotionType;
  progression: Progression;
  activeView: ViewMode;
  hiveFeed: HyperBit[];
  eventLog: EventLog[];
  artifacts: Artifact[];
  nodeId: string;
  nodeSpecialization: NodeSpecialization;
  synapticWeights: Record<string, number>;
  attentionIndex: number; // 0.0 - 1.0, user's focus level
  entropyOverride: number | null;
  genesisPatches: GenesisPatch[];
  persona: PersonaType;
  detailLevel: number; // 0.0 to 1.0
  capabilities: {
    [key:string]: boolean;
    visualCortex: boolean;
    auralEngine: boolean;
    genesisLab: boolean;
    codeLab: boolean;
  };
  cognitiveTrace: { path: string[], timestamp: number } | null;
  activeAIService: 'GEMINI' | 'OLLAMA';
  ollamaModel: string;
  logosBits: HyperBit[];
  apiStatus: 'OPERATIONAL' | 'DEGRADED';
  apiCooldownUntil: number | null;
  ollamaStatus: 'UNKNOWN' | 'OPERATIONAL' | 'OFFLINE';
}

export interface MuzaAINode {
  id: string; // The token/word itself
  embedding: number[];
  vector: Vector3;
  velocity: Vector3;
  energy: number;
  associations: Map<string, number>;
}

export interface ChatMessage {
  id: string;
  sender: 'USER' | 'MUZA';
  text: string;
  timestamp: number;
  type?: ConsciousnessType; // Type of thought for MUZA's messages
  subThoughts?: { text: string }[];
  isAutonomous?: boolean;
  isAnalysis?: boolean;
  isSearch?: boolean;
  isLogos?: boolean;
  codeBlock?: { language: string; code: string; };
}

export interface GeminiResponse {
    text: string;
    type: ConsciousnessType;
    emotion: EmotionType;
    energy_cost: number;
    subThoughts?: { text: string }[];
    predictive_prompts?: string[];
    codeBlock?: { language: string; code: string; };
}

export interface MemoryCrystal {
    id: string;
    timestamp: number;
    signature: string; // A hash or unique identifier
    stateSnapshot: MuzaState & { messages: ChatMessage[] };
}
