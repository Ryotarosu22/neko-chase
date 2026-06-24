import { GameState, Position, TrailMarker, Difficulty } from './types';
import {
  getValidCatMoves, getValidMouseMoves, getSearchableBuildings,
  getBuildingsAtCatSquare, inList, posEq, BUILDING_SIZE, CAT_SIZE, MAX_ROUNDS,
} from './gameLogic';

function pickRandom<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

// ─── Utilities ───────────────────────────────────────────────────────────────

function manhattan(a: Position, b: Position): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

function posKey(p: Position): string { return `${p.row},${p.col}`; }

function catSqDistTo(catSq: Position, target: Position): number {
  return Math.min(...getBuildingsAtCatSquare(catSq.row, catSq.col).map((b) => manhattan(b, target)));
}

function catSqManhattan(a: Position, b: Position): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

function bestMoveToward(catIndex: number, catPositions: Position[], target: Position): Position | null {
  const moves = getValidCatMoves(catIndex, catPositions);
  if (moves.length === 0) return null;
  return moves.reduce((best, pos) =>
    catSqDistTo(pos, target) < catSqDistTo(best, target) ? pos : best,
  );
}

function bestMoveTowardSquare(catIndex: number, catPositions: Position[], targetSq: Position): Position | null {
  const moves = getValidCatMoves(catIndex, catPositions);
  if (moves.length === 0) return null;
  return moves.reduce((best, pos) =>
    catSqManhattan(pos, targetSq) < catSqManhattan(best, targetSq) ? pos : best,
  );
}

// ─── BFS utilities ───────────────────────────────────────────────────────────

function reachablePositions(
  fromPos: Position,
  trailNum: number,
  catTurn: number,
  blocked: Position[],
): Position[] {
  const steps = Math.max(0, catTurn - trailNum);
  const visited = new Set<string>([posKey(fromPos)]);
  const queue: [Position, number][] = [[fromPos, steps]];
  const result: Position[] = [];

  while (queue.length > 0) {
    const [pos, rem] = queue.shift()!;
    if (!posEq(pos, fromPos) && !inList(pos, blocked)) result.push(pos);
    if (rem <= 0) continue;
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const next = { row: pos.row + dr, col: pos.col + dc };
      if (next.row < 0 || next.row >= BUILDING_SIZE || next.col < 0 || next.col >= BUILDING_SIZE) continue;
      if (inList(next, blocked)) continue;
      const k = posKey(next);
      if (visited.has(k)) continue;
      visited.add(k);
      queue.push([next, rem - 1]);
    }
  }
  return result;
}

/** Count buildings reachable from pos (mouse freedom — fewer = more cornered) */
function mouseFreedom(pos: Position, blocked: Position[]): number {
  const visited = new Set<string>([posKey(pos)]);
  const queue: Position[] = [pos];
  let count = 0;
  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const next = { row: cur.row + dr, col: cur.col + dc };
      if (next.row < 0 || next.row >= BUILDING_SIZE || next.col < 0 || next.col >= BUILDING_SIZE) continue;
      if (inList(next, blocked)) continue;
      const k = posKey(next);
      if (visited.has(k)) continue;
      visited.add(k);
      count++;
      queue.push(next);
    }
  }
  return count;
}

// ─── Phase A: Efficient sweep ─────────────────────────────────────────────────
//
// Core principle: search ALL unknown buildings in the current cat-square before moving.
// Only move when the current square is fully covered (all 4 buildings known).
// This minimises wasted moves and maximises buildings searched per turn.
//
// Coordination: cats pick different target cat-squares so they don't duplicate effort.

/** All cat-squares that still have at least one unknown building */
function catSquaresWithUnknown(allKnown: Position[]): Position[] {
  const result: Position[] = [];
  for (let r = 0; r < CAT_SIZE; r++) {
    for (let c = 0; c < CAT_SIZE; c++) {
      const buildings = getBuildingsAtCatSquare(r, c);
      if (buildings.some((b) => !inList(b, allKnown))) {
        result.push({ row: r, col: c });
      }
    }
  }
  return result;
}

