import { useState } from 'react';
import { GameMode } from '../types';
import AffiliateBanner from './AffiliateBanner';
import ShareButtons from './ShareButtons';

interface Props {
  onStart: (mode: GameMode, names?: { cat?: string; mouse?: string }) => void;
  onPrivacy: () => void;
  onTips: () => void;
}

export default function ModeSelect({ onStart, onPrivacy, onTips }: Props) {
  const [showNames, setShowNames] = useState(false);
  const [catName, setCatName] = useState('');
  const [mouseName, setMouseName] = useState('');

  // ── 2人対戦の名前入力画面 ──
  if (showNames) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full gap-6 px-6 py-8 bg-amber-50 overflow-y-auto">
        <div className="text-center">
          <div className="text-5xl mb-2">🤝</div>
          <h1 className="text-xl font-bold text-amber-900">プレイヤー名を入力</h1>
          <p className="text-xs text-amber-700 mt-1">空欄のままでもOK（ニャンコ／マウス）</p>
        </div>

        <div className="w-full max-w-xs flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-bold text-blue-700">🐱 ネコ側プレイヤー</span>
            <input
              type="text"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="ニャンコ"
              maxLength={10}
              className="w-full px-4 py-3 rounded-2xl border-2 border-blue-200 focus:border-blue-400 outline-none text-gray-800"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-bold text-green-700">🐭 ネズミ側プレイヤー</span>
            <input
              type="text"
              value={mouseName}
              onChange={(e) => setMouseName(e.target.value)}
              placeholder="マウス"
              maxLength={10}
              className="w-full px-4 py-3 rounded-2xl border-2 border-green-200 focus:border-green-400 outline-none text-gray-800"
            />
          </label>
        </div>

        <div className="w-full max-w-xs flex flex-col gap-2">
          <button
            onClick={() => onStart('local', { cat: catName, mouse: mouseName })}
            className="w-full py-4 rounded-2xl bg-amber-400 text-white font-bold text-lg shadow-md active:scale-95 transition-transform"
          >
            対戦スタート →
          </button>
          <button
            onClick={() => setShowNames(false)}
            className="text-xs text-amber-500 underline"
          >
            ← 戻る
          </button>
        </div>
      </div>
    );
  }

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
          onClick={() => setShowNames(true)}
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
