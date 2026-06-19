import { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, GameMode, Position } from './types';
import {
  NUM_CATS, MAX_ROUNDS, CAT_SIZE,
  getValidMouseMoves, getValidCatMoves, getSearchableBuildings,
  isMouseTrapped, posEq, inList,
} from './gameLogic';
import { getCpuCatDecisions, getCpuMouseDecision } from './cpuLogic';

import ModeSelect from './components/ModeSelect';
import HandoffScreen from './components/HandoffScreen';
import Board from './components/Board';
import GameHeader from './components/GameHeader';
import CatActionPanel from './components/CatActionPanel';
import MouseActionPanel from './components/MouseActionPanel';
import GameOverScreen from './components/GameOverScreen';
import SearchResultOverlay from './components/SearchResultOverlay';

function randomCatPositions(): Position[] {
  const all: Position[] = [];
  for (let r = 0; r < CAT_SIZE; r++) for (let c = 0; c < CAT_SIZE; c++) all.push({ row: r, col: c });
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all.slice(0, NUM_CATS);
}

function createGame(mode: GameMode): GameState {
  return {
    mode,
    screen: mode === 'local' || mode === 'cpu_mouse' ? 'handoff_to_cat' : 'handoff_to_mouse',
    mousePosition: null,
    // cpu_cat: randomize immediately; others: human places during cat_setup
    catPositions: mode === 'cpu_cat' ? randomCatPositions() : [],
    trailMarkers: [],
    knownEmpty: [],
    round: 1,
    currentCatIndex: 0,
    selectedCat: null,
    catSubAction: 'idle',
    searchResult: null,
    winner: null,
    winReason: null,
  };
}

function isCpuCats(mode: GameMode) { return mode === 'cpu_cat'; }
function isCpuMouse(mode: GameMode) { return mode === 'cpu_mouse'; }

// All cat-square positions not already occupied
function unoccupiedCatSquares(placed: Position[]): Position[] {
  const all: Position[] = [];
  for (let r = 0; r < CAT_SIZE; r++)
    for (let c = 0; c < CAT_SIZE; c++)
      if (!placed.some((p) => posEq(p, { row: r, col: c }))) all.push({ row: r, col: c });
  return all;
}

