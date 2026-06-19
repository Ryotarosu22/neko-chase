interface Props {
  onBack: () => void;
}

export default function PrivacyPolicy({ onBack }: Props) {
  return (
    <div className="flex flex-col h-full max-w-lg mx-auto bg-white">
      <div className="flex items-center px-4 py-3 border-b border-gray-200">
        <button
          onClick={onBack}
          className="text-sm text-gray-500 font-bold px-2 py-1 rounded-lg active:bg-gray-100"
        >
          ← 戻る
        </button>
        <h1 className="text-base font-bold text-gray-800 ml-3">プライバシーポリシー</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 text-sm text-gray-700 leading-relaxed space-y-4">
        <p className="text-xs text-gray-400">最終更新日：2025年6月20日</p>

        <section>
          <h2 className="font-bold text-gray-800 mb-1">1. はじめに</h2>
          <p>
            本プライバシーポリシーは、「ニャンコ探偵とこそ泥ネズミ」（以下「本サービス」）における
            個人情報の取り扱いについて説明するものです。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-800 mb-1">2. 収集する情報</h2>
          <p>
            本サービスはゲームの進行状態をお客様のデバイス内のみで処理します。
            氏名・メールアドレス・住所などの個人を特定できる情報は収集しません。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-800 mb-1">3. 広告について</h2>
          <p>
            本サービスでは、Google AdSense を利用した広告を掲載しています。
            Google AdSense は Cookie を使用して、ユーザーの興味に基づいた広告を表示することがあります。
            Cookie の使用を無効にする方法や Google の広告に関する詳細は、
            <a
              href="https://policies.google.com/technologies/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Google のポリシーと規約
            </a>
            をご覧ください。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-800 mb-1">4. アクセス解析</h2>
          <p>
            本サービスでは、サービス改善のために Google アナリティクス等のアクセス解析ツールを
            使用する場合があります。これらのツールは Cookie を使用してデータを収集しますが、
            個人を特定する情報は含まれません。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-800 mb-1">5. 第三者への提供</h2>
          <p>
            本サービスは、法令に基づく場合を除き、収集した情報を第三者に提供することはありません。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-800 mb-1">6. お問い合わせ</h2>
          <p>
            プライバシーポリシーに関するお問い合わせは、以下のメールアドレスまでご連絡ください。
          </p>
          <p className="mt-1 font-mono text-xs bg-gray-100 rounded px-2 py-1 inline-block">
            ryochan.mantarou@gmail.com
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-800 mb-1">7. 変更について</h2>
          <p>
            本プライバシーポリシーは、必要に応じて変更することがあります。
            変更後のポリシーは本ページに掲載します。
          </p>
        </section>
      </div>
    </div>
  );
}