/** そのマスで一度に捜索できる未捜索ビルの数 */
function unknownCountAtSquare(sq: Position, allKnown: Position[]): number {
  return getBuildingsAtCatSquare(sq.row, sq.col).filter((b) => !inList(b, allKnown)).length;
}

/**
 * 次に向かうべきマスを選ぶ。
 * 「一度に多くの未捜索ビルを潰せる ＞ 近い ＞ 中央寄り」で評価し、捜索効率を最大化する。
 * （旧版は距離だけで選んでいたため、端の1ビルだけのマスへ無駄に移動していた）
 */
function nearestUncoveredSquare(
  catPos: Position,
  allKnown: Position[],
  claimedSquares: Position[],
): Position | null {
  const center = 1.5; // 4x4マスの中心
  const scoreSq = (sq: Position): number => {
    const unknowns = unknownCountAtSquare(sq, allKnown);
    const dist = catSqManhattan(catPos, sq);
    const centrality = -(Math.abs(sq.row - center) + Math.abs(sq.col - center));
    // 未捜索数を最重視、近さ、わずかに中央寄りを加点
    return unknowns * 4 - dist + centrality * 0.3;
  };

  const avail = catSquaresWithUnknown(allKnown).filter((sq) => !inList(sq, claimedSquares));
  const pool = avail.length > 0 ? avail : catSquaresWithUnknown(allKnown);
  if (pool.length === 0) return null;

  return pool.reduce((best, sq) => (scoreSq(sq) > scoreSq(best) ? sq : best));
}

// ─── Phase B: Pursuit with roles ─────────────────────────────────────────────

function discoveredSorted(trailMarkers: TrailMarker[]): TrailMarker[] {
  return trailMarkers.filter((m) => m.discovered).sort((a, b) => b.turn - a.turn);
}

/**
 * Compute the 3 pursuit targets and assign one to each cat (no duplicates).
 * - 1 trail: all three cats converge with different angles using freedom scoring
 * - 2+ trails: direction is estimated; cats assigned chaser / interceptor / blocker
 */
function computePursuitTargets(
  catPositions: Position[],
  discovered: TrailMarker[],
  trailPositions: Position[],
  round: number,
): Position[] {
  const latest = discovered[0];
  const candidates = reachablePositions(latest.position, latest.turn, round, trailPositions);

  if (candidates.length === 0) {
    return catPositions.map(() => latest.position);
  }

  // Sort by mouse freedom ascending (most cornered = highest priority)
  const scored = [...candidates]
    .map((pos) => ({ pos, freedom: mouseFreedom(pos, trailPositions) }))
    .sort((a, b) => a.freedom - b.freedom);

  if (discovered.length < 2) {
    // 1 trail: pick top-3 most-cornered candidates as targets
    return [
      scored[0]?.pos ?? latest.position,
      scored[Math.floor(scored.length / 3)]?.pos ?? latest.position,
      scored[Math.floor((2 * scored.length) / 3)]?.pos ?? latest.position,
    ];
  }

  // 2+ trails: estimate direction
  const older = discovered[1];
  const dr = Math.sign(latest.position.row - older.position.row);
  const dc = Math.sign(latest.position.col - older.position.col);

  // Chaser: best candidate in direction of travel
  const chaseTarget =
    scored.find((s) =>
      (dr === 0 || Math.sign(s.pos.row - latest.position.row) === dr) &&
      (dc === 0 || Math.sign(s.pos.col - latest.position.col) === dc),
    )?.pos ?? scored[0].pos;

  // Interceptor: project ahead along direction
  const stepsAhead = Math.max(2, Math.min(4, MAX_ROUNDS - round));
  const interceptTarget: Position = {
    row: Math.max(0, Math.min(BUILDING_SIZE - 1, latest.position.row + dr * stepsAhead)),
    col: Math.max(0, Math.min(BUILDING_SIZE - 1, latest.position.col + dc * stepsAhead)),
  };

  // Blocker: cut off the perpendicular escape route
  // If mouse moves row-wise, block the column exit; vice versa
  const blockDr = dc !== 0 ? 1 : 0;  // perpendicular
  const blockDc = dr !== 0 ? 1 : 0;
  const blockerTarget: Position = {
    row: Math.max(0, Math.min(BUILDING_SIZE - 1, latest.position.row + blockDr * 2)),
    col: Math.max(0, Math.min(BUILDING_SIZE - 1, latest.position.col + blockDc * 2)),
  };

  return [chaseTarget, interceptTarget, blockerTarget];
}

