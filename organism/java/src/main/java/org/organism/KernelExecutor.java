package org.organism;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.*;
import java.util.function.Function;

/**
 * Kernel execution engine.
 * Kernels are named functions that transform state; execution is async with timeout.
 */
public final class KernelExecutor {

    public enum KernelStatus { IDLE, RUNNING, COMPLETED, ERROR, TIMEOUT }

    /** Snapshot of a kernel's runtime state. */
    public record KernelInfo(
            String id,
            KernelStatus status,
            long executionCount,
            long totalExecutionMs,
            Object lastResult,
            String lastError
    ) {}

    private record KernelEntry(
            String id,
            Function<Object, Object> fn,
            KernelStatus status,
            long executionCount,
            long totalExecutionMs,
            Object lastResult,
            String lastError
    ) {}

    private final ConcurrentHashMap<String, KernelEntry> kernels = new ConcurrentHashMap<>();
    private final ExecutorService executor;

    public KernelExecutor() {
        this.executor = Executors.newCachedThreadPool(r -> {
            Thread t = new Thread(r, "organism-kernel");
            t.setDaemon(true);
            return t;
        });
    }

    /** Register a kernel by ID. Overwrites any existing kernel with the same ID. */
    public void loadKernel(String id, Function<Object, Object> kernelFn) {
        kernels.put(id, new KernelEntry(id, kernelFn, KernelStatus.IDLE, 0, 0, null, null));
    }

    /** Execute a kernel asynchronously with the given input and timeout. */
    public CompletableFuture<Object> execute(String id, Object input, long timeoutMs) {
        KernelEntry entry = kernels.get(id);
        if (entry == null) {
            return CompletableFuture.failedFuture(
                    new IllegalArgumentException("Unknown kernel: " + id));
        }

        kernels.put(id, new KernelEntry(
                id, entry.fn, KernelStatus.RUNNING,
                entry.executionCount, entry.totalExecutionMs, entry.lastResult, entry.lastError));

        long startNs = System.nanoTime();

        return CompletableFuture.supplyAsync(() -> entry.fn.apply(input), executor)
                .orTimeout(timeoutMs, TimeUnit.MILLISECONDS)
                .whenComplete((result, ex) -> {
                    long elapsedMs = (System.nanoTime() - startNs) / 1_000_000;
                    if (ex != null) {
                        boolean isTimeout = ex instanceof TimeoutException
                                || (ex.getCause() instanceof TimeoutException);
                        KernelStatus status = isTimeout ? KernelStatus.TIMEOUT : KernelStatus.ERROR;
                        String errorMsg = ex.getCause() != null ? ex.getCause().getMessage() : ex.getMessage();
                        kernels.put(id, new KernelEntry(
                                id, entry.fn, status,
                                entry.executionCount + 1, entry.totalExecutionMs + elapsedMs,
                                null, errorMsg));
                    } else {
                        kernels.put(id, new KernelEntry(
                                id, entry.fn, KernelStatus.COMPLETED,
                                entry.executionCount + 1, entry.totalExecutionMs + elapsedMs,
                                result, null));
                    }
                });
    }

    /** Get the current status info for a kernel. */
    public KernelInfo getKernelStatus(String id) {
        KernelEntry entry = kernels.get(id);
        if (entry == null) return null;
        return new KernelInfo(entry.id, entry.status, entry.executionCount,
                entry.totalExecutionMs, entry.lastResult, entry.lastError);
    }

    /** List all registered kernel IDs. */
    public List<String> listKernels() {
        return List.copyOf(kernels.keySet());
    }

    /** Shut down the executor pool. */
    public void shutdown() {
        executor.shutdown();
    }
}
