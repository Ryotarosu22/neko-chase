import { GameState, Position, TrailMarker } from './types';
import {
  getValidCatMoves, getValidMouseMoves, getSearchableBuildings,
  getBuildingsAtCatSquare, inList, posEq, BUILDING_SIZE, CAT_SIZE, MAX_ROUNDS,
} from './gameLogic';

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

/** Nearest cat-square with unknown buildings, avoiding squares claimed by other cats */
function nearestUncoveredSquare(
  catPos: Position,
  allKnown: Position[],
  claimedSquares: Position[],
): Position | null {
  const squares = catSquaresWithUnknown(allKnown)
    .filter((sq) => !inList(sq, claimedSquares));

  if (squares.length === 0) {
    // All claimed — just find nearest uncovered regardless
    const all = catSquaresWithUnknown(allKnown);
    if (all.length === 0) return null;
    return all.reduce((best, sq) =>
      catSqManhattan(catPos, sq) < catSqManhattan(best, sq) ? sq : best,
    );
  }

  return squares.reduce((best, sq) =>
    catSqManhattan(catPos, sq) < catSqManhattan(best, sq) ? sq : best,
  );
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

export function getCpuCatDecisions(state: GameState): CpuCatDecision[] {
  const discovered = discoveredSorted(state.trailMarkers);
  const trailPositions = state.trailMarkers.map((m) => m.position);

  // Phase B: pre-compute one pursuit target per cat
  let pursuitTargets: (Position | null)[] = [null, null, null];
  if (discovered.length > 0) {
    const targets = computePursuitTargets(
      state.catPositions, discovered, trailPositions, state.round,
    );
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
export function getCpuMouseStartPosition(catPositions: Position[]): Position {
  const all25: Position[] = [];
  for (let r = 0; r < BUILDING_SIZE; r++)
    for (let c = 0; c < BUILDING_SIZE; c++)
      all25.push({ row: r, col: c });

  // Score each building: distance from cats (weighted heavily) + future freedom
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
  const freedom = getValidMouseMoves(pos, futureTrails).length;

  // Distance from all cats (higher = safer)
  const catDist = minDistToCats(pos, catPositions);

  // Penalise moving closer to any cat
  const currentDist = minDistToCats(currentPos, catPositions);
  const movingTowardCats = catDist < currentDist ? -2 : 0;

  // Bonus for moving away from the nearest cat
  const fleeBonus = catDist - currentDist;

  return freedom * 2 + catDist * 3 + fleeBonus + movingTowardCats;
}

export function getCpuMouseDecision(
  mousePos: Position,
  trailMarkers: TrailMarker[],
  catPositions: Position[] = [],
): Position | null {
  const valid = getValidMouseMoves(mousePos, trailMarkers);
  if (valid.length === 0) return null;

  if (catPositions.length === 0) {
    // Fallback: maximise future freedom only
    const futureTrails = [...trailMarkers, { position: mousePos, turn: 0, discovered: false }];
    return valid.reduce((best, pos) =>
      getValidMouseMoves(pos, futureTrails).length > getValidMouseMoves(best, futureTrails).length
        ? pos : best,
    );
  }

  return valid.reduce((best, pos) =>
    scoreCpuMouseMove(pos, mousePos, catPositions, trailMarkers) >
    scoreCpuMouseMove(best, mousePos, catPositions, trailMarkers)
      ? pos : best,
  );
}