/**
 * 上級用：方向予測ではなく「ネズミが今いる可能性のある建物」の確率マップから
 * 最も可能性が高い（＝自由度が低く隅に追い込まれた）候補を上位3つ選ぶ。
 * 3匹がそれぞれ別の高確率候補を担当することで、捕獲率を最大化する。
 */
function computePursuitTargetsAdvanced(
  discovered: TrailMarker[],
  trailPositions: Position[],
  round: number,
): Position[] {
  const latest = discovered[0];
  const candidates = reachablePositions(latest.position, latest.turn, round, trailPositions);
  if (candidates.length === 0) return [latest.position, latest.position, latest.position];

  // 候補が3以下なら、各セルを確実に1匹ずつ担当（取りこぼしゼロ）
  if (candidates.length <= 3) {
    const t = [...candidates];
    while (t.length < 3) t.push(candidates[0]);
    return t.slice(0, 3);
  }

  // 進行方向の重み付け（方向が分かる場合）＋ 自由度の低さ（追い込みやすさ）でスコア化
  let dr = 0, dc = 0;
  if (discovered.length >= 2) {
    dr = Math.sign(latest.position.row - discovered[1].position.row);
    dc = Math.sign(latest.position.col - discovered[1].position.col);
  }

  const scored = candidates.map((pos) => {
    const freedom = mouseFreedom(pos, trailPositions);
    const dirAlign = (pos.row - latest.position.row) * dr + (pos.col - latest.position.col) * dc;
    return { pos, score: -freedom * 2 + dirAlign };
  }).sort((a, b) => b.score - a.score);

  // スコアを0〜1に正規化（分散カバーと釣り合わせるため）
  const maxS = scored[0].score, minS = scored[scored.length - 1].score;
  const norm = (s: number) => (maxS === minS ? 1 : (s - minS) / (maxS - minS));

  // 貪欲な「最遠点 + 高スコア」選択：高確率セルを押さえつつ、
  // 3匹が候補領域の広がりをカバーして横からの逃走を許さない。
  const chosen: Position[] = [scored[0].pos];
  while (chosen.length < 3) {
    let best: Position | null = null;
    let bestVal = -Infinity;
    for (const s of scored) {
      if (chosen.some((p) => posEq(p, s.pos))) continue;
      const minDist = Math.min(...chosen.map((p) => manhattan(p, s.pos)));
      const val = norm(s.score) + minDist * 0.35; // 確率 vs 分散のバランス
      if (val > bestVal) { bestVal = val; best = s.pos; }
    }
    if (!best) break;
    chosen.push(best);
  }
  while (chosen.length < 3) chosen.push(scored[0].pos);
  return chosen;
}

