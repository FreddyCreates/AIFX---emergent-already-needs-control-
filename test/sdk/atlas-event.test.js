const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

const AtlasEvent = require('../../sdk/governance/atlas-event.js');

describe('AtlasEvent', () => {
  let tmpEventsDir;

  beforeEach(() => {
    tmpEventsDir = path.join(os.tmpdir(), `atlas-events-test-${Date.now()}`);
    fs.mkdirSync(tmpEventsDir, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(tmpEventsDir)) {
      fs.rmSync(tmpEventsDir, { recursive: true, force: true });
    }
  });

  describe('constructor', () => {
    it('should require entity_id', () => {
      assert.throws(
        () => new AtlasEvent({ op: 'test' }),
        /entity_id is required/
      );
    });

    it('should require op', () => {
      assert.throws(
        () => new AtlasEvent({ entity_id: 'atlas://bot/test' }),
        /op is required/
      );
    });

    it('should generate event id', () => {
      const event = new AtlasEvent({
        entity_id: 'atlas://bot/test',
        op: 'test_op',
      });
      assert.ok(event.id.startsWith('evt-'));
    });

    it('should set entity_id', () => {
      const event = new AtlasEvent({
        entity_id: 'atlas://bot/test',
        op: 'test_op',
      });
      assert.equal(event.entity_id, 'atlas://bot/test');
    });

    it('should set op', () => {
      const event = new AtlasEvent({
        entity_id: 'atlas://bot/test',
        op: 'test_operation',
      });
      assert.equal(event.op, 'test_operation');
    });

    it('should set timestamp', () => {
      const before = new Date().toISOString();
      const event = new AtlasEvent({
        entity_id: 'atlas://bot/test',
        op: 'test_op',
      });
      const after = new Date().toISOString();
      assert.ok(event.ts >= before);
      assert.ok(event.ts <= after);
    });

    it('should set empty context by default', () => {
      const event = new AtlasEvent({
        entity_id: 'atlas://bot/test',
        op: 'test_op',
      });
      assert.deepEqual(event.context, {});
    });

    it('should accept custom context', () => {
      const event = new AtlasEvent({
        entity_id: 'atlas://bot/test',
        op: 'test_op',
        context: { key: 'value', count: 42 },
      });
      assert.deepEqual(event.context, { key: 'value', count: 42 });
    });

    it('should set empty tags by default', () => {
      const event = new AtlasEvent({
        entity_id: 'atlas://bot/test',
        op: 'test_op',
      });
      assert.deepEqual(event.tags, []);
    });

    it('should accept tags array', () => {
      const event = new AtlasEvent({
        entity_id: 'atlas://bot/test',
        op: 'test_op',
        tags: ['tag1', 'tag2'],
      });
      assert.deepEqual(event.tags, ['tag1', 'tag2']);
    });

    it('should convert single tag to array', () => {
      const event = new AtlasEvent({
        entity_id: 'atlas://bot/test',
        op: 'test_op',
        tags: 'single-tag',
      });
      assert.deepEqual(event.tags, ['single-tag']);
    });
  });

  describe('toJSON()', () => {
    it('should return serializable object', () => {
      const event = new AtlasEvent({
        entity_id: 'atlas://bot/test',
        op: 'test_op',
        context: { data: 'value' },
        tags: ['tag1'],
      });
      
      const json = event.toJSON();
      assert.equal(json.id, event.id);
      assert.equal(json.entity_id, 'atlas://bot/test');
      assert.equal(json.op, 'test_op');
      assert.equal(json.ts, event.ts);
      assert.deepEqual(json.context, { data: 'value' });
      assert.deepEqual(json.tags, ['tag1']);
    });

    it('should be JSON serializable', () => {
      const event = new AtlasEvent({
        entity_id: 'atlas://bot/test',
        op: 'test_op',
      });
      
      const json = event.toJSON();
      const str = JSON.stringify(json);
      const parsed = JSON.parse(str);
      assert.deepEqual(parsed, json);
    });
  });

  describe('emit()', () => {
    it('should create events directory if not exists', () => {
      const newDir = path.join(tmpEventsDir, 'nested', 'events');
      const event = new AtlasEvent({
        entity_id: 'atlas://bot/test',
        op: 'test_op',
      });
      
      event.emit(newDir);
      assert.ok(fs.existsSync(newDir));
    });

    it('should write event to file', () => {
      const event = new AtlasEvent({
        entity_id: 'atlas://bot/test',
        op: 'test_op',
      });
      
      const filePath = event.emit(tmpEventsDir);
      assert.ok(fs.existsSync(filePath));
    });

    it('should return file path', () => {
      const event = new AtlasEvent({
        entity_id: 'atlas://bot/test',
        op: 'test_op',
      });
      
      const filePath = event.emit(tmpEventsDir);
      assert.ok(filePath.startsWith(tmpEventsDir));
      assert.ok(filePath.endsWith('.json'));
    });

    it('should slug entity_id in filename', () => {
      const event = new AtlasEvent({
        entity_id: 'atlas://bot/organism-alpha-bot',
        op: 'test_op',
      });
      
      const filePath = event.emit(tmpEventsDir);
      assert.ok(filePath.includes('organism-alpha-bot'));
    });

    it('should write valid JSON', () => {
      const event = new AtlasEvent({
        entity_id: 'atlas://bot/test',
        op: 'test_op',
        context: { key: 'value' },
      });
      
      const filePath = event.emit(tmpEventsDir);
      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(content);
      assert.equal(parsed.entity_id, 'atlas://bot/test');
      assert.deepEqual(parsed.context, { key: 'value' });
    });
  });

  describe('AtlasEvent.bot()', () => {
    it('should create bot event', () => {
      const event = AtlasEvent.bot('alpha-bot', 'census', { count: 10 });
      assert.equal(event.entity_id, 'atlas://bot/alpha-bot');
      assert.equal(event.op, 'census');
      assert.deepEqual(event.context, { count: 10 });
    });

    it('should include bot tag', () => {
      const event = AtlasEvent.bot('test', 'op');
      assert.ok(event.tags.includes('bot'));
    });

    it('should merge extra tags', () => {
      const event = AtlasEvent.bot('test', 'op', {}, ['custom', 'tags']);
      assert.ok(event.tags.includes('bot'));
      assert.ok(event.tags.includes('custom'));
      assert.ok(event.tags.includes('tags'));
    });
  });

  describe('AtlasEvent.agent()', () => {
    it('should create agent event', () => {
      const event = AtlasEvent.agent('copilot', 'query', { prompt: 'test' });
      assert.equal(event.entity_id, 'atlas://agent/copilot');
      assert.equal(event.op, 'query');
    });

    it('should include agent tag', () => {
      const event = AtlasEvent.agent('test', 'op');
      assert.ok(event.tags.includes('agent'));
    });
  });

  describe('AtlasEvent.organism()', () => {
    it('should create organism event', () => {
      const event = AtlasEvent.organism('sovereign', 'lifecycle', { phase: 'init' });
      assert.equal(event.entity_id, 'atlas://organism/sovereign');
      assert.equal(event.op, 'lifecycle');
    });

    it('should include organism tag', () => {
      const event = AtlasEvent.organism('test', 'op');
      assert.ok(event.tags.includes('organism'));
    });
  });

  describe('AtlasEvent.engine()', () => {
    it('should create engine event', () => {
      const event = AtlasEvent.engine('routing', 'route', { target: 'api' });
      assert.equal(event.entity_id, 'atlas://engine/routing');
      assert.equal(event.op, 'route');
    });

    it('should include engine tag', () => {
      const event = AtlasEvent.engine('test', 'op');
      assert.ok(event.tags.includes('engine'));
    });
  });

  describe('AtlasEvent.realm()', () => {
    it('should create realm event', () => {
      const event = AtlasEvent.realm('production', 'deploy', { version: '1.0' });
      assert.equal(event.entity_id, 'atlas://realm/production');
      assert.equal(event.op, 'deploy');
    });

    it('should include realm tag', () => {
      const event = AtlasEvent.realm('test', 'op');
      assert.ok(event.tags.includes('realm'));
    });
  });

  describe('AtlasEvent.loadAll()', () => {
    it('should return empty array for non-existent directory', () => {
      const events = AtlasEvent.loadAll('/nonexistent/dir');
      assert.deepEqual(events, []);
    });

    it('should return empty array for empty directory', () => {
      const events = AtlasEvent.loadAll(tmpEventsDir);
      assert.deepEqual(events, []);
    });

    it('should load all JSON files', () => {
      // Create some event files
      const event1 = AtlasEvent.bot('bot1', 'op1');
      const event2 = AtlasEvent.bot('bot2', 'op2');
      event1.emit(tmpEventsDir);
      event2.emit(tmpEventsDir);
      
      const events = AtlasEvent.loadAll(tmpEventsDir);
      assert.equal(events.length, 2);
    });

    it('should skip non-JSON files', () => {
      const event = AtlasEvent.bot('test', 'op');
      event.emit(tmpEventsDir);
      fs.writeFileSync(path.join(tmpEventsDir, 'not-json.txt'), 'text content');
      
      const events = AtlasEvent.loadAll(tmpEventsDir);
      assert.equal(events.length, 1);
    });

    it('should skip invalid JSON files', () => {
      const event = AtlasEvent.bot('test', 'op');
      event.emit(tmpEventsDir);
      fs.writeFileSync(path.join(tmpEventsDir, 'invalid.json'), '{ invalid json }');
      
      const events = AtlasEvent.loadAll(tmpEventsDir);
      assert.equal(events.length, 1);
    });
  });

  describe('AtlasEvent.ingest()', () => {
    beforeEach(() => {
      // Create test events manually to avoid timestamp collision
      // (events with same entity_id and timestamp get same filename)
      const events = [
        { entity_id: 'atlas://bot/bot1', op: 'op1', ts: '2026-01-01T00:00:01.000Z', tags: ['bot', 'alpha'], context: {} },
        { entity_id: 'atlas://bot/bot1', op: 'op2', ts: '2026-01-01T00:00:02.000Z', tags: ['bot', 'beta'], context: {} },
        { entity_id: 'atlas://agent/agent1', op: 'op1', ts: '2026-01-01T00:00:03.000Z', tags: ['agent', 'alpha'], context: {} },
        { entity_id: 'atlas://organism/org1', op: 'op1', ts: '2026-01-01T00:00:04.000Z', tags: ['organism', 'gamma'], context: {} },
      ];
      events.forEach((e, i) => {
        fs.writeFileSync(
          path.join(tmpEventsDir, `event-${i}.json`),
          JSON.stringify(e, null, 2)
        );
      });
    });

    it('should return all events', () => {
      const result = AtlasEvent.ingest(tmpEventsDir);
      assert.equal(result.all.length, 4);
    });

    it('should group by entity', () => {
      const result = AtlasEvent.ingest(tmpEventsDir);
      assert.ok(result.byEntity instanceof Map);
      assert.equal(result.byEntity.get('atlas://bot/bot1').length, 2);
    });

    it('should group by class', () => {
      const result = AtlasEvent.ingest(tmpEventsDir);
      assert.ok(result.byClass instanceof Map);
      assert.equal(result.byClass.get('bot').length, 2);
      assert.equal(result.byClass.get('agent').length, 1);
      assert.equal(result.byClass.get('organism').length, 1);
    });

    it('should group by tag', () => {
      const result = AtlasEvent.ingest(tmpEventsDir);
      assert.ok(result.byTag instanceof Map);
      assert.equal(result.byTag.get('alpha').length, 2);
      assert.equal(result.byTag.get('beta').length, 1);
    });

    it('should handle empty directory', () => {
      const emptyDir = path.join(tmpEventsDir, 'empty');
      fs.mkdirSync(emptyDir);
      
      const result = AtlasEvent.ingest(emptyDir);
      assert.deepEqual(result.all, []);
      assert.equal(result.byEntity.size, 0);
    });

    it('should handle events without tags', () => {
      const noTagsDir = path.join(tmpEventsDir, 'no-tags');
      fs.mkdirSync(noTagsDir);
      
      // Manually write event without tags
      fs.writeFileSync(
        path.join(noTagsDir, 'event.json'),
        JSON.stringify({ entity_id: 'atlas://bot/test', op: 'test' })
      );
      
      const result = AtlasEvent.ingest(noTagsDir);
      assert.equal(result.all.length, 1);
    });
  });
});
