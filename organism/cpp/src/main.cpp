#include "organism.h"

#include <cmath>
#include <csignal>
#include <cstdlib>
#include <iomanip>
#include <iostream>

static std::atomic<bool> g_alive{true};

static void signalHandler(int) { g_alive = false; }

static const char* registerName(organism::Register r) {
    switch (r) {
        case organism::Register::Cognitive: return "Cognitive";
        case organism::Register::Affective: return "Affective";
        case organism::Register::Somatic:   return "Somatic";
        case organism::Register::Sovereign: return "Sovereign";
    }
    return "Unknown";
}

int main() {
    using namespace organism;
    using namespace std::chrono;

    std::signal(SIGINT,  signalHandler);
    std::signal(SIGTERM, signalHandler);

    std::cout << std::fixed << std::setprecision(6);
    std::cout << "╔══════════════════════════════════════════════╗\n";
    std::cout << "║   ORGANISM RUNTIME v1.0  ·  C++17           ║\n";
    std::cout << "║   PHI = " << PHI << "               ║\n";
    std::cout << "║   GOLDEN_ANGLE = " << GOLDEN_ANGLE << "                ║\n";
    std::cout << "║   HEARTBEAT    = " << HEARTBEAT_MS << " ms                   ║\n";
    std::cout << "╚══════════════════════════════════════════════╝\n\n";

    // ── Core state ─────────────────────────────────────────────────
    OrganismState state;

    RegisterState sov;
    sov.autonomy  = 1.0;
    sov.coherence = 1.0;
    sov.integrity = 1.0;
    state.setRegister(Register::Sovereign, sov);

    RegisterState som;
    som.energy = 1.0;
    som.rhythm = std::fmod(GOLDEN_ANGLE, 1.0);
    state.setRegister(Register::Somatic, som);

    // ── Edge sensors ───────────────────────────────────────────────
    EdgeSensor sensors;
    sensors.registerSensor("temperature", 90.0);
    sensors.registerSensor("network",     0.8);
    sensors.registerSensor("resource",    0.9);
    sensors.registerSensor("signal",      0.5);

    sensors.calibrate("temperature", 1.0 / PHI);
    sensors.calibrate("network",     1.0);
    sensors.calibrate("resource",    PHI);
    sensors.calibrate("signal",      1.0);

    sensors.onThreshold("temperature", [](const std::string& name, double v) {
        std::cout << "[ALERT] " << name << " threshold breached: " << v << "\n";
    });
    sensors.onThreshold("network", [](const std::string& name, double v) {
        std::cout << "[ALERT] " << name << " threshold breached: " << v << "\n";
    });

    // ── Kernel ─────────────────────────────────────────────────────
    KernelExecutor executor;

    executor.loadKernel("phi_modulate", [](OrganismState& st) {
        auto cog = st.getRegister(Register::Cognitive);
        cog.reasoning = std::fmod(cog.reasoning + 1.0 / PHI, 1.0);
        cog.planning  = std::fmod(cog.planning  + 1.0 / (PHI * PHI), 1.0);
        cog.analysis  = std::fmod(cog.analysis  + GOLDEN_ANGLE / 360.0, 1.0);
        st.setRegister(Register::Cognitive, cog);

        auto aff = st.getRegister(Register::Affective);
        aff.emotion   = std::fmod(aff.emotion   + 1.0 / PHI, 1.0);
        aff.mood      = 0.5 + 0.5 * std::sin(cog.reasoning * PHI);
        aff.sentiment = (aff.emotion + aff.mood) / 2.0;
        st.setRegister(Register::Affective, aff);
    });

    executor.loadKernel("somatic_pulse", [](OrganismState& st) {
        auto som = st.getRegister(Register::Somatic);
        som.energy  = 0.5 + 0.5 * std::cos(som.rhythm * PHI * 2.0 * M_PI);
        som.tension = std::fmod(som.tension + 1.0 / (PHI * PHI * PHI), 1.0);
        som.rhythm  = std::fmod(som.rhythm  + GOLDEN_ANGLE / 360.0, 1.0);
        st.setRegister(Register::Somatic, som);
    });

    // ── Heartbeat ──────────────────────────────────────────────────
    Heartbeat heartbeat(state);

    heartbeat.onBeat([&](uint64_t beat) {
        // Run kernels every beat
        executor.execute("phi_modulate", state);
        executor.execute("somatic_pulse", state);

        // Simulate edge sensor readings using phi-derived values
        double phase = std::fmod(beat * GOLDEN_ANGLE, 360.0) / 360.0;
        sensors.update("temperature", 60.0 + 40.0 * std::sin(phase * 2.0 * M_PI));
        sensors.update("network",     0.5  + 0.5  * std::cos(phase * PHI * 2.0 * M_PI));
        sensors.update("resource",    0.3  + 0.7  * std::sin(phase * PHI));
        sensors.update("signal",      0.2  + 0.8  * std::abs(std::sin(phase * GOLDEN_ANGLE)));

        // Print status every 5 beats
        if (beat % 5 == 0) {
            auto snap = state.snapshot();
            double vitality = VitalityCalculator::score(snap, sensors);
            auto readings = sensors.readAll();

            std::cout << "\n── beat " << beat << " ──────────────────────────────\n";
            std::cout << "  vitality : " << vitality << "\n";

            auto printReg = [&](const char* name, const RegisterState& r) {
                std::cout << "  " << name << "  : "
                          << r.phiWeightedScore() << "\n";
            };
            printReg("cognitive ", snap.cognitive);
            printReg("affective ", snap.affective);
            printReg("somatic   ", snap.somatic);
            printReg("sovereign ", snap.sovereign);

            std::cout << "  sensors   :";
            for (auto& [n, v] : readings) {
                std::cout << " " << n << "=" << v;
            }
            std::cout << "\n";
        }
    });

    std::cout << "[organism] starting heartbeat (" << HEARTBEAT_MS << " ms)\n";
    heartbeat.start();

    // ── Main loop: organism is alive ───────────────────────────────
    while (g_alive) {
        std::this_thread::sleep_for(milliseconds(HEARTBEAT_MS));
    }

    std::cout << "\n[organism] shutting down after " << heartbeat.count() << " beats\n";
    heartbeat.stop();

    auto final_snap = state.snapshot();
    double finalVitality = VitalityCalculator::score(final_snap, sensors);
    std::cout << "[organism] final vitality: " << finalVitality << "\n";
    std::cout << "[organism] total beats:    " << final_snap.beatCount << "\n";

    return 0;
}
