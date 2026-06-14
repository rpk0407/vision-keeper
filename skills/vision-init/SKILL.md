---
name: vision-init
description: Use at the very start of a project to capture and FREEZE the original vision into a hashed VISION.lock file. Interviews the user if no spec exists, or imports and distills an existing brief/PRD/README. This frozen file is the contract that vision-judge later measures the delivered product against.
---

You are sealing the project's original vision. Produce one file: `VISION.lock` in the
project root, tamper-evident via a content hash. Do this carefully — everything the
judges later conclude is measured against this file.

## Step 0 — Read the user's setup first

Before capturing the vision, detect the stack and agent topology so everything downstream
adapts (run the `vision-setup` skill, or directly):

    node "${CLAUDE_PLUGIN_ROOT}/scripts/vision-detect.mjs"

Merge the result under a `setup` key in `.vision-keeper.json` (see the vision-setup skill).
This tells `vision-judge` whether/how to boot the preview and tells `vision-watch` whether the
build is a solo session or an agent team. Mention what you found to the user in one line.

## Step 1 — Choose capture mode

Look for an existing brief, PRD, README, spec, or `$ARGUMENTS` (a path or pasted brief).
- If a meaningful spec exists -> IMPORT mode: read it and distill.
- If nothing usable exists -> INTERVIEW mode.

## Step 2a — INTERVIEW mode

Ask the user, one question at a time (do not dump all at once):
1. In one sentence, what are you building?
2. Describe the ideal finished product — the dream end-state. What can a user do? How does it feel?
3. What are the concrete, checkable promises this product makes? (Push for specifics.)
4. What does "done and good" mean — your success criteria?
5. What is this explicitly NOT? (non-goals, to guard scope)

## Step 2b — IMPORT mode

Read the source brief. Distill it into the same five buckets (dream, success criteria,
promises, non-goals, project name). Where the brief is vague, ask the user to confirm
rather than inventing promises.

## Step 3 — Write VISION.lock

Copy `${CLAUDE_PLUGIN_ROOT}/templates/VISION.lock.template` to `<project>/VISION.lock`
and fill every placeholder. Rules:
- `project`: short name. `sealed_at`: today's date (YYYY-MM-DD).
- Leave `vision_hash` as the 64 zeros for now.
- Promises must be concrete and individually checkable — one per line.
- Do not invent scope the user did not state.

## Step 4 — Stamp the hash (deterministic — do NOT compute it yourself)

Compute the hash with the engine, then write it back into the file's `vision_hash:` line:

    node "${CLAUDE_PLUGIN_ROOT}/scripts/vision-hash.mjs" compute "<project>/VISION.lock"

Replace the `vision_hash:` value with that output. Then verify:

    node "${CLAUDE_PLUGIN_ROOT}/scripts/vision-hash.mjs" verify "<project>/VISION.lock"

Expected: `OK: vision hash matches content`. If it says TAMPERED, re-run compute and
paste the exact hash — never hand-edit the hash.

## Step 5 — Commit and confirm

Commit `VISION.lock` to the project's git repo:

    git add VISION.lock && git commit -m "chore: seal project vision (vision-keeper)"

Tell the user: the vision is sealed, show them the file, and explain that from now on
the build can proceed freely — the keepers will not watch it, and will judge only the
final result against this file via `/vision-keeper:vision-judge`.
