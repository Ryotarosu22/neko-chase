export interface Position {
  row: number;
  col: number;
}

// Trail marker placed on the building grid (0-4)
export interface TrailMarker {
  position: Position;
  turn: number;
  discovered: boolean; // becomes true when cat searches that building
}

export type GameMode = 'local' | 'cpu_cat' | 'cpu_mouse';

export type Screen =
  | 'menu'
  | 'handoff_to_mouse'
  | 'mouse_setup'
  | 'mouse_moving'
  | 'handoff_to_cat'
  | 'cat_setup'
  | 'cat_acting'
  | 'search_result'
  | 'game_over';

// Cat action sub-state during cat_acting phase
export type CatSubAction = 'idle' | 'selected' | 'moving' | 'searching';

export type Winner = 'cat' | 'mouse';
export type WinReason = 'escaped' | 'caught' | 'trapped';

export interface SearchResult {
  found: boolean;
  catIndex: number;
  markerTurn?: number; // set when a trail marker was revealed
  searchedBuilding: Position; // which building was searched (for animation)
}

export interface GameState {
  mode: GameMode;
  catName: string;   // ネコ側プレイヤー名（既定: ニャンコ）
  mouseName: string; // ネズミ側プレイヤー名（既定: マウス）
  screen: Screen;
  mousePosition: Position | null; // building grid: row/col 0-4
  catPositions: Position[];       // cat-square grid: row/col 0-3
  trailMarkers: TrailMarker[];
  knownEmpty: Position[];         // buildings searched by cats and found empty
  round: number;
  currentCatIndex: number;
  remainingCats: number[];   // cats that haven't acted yet this round
  selectedCat: number | null;
  catSubAction: CatSubAction;
  searchResult: SearchResult | null;
  winner: Winner | null;
  winReason: WinReason | null;
}
