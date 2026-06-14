import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  canonicalize,
  computeHash,
  verifyHash,
  extractStoredHash,
} from '../scripts/vision-hash.mjs';

const SAMPLE = [
  '---',
  'project: Demo',
  'sealed_at: 2026-06-14',
  'vision_hash: 0000000000000000000000000000000000000000000000000000000000000000',
  '---',
  '# Dream',
  'A simple demo.',
  '',
  '## Promises',
  '- It greets the user.',
  '',
].join('\n');

test('hash is identical for CRLF and LF line endings (Windows-safe)', () => {
  const lf = SAMPLE;
  const crlf = SAMPLE.replace(/\n/g, '\r\n');
  assert.equal(computeHash(lf), computeHash(crlf));
});

test('changing the vision_hash line does NOT change the computed hash', () => {
  const a = SAMPLE;
  const b = SAMPLE.replace(/vision_hash: 0+/, 'vision_hash: deadbeef');
  assert.equal(computeHash(a), computeHash(b));
});

test('changing a promise DOES change the computed hash', () => {
  const a = SAMPLE;
  const b = SAMPLE.replace('It greets the user.', 'It greets the admin.');
  assert.notEqual(computeHash(a), computeHash(b));
});

test('verifyHash is true for a correctly stamped file, false for tampered', () => {
  const hash = computeHash(SAMPLE);
  const stamped = SAMPLE.replace(/vision_hash: 0+/, `vision_hash: ${hash}`);
  assert.equal(verifyHash(stamped, hash), true);
  const tampered = stamped.replace('It greets the user.', 'It greets nobody.');
  assert.equal(verifyHash(tampered, hash), false);
});

test('extractStoredHash returns the 64-hex hash or null', () => {
  assert.equal(extractStoredHash('vision_hash: ' + 'a'.repeat(64)), 'a'.repeat(64));
  assert.equal(extractStoredHash('no hash here'), null);
});

test('canonicalize is idempotent', () => {
  assert.equal(canonicalize(canonicalize(SAMPLE)), canonicalize(SAMPLE));
});

test('extractStoredHash rejects an over-length (65-char) hex string', () => {
  assert.equal(extractStoredHash('vision_hash: ' + 'a'.repeat(65)), null);
});

test('hash is identical for CR-only line endings', () => {
  const lf = SAMPLE;
  const cr = SAMPLE.replace(/\n/g, '\r');
  assert.equal(computeHash(lf), computeHash(cr));
});

test('a body line starting with vision_hash: DOES affect the hash (only frontmatter is stripped)', () => {
  const withBody = SAMPLE + '\nvision_hash: should-count-in-body\n';
  assert.notEqual(computeHash(SAMPLE), computeHash(withBody));
});
