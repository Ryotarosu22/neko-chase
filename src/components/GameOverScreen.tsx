import { Winner, WinReason } from '../types';
import ShareButtons from './ShareButtons';

interface Props {
  winner: Winner;
  winReason: WinReason;
  onPlayAgain: () => void;
}

const messages: Record<WinReason, { emoji: string; title: string; sub: string; share: string }> = {
  escaped: {
    emoji: '🐭',
    title: 'ネズミの勝ち！',
    sub: '11ターン逃げ切った！チーズは俺のものだ！',
    share: '🐭ネズミで11ターン逃げ切った！ニャンコ探偵から見事に逃走成功🧀 あなたは逃げ切れる？',
  },
  caught: {
    emoji: '🚔',
    title: 'ネコの勝ち！',
    sub: 'ネズミを見つけた！チーズを取り返せ！',
    share: '🐱ニャンコ探偵がこそ泥ネズミを発見！見事チーズを取り返したよ🚔 あなたも推理で捕まえてみて！',
  },
  trapped: {
    emoji: '🏠',
    title: 'ネコの勝ち！',
    sub: 'ネズミに逃げ場がなくなった…',
    share: '🐱ネズミを袋小路に追い詰めて勝利！逃げ場をなくす包囲戦が決まった🏠 あなたも挑戦してみて！',
  },
};

export default function GameOverScreen({ winner, winReason, onPlayAgain }: Props) {
  const msg = messages[winReason];
  const isMouseWin = winner === 'mouse';

  return (
    <div className={`w-full border-t-2 ${isMouseWin ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
      <div className="px-4 py-3 flex items-center gap-3">
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
      <div className="px-4 pb-3">
        <ShareButtons text={msg.share} compact />
      </div>
    </div>
  );
}
