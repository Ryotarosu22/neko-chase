import { Position } from '../types';
import { NUM_CATS, catPosLabel } from '../gameLogic';
import { useLang } from '../i18n';

interface Props {
  currentCatIndex: number;
  remainingCats: number[];
  selectedCat: number | null;
  catPositions: Position[];
  isCpu: boolean;
  isSetup?: boolean;
  placedCount?: number;
}

const catColorClasses = [
  { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-700' },
  { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-700' },
  { bg: 'bg-indigo-100', border: 'border-indigo-400', text: 'text-indigo-700' },
];

export default function CatActionPanel({ currentCatIndex, remainingCats, selectedCat, catPositions, isCpu, isSetup, placedCount = 0 }: Props) {
  const { t } = useLang();
  const catW = t('catWord');
  if (isCpu) {
    return (
      <div className="px-4 py-3 bg-white border-t border-gray-100 text-center text-gray-500 text-sm">
        {t('cpuThinking')}
      </div>
    );
  }

  if (isSetup) {
    return (
      <div className="px-4 py-3 bg-white border-t border-gray-100">
        <div className="flex gap-2 mb-2">
          {Array.from({ length: NUM_CATS }).map((_, i) => {
            const placed = i < placedCount;
            const isCurrent = i === placedCount;
            const c = catColorClasses[i];
            return (
              <div
                key={i}
                className={`flex-1 flex flex-col items-center py-1.5 rounded-xl border-2 text-xs font-bold
                  ${placed ? `${c.bg} ${c.border} ${c.text} opacity-60` : ''}
                  ${isCurrent ? `${c.bg} ${c.border} ${c.text}` : ''}
                  ${!placed && !isCurrent ? 'border-gray-200 bg-gray-50 opacity-30' : ''}
                `}
              >
                <span className="text-xl">{placed ? '✅' : '🐱'}</span>
                <span>{catW}{i + 1}</span>
                <span className="text-gray-400 font-normal">
                  {placed && catPositions[i] ? catPosLabel(catPositions[i]) : t('notPlaced')}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-center font-semibold text-blue-600">
          {catW}{placedCount + 1}{t('placeCatHint')}
        </p>
      </div>
    );
  }

  const isSelecting = selectedCat === null && remainingCats.length > 0;

  return (
    <div className="px-4 py-3 bg-white border-t border-gray-100">
      <div className="flex gap-2 mb-2">
        {Array.from({ length: NUM_CATS }).map((_, i) => {
          const isDone = !remainingCats.includes(i) && i !== selectedCat;
          const isSelected = i === selectedCat;
          const isAvailable = remainingCats.includes(i) && i !== selectedCat;
          const c = catColorClasses[i];
          return (
            <div
              key={i}
              className={`flex-1 flex flex-col items-center py-1.5 rounded-xl border-2 text-xs font-bold transition-all
                ${isDone ? 'border-gray-200 bg-gray-100 opacity-40' : ''}
                ${isSelected ? `${c.bg} ${c.border} ${c.text} ring-2 ring-offset-1 ring-amber-400` : ''}
                ${isAvailable ? `${c.bg} ${c.border} ${c.text}` : ''}
              `}
            >
              <span className="text-xl">{isDone ? '✅' : '🐱'}</span>
              <span>{catW}{i + 1}</span>
              <span className="font-normal" style={{ color: isDone ? '#9ca3af' : undefined }}>
                {catPositions[i] ? catPosLabel(catPositions[i]) : '—'}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-center font-semibold" style={{ color: isSelecting ? '#16a34a' : '#6b7280' }}>
        {isSelecting
          ? t('selectCat')
          : `${catW}${(selectedCat ?? currentCatIndex) + 1}${t('catActionHint')}`}
      </p>
    </div>
  );
}
