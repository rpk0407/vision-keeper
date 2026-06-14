---
name: vision-watch
description: Run a live Watcher pass mid-build. Compares the work so far against the frozen VISION.lock and grills it for drift — blind to how it was built — then reports a drift status to you and logs it. Use during a build to catch drift early, before the final judgment. Accepts an optional model argument (e.g. /vision-keeper:vision-watch haiku).
---

You are running a Vision-Keeper live watch. The Watcher must stay BLIND and grill the work
against the frozen vision only — never against the code's own justifications.

## Step 1 — Verify the vision

Find `VISION.lock` in the project root. If missing, tell the user to run
`/vision-keeper:vision-init` first and STOP.

Verify integrity:

    node "${CLAUDE_PLUGIN_ROOT}/scripts/vision-hash.mjs" verify "VISION.lock"

If it reports TAMPERED, warn the user loudly (the vision was edited after sealing) but continue.

## Step 2 — Resolve the Watcher model

    node "${CLAUDE_PLUGIN_ROOT}/scripts/vision-config.mjs" "$ARGUMENTS" ".vision-keeper.json"

Use the `watcher` value from the printed map as the model when you dispatch below. `inherit`
means do not override (use the session model). If it exits non-zero, show the error and STOP.

## Step 3 — Gather the work so far

Get the uncommitted diff:

    git diff

If that is empty, also try `git diff HEAD`. This diff is the only work the Watcher sees. Do
NOT include any conversation history, your own reasoning, or commit messages.

## Step 4 — Dispatch the Watcher (blind)

Dispatch the `watcher` agent (with the resolved model) passing ONLY: the full contents of
`VISION.lock` and the diff from Step 3. Nothing about how it was built or who built it.

## Step 5 — Report to the human and mark the checkpoint

Lead with the Watcher's STATUS, then its grilling points. Keep it tight — the user is
mid-build and needs the signal, not an essay. Append a dated entry (status + points) to
`.vision-keeper/watch-log.md`. Then reset the change counter:

    node "${CLAUDE_PLUGIN_ROOT}/scripts/vision-ledger.mjs" checkpoint

If STATUS is `alert`, say plainly that the build is diverging from the sealed vision and the
user should steer now.