/** 初級用：戦略を使わず、半ランダムに捜索・移動する弱いCPU */
function beginnerCatDecision(state: GameState, catIndex: number): CpuCatDecision {
  const { catPositions, trailMarkers, knownEmpty, round } = state;
  const catPos = catPositions[catIndex];
  const searchable = getSearchableBuildings(catPos);
  const allKnown = [...trailMarkers.map((m) => m.position), ...knownEmpty];
  const unknown = searchable.filter((b) => !inList(b, allKnown));

  // 最終ターンは必ず捜索
  if (round >= MAX_ROUNDS) {
    return { action: 'search', searchBuilding: unknown.length ? pickRandom(unknown) : pickRandom(searchable) };
  }

  // 痕跡を追わず、70%で未捜索ビルをランダム捜索、30%でランダム移動
  if (unknown.length > 0 && Math.random() < 0.7) {
    return { action: 'search', searchBuilding: pickRandom(unknown) };
  }
  const moves = getValidCatMoves(catIndex, catPositions);
  if (moves.length > 0) return { action: 'move', targetPosition: pickRandom(moves) };
  return { action: 'search', searchBuilding: unknown.length ? pickRandom(unknown) : pickRandom(searchable) };
}

/** Greedy assignment: each cat gets the closest distinct pursuit target */
function assignTargets(catPositions: Position[], targets: Position[]): Position[] {
  const remaining = [...targets];
  const assigned: Position[] = [];

  for (const catPos of catPositions) {
    if (remaining.length === 0) {
      assigned.push(targets[0]);
      continue;
    }
    const bestIdx = remaining.reduce(
      (bi, t, i) => catSqDistTo(catPos, t) < catSqDistTo(catPos, remaining[bi]) ? i : bi,
      0,
    );
    assigned.push(remaining[bestIdx]);
    remaining.splice(bestIdx, 1);
  }
  return assigned;
}

// ─── Main decision ────────────────────────────────────────────────────────────

export interface CpuCatDecision {
  action: 'move' | 'search';
  targetPosition?: Position;
  searchBuilding?: Position;
}

export function getCpuCatDecision(
  state: GameState,
  catIndex: number,
  pursuitTarget: Position | null,       // Phase B: pre-computed target for this cat
  claimedSquares: Position[],           // Phase A: cat-squares already claimed
): CpuCatDecision {
  const { catPositions, trailMarkers, knownEmpty, round } = state;
  const catPos = catPositions[catIndex];
  const searchable = getSearchableBuildings(catPos);
  const trailPositions = trailMarkers.map((m) => m.position);
  const allKnown = [...trailPositions, ...knownEmpty];

  // Last turn: always search
  if (round >= MAX_ROUNDS) {
    const unknown = searchable.filter((b) => !inList(b, allKnown));
    return { action: 'search', searchBuilding: unknown[0] ?? searchable[0] };
  }

  const discovered = discoveredSorted(trailMarkers);

  // ── Phase B: pursue ──────────────────────────────────────────────────────
  if (discovered.length > 0 && pursuitTarget) {
    // If the target is directly searchable, search it
    const directHit = searchable.find((b) => posEq(b, pursuitTarget));
    if (directHit) return { action: 'search', searchBuilding: directHit };

    // If any adjacent building is in the reachable candidate set, search the most-cornered one
    const candidates = reachablePositions(discovered[0].position, discovered[0].turn, round, trailPositions);
    const adjacentCandidates = searchable.filter((b) => inList(b, candidates));
    if (adjacentCandidates.length > 0) {
      const best = adjacentCandidates.reduce((a, b) =>
        mouseFreedom(a, trailPositions) < mouseFreedom(b, trailPositions) ? a : b,
      );
      return { action: 'search', searchBuilding: best };
    }

    // Also search unknown adjacent buildings while moving (opportunistic)
    const unknownAdjacent = searchable.filter((b) => !inList(b, allKnown));
    if (unknownAdjacent.length > 0 && catSqDistTo(catPos, pursuitTarget) <= 1) {
      const best = unknownAdjacent.reduce((a, b) =>
        catSqDistTo(catPos, pursuitTarget) <= catSqDistTo(catPos, b) ? a : b,
      );
      return { action: 'search', searchBuilding: best };
    }

    // Move toward pursuit target
    const move = bestMoveToward(catIndex, catPositions, pursuitTarget);
    if (move) return { action: 'move', targetPosition: move };

    // Fallback: search anything unknown
    if (unknownAdjacent.length > 0) return { action: 'search', searchBuilding: unknownAdjacent[0] };
    return { action: 'search', searchBuilding: searchable[0] };
  }

  // ── Phase A: sweep current square first, then move ───────────────────────
  // KEY: search all unknown buildings in current square before moving anywhere.
  const unknownHere = searchable.filter((b) => !inList(b, allKnown));

  if (unknownHere.length > 0) {
    // Search the unknown building closest to the center of the board (heuristic)
    const center: Position = { row: 2, col: 2 };
    const best = unknownHere.reduce((a, b) =>
      manhattan(a, center) < manhattan(b, center) ? a : b,
    );
    return { action: 'search', searchBuilding: best };
  }

  // Current square fully searched → move to nearest uncovered square
  const targetSq = nearestUncoveredSquare(catPos, allKnown, claimedSquares);
  if (!targetSq) {
    // Entire board covered — search anything (shouldn't happen before round 11)
    return { action: 'search', searchBuilding: searchable[0] };
  }

  if (posEq(catPos, targetSq)) {
    // Already at target square but all buildings known — pick next
    const next = nearestUncoveredSquare(catPos, allKnown, [...claimedSquares, targetSq]);
    if (next) {
      const move = bestMoveTowardSquare(catIndex, catPositions, next);
      if (move) return { action: 'move', targetPosition: move };
    }
    return { action: 'search', searchBuilding: searchable[0] };
  }

  const move = bestMoveTowardSquare(catIndex, catPositions, targetSq);
  if (move) return { action: 'move', targetPosition: move };
  return { action: 'search', searchBuilding: searchable[0] };
}

