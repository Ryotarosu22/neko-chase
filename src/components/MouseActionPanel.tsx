import { Position } from '../types';
import { MAX_ROUNDS } from '../gameLogic';

interface Props {
  round: number;
  isSetup: boolean;
  validMoveCount: number;
  selectedMove: Position | null;
  onConfirm: () => void;
}

export default function MouseActionPanel({
  round,
  isSetup,
  validMoveCount,
  selectedMove,
  onConfirm,
}: Props) {
  return (
    <div className="px-4 py-3 bg-white border-t border-gray-100">
      <div className="text-center">
        {isSetup ? (
          <>
            <p className="text-sm text-gray-600 mb-2">
              📍 スタート位置を選んでください（ネコには見せないで！）
            </p>
            {selectedMove && (
              <button
                onClick={onConfirm}
                className="w-full py-3 rounded-xl bg-green-500 text-white font-bold text-base shadow active:scale-95 transition-transform"
              >
                ここからスタート！
              </button>
            )}
          </>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-1">
              🏃 移動先をタップ
              <span className="text-gray-400 ml-1">（残り {MAX_ROUNDS - round + 1} ターン）</span>
            </p>
            {validMoveCount === 0 && (
              <p className="text-red-500 text-sm font-bold">移動できる場所がありません！</p>
            )}
            {selectedMove && (
              <button
                onClick={onConfirm}
                className="w-full py-3 rounded-xl bg-green-500 text-white font-bold text-base shadow active:scale-95 transition-transform"
              >
                ここへ移動する！
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
