/**
 * julia_compute_client.ts — TypeScript Client for Julia Compute Canister
 * 
 * Auto-generated TypeScript client with full type safety for calling
 * the JuliaCompute canister from frontend applications.
 * 
 * @module NOVA/generated/julia_compute_client
 * @version 1.0.0
 * @powered-by NOVA (Networked Omniscient Verified Architecture)
 */

// ─── Phi Constants ────────────────────────────────────────────────────────────

export const PHI = 1.618033988749895;
export const PHI_INV = 0.618033988749895;
export const HEARTBEAT = 873;
export const GOLDEN_ANGLE = 137.508;

// ─── Type Definitions ─────────────────────────────────────────────────────────

export interface ComplexNum {
  real: number;
  imag: number;
}

export type Vector = number[];
export type Matrix = number[][];
export type ComplexVector = ComplexNum[];
export type ComplexMatrix = ComplexNum[][];

export interface EigenResult {
  values: ComplexVector;
  vectors: ComplexMatrix;
}

export interface SVDResult {
  U: Matrix;
  S: Vector;
  V: Matrix;
}

export interface QRResult {
  Q: Matrix;
  R: Matrix;
}

export interface LUResult {
  L: Matrix;
  U: Matrix;
  p: bigint[];
}

export interface CholeskyResult {
  L: Matrix;
}

export interface FFTResult {
  coefficients: ComplexVector;
}

export interface OptimizationResult {
  minimum: number;
  minimizer: Vector;
  converged: boolean;
  iterations: bigint;
}

export type BridgeState = 
  | { Uninitialized: null }
  | { Ready: null }
  | { Computing: null }
  | { Error: null };

export interface BridgeStats {
  call_count: bigint;
  total_compute_time_ns: bigint;
  errors: bigint;
  type_conversions: bigint;
}

export interface ComputeProof {
  id: string;
  function_name: string;
  input_hash: string;
  output_hash: string;
  compute_time_ns: bigint;
  timestamp: bigint;
  phi_enhanced: boolean;
}

export type Result<T> = { ok: T } | { err: string };

// ─── IDL Factory ──────────────────────────────────────────────────────────────

/**
 * Candid interface factory for JuliaCompute canister
 */
