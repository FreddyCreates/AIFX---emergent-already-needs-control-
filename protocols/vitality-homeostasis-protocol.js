/**
 * PROTO-205: Vitality Homeostasis Protocol (VHP)
 * Self-regulating organism health with phi-weighted equilibrium.
 * 
 * 4 register health: Cognitive, Affective, Somatic, Sovereign
 * Homeostatic target: PHI - 1 = 0.618...
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;
const HOMEOSTATIC_TARGET = PHI - 1;

class VitalityHomeostasisProtocol {
  constructor() {
    this.registers = {
      cognitive: { health: 1.0, target: HOMEOSTATIC_TARGET, rate: 0.02 },
      affective: { health: 1.0, target: HOMEOSTATIC_TARGET, rate: 0.03 },
      somatic: { health: 1.0, target: HOMEOSTATIC_TARGET, rate: 0.01 },
      sovereign: { health: 1.0, target: PHI - 0.5, rate: 0.005 },
    };
    this.vitality = 1.0;
    this.alarms = [];
    this.ticks = 0;
  }

  tick() {
    this.ticks++;
    const adjustments = {};
    
    for (const [name, reg] of Object.entries(this.registers)) {
      const error = reg.target - reg.health;
      const correction = error * reg.rate;
      const oldHealth = reg.health;
      reg.health = Math.max(0, Math.min(1, reg.health + correction));
      
      // Add phi-modulated drift
      const phiDrift = Math.sin(this.ticks / PHI) * 0.005;
      reg.health = Math.max(0, Math.min(1, reg.health + phiDrift));
      
      adjustments[name] = {
        old: oldHealth,
        new: reg.health,
        correction,
        error,
      };
      
      // Check for alarms
      if (reg.health < 0.3) {
        this.alarms.push({
          register: name,
          health: reg.health,
          tick: this.ticks,
          severity: 'critical',
        });
      } else if (reg.health < 0.5) {
        this.alarms.push({
          register: name,
          health: reg.health,
          tick: this.ticks,
          severity: 'warning',
        });
      }
    }
    
    this.updateVitality();
    return { adjustments, vitality: this.vitality };
  }

  updateVitality() {
    const weights = {
      cognitive: PHI,
      affective: 1.0,
      somatic: PHI - 1,
      sovereign: PHI * PHI,
    };
    
    let weightedSum = 0;
    let totalWeight = 0;
    
    for (const [name, reg] of Object.entries(this.registers)) {
      weightedSum += reg.health * weights[name];
      totalWeight += weights[name];
    }
    
    this.vitality = weightedSum / totalWeight;
  }

  damage(register, amount) {
    if (this.registers[register]) {
      this.registers[register].health = Math.max(0, this.registers[register].health - amount);
      this.updateVitality();
    }
  }

  heal(register, amount) {
    if (this.registers[register]) {
      this.registers[register].health = Math.min(1, this.registers[register].health + amount);
      this.updateVitality();
    }
  }

  getState() {
    const registerStates = {};
    for (const [name, reg] of Object.entries(this.registers)) {
      registerStates[name] = {
        health: reg.health,
        target: reg.target,
        deviation: Math.abs(reg.health - reg.target),
      };
    }
    
    return {
      registers: registerStates,
      vitality: this.vitality,
      alarms: this.alarms.slice(-10),
      ticks: this.ticks,
      homeostaticTarget: HOMEOSTATIC_TARGET,
      phi: PHI,
      heartbeat: HEARTBEAT,
    };
  }

  clearAlarms() {
    this.alarms = [];
  }
}

export { VitalityHomeostasisProtocol, HOMEOSTATIC_TARGET };
export default VitalityHomeostasisProtocol;
