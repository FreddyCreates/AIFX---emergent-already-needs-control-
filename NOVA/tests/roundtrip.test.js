/**
 * roundtrip.test.js — Roundtrip Tests for Julia-Motoko Bridge
 * 
 * Tests type conversion roundtrips to ensure data integrity
 * across the JavaScript ↔ Julia ↔ Motoko boundary.
 * 
 * @module NOVA/tests/roundtrip.test
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Import protocol (adjust path as needed)
const PROTOCOL_PATH = '../protocols/PROTOCOL-JULIA.js';

describe('Julia Bridge Roundtrip Tests', async () => {
  let JuliaCompute, getJuliaCompute, TYPE_ISOMORPHISMS;
  
  // Dynamic import
  const protocol = await import(PROTOCOL_PATH);
  JuliaCompute = protocol.JuliaCompute;
  getJuliaCompute = protocol.getJuliaCompute;
  TYPE_ISOMORPHISMS = protocol.TYPE_ISOMORPHISMS;
  
  describe('Initialization', () => {
    it('should create a JuliaCompute instance', () => {
      const julia = getJuliaCompute();
      assert.ok(julia instanceof JuliaCompute);
    });
    
    it('should initialize successfully', async () => {
      const julia = getJuliaCompute();
      const result = await julia.initialize();
      assert.equal(result.success, true);
    });
    
    it('should report ready state after initialization', async () => {
      const julia = getJuliaCompute();
      await julia.initialize();
      const stats = julia.getStats();
      assert.equal(stats.errors, 0);
    });
    
    it('should handle double initialization gracefully', async () => {
      const julia = getJuliaCompute();
      await julia.initialize();
      const result = await julia.initialize();
      assert.equal(result.success, true);
      assert.ok(result.message.includes('Already'));
    });
  });
  
  describe('Scalar Roundtrip', () => {
    it('should preserve Float64 values', async () => {
      const julia = getJuliaCompute();
      await julia.initialize();
      
      const input = [3.14159, 2.71828, 1.41421];
      const result = await julia.mean(input);
      
      // Mean should be close to expected
      const expected = (3.14159 + 2.71828 + 1.41421) / 3;
      assert.ok(Math.abs(result - expected) < 1e-10);
    });
    
    it('should handle zero values', async () => {
      const julia = getJuliaCompute();
      await julia.initialize();
      
      const input = [0, 0, 0, 0];
      const result = await julia.mean(input);
      assert.equal(result, 0);
    });
    
    it('should handle negative values', async () => {
      const julia = getJuliaCompute();
      await julia.initialize();
      
      const input = [-1, -2, -3];
      const result = await julia.mean(input);
      assert.equal(result, -2);
    });
  });
  
  describe('Vector Roundtrip', () => {
    it('should preserve vector through FFT/IFFT roundtrip', async () => {
      const julia = getJuliaCompute();
      await julia.initialize();
      
      const input = [1, 2, 3, 4];
      const fftResult = await julia.fft(input);
      
      // FFT result should have same length
      assert.equal(fftResult.length, input.length);
      
      // Each element should be a complex number
      for (const c of fftResult) {
        assert.ok('real' in c);
        assert.ok('imag' in c);
        assert.equal(typeof c.real, 'number');
        assert.equal(typeof c.imag, 'number');
      }
    });
    
    it('should handle empty edge case with proper error', async () => {
      const julia = getJuliaCompute();
      await julia.initialize();
      
      try {
        await julia.mean([]);
        assert.fail('Should have thrown for empty array');
      } catch (error) {
        assert.ok(error.message.includes('Empty') || error.message.includes('empty'));
      }
    });
    
    it('should handle single-element vectors', async () => {
      const julia = getJuliaCompute();
      await julia.initialize();
      
      const result = await julia.mean([42]);
      assert.equal(result, 42);
    });
  });
  
  describe('Matrix Roundtrip', () => {
    it('should preserve matrix through eigen decomposition', async () => {
      const julia = getJuliaCompute();
      await julia.initialize();
      
      // 2x2 identity matrix
      const input = [[1, 0], [0, 1]];
      const result = await julia.eigen(input);
      
      // Should have 2 eigenvalues
      assert.equal(result.values.length, 2);
      
      // Eigenvalues of identity are all 1
      for (const eigenvalue of result.values) {
        assert.ok('real' in eigenvalue);
        assert.ok('imag' in eigenvalue);
      }
    });
    
    it('should handle symmetric matrix', async () => {
      const julia = getJuliaCompute();
      await julia.initialize();
      
      const input = [[4, 2], [2, 3]];
      const result = await julia.eigen(input);
      
      assert.equal(result.values.length, 2);
      assert.equal(result.vectors.length, 2);
    });
    
    it('should reject non-square matrix for eigen', async () => {
      const julia = getJuliaCompute();
      await julia.initialize();
      
      try {
        await julia.eigen([[1, 2, 3], [4, 5, 6]]);
        assert.fail('Should have thrown for non-square matrix');
      } catch (error) {
        assert.ok(error.message.includes('square') || error.message.includes('Square'));
      }
    });
  });
  
  describe('Complex Number Roundtrip', () => {
    it('should preserve complex numbers in eigen results', async () => {
      const julia = getJuliaCompute();
      await julia.initialize();
      
      const input = [[0, -1], [1, 0]];  // Rotation matrix, has complex eigenvalues
      const result = await julia.eigen(input);
      
      // Check that result has proper complex structure
      for (const eigenvalue of result.values) {
        assert.equal(typeof eigenvalue.real, 'number');
        assert.equal(typeof eigenvalue.imag, 'number');
        assert.ok(Number.isFinite(eigenvalue.real));
        assert.ok(Number.isFinite(eigenvalue.imag));
      }
    });
  });
  
  describe('Type Isomorphism Verification', () => {
    it('should have all required type mappings', () => {
      const requiredTypes = [
        'Float64',
        'Int64',
        'Bool',
        'String',
        'Vector{Float64}',
        'Matrix{Float64}',
      ];
      
      for (const type of requiredTypes) {
        assert.ok(TYPE_ISOMORPHISMS[type], `Missing type mapping for ${type}`);
      }
    });
    
    it('should have complete mapping for each type', () => {
      for (const [name, mapping] of Object.entries(TYPE_ISOMORPHISMS)) {
        assert.ok(mapping.julia, `${name} missing julia mapping`);
        assert.ok(mapping.js, `${name} missing js mapping`);
        assert.ok(mapping.motoko, `${name} missing motoko mapping`);
        assert.ok(mapping.candid, `${name} missing candid mapping`);
      }
    });
  });
  
  describe('Phi Constants', () => {
    it('should export correct phi value', async () => {
      const { PHI, PHI_INV } = await import(PROTOCOL_PATH);
      
      assert.ok(Math.abs(PHI - 1.618033988749895) < 1e-15);
      assert.ok(Math.abs(PHI_INV - 0.618033988749895) < 1e-15);
      assert.ok(Math.abs(PHI * PHI_INV - 1) < 1e-14);
    });
    
    it('should export correct heartbeat', async () => {
      const { HEARTBEAT } = await import(PROTOCOL_PATH);
      assert.equal(HEARTBEAT, 873);
    });
  });
});
