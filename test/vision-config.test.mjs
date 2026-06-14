import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveModels, isValidModel } from '../scripts/vision-config.mjs';

const AGENTS = ['functional', 'experience', 'scope', 'promise', 'chief', 'watcher'];

test('defaults to inherit for every agent', () => {
  const r = resolveModels({});
  assert.equal(r.valid, true);
  for (const a of AGENTS) assert.equal(r.models[a], 'inherit');
});

test('config.model applies to all agents', () => {
  const r = resolveModels({ config: { model: 'opus' } });
  for (const a of AGENTS) assert.equal(r.models[a], 'opus');
});

test('argModel overrides config.model for all agents', () => {
  const r = resolveModels({ argModel: 'haiku', config: { model: 'opus' } });
  for (const a of AGENTS) assert.equal(r.models[a], 'haiku');
});

test('per-agent models override the blanket model', () => {
  const r = resolveModels({ config: { model: 'haiku', models: { experience: 'opus' } } });
  assert.equal(r.models.experience, 'opus');
  assert.equal(r.models.functional, 'haiku');
});

test('precedence is arg > per-agent > model > inherit', () => {
  const r = resolveModels({ argModel: 'sonnet', config: { model: 'haiku', models: { experience: 'opus' } } });
  assert.equal(r.models.experience, 'sonnet');
  assert.equal(r.models.scope, 'sonnet');
});

test('accepts full model ids and the named aliases', () => {
  assert.equal(isValidModel('opus'), true);
  assert.equal(isValidModel('claude-opus-4-8'), true);
  assert.equal(isValidModel('inherit'), true);
});

test('rejects empty, non-string, or spaced model names', () => {
  assert.equal(isValidModel(''), false);
  assert.equal(isValidModel('big model'), false);
  assert.equal(isValidModel(42), false);
  const r = resolveModels({ argModel: 'big model' });
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.includes('big model')));
});

test('an unknown per-agent key is ignored, not crashed', () => {
  const r = resolveModels({ config: { models: { bogus: 'opus' } } });
  assert.equal(r.valid, true);
  for (const a of AGENTS) assert.equal(r.models[a], 'inherit');
});
