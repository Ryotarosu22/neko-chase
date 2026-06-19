import { GameMode } from '../types';

interface Props {
  onStart: (mode: GameMode) => void;
}

export default function ModeSelect({ onStart }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-6 bg-amber-50">
      <div className="text-center animate-bounce-in">
        <div className="text-6xl mb-2">🐭</div>
        <h1 className="text-2xl font-bold text-amber-900 leading-tight">
          ニャンコ探偵と
          <br />
          こそ泥ネズミ
        </h1>
        <p className="text-sm text-amber-700 mt-2">チーズを盗んだネズミをつかまえろ！</p>
      </div>

      <div className="w-full max-w-xs flex flex-col gap-3">
        <button
          onClick={() => onStart('local')}
          className="w-full py-4 rounded-2xl bg-amber-400 text-white font-bold text-lg shadow-md active:scale-95 transition-transform"
        >
          🤝 同じ端末で2人対戦
        </button>
        <button
          onClick={() => onStart('cpu_cat')}
          className="w-full py-4 rounded-2xl bg-orange-400 text-white font-bold text-lg shadow-md active:scale-95 transition-transform"
        >
          🐱 CPU対戦（自分がネズミ役）
        </button>
        <button
          onClick={() => onStart('cpu_mouse')}
          className="w-full py-4 rounded-2xl bg-blue-400 text-white font-bold text-lg shadow-md active:scale-95 transition-transform"
        >
          🐭 CPU対戦（自分がネコ役）
        </button>
      </div>

      <div className="text-xs text-amber-600 text-center max-w-xs bg-amber-100 rounded-xl p-3">
        <p className="font-semibold mb-1">🎮 遊び方</p>
        <p>ネコは3匹のニャンコを動かして捜索。ネズミは11ターン逃げ切れば勝ち！</p>
      </div>
    </div>
  );
}
