# Vision-Keeper — motion source

The how-it-works video, authored in [Motion Canvas](https://motioncanvas.io).

## Render

```bash
cd motion
npm install
npm start          # opens the editor at http://localhost:9000
```

In the editor: pick the **FFmpeg** exporter, set the format to **mp4**, and click **Render**.
Output lands in `motion/output/`. Drop the result in as `examples/demo.mp4`.

(The committed `examples/demo.*` were a Playwright capture of `examples/how-it-works.html`;
this Motion Canvas project is the higher-quality source going forward.)

## Edit

The whole animation is one scene: `src/scenes/explainer.tsx`.
