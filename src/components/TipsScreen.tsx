import { useState } from 'react';
import { TIP_CATEGORIES, findCategory, findArticle, L, LB } from '../tips';
import { useLang } from '../i18n';
import AffiliateBanner from './AffiliateBanner';

interface Props {
  onBack: () => void;
}

export default function TipsScreen({ onBack }: Props) {
  const { lang, t } = useLang();
  const [catId, setCatId] = useState<string | null>(null);
  const [artId, setArtId] = useState<string | null>(null);

  const category = catId ? findCategory(catId) : null;
  const article = catId && artId ? findArticle(catId, artId) : null;

  // ── 記事詳細 ──
  if (article && category) {
    return (
      <div className="flex flex-col h-full max-w-lg mx-auto bg-white">
        <Header title={L(category.name, lang)} onBack={() => setArtId(null)} />
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <p className="text-xs text-gray-400 mb-1">{category.icon} {L(category.name, lang)}</p>
          <h1 className="text-xl font-bold text-gray-800 mb-4 leading-snug">{L(article.title, lang)}</h1>
          <div className="space-y-4">
            {LB(article.body, lang).map((para, i) => (
              <p key={i} className="text-sm text-gray-700 leading-relaxed">{para}</p>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-gray-100">
            <AffiliateBanner variant="full" />
          </div>
        </div>
      </div>
    );
  }

  // ── カテゴリ内の記事一覧 ──
  if (category) {
    return (
      <div className="flex flex-col h-full max-w-lg mx-auto bg-white">
        <Header title={L(category.name, lang)} onBack={() => setCatId(null)} />
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className={`inline-flex items-center gap-2 ${category.color} text-white rounded-full px-3 py-1 text-sm font-bold mb-3`}>
            <span>{category.icon}</span>
            <span>{L(category.name, lang)}</span>
          </div>
          <p className="text-xs text-gray-500 mb-4">{L(category.description, lang)}</p>

          <div className="space-y-3">
            {category.articles.map((a) => (
              <button
                key={a.id}
                onClick={() => setArtId(a.id)}
                className="w-full text-left bg-gray-50 hover:bg-gray-100 rounded-2xl px-4 py-3 active:scale-[0.98] transition-all border border-gray-100"
              >
                <p className="font-bold text-gray-800 text-sm">{L(a.title, lang)}</p>
                <p className="text-xs text-gray-500 mt-1">{L(a.summary, lang)}</p>
                <span className="text-xs text-blue-500 font-bold mt-1 inline-block">{t('readMore')}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── カテゴリ一覧（トップ）──
  return (
    <div className="flex flex-col h-full max-w-lg mx-auto bg-white">
      <Header title={t('tipsTitle')} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <p className="text-sm text-gray-600 mb-4">{t('tipsIntro')}</p>
        <div className="grid grid-cols-1 gap-3">
          {TIP_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCatId(c.id)}
              className="w-full text-left bg-gray-50 hover:bg-gray-100 rounded-2xl px-4 py-4 active:scale-[0.98] transition-all border border-gray-100 flex items-center gap-3"
            >
              <div className={`${c.color} text-white rounded-xl w-12 h-12 flex items-center justify-center text-2xl shrink-0`}>
                {c.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800">{L(c.name, lang)}</p>
                <p className="text-xs text-gray-500 mt-0.5">{L(c.description, lang)}</p>
                <p className="text-[10px] text-gray-400 mt-1">{c.articles.length}{t('articleCount')}</p>
              </div>
              <span className="text-gray-300 text-xl">›</span>
            </button>
          ))}
        </div>
        <div className="mt-8 pt-6 border-t border-gray-100">
          <AffiliateBanner variant="full" />
        </div>
      </div>
    </div>
  );
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center px-4 py-3 border-b border-gray-200 shrink-0">
      <button
        onClick={onBack}
        className="text-sm text-gray-500 font-bold px-2 py-1 rounded-lg active:bg-gray-100"
      >
        ←
      </button>
      <h1 className="text-base font-bold text-gray-800 ml-3">{title}</h1>
    </div>
  );
}