export const idlFactory = ({ IDL }: { IDL: any }) => {
  const ComplexNum = IDL.Record({
    real: IDL.Float64,
    imag: IDL.Float64,
  });
  
  const Vector = IDL.Vec(IDL.Float64);
  const Matrix = IDL.Vec(IDL.Vec(IDL.Float64));
  const ComplexVector = IDL.Vec(ComplexNum);
  const ComplexMatrix = IDL.Vec(IDL.Vec(ComplexNum));
  
  const EigenResult = IDL.Record({
    values: ComplexVector,
    vectors: ComplexMatrix,
  });
  
  const SVDResult = IDL.Record({
    U: Matrix,
    S: Vector,
    V: Matrix,
  });
  
  const QRResult = IDL.Record({
    Q: Matrix,
    R: Matrix,
  });
  
  const LUResult = IDL.Record({
    L: Matrix,
    U: Matrix,
    p: IDL.Vec(IDL.Int64),
  });
  
  const CholeskyResult = IDL.Record({
    L: Matrix,
  });
  
  const FFTResult = IDL.Record({
    coefficients: ComplexVector,
  });
  
  const OptimizationResult = IDL.Record({
    minimum: IDL.Float64,
    minimizer: Vector,
    converged: IDL.Bool,
    iterations: IDL.Nat,
  });
  
  const BridgeState = IDL.Variant({
    Uninitialized: IDL.Null,
    Ready: IDL.Null,
    Computing: IDL.Null,
    Error: IDL.Null,
  });
  
  const BridgeStats = IDL.Record({
    call_count: IDL.Nat,
    total_compute_time_ns: IDL.Int,
    errors: IDL.Nat,
    type_conversions: IDL.Nat,
  });
  
  const ComputeProof = IDL.Record({
    id: IDL.Text,
    function_name: IDL.Text,
    input_hash: IDL.Text,
    output_hash: IDL.Text,
    compute_time_ns: IDL.Int,
    timestamp: IDL.Int,
    phi_enhanced: IDL.Bool,
  });
  
  const ResultText = IDL.Variant({ ok: IDL.Text, err: IDL.Text });
  const ResultEigen = IDL.Variant({ ok: EigenResult, err: IDL.Text });
  const ResultSVD = IDL.Variant({ ok: SVDResult, err: IDL.Text });
  const ResultQR = IDL.Variant({ ok: QRResult, err: IDL.Text });
  const ResultLU = IDL.Variant({ ok: LUResult, err: IDL.Text });
  const ResultCholesky = IDL.Variant({ ok: CholeskyResult, err: IDL.Text });
  const ResultFFT = IDL.Variant({ ok: FFTResult, err: IDL.Text });
  const ResultVector = IDL.Variant({ ok: Vector, err: IDL.Text });
  const ResultMatrix = IDL.Variant({ ok: Matrix, err: IDL.Text });
  const ResultFloat = IDL.Variant({ ok: IDL.Float64, err: IDL.Text });
  const ResultOptim = IDL.Variant({ ok: OptimizationResult, err: IDL.Text });
  
  return IDL.Service({
    // Initialization
    initialize: IDL.Func([], [ResultText], []),
    getState: IDL.Func([], [BridgeState], ['query']),
    getStats: IDL.Func([], [BridgeStats], ['query']),
    
    // Linear Algebra
    linalg_eigen: IDL.Func([Matrix], [ResultEigen], []),
    linalg_svd: IDL.Func([Matrix], [ResultSVD], []),
    linalg_qr: IDL.Func([Matrix], [ResultQR], []),
    linalg_lu: IDL.Func([Matrix], [ResultLU], []),
    linalg_cholesky: IDL.Func([Matrix], [ResultCholesky], []),
    
    // Signal Processing
    signal_fft: IDL.Func([Vector], [ResultFFT], []),
    signal_ifft: IDL.Func([FFTResult], [ResultVector], []),
    
    // Statistics
    stats_mean: IDL.Func([Vector], [ResultFloat], []),
    stats_std: IDL.Func([Vector], [ResultFloat], []),
    stats_cov: IDL.Func([Matrix], [ResultMatrix], []),
    stats_cor: IDL.Func([Matrix], [ResultMatrix], []),
    
    // Optimization
    optim_minimize: IDL.Func([Vector, Vector], [ResultOptim], []),
    
    // Phi-Enhanced Functions
    phi_gradient_descent: IDL.Func([Vector, Vector], [ResultOptim], []),
    phi_resonance_filter: IDL.Func([Vector], [ResultVector], []),
    
    // Proof Recording
    getProofHistory: IDL.Func([], [IDL.Vec(ComputeProof)], ['query']),
    getProof: IDL.Func([IDL.Text], [IDL.Opt(ComputeProof)], ['query']),
    
    // System
    health: IDL.Func([], [IDL.Text], ['query']),
    version: IDL.Func([], [IDL.Text], ['query']),
  });
};

// ─── Client Class ─────────────────────────────────────────────────────────────

/**
 * TypeScript client for JuliaCompute canister
 */
export class JuliaComputeClient {
  private actor: any;
  private canisterId: string;
  private connected: boolean = false;
  
  constructor(canisterId: string, agent?: any) {
    this.canisterId = canisterId;
    // In production, this would create an actual IC agent
    this.actor = null;
  }
  
  /**
   * Create actor connection
   * @param agent - Internet Computer agent
   */
  async connect(agent: any): Promise<void> {
    // const { Actor } = await import('@dfinity/agent');
    // this.actor = Actor.createActor(idlFactory, {
    //   agent,
    //   canisterId: this.canisterId,
    // });
    this.connected = true;
    console.log(`Connected to JuliaCompute canister: ${this.canisterId}`);
  }
  
  /**
   * Ensure actor is connected before making calls
   */
  private ensureConnected(): void {
    if (!this.actor || !this.connected) {
      throw new Error('JuliaComputeClient not connected. Call connect(agent) first.');
    }
  }
  
  // ─── Initialization ───────────────────────────────────────────────────────
  
  async initialize(): Promise<Result<string>> {
    this.ensureConnected();
    return this.actor.initialize();
  }
  
