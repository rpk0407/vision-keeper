---
name: vision-setup
description: Analyze the user's project before sealing or judging — detect the stack (project type, how to run it) and the agent topology (a solo session vs an agent team), then write an adaptive config so vision-init, vision-judge, and vision-watch fit the real setup. Run this once at the start; vision-init runs it automatically.
---

You are reading the user's actual setup so Vision-Keeper adapts to it instead of assuming.

## Step 1 — Detect

    node "${CLAUDE_PLUGIN_ROOT}/scripts/vision-detect.mjs"

This prints JSON: `projectType`, `runnable`, `commands` (dev/build/test), `topology`
(`solo` | `team`), `teamSignals`, and `reasons`.

## Step 2 — Persist (without clobbering model config)

Read `.vision-keeper.json` if it exists. Merge the detected values under a `setup` key,
preserving any existing `model` / `models` keys, and write it back:

    { "model": "...", "setup": { "projectType": "...", "runnable": true,
      "commands": { "dev": "...", "build": "...", "test": "..." }, "topology": "solo|team" } }

## Step 3 — Tell the user what it means

Report the findings in two lines, then the implication:

- **Stack:** "<projectType>, <runnable ? 'runnable via <dev cmd>' : 'not runnable — judged code-only'>."
- **Topology:** "<solo: a single session — the PostToolUse hook captures every edit | team:
  an agent team — the SubagentStop hook also ticks the ledger after each subagent, and the
  watcher judges the full `git diff`, so every agent's work is covered regardless of who wrote it>."

If topology is `team`, reassure: the watch is topology-agnostic — `git diff` captures all
agents' changes; the extra hook just keeps the nudge cadence right.

This config is what `vision-judge` reads to decide whether to boot the preview (and with which
command), and what `vision-watch` uses to size its expectations. Run it once per project.
