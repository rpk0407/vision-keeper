import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const SKILLS = [
  'skills/vision-setup/SKILL.md',
  'skills/vision-init/SKILL.md',
  'skills/vision-judge/SKILL.md',
  'skills/vision-watch/SKILL.md',
];
const AGENTS = [
  'agents/keeper-functional.md',
  'agents/keeper-experience.md',
  'agents/keeper-scope.md',
  'agents/keeper-promise.md',
  'agents/chief-keeper.md',
  'agents/watcher.md',
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

test('hooks file is valid JSON and wires the ledger on Write/Edit and Stop', () => {
  const hooks = JSON.parse(readFileSync('hooks/hooks.json', 'utf8'));
  const post = hooks.hooks.PostToolUse[0];
  assert.equal(post.matcher, 'Write|Edit');
  assert.match(post.hooks[0].command, /vision-ledger\.mjs" record/);
  assert.match(hooks.hooks.Stop[0].hooks[0].command, /vision-ledger\.mjs" status/);
  assert.match(hooks.hooks.SubagentStop[0].hooks[0].command, /vision-ledger\.mjs" mark subagent/);
});
