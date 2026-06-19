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
    <div className={`w-full max-w-xs rounded-3xl px-6 py-6 text-center shadow-2xl ${isMouseWin ? 'bg-green-50' : 'bg-blue-50'}`}>
      <div className="text-7xl mb-2 animate-bounce-in">{msg.emoji}</div>
      <h2 className="text-2xl font-bold text-gray-800">{msg.title}</h2>
      <p className="text-gray-600 mt-1 text-sm">{msg.sub}</p>
      {winReason !== 'escaped' && (
        <p className="text-xs text-gray-400 mt-2">↓ ネズミの移動経路</p>
      )}
      <button
        onClick={onPlayAgain}
        className={`mt-4 w-full py-3 rounded-2xl text-white font-bold text-lg shadow active:scale-95 transition-transform ${isMouseWin ? 'bg-green-500' : 'bg-blue-500'}`}
      >
        もう一度！
      </button>
    </div>
  );
}