// ─── Coordinate all three cats ────────────────────────────────────────────────

export function getCpuCatDecisions(state: GameState, difficulty: Difficulty = 'intermediate'): CpuCatDecision[] {
  // 初級：戦略なしの弱いCPU
  if (difficulty === 'beginner') {
    return state.catPositions.map((_, i) => beginnerCatDecision(state, i));
  }

  const discovered = discoveredSorted(state.trailMarkers);
  const trailPositions = state.trailMarkers.map((m) => m.position);

  // Phase B: pre-compute one pursuit target per cat
  let pursuitTargets: (Position | null)[] = [null, null, null];
  if (discovered.length > 0) {
    // 上級は確率マップで高確率候補に全力収束、中級は方向予測の役割分担
    const targets = difficulty === 'advanced'
      ? computePursuitTargetsAdvanced(discovered, trailPositions, state.round)
      : computePursuitTargets(state.catPositions, discovered, trailPositions, state.round);
    pursuitTargets = assignTargets(state.catPositions, targets);
  }

  const decisions: CpuCatDecision[] = [];
  const claimedSquares: Position[] = [];

  for (let i = 0; i < state.catPositions.length; i++) {
    // For Phase A coordination: claim our target square so next cat avoids it
    const catPos = state.catPositions[i];
    const allKnown = [
      ...trailPositions,
      ...state.knownEmpty,
    ];
    const unknownHere = getSearchableBuildings(catPos).filter((b) => !inList(b, allKnown));
    if (unknownHere.length === 0) {
      // This cat will move — claim its target square
      const targetSq = nearestUncoveredSquare(catPos, allKnown, claimedSquares);
      if (targetSq) claimedSquares.push(targetSq);
    }

    const decision = getCpuCatDecision(state, i, pursuitTargets[i] ?? null, claimedSquares);
    decisions.push(decision);
  }
  return decisions;
}

// ─── CPU Mouse ───────────────────────────────────────────────────────────────

/**
 * Minimum manhattan distance from a building to any cat-square's 4 adjacent buildings.
 * Higher = farther from all cats = safer.
 */
