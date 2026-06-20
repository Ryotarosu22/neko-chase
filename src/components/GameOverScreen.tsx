import { Winner, WinReason } from '../types';

interface Props {
  winner: Winner;
  winReason: WinReason;
  onPlayAgain: () => void;
}

const messages: Record<WinReason, { emoji: string; title: string; sub: string }> = {
  escaped: {
    emoji: '🐭',
    title: 'ネズミの勝ち！',
    sub: '11ターン逃げ切った！チーズは俺のものだ！',
  },
  caught: {
    emoji: '🚔',
    title: 'ネコの勝ち！',
    sub: 'ネズミを見つけた！チーズを取り返せ！',
  },
  trapped: {
    emoji: '🏠',
    title: 'ネコの勝ち！',
    sub: 'ネズミに逃げ場がなくなった…',
  },
};

export default function GameOverScreen({ winner, winReason, onPlayAgain }: Props) {
  const msg = messages[winReason];
  const isMouseWin = winner === 'mouse';

  return (
    <div className={`w-full px-4 py-3 flex items-center gap-3 border-t-2 ${isMouseWin ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
      <div className="text-4xl animate-bounce-in shrink-0">{msg.emoji}</div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-800 text-base leading-tight">{msg.title}</p>
        <p className="text-gray-500 text-xs mt-0.5">{msg.sub}</p>
        <p className="text-xs text-gray-400 mt-0.5">↑ ネズミの移動経路</p>
      </div>
      <button
        onClick={onPlayAgain}
        className={`shrink-0 px-4 py-2 rounded-2xl text-white font-bold text-sm shadow active:scale-95 transition-transform ${isMouseWin ? 'bg-green-500' : 'bg-blue-500'}`}
      >
        もう一度！
      </button>
    </div>
  );
}
