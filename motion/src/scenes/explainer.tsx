import {makeScene2D, Rect, Txt, Layout} from '@motion-canvas/2d';
import {
  createRef,
  createSignal,
  all,
  waitFor,
  tween,
  easeOutCubic,
  easeInOutCubic,
} from '@motion-canvas/core';

const BG = '#1a1916';
const SURF = '#23221e';
const LINE = '#34332e';
const INK = '#f3f1ea';
const MUT = '#a3a29a';
const INFO = '#85b7eb';
const GOOD = '#97c459';
const BAD = '#f09595';
const BADBG = '#3a1f1f';
const MONO = 'ui-monospace, "JetBrains Mono", Menlo, Consolas, monospace';
const SANS = 'Inter, system-ui, -apple-system, sans-serif';

function* type(node: Txt, full: string, duration: number) {
  yield* tween(duration, value => {
    node.text(full.slice(0, Math.ceil(full.length * easeOutCubic(value))));
  });
  node.text(full);
}

export default makeScene2D(function* (view) {
  view.fill(BG);

  // --- Title ---
  const title = createRef<Txt>();
  const sub = createRef<Txt>();
  view.add(<Txt ref={title} text="Vision-Keeper" fill={INK} fontFamily={SANS} fontWeight={600} fontSize={64} y={-470} opacity={0} />);
  view.add(<Txt ref={sub} text="how it works" fill={MUT} fontFamily={SANS} fontSize={30} y={-410} opacity={0} />);
  yield* all(title().opacity(1, 0.5), sub().opacity(1, 0.5));

  // --- Layer 0: seal the vision ---
  const pill = createRef<Rect>();
  const hash = createRef<Txt>();
  view.add(
    <Rect ref={pill} y={-330} width={520} height={60} radius={16} fill={SURF} stroke={INFO} lineWidth={2} scale={0}>
      <Txt ref={hash} text="VISION.lock — sealing…" fill={MUT} fontFamily={MONO} fontSize={26} />
    </Rect>,
  );
  yield* pill().scale(1, 0.5, easeOutCubic);
  for (let i = 0; i < 6; i++) {
    hash().text('VISION.lock  #' + Math.random().toString(16).slice(2, 10));
    yield* waitFor(0.08);
  }
  yield* all(hash().text('VISION.lock  #2766fa74 · frozen', 0.2), hash().fill(GOOD, 0.2));

  // --- Layer 1: the cage (editor) ---
  const editor = createRef<Rect>();
  view.add(
    <Rect ref={editor} y={-150} width={1180} height={300} radius={18} fill={SURF} stroke={LINE} lineWidth={2} opacity={0}>
      <Txt text="layer 1 · the cage — coder agents" fill={MUT} fontFamily={SANS} fontSize={24} y={-120} x={-560} offset={[-1, 0]} />
    </Rect>,
  );
  yield* editor().opacity(1, 0.4);

  const c1 = createRef<Txt>();
  const c2 = createRef<Txt>();
  const c3box = createRef<Rect>();
  const c3 = createRef<Txt>();
  editor().add(<Txt ref={c1} text="" fill={GOOD} fontFamily={MONO} fontSize={30} y={-50} x={-540} offset={[-1, 0]} />);
  editor().add(<Txt ref={c2} text="" fill={GOOD} fontFamily={MONO} fontSize={30} y={5} x={-540} offset={[-1, 0]} />);
  editor().add(
    <Rect ref={c3box} y={62} x={-540} offset={[-1, 0]} width={760} height={44} radius={6} fill={BADBG} opacity={0}>
      <Txt ref={c3} text="" fill={BAD} fontFamily={MONO} fontSize={30} x={-748} offset={[-1, 0]} />
    </Rect>,
  );
  yield* type(c1(), "greet.textContent = 'Hello, ' + name + '!';", 1.4);
  yield* type(c2(), "day.textContent = 'Wishing you a good day.';", 1.4);
  yield* c3box().opacity(1, 0.2);
  yield* type(c3(), "form.onsubmit = login;   // auth.js — drift", 1.2);

  // --- Layer 2: the watcher ---
  const watcher = createRef<Rect>();
  const scan = createRef<Rect>();
  const verdict = createRef<Txt>();
  const sevTrack = createRef<Rect>();
  const sevFill = createRef<Rect>();
  view.add(
    <Rect ref={watcher} y={210} width={1180} height={250} radius={18} fill={SURF} stroke={LINE} lineWidth={2} opacity={0} clip>
      <Txt text="layer 2 · the watcher — blind, vs VISION.lock" fill={MUT} fontFamily={SANS} fontSize={24} y={-95} x={-560} offset={[-1, 0]} />
      <Txt ref={verdict} text="reading the diff…" fill={MUT} fontFamily={MONO} fontSize={28} y={-30} x={-560} offset={[-1, 0]} />
      <Rect ref={sevTrack} y={50} x={-560} offset={[-1, 0]} width={700} height={14} radius={7} fill={BG} />
      <Rect ref={sevFill} y={50} x={-560} offset={[-1, 0]} width={0} height={14} radius={7} fill={GOOD} />
      <Txt text="severity" fill={MUT} fontFamily={SANS} fontSize={22} y={50} x={200} offset={[-1, 0]} />
      <Rect ref={scan} width={1180} height={4} y={-125} fill={INFO} opacity={0} />
    </Rect>,
  );
  yield* watcher().opacity(1, 0.4);
  // scan sweep
  scan().opacity(1);
  yield* scan().y(125, 1, easeInOutCubic);
  yield* scan().opacity(0, 0.2);
  // flag drift: severity climbs, verdict turns red
  yield* all(
    sevFill().width(644, 0.7, easeOutCubic),
    sevFill().fill(BAD, 0.5),
    verdict().text("STATUS: alert — login crosses a non-goal", 0.4),
    verdict().fill(BAD, 0.4),
  );

  // --- Layer 3: you steer ---
  const steer = createRef<Txt>();
  view.add(<Txt ref={steer} text="" fill={INFO} fontFamily={SANS} fontSize={28} y={400} opacity={0} />);
  yield* all(steer().text("layer 3 · you: steer — remove the login, restore the greeting", 0.5), steer().opacity(1, 0.4));
  // correction: drift line struck + removed, severity drops
  yield* all(c3().fill(MUT, 0.3), c3box().fill(BG, 0.3));
  yield* all(c3box().opacity(0, 0.4), c3().opacity(0, 0.4));
  yield* all(
    sevFill().width(70, 0.6, easeOutCubic),
    sevFill().fill(GOOD, 0.5),
    verdict().text("STATUS: on-track — matches the vision", 0.4),
    verdict().fill(GOOD, 0.4),
  );

  // --- Final judgment ---
  yield* all(editor().opacity(0, 0.5), watcher().opacity(0, 0.5), steer().opacity(0, 0.4));
  const jtitle = createRef<Txt>();
  view.add(<Txt ref={jtitle} text="final judgment — 4 blind keepers + chief" fill={MUT} fontFamily={SANS} fontSize={26} y={-150} opacity={0} />);
  yield* jtitle().opacity(1, 0.4);

  const lenses = ['functional', 'experience', 'scope', 'promise', 'chief'];
  const chips = lenses.map(() => createRef<Rect>());
  const row = createRef<Layout>();
  view.add(<Layout ref={row} layout gap={24} y={-20} />);
  lenses.forEach((name, i) => {
    row().add(
      <Rect ref={chips[i]} width={200} height={84} radius={12} fill={'#1f3010'} stroke={GOOD} lineWidth={2} scale={0} alignItems={'center'} justifyContent={'center'}>
        <Txt text={name} fill={GOOD} fontFamily={SANS} fontSize={24} />
      </Rect>,
    );
  });
  for (let i = 0; i < chips.length; i++) {
    yield* chips[i]().scale(1, 0.25, easeOutCubic);
  }

  const score = createSignal(0);
  const scoreTxt = createRef<Txt>();
  view.add(<Txt ref={scoreTxt} text={() => Math.round(score()) + '%'} fill={GOOD} fontFamily={SANS} fontWeight={700} fontSize={120} y={170} opacity={0} />);
  yield* scoreTxt().opacity(1, 0.3);
  yield* score(91, 1.4, easeOutCubic);
  const caption = createRef<Txt>();
  view.add(<Txt ref={caption} text="promises kept · scope held · drift corrected mid-flight" fill={MUT} fontFamily={SANS} fontSize={26} y={290} opacity={0} />);
  yield* caption().opacity(1, 0.5);
  yield* waitFor(1.5);
});
