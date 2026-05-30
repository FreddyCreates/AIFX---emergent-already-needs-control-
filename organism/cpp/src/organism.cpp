#include "organism.h"

#include <cmath>
#include <iostream>
#include <sstream>

namespace organism {

// ── RegisterState ──────────────────────────────────────────────────────

double RegisterState::phiWeightedScore() const {
    double sum = 0.0;
    double weights[] = {
        1.0,
        1.0 / PHI,
        1.0 / (PHI * PHI),
    };
    // cognitive triplet
    sum += reasoning * weights[0] + planning * weights[1] + analysis * weights[2];
    // affective triplet
    sum += emotion * weights[0] + mood * weights[1] + sentiment * weights[2];
    // somatic triplet
    sum += energy * weights[0] + tension * weights[1] + rhythm * weights[2];
    // sovereign triplet
    sum += autonomy * weights[0] + coherence * weights[1] + integrity * weights[2];

    double totalWeight = 4.0 * (weights[0] + weights[1] + weights[2]);
    return sum / totalWeight;
}

// ── OrganismState ──────────────────────────────────────────────────────

RegisterState& OrganismState::ref(Register r) {
    switch (r) {
        case Register::Cognitive:  return cognitive_;
        case Register::Affective:  return affective_;
        case Register::Somatic:    return somatic_;
        case Register::Sovereign:  return sovereign_;
    }
    return cognitive_; // unreachable
}

const RegisterState& OrganismState::cref(Register r) const {
    switch (r) {
        case Register::Cognitive:  return cognitive_;
        case Register::Affective:  return affective_;
        case Register::Somatic:    return somatic_;
        case Register::Sovereign:  return sovereign_;
    }
    return cognitive_;
}

RegisterState OrganismState::getRegister(Register r) const {
    std::lock_guard<std::mutex> lock(mutex_);
    return cref(r);
}

void OrganismState::setRegister(Register r, const RegisterState& s) {
    std::lock_guard<std::mutex> lock(mutex_);
    ref(r) = s;
}

StateSnapshot OrganismState::snapshot() const {
    std::lock_guard<std::mutex> lock(mutex_);
    return {cognitive_, affective_, somatic_, sovereign_, beatCount_};
}

std::string OrganismState::diff(const StateSnapshot& a, const StateSnapshot& b) const {
    std::ostringstream os;
    auto field = [&](const char* name, double va, double vb) {
        if (std::abs(va - vb) > 1e-9) {
            os << "  " << name << ": " << va << " -> " << vb << "\n";
        }
    };
    os << "State diff (beat " << a.beatCount << " -> " << b.beatCount << "):\n";
    field("cognitive.reasoning",  a.cognitive.reasoning,  b.cognitive.reasoning);
    field("cognitive.planning",   a.cognitive.planning,   b.cognitive.planning);
    field("cognitive.analysis",   a.cognitive.analysis,   b.cognitive.analysis);
    field("affective.emotion",    a.affective.emotion,    b.affective.emotion);
    field("affective.mood",       a.affective.mood,       b.affective.mood);
    field("affective.sentiment",  a.affective.sentiment,  b.affective.sentiment);
    field("somatic.energy",       a.somatic.energy,       b.somatic.energy);
    field("somatic.tension",      a.somatic.tension,      b.somatic.tension);
    field("somatic.rhythm",       a.somatic.rhythm,       b.somatic.rhythm);
    field("sovereign.autonomy",   a.sovereign.autonomy,   b.sovereign.autonomy);
    field("sovereign.coherence",  a.sovereign.coherence,  b.sovereign.coherence);
    field("sovereign.integrity",  a.sovereign.integrity,  b.sovereign.integrity);
    return os.str();
}

// ── Heartbeat ──────────────────────────────────────────────────────────

Heartbeat::Heartbeat(OrganismState& state) : state_(state) {}

Heartbeat::~Heartbeat() { stop(); }

void Heartbeat::start() {
    if (running_.exchange(true)) return;
    thread_ = std::thread(&Heartbeat::loop, this);
}

void Heartbeat::stop() {
    running_ = false;
    if (thread_.joinable()) thread_.join();
}

void Heartbeat::onBeat(Callback cb) {
    std::lock_guard<std::mutex> lock(cbMutex_);
    callbacks_.push_back(std::move(cb));
}

uint64_t Heartbeat::count() const { return beatCount_.load(); }

void Heartbeat::loop() {
    using namespace std::chrono;
    while (running_) {
        std::this_thread::sleep_for(milliseconds(HEARTBEAT_MS));
        if (!running_) break;

        uint64_t beat = ++beatCount_;
        {
            std::lock_guard<std::mutex> lock(state_.mutex_);
            state_.beatCount_ = beat;
        }

        std::lock_guard<std::mutex> lock(cbMutex_);
        for (auto& cb : callbacks_) {
            cb(beat);
        }
    }
}

// ── KernelExecutor ─────────────────────────────────────────────────────

void KernelExecutor::loadKernel(const std::string& name, Kernel k) {
    std::lock_guard<std::mutex> lock(mutex_);
    kernels_[name] = std::move(k);
}

bool KernelExecutor::execute(const std::string& name, OrganismState& state,
                             std::chrono::milliseconds timeout) {
    Kernel k;
    {
        std::lock_guard<std::mutex> lock(mutex_);
        auto it = kernels_.find(name);
        if (it == kernels_.end()) return false;
        k = it->second;
    }

    auto flag = std::make_shared<std::atomic<bool>>(false);
    auto fut = std::async(std::launch::async, [&state, k, flag]() {
        k(state);
        flag->store(true);
    });
    if (fut.wait_for(timeout) == std::future_status::timeout) {
        std::cerr << "[kernel] timeout: " << name << "\n";
        // Future destructor will block until the async task completes,
        // ensuring no dangling reference to state.
        fut.wait();
        return false;
    }
    fut.get();
    return true;
}

std::future<bool> KernelExecutor::schedule(const std::string& name, OrganismState& state,
                                           std::chrono::milliseconds timeout) {
    std::string kernelName = name; // capture by value to avoid dangling ref
    return std::async(std::launch::async, [this, kernelName, &state, timeout]() {
        return execute(kernelName, state, timeout);
    });
}

// ── EdgeSensor ─────────────────────────────────────────────────────────

void EdgeSensor::registerSensor(const std::string& name, double threshold) {
    std::lock_guard<std::mutex> lock(mutex_);
    sensors_[name] = {0.0, threshold, 1.0};
}

void EdgeSensor::calibrate(const std::string& name, double factor) {
    std::lock_guard<std::mutex> lock(mutex_);
    auto it = sensors_.find(name);
    if (it != sensors_.end()) it->second.calibration = factor;
}

double EdgeSensor::read(const std::string& name) {
    std::lock_guard<std::mutex> lock(mutex_);
    auto it = sensors_.find(name);
    if (it == sensors_.end()) return 0.0;
    return it->second.value * it->second.calibration;
}

std::unordered_map<std::string, double> EdgeSensor::readAll() {
    std::lock_guard<std::mutex> lock(mutex_);
    std::unordered_map<std::string, double> out;
    for (auto& [name, r] : sensors_) {
        out[name] = r.value * r.calibration;
    }
    return out;
}

void EdgeSensor::onThreshold(const std::string& name, ThresholdCallback cb) {
    std::lock_guard<std::mutex> lock(mutex_);
    thresholdCbs_[name] = std::move(cb);
}

void EdgeSensor::update(const std::string& name, double raw) {
    ThresholdCallback cb;
    double calibrated = 0.0;
    double threshold  = 0.0;
    {
        std::lock_guard<std::mutex> lock(mutex_);
        auto it = sensors_.find(name);
        if (it == sensors_.end()) return;
        it->second.value = raw;
        calibrated = raw * it->second.calibration;
        threshold  = it->second.threshold;
        auto cit = thresholdCbs_.find(name);
        if (cit != thresholdCbs_.end()) cb = cit->second;
    }
    if (cb && calibrated >= threshold) {
        cb(name, calibrated);
    }
}

// ── VitalityCalculator ─────────────────────────────────────────────────

double VitalityCalculator::phiWeight(double base, int depth) {
    return base / std::pow(PHI, depth);
}

double VitalityCalculator::score(const StateSnapshot& snap, const EdgeSensor& /* sensors */) {
    double registerScore =
        snap.cognitive.phiWeightedScore()  * phiWeight(1.0, 0) +
        snap.affective.phiWeightedScore()  * phiWeight(1.0, 1) +
        snap.somatic.phiWeightedScore()    * phiWeight(1.0, 2) +
        snap.sovereign.phiWeightedScore()  * phiWeight(1.0, 3);

    double totalWeight =
        phiWeight(1.0, 0) + phiWeight(1.0, 1) +
        phiWeight(1.0, 2) + phiWeight(1.0, 3);

    return registerScore / totalWeight;
}

} // namespace organism
