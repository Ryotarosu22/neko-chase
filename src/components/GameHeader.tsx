import { useState } from 'react';
import { Screen } from '../types';
import { MAX_ROUNDS } from '../gameLogic';
import { isMuted, toggleMuted } from '../sound';

interface Props {
  round: number;
  screen: Screen;
  currentCatIndex: number;
  onQuit: () => void;
}

export default function GameHeader({ round, screen, currentCatIndex, onQuit }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [muted, setMuted] = useState(isMuted());
  const isCatPhase = screen === 'cat_acting' || screen === 'search_result';
  const isMousePhase = screen === 'mouse_moving' || screen === 'mouse_setup';

  return (
    <>
      <div className="flex items-center justify-between px-4 py-2 bg-white shadow-sm">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setConfirming(true)}
            className="text-xs text-gray-400 font-bold px-2 py-1 rounded-lg active:bg-gray-100"
          >
            ✕ やめる
          </button>
          <button
            onClick={() => setMuted(toggleMuted())}
            className="text-sm px-1.5 py-1 rounded-lg active:bg-gray-100"
            aria-label={muted ? 'サウンドをオン' : 'サウンドをオフ'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
        </div>

        {/* Round progress dots */}
        <div className="flex gap-1">
          {Array.from({ length: MAX_ROUNDS }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i + 1 < round
                  ? 'bg-gray-400'
                  : i + 1 === round
                  ? 'bg-amber-500'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <div className="text-sm font-bold min-w-[4rem] text-right">
          {isMousePhase && <span className="text-green-600">🐭 ネズミ</span>}
          {isCatPhase && (
            <span className="text-blue-600">🐱 ネコ{currentCatIndex + 1}</span>
          )}
          {!isMousePhase && !isCatPhase && (
            <span className="text-xs text-gray-400">T{round}/{MAX_ROUNDS}</span>
          )}
        </div>
      </div>

      {/* Quit confirm dialog */}
      {confirming && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl px-6 py-6 text-center shadow-2xl w-full max-w-xs">
            <div className="text-4xl mb-2">🏠</div>
            <p className="font-bold text-gray-800 text-lg">ゲームをやめますか？</p>
            <p className="text-sm text-gray-500 mt-1">進行中のゲームは失われます</p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold active:scale-95 transition-transform"
              >
                続ける
              </button>
              <button
                onClick={onQuit}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-bold active:scale-95 transition-transform"
              >
                やめる
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
