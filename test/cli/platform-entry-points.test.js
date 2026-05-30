const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const TOOLS_PAGE = path.resolve(__dirname, '..', '..', 'tools.html');

describe('platform entry points', () => {
  it('should define the platform entry points section on tools page', () => {
    const content = fs.readFileSync(TOOLS_PAGE, 'utf8');
    assert.match(content, /id="platform-entry-points"/);
    assert.match(content, /Trading Online Platform/);
    assert.match(content, /AI Agentic Platform/);
    assert.match(content, /Native Platform/);
    assert.match(content, /And More/);
  });

  it('should link entry points to existing platform surfaces', () => {
    const content = fs.readFileSync(TOOLS_PAGE, 'utf8');
    assert.match(content, /href="\.\/index-legacy\.html#usecases"/);
    assert.match(content, /href="\.\/research\/portal\.html"/);
    assert.match(content, /href="\.\/download\.html"/);
    assert.match(content, /href="\.\/protocols\.html"/);
    assert.match(content, /href="\.\/docs\.html"/);
    assert.match(content, /href="\.\/sandbox-labs\.html"/);
  });
});
