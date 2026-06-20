import { Position, TrailMarker } from '../types';
import { getBuildingColor, posEq, inList } from '../gameLogic';

interface Props {
  mousePosition: Position | null;
  catPositions: Position[];
  trailMarkers: TrailMarker[];
  showMouse: boolean;
  showAllTrails: boolean;
  validMouseMoves: Position[];
  selectedMouseMove: Position | null;
  selectedCat: number | null;
  remainingCats: number[];
  validCatMoves: Position[];
  searchableBuildings: Position[];
  searchedBuilding: Position | null;
  onBuildingClick: (pos: Position) => void;
  onCatSquareClick: (pos: Position) => void;
}

function cheeseStyle(turn: number): { bg: string; showNum: boolean } {
  const isSpecial = turn === 1 || turn === 6;
  return { bg: isSpecial ? '#f97316' : '#fbbf24', showNum: isSpecial };
}

export default function Board({
  mousePosition, catPositions, trailMarkers, showMouse, showAllTrails,
  validMouseMoves, selectedMouseMove, selectedCat, remainingCats, validCatMoves,
  searchableBuildings, searchedBuilding,
  onBuildingClick, onCatSquareClick,
}: Props) {
  const cells: JSX.Element[] = [];

  for (let vr = 0; vr < 9; vr++) {
    for (let vc = 0; vc < 9; vc++) {
      const key = `${vr}-${vc}`;

      if (vr % 2 === 0 && vc % 2 === 0) {
        // ── Building cell ──
        const br = vr / 2;
        const bc = vc / 2;
        const bPos: Position = { row: br, col: bc };

        const hasMouse = showMouse && mousePosition != null && posEq(bPos, mousePosition);
        const trail = trailMarkers.find((m) => posEq(m.position, bPos));
        const visibleTrail = trail && (showAllTrails || trail.discovered) ? trail : null;
        const isValidMove = inList(bPos, validMouseMoves);
        const isSelectedMove = selectedMouseMove != null && posEq(bPos, selectedMouseMove);
        const isSearchTarget = inList(bPos, searchableBuildings);
        const isSearched = searchedBuilding != null && posEq(bPos, searchedBuilding);
        const bg = isSearched ? '#fef08a' : getBuildingColor(br, bc);

        let ring = '';
        if (isValidMove) ring = 'ring-2 ring-green-500';
        if (isSelectedMove) ring = 'ring-4 ring-green-600 ring-offset-1';
        if (isSearchTarget) ring = 'ring-2 ring-red-400 ring-offset-1';
        if (isSearched) ring = 'ring-4 ring-yellow-500 ring-offset-1';

        const cheese = visibleTrail ? cheeseStyle(visibleTrail.turn) : null;

        cells.push(
          <button
            key={key}
            onClick={() => onBuildingClick(bPos)}
            className={`relative flex items-center justify-center rounded-lg active:scale-95 transition-all ${ring} ${isSearched ? 'animate-bounce-in' : ''} ${isSelectedMove ? 'scale-105' : ''}`}
            style={{ background: bg, fontSize: 'clamp(16px, 4vw, 26px)' }}
          >
            <span className="absolute top-0.5 left-0.5 text-gray-500 font-mono leading-none"
              style={{ fontSize: 'clamp(6px, 1.5vw, 9px)' }}>
              {String.fromCharCode(65 + bc)}{br + 1}
            </span>

            {hasMouse && <span>🐭</span>}

            {!hasMouse && visibleTrail && cheese && (
              <div className="relative">
                <span>🧀</span>
                {cheese.showNum && (
                  <span className="absolute -top-1 -right-2 text-white font-bold leading-none flex items-center justify-center rounded-full"
                    style={{ fontSize: 'clamp(5px,1.4vw,8px)', width:'1.4em', height:'1.4em', background: cheese.bg }}>
                    {visibleTrail.turn}
                  </span>
                )}
                {/* Cat found this — warn mouse player */}
                {visibleTrail.discovered && showAllTrails && (
                  <span className="absolute -bottom-1 -right-2 leading-none"
                    style={{ fontSize: 'clamp(6px,1.6vw,10px)' }}>🐾</span>
                )}
              </div>
            )}

            {/* Undiscovered marker — faded, only mouse player sees */}
            {!hasMouse && !visibleTrail && trail && showAllTrails && (
              <span style={{ opacity: 0.35, fontSize: '0.75em' }}>🧀</span>
            )}

            {isValidMove && !hasMouse && !trail && (
              <span className="text-green-500 font-bold" style={{ fontSize: '0.8em' }}>●</span>
            )}

            {isSearchTarget && !hasMouse && (
              <span className="text-red-400 font-bold" style={{ fontSize: '0.7em', position: 'absolute', bottom: 2, right: 3 }}>🔍</span>
            )}
          </button>
        );

      } else if (vr % 2 === 1 && vc % 2 === 1) {
        // ── Cat-square cell ──
        const cr = (vr - 1) / 2;
        const cc = (vc - 1) / 2;
        const cPos: Position = { row: cr, col: cc };

        const catIdx = catPositions.findIndex((p) => posEq(p, cPos));
        const hasCat = catIdx !== -1;
        const isSelectedCat = hasCat && catIdx === selectedCat;
        const isRemaining = hasCat && remainingCats.includes(catIdx) && catIdx !== selectedCat;
        const isValidCatMove = inList(cPos, validCatMoves);

        const catColors = ['#2563eb', '#7c3aed', '#4338ca'];

        cells.push(
          <button
            key={key}
            onClick={() => onCatSquareClick(cPos)}
            className={`relative flex items-center justify-center rounded-md transition-all active:scale-95
              ${isSelectedCat ? 'ring-2 ring-amber-400' : ''}
              ${isRemaining ? 'ring-2 ring-green-400' : ''}
              ${isValidCatMove ? 'ring-2 ring-sky-400' : ''}
            `}
            style={{
              background: isSelectedCat ? '#fef3c7' : isRemaining ? '#f0fdf4' : isValidCatMove ? '#e0f2fe' : '#f3f4f6',
              fontSize: 'clamp(14px, 3.5vw, 22px)',
            }}
          >
            {hasCat && (
              <div className="relative">
                <span style={{ color: catColors[catIdx % 3], opacity: isRemaining ? 1 : catIdx !== selectedCat && remainingCats.length > 0 && !remainingCats.includes(catIdx) ? 0.4 : 1 }}>🐱</span>
                <span className="absolute -bottom-0.5 -right-1.5 text-white rounded-full font-bold leading-none flex items-center justify-center"
                  style={{ fontSize: 'clamp(5px,1.3vw,8px)', width: '1.3em', height: '1.3em', background: catColors[catIdx % 3] }}>
                  {catIdx + 1}
                </span>
              </div>
            )}
            {!hasCat && isValidCatMove && (
              <span className="text-sky-500 font-bold" style={{ fontSize: '0.8em' }}>→</span>
            )}
          </button>
        );

      } else {
        // ── Path connector ──
        const isHPath = vr % 2 === 0;
        cells.push(
          <div key={key} style={{
            background: '#e5e7eb',
            width: isHPath ? '100%' : '4px',
            height: isHPath ? '4px' : '100%',
            alignSelf: isHPath ? 'center' : 'stretch',
            justifySelf: isHPath ? 'stretch' : 'center',
          }} />
        );
      }
    }
  }

  return (
    <div
      className="w-full p-2"
      style={{
        display: 'grid',
        gridTemplateColumns: '3fr 1.4fr 3fr 1.4fr 3fr 1.4fr 3fr 1.4fr 3fr',
        gridTemplateRows: '3fr 1.4fr 3fr 1.4fr 3fr 1.4fr 3fr 1.4fr 3fr',
        gap: '2px',
        aspectRatio: '1',
      }}
    >
      {cells}
    </div>
  );
}
