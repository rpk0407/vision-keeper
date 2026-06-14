// Resolve which model each keeper/chief agent runs on. Pure function + thin CLI.
// Precedence (highest first): command argument -> config.models.<agent> -> config.model -> "inherit".

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const AGENTS = ['functional', 'experience', 'scope', 'promise', 'chief', 'watcher'];
const ALIASES = ['inherit', 'sonnet', 'opus', 'haiku', 'fable'];

export function isValidModel(m) {
  if (typeof m !== 'string') return false;
  const t = m.trim();
  if (!t) return false;
  if (ALIASES.includes(t)) return true;
  // Full model ids, e.g. claude-opus-4-8. No spaces; sane chars only.
  return /^[a-z0-9][a-z0-9.\-]*$/i.test(t);
}

export function resolveModels({ argModel = null, config = {} } = {}) {
  const errors = [];
  const validate = (m, where) => {
    if (m != null && !isValidModel(m)) errors.push(`Invalid model "${m}" in ${where}`);
  };
  validate(argModel, 'argument');
  validate(config.model, 'config.model');
  const perAgent = config.models || {};
  for (const key of Object.keys(perAgent)) {
    if (AGENTS.includes(key)) validate(perAgent[key], `config.models.${key}`);
  }
  const models = {};
  for (const a of AGENTS) {
    models[a] = argModel || perAgent[a] || config.model || 'inherit';
  }
  return { models, errors, valid: errors.length === 0 };
}

// CLI: node scripts/vision-config.mjs [argModel] [configPath]
//   prints the resolved per-agent model map as JSON; exit 1 if any model is invalid.
const invokedDirectly =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  const [rawArg, configPath] = process.argv.slice(2);
  const argModel = rawArg && rawArg.trim() ? rawArg.trim() : null;
  let config = {};
  if (configPath && existsSync(configPath)) {
    try {
      config = JSON.parse(readFileSync(configPath, 'utf8'));
    } catch (e) {
      console.error(`error: cannot parse config '${configPath}': ${e.message}`);
      process.exit(1);
    }
  }
  const r = resolveModels({ argModel, config });
  if (!r.valid) {
    console.error('invalid model configuration:\n  ' + r.errors.join('\n  '));
    process.exit(1);
  }
  process.stdout.write(JSON.stringify(r.models, null, 2) + '\n');
  process.exit(0);
}
