// Live-watch ledger — the "Cage" observation layer.
// Records WHAT the coding agents changed (tool + path + timestamp) so the human knows when
// enough has shifted to warrant a Watcher grill. Deterministic, near-zero cost.
//
// Two hard rules (security + UX):
//   1. NEVER log file CONTENT — only the path. (No accidental secret capture; cheap.)
//   2. The `record` path MUST always exit 0 — a logging hook must never block a user's edit.

import { readFileSync, appendFileSync, mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, join } from 'node:path';

const DIR = '.vision-keeper';
const LEDGER = join(DIR, 'ledger.jsonl');
const MARKER = join(DIR, 'last-watch');
const THRESHOLD = 8;

// Pure: pull {tool, file} from a Claude Code hook payload. null if it isn't a code edit.
export function parseHookPayload(raw) {
  let p;
  try { p = JSON.parse(raw); } catch { return null; }
  if (!p || typeof p !== 'object') return null;
  const tool = p.tool_name || p.tool || null;
  const input = p.tool_input || p.toolInput || {};
  const file = input.file_path || input.path || input.filePath || null;
  if (!tool || !file) return null;
  return { tool: String(tool), file: String(file) };
}

// Pure: how many records came after the marker count (never negative).
export function countSince(totalRecords, markerCount) {
  return Math.max(0, (totalRecords || 0) - (markerCount || 0));
}

function ensureDir() { if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true }); }
function totalCount() {
  try { return readFileSync(LEDGER, 'utf8').split('\n').filter((l) => l.trim()).length; }
  catch { return 0; }
}
function readMarker() {
  try { return parseInt(readFileSync(MARKER, 'utf8'), 10) || 0; } catch { return 0; }
}

const invokedDirectly =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  const cmd = process.argv[2];

  if (cmd === 'record') {
    try {
      const rec = parseHookPayload(readFileSync(0, 'utf8'));
      if (rec) {
        ensureDir();
        appendFileSync(LEDGER, JSON.stringify({ ts: new Date().toISOString(), ...rec }) + '\n');
      }
    } catch { /* never throw from a hook */ }
    process.exit(0);
  }

  if (cmd === 'status') {
    try {
      const n = countSince(totalCount(), readMarker());
      if (n >= THRESHOLD) {
        console.log(`vision-keeper: ${n} changes since the last watch — run /vision-keeper:vision-watch to grill the work against the vision.`);
      }
    } catch { /* a nudge must never break the Stop hook */ }
    process.exit(0);
  }

  if (cmd === 'checkpoint') {
    try { ensureDir(); writeFileSync(MARKER, String(totalCount())); } catch { /* non-fatal */ }
    process.exit(0);
  }

  if (cmd === 'mark') {
    // Record a non-file event (e.g. a subagent finishing) so team builds still tick the ledger.
    try {
      ensureDir();
      appendFileSync(LEDGER, JSON.stringify({ ts: new Date().toISOString(), event: process.argv[3] || 'event' }) + '\n');
    } catch { /* never throw from a hook */ }
    process.exit(0);
  }

  console.error('usage: node scripts/vision-ledger.mjs <record|status|checkpoint|mark>');
  process.exit(2);
}
