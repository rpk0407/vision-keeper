---
name: vision-demo
description: Open the Vision-Keeper "how it works" animation — a self-contained explainer showing the four layers (the cage builds, the watcher catches drift, you steer, the panel judges) in motion. Use to see or show how the plugin works.
---

Open the explainer animation for the user.

The file is self-contained (no dependencies) at:

    ${CLAUDE_PLUGIN_ROOT}/examples/how-it-works.html

Do whichever works in this environment, in order of preference:
1. Start a preview/dev server for that file (e.g. the Preview MCP) and give the user the URL.
2. Otherwise, open it in the default browser:
   - Windows: `start "" "${CLAUDE_PLUGIN_ROOT}/examples/how-it-works.html"`
   - macOS: `open "${CLAUDE_PLUGIN_ROOT}/examples/how-it-works.html"`
   - Linux: `xdg-open "${CLAUDE_PLUGIN_ROOT}/examples/how-it-works.html"`
3. If neither is possible, print the absolute path and tell the user to open it.

Tell the user to press "play". Be clear that it is an **illustrative** animation of the
architecture (a scripted scenario), not live data from their project.
