// ─── Phi Constants ───────────────────────────────────────────────────────────
export const PHI = 1.618033988749895;
export const GOLDEN_ANGLE = 137.508;
export const HEARTBEAT_MS = 873;

// ─── Register Architecture ──────────────────────────────────────────────────
export type RegisterName = 'cognitive' | 'affective' | 'somatic' | 'sovereign';

export interface CognitiveRegister {
  readonly reasoning: number;
  readonly pattern_recognition: number;
  readonly abstraction: number;
  readonly memory_integration: number;
}

export interface AffectiveRegister {
  readonly valence: number;
  readonly arousal: number;
  readonly coherence: number;
  readonly resonance: number;
}

export interface SomaticRegister {
  readonly cpu_load: number;
  readonly memory_pressure: number;
  readonly io_throughput: number;
  readonly network_latency: number;
}

export interface SovereignRegister {
  readonly autonomy: number;
  readonly integrity: number;
  readonly alignment: number;
  readonly phi_ratio: number;
}

export type RegisterMap = {
  cognitive: CognitiveRegister;
  affective: AffectiveRegister;
  somatic: SomaticRegister;
  sovereign: SovereignRegister;
};

export type RegisterValue = RegisterMap[RegisterName];

// ─── State ──────────────────────────────────────────────────────────────────
export interface StateSnapshot {
  readonly cognitive: Readonly<CognitiveRegister>;
  readonly affective: Readonly<AffectiveRegister>;
  readonly somatic: Readonly<SomaticRegister>;
  readonly sovereign: Readonly<SovereignRegister>;
  readonly timestamp: number;
  readonly beatCount: number;
}

export interface StateDiff {
  readonly register: RegisterName;
  readonly field: string;
  readonly previous: number;
  readonly current: number;
  readonly delta: number;
}

// ─── Heartbeat ──────────────────────────────────────────────────────────────
export interface BeatPayload {
  readonly beatNumber: number;
  readonly timestamp: number;
  readonly intervalMs: number;
  readonly phiPhase: number;
  readonly state: StateSnapshot;
}

export type BeatCallback = (payload: BeatPayload) => void | Promise<void>;
export type Unsubscribe = () => void;

// ─── Kernel ─────────────────────────────────────────────────────────────────
export type KernelStatus = 'idle' | 'running' | 'completed' | 'error' | 'timeout';

export interface KernelConfig {
  readonly id: string;
  readonly name: string;
  readonly timeoutMs: number;
  readonly priority: number;
  readonly runOnBeat: boolean;
  readonly beatInterval: number;
}

export interface KernelFunction<T = unknown> {
  (state: StateSnapshot, beatNumber: number): Promise<T>;
}

export interface KernelRecord<T = unknown> {
  readonly config: KernelConfig;
  readonly fn: KernelFunction<T>;
  status: KernelStatus;
  lastResult: T | null;
  lastError: string | null;
  executionCount: number;
  totalExecutionMs: number;
}

// ─── Edge Sensor ────────────────────────────────────────────────────────────
export type SensorType = 'temperature' | 'network' | 'resource' | 'signal' | 'custom';

export interface SensorConfig {
  readonly id: string;
  readonly name: string;
  readonly type: SensorType;
  readonly pollIntervalMs: number;
  readonly thresholdMin: number;
  readonly thresholdMax: number;
  readonly calibrationOffset: number;
}

export interface SensorReading {
  readonly sensorId: string;
  readonly type: SensorType;
  readonly value: number;
  readonly normalizedValue: number;
  readonly timestamp: number;
  readonly withinThreshold: boolean;
}

export type SensorReadFunction = () => number | Promise<number>;

export interface SensorRecord {
  readonly config: SensorConfig;
  readonly readFn: SensorReadFunction;
  lastReading: SensorReading | null;
  pollTimer: ReturnType<typeof setInterval> | null;
}

export type ThresholdCallback = (reading: SensorReading) => void;

// ─── Vitality ───────────────────────────────────────────────────────────────
export interface VitalityScore {
  readonly overall: number;
  readonly cognitive: number;
  readonly affective: number;
  readonly somatic: number;
  readonly sovereign: number;
  readonly sensorPenalty: number;
  readonly phiHarmony: number;
  readonly timestamp: number;
}

// ─── Cross-Organism Resonance ───────────────────────────────────────────────
export interface ResonanceSignal {
  readonly sourceId: string;
  readonly targetId: string;
  readonly frequency: number;
  readonly amplitude: number;
  readonly phase: number;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly timestamp: number;
}

export interface PeerOrganism {
  readonly id: string;
  readonly name: string;
  readonly address: string;
  readonly lastSeen: number;
  readonly resonanceStrength: number;
}

export interface ResonanceField {
  readonly peers: ReadonlyArray<PeerOrganism>;
  readonly totalResonance: number;
  readonly dominantFrequency: number;
  readonly phiAlignment: number;
  readonly timestamp: number;
}

export type ResonanceCallback = (signal: ResonanceSignal) => void | Promise<void>;

// ─── Fusion / Routing (composite types) ─────────────────────────────────────
export interface FusionResult {
  readonly registers: StateSnapshot;
  readonly vitality: VitalityScore;
  readonly fusionVector: ReadonlyArray<number>;
  readonly timestamp: number;
}

export interface RoutingResult {
  readonly kernelId: string;
  readonly routed: boolean;
  readonly latencyMs: number;
  readonly phiScore: number;
}

// ─── Change Listener ────────────────────────────────────────────────────────
export type RegisterChangeListener<R extends RegisterName> = (
  register: R,
  previous: RegisterMap[R],
  current: RegisterMap[R]
) => void;
