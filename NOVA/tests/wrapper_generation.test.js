/**
 * wrapper_generation.test.js — Wrapper Generation Tests for Julia-Motoko Bridge
 * 
 * Tests that the generated wrappers correctly wrap Julia functions
 * with proper type validation and error handling.
 * 
 * @module NOVA/tests/wrapper_generation.test
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const PROTOCOL_PATH = '../protocols/PROTOCOL-JULIA.js';

describe('Wrapper Generation Tests', async () => {
  const { 
    JuliaCompute, 
    JuliaComputeProtocol,
    getJuliaCompute,
    JULIA_FUNCTIONS,
    BRIDGE_STATES
  } = await import(PROTOCOL_PATH);
  
  describe('Function Registry', () => {
    it('should have all linear algebra functions', () => {
      const linalgFuncs = [
        'linalg.eigen',
        'linalg.svd',
        'linalg.qr',
        'linalg.lu',
        'linalg.cholesky',
      ];
      
      for (const func of linalgFuncs) {
        assert.ok(JULIA_FUNCTIONS[func], `Missing function: ${func}`);
      }
    });
    
    it('should have all signal processing functions', () => {
      const signalFuncs = ['signal.fft', 'signal.ifft'];
      
      for (const func of signalFuncs) {
        assert.ok(JULIA_FUNCTIONS[func], `Missing function: ${func}`);
      }
    });
    
    it('should have all statistics functions', () => {
      const statsFuncs = ['stats.mean', 'stats.std', 'stats.cov', 'stats.cor'];
      
      for (const func of statsFuncs) {
        assert.ok(JULIA_FUNCTIONS[func], `Missing function: ${func}`);
      }
    });
    
    it('should have all optimization functions', () => {
      const optimFuncs = ['optim.minimize', 'optim.gradient_descent'];
      
      for (const func of optimFuncs) {
        assert.ok(JULIA_FUNCTIONS[func], `Missing function: ${func}`);
      }
    });
    
    it('should have all phi-enhanced functions', () => {
      const phiFuncs = ['phi.gradient_descent', 'phi.resonance_filter'];
      
      for (const func of phiFuncs) {
        assert.ok(JULIA_FUNCTIONS[func], `Missing function: ${func}`);
        assert.equal(JULIA_FUNCTIONS[func].phiEnhanced, true);
      }
    });
  });
  
  describe('Function Metadata', () => {
    it('should have complete metadata for each function', () => {
      for (const [name, spec] of Object.entries(JULIA_FUNCTIONS)) {
        assert.ok(spec.julia, `${name} missing julia backend`);
        assert.ok(Array.isArray(spec.input), `${name} missing input types`);
        assert.ok(spec.output, `${name} missing output type`);
        assert.ok(spec.description, `${name} missing description`);
        assert.ok(spec.complexity, `${name} missing complexity`);
        assert.equal(typeof spec.stable, 'boolean', `${name} missing stable flag`);
      }
    });
    
    it('should have valid complexity notation', () => {
      for (const [name, spec] of Object.entries(JULIA_FUNCTIONS)) {
        assert.ok(
          spec.complexity.startsWith('O(') || spec.complexity === 'varies',
          `${name} has invalid complexity: ${spec.complexity}`
        );
      }
    });
  });
  
  describe('Wrapper Methods', () => {
    it('should create wrapper methods for all functions', async () => {
      const julia = getJuliaCompute();
      
      // Check that wrapper methods exist
      assert.equal(typeof julia.eigen, 'function');
      assert.equal(typeof julia.svd, 'function');
      assert.equal(typeof julia.qr, 'function');
      assert.equal(typeof julia.lu, 'function');
      assert.equal(typeof julia.cholesky, 'function');
      assert.equal(typeof julia.fft, 'function');
      assert.equal(typeof julia.ifft, 'function');
      assert.equal(typeof julia.mean, 'function');
      assert.equal(typeof julia.std, 'function');
      assert.equal(typeof julia.cov, 'function');
      assert.equal(typeof julia.cor, 'function');
      assert.equal(typeof julia.minimize, 'function');
      assert.equal(typeof julia.phiGradientDescent, 'function');
      assert.equal(typeof julia.phiResonanceFilter, 'function');
    });
    
    it('should throw when called before initialization', async () => {
      const julia = getJuliaCompute();
      
      try {
        await julia.eigen([[1, 0], [0, 1]]);
        assert.fail('Should throw when not initialized');
      } catch (error) {
        assert.ok(error.message.includes('not ready') || error.message.includes('not initialized'));
      }
    });
  });
  
  describe('Bridge States', () => {
    it('should export all bridge states', () => {
      assert.ok(BRIDGE_STATES.UNINITIALIZED);
      assert.ok(BRIDGE_STATES.INITIALIZING);
      assert.ok(BRIDGE_STATES.READY);
      assert.ok(BRIDGE_STATES.COMPUTING);
      assert.ok(BRIDGE_STATES.ERROR);
      assert.ok(BRIDGE_STATES.SHUTDOWN);
    });
    
    it('should transition through states correctly', async () => {
      const julia = new JuliaCompute();
      
      assert.equal(julia.state, BRIDGE_STATES.UNINITIALIZED);
      
      await julia.initialize();
      assert.equal(julia.state, BRIDGE_STATES.READY);
      
      // State should be READY after computation
      await julia.mean([1, 2, 3]);
      assert.equal(julia.state, BRIDGE_STATES.READY);
      
      await julia.shutdown();
      assert.equal(julia.state, BRIDGE_STATES.SHUTDOWN);
    });
  });
  
  describe('Protocol Wrapper', () => {
    it('should create protocol instance', () => {
      const protocol = new JuliaComputeProtocol();
      
      assert.equal(protocol.name, 'PROTOCOL-JULIA');
      assert.equal(protocol.version, '1.0.0');
    });
    
    it('should expose type isomorphisms through protocol', () => {
      const protocol = new JuliaComputeProtocol();
      const types = protocol.getTypeIsomorphisms();
      
      assert.ok(types);
      assert.ok(types['Float64']);
      assert.ok(types['Matrix{Float64}']);
    });
    
    it('should expose function registry through protocol', () => {
      const protocol = new JuliaComputeProtocol();
      const funcs = protocol.getFunctionRegistry();
      
      assert.ok(funcs);
      assert.ok(funcs['linalg.eigen']);
      assert.ok(funcs['stats.mean']);
    });
    
    it('should initialize compute on first call', async () => {
      const protocol = new JuliaComputeProtocol();
      
      // First call should initialize
      const result = await protocol.call('stats.mean', [1, 2, 3]);
      
      assert.ok(protocol.compute !== null);
      assert.equal(result, 2);
    });
    
    it('should have phi phase', () => {
      const protocol = new JuliaComputeProtocol();
      
      assert.equal(typeof protocol.getPhase(), 'number');
      assert.ok(protocol.getPhase() >= 0);
      assert.ok(protocol.getPhase() < 2 * Math.PI);
    });
    
    it('should pulse phase with golden ratio', async () => {
      const { PHI_INV } = await import(PROTOCOL_PATH);
      const protocol = new JuliaComputeProtocol();
      
      const phase1 = protocol.getPhase();
      protocol.pulse();
      const phase2 = protocol.getPhase();
      
      // Phase should have advanced by PHI_INV * PI (mod 2PI)
      const expectedDiff = PHI_INV * Math.PI;
      const actualDiff = (phase2 - phase1 + 2 * Math.PI) % (2 * Math.PI);
      
      assert.ok(Math.abs(actualDiff - expectedDiff) < 1e-10);
    });
  });
  
  describe('Proof Recording', () => {
    it('should record proofs when enabled', async () => {
      const julia = getJuliaCompute({ enableProofRecording: true });
      await julia.initialize();
      
      await julia.mean([1, 2, 3, 4, 5]);
      
      const proofs = julia.getAllProofRecords();
      assert.ok(proofs.length > 0);
    });
    
    it('should include required fields in proof', async () => {
      const julia = getJuliaCompute({ enableProofRecording: true });
      await julia.initialize();
      
      await julia.eigen([[1, 0], [0, 1]]);
      
      const proofs = julia.getAllProofRecords();
      const proof = proofs[proofs.length - 1];
      
      assert.ok(proof.id);
      assert.ok(proof.function);
      assert.ok(proof.inputHash);
      assert.ok(proof.outputHash);
      assert.ok(typeof proof.computeTimeMs === 'number');
      assert.ok(proof.timestamp);
    });
    
    it('should mark phi-enhanced functions in proof', async () => {
      const julia = getJuliaCompute({ enableProofRecording: true });
      await julia.initialize();
      
      await julia.phiGradientDescent(x => x[0]**2 + x[1]**2, [1, 1]);
      
      const proofs = julia.getAllProofRecords();
      const proof = proofs[proofs.length - 1];
      
      assert.equal(proof.phiEnhanced, true);
    });
    
    it('should limit proof history size', async () => {
      const julia = getJuliaCompute({ 
        enableProofRecording: true,
        maxHistorySize: 5 
      });
      await julia.initialize();
      
      // Make more calls than history size
      for (let i = 0; i < 10; i++) {
        await julia.mean([i, i + 1, i + 2]);
      }
      
      const proofs = julia.getAllProofRecords();
      assert.ok(proofs.length <= 5);
    });
  });
  
  describe('Statistics Tracking', () => {
    it('should track call count', async () => {
      const julia = getJuliaCompute();
      await julia.initialize();
      
      const stats1 = julia.getStats();
      await julia.mean([1, 2, 3]);
      await julia.mean([4, 5, 6]);
      const stats2 = julia.getStats();
      
      assert.equal(stats2.callCount - stats1.callCount, 2);
    });
    
    it('should track compute time', async () => {
      const julia = getJuliaCompute();
      await julia.initialize();
      
      await julia.mean([1, 2, 3]);
      
      const stats = julia.getStats();
      assert.ok(stats.totalComputeTime >= 0);
    });
    
    it('should track type conversions', async () => {
      const julia = getJuliaCompute();
      await julia.initialize();
      
      await julia.eigen([[1, 0], [0, 1]]);
      
      const stats = julia.getStats();
      assert.ok(stats.typeConversions >= 2); // input + output
    });
  });
});
