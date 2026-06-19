import { Position, TrailMarker } from './types';

export const BUILDING_SIZE = 5; // 5x5 building grid (mouse positions)
export const CAT_SIZE = 4;      // 4x4 cat-square grid (cat positions)
export const MAX_ROUNDS = 11;
export const NUM_CATS = 3;

// Cats start at cat-square grid positions (0-3)
export const INITIAL_CAT_POSITIONS: Position[] = [
  { row: 0, col: 0 },
  { row: 0, col: 3 },
  { row: 3, col: 1 },
];

// 25 building colors
const BUILDING_COLORS = [
  '#fca5a5','#fdba74','#fcd34d','#86efac','#67e8f9',
  '#93c5fd','#c4b5fd','#f9a8d4','#d1d5db','#a5f3fc',
  '#bbf7d0','#fde68a','#ddd6fe','#fbcfe8','#fed7aa',
  '#e0f2fe','#dcfce7','#fef9c3','#ffe4e6','#e0e7ff',
  '#f5d0a9','#d0f0c0','#c9d6ff','#ffd1dc','#c8e6c9',
];

export function getBuildingColor(br: number, bc: number): string {
  return BUILDING_COLORS[br * BUILDING_SIZE + bc];
}

export function posEq(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col;
}

export function inList(pos: Position, list: Position[]): boolean {
  return list.some((p) => posEq(p, pos));
}

// The 4 buildings at the corners of cat-square (cr, cc)
export function getBuildingsAtCatSquare(cr: number, cc: number): Position[] {
  return [
    { row: cr, col: cc },
    { row: cr, col: cc + 1 },
    { row: cr + 1, col: cc },
    { row: cr + 1, col: cc + 1 },
  ];
}

// Valid mouse moves: 4-directional (no diagonals), not blocked by trail markers
export function getValidMouseMoves(mousePos: Position, trailMarkers: TrailMarker[]): Position[] {
  const trailPositions = trailMarkers.map((m) => m.position);
  const moves: Position[] = [];
  for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
    const nr = mousePos.row + dr;
    const nc = mousePos.col + dc;
    if (nr >= 0 && nr < BUILDING_SIZE && nc >= 0 && nc < BUILDING_SIZE) {
      if (!inList({ row: nr, col: nc }, trailPositions)) {
        moves.push({ row: nr, col: nc });
      }
    }
  }
  return moves;
}

export function isMouseTrapped(mousePos: Position, trailMarkers: TrailMarker[]): boolean {
  return getValidMouseMoves(mousePos, trailMarkers).length === 0;
}

// Valid cat moves: 4-directional in the 4x4 cat-square grid, can't share a square with another cat
export function getValidCatMoves(catIndex: number, catPositions: Position[]): Position[] {
  const { row: cr, col: cc } = catPositions[catIndex];
  const others = catPositions.filter((_, i) => i !== catIndex);
  const moves: Position[] = [];
  for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
    const nr = cr + dr;
    const nc = cc + dc;
    if (nr >= 0 && nr < CAT_SIZE && nc >= 0 && nc < CAT_SIZE) {
      if (!inList({ row: nr, col: nc }, others)) {
        moves.push({ row: nr, col: nc });
      }
    }
  }
  return moves;
}

// Buildings a cat at cat-square (cr, cc) can search
export function getSearchableBuildings(catPos: Position): Position[] {
  return getBuildingsAtCatSquare(catPos.row, catPos.col);
}

export function colLabel(col: number): string {
  return String.fromCharCode(65 + col);
}

export function catPosLabel(pos: Position): string {
  return `${colLabel(pos.col)}${pos.row + 1}`;
}
