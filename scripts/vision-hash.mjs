import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

// Canonical form used for hashing:
//  - normalize CRLF / CR to LF (so Windows and Unix checkouts agree)
//  - drop the vision_hash line (the hash must never depend on itself)
//  - trim trailing whitespace, end with exactly one newline
export function canonicalize(content) {
  const lines = content.split(/\r\n|\r|\n/);
  // Locate the leading YAML frontmatter block: line 0 is '---', closed by the next '---'.
  let fmEnd = -1;
  if (lines[0] !== undefined && lines[0].trim() === '---') {
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '---') { fmEnd = i; break; }
    }
  }
  const kept = lines.filter((line, idx) => {
    const inFrontmatter = fmEnd !== -1 && idx > 0 && idx < fmEnd;
    return !(inFrontmatter && /^\s*vision_hash\s*:/.test(line));
  });
  return kept.join('\n').replace(/\s+$/, '') + '\n';
}

export function computeHash(content) {
  return createHash('sha256').update(canonicalize(content), 'utf8').digest('hex');
}

export function extractStoredHash(content) {
  const m = content.match(/vision_hash\s*:\s*([0-9a-f]{64})(?![0-9a-f])/);
  return m ? m[1] : null;
}

export function verifyHash(content, expected) {
  return computeHash(content) === expected;
}

// CLI: node scripts/vision-hash.mjs <compute|verify> <file>
//   compute -> prints the hash to stdout (exit 0)
//   verify  -> exit 0 if the file's stored hash matches its content, else exit 1
const invokedDirectly =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  const [cmd, file] = process.argv.slice(2);
  if (!cmd || !file) {
    console.error('usage: node scripts/vision-hash.mjs <compute|verify> <file>');
    process.exit(2);
  }
  let content;
  try {
    content = readFileSync(file, 'utf8');
  } catch (e) {
    console.error(`error: cannot read file '${file}': ${e.message}`);
    process.exit(2);
  }
  if (cmd === 'compute') {
    process.stdout.write(computeHash(content) + '\n');
    process.exit(0);
  } else if (cmd === 'verify') {
    const stored = extractStoredHash(content);
    if (stored && verifyHash(content, stored)) {
      console.log('OK: vision hash matches content');
      process.exit(0);
    }
    console.error('TAMPERED: stored hash does not match content (or is missing)');
    process.exit(1);
  } else {
    console.error(`unknown command: ${cmd}`);
    process.exit(2);
  }
}
