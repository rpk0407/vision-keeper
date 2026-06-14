// Setup detector — reads the user's project to adapt Vision-Keeper to their reality:
// project type, how to run it, and the agent topology (solo session vs an agent team).
// Pure logic is testable; the CLI does the filesystem reads.

import { readFileSync, readdirSync, accessSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

// Pure: derive the setup from already-gathered inputs.
//   pkg       parsed package.json (or null)
//   files     list of relevant paths that exist (e.g. 'index.html', '.claude/agents/x.md')
//   claudeMd  contents of CLAUDE.md (or '')
export function detectProject({ pkg = null, files = [], claudeMd = '' } = {}) {
  const has = (p) => files.includes(p);
  const dep = (n) => pkg && ((pkg.dependencies && pkg.dependencies[n]) || (pkg.devDependencies && pkg.devDependencies[n]));

  let projectType = 'unknown';
  if (dep('next')) projectType = 'Next.js app';
  else if (dep('vite')) projectType = 'Vite app';
  else if (dep('react')) projectType = 'React app';
  else if (dep('express') || (pkg && pkg.type === 'module')) projectType = 'Node service';
  else if (has('pyproject.toml') || has('requirements.txt')) projectType = 'Python project';
  else if (has('index.html')) projectType = 'Static site';
  else if (pkg) projectType = 'Node project';

  const scripts = (pkg && pkg.scripts) || {};
  const commands = {};
  if (scripts.dev) commands.dev = 'npm run dev';
  else if (scripts.start) commands.dev = 'npm start';
  if (scripts.build) commands.build = 'npm run build';
  if (scripts.test) commands.test = 'npm test';

  const runnable = !!(commands.dev || has('index.html'));

  const teamSignals = [];
  if (files.some((f) => /^\.claude\/agents\/.+\.md$/.test(f))) teamSignals.push('.claude/agents present');
  if (files.some((f) => /^agents\/.+\.md$/.test(f))) teamSignals.push('agents/ directory present');
  if (/subagent|parallel agents|agent team|multi-?agent|dispatch[^.\n]{0,24}agents/i.test(claudeMd)) {
    teamSignals.push('CLAUDE.md describes subagents');
  }
  const topology = teamSignals.length ? 'team' : 'solo';

  const reasons = [
    `project type: ${projectType}`,
    runnable ? `runnable: ${commands.dev || 'static index.html'}` : 'runnable: no (code-only judging)',
    `topology: ${topology}${teamSignals.length ? ` (${teamSignals.join('; ')})` : ' (single session)'}`,
  ];
  return { projectType, runnable, commands, topology, teamSignals, reasons };
}

const invokedDirectly =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  const exists = (p) => { try { accessSync(p); return true; } catch { return false; } };
  const listMd = (dir) => { try { return readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => `${dir}/${f}`); } catch { return []; } };

  const files = [];
  for (const p of ['package.json', 'index.html', 'pyproject.toml', 'requirements.txt', 'next.config.js', 'vite.config.js', 'CLAUDE.md']) {
    if (exists(p)) files.push(p);
  }
  listMd('.claude/agents').forEach((p) => files.push(p));
  listMd('agents').forEach((p) => files.push(p));

  let pkg = null;
  try { pkg = JSON.parse(readFileSync('package.json', 'utf8')); } catch { /* none */ }
  let claudeMd = '';
  try { claudeMd = readFileSync('CLAUDE.md', 'utf8'); } catch { /* none */ }

  process.stdout.write(JSON.stringify(detectProject({ pkg, files, claudeMd }), null, 2) + '\n');
  process.exit(0);
}
