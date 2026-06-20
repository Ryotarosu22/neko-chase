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
 * All buildings the mouse could currently occupy given:
 * - They were at `fromPos` when trail #trailNum was placed
 * - Current cat turn is `catTurn`
 * - They cannot revisit any `blocked` position (all trail marker positions)
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

/**
 * Count how many buildings the mouse can still reach from `pos`,
 * given `blocked` positions (trail markers). Fewer = more cornered.
 */
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

// ─── Phase A: Column-based patrol (comb pattern) ─────────────────────────────

/**
 * Each cat covers a vertical column strip.
 * Cat 0 → cols 0-1, Cat 1 → cols 2-3, Cat 2 → col 4
 * Within their zone cats sweep across rows systematically.
 */
function zoneBuildings(catIndex: number): Position[] {
  const strips = [
    [0, 1],  // cat 0: left 2 cols
    [2, 3],  // cat 1: middle 2 cols
    [4, 4],  // cat 2: right col
  ];
  const [cMin, cMax] = strips[catIndex % 3];
  const result: Position[] = [];
  for (let r = 0; r < BUILDING_SIZE; r++)
    for (let c = cMin; c <= cMax; c++)
      result.push({ row: r, col: c });
  return result;
}

/** Nearest unvisited building in the zone (or anywhere if zone exhausted) */
function nextPatrolTarget(
  catPos: Position,
  catIndex: number,
  knownPositions: Position[],
  otherCatTargets: Position[],
): Position | null {
  const zone = zoneBuildings(catIndex);
  const all25: Position[] = [];
  for (let r = 0; r < BUILDING_SIZE; r++)
    for (let c = 0; c < BUILDING_SIZE; c++)
      all25.push({ row: r, col: c });

  const candidates = [
    ...zone.filter((b) => !inList(b, knownPositions) && !inList(b, otherCatTargets)),
    ...all25.filter((b) => !inList(b, knownPositions) && !inList(b, otherCatTargets) && !inList(b, zone)),
    ...all25.filter((b) => !inList(b, knownPositions)),
  ];
  if (candidates.length === 0) return null;

  return candidates.reduce((best, b) =>
    catSqDistTo(catPos, b) < catSqDistTo(best, b) ? b : best,
  );
}

// ─── Phase B: Pursuit roles ───────────────────────────────────────────────────

type PursuitRole = 'chaser' | 'interceptor' | 'blocker';

interface RoleAssignment {
  catIndex: number;
  role: PursuitRole;
  target: Position;
}

/**
 * Assign roles to all cats when trails are known.
 * - 1 trail: use BFS candidates; assign closest→chaser, others minimize mouse freedom
 * - 2+ trails: estimate direction; chaser pursues, interceptor cuts ahead, blocker flanks
 */
function assignPursuitRoles(
  catPositions: Position[],
  discovered: TrailMarker[],
  trailPositions: Position[],
  round: number,
): RoleAssignment[] {
  const latest = discovered[0];
  const candidates = reachablePositions(latest.position, latest.turn, round, trailPositions);

  if (candidates.length === 0) {
    // All reachable positions exhausted — converge on last known
    return catPositions.map((_, i) => ({ catIndex: i, role: 'chaser', target: latest.position }));
  }

  // Score candidates: lower mouse freedom = higher priority target
  const scored = candidates.map((pos) => ({
    pos,
    freedom: mouseFreedom(pos, trailPositions),
  })).sort((a, b) => a.freedom - b.freedom);

  if (discovered.length < 2) {
    // Only 1 trail — no direction info yet
    // Closest cat chases the most-cornered candidate; others cover high-freedom escape routes
    const catsByDist = catPositions
      .map((pos, i) => ({ i, dist: catSqDistTo(pos, latest.position) }))
      .sort((a, b) => a.dist - b.dist);

    const assignments: RoleAssignment[] = [];
    const claimedTargets: Position[] = [];

    for (const { i } of catsByDist) {
      // Pick highest-priority (lowest freedom) unclaimed target
      const target = scored.find((s) => !inList(s.pos, claimedTargets))?.pos ?? latest.position;
      assignments.push({ catIndex: i, role: i === catsByDist[0].i ? 'chaser' : 'blocker', target });
      claimedTargets.push(target);
    }
    return assignments;
  }

  // 2+ trails: compute direction vector
  const older = discovered[1]; // second most recent
  const dr = Math.sign(latest.position.row - older.position.row);
  const dc = Math.sign(latest.position.col - older.position.col);

  // Project intercept point: latest position + direction * (remaining turns estimate)
  const stepsAhead = Math.max(1, Math.min(3, MAX_ROUNDS - round));
  const interceptRow = Math.max(0, Math.min(BUILDING_SIZE - 1, latest.position.row + dr * stepsAhead));
  const interceptCol = Math.max(0, Math.min(BUILDING_SIZE - 1, latest.position.col + dc * stepsAhead));
  const interceptTarget: Position = { row: interceptRow, col: interceptCol };

  // Flank: opposite side of the direction
  const flankRow = Math.max(0, Math.min(BUILDING_SIZE - 1, latest.position.row - dr * 2));
  const flankCol = Math.max(0, Math.min(BUILDING_SIZE - 1, latest.position.col - dc * 2));
  const flankTarget: Position = { row: flankRow, col: flankCol };

  // Best chase target: low-freedom candidate in direction of travel
  const chaseTarget = scored
    .filter((s) => (s.pos.row - latest.position.row) * dr >= 0 && (s.pos.col - latest.position.col) * dc >= 0)
    .shift()?.pos ?? scored[0].pos;

  // Assign roles: cat closest to intercept→interceptor, closest to chase→chaser, rest→blocker
  const roles: { target: Position; role: PursuitRole }[] = [
    { target: chaseTarget, role: 'chaser' },
    { target: interceptTarget, role: 'interceptor' },
    { target: flankTarget, role: 'blocker' },
  ];

  return catPositions.map((catPos, i) => {
    const best = roles.reduce((bestRole, r) =>
      catSqDistTo(catPos, r.target) < catSqDistTo(catPos, bestRole.target) ? r : bestRole
    );
    return { catIndex: i, role: best.role, target: best.target };
  });
}