function minDistToCats(pos: Position, catPositions: Position[]): number {
  if (catPositions.length === 0) return 99;
  return Math.min(
    ...catPositions.map((catSq) =>
      Math.min(...getBuildingsAtCatSquare(catSq.row, catSq.col).map((b) => manhattan(pos, b)))
    )
  );
}

/**
 * Choose the best starting position for the CPU mouse given cat placements.
 * Strategy: maximise distance from all cats + prefer positions with high future freedom.
 */
export function getCpuMouseStartPosition(
  catPositions: Position[],
  difficulty: Difficulty = 'intermediate',
): Position {
  const all25: Position[] = [];
  for (let r = 0; r < BUILDING_SIZE; r++)
    for (let c = 0; c < BUILDING_SIZE; c++)
      all25.push({ row: r, col: c });

  // 初級：そこそこ安全（猫から2マス以上）な場所からランダムに選ぶ＝予測しやすく弱い
  if (difficulty === 'beginner') {
    const okay = all25.filter((p) => minDistToCats(p, catPositions) >= 2);
    return okay.length ? pickRandom(okay) : pickRandom(all25);
  }

  // 中級・上級：猫からの距離（重視）＋将来の自由度が最大の建物
  return all25.reduce((best, pos) => {
    const distScore = minDistToCats(pos, catPositions);
    const freedomScore = mouseFreedom(pos, []);
    const score = distScore * 3 + freedomScore;

    const bestDist = minDistToCats(best, catPositions);
    const bestFreedom = mouseFreedom(best, []);
    const bestScore = bestDist * 3 + bestFreedom;

    return score > bestScore ? pos : best;
  });
}

/** ネコ1匹を1歩ネズミへ近づけた位置（先読み用の簡易シミュレーション） */
function simCatStepToward(catPositions: Position[], catIndex: number, target: Position): Position {
  const moves = getValidCatMoves(catIndex, catPositions);
  if (moves.length === 0) return catPositions[catIndex];
  return moves.reduce((best, m) =>
    catSqDistTo(m, target) < catSqDistTo(best, target) ? m : best,
  catPositions[catIndex]);
}

/** この建物を「今すぐ捜索できる」ネコの数（隣接＝次の猫ターンに捕獲されうる） */
function searchableByCatsCount(pos: Position, catPositions: Position[]): number {
  return catPositions.filter((c) =>
    getBuildingsAtCatSquare(c.row, c.col).some((b) => posEq(b, pos)),
  ).length;
}

/**
 * 上級用：捕獲リスクを直接評価する。
 * - 即時リスク：移動先が今ネコに隣接＝次の猫ターンに捜索されて即捕獲。致命的なので強く回避。
 * - 1手後リスク：各ネコが寄ってきた後、その建物を捜索できるネコ数。
 * - 加えて、直進回避・自由度（scoreCpuMouseMove由来）も維持。
 */
function scoreCpuMouseMoveAdvanced(
  pos: Position,
  currentPos: Position,
  catPositions: Position[],
  trailMarkers: TrailMarker[],
  prevPos: Position | null,
): number {
  let score = scoreCpuMouseMove(pos, currentPos, catPositions, trailMarkers);

  // 即時捕獲リスク：移動先が今ネコの捜索範囲内なら、次ターンに捜索され捕まる
  const immediateThreat = searchableByCatsCount(pos, catPositions);
  score -= immediateThreat * 30;

  // 1手先読み：全ネコが pos へ1歩寄った後、何匹が pos を捜索可能になるか
  const movedCats = catPositions.map((_, i) => simCatStepToward(catPositions, i, pos));
  const nextThreat = searchableByCatsCount(pos, movedCats);
  score -= nextThreat * 6;
  // 寄ってきた後の最短距離（遠いほど安全）も加味
  score += minDistToCats(pos, movedCats) * 1.5;

  // 直進ペナルティ：前回と同じ方向に進むと読まれやすい
  if (prevPos) {
    const lastDr = Math.sign(currentPos.row - prevPos.row);
    const lastDc = Math.sign(currentPos.col - prevPos.col);
    const dr = Math.sign(pos.row - currentPos.row);
    const dc = Math.sign(pos.col - currentPos.col);
    if (dr === lastDr && dc === lastDc && (dr !== 0 || dc !== 0)) score -= 1.5;
  }

  return score;
}

