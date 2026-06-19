import { Screen } from '../types';
import { MAX_ROUNDS } from '../gameLogic';

interface Props {
  round: number;
  screen: Screen;
  currentCatIndex: number;
}

export default function GameHeader({ round, screen, currentCatIndex }: Props) {
  const isCatPhase = screen === 'cat_acting' || screen === 'search_result';
  const isMousePhase = screen === 'mouse_moving' || screen === 'mouse_setup';

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white shadow-sm">
      <div className="text-sm font-bold text-gray-600">
        ターン <span className="text-amber-600 text-base">{round}</span>
        <span className="text-gray-400"> / {MAX_ROUNDS}</span>
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

      <div className="text-sm font-bold">
        {isMousePhase && <span className="text-green-600">🐭 ネズミ</span>}
        {isCatPhase && (
          <span className="text-blue-600">🐱 ネコ{currentCatIndex + 1}</span>
        )}
        {!isMousePhase && !isCatPhase && <span className="text-gray-400">—</span>}
      </div>
    </div>
  );
}
