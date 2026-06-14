import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHookPayload, countSince } from '../scripts/vision-ledger.mjs';

test('parseHookPayload extracts tool and file from a standard payload', () => {
  const raw = JSON.stringify({ tool_name: 'Edit', tool_input: { file_path: '/p/app.js' } });
  assert.deepEqual(parseHookPayload(raw), { tool: 'Edit', file: '/p/app.js' });
});

test('parseHookPayload tolerates camelCase variants', () => {
  const raw = JSON.stringify({ tool: 'Write', toolInput: { path: 'x.ts' } });
  assert.deepEqual(parseHookPayload(raw), { tool: 'Write', file: 'x.ts' });
});

test('parseHookPayload returns null for malformed JSON', () => {
  assert.equal(parseHookPayload('{not json'), null);
});

test('parseHookPayload returns null when no file path is present', () => {
  assert.equal(parseHookPayload(JSON.stringify({ tool_name: 'Bash', tool_input: {} })), null);
});

test('parseHookPayload never throws on hostile input', () => {
  for (const raw of ['', 'null', '123', '[]', '{}']) {
    assert.doesNotThrow(() => parseHookPayload(raw));
    assert.equal(parseHookPayload(raw), null);
  }
});

test('countSince never goes negative', () => {
  assert.equal(countSince(10, 3), 7);
  assert.equal(countSince(2, 5), 0);
  assert.equal(countSince(0, 0), 0);
});
