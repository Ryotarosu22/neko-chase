import { GameState, Position, TrailMarker } from './types';
import {
  getValidCatMoves, getValidMouseMoves, getSearchableBuildings,
  getBuildingsAtCatSquare, inList, posEq, BUILDING_SIZE, MAX_ROUNDS,
} from './gameLogic';

// ─── Utilities ───────────────────────────────────────────────────────────────

function manhattan(a: Position, b: Position): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

function posKey(p: Position): string { return `${p.row},${p.col}`; }

/** Minimum manhattan distance from a cat-square to a building */
function catSqDistTo(catSq: Position, target: Position): number {
  return Math.min(...getBuildingsAtCatSquare(catSq.row, catSq.col).map((b) => manhattan(b, target)));
}

/** Move cat-square one step toward a target building */
function bestMoveToward(catIndex: number, catPositions: Position[], target: Position): Position | null {
  const moves = getValidCatMoves(catIndex, catPositions);
  if (moves.length === 0) return null;
  return moves.reduce((best, pos) =>
    catSqDistTo(pos, target) < catSqDistTo(best, target) ? pos : best,
  );
}

// ─── Reachability BFS ────────────────────────────────────────────────────────

/**
 * All buildings the mouse could currently occupy, given:
 * - They were at `fromPos` when trail #trailNum was placed
 * - Current cat turn is `catTurn`
 * - They cannot revisit any `blocked` position (all trail marker positions)
 *
 * After placing trail #N, the mouse has made (catTurn - N) additional moves.
 */
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
    // The mouse is NOT at the trail position itself (they moved away)
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

/** Direction vector (dr, dc) from two discovered trail markers (older → newer) */
function directionVector(older: TrailMarker, newer: TrailMarker): [number, number] {
  const dr = Math.sign(newer.position.row - older.position.row);
  const dc = Math.sign(newer.position.col - older.position.col);
  return [dr, dc];
}

/**
 * Score a candidate position based on how well it aligns with the direction
 * of mouse travel. Higher = more likely mouse location.
 */
function directionScore(pos: Position, from: Position, dr: number, dc: number): number {
  const relRow = pos.row - from.row;
  const relCol = pos.col - from.col;
  return relRow * dr + relCol * dc; // dot product
}

// ─── Phase A: Patrol zones ────────────────────────────────────────────────────

/**
 * Each cat covers a horizontal strip of the building grid.
 * Cat 0 → rows 0-1, Cat 1 → rows 2-3, Cat 2 → row 4 + overflow.
 */
function zoneBuildings(catIndex: number): Position[] {
  const strips = [
    [0, 1],  // cat 0: top 2 rows
    [2, 3],  // cat 1: middle 2 rows
    [4, 4],  // cat 2: bottom row
  ];
  const [rMin, rMax] = strips[catIndex % 3];
  const result: Position[] = [];
  for (let r = rMin; r <= rMax; r++)
    for (let c = 0; c < BUILDING_SIZE; c++)
      result.push({ row: r, col: c });
  return result;
}

/** Nearest unvisited building in the zone (or anywhere if zone exhausted) */
function nextPatrolTarget(
  catPos: Position,
  catIndex: number,
  knownPositions: Position[],   // trail positions + knownEmpty
  otherCatTargets: Position[],  // targets already claimed by other cats
): Position | null {
  const zone = zoneBuildings(catIndex);
  const all25: Position[] = [];
  for (let r = 0; r < BUILDING_SIZE; r++)
    for (let c = 0; c < BUILDING_SIZE; c++)
      all25.push({ row: r, col: c });

  // Prefer zone buildings, then all buildings
  const candidates = [
    ...zone.filter((b) => !inList(b, knownPositions) && !inList(b, otherCatTargets)),
    ...all25.filter((b) => !inList(b, knownPositions) && !inList(b, otherCatTargets) && !inList(b, zone)),
    ...all25.filter((b) => !inList(b, knownPositions)),
  ];
  if (candidates.length === 0) return null;

  // Nearest candidate to this cat-square
  return candidates.reduce((best, b) =>
    catSqDistTo(catPos, b) < catSqDistTo(best, b) ? b : best,
  );
}

// ─── Decision ────────────────────────────────────────────────────────────────

export interface CpuCatDecision {
  action: 'move' | 'search';
  targetPosition?: Position;
  searchBuilding?: Position;
}

/** Sorted discovered markers, newest first */
function discoveredSorted(trailMarkers: TrailMarker[]): TrailMarker[] {
  return trailMarkers.filter((m) => m.discovered).sort((a, b) => b.turn - a.turn);
}

