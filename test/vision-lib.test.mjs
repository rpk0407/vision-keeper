import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseVision, validateVision } from '../scripts/vision-lib.mjs';

const GOOD = [
  '---',
  'project: Demo App',
  'sealed_at: 2026-06-14',
  'vision_hash: ' + 'a'.repeat(64),
  '---',
  '# Dream',
  'A delightful demo that greets people.',
  '',
  '## Success criteria',
  '- A user can see a greeting.',
  '',
  '## Promises',
  '- Shows the user name.',
  '- Works on mobile.',
  '',
  '## Non-goals',
  '- No authentication.',
  '',
].join('\n');

test('parseVision extracts frontmatter fields', () => {
  const v = parseVision(GOOD);
  assert.equal(v.frontmatter.project, 'Demo App');
  assert.equal(v.frontmatter.sealed_at, '2026-06-14');
  assert.equal(v.frontmatter.vision_hash, 'a'.repeat(64));
});

test('parseVision extracts sections by heading', () => {
  const v = parseVision(GOOD);
  assert.ok(v.sections['Success criteria'].includes('see a greeting'));
  assert.deepEqual(v.promises, ['Shows the user name.', 'Works on mobile.']);
  assert.deepEqual(v.nonGoals, ['No authentication.']);
});

test('validateVision passes a complete vision', () => {
  const result = validateVision(GOOD);
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test('validateVision reports each missing required part', () => {
  const noPromises = GOOD.replace(/## Promises[\s\S]*?(?=## Non-goals)/, '');
  const result = validateVision(noPromises);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.toLowerCase().includes('promises')));
});

test('validateVision requires a project name', () => {
  const noProject = GOOD.replace('project: Demo App\n', '');
  const result = validateVision(noProject);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.toLowerCase().includes('project')));
});

test('parseVision handles CRLF line endings', () => {
  const v = parseVision(GOOD.replace(/\n/g, '\r\n'));
  assert.equal(v.frontmatter.project, 'Demo App');
  assert.deepEqual(v.promises, ['Shows the user name.', 'Works on mobile.']);
});
