import { SearchResult } from '../types';
import { useLang } from '../i18n';

interface Props {
  result: SearchResult;
  onDismiss?: () => void; // set when human cats need to tap to continue
}

export default function SearchResultOverlay({ result, onDismiss }: Props) {
  const { t } = useLang();
  const showMarker = !result.found && result.markerTurn != null;
  // Only turns 1 and 6 reveal the number — others just say "cheese found"
  const isSpecialTurn = result.markerTurn === 1 || result.markerTurn === 6;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center z-10"
      style={{ pointerEvents: onDismiss ? 'auto' : 'none' }}
      onClick={onDismiss}
    >
      <div
        className={`rounded-3xl px-8 py-5 text-center shadow-2xl animate-bounce-in ${
          result.found
            ? 'bg-red-500 text-white'
            : showMarker
            ? 'bg-orange-100 text-orange-800 border-2 border-orange-300'
            : 'bg-white text-gray-700 border-2 border-gray-200'
        }`}
      >
        <div className="text-5xl mb-2">
          {result.found ? '🚨' : showMarker ? '🧀' : '🔍'}
        </div>
        <div className="text-xl font-bold">
          {result.found
            ? t('caughtMsg')
            : showMarker
            ? isSpecialTurn
              ? `${t('cheeseFoundTurnPre')}${result.markerTurn}${t('cheeseFoundTurn')}`
              : t('cheeseFound')
            : t('notHere')}
        </div>
        <div className="text-sm mt-1 opacity-70">{t('catWord')}{result.catIndex + 1}{t('searchedBy')}</div>

        {onDismiss && (
          <div className="mt-4 text-sm font-bold opacity-80">
            {t('tapContinue')}
          </div>
        )}
      </div>
    </div>
  );
}
