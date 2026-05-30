/**
 * PROTO-218: Homeostatic Drive Protocol (HDP)
 * Internal drive states that motivate organism behavior.
 * 
 * Models biological drives: energy, curiosity, social, safety, growth
 * Each drive has a setpoint and generates motivation when deviated.
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;

const DRIVE_TYPES = ['energy', 'curiosity', 'social', 'safety', 'growth'];

class HomeostaticDriveProtocol {
  constructor() {
    this.drives = new Map();
    this.motivations = new Map();
    this.driveHistory = [];
    this.beatCount = 0;
    
    // Initialize default drives
    for (const type of DRIVE_TYPES) {
      this.initializeDrive(type);
    }
  }

  initializeDrive(type, config = {}) {
    this.drives.set(type, {
      type,
      level: config.initial ?? 0.5,
      setpoint: config.setpoint ?? (PHI - 1),  // 0.618
      sensitivity: config.sensitivity ?? 1.0,
      decayRate: config.decayRate ?? 0.001,
      satisfactionRate: config.satisfactionRate ?? 0.1,
    });
    
    this.motivations.set(type, 0);
    return type;
  }

  tick() {
    this.beatCount++;
    const updates = [];
    
    for (const [type, drive] of this.drives) {
      // Natural decay toward 0
      const oldLevel = drive.level;
      drive.level = Math.max(0, drive.level - drive.decayRate);
      
      // Calculate motivation (deviation from setpoint)
      const deviation = drive.setpoint - drive.level;
      const motivation = Math.abs(deviation) * drive.sensitivity * PHI;
      this.motivations.set(type, motivation);
      
      updates.push({
        type,
        level: drive.level,
        motivation,
        deviation,
      });
    }
    
    this.driveHistory.push({
      beat: this.beatCount,
      drives: updates,
      timestamp: Date.now(),
    });
    if (this.driveHistory.length > 100) this.driveHistory.shift();
    
    return { beat: this.beatCount, updates };
  }

  satisfy(type, amount = 0.1) {
    const drive = this.drives.get(type);
    if (!drive) return null;
    
    const oldLevel = drive.level;
    drive.level = Math.min(1, drive.level + amount * drive.satisfactionRate * PHI);
    
    // Recalculate motivation
    const deviation = drive.setpoint - drive.level;
    const motivation = Math.abs(deviation) * drive.sensitivity * PHI;
    this.motivations.set(type, motivation);
    
    return {
      type,
      oldLevel,
      newLevel: drive.level,
      motivation,
      satisfied: amount,
    };
  }

  deplete(type, amount = 0.1) {
    const drive = this.drives.get(type);
    if (!drive) return null;
    
    const oldLevel = drive.level;
    drive.level = Math.max(0, drive.level - amount);
    
    const deviation = drive.setpoint - drive.level;
    const motivation = Math.abs(deviation) * drive.sensitivity * PHI;
    this.motivations.set(type, motivation);
    
    return {
      type,
      oldLevel,
      newLevel: drive.level,
      motivation,
      depleted: amount,
    };
  }

  getDominantDrive() {
    let maxMotivation = 0;
    let dominantType = null;
    
    for (const [type, motivation] of this.motivations) {
      if (motivation > maxMotivation) {
        maxMotivation = motivation;
        dominantType = type;
      }
    }
    
    return { type: dominantType, motivation: maxMotivation };
  }

  getMotivationVector() {
    const vector = {};
    for (const [type, motivation] of this.motivations) {
      vector[type] = motivation;
    }
    return vector;
  }

  getDriveState(type) {
    const drive = this.drives.get(type);
    if (!drive) return null;
    
    return {
      type,
      level: drive.level,
      setpoint: drive.setpoint,
      motivation: this.motivations.get(type),
      deviation: drive.setpoint - drive.level,
    };
  }

  getMetrics() {
    const driveStates = [];
    for (const type of DRIVE_TYPES) {
      const state = this.getDriveState(type);
      if (state) driveStates.push(state);
    }
    
    return {
      drives: driveStates,
      dominantDrive: this.getDominantDrive(),
      motivationVector: this.getMotivationVector(),
      beatCount: this.beatCount,
      driveTypes: DRIVE_TYPES,
      phi: PHI,
      heartbeat: HEARTBEAT,
    };
  }
}

export { HomeostaticDriveProtocol, DRIVE_TYPES };
export default HomeostaticDriveProtocol;
