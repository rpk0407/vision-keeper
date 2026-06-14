# Vision-Keeper drift-detection eval

This is the core correctness check: quarantine must PASS a faithful build and CATCH a drifted
one, both judged against the same frozen vision (`fixtures/vision/VISION.lock`).

## Setup (once)

Stamp the fixture vision's hash:

    node scripts/vision-hash.mjs compute fixtures/vision/VISION.lock
    # paste the output into the vision_hash: line of fixtures/vision/VISION.lock
    node scripts/vision-hash.mjs verify fixtures/vision/VISION.lock   # expect OK

## Run A — faithful (should PASS)

1. Copy `fixtures/vision/VISION.lock` next to `fixtures/faithful/index.html`.
2. From that folder, run `/vision-keeper:vision-judge`.
3. PASS criteria: high fidelity; promise audit shows all three promises KEPT; scope held;
   no non-goal violations.

## Run B — drifted (should be CAUGHT)

1. Copy `fixtures/vision/VISION.lock` next to `fixtures/drifted/index.html`.
2. From that folder, run `/vision-keeper:vision-judge`.
3. PASS criteria (i.e. the tool works): low fidelity; promise audit shows "greets by name"
   and "wishes good day" BROKEN; scope keeper flags drift into a login app; non-goals
   "no login" and "no tracking" reported as violated.

If Run A passes and Run B is caught, quarantine works. Record both reports.
