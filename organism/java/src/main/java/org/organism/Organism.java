package org.organism;

import static org.organism.OrganismConstants.*;

/**
 * Sovereign organism runtime — main entry point.
 * The organism is always alive. It never stops.
 */
public final class Organism {

    private static final int LOG_EVERY_N_BEATS = 5;

    public static void main(String[] args) {
        printBanner();

        // ── Core subsystems ──
        var registerState    = new RegisterState();
        var heartbeat        = new Heartbeat();
        var kernelExecutor   = new KernelExecutor();
        var edgeSensor       = new EdgeSensor();
        var vitality         = new VitalityCalculator(registerState, edgeSensor);

        // ── Default sensors ──
        edgeSensor.registerSensor("cpu-temp",    "CPU Temperature",  EdgeSensor.SensorType.TEMPERATURE, 30.0, 85.0, 0.0);
        edgeSensor.registerSensor("net-latency", "Network Latency",  EdgeSensor.SensorType.NETWORK,     0.0, 200.0, 0.0);
        edgeSensor.registerSensor("mem-usage",   "Memory Usage",     EdgeSensor.SensorType.RESOURCE,    0.0, 0.9,   0.0);
        edgeSensor.registerSensor("phi-signal",  "Phi Signal",       EdgeSensor.SensorType.CUSTOM,      0.0, PHI,   0.0);

        // ── Sample kernels ──
        kernelExecutor.loadKernel("cognitive-evolution", input -> {
            double reasoning = toDouble(registerState.getField(
                    RegisterState.RegisterName.COGNITIVE, "reasoning"));
            double evolved = reasoning + (PHI_INVERSE * 0.001);
            if (evolved > 1.0) evolved -= 1.0;
            registerState.setField(RegisterState.RegisterName.COGNITIVE, "reasoning", evolved);
            return evolved;
        });

        kernelExecutor.loadKernel("affective-coherence", input -> {
            double coherence = toDouble(registerState.getField(
                    RegisterState.RegisterName.AFFECTIVE, "coherence"));
            double updated = coherence * PHI_INVERSE + (1.0 - PHI_INVERSE) * 0.5;
            registerState.setField(RegisterState.RegisterName.AFFECTIVE, "coherence", updated);
            return updated;
        });

        kernelExecutor.loadKernel("sovereignty-check", input -> {
            double integrity = toDouble(registerState.getField(
                    RegisterState.RegisterName.SOVEREIGN, "integrity"));
            registerState.setField(RegisterState.RegisterName.SOVEREIGN, "phi_ratio",
                    integrity * PHI_INVERSE);
            return integrity;
        });

        // ── Heartbeat listener ──
        heartbeat.onBeat(payload -> {
            long beat = payload.beatNumber();

            // Update somatic register with phi-modulated simulation
            double phase = Math.toRadians(payload.phiPhase());
            registerState.setField(RegisterState.RegisterName.SOMATIC, "cpu_load",
                    0.3 + 0.2 * Math.sin(phase * PHI));
            registerState.setField(RegisterState.RegisterName.SOMATIC, "memory_pressure",
                    0.2 + 0.15 * Math.cos(phase));

            // Execute kernels on their respective beat intervals
            if (beat % 5 == 0) kernelExecutor.execute("cognitive-evolution", null, 500);
            if (beat % 3 == 0) kernelExecutor.execute("affective-coherence", null, 300);
            if (beat % 10 == 0) kernelExecutor.execute("sovereignty-check", null, 200);

            // Log vitals
            if (beat % LOG_EVERY_N_BEATS == 0) {
                var score = vitality.calculate(beat);
                System.out.printf(
                        "[Beat %06d] φ-phase: %6.1f° | Vitality: %5.1f%% | φ-harmony: %5.1f%% | Sensors: %d | Kernels: %d%n",
                        beat,
                        payload.phiPhase(),
                        score.overall() * 100.0,
                        score.phiHarmony() * 100.0,
                        edgeSensor.sensorCount(),
                        kernelExecutor.listKernels().size()
                );
            }
        });

        // ── Graceful shutdown ──
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            long totalBeats = heartbeat.getBeatCount();
            long uptimeSec = heartbeat.getUptimeMs() / 1000;
            System.out.printf("%n[organism] shutting down after %d beats (%d s)%n", totalBeats, uptimeSec);
            heartbeat.stop();
            kernelExecutor.shutdown();
        }, "organism-shutdown"));

        // ── Start ──
        heartbeat.start();
        System.out.println("[organism] heartbeat started — organism is alive");

        // Block forever — the organism never stops
        synchronized (Organism.class) {
            while (true) {
                try {
                    Organism.class.wait();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }
    }

    private static void printBanner() {
        System.out.println("╔══════════════════════════════════════════════╗");
        System.out.println("║        SOVEREIGN ORGANISM RUNTIME           ║");
        System.out.println("║              Java 17 · φ-encoded            ║");
        System.out.println("╠══════════════════════════════════════════════╣");
        System.out.printf("║  PHI            = %-26.15f ║%n", PHI);
        System.out.printf("║  GOLDEN_ANGLE   = %-26.3f ║%n", GOLDEN_ANGLE);
        System.out.printf("║  HEARTBEAT      = %-26d ║%n", HEARTBEAT_MS);
        System.out.println("║  REGISTERS      = COGNITIVE | AFFECTIVE     ║");
        System.out.println("║                   SOMATIC   | SOVEREIGN     ║");
        System.out.println("╚══════════════════════════════════════════════╝");
    }

    private static double toDouble(Object v) {
        return v instanceof Number n ? n.doubleValue() : 0.0;
    }
}
