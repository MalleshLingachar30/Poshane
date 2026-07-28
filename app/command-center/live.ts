/* ============================================================
   LIVE PROGRAMME TICKER — shared client-side store
   ------------------------------------------------------------
   Field entries keep arriving, so planting figures creep upward
   while the console is open. Everything is credited to a DISTRICT;
   state-level figures are derived as the sum. That is what keeps
   the Frame1 headline, the map tiles and the Frame2 drill-down
   from drifting into three different numbers.

   Illustrative prototype behaviour — not live operational data.
   ============================================================ */
import { useSyncExternalStore } from "react";
import { DISTRICTS, y1Of, plantedOf } from "./data";

export interface LiveSnapshot {
  /** district code -> planted saplings, in lakh */
  planted: Readonly<Record<string, number>>;
  /** always exactly the sum of `planted` */
  total: number;
  /** planted-weighted survival %, recomputed so it can't disagree with the total */
  wSurv: number;
  tick: number;
}

/* ---------- pacing ----------------------------------------------------------
   Tuned against the real headroom: Year-1 target is 60.0 L, seeded planting is
   41.11 L, so there are 18.89 L (~18.9 lakh saplings) of room in total.
   At ~160 saplings per ~4.2s that is ~1.37 L/hour — the exact tree count in the
   KPI sub-line moves every tick, the "41.11 L" headline advances every ~28s,
   and the figures stay credible for a multi-hour session.                     */
const TICK_MIN = 60, TICK_MAX = 260;      // saplings credited per tick
const DELAY_MIN = 3_200, DELAY_MAX = 5_200; // ms between ticks
const MAX_DISTRICTS_PER_TICK = 2;
/** Never let a district read a suspiciously round 100% of its Year-1 target. */
const DISTRICT_CEILING = 0.94;
/** Total gain allowed in one session, in lakh (~2.9h at the rate above). */
const SESSION_CAP = 4.0;

const LAKH = 100_000;

/* ---------- seed ------------------------------------------------------------
   Must be deterministic: this exact object is what getServerSnapshot() returns,
   so any Date.now()/Math.random() in here would produce a hydration mismatch.  */
function buildSeed(): LiveSnapshot {
  const planted: Record<string, number> = {};
  for (const d of DISTRICTS) planted[d.code] = plantedOf(d);
  return { planted, total: sum(planted), wSurv: weightedSurvival(planted), tick: 0 };
}

function sum(planted: Record<string, number>) {
  let t = 0;
  for (const d of DISTRICTS) t += planted[d.code];
  return t;
}

function weightedSurvival(planted: Record<string, number>) {
  let num = 0, den = 0;
  for (const d of DISTRICTS) { num += d.survival * planted[d.code]; den += planted[d.code]; }
  return den > 0 ? num / den : 0;
}

const SEED: LiveSnapshot = buildSeed();
const BASE_TOTAL = SEED.total;
const Y1: Record<string, number> = {};
const CEILING: Record<string, number> = {};
for (const d of DISTRICTS) {
  Y1[d.code] = y1Of(d);
  CEILING[d.code] = Y1[d.code] * DISTRICT_CEILING;
}

/* ---------- store ---------------------------------------------------------- */
let snapshot: LiveSnapshot = SEED;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | null = null;
let visibilityBound = false;

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/** Headroom left in each district, and the total. Recomputed every tick. */
function headroom(planted: Readonly<Record<string, number>>) {
  const each: { code: string; room: number }[] = [];
  let total = 0;
  for (const d of DISTRICTS) {
    const room = Math.max(0, CEILING[d.code] - planted[d.code]);
    if (room > 0) { each.push({ code: d.code, room }); total += room; }
  }
  return { each, total };
}

function step() {
  timer = null;

  // Session cap: stop for good rather than notifying listeners forever with
  // a snapshot that can no longer change.
  if (snapshot.total - BASE_TOTAL >= SESSION_CAP) return;

  const { each, total: room } = headroom(snapshot.planted);
  if (room < 1e-9 || each.length === 0) return;   // fully saturated — stop scheduling

  const planted = { ...snapshot.planted };
  const picks = Math.min(1 + Math.floor(Math.random() * MAX_DISTRICTS_PER_TICK), each.length);

  for (let i = 0; i < picks; i++) {
    // Weight by remaining headroom so laggard districts catch up and districts
    // near their target stop growing — keeps the map's progress story believable.
    let r = Math.random() * room;
    let chosen = each[each.length - 1];
    for (const c of each) { r -= c.room; if (r <= 0) { chosen = c; break; } }

    const inc = rand(TICK_MIN, TICK_MAX) / LAKH;
    planted[chosen.code] = Math.min(CEILING[chosen.code], planted[chosen.code] + inc);
  }

  snapshot = {
    planted,
    total: sum(planted),
    wSurv: weightedSurvival(planted),
    tick: snapshot.tick + 1,
  };
  listeners.forEach(l => l());   // forEach, not for..of: tsconfig target predates Set iteration

  schedule();
}

function schedule() {
  // Guard on the timer HANDLE, not listeners.size. reactStrictMode double-invokes
  // effects (mount -> unmount -> remount), which drives listeners.size 1 -> 0 -> 1;
  // a size-based guard would start two independent timer chains and tick at 2x.
  if (timer != null) return;
  if (typeof document !== "undefined" && document.hidden) return;
  timer = setTimeout(step, rand(DELAY_MIN, DELAY_MAX));
}

function onVisibilityChange() {
  if (document.hidden) {
    if (timer != null) { clearTimeout(timer); timer = null; }
  } else {
    // Deliberately no elapsed-time catch-up: replaying a tab-away as one huge
    // jump would spin the counter like a slot machine right as eyes return.
    schedule();
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!visibilityBound && typeof document !== "undefined") {
    visibilityBound = true;
    document.addEventListener("visibilitychange", onVisibilityChange);
  }
  schedule();
  // Note: intentionally does NOT stop the timer when the last listener leaves.
  // Frames unmount on nav (one frame renders at a time), and progress must
  // survive that — otherwise the numbers would reset on every tab switch.
  return () => { listeners.delete(cb); };
}

/* ---------- hooks -----------------------------------------------------------
   Selectors return PRIMITIVES wherever possible: a primitive is structurally
   immune to the useSyncExternalStore "getSnapshot returned a new value" loop,
   and it means a component only re-renders when its own number actually moves. */
export function useLiveSnapshot(): LiveSnapshot {
  return useSyncExternalStore(subscribe, () => snapshot, () => SEED);
}

export function useLiveTotal(): number {
  return useSyncExternalStore(subscribe, () => snapshot.total, () => SEED.total);
}

export function useLiveWSurv(): number {
  return useSyncExternalStore(subscribe, () => snapshot.wSurv, () => SEED.wSurv);
}

/** Planted saplings (lakh) for one district. Re-renders only when it moves. */
export function useLiveDistrict(code: string): number {
  return useSyncExternalStore(
    subscribe,
    () => snapshot.planted[code] ?? 0,
    () => SEED.planted[code] ?? 0,
  );
}

/** Non-reactive read, for callers that want a stable value frozen at mount. */
export function getLiveTotal(): number {
  return snapshot.total;
}

export function getLivePlanted(code: string): number {
  return snapshot.planted[code] ?? 0;
}

/** % of the district's Year-1 target planted. */
export const liveProg = (code: string, planted: number) =>
  Y1[code] ? (planted / Y1[code]) * 100 : 0;
