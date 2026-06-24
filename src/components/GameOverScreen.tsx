import { Winner, WinReason } from '../types';
import { useLang } from '../i18n';
import ShareButtons from './ShareButtons';

interface Props {
  winner: Winner;
  winReason: WinReason;
  onPlayAgain: () => void;
  catName?: string;
  mouseName?: string;
  showNames?: boolean; // 2人対戦時のみ名前で表示
}

const META: Record<WinReason, { emoji: string; subKey: 'escapedSub' | 'caughtSub' | 'trappedSub' }> = {
  escaped: { emoji: '🐭', subKey: 'escapedSub' },
  caught: { emoji: '🚔', subKey: 'caughtSub' },
  trapped: { emoji: '🏠', subKey: 'trappedSub' },
};

const SHARE: Record<WinReason, string> = {
  escaped: '🐭ネズミで11ターン逃げ切った！ / Survived 11 turns as the mouse! 🧀',
  caught: '🐱こそ泥ネズミを発見！ / The detective cats caught the thief! 🚔',
  trapped: '🐱ネズミを袋小路に追い詰めて勝利！ / Cornered the mouse to win! 🏠',
};

export default function GameOverScreen({ winner, winReason, onPlayAgain, catName, mouseName, showNames }: Props) {
  const { t } = useLang();
  const meta = META[winReason];
  const isMouseWin = winner === 'mouse';

  const title = showNames
    ? `${isMouseWin ? (mouseName || t('defaultMouse')) : (catName || t('defaultCat'))}${t('winSuffix')}`
    : (isMouseWin ? t('mouseWin') : t('catWin'));

  return (
    <div className={`w-full border-t-2 ${isMouseWin ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="text-4xl animate-bounce-in shrink-0">{meta.emoji}</div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800 text-base leading-tight">{title}</p>
          <p className="text-gray-500 text-xs mt-0.5">{t(meta.subKey)}</p>
          <p className="text-xs text-gray-400 mt-0.5">{t('routeHint')}</p>
        </div>
        <button
          onClick={onPlayAgain}
          className={`shrink-0 px-4 py-2 rounded-2xl text-white font-bold text-sm shadow active:scale-95 transition-transform ${isMouseWin ? 'bg-green-500' : 'bg-blue-500'}`}
        >
          {t('playAgain')}
        </button>
      </div>
      <div className="px-4 pb-3">
        <ShareButtons text={SHARE[winReason]} compact />
      </div>
    </div>
  );
}