  async getState(): Promise<BridgeState> {
    this.ensureConnected();
    return this.actor.getState();
  }
  
  async getStats(): Promise<BridgeStats> {
    this.ensureConnected();
    return this.actor.getStats();
  }
  
  // ─── Linear Algebra ───────────────────────────────────────────────────────
  
  async eigen(matrix: Matrix): Promise<Result<EigenResult>> {
    this.ensureConnected();
    return this.actor.linalg_eigen(matrix);
  }
  
  async svd(matrix: Matrix): Promise<Result<SVDResult>> {
    this.ensureConnected();
    return this.actor.linalg_svd(matrix);
  }
  
  async qr(matrix: Matrix): Promise<Result<QRResult>> {
    this.ensureConnected();
    return this.actor.linalg_qr(matrix);
  }
  
  async lu(matrix: Matrix): Promise<Result<LUResult>> {
    this.ensureConnected();
    return this.actor.linalg_lu(matrix);
  }
  
  async cholesky(matrix: Matrix): Promise<Result<CholeskyResult>> {
    this.ensureConnected();
    return this.actor.linalg_cholesky(matrix);
  }
  
  // ─── Signal Processing ────────────────────────────────────────────────────
  
  async fft(signal: Vector): Promise<Result<FFTResult>> {
    this.ensureConnected();
    return this.actor.signal_fft(signal);
  }
  
  async ifft(spectrum: FFTResult): Promise<Result<Vector>> {
    this.ensureConnected();
    return this.actor.signal_ifft(spectrum);
  }
  
  // ─── Statistics ───────────────────────────────────────────────────────────
  
  async mean(data: Vector): Promise<Result<number>> {
    this.ensureConnected();
    return this.actor.stats_mean(data);
  }
  
  async std(data: Vector): Promise<Result<number>> {
    this.ensureConnected();
    return this.actor.stats_std(data);
  }
  
  async cov(data: Matrix): Promise<Result<Matrix>> {
    this.ensureConnected();
    return this.actor.stats_cov(data);
  }
  
  async cor(data: Matrix): Promise<Result<Matrix>> {
    this.ensureConnected();
    return this.actor.stats_cor(data);
  }
  
  // ─── Optimization ─────────────────────────────────────────────────────────
  
  async minimize(x0: Vector, coefficients: Vector): Promise<Result<OptimizationResult>> {
    this.ensureConnected();
    return this.actor.optim_minimize(x0, coefficients);
  }
  
  // ─── Phi-Enhanced ─────────────────────────────────────────────────────────
  
  async phiGradientDescent(x0: Vector, coefficients: Vector): Promise<Result<OptimizationResult>> {
    this.ensureConnected();
    return this.actor.phi_gradient_descent(x0, coefficients);
  }
  
  async phiResonanceFilter(signal: Vector): Promise<Result<Vector>> {
    this.ensureConnected();
    return this.actor.phi_resonance_filter(signal);
  }
  
  // ─── Proof Recording ──────────────────────────────────────────────────────
  
  async getProofHistory(): Promise<ComputeProof[]> {
    this.ensureConnected();
    return this.actor.getProofHistory();
  }
  
  async getProof(id: string): Promise<ComputeProof | null> {
    this.ensureConnected();
    const result = await this.actor.getProof(id);
    return result.length > 0 ? result[0] : null;
  }
  
  // ─── System ───────────────────────────────────────────────────────────────
  
  async health(): Promise<string> {
    this.ensureConnected();
    return this.actor.health();
  }
  
  async version(): Promise<string> {
    this.ensureConnected();
    return this.actor.version();
  }
}

// ─── Factory Function ─────────────────────────────────────────────────────────

/**
 * Create a JuliaCompute client instance
 * @param canisterId - Canister ID on the Internet Computer
 * @param agent - Optional IC agent
 */
export function createJuliaComputeClient(canisterId: string, agent?: any): JuliaComputeClient {
  return new JuliaComputeClient(canisterId, agent);
}

// ─── Default Export ───────────────────────────────────────────────────────────

export default {
  PHI,
  PHI_INV,
  HEARTBEAT,
  GOLDEN_ANGLE,
  idlFactory,
  JuliaComputeClient,
  createJuliaComputeClient,
};
