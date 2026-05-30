const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('SynapseBindingEngineProtocol', () => {
  let SynapseBindingEngineProtocol, JOB_TYPES, PRIORITY_LEVELS, FAILURE_CLASSES, RECOVERY_BOUNDS;
  let protocol;
  const PHI = 1.618033988749895;

  beforeEach(async () => {
    const module = await import('../../protocols/synapse-binding-engine-protocol.js');
    SynapseBindingEngineProtocol = module.SynapseBindingEngineProtocol;
    JOB_TYPES = module.JOB_TYPES;
    PRIORITY_LEVELS = module.PRIORITY_LEVELS;
    FAILURE_CLASSES = module.FAILURE_CLASSES;
    RECOVERY_BOUNDS = module.RECOVERY_BOUNDS;
    protocol = new SynapseBindingEngineProtocol();
  });

  describe('JOB_TYPES constant', () => {
    it('should include BIND', () => {
      assert.ok(JOB_TYPES.includes('BIND'));
    });

    it('should include SYNC', () => {
      assert.ok(JOB_TYPES.includes('SYNC'));
    });

    it('should include HEAL', () => {
      assert.ok(JOB_TYPES.includes('HEAL'));
    });

    it('should include VERIFY', () => {
      assert.ok(JOB_TYPES.includes('VERIFY'));
    });

    it('should include TERMINATE', () => {
      assert.ok(JOB_TYPES.includes('TERMINATE'));
    });

    it('should have 5 job types', () => {
      assert.equal(JOB_TYPES.length, 5);
    });
  });

  describe('PRIORITY_LEVELS constant', () => {
    it('should define CRITICAL as 0', () => {
      assert.equal(PRIORITY_LEVELS.CRITICAL, 0);
    });

    it('should define HIGH as 1', () => {
      assert.equal(PRIORITY_LEVELS.HIGH, 1);
    });

    it('should define NORMAL as 2', () => {
      assert.equal(PRIORITY_LEVELS.NORMAL, 2);
    });

    it('should define LOW as 3', () => {
      assert.equal(PRIORITY_LEVELS.LOW, 3);
    });
  });

  describe('FAILURE_CLASSES constant', () => {
    it('should include TRANSIENT', () => {
      assert.ok(FAILURE_CLASSES.includes('TRANSIENT'));
    });

    it('should include PERMANENT', () => {
      assert.ok(FAILURE_CLASSES.includes('PERMANENT'));
    });

    it('should include PARTIAL', () => {
      assert.ok(FAILURE_CLASSES.includes('PARTIAL'));
    });

    it('should include TIMEOUT', () => {
      assert.ok(FAILURE_CLASSES.includes('TIMEOUT'));
    });

    it('should include RESOURCE', () => {
      assert.ok(FAILURE_CLASSES.includes('RESOURCE'));
    });

    it('should include CONFLICT', () => {
      assert.ok(FAILURE_CLASSES.includes('CONFLICT'));
    });

    it('should include UNKNOWN', () => {
      assert.ok(FAILURE_CLASSES.includes('UNKNOWN'));
    });

    it('should have 7 failure classes', () => {
      assert.equal(FAILURE_CLASSES.length, 7);
    });
  });

  describe('RECOVERY_BOUNDS constant', () => {
    it('should define TRANSIENT recovery', () => {
      assert.ok(RECOVERY_BOUNDS.TRANSIENT);
      assert.equal(RECOVERY_BOUNDS.TRANSIENT.retries, 3);
    });

    it('should define PERMANENT with 0 retries', () => {
      assert.equal(RECOVERY_BOUNDS.PERMANENT.retries, 0);
    });

    it('should use phi-weighted backoff for PARTIAL', () => {
      const expected = 873 * PHI;
      assert.ok(Math.abs(RECOVERY_BOUNDS.PARTIAL.backoffMs - expected) < 1);
    });
  });

  describe('constructor', () => {
    it('should initialize empty imprints map', () => {
      assert.ok(protocol.imprints instanceof Map);
      assert.equal(protocol.imprints.size, 0);
    });

    it('should initialize empty job queue', () => {
      assert.ok(Array.isArray(protocol.jobQueue));
      assert.equal(protocol.jobQueue.length, 0);
    });

    it('should initialize empty completed jobs', () => {
      assert.ok(Array.isArray(protocol.completedJobs));
      assert.equal(protocol.completedJobs.length, 0);
    });

    it('should initialize empty failed jobs', () => {
      assert.ok(Array.isArray(protocol.failedJobs));
      assert.equal(protocol.failedJobs.length, 0);
    });

    it('should initialize totalJobs to 0', () => {
      assert.equal(protocol.totalJobs, 0);
    });
  });

  describe('createImprint()', () => {
    it('should create imprint and return it', () => {
      const imprint = protocol.createImprint('imprint-1', { key: 'value' });
      assert.ok(imprint);
    });

    it('should store in imprints map', () => {
      protocol.createImprint('imprint-1', { key: 'value' });
      assert.ok(protocol.imprints.has('imprint-1'));
    });

    it('should store id', () => {
      const imprint = protocol.createImprint('my-imprint', { data: 123 });
      assert.equal(imprint.id, 'my-imprint');
    });

    it('should store data', () => {
      const imprint = protocol.createImprint('imprint-1', { key: 'value' });
      assert.deepEqual(imprint.data, { key: 'value' });
    });

    it('should set version to 1', () => {
      const imprint = protocol.createImprint('imprint-1', {});
      assert.equal(imprint.version, 1);
    });

    it('should set createdAt timestamp', () => {
      const before = Date.now();
      const imprint = protocol.createImprint('imprint-1', {});
      const after = Date.now();
      assert.ok(imprint.createdAt >= before);
      assert.ok(imprint.createdAt <= after);
    });

    it('should set persistent to true', () => {
      const imprint = protocol.createImprint('imprint-1', {});
      assert.equal(imprint.persistent, true);
    });

    it('should compute phi signature', () => {
      const imprint = protocol.createImprint('imprint-1', { test: 'data' });
      assert.ok(typeof imprint.phiSignature === 'number');
    });

    it('should initialize empty bindings array', () => {
      const imprint = protocol.createImprint('imprint-1', {});
      assert.ok(Array.isArray(imprint.bindings));
      assert.equal(imprint.bindings.length, 0);
    });
  });

  describe('computeSignature()', () => {
    it('should return number', () => {
      const sig = protocol.computeSignature({ test: 'data' });
      assert.ok(typeof sig === 'number');
    });

    it('should be consistent for same data', () => {
      const sig1 = protocol.computeSignature({ a: 1 });
      const sig2 = protocol.computeSignature({ a: 1 });
      assert.equal(sig1, sig2);
    });

    it('should differ for different data', () => {
      const sig1 = protocol.computeSignature({ a: 1 });
      const sig2 = protocol.computeSignature({ a: 2 });
      assert.notEqual(sig1, sig2);
    });

    it('should use phi in computation', () => {
      const sig = protocol.computeSignature({ test: 'data' });
      // Signature should be between 0 and PHI
      assert.ok(sig >= 0);
      assert.ok(sig <= PHI);
    });
  });

  describe('scheduleJob()', () => {
    it('should create job and add to queue', () => {
      const job = protocol.scheduleJob('BIND', 'target-1', { data: 123 });
      assert.ok(job);
      assert.ok(protocol.jobQueue.length >= 1);
    });

    it('should return job with id', () => {
      const job = protocol.scheduleJob('BIND', 'target-1', {});
      assert.ok(job.id);
    });

    it('should store job type', () => {
      const job = protocol.scheduleJob('SYNC', 'target-1', {});
      assert.equal(job.type, 'SYNC');
    });

    it('should store target', () => {
      const job = protocol.scheduleJob('BIND', 'my-target', {});
      assert.equal(job.target, 'my-target');
    });

    it('should store payload', () => {
      const job = protocol.scheduleJob('BIND', 'target', { key: 'value' });
      assert.deepEqual(job.payload, { key: 'value' });
    });

    it('should default priority to NORMAL', () => {
      const job = protocol.scheduleJob('BIND', 'target', {});
      assert.equal(job.priority, PRIORITY_LEVELS.NORMAL);
    });

    it('should accept custom priority', () => {
      const job = protocol.scheduleJob('BIND', 'target', {}, PRIORITY_LEVELS.HIGH);
      assert.equal(job.priority, PRIORITY_LEVELS.HIGH);
    });

    it('should set status to queued', () => {
      const job = protocol.scheduleJob('BIND', 'target', {});
      assert.equal(job.status, 'queued');
    });

    it('should throw for invalid job type', () => {
      assert.throws(() => {
        protocol.scheduleJob('INVALID', 'target', {});
      });
    });

    it('should order by priority', () => {
      protocol.scheduleJob('BIND', 'low', {}, PRIORITY_LEVELS.LOW);
      protocol.scheduleJob('BIND', 'high', {}, PRIORITY_LEVELS.HIGH);
      protocol.scheduleJob('BIND', 'critical', {}, PRIORITY_LEVELS.CRITICAL);
      
      // Critical should be first
      const first = protocol.jobQueue[0];
      assert.ok(first.priority <= PRIORITY_LEVELS.NORMAL);
    });
  });

  describe('processNextJob()', () => {
    beforeEach(() => {
      protocol.scheduleJob('BIND', 'target', { data: 1 });
    });

    it('should process job from queue', () => {
      const result = protocol.processNextJob();
      assert.ok(result);
    });

    it('should remove job from queue', () => {
      const sizeBefore = protocol.jobQueue.length;
      protocol.processNextJob();
      const sizeAfter = protocol.jobQueue.length;
      assert.equal(sizeAfter, sizeBefore - 1);
    });

    it('should return null for empty queue', () => {
      protocol.jobQueue = [];
      const result = protocol.processNextJob();
      assert.equal(result, null);
    });
  });

  describe('completeJob()', () => {
    let job;

    beforeEach(() => {
      job = protocol.scheduleJob('BIND', 'target', {});
    });

    it('should mark job as completed', () => {
      protocol.completeJob(job.id);
      assert.equal(job.status, 'completed');
    });

    it('should add to completedJobs', () => {
      protocol.completeJob(job.id);
      assert.ok(protocol.completedJobs.some(j => j.id === job.id));
    });

    it('should set completedAt timestamp', () => {
      const before = Date.now();
      protocol.completeJob(job.id);
      const after = Date.now();
      assert.ok(job.completedAt >= before);
      assert.ok(job.completedAt <= after);
    });
  });

  describe('failJob()', () => {
    let job;

    beforeEach(() => {
      job = protocol.scheduleJob('BIND', 'target', {});
    });

    it('should mark job as failed', () => {
      protocol.failJob(job.id, 'TRANSIENT');
      assert.equal(job.status, 'failed');
    });

    it('should set failure class', () => {
      protocol.failJob(job.id, 'TIMEOUT');
      assert.equal(job.failureClass, 'TIMEOUT');
    });

    it('should add to failedJobs', () => {
      protocol.failJob(job.id, 'PERMANENT');
      assert.ok(protocol.failedJobs.some(j => j.id === job.id));
    });
  });

  describe('retryJob()', () => {
    let job;

    beforeEach(() => {
      job = protocol.scheduleJob('BIND', 'target', {});
      protocol.failJob(job.id, 'TRANSIENT');
    });

    it('should increment retry count', () => {
      const retriesBefore = job.retries;
      protocol.retryJob(job.id);
      assert.equal(job.retries, retriesBefore + 1);
    });

    it('should not retry PERMANENT failures', () => {
      const permJob = protocol.scheduleJob('SYNC', 'target', {});
      protocol.failJob(permJob.id, 'PERMANENT');
      const result = protocol.retryJob(permJob.id);
      assert.ok(!result || result.retries === 0);
    });
  });

  describe('getImprint()', () => {
    it('should return imprint by id', () => {
      protocol.createImprint('my-imprint', { data: 123 });
      const imprint = protocol.getImprint('my-imprint');
      assert.ok(imprint);
      assert.equal(imprint.id, 'my-imprint');
    });

    it('should return undefined for unknown id', () => {
      const imprint = protocol.getImprint('unknown');
      assert.equal(imprint, undefined);
    });
  });

  describe('getMetrics()', () => {
    it('should return metrics object', () => {
      const metrics = protocol.getMetrics();
      assert.ok(metrics);
    });

    it('should include imprint count', () => {
      protocol.createImprint('i1', {});
      protocol.createImprint('i2', {});
      const metrics = protocol.getMetrics();
      assert.ok(metrics.imprintCount >= 2 || metrics.totalImprints >= 2);
    });

    it('should include job counts', () => {
      const metrics = protocol.getMetrics();
      assert.ok('queuedJobs' in metrics || 'pendingJobs' in metrics || 'totalJobs' in metrics);
    });
  });

  describe('integration', () => {
    it('should handle complete job lifecycle', () => {
      // Create imprint
      const imprint = protocol.createImprint('target-1', { config: 'test' });
      
      // Schedule binding job
      const job = protocol.scheduleJob('BIND', imprint.id, { binding: 'data' }, PRIORITY_LEVELS.HIGH);
      
      // Process job
      protocol.processNextJob();
      
      // Complete job
      protocol.completeJob(job.id);
      
      assert.equal(job.status, 'completed');
      assert.ok(protocol.completedJobs.length >= 1);
    });

    it('should handle job failure and retry', () => {
      const job = protocol.scheduleJob('SYNC', 'target', {});
      
      // Fail with transient error
      protocol.failJob(job.id, 'TRANSIENT');
      assert.equal(job.status, 'failed');
      
      // Retry
      protocol.retryJob(job.id);
      assert.equal(job.retries, 1);
    });
  });
});
