import { GameMode } from '../types';
import AffiliateBanner from './AffiliateBanner';
import ShareButtons from './ShareButtons';

interface Props {
  onStart: (mode: GameMode) => void;
  onPrivacy: () => void;
  onTips: () => void;
}

export default function ModeSelect({ onStart, onPrivacy, onTips }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full gap-6 px-6 py-8 bg-amber-50 overflow-y-auto">
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

      <button
        onClick={onTips}
        className="w-full max-w-xs py-3 rounded-2xl bg-white border-2 border-amber-300 text-amber-700 font-bold shadow-sm active:scale-95 transition-transform"
      >
        💡 攻略のコツを読む
      </button>

      <ShareButtons text="🐱🐭ニャンコ探偵とこそ泥ネズミ！チーズを盗んだネズミを3匹のネコで追いつめる無料の推理ボードゲーム。スマホでサクッと遊べるよ🧀" />

      <AffiliateBanner variant="full" />

      <button
        onClick={onPrivacy}
        className="text-xs text-amber-500 underline mt-2"
      >
        プライバシーポリシー
      </button>
    </div>
  );
}
