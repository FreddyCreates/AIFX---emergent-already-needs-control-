/**
 * type_map.test.js — Type Mapping Tests for Julia-Motoko Bridge
 * 
 * Tests the type isomorphism layer that ensures correct conversion
 * between Julia, JavaScript, and Motoko types.
 * 
 * @module NOVA/tests/type_map.test
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const PROTOCOL_PATH = '../protocols/PROTOCOL-JULIA.js';

describe('Type Isomorphism Map Tests', async () => {
  const { TYPE_ISOMORPHISMS, JuliaCompute } = await import(PROTOCOL_PATH);
  
  describe('Scalar Type Mappings', () => {
    it('should map Float64 correctly', () => {
      const floatMap = TYPE_ISOMORPHISMS['Float64'];
      
      assert.equal(floatMap.julia, 'Float64');
      assert.equal(floatMap.js, 'number');
      assert.equal(floatMap.motoko, 'Float');
      assert.equal(floatMap.candid, 'float64');
      assert.equal(floatMap.conversion, 'direct');
    });
    
    it('should map Int64 correctly', () => {
      const intMap = TYPE_ISOMORPHISMS['Int64'];
      
      assert.equal(intMap.julia, 'Int64');
      assert.equal(intMap.js, 'bigint');
      assert.equal(intMap.motoko, 'Int');
      assert.equal(intMap.candid, 'int64');
    });
    
    it('should map Bool correctly', () => {
      const boolMap = TYPE_ISOMORPHISMS['Bool'];
      
      assert.equal(boolMap.julia, 'Bool');
      assert.equal(boolMap.js, 'boolean');
      assert.equal(boolMap.motoko, 'Bool');
      assert.equal(boolMap.candid, 'bool');
    });
    
    it('should map String correctly', () => {
      const stringMap = TYPE_ISOMORPHISMS['String'];
      
      assert.equal(stringMap.julia, 'String');
      assert.equal(stringMap.js, 'string');
      assert.equal(stringMap.motoko, 'Text');
      assert.equal(stringMap.candid, 'text');
    });
  });
  
  describe('Vector Type Mappings', () => {
    it('should map Vector{Float64} correctly', () => {
      const vecMap = TYPE_ISOMORPHISMS['Vector{Float64}'];
      
      assert.equal(vecMap.julia, 'Vector{Float64}');
      assert.equal(vecMap.js, 'Float64Array');
      assert.equal(vecMap.motoko, '[Float]');
      assert.equal(vecMap.candid, 'vec float64');
      assert.equal(vecMap.conversion, 'array_copy');
    });
    
    it('should map Vector{Int64} correctly', () => {
      const vecMap = TYPE_ISOMORPHISMS['Vector{Int64}'];
      
      assert.equal(vecMap.julia, 'Vector{Int64}');
      assert.equal(vecMap.js, 'BigInt64Array');
      assert.equal(vecMap.motoko, '[Int]');
    });
  });
  
  describe('Matrix Type Mappings', () => {
    it('should map Matrix{Float64} correctly', () => {
      const matMap = TYPE_ISOMORPHISMS['Matrix{Float64}'];
      
      assert.equal(matMap.julia, 'Matrix{Float64}');
      assert.equal(matMap.js, 'Float64Array[]');
      assert.equal(matMap.motoko, '[[Float]]');
      assert.equal(matMap.candid, 'vec vec float64');
      assert.equal(matMap.conversion, 'nested_array');
    });
    
    it('should specify column-major to row-major layout conversion', () => {
      const matMap = TYPE_ISOMORPHISMS['Matrix{Float64}'];
      
      assert.equal(matMap.layout, 'column_major_to_row_major');
    });
  });
  
  describe('Complex Type Mappings', () => {
    it('should map Matrix{ComplexF64} correctly', () => {
      const complexMatMap = TYPE_ISOMORPHISMS['Matrix{ComplexF64}'];
      
      assert.ok(complexMatMap);
      assert.equal(complexMatMap.conversion, 'complex_nested');
    });
  });
  
  describe('Result Type Mappings', () => {
    it('should map EigenResult correctly', () => {
      const eigenMap = TYPE_ISOMORPHISMS['EigenResult'];
      
      assert.ok(eigenMap);
      assert.equal(eigenMap.conversion, 'structured');
    });
    
    it('should map FFTResult correctly', () => {
      const fftMap = TYPE_ISOMORPHISMS['FFTResult'];
      
      assert.ok(fftMap);
      assert.equal(fftMap.conversion, 'complex_array');
    });
    
    it('should map OptimizationResult correctly', () => {
      const optimMap = TYPE_ISOMORPHISMS['OptimizationResult'];
      
      assert.ok(optimMap);
      assert.equal(optimMap.conversion, 'structured');
    });
  });
  
  describe('Type Completeness', () => {
    it('should have all required scalar types', () => {
      const scalars = ['Float64', 'Int64', 'Bool', 'String'];
      for (const scalar of scalars) {
        assert.ok(TYPE_ISOMORPHISMS[scalar], `Missing scalar type: ${scalar}`);
      }
    });
    
    it('should have all required vector types', () => {
      const vectors = ['Vector{Float64}', 'Vector{Int64}'];
      for (const vec of vectors) {
        assert.ok(TYPE_ISOMORPHISMS[vec], `Missing vector type: ${vec}`);
      }
    });
    
    it('should have all required result types', () => {
      const results = ['EigenResult', 'FFTResult', 'OptimizationResult'];
      for (const result of results) {
        assert.ok(TYPE_ISOMORPHISMS[result], `Missing result type: ${result}`);
      }
    });
  });
  
  describe('Type Consistency', () => {
    it('should have consistent conversion strategies', () => {
      const directTypes = ['Float64', 'Int64', 'Bool', 'String'];
      const arrayTypes = ['Vector{Float64}', 'Vector{Int64}'];
      
      for (const type of directTypes) {
        assert.equal(TYPE_ISOMORPHISMS[type].conversion, 'direct');
      }
      
      for (const type of arrayTypes) {
        assert.equal(TYPE_ISOMORPHISMS[type].conversion, 'array_copy');
      }
    });
  });
});

describe('Matrix Layout Conversion Tests', async () => {
  const { JuliaCompute } = await import(PROTOCOL_PATH);
  
  describe('Transpose Operations', () => {
    it('should correctly transpose a 2x2 matrix', () => {
      const julia = new JuliaCompute();
      
      const input = [[1, 2], [3, 4]];
      const transposed = julia._transposeMatrix(input);
      
      assert.deepEqual(transposed, [[1, 3], [2, 4]]);
    });
    
    it('should correctly transpose a 2x3 matrix', () => {
      const julia = new JuliaCompute();
      
      const input = [[1, 2, 3], [4, 5, 6]];
      const transposed = julia._transposeMatrix(input);
      
      assert.equal(transposed.length, 3);
      assert.equal(transposed[0].length, 2);
      assert.deepEqual(transposed, [[1, 4], [2, 5], [3, 6]]);
    });
    
    it('should handle 1x1 matrix', () => {
      const julia = new JuliaCompute();
      
      const input = [[42]];
      const transposed = julia._transposeMatrix(input);
      
      assert.deepEqual(transposed, [[42]]);
    });
    
    it('should handle empty matrix', () => {
      const julia = new JuliaCompute();
      
      const input = [];
      const transposed = julia._transposeMatrix(input);
      
      assert.deepEqual(transposed, []);
    });
    
    it('should be self-inverse (transpose twice = identity)', () => {
      const julia = new JuliaCompute();
      
      const input = [[1, 2, 3], [4, 5, 6]];
      const doubleTransposed = julia._transposeMatrix(julia._transposeMatrix(input));
      
      assert.deepEqual(doubleTransposed, input);
    });
  });
});