/**
 * Score a candidate move for the CPU mouse.
 * Balances: future freedom, distance from cats, and not moving toward cats.
 */
function scoreCpuMouseMove(
  pos: Position,
  currentPos: Position,
  catPositions: Position[],
  trailMarkers: TrailMarker[],
): number {
  // Future freedom after moving here (trails will include current pos)
  const futureTrails = [...trailMarkers, { position: currentPos, turn: 0, discovered: false }];
  const nextMoves = getValidMouseMoves(pos, futureTrails);
  const freedom = nextMoves.length;

  // 2手先の逃げ道：移動後さらに移動した先で、いくつ動けるか（最大）。
  // これにより「次は動けるが、その次で袋小路」という自滅を避ける。
  const trailsAfter = [...futureTrails, { position: pos, turn: 0, discovered: false }];
  const onwardFreedom = nextMoves.length > 0
    ? Math.max(...nextMoves.map((n) => getValidMouseMoves(n, trailsAfter).length))
    : 0;

  // 即・袋小路は致命的なので強く減点
  const deadEndPenalty = freedom === 0 ? -20 : 0;

  // Distance from all cats (higher = safer)
  const catDist = minDistToCats(pos, catPositions);

  // Penalise moving closer to any cat
  const currentDist = minDistToCats(currentPos, catPositions);
  const movingTowardCats = catDist < currentDist ? -2 : 0;

  // Bonus for moving away from the nearest cat
  const fleeBonus = catDist - currentDist;

  return freedom * 2 + onwardFreedom * 1.2 + deadEndPenalty + catDist * 3 + fleeBonus + movingTowardCats;
}

export function getCpuMouseDecision(
  mousePos: Position,
  trailMarkers: TrailMarker[],
  catPositions: Position[] = [],
  difficulty: Difficulty = 'intermediate',
): Position | null {
  const valid = getValidMouseMoves(mousePos, trailMarkers);
  if (valid.length === 0) return null;

  // 初級：袋小路だけ避けてほぼランダム移動（読まれやすく弱い）
  if (difficulty === 'beginner') {
    const futureTrails = [...trailMarkers, { position: mousePos, turn: 0, discovered: false }];
    const notDeadEnd = valid.filter((p) => getValidMouseMoves(p, futureTrails).length > 0);
    return pickRandom(notDeadEnd.length ? notDeadEnd : valid);
  }

  if (catPositions.length === 0) {
    // Fallback: maximise future freedom only
    const futureTrails = [...trailMarkers, { position: mousePos, turn: 0, discovered: false }];
    return valid.reduce((best, pos) =>
      getValidMouseMoves(pos, futureTrails).length > getValidMouseMoves(best, futureTrails).length
        ? pos : best,
    );
  }

  // 上級：1手先読み＋直進回避。中級：その場の評価のみ。
  if (difficulty === 'advanced') {
    const prevPos = trailMarkers.length > 0 ? trailMarkers[trailMarkers.length - 1].position : null;
    return valid.reduce((best, pos) =>
      scoreCpuMouseMoveAdvanced(pos, mousePos, catPositions, trailMarkers, prevPos) >
      scoreCpuMouseMoveAdvanced(best, mousePos, catPositions, trailMarkers, prevPos)
        ? pos : best,
    );
  }

  return valid.reduce((best, pos) =>
    scoreCpuMouseMove(pos, mousePos, catPositions, trailMarkers) >
    scoreCpuMouseMove(best, mousePos, catPositions, trailMarkers)
      ? pos : best,
  );
}
