---
name: vision-judge
description: Use when the user declares a project DONE, to judge the delivered product against its frozen VISION.lock. Verifies the vision hash, then wakes a blind 4-lens panel of keeper subagents (functional, experience, scope, promise) plus a chief synthesizer, and writes a shareable acceptance report. The keepers never see how the product was built.
---

You are running the Vision-Keeper judgment. The keepers must stay BLIND: they judge the
delivered product against the frozen vision, with no knowledge of how it was built.

## Step 1 — Locate and verify the vision

Find `VISION.lock` in the project root. If missing, tell the user to run
`/vision-keeper:vision-init` first and STOP.

Verify integrity (deterministic — do not eyeball it):

    node "${CLAUDE_PLUGIN_ROOT}/scripts/vision-hash.mjs" verify "VISION.lock"

Record the result. `OK` -> hash MATCHES. Non-zero exit / TAMPERED -> the vision was edited
after sealing; continue, but the chief must flag it loudly in the report.

## Step 2 — Determine inspection mode

Decide if the project is runnable (web app with a dev server, etc.). If runnable, start the
Preview MCP and get a live URL for the Experience and Promise keepers. If not runnable
(library/CLI) or it fails to boot, proceed code-only and record that.

## Step 3 — Dispatch the blind panel IN PARALLEL

Dispatch all four keeper subagents in ONE message so they run concurrently. To each, pass
ONLY: (a) the full contents of `VISION.lock`, (b) the absolute path to the delivered source
tree, and (c) the preview URL if available.

CRITICAL — preserving the quarantine:
- Do NOT paste any of this conversation's history, your own prior reasoning, commit messages,
  changelogs, or any hint that Claude built it. Subagents start blank; keep them blank.
- Give each keeper only the vision text + the source pointer + (maybe) the preview URL.
- Dispatch: keeper-functional, keeper-experience, keeper-scope, keeper-promise.

Collect their four returned verdicts verbatim.

## Step 4 — Synthesize via the chief

Dispatch chief-keeper with: the four verdicts, the hash-verification result, the inspection
mode, and the vision contents. It writes `<project>/vision-report-<YYYY-MM-DD>.md` from the
report template, computes an honest fidelity score, and writes the truth tiers.

## Step 5 — Present

Show the user the report path and the overall verdict. Lead with the honest landing — if the
fidelity is low, say so plainly. Do not soften the panel's findings.
