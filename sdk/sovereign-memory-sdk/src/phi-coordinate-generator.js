const PHI = 1.618033988749;
const TAU = 2 * Math.PI;

/**
 * PhiCoordinateGenerator — produces five-axis spatial coordinates
 * (θ, φ, ρ, ring, beat) using φ-encoded golden-angle spirals, and
 * provides encode/decode/distance utilities.
 */
export class PhiCoordinateGenerator {
  /**
   * Generate a coordinate set from a numeric seed using the golden angle.
   *
   * The golden angle (≈ 2π / φ²) distributes successive points evenly
   * around a spiral, preventing clustering.
   *
   * @param {number} seed — non-negative numeric seed
   * @returns {{theta: number, phi: number, rho: number, ring: number, beat: number}}
   */
  generate(seed) {
    const goldenAngle = TAU / (PHI * PHI);

    const theta = (seed * goldenAngle) % TAU;
    const phi = ((seed * goldenAngle * PHI) % Math.PI);
    const rho = (seed / PHI) % 1;
    const ring = Math.floor((seed * PHI) % 7);
    const beat = Math.floor((seed * PHI * PHI) % 64);

    return { theta, phi, rho, ring, beat };
  }

  /**
   * Serialize a coordinate object to a compact colon-delimited string.
   * @param {{theta: number, phi: number, rho: number, ring: number, beat: number}} coordinates
   * @returns {string}
   */
  encode(coordinates) {
    const { theta, phi, rho, ring, beat } = coordinates;
    return [theta, phi, rho, ring, beat]
      .map((v) => Number(v).toFixed(8))
      .join(':');
  }

  /**
   * Deserialize a colon-delimited string back to a coordinate object.
   * @param {string} encoded
   * @returns {{theta: number, phi: number, rho: number, ring: number, beat: number}}
   */
  decode(encoded) {
    const parts = encoded.split(':').map(Number);
    if (parts.length !== 5 || parts.some(Number.isNaN)) {
      throw new Error('Invalid encoded coordinate string');
    }
    const [theta, phi, rho, ring, beat] = parts;
    return { theta, phi, rho, ring, beat };
  }

  /**
   * Compute the φ-weighted distance between two coordinate sets.
   *
   * Angular axes (θ, φ) are scaled by φ, radial by 1, and
   * ring/beat are scaled inversely by φ / φ² respectively.
   *
   * @param {{theta: number, phi: number, rho: number, ring: number, beat: number}} coordA
   * @param {{theta: number, phi: number, rho: number, ring: number, beat: number}} coordB
   * @returns {number}
   */
  distance(coordA, coordB) {
    const dTheta = (coordA.theta - coordB.theta) * PHI;
    const dPhi = (coordA.phi - coordB.phi) * PHI;
    const dRho = coordA.rho - coordB.rho;
    const dRing = (coordA.ring - coordB.ring) / PHI;
    const dBeat = (coordA.beat - coordB.beat) / (PHI * PHI);

    return Math.sqrt(
      dTheta ** 2 + dPhi ** 2 + dRho ** 2 + dRing ** 2 + dBeat ** 2,
    );
  }
}

export default PhiCoordinateGenerator;
