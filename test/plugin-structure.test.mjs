import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const SKILLS = ['skills/vision-init/SKILL.md', 'skills/vision-judge/SKILL.md'];
const AGENTS = [
  'agents/keeper-functional.md',
  'agents/keeper-experience.md',
  'agents/keeper-scope.md',
  'agents/keeper-promise.md',
  'agents/chief-keeper.md',
];

function frontmatter(path) {
  const m = readFileSync(path, 'utf8').match(/^---\n([\s\S]*?)\n---/);
  assert.ok(m, `${path} has no frontmatter block`);
  const fm = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2].trim();
  }
  return fm;
}

test('every skill has a description', () => {
  for (const s of SKILLS) {
    const fm = frontmatter(s);
    assert.ok(fm.description, `${s} missing description`);
  }
});

test('every agent has name + description', () => {
  for (const a of AGENTS) {
    const fm = frontmatter(a);
    assert.ok(fm.name, `${a} missing name`);
    assert.ok(fm.description, `${a} missing description`);
  }
});

test('plugin manifest is valid JSON with a name', () => {
  const manifest = JSON.parse(readFileSync('.claude-plugin/plugin.json', 'utf8'));
  assert.equal(manifest.name, 'vision-keeper');
});