// ─── Decision ────────────────────────────────────────────────────────────────

export interface CpuCatDecision {
  action: 'move' | 'search';
  targetPosition?: Position;
  searchBuilding?: Position;
}

function discoveredSorted(trailMarkers: TrailMarker[]): TrailMarker[] {
  return trailMarkers.filter((m) => m.discovered).sort((a, b) => b.turn - a.turn);
}

export function getCpuCatDecision(
  state: GameState,
  catIndex: number,
  otherCatTargets: Position[] = [],
  roleAssignments: RoleAssignment[] = [],
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
    const myRole = roleAssignments.find((r) => r.catIndex === catIndex);
    const myTarget = myRole?.target ?? discovered[0].position;

    // If we can directly search the target building, do it
    const canSearch = searchable.filter((b) => !inList(b, allKnown));
    const directHit = canSearch.find((b) => posEq(b, myTarget));
    if (directHit) return { action: 'search', searchBuilding: directHit };

    // Search any adjacent candidate that scores well (in reachable set)
    const candidates = reachablePositions(discovered[0].position, discovered[0].turn, round, trailPositions);
    const adjacentCandidate = canSearch.find((b) => inList(b, candidates));
    if (adjacentCandidate && catSqDistTo(catPos, discovered[0].position) <= 2) {
      // Pick the adjacent candidate with lowest mouse freedom (most cornering)
      const best = canSearch
        .filter((b) => inList(b, candidates))
        .reduce((a, b) => mouseFreedom(a, trailPositions) < mouseFreedom(b, trailPositions) ? a : b);
      return { action: 'search', searchBuilding: best };
    }

    // Move toward role target
    const move = bestMoveToward(catIndex, catPositions, myTarget);
    if (move) return { action: 'move', targetPosition: move };

    // Fallback: search anything unknown
    if (canSearch.length > 0) return { action: 'search', searchBuilding: canSearch[0] };
    return { action: 'search', searchBuilding: searchable[0] };
  }

  // ── Phase A: column-zone patrol (comb sweep) ─────────────────────────────
  const target = nextPatrolTarget(catPos, catIndex, allKnown, otherCatTargets);
  if (!target) {
    const unknown = searchable.filter((b) => !inList(b, allKnown));
    return { action: 'search', searchBuilding: unknown[0] ?? searchable[0] };
  }

  const targetIsAdjacent = getBuildingsAtCatSquare(catPos.row, catPos.col).some((b) => posEq(b, target));

  if (targetIsAdjacent) {
    // Occasionally skip searching to advance further (avoid camping one spot)
    const preferMove = (round + catIndex * 3) % 4 === 0;
    if (!preferMove) {
      const unknownAdjacent = searchable.filter((b) => !inList(b, allKnown));
      if (unknownAdjacent.length > 0) {
        const best = unknownAdjacent.reduce((a, b) =>
          manhattan(a, target) < manhattan(b, target) ? a : b,
        );
        return { action: 'search', searchBuilding: best };
      }
    }
  }

  const move = bestMoveToward(catIndex, catPositions, target);
  if (move && catSqDistTo(move, target) < catSqDistTo(catPos, target)) {
    return { action: 'move', targetPosition: move };
  }

  const unknownAdjacent = searchable.filter((b) => !inList(b, allKnown));
  if (unknownAdjacent.length > 0) return { action: 'search', searchBuilding: unknownAdjacent[0] };
  return { action: 'search', searchBuilding: searchable[0] };
}

// ─── Coordinate all three cats ────────────────────────────────────────────────

export function getCpuCatDecisions(state: GameState): CpuCatDecision[] {
  const discovered = discoveredSorted(state.trailMarkers);
  const trailPositions = state.trailMarkers.map((m) => m.position);

  // Pre-compute role assignments for Phase B (shared across all cats)
  const roleAssignments: RoleAssignment[] =
    discovered.length > 0
      ? assignPursuitRoles(state.catPositions, discovered, trailPositions, state.round)
      : [];

  const decisions: CpuCatDecision[] = [];
  const claimedTargets: Position[] = [];

  for (let i = 0; i < state.catPositions.length; i++) {
    const decision = getCpuCatDecision(state, i, claimedTargets, roleAssignments);
    decisions.push(decision);
    if (decision.action === 'move' && decision.targetPosition) claimedTargets.push(decision.targetPosition);
    if (decision.action === 'search' && decision.searchBuilding) claimedTargets.push(decision.searchBuilding);
  }
  return decisions;
}

// ─── CPU Mouse ───────────────────────────────────────────────────────────────

export function getCpuMouseDecision(mousePos: Position, trailMarkers: TrailMarker[]): Position | null {
  const valid = getValidMouseMoves(mousePos, trailMarkers);
  if (valid.length === 0) return null;
  const futureTrails = [...trailMarkers, { position: mousePos, turn: 0, discovered: false }];
  return valid.reduce((best, pos) =>
    getValidMouseMoves(pos, futureTrails).length > getValidMouseMoves(best, futureTrails).length
      ? pos
      : best,
  );
}
