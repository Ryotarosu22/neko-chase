import { useLang } from '../i18n';

interface Props {
  onBack: () => void;
}

const SECTIONS = [
  {
    h: { ja: '1. はじめに', en: '1. Introduction' },
    p: {
      ja: '本ポリシーは、「ニャンコ探偵とこそ泥ネズミ」（以下「本サービス」）における個人情報の取り扱いについて説明します。',
      en: 'This policy explains how "Detective Cats & The Cheese Thief" (the "Service") handles personal information.',
    },
  },
  {
    h: { ja: '2. 収集する情報', en: '2. Information we collect' },
    p: {
      ja: '本サービスはゲームの進行状態をお客様のデバイス内のみで処理します。氏名・メールアドレス・住所などの個人を特定できる情報は収集しません。',
      en: 'The Service processes game state only on your device. We do not collect personally identifiable information such as your name, email, or address.',
    },
  },
  {
    h: { ja: '3. 広告について', en: '3. Advertising' },
    p: {
      ja: '本サービスでは Google AdSense による広告を掲載することがあります。Cookie を使い、ユーザーの興味に基づいた広告が表示される場合があります。詳細は Google のポリシーをご確認ください。',
      en: 'The Service may display ads via Google AdSense, which may use cookies to show interest-based ads. See Google\'s policies for details.',
    },
  },
  {
    h: { ja: '4. アフィリエイト', en: '4. Affiliate links' },
    p: {
      ja: '本サービスは Amazon アソシエイト・プログラムの参加者です。商品リンク経由の購入で紹介料を得ることがあります。',
      en: 'The Service participates in the Amazon Associates Program and may earn referral fees from purchases made via product links.',
    },
  },
  {
    h: { ja: '5. 第三者への提供', en: '5. Third parties' },
    p: {
      ja: '法令に基づく場合を除き、収集した情報を第三者に提供することはありません。',
      en: 'We do not provide collected information to third parties except as required by law.',
    },
  },
  {
    h: { ja: '6. お問い合わせ', en: '6. Contact' },
    p: {
      ja: 'お問い合わせは ryochan.mantarou@gmail.com までご連絡ください。',
      en: 'For inquiries, contact ryochan.mantarou@gmail.com.',
    },
  },
];

export default function PrivacyPolicy({ onBack }: Props) {
  const { lang, t } = useLang();
  return (
    <div className="flex flex-col h-full max-w-lg mx-auto bg-white">
      <div className="flex items-center px-4 py-3 border-b border-gray-200">
        <button onClick={onBack} className="text-sm text-gray-500 font-bold px-2 py-1 rounded-lg active:bg-gray-100">
          ←
        </button>
        <h1 className="text-base font-bold text-gray-800 ml-3">{t('privacy')}</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 text-sm text-gray-700 leading-relaxed space-y-4">
        <p className="text-xs text-gray-400">{lang === 'ja' ? '最終更新日：2025年6月20日' : 'Last updated: June 20, 2025'}</p>
        {SECTIONS.map((s, i) => (
          <section key={i}>
            <h2 className="font-bold text-gray-800 mb-1">{s.h[lang]}</h2>
            <p>{s.p[lang]}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
