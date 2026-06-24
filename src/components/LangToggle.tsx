import { useLang } from '../i18n';

/** 日本語／英語の切り替えボタン */
export default function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="inline-flex rounded-full border border-amber-300 overflow-hidden text-xs font-bold">
      <button
        onClick={() => setLang('ja')}
        className={`px-3 py-1 ${lang === 'ja' ? 'bg-amber-400 text-white' : 'bg-white text-amber-600'}`}
      >
        日本語
      </button>
      <button
        onClick={() => setLang('en')}
        className={`px-3 py-1 ${lang === 'en' ? 'bg-amber-400 text-white' : 'bg-white text-amber-600'}`}
      >
        EN
      </button>
    </div>
  );
}