export default function App() {
  const [game, setGame] = useState<GameState | null>(null);
  const [pendingMouseMove, setPendingMouseMove] = useState<Position | null>(null);
  const cpuTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isMousePhase = game?.screen === 'mouse_setup' || game?.screen === 'mouse_moving';
  const isCatPhase = game?.screen === 'cat_acting' || game?.screen === 'search_result';
  const isCatSetup = game?.screen === 'cat_setup';

  // Human mouse always sees their own trail; also show in cpu_mouse mouse phase
  // Human mouse sees own trail; cpu_cat mode human is always mouse so always show
  const showAllTrails = (isMousePhase && !isCpuMouse(game?.mode ?? 'local')) || (game?.mode === 'cpu_cat');

  const validMouseMoves =
    game?.screen === 'mouse_moving' && game.mousePosition && !isCpuMouse(game.mode)
      ? getValidMouseMoves(game.mousePosition, game.trailMarkers)
      : [];

  const validCatMoves =
    isCatSetup && game
      ? unoccupiedCatSquares(game.catPositions)
      : game?.screen === 'cat_acting' && !isCpuCats(game.mode) && game.round < MAX_ROUNDS
      ? getValidCatMoves(game.currentCatIndex, game.catPositions)
      : [];

  const searchableBuildings = (() => {
    if (game?.screen !== 'cat_acting' || isCpuCats(game.mode)) return [];
    const all = getSearchableBuildings(game.catPositions[game.currentCatIndex]);
    // Mouse can never return to trail marker positions → remove them
    const trailPositions = game.trailMarkers.map((m) => m.position);
    return all.filter((b) => !inList(b, trailPositions));
  })();

  const setupValidMoves: Position[] =
    game?.screen === 'mouse_setup'
      ? Array.from({ length: 5 }, (_, r) =>
          Array.from({ length: 5 }, (_, c) => ({ row: r, col: c }))
        ).flat()
      : [];

  // ── CPU cats logic ──
  const runCpuCatStep = useCallback(() => {
    setGame((prev) => {
      if (!prev || !isCpuCats(prev.mode) || prev.screen !== 'cat_acting') return prev;
      const decisions = getCpuCatDecisions(prev);
      const decision = decisions[prev.currentCatIndex];

      if (decision.action === 'move' && decision.targetPosition) {
        const newCats = [...prev.catPositions];
        newCats[prev.currentCatIndex] = decision.targetPosition;
        const next = prev.currentCatIndex + 1;
        if (next >= NUM_CATS) {
          if (prev.round >= MAX_ROUNDS) return { ...prev, catPositions: newCats, screen: 'game_over', winner: 'mouse', winReason: 'escaped' };
          return { ...prev, catPositions: newCats, screen: 'mouse_moving', currentCatIndex: 0, catSubAction: 'idle', selectedCat: null, round: prev.round + 1 };
        }
        return { ...prev, catPositions: newCats, currentCatIndex: next };
      }

      if (decision.action === 'search' && decision.searchBuilding) {
        return executeCatSearch(prev, decision.searchBuilding);
      }

      return prev;
    });
  }, []);

  useEffect(() => {
    if (game && isCpuCats(game.mode) && game.screen === 'cat_acting') {
      cpuTimer.current = setTimeout(runCpuCatStep, 800);
    }
    return () => { if (cpuTimer.current) clearTimeout(cpuTimer.current); };
  }, [game?.screen, game?.currentCatIndex, game?.mode, runCpuCatStep]);

  // ── CPU mouse logic ──
  const runCpuMouseStep = useCallback(() => {
    setGame((prev) => {
      if (!prev || !isCpuMouse(prev.mode)) return prev;

      if (prev.screen === 'mouse_setup') {
        const center = { row: 2, col: 2 };
        return { ...prev, mousePosition: center, screen: 'cat_acting', selectedCat: null, catSubAction: 'idle' };
      }

      if (prev.screen === 'mouse_moving' && prev.mousePosition) {
        const dest = getCpuMouseDecision(prev.mousePosition, prev.trailMarkers);
        if (!dest) {
          return { ...prev, screen: 'game_over', winner: 'cat', winReason: 'trapped' };
        }
        const newTrail = [...prev.trailMarkers, { position: prev.mousePosition, turn: prev.trailMarkers.length + 1, discovered: false }];
        return { ...prev, mousePosition: dest, trailMarkers: newTrail, screen: 'cat_acting', selectedCat: null, catSubAction: 'idle' };
      }

      return prev;
    });
  }, []);

  useEffect(() => {
    if (game && isCpuMouse(game.mode) && (game.screen === 'mouse_setup' || game.screen === 'mouse_moving')) {
      cpuTimer.current = setTimeout(runCpuMouseStep, 900);
    }
    return () => { if (cpuTimer.current) clearTimeout(cpuTimer.current); };
  }, [game?.screen, game?.round, game?.mode, runCpuMouseStep]);

  // ── Auto-clear search result ──
  // When human cats find the mouse: wait for tap (handled by handleDismissSearchResult).
  // Otherwise auto-clear after delay.
  const humanCatsFound =
    game?.screen === 'search_result' &&
    game.searchResult?.found === true &&
    !isCpuCats(game.mode);

  useEffect(() => {
    if (!game || game.screen !== 'search_result') return;
    if (humanCatsFound) return; // wait for user tap

    const delay = game.searchResult?.found ? 2000 : 1400;
    const t = setTimeout(() => {
      setGame((prev) => {
        if (!prev || prev.screen !== 'search_result') return prev;
        if (prev.searchResult?.found) {
          return { ...prev, screen: 'game_over', winner: 'cat', winReason: 'caught' };
        }
        const catIdx = prev.searchResult?.catIndex ?? 0;
        const next = catIdx + 1;
        if (next >= NUM_CATS) {
          if (prev.round >= MAX_ROUNDS) return { ...prev, screen: 'game_over', winner: 'mouse', winReason: 'escaped', searchResult: null };
          const goToMouse = isCpuMouse(prev.mode) ? 'mouse_moving' : isCpuCats(prev.mode) ? 'mouse_moving' : 'handoff_to_mouse';
          return { ...prev, screen: goToMouse, currentCatIndex: 0, catSubAction: 'idle', selectedCat: null, round: prev.round + 1, searchResult: null };
        }
        return { ...prev, screen: 'cat_acting', currentCatIndex: next, catSubAction: 'idle', selectedCat: null, searchResult: null };
      });
    }, delay);
    return () => clearTimeout(t);
  }, [game?.screen, game?.searchResult, humanCatsFound]);

  function handleDismissSearchResult() {
    setGame((prev) => {
      if (!prev || prev.screen !== 'search_result' || !prev.searchResult?.found) return prev;
      return { ...prev, screen: 'game_over', winner: 'cat', winReason: 'caught' };
    });
  }

  // ── Check trapped at start of mouse's turn ──
  useEffect(() => {
    if (!game || game.screen !== 'mouse_moving' || !game.mousePosition) return;
    if (isMouseTrapped(game.mousePosition, game.trailMarkers)) {
      setGame({ ...game, screen: 'game_over', winner: 'cat', winReason: 'trapped' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.screen, game?.round]);

  // ── Handlers ──
  function handleStart(mode: GameMode) {
    setGame(createGame(mode));
    setPendingMouseMove(null);
  }

  function handleHandoffReady() {
    if (!game) return;
    if (game.screen === 'handoff_to_mouse') {
      setGame({ ...game, screen: game.mousePosition == null ? 'mouse_setup' : 'mouse_moving' });
    } else if (game.screen === 'handoff_to_cat') {
      // Placement phase only before first round; after that go straight to cat_acting
      if (game.catPositions.length < NUM_CATS) {
        setGame({ ...game, screen: 'cat_setup', currentCatIndex: 0 });
      } else {
        setGame({ ...game, screen: 'cat_acting', selectedCat: null, catSubAction: 'idle' });
      }
    }
    setPendingMouseMove(null);
  }

  function handleBuildingClick(pos: Position) {
    if (!game) return;

    if (game.screen === 'mouse_setup') {
      setPendingMouseMove(pos);
      return;
    }

    if (game.screen === 'mouse_moving') {
      if (inList(pos, validMouseMoves)) {
        setPendingMouseMove((prev) => (prev && posEq(prev, pos) ? null : pos));
      }
      return;
    }

    if (game.screen === 'cat_acting' && !isCpuCats(game.mode)) {
      if (inList(pos, searchableBuildings)) {
        setGame(executeCatSearch(game, pos));
      }
    }
  }

  function handleCatSquareClick(pos: Position) {
    if (!game) return;

    // Cat placement phase
    if (game.screen === 'cat_setup') {
      const alreadyPlaced = game.catPositions.some((p) => posEq(p, pos));
      if (!alreadyPlaced) {
        const newCats = [...game.catPositions, pos];
        if (newCats.length >= NUM_CATS) {
          // All cats placed → next phase
          const nextScreen = isCpuMouse(game.mode) ? 'mouse_setup' : 'handoff_to_mouse';
          setGame({ ...game, catPositions: newCats, screen: nextScreen, currentCatIndex: 0 });
        } else {
          setGame({ ...game, catPositions: newCats, currentCatIndex: newCats.length });
        }
      }
      return;
    }

    if (game.screen !== 'cat_acting' || isCpuCats(game.mode)) return;

    if (inList(pos, validCatMoves)) {
      const newCats = [...game.catPositions];
      newCats[game.currentCatIndex] = pos;
      const next = game.currentCatIndex + 1;
      if (next >= NUM_CATS) {
        if (game.round >= MAX_ROUNDS) {
          setGame({ ...game, catPositions: newCats, screen: 'game_over', winner: 'mouse', winReason: 'escaped' });
        } else {
          const nextScreen = isCpuMouse(game.mode) ? 'mouse_moving' : 'handoff_to_mouse';
          setGame({ ...game, catPositions: newCats, screen: nextScreen, currentCatIndex: 0, catSubAction: 'idle', selectedCat: null, round: game.round + 1 });
        }
      } else {
        setGame({ ...game, catPositions: newCats, currentCatIndex: next, catSubAction: 'idle', selectedCat: null });
      }
    }
  }

  function handleMouseConfirm() {
    if (!game || !pendingMouseMove) return;

    if (game.screen === 'mouse_setup') {
      const nextScreen = isCpuCats(game.mode) ? 'cat_acting' : 'handoff_to_cat';
      setGame({ ...game, mousePosition: pendingMouseMove, screen: nextScreen, selectedCat: null, catSubAction: 'idle' });
      setPendingMouseMove(null);
      return;
    }

    if (game.screen === 'mouse_moving' && game.mousePosition) {
      const newTrail = [...game.trailMarkers, { position: game.mousePosition, turn: game.trailMarkers.length + 1, discovered: false }];
      const nextScreen = isCpuCats(game.mode) ? 'cat_acting' : 'handoff_to_cat';
      setGame({ ...game, mousePosition: pendingMouseMove, trailMarkers: newTrail, screen: nextScreen, selectedCat: null, catSubAction: 'idle' });
      setPendingMouseMove(null);
    }
  }

  // ── Render ──
  if (!game) return <ModeSelect onStart={handleStart} />;

  // Game over: show board with full route revealed + overlay panel
  if (game.screen === 'game_over' && game.winner && game.winReason) {
    return (
      <div className="flex flex-col h-full max-w-lg mx-auto">
        <GameHeader round={game.round} screen={game.screen} currentCatIndex={game.currentCatIndex} />
        <div className="flex-1 relative overflow-hidden flex items-center">
          <Board
            mousePosition={game.mousePosition}
            catPositions={game.catPositions}
            trailMarkers={game.trailMarkers}
            showMouse={true}
            showAllTrails={true}
            validMouseMoves={[]}
            selectedMouseMove={null}
            selectedCat={null}
            validCatMoves={[]}
            searchableBuildings={[]}
            searchedBuilding={null}
            onBuildingClick={() => {}}
            onCatSquareClick={() => {}}
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-6">
            <GameOverScreen winner={game.winner} winReason={game.winReason} onPlayAgain={() => setGame(null)} />
          </div>
        </div>
      </div>
    );
  }

  if (game.screen === 'handoff_to_mouse') {
    return <HandoffScreen to="mouse" onReady={handleHandoffReady} isSetup={game.mousePosition == null} />;
  }

  if (game.screen === 'handoff_to_cat') {
    return <HandoffScreen to="cat" onReady={handleHandoffReady} />;
  }

  // Board view
  return (
    <div className="flex flex-col h-full max-w-lg mx-auto">
      <GameHeader round={game.round} screen={game.screen} currentCatIndex={game.currentCatIndex} />

      <div className="flex-1 relative overflow-hidden flex items-center">
        <Board
          mousePosition={game.mousePosition}
          catPositions={game.catPositions}
          trailMarkers={game.trailMarkers}
          showMouse={isMousePhase && !isCpuMouse(game.mode)}
          showAllTrails={showAllTrails}
          validMouseMoves={game.screen === 'mouse_setup' ? setupValidMoves : validMouseMoves}
          selectedMouseMove={pendingMouseMove}
          selectedCat={isCatPhase ? game.currentCatIndex : null}
          validCatMoves={validCatMoves}
          searchableBuildings={searchableBuildings}
          searchedBuilding={game.searchResult?.searchedBuilding ?? null}
          onBuildingClick={handleBuildingClick}
          onCatSquareClick={handleCatSquareClick}
        />

        {game.screen === 'search_result' && game.searchResult && (
          <SearchResultOverlay
            result={game.searchResult}
            onDismiss={humanCatsFound ? handleDismissSearchResult : undefined}
          />
        )}

        {isCpuMouse(game.mode) && isMousePhase && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
            <div className="bg-white rounded-2xl px-6 py-4 text-center shadow-lg">
              <div className="text-4xl mb-1">🐭</div>
              <p className="font-bold text-gray-700">ネズミが逃げています…</p>
            </div>
          </div>
        )}
      </div>

      {isMousePhase && !isCpuMouse(game.mode) && (
        <MouseActionPanel
          round={game.round}
          isSetup={game.screen === 'mouse_setup'}
          validMoveCount={validMouseMoves.length}
          selectedMove={pendingMouseMove}
          onConfirm={handleMouseConfirm}
        />
      )}

      {(isCatPhase || isCatSetup) && (
        <CatActionPanel
          currentCatIndex={game.currentCatIndex}
          catPositions={game.catPositions}
          isCpu={isCpuCats(game.mode)}
          isSetup={isCatSetup}
          placedCount={game.catPositions.length}
        />
      )}
    </div>
  );
}

function executeCatSearch(game: GameState, building: Position): GameState {
  const found = game.mousePosition != null && posEq(building, game.mousePosition);
  const newTrails = game.trailMarkers.map((m) =>
    posEq(m.position, building) ? { ...m, discovered: true } : m
  );
  const foundMarker = game.trailMarkers.find((m) => posEq(m.position, building));

  const newKnownEmpty = !found && !foundMarker
    ? [...game.knownEmpty, building]
    : game.knownEmpty;

  return {
    ...game,
    trailMarkers: newTrails,
    knownEmpty: newKnownEmpty,
    screen: 'search_result',
    searchResult: {
      found,
      catIndex: game.currentCatIndex,
      markerTurn: foundMarker?.turn,
      searchedBuilding: building,
    },
    catSubAction: 'idle',
    selectedCat: null,
  };
}
