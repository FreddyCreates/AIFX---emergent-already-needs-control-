package org.organism;

import java.util.Collections;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Thread-safe 4-register state architecture.
 * Each register holds a dynamic map of named fields.
 */
public final class RegisterState {

    public enum RegisterName {
        COGNITIVE,
        AFFECTIVE,
        SOMATIC,
        SOVEREIGN
    }

    /** Immutable snapshot of a single register. */
    public record RegisterSnapshot(RegisterName name, Map<String, Object> fields) {}

    /** Immutable snapshot of all four registers plus beat metadata. */
    public record StateSnapshot(
            Map<RegisterName, Map<String, Object>> registers,
            long beatNumber
    ) {}

    private final ConcurrentHashMap<RegisterName, ConcurrentHashMap<String, Object>> registers;

    public RegisterState() {
        registers = new ConcurrentHashMap<>();
        for (RegisterName name : RegisterName.values()) {
            registers.put(name, new ConcurrentHashMap<>());
        }
        initializeDefaults();
    }

    private void initializeDefaults() {
        // Cognitive register
        setField(RegisterName.COGNITIVE, "reasoning", 0.5);
        setField(RegisterName.COGNITIVE, "pattern_recognition", 0.5);
        setField(RegisterName.COGNITIVE, "abstraction", 0.5);
        setField(RegisterName.COGNITIVE, "memory_integration", 0.5);

        // Affective register
        setField(RegisterName.AFFECTIVE, "valence", 0.5);
        setField(RegisterName.AFFECTIVE, "arousal", 0.5);
        setField(RegisterName.AFFECTIVE, "coherence", 0.5);
        setField(RegisterName.AFFECTIVE, "resonance", 0.5);

        // Somatic register
        setField(RegisterName.SOMATIC, "cpu_load", 0.0);
        setField(RegisterName.SOMATIC, "memory_pressure", 0.0);
        setField(RegisterName.SOMATIC, "io_throughput", 0.5);
        setField(RegisterName.SOMATIC, "network_latency", 0.0);

        // Sovereign register
        setField(RegisterName.SOVEREIGN, "autonomy", 1.0);
        setField(RegisterName.SOVEREIGN, "integrity", 1.0);
        setField(RegisterName.SOVEREIGN, "alignment", 1.0);
        setField(RegisterName.SOVEREIGN, "phi_ratio", OrganismConstants.PHI_INVERSE);
    }

    public Object getField(RegisterName register, String key) {
        return registers.get(register).get(key);
    }

    public void setField(RegisterName register, String key, Object value) {
        registers.get(register).put(key, value);
    }

    /** Returns the entire field map for a register (unmodifiable view). */
    public Map<String, Object> getRegister(RegisterName register) {
        return Collections.unmodifiableMap(registers.get(register));
    }

    /** Deep-copy snapshot of the full state, safe to read from any thread. */
    public StateSnapshot snapshot(long beatNumber) {
        var snap = new ConcurrentHashMap<RegisterName, Map<String, Object>>();
        for (RegisterName name : RegisterName.values()) {
            snap.put(name, Map.copyOf(registers.get(name)));
        }
        return new StateSnapshot(Collections.unmodifiableMap(snap), beatNumber);
    }

    /** Convenience: average of all numeric fields in a register, in [0,1]. */
    public double registerAverage(RegisterName register) {
        var fields = registers.get(register);
        if (fields.isEmpty()) return 0.0;
        double sum = 0.0;
        int count = 0;
        for (Object v : fields.values()) {
            if (v instanceof Number n) {
                sum += n.doubleValue();
                count++;
            }
        }
        return count == 0 ? 0.0 : sum / count;
    }
}
