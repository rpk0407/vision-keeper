# Vision-Keeper

Freeze a project's original vision at birth. When you say it's done, a **blind panel of
agents** — who never saw how it was built — judges the delivered product against that frozen
vision and writes an honest acceptance report.

The point is **quarantine**: a judge's value comes from *not* having lived through the
implementation. No anchoring bias, no "it's my code so it's good."

## Install (local, for development)

```bash
claude --plugin-dir "C:/Users/rayan/Desktop/vision-keeper"
```

Reload after edits with `/reload-plugins`.

## Use

1. **Seal the vision** at the start of a project:
   ```
   /vision-keeper:vision-init
   ```
   Answer the interview (or point it at an existing brief). Produces a hashed, committed
   `VISION.lock`.

2. **Build freely.** Vision-Keeper watches nothing.

3. **Judge when done:**
   ```
   /vision-keeper:vision-judge
   ```
   Wakes the blind 4-lens panel + chief; writes `vision-report-<date>.md`.

## The four lenses

- **Functional completeness** — does it do what was promised?
- **Experience fidelity** — does it feel like the dream? (uses the live preview)
- **Scope integrity** — did it quietly become something else?
- **Promise audit** — every promise checked one by one.

## How the hash protects you

`VISION.lock` carries a sha256 of its own content (line-ending normalized, so Windows and
Unix agree). `vision-judge` verifies it before judging — if the vision was edited after
sealing, the report says so. The hash is computed by code, never by the model.

## Live watch (catch drift mid-build)

`vision-judge` runs at the end. `vision-watch` runs *during* the build, so you catch drift
before it's baked in. Three layers:

- **The Cage** — your coding session. A `PostToolUse` hook logs *what* changed (path + time,
  never file content) to `.vision-keeper/ledger.jsonl`. Near-zero cost; it can never block an
  edit (the hook always exits cleanly).
- **The Watchers** — when you run `/vision-keeper:vision-watch`, a blind Watcher agent grills
  the `git diff` against `VISION.lock`: is this drifting? which promise or non-goal is
  threatened? It never sees how the code was built — its yardstick is always the frozen dream.
- **You** — a `Stop` hook nudges you once enough has changed ("8 changes since the last
  watch…"), and the Watcher's verdict is logged to `.vision-keeper/watch-log.md`.

```
/vision-keeper:vision-watch          # grill the work so far
/vision-keeper:vision-watch haiku    # ...on a chosen model
```

Honest scope: this is *checkpoint* watching, not realtime omniscience — the cheap ledger runs
continuously, the LLM grill runs when you (or the nudge) trigger it. That split is the point:
cost stays near zero until you ask for judgment.

Add `.vision-keeper/` to your project's `.gitignore` — it's local runtime state.

## Choosing the model

By default the keepers run on your session model (`inherit`). You can override it.

**Per run** — pass a model to the judge:
```
/vision-keeper:vision-judge opus
```

**Persistently** — drop a `.vision-keeper.json` in your project root (see
`vision-keeper.config.example.json`):
```json
{
  "model": "sonnet",
  "models": { "experience": "opus" }
}
```
`model` sets all five agents; `models` overrides individual lenses (run the cheap lenses on a
small model, the Experience lens on a big one). Precedence: command argument > per-agent >
blanket `model` > `inherit`. Accepts `inherit`, `sonnet`, `opus`, `haiku`, `fable`, or a full
model id. Resolution is deterministic and unit-tested (`scripts/vision-config.mjs`).

## Develop

```bash
npm test
```

See `fixtures/EVAL.md` for the drift-detection eval that proves the panel catches a build
that quietly became something else.

## License

MIT
