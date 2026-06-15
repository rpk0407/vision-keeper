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

Capture BOTH modified and newly-added work, without disturbing the user's git index:

    git diff HEAD                              # changes to tracked files since the last commit
    git ls-files --others --exclude-standard   # new files not yet committed

If `git diff HEAD` errors (no commits yet), fall back to `git diff`. The `git diff HEAD`
output plus the list of new files IS the work the Watcher judges. Do NOT include any
conversation history, your own reasoning, or commit messages — only the diff and the new-file
paths.

## Step 4 — Dispatch the Watcher (blind)

Dispatch the `watcher` agent (with the resolved model) passing ONLY: the full contents of
`VISION.lock`, the diff from Step 3, and the list of new-file paths (the Watcher will Read
those itself). Nothing about how it was built or who built it.

## Step 5 — Report to the human and mark the checkpoint

Lead with the Watcher's STATUS, then its grilling points. Keep it tight — the user is
mid-build and needs the signal, not an essay. Append a dated entry (status + points) to
`.vision-keeper/watch-log.md`. Then reset the change counter:

    node "${CLAUDE_PLUGIN_ROOT}/scripts/vision-ledger.mjs" checkpoint

If STATUS is `alert`, say plainly that the build is diverging from the sealed vision and the
user should steer now.

## Step 6 — Push the alert to a remote human (Hermes, optional)

This is how Layer 3 (the human) gets steered even when away from the keyboard. If
`.vision-keeper.json` has `notify.hermes` set AND a Hermes `messages_send` tool is available
in this agent, send the headline to that target:

    messages_send(target=<notify.hermes>, message="Vision-Keeper watch — STATUS: <status>\n<top grilling point>\nproject: <name>")

Only send when STATUS is `drifting` or `alert` (never ping for on-track). If `notify.hermes`
is unset or no Hermes tool is connected, skip silently — this is opt-in.
