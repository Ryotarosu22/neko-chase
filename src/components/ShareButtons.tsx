import { useState } from 'react';
import { buildXShareUrl, buildLineShareUrl, nativeShare, copyLink } from '../share';

interface Props {
  text: string;        // シェア文（結果メッセージなど）
  compact?: boolean;   // 小さめ表示
}

export default function ShareButtons({ text, compact }: Props) {
  const [copied, setCopied] = useState(false);

  const handleNative = async () => {
    const ok = await nativeShare(text);
    if (!ok) {
      // フォールバック：リンクコピー
      const copiedOk = await copyLink();
      if (copiedOk) {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    }
  };

  const handleCopy = async () => {
    const ok = await copyLink();
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const btn = `flex items-center justify-center gap-1 rounded-xl font-bold active:scale-95 transition-transform ${
    compact ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 text-sm'
  }`;

  return (
    <div className="w-full">
      <p className="text-xs text-gray-500 text-center mb-2">📣 友達にシェアして対戦しよう！</p>
      <div className="flex justify-center gap-2 flex-wrap">
        <a
          href={buildXShareUrl(text)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btn} bg-black text-white`}
        >
          <span>𝕏</span><span>ポスト</span>
        </a>
        <a
          href={buildLineShareUrl(text)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btn} text-white`}
          style={{ background: '#06C755' }}
        >
          <span>LINE</span>
        </a>
        <button onClick={handleNative} className={`${btn} bg-blue-500 text-white`}>
          <span>📤</span><span>共有</span>
        </button>
        <button onClick={handleCopy} className={`${btn} bg-gray-100 text-gray-700`}>
          <span>{copied ? '✅' : '🔗'}</span><span>{copied ? 'コピー済' : 'リンク'}</span>
        </button>
      </div>
    </div>
  );
}
