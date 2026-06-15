---
name: vision-judge
description: Use when the user declares a project DONE, to judge the delivered product against its frozen VISION.lock. Verifies the vision hash, then wakes a blind 4-lens panel of keeper subagents (functional, experience, scope, promise) plus a chief synthesizer, and writes a shareable acceptance report. The keepers never see how the product was built. Accepts an optional model argument (e.g. /vision-keeper:vision-judge opus) to choose which model the keepers run on.
---

You are running the Vision-Keeper judgment. The keepers must stay BLIND: they judge the
delivered product against the frozen vision, with no knowledge of how it was built.

## Step 0 — Resolve which model the keepers run on

Compute the per-agent model map deterministically (do not guess the precedence):

    node "${CLAUDE_PLUGIN_ROOT}/scripts/vision-config.mjs" "$ARGUMENTS" ".vision-keeper.json"

This prints a JSON map like `{ "functional": "...", "experience": "...", "scope": "...",
"promise": "...", "chief": "...", "watcher": "..." }` (use the four keeper keys and `chief`;
ignore `watcher` here). Precedence: the command argument (e.g. `opus`) wins,
then per-agent entries in `.vision-keeper.json`, then its blanket `model`, else `inherit`
(the session model). If it exits non-zero (invalid model), show the error and STOP.

Use each agent's resolved value as the `model` when you dispatch it below. `inherit` means
do not override — let it use the session model.

## Step 1 — Locate and verify the vision

Find `VISION.lock` in the project root. If missing, tell the user to run
`/vision-keeper:vision-init` first and STOP.

Verify integrity (deterministic — do not eyeball it):

    node "${CLAUDE_PLUGIN_ROOT}/scripts/vision-hash.mjs" verify "VISION.lock"

Record the result. `OK` -> hash MATCHES. Non-zero exit / TAMPERED -> the vision was edited
after sealing; continue, but the chief must flag it loudly in the report.

## Step 2 — Determine inspection mode

Check `.vision-keeper.json` for the `setup` block written by `vision-setup` (`setup.runnable`
and `setup.commands.dev`). If runnable, start the Preview MCP with that dev command and get a
live URL for the Experience and Promise keepers. If not runnable (library/CLI) or it fails to
boot, proceed code-only and record that. (If no `setup` block exists, run the detector first:
`node "${CLAUDE_PLUGIN_ROOT}/scripts/vision-detect.mjs"`.)

## Step 3 — Dispatch the blind panel IN PARALLEL

Dispatch all four keeper subagents in ONE message so they run concurrently. To each, pass
ONLY: (a) the full contents of `VISION.lock`, (b) the absolute path to the delivered source
tree, and (c) the preview URL if available.

CRITICAL — preserving the quarantine:
- Do NOT paste any of this conversation's history, your own prior reasoning, commit messages,
  changelogs, or any hint that Claude built it. Subagents start blank; keep them blank.
- Give each keeper only the vision text + the source pointer + (maybe) the preview URL.
- Dispatch: keeper-functional, keeper-experience, keeper-scope, keeper-promise — each with
  the model resolved for it in Step 0 (skip the override when its value is `inherit`).

Collect their four returned verdicts verbatim.

## Step 4 — Synthesize via the chief

Dispatch chief-keeper (using its Step 0 resolved model) with: the four verdicts, the
hash-verification result, the inspection mode, and the vision contents. It writes `<project>/vision-report-<YYYY-MM-DD>.md` from the
report template, computes an honest fidelity score, and writes the truth tiers.

## Step 5 — Present

Show the user the report path and the overall verdict. Lead with the honest landing — if the
fidelity is low, say so plainly. Do not soften the panel's findings.

## Step 6 — Push the verdict to a remote human (Hermes, optional)

If `.vision-keeper.json` has `notify.hermes` set AND a Hermes `messages_send` tool is
available in this agent, send the verdict headline to that target so a remote human gets it:

    messages_send(target=<notify.hermes>, message="Vision-Keeper verdict — <fidelity>% fidelity\n<one-line honest landing>\nreport: <report path>")

If `notify.hermes` is unset or no Hermes tool is connected, skip silently — this is opt-in.
