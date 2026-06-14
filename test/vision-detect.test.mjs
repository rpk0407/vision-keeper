import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectProject } from '../scripts/vision-detect.mjs';

test('detects a Next.js app, runnable, with commands', () => {
  const r = detectProject({
    pkg: { dependencies: { next: '14' }, scripts: { dev: 'next dev', build: 'next build', test: 'vitest' } },
    files: ['package.json', 'next.config.js'],
  });
  assert.equal(r.projectType, 'Next.js app');
  assert.equal(r.runnable, true);
  assert.equal(r.commands.dev, 'npm run dev');
  assert.equal(r.commands.build, 'npm run build');
  assert.equal(r.topology, 'solo');
});

test('a static site with index.html is runnable', () => {
  const r = detectProject({ files: ['index.html'] });
  assert.equal(r.projectType, 'Static site');
  assert.equal(r.runnable, true);
});

test('topology is team when .claude/agents exist', () => {
  const r = detectProject({ files: ['package.json', '.claude/agents/coder.md'] });
  assert.equal(r.topology, 'team');
  assert.ok(r.teamSignals.some((s) => s.includes('.claude/agents')));
});

test('topology is team when CLAUDE.md describes subagents', () => {
  const r = detectProject({ claudeMd: 'We dispatch parallel subagents to build features.' });
  assert.equal(r.topology, 'team');
});

test('a bare folder is unknown, not runnable, solo', () => {
  const r = detectProject({});
  assert.equal(r.projectType, 'unknown');
  assert.equal(r.runnable, false);
  assert.equal(r.topology, 'solo');
  assert.equal(r.reasons.length, 3);
});
