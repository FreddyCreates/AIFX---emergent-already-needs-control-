package org.organism;

import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.LongConsumer;

/**
 * Heartbeat engine running at 873 ms fixed-rate intervals.
 * Listeners are invoked on each beat with the current beat count.
 */
public final class Heartbeat {

    /** Payload delivered to each beat listener. */
    public record BeatPayload(long beatNumber, long timestampMs, double phiPhase) {}

    @FunctionalInterface
    public interface BeatListener {
        void onBeat(BeatPayload payload);
    }

    private final ScheduledExecutorService scheduler;
    private final CopyOnWriteArrayList<BeatListener> listeners = new CopyOnWriteArrayList<>();
    private final AtomicLong beatCount = new AtomicLong(0);
    private final AtomicBoolean alive = new AtomicBoolean(false);
    private volatile long startTimeMs;

    public Heartbeat() {
        this.scheduler = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread t = new Thread(r, "organism-heartbeat");
            t.setDaemon(true);
            return t;
        });
    }

    /** Register a listener that fires on every beat. */
    public void onBeat(BeatListener listener) {
        listeners.add(listener);
    }

    /** Remove a previously registered listener. */
    public void removeBeatListener(BeatListener listener) {
        listeners.remove(listener);
    }

    /** Start the heartbeat. Idempotent. */
    public void start() {
        if (alive.compareAndSet(false, true)) {
            startTimeMs = System.currentTimeMillis();
            scheduler.scheduleAtFixedRate(this::pulse, 0, OrganismConstants.HEARTBEAT_MS, TimeUnit.MILLISECONDS);
        }
    }

    /** Stop the heartbeat and shut down the scheduler. */
    public void stop() {
        if (alive.compareAndSet(true, false)) {
            scheduler.shutdown();
            try {
                if (!scheduler.awaitTermination(2000, TimeUnit.MILLISECONDS)) {
                    scheduler.shutdownNow();
                }
            } catch (InterruptedException e) {
                scheduler.shutdownNow();
                Thread.currentThread().interrupt();
            }
        }
    }

    private void pulse() {
        long beat = beatCount.incrementAndGet();
        double phiPhase = (beat * OrganismConstants.GOLDEN_ANGLE) % 360.0;
        var payload = new BeatPayload(beat, System.currentTimeMillis(), phiPhase);

        for (BeatListener listener : listeners) {
            try {
                listener.onBeat(payload);
            } catch (Exception e) {
                System.err.printf("[heartbeat] listener error on beat %d: %s%n", beat, e.getMessage());
            }
        }
    }

    public boolean isAlive() {
        return alive.get();
    }

    public long getBeatCount() {
        return beatCount.get();
    }

    /** Uptime in milliseconds since start(). */
    public long getUptimeMs() {
        return alive.get() ? System.currentTimeMillis() - startTimeMs : 0;
    }
}
