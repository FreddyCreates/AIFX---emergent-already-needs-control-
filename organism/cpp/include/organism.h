#pragma once

#include <atomic>
#include <chrono>
#include <condition_variable>
#include <cstdint>
#include <functional>
#include <future>
#include <mutex>
#include <string>
#include <thread>
#include <unordered_map>
#include <vector>

namespace organism {

// ── Phi-encoded constants ──────────────────────────────────────────────
constexpr double PHI          = 1.618033988749895;
constexpr double GOLDEN_ANGLE = 137.508;
constexpr int    HEARTBEAT_MS = 873;

// ── Register identifiers ──────────────────────────────────────────────
enum class Register { Cognitive, Affective, Somatic, Sovereign };

// ── Per-register state ─────────────────────────────────────────────────
struct RegisterState {
    // Cognitive
    double reasoning  = 0.0;
    double planning   = 0.0;
    double analysis   = 0.0;
    // Affective
    double emotion    = 0.0;
    double mood       = 0.0;
    double sentiment  = 0.0;
    // Somatic
    double energy     = 1.0;
    double tension    = 0.0;
    double rhythm     = 0.0;
    // Sovereign
    double autonomy   = 1.0;
    double coherence  = 1.0;
    double integrity  = 1.0;

    double phiWeightedScore() const;
};

// ── Snapshot of all four registers ─────────────────────────────────────
struct StateSnapshot {
    RegisterState cognitive;
    RegisterState affective;
    RegisterState somatic;
    RegisterState sovereign;
    uint64_t      beatCount = 0;
};

// ── Organism state (thread-safe) ───────────────────────────────────────
class OrganismState {
public:
    RegisterState  getRegister(Register r) const;
    void           setRegister(Register r, const RegisterState& s);
    StateSnapshot  snapshot() const;
    std::string    diff(const StateSnapshot& a, const StateSnapshot& b) const;

private:
    mutable std::mutex mutex_;
    RegisterState cognitive_;
    RegisterState affective_;
    RegisterState somatic_;
    RegisterState sovereign_;
    uint64_t      beatCount_ = 0;

    RegisterState&       ref(Register r);
    const RegisterState& cref(Register r) const;

    friend class Heartbeat;
};

// ── Heartbeat (873 ms) ─────────────────────────────────────────────────
class Heartbeat {
public:
    using Callback = std::function<void(uint64_t beatCount)>;

    explicit Heartbeat(OrganismState& state);
    ~Heartbeat();

    void start();
    void stop();
    void onBeat(Callback cb);
    uint64_t count() const;

private:
    void loop();

    OrganismState&          state_;
    std::atomic<bool>       running_{false};
    std::atomic<uint64_t>   beatCount_{0};
    std::thread             thread_;
    std::mutex              cbMutex_;
    std::vector<Callback>   callbacks_;
};

// ── Kernel executor ────────────────────────────────────────────────────
class KernelExecutor {
public:
    using Kernel = std::function<void(OrganismState&)>;

    void loadKernel(const std::string& name, Kernel k);
    bool execute(const std::string& name, OrganismState& state,
                 std::chrono::milliseconds timeout = std::chrono::milliseconds{5000});
    std::future<bool> schedule(const std::string& name, OrganismState& state,
                               std::chrono::milliseconds timeout = std::chrono::milliseconds{5000});

private:
    std::mutex                                 mutex_;
    std::unordered_map<std::string, Kernel>    kernels_;
};

// ── Edge sensor ────────────────────────────────────────────────────────
class EdgeSensor {
public:
    struct Reading {
        double value      = 0.0;
        double threshold  = 1.0;
        double calibration = 1.0;
    };

    using ThresholdCallback = std::function<void(const std::string& name, double value)>;

    void registerSensor(const std::string& name, double threshold = 1.0);
    void calibrate(const std::string& name, double factor);
    double read(const std::string& name);
    std::unordered_map<std::string, double> readAll();
    void onThreshold(const std::string& name, ThresholdCallback cb);
    void update(const std::string& name, double raw);

private:
    mutable std::mutex                                  mutex_;
    std::unordered_map<std::string, Reading>            sensors_;
    std::unordered_map<std::string, ThresholdCallback>  thresholdCbs_;
};

// ── Vitality calculator ────────────────────────────────────────────────
class VitalityCalculator {
public:
    static double score(const StateSnapshot& snap, const EdgeSensor& sensors);
    static double phiWeight(double base, int depth);
};

} // namespace organism
