// Parse + validate a VISION.lock file. Pure functions, no I/O.

const REQUIRED_SECTIONS = ['Success criteria', 'Promises', 'Non-goals'];

export function parseVision(content) {
  const norm = content.replace(/\r\n|\r/g, '\n');
  const fmMatch = norm.match(/^---\n([\s\S]*?)\n---\n?/);
  const frontmatter = {};
  let body = norm;
  if (fmMatch) {
    for (const line of fmMatch[1].split('\n')) {
      const kv = line.match(/^([A-Za-z0-9_]+)\s*:\s*(.*)$/);
      if (kv) frontmatter[kv[1]] = kv[2].trim();
    }
    body = norm.slice(fmMatch[0].length);
  }

  // Split body into sections keyed by "## Heading".
  const sections = {};
  const parts = body.split(/^##\s+/m);
  for (const part of parts.slice(1)) {
    const nl = part.indexOf('\n');
    const heading = (nl === -1 ? part : part.slice(0, nl)).trim();
    const text = nl === -1 ? '' : part.slice(nl + 1).trim();
    sections[heading] = text;
  }

  const listFrom = (heading) =>
    (sections[heading] || '')
      .split('\n')
      .filter((l) => /^\s*[-*]\s+/.test(l))
      .map((l) => l.replace(/^\s*[-*]\s+/, '').trim());

  return {
    frontmatter,
    sections,
    promises: listFrom('Promises'),
    nonGoals: listFrom('Non-goals'),
    successCriteria: listFrom('Success criteria'),
  };
}

export function validateVision(content) {
  const errors = [];
  const v = parseVision(content);
  if (!v.frontmatter.project) errors.push('Missing frontmatter field: project');
  if (!v.frontmatter.sealed_at) errors.push('Missing frontmatter field: sealed_at');
  if (!v.frontmatter.vision_hash) errors.push('Missing frontmatter field: vision_hash');
  for (const s of REQUIRED_SECTIONS) {
    if (!(s in v.sections)) errors.push(`Missing required section: ## ${s}`);
  }
  if ((v.promises || []).length === 0) errors.push('Promises section has no items');
  return { valid: errors.length === 0, errors, vision: v };
}