export function getCpuCatDecision(
  state: GameState,
  catIndex: number,
  otherCatTargets: Position[] = [],
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

  // ── Phase B: trail found ─────────────────────────────────────────────────
  if (discovered.length > 0) {
    const latest = discovered[0];

    // How far the mouse could have moved since we last found a trail
    const candidates = reachablePositions(latest.position, latest.turn, round, trailPositions);

    // Weight candidates by direction if we have 2+ discovered markers
    let scoredCandidates: { pos: Position; score: number }[];
    if (discovered.length >= 2) {
      const [dr, dc] = directionVector(discovered[1], discovered[0]);
      scoredCandidates = candidates.map((pos) => ({
        pos,
        score: directionScore(pos, latest.position, dr, dc) * 2
               - catSqDistTo(catPos, pos), // prefer closer + in direction
      }));
    } else {
      scoredCandidates = candidates.map((pos) => ({
        pos,
        score: -catSqDistTo(catPos, pos), // prefer closer
      }));
    }

    // Sort descending by score; skip positions already claimed
    scoredCandidates.sort((a, b) => b.score - a.score);
    const unclaimed = scoredCandidates.filter((sc) => !inList(sc.pos, otherCatTargets));
    const myTarget = (unclaimed[0] ?? scoredCandidates[0])?.pos;

    if (myTarget) {
      // If we can search the target building directly, do it
      const canSearch = searchable.filter((b) => !inList(b, allKnown));
      const directHit = canSearch.find((b) =>
        scoredCandidates.some((sc) => posEq(sc.pos, b)),
      );
      if (directHit) return { action: 'search', searchBuilding: directHit };

      // Otherwise, if we have unknown adjacent buildings and we're close, search one
      if (canSearch.length > 0 && catSqDistTo(catPos, latest.position) <= 2) {
        const bestLocal = canSearch.reduce((best, b) => {
          const bScore = scoredCandidates.find((sc) => posEq(sc.pos, b))?.score ?? -99;
          const bestScore = scoredCandidates.find((sc) => posEq(sc.pos, best))?.score ?? -99;
          return bScore > bestScore ? b : best;
        });
        return { action: 'search', searchBuilding: bestLocal };
      }

      // Move toward target
      const move = bestMoveToward(catIndex, catPositions, myTarget);
      if (move) return { action: 'move', targetPosition: move };
    }

    // Fallback: search any unknown adjacent building
    const unknown = searchable.filter((b) => !inList(b, allKnown));
    if (unknown.length > 0) return { action: 'search', searchBuilding: unknown[0] };
    return { action: 'search', searchBuilding: searchable[0] };
  }

  // ── Phase A: patrol ──────────────────────────────────────────────────────
  // Strategy: move toward zone target first, only search when target is adjacent.
  // Occasionally make an extra move even when adjacent, to avoid the "search only
  // near starting position" trap that lets a distant mouse stay safe indefinitely.

  const target = nextPatrolTarget(catPos, catIndex, allKnown, otherCatTargets);
  if (!target) {
    const unknown = searchable.filter((b) => !inList(b, allKnown));
    return { action: 'search', searchBuilding: unknown[0] ?? searchable[0] };
  }

  const targetIsAdjacent = getBuildingsAtCatSquare(catPos.row, catPos.col).some((b) => posEq(b, target));

  // If target is adjacent AND we decide to search (not always — occasionally move on)
  if (targetIsAdjacent) {
    // Occasionally extend range: every 3rd patrol step prefer moving to next target
    // so cats don't linger searching all 4 buildings before advancing.
    // Use (round + catIndex * 3) as a simple pseudo-alternation.
    const preferMove = (round + catIndex * 3) % 3 === 0;
    if (!preferMove) {
      const unknownAdjacent = searchable.filter((b) => !inList(b, allKnown));
      if (unknownAdjacent.length > 0) {
        // Search the one closest to patrol target
        const best = unknownAdjacent.reduce((a, b) =>
          manhattan(a, target) < manhattan(b, target) ? a : b,
        );
        return { action: 'search', searchBuilding: best };
      }
    }
  }

  // Move toward patrol target
  const move = bestMoveToward(catIndex, catPositions, target);
  if (move && catSqDistTo(move, target) < catSqDistTo(catPos, target)) {
    return { action: 'move', targetPosition: move };
  }

  // Can't get closer (blocked or already adjacent) — search
  const unknownAdjacent = searchable.filter((b) => !inList(b, allKnown));
  if (unknownAdjacent.length > 0) return { action: 'search', searchBuilding: unknownAdjacent[0] };
  return { action: 'search', searchBuilding: searchable[0] };
}

// ─── Coordinate all three cats ────────────────────────────────────────────────

/**
 * Called by App.tsx instead of getCpuCatDecision directly.
 * Computes decisions for all three cats at once so they can coordinate targets.
 */
export function getCpuCatDecisions(state: GameState): CpuCatDecision[] {
  const decisions: CpuCatDecision[] = [];
  const claimedTargets: Position[] = [];

  for (let i = 0; i < state.catPositions.length; i++) {
    const decision = getCpuCatDecision(state, i, claimedTargets);
    decisions.push(decision);
    // Register the target so the next cat avoids it
    if (decision.action === 'move' && decision.targetPosition) claimedTargets.push(decision.targetPosition);
    if (decision.action === 'search' && decision.searchBuilding) claimedTargets.push(decision.searchBuilding);
  }
  return decisions;
}

// ─── CPU Mouse ───────────────────────────────────────────────────────────────

export function getCpuMouseDecision(mousePos: Position, trailMarkers: TrailMarker[]): Position | null {
  const valid = getValidMouseMoves(mousePos, trailMarkers);
  if (valid.length === 0) return null;
  // Greedy: maximise future valid moves from destination
  const futureTrails = [...trailMarkers, { position: mousePos, turn: 0, discovered: false }];
  return valid.reduce((best, pos) =>
    getValidMouseMoves(pos, futureTrails).length > getValidMouseMoves(best, futureTrails).length
      ? pos
      : best,
  );
}
