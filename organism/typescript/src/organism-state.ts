import type {
  RegisterName,
  RegisterMap,
  CognitiveRegister,
  AffectiveRegister,
  SomaticRegister,
  SovereignRegister,
  StateSnapshot,
  StateDiff,
  RegisterChangeListener,
  Unsubscribe,
} from './types.js';
import { PHI } from './types.js';

function deepFreeze<T extends object>(obj: T): Readonly<T> {
  const frozen = Object.freeze(obj);
  Object.values(frozen).forEach((val) => {
    if (typeof val === 'object' && val !== null && !Object.isFrozen(val)) {
      deepFreeze(val as object);
    }
  });
  return frozen;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export class OrganismState {
  private cognitive: CognitiveRegister;
  private affective: AffectiveRegister;
  private somatic: SomaticRegister;
  private sovereign: SovereignRegister;
  private beatCount = 0;
  private readonly listeners: Map<RegisterName, Set<RegisterChangeListener<RegisterName>>> =
    new Map();

  constructor() {
    this.cognitive = {
      reasoning: 0.5,
      pattern_recognition: 0.5,
      abstraction: 0.5,
      memory_integration: 0.5,
    };

    this.affective = {
      valence: 0.0,
      arousal: 0.3,
      coherence: PHI - 1, // 0.618…
      resonance: 0.5,
    };

    this.somatic = {
      cpu_load: 0.0,
      memory_pressure: 0.0,
      io_throughput: 0.0,
      network_latency: 0.0,
    };

    this.sovereign = {
      autonomy: 1.0,
      integrity: 1.0,
      alignment: 1.0,
      phi_ratio: PHI,
    };

    for (const name of ['cognitive', 'affective', 'somatic', 'sovereign'] as const) {
      this.listeners.set(name, new Set());
    }
  }

  getRegister<R extends RegisterName>(name: R): Readonly<RegisterMap[R]> {
    return Object.freeze({ ...this.getRegisterMutable(name) }) as RegisterMap[R];
  }

  setRegister<R extends RegisterName>(name: R, value: RegisterMap[R]): void {
    const previous = clone(this.getRegisterMutable(name));
    this.setRegisterMutable(name, { ...value });
    const current = clone(this.getRegisterMutable(name));
    const callbacks = this.listeners.get(name);
    if (callbacks) {
      for (const cb of callbacks) {
        (cb as RegisterChangeListener<R>)(name, previous as RegisterMap[R], current as RegisterMap[R]);
      }
    }
  }

  onChange<R extends RegisterName>(
    register: R,
    listener: RegisterChangeListener<R>
  ): Unsubscribe {
    const set = this.listeners.get(register);
    if (set) {
      set.add(listener as RegisterChangeListener<RegisterName>);
    }
    return () => {
      set?.delete(listener as RegisterChangeListener<RegisterName>);
    };
  }

  snapshot(): Readonly<StateSnapshot> {
    const snap: StateSnapshot = {
      cognitive: clone(this.cognitive),
      affective: clone(this.affective),
      somatic: clone(this.somatic),
      sovereign: clone(this.sovereign),
      timestamp: Date.now(),
      beatCount: this.beatCount,
    };
    return deepFreeze(snap);
  }

  diff(previous: StateSnapshot): ReadonlyArray<StateDiff> {
    const diffs: StateDiff[] = [];
    const current = this.snapshot();

    for (const register of ['cognitive', 'affective', 'somatic', 'sovereign'] as const) {
      const prev = previous[register] as Record<string, number>;
      const curr = current[register] as Record<string, number>;
      for (const field of Object.keys(curr)) {
        const prevVal = prev[field] ?? 0;
        const currVal = curr[field] ?? 0;
        if (prevVal !== currVal) {
          diffs.push({
            register,
            field,
            previous: prevVal,
            current: currVal,
            delta: currVal - prevVal,
          });
        }
      }
    }

    return diffs;
  }

  incrementBeat(): void {
    this.beatCount++;
  }

  getBeatCount(): number {
    return this.beatCount;
  }

  private getRegisterMutable<R extends RegisterName>(name: R): RegisterMap[R] {
    switch (name) {
      case 'cognitive':
        return this.cognitive as RegisterMap[R];
      case 'affective':
        return this.affective as RegisterMap[R];
      case 'somatic':
        return this.somatic as RegisterMap[R];
      case 'sovereign':
        return this.sovereign as RegisterMap[R];
      default: {
        const _exhaustive: never = name;
        throw new Error(`Unknown register: ${_exhaustive}`);
      }
    }
  }

  private setRegisterMutable<R extends RegisterName>(name: R, value: RegisterMap[R]): void {
    switch (name) {
      case 'cognitive':
        this.cognitive = value as CognitiveRegister;
        break;
      case 'affective':
        this.affective = value as AffectiveRegister;
        break;
      case 'somatic':
        this.somatic = value as SomaticRegister;
        break;
      case 'sovereign':
        this.sovereign = value as SovereignRegister;
        break;
      default: {
        const _exhaustive: never = name;
        throw new Error(`Unknown register: ${_exhaustive}`);
      }
    }
  }
}
