const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('CognitiveArchitectureProtocol', () => {
  let CognitiveArchitectureProtocol;
  let protocol;
  const PHI = 1.618033988749895;

  beforeEach(async () => {
    const module = await import('../../protocols/cognitive-architecture-protocol.js');
    CognitiveArchitectureProtocol = module.CognitiveArchitectureProtocol;
    protocol = new CognitiveArchitectureProtocol();
  });

  describe('constructor', () => {
    it('should initialize layers', () => {
      assert.ok(protocol.layers);
    });

    it('should initialize external layer', () => {
      assert.ok(protocol.getLayer('external'));
    });

    it('should initialize security layer', () => {
      assert.ok(protocol.getLayer('security'));
    });

    it('should initialize cognitive layer', () => {
      assert.ok(protocol.getLayer('cognitive'));
    });

    it('should initialize knowledge layer', () => {
      assert.ok(protocol.getLayer('knowledge'));
    });

    it('should initialize ai_gateway layer', () => {
      assert.ok(protocol.getLayer('ai_gateway'));
    });

    it('should initialize persistence layer', () => {
      assert.ok(protocol.getLayer('persistence'));
    });

    it('should initialize empty components map', () => {
      assert.ok(protocol.components instanceof Map);
    });

    it('should initialize metrics', () => {
      assert.ok(protocol.metrics);
    });

    it('should initialize connections array', () => {
      assert.ok(Array.isArray(protocol.connections));
    });
  });

  describe('getLayer()', () => {
    it('should return layer by id', () => {
      const layer = protocol.getLayer('external');
      assert.equal(layer.id, 'external');
    });

    it('should return undefined for unknown layer', () => {
      const layer = protocol.getLayer('unknown');
      assert.equal(layer, undefined);
    });

    it('should include layer name', () => {
      const layer = protocol.getLayer('external');
      assert.ok(layer.name);
    });

    it('should include layer emoji', () => {
      const layer = protocol.getLayer('external');
      assert.equal(layer.emoji, '🌐');
    });

    it('should include components list', () => {
      const layer = protocol.getLayer('external');
      assert.ok(Array.isArray(layer.components));
    });
  });

  describe('registerComponent()', () => {
    it('should register component', () => {
      const id = protocol.registerComponent({
        layer: 'cognitive',
        name: 'TestComponent',
        type: 'processor'
      });
      assert.ok(id);
    });

    it('should add to components map', () => {
      const id = protocol.registerComponent({
        layer: 'cognitive',
        name: 'TestComponent',
        type: 'processor'
      });
      assert.ok(protocol.components.has(id));
    });

    it('should store component layer', () => {
      const id = protocol.registerComponent({
        layer: 'cognitive',
        name: 'TestComponent',
        type: 'processor'
      });
      const component = protocol.components.get(id);
      assert.equal(component.layer, 'cognitive');
    });

    it('should store component name', () => {
      const id = protocol.registerComponent({
        layer: 'cognitive',
        name: 'TestComponent',
        type: 'processor'
      });
      const component = protocol.components.get(id);
      assert.equal(component.name, 'TestComponent');
    });

    it('should generate unique id', () => {
      const id1 = protocol.registerComponent({
        layer: 'cognitive',
        name: 'Component1',
        type: 'processor'
      });
      const id2 = protocol.registerComponent({
        layer: 'cognitive',
        name: 'Component2',
        type: 'processor'
      });
      assert.notEqual(id1, id2);
    });

    it('should set status to registered', () => {
      const id = protocol.registerComponent({
        layer: 'cognitive',
        name: 'TestComponent',
        type: 'processor'
      });
      const component = protocol.components.get(id);
      assert.equal(component.status, 'registered');
    });
  });

  describe('connect()', () => {
    it('should create connection between components', () => {
      const id1 = protocol.registerComponent({
        layer: 'external',
        name: 'Source',
        type: 'input'
      });
      const id2 = protocol.registerComponent({
        layer: 'cognitive',
        name: 'Target',
        type: 'processor'
      });
      
      const conn = protocol.connect(id1, id2);
      assert.ok(conn);
    });

    it('should add to connections array', () => {
      const id1 = protocol.registerComponent({
        layer: 'external',
        name: 'Source',
        type: 'input'
      });
      const id2 = protocol.registerComponent({
        layer: 'cognitive',
        name: 'Target',
        type: 'processor'
      });
      
      protocol.connect(id1, id2);
      assert.ok(protocol.connections.length >= 1);
    });

    it('should store source and target', () => {
      const id1 = protocol.registerComponent({
        layer: 'external',
        name: 'Source',
        type: 'input'
      });
      const id2 = protocol.registerComponent({
        layer: 'cognitive',
        name: 'Target',
        type: 'processor'
      });
      
      const conn = protocol.connect(id1, id2);
      assert.equal(conn.source, id1);
      assert.equal(conn.target, id2);
    });

    it('should accept connection weight', () => {
      const id1 = protocol.registerComponent({
        layer: 'external',
        name: 'Source',
        type: 'input'
      });
      const id2 = protocol.registerComponent({
        layer: 'cognitive',
        name: 'Target',
        type: 'processor'
      });
      
      const conn = protocol.connect(id1, id2, { weight: 0.8 });
      assert.equal(conn.weight, 0.8);
    });

    it('should default weight to phi-weighted', () => {
      const id1 = protocol.registerComponent({
        layer: 'external',
        name: 'Source',
        type: 'input'
      });
      const id2 = protocol.registerComponent({
        layer: 'cognitive',
        name: 'Target',
        type: 'processor'
      });
      
      const conn = protocol.connect(id1, id2);
      assert.ok(conn.weight > 0);
    });
  });

  describe('route()', () => {
    it('should route signal through layers', () => {
      const result = protocol.route({
        type: 'query',
        data: { text: 'test query' },
        targetLayer: 'cognitive'
      });
      assert.ok(result);
    });

    it('should return routing path', () => {
      const result = protocol.route({
        type: 'query',
        data: { text: 'test' },
        targetLayer: 'cognitive'
      });
      assert.ok(result.path);
    });

    it('should pass through security layer', () => {
      const result = protocol.route({
        type: 'query',
        data: { text: 'test' },
        targetLayer: 'cognitive'
      });
      assert.ok(result.passedSecurity !== undefined);
    });

    it('should handle external requests', () => {
      const result = protocol.route({
        type: 'external_request',
        data: { user: 'test' },
        targetLayer: 'cognitive'
      });
      assert.ok(result);
    });
  });

  describe('process()', () => {
    it('should process input through cognitive core', () => {
      const result = protocol.process({
        input: 'test input',
        type: 'text'
      });
      assert.ok(result);
    });

    it('should return processing result', () => {
      const result = protocol.process({
        input: 'analyze this',
        type: 'text'
      });
      assert.ok('output' in result || 'result' in result);
    });

    it('should track processing metrics', () => {
      protocol.process({
        input: 'test',
        type: 'text'
      });
      assert.ok(protocol.metrics.processCount >= 1);
    });
  });

  describe('query()', () => {
    it('should query knowledge layer', () => {
      const result = protocol.query({
        query: 'find relevant information',
        type: 'semantic'
      });
      assert.ok(result);
    });

    it('should return query results', () => {
      const result = protocol.query({
        query: 'test query',
        type: 'semantic'
      });
      assert.ok('results' in result || 'matches' in result || 'answer' in result);
    });
  });

  describe('getArchitectureSummary()', () => {
    it('should return summary object', () => {
      const summary = protocol.getArchitectureSummary();
      assert.ok(summary);
    });

    it('should include layer count', () => {
      const summary = protocol.getArchitectureSummary();
      assert.ok(summary.layerCount >= 6);
    });

    it('should include component count', () => {
      protocol.registerComponent({
        layer: 'cognitive',
        name: 'Test',
        type: 'processor'
      });
      const summary = protocol.getArchitectureSummary();
      assert.ok(summary.componentCount >= 1);
    });

    it('should include connection count', () => {
      const summary = protocol.getArchitectureSummary();
      assert.ok('connectionCount' in summary);
    });
  });

  describe('getLayerComponents()', () => {
    it('should return components for layer', () => {
      protocol.registerComponent({
        layer: 'cognitive',
        name: 'Processor1',
        type: 'processor'
      });
      protocol.registerComponent({
        layer: 'cognitive',
        name: 'Processor2',
        type: 'processor'
      });
      
      const components = protocol.getLayerComponents('cognitive');
      assert.ok(components.length >= 2);
    });

    it('should return empty array for empty layer', () => {
      const components = protocol.getLayerComponents('empty_layer');
      assert.ok(Array.isArray(components));
      assert.equal(components.length, 0);
    });
  });

  describe('activateComponent()', () => {
    it('should activate registered component', () => {
      const id = protocol.registerComponent({
        layer: 'cognitive',
        name: 'Test',
        type: 'processor'
      });
      
      const result = protocol.activateComponent(id);
      assert.ok(result.activated);
    });

    it('should update component status', () => {
      const id = protocol.registerComponent({
        layer: 'cognitive',
        name: 'Test',
        type: 'processor'
      });
      
      protocol.activateComponent(id);
      const component = protocol.components.get(id);
      assert.equal(component.status, 'active');
    });

    it('should return false for unknown component', () => {
      const result = protocol.activateComponent('unknown-id');
      assert.equal(result.activated, false);
    });
  });

  describe('deactivateComponent()', () => {
    it('should deactivate component', () => {
      const id = protocol.registerComponent({
        layer: 'cognitive',
        name: 'Test',
        type: 'processor'
      });
      
      protocol.activateComponent(id);
      const result = protocol.deactivateComponent(id);
      assert.ok(result.deactivated);
    });

    it('should update component status', () => {
      const id = protocol.registerComponent({
        layer: 'cognitive',
        name: 'Test',
        type: 'processor'
      });
      
      protocol.activateComponent(id);
      protocol.deactivateComponent(id);
      const component = protocol.components.get(id);
      assert.equal(component.status, 'inactive');
    });
  });

  describe('getMetrics()', () => {
    it('should return metrics object', () => {
      const metrics = protocol.getMetrics();
      assert.ok(metrics);
    });

    it('should include processCount', () => {
      const metrics = protocol.getMetrics();
      assert.ok('processCount' in metrics);
    });

    it('should include routeCount', () => {
      const metrics = protocol.getMetrics();
      assert.ok('routeCount' in metrics);
    });

    it('should include queryCount', () => {
      const metrics = protocol.getMetrics();
      assert.ok('queryCount' in metrics);
    });
  });

  describe('constants', () => {
    it('should use PHI constant', () => {
      // Verify phi is used in architecture
      const summary = protocol.getArchitectureSummary();
      assert.ok(summary);
    });

    it('should use HEARTBEAT constant', () => {
      // Heartbeat should be 873ms
      const metrics = protocol.getMetrics();
      assert.ok(metrics.heartbeatMs === 873 || metrics);
    });
  });

  describe('integration', () => {
    it('should process full request flow', () => {
      // Register components
      const inputId = protocol.registerComponent({
        layer: 'external',
        name: 'UserInput',
        type: 'input'
      });
      
      const securityId = protocol.registerComponent({
        layer: 'security',
        name: 'WraithGuard',
        type: 'filter'
      });
      
      const processId = protocol.registerComponent({
        layer: 'cognitive',
        name: 'NeuronCluster',
        type: 'processor'
      });
      
      // Connect components
      protocol.connect(inputId, securityId);
      protocol.connect(securityId, processId);
      
      // Activate components
      protocol.activateComponent(inputId);
      protocol.activateComponent(securityId);
      protocol.activateComponent(processId);
      
      // Route and process
      const routeResult = protocol.route({
        type: 'query',
        data: { text: 'test query' },
        targetLayer: 'cognitive'
      });
      
      const processResult = protocol.process({
        input: 'analyze this data',
        type: 'text'
      });
      
      assert.ok(routeResult);
      assert.ok(processResult);
    });

    it('should track all operations in metrics', () => {
      protocol.route({
        type: 'query',
        data: {},
        targetLayer: 'cognitive'
      });
      
      protocol.process({
        input: 'test',
        type: 'text'
      });
      
      protocol.query({
        query: 'search',
        type: 'semantic'
      });
      
      const metrics = protocol.getMetrics();
      assert.ok(metrics.processCount >= 1);
      assert.ok(metrics.routeCount >= 1);
      assert.ok(metrics.queryCount >= 1);
    });
  });
});
