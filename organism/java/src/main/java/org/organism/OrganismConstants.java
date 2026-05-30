package org.organism;

/**
 * Phi-encoded constants for the sovereign organism runtime.
 */
public final class OrganismConstants {

    private OrganismConstants() {}

    public static final double PHI = 1.618033988749895;
    public static final double PHI_INVERSE = 1.0 / PHI;
    public static final double GOLDEN_ANGLE = 137.508;
    public static final long HEARTBEAT_MS = 873;

    // Phi-weighted register weights (inverse powers of PHI)
    public static final double WEIGHT_COGNITIVE  = 1.0 / (PHI * PHI * PHI);
    public static final double WEIGHT_AFFECTIVE  = 1.0 / (PHI * PHI);
    public static final double WEIGHT_SOMATIC    = 1.0 / PHI;
    public static final double WEIGHT_SOVEREIGN  = 1.0;
}
