import { Position } from '../types';
import { MAX_ROUNDS } from '../gameLogic';
import { useLang } from '../i18n';

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
  const { t } = useLang();
  return (
    <div className="px-4 py-3 bg-white border-t border-gray-100">
      <div className="text-center">
        {isSetup ? (
          <>
            <p className="text-sm text-gray-600 mb-2">{t('mouseSetupTap')}</p>
            {selectedMove && (
              <button
                onClick={onConfirm}
                className="w-full py-3 rounded-xl bg-green-500 text-white font-bold text-base shadow active:scale-95 transition-transform"
              >
                {t('startHere')}
              </button>
            )}
          </>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-1">
              {t('mouseMoveTap')}
              <span className="text-gray-400 ml-1">
                {t('turnsLeftPre')}{Math.max(1, MAX_ROUNDS - round + 2)}{t('turnsLeftSuf')}
              </span>
            </p>
            {validMoveCount === 0 && (
              <p className="text-red-500 text-sm font-bold">{t('noMoves')}</p>
            )}
            {selectedMove && (
              <button
                onClick={onConfirm}
                className="w-full py-3 rounded-xl bg-green-500 text-white font-bold text-base shadow active:scale-95 transition-transform"
              >
                {t('moveHere')}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
