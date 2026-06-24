interface Props {
  to: 'mouse' | 'cat';
  onReady: () => void;
  isSetup?: boolean;
  name?: string;
}

export default function HandoffScreen({ to, onReady, isSetup, name }: Props) {
  const isMouse = to === 'mouse';
  const displayName = name || (isMouse ? 'マウス' : 'ニャンコ');

  return (
    <div
      className={`flex flex-col items-center justify-center h-full gap-6 px-6 ${
        isMouse ? 'bg-green-50' : 'bg-blue-50'
      }`}
    >
      <div className="text-center animate-bounce-in">
        <div className="text-7xl mb-3">{isMouse ? '🐭' : '🐱'}</div>
        <h2 className="text-xl font-bold text-gray-800">
          {displayName}さんの番です
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {isMouse ? 'ネズミ側' : 'ネコ側'}・相手は目を閉じてください
        </p>
      </div>

      <div
        className={`rounded-2xl p-4 text-center text-sm w-full max-w-xs ${
          isMouse ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
        }`}
      >
        {isMouse && isSetup && (
          <p>📍 まず、ネズミの<strong>スタート位置</strong>を選んでください（ネコには見せないで！）</p>
        )}
        {isMouse && !isSetup && (
          <p>🏃 ネズミの番です。移動先を選んでください。</p>
        )}
        {!isMouse && (
          <p>🔍 ネコの番です。3匹のニャンコを動かして捜索しましょう！</p>
        )}
      </div>

      <button
        onClick={onReady}
        className={`w-full max-w-xs py-4 rounded-2xl text-white font-bold text-lg shadow-md active:scale-95 transition-transform ${
          isMouse ? 'bg-green-500' : 'bg-blue-500'
        }`}
      >
        準備完了 →
      </button>
    </div>
  );
}
