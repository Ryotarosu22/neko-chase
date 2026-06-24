import { useState } from 'react';
import { GameMode, Difficulty } from '../types';
import { useLang } from '../i18n';
import AffiliateBanner from './AffiliateBanner';
import ShareButtons from './ShareButtons';
import LangToggle from './LangToggle';

interface Props {
  onStart: (mode: GameMode, names?: { cat?: string; mouse?: string }, difficulty?: Difficulty) => void;
  onPrivacy: () => void;
  onTips: () => void;
}

export default function ModeSelect({ onStart, onPrivacy, onTips }: Props) {
  const { t } = useLang();
  const [showNames, setShowNames] = useState(false);
  const [catName, setCatName] = useState('');
  const [mouseName, setMouseName] = useState('');
  const [cpuMode, setCpuMode] = useState<GameMode | null>(null);

  const DIFFICULTIES: { id: Difficulty; emoji: string; color: string; labelKey: 'beginner' | 'intermediate' | 'advanced'; descKey: 'beginnerDesc' | 'intermediateDesc' | 'advancedDesc' }[] = [
    { id: 'beginner', emoji: '🌱', color: 'bg-green-400', labelKey: 'beginner', descKey: 'beginnerDesc' },
    { id: 'intermediate', emoji: '🔥', color: 'bg-orange-400', labelKey: 'intermediate', descKey: 'intermediateDesc' },
    { id: 'advanced', emoji: '👑', color: 'bg-purple-500', labelKey: 'advanced', descKey: 'advancedDesc' },
  ];

  // ── CPU対戦の難易度選択画面 ──
  if (cpuMode) {
    const isMouse = cpuMode === 'cpu_mouse';
    return (
      <div className="flex flex-col items-center justify-center min-h-full gap-6 px-6 py-8 bg-amber-50 overflow-y-auto">
        <div className="text-center">
          <div className="text-5xl mb-2">{isMouse ? '🐭' : '🐱'}</div>
          <h1 className="text-xl font-bold text-amber-900">{t('diffTitle')}</h1>
          <p className="text-xs text-amber-700 mt-1">{isMouse ? t('diffSubMouse') : t('diffSubCat')}</p>
        </div>

        <div className="w-full max-w-xs flex flex-col gap-3">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.id}
              onClick={() => onStart(cpuMode, undefined, d.id)}
              className={`w-full ${d.color} text-white rounded-2xl px-4 py-3 shadow-md active:scale-95 transition-transform text-left flex items-center gap-3`}
            >
              <span className="text-3xl shrink-0">{d.emoji}</span>
              <span className="flex-1">
                <span className="block font-bold text-lg">{t(d.labelKey)}</span>
                <span className="block text-xs opacity-90">{t(d.descKey)}</span>
              </span>
            </button>
          ))}
        </div>

        <button onClick={() => setCpuMode(null)} className="text-xs text-amber-500 underline">
          {t('back')}
        </button>
      </div>
    );
  }

  // ── 2人対戦の名前入力画面 ──
  if (showNames) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full gap-6 px-6 py-8 bg-amber-50 overflow-y-auto">
        <div className="text-center">
          <div className="text-5xl mb-2">🤝</div>
          <h1 className="text-xl font-bold text-amber-900">{t('nameTitle')}</h1>
          <p className="text-xs text-amber-700 mt-1">{t('nameHint')}</p>
        </div>

        <div className="w-full max-w-xs flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-bold text-blue-700">{t('catPlayer')}</span>
            <input
              type="text"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder={t('defaultCat')}
              maxLength={12}
              className="w-full px-4 py-3 rounded-2xl border-2 border-blue-200 focus:border-blue-400 outline-none text-gray-800"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-bold text-green-700">{t('mousePlayer')}</span>
            <input
              type="text"
              value={mouseName}
              onChange={(e) => setMouseName(e.target.value)}
              placeholder={t('defaultMouse')}
              maxLength={12}
              className="w-full px-4 py-3 rounded-2xl border-2 border-green-200 focus:border-green-400 outline-none text-gray-800"
            />
          </label>
        </div>

        <div className="w-full max-w-xs flex flex-col gap-2">
          <button
            onClick={() => onStart('local', { cat: catName, mouse: mouseName })}
            className="w-full py-4 rounded-2xl bg-amber-400 text-white font-bold text-lg shadow-md active:scale-95 transition-transform"
          >
            {t('startMatch')}
          </button>
          <button onClick={() => setShowNames(false)} className="text-xs text-amber-500 underline">
            {t('back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-full gap-6 px-6 py-8 bg-amber-50 overflow-y-auto">
      <div className="w-full max-w-xs flex justify-end">
        <LangToggle />
      </div>

      <div className="text-center animate-bounce-in">
        <div className="text-6xl mb-2">🐭</div>
        <h1 className="text-2xl font-bold text-amber-900 leading-tight whitespace-pre-line">
          {t('appTitle')}
        </h1>
        <p className="text-sm text-amber-700 mt-2">{t('tagline')}</p>
      </div>

      <div className="w-full max-w-xs flex flex-col gap-3">
        <button
          onClick={() => setShowNames(true)}
          className="w-full py-4 rounded-2xl bg-amber-400 text-white font-bold text-lg shadow-md active:scale-95 transition-transform"
        >
          {t('modeLocal')}
        </button>
        <button
          onClick={() => setCpuMode('cpu_cat')}
          className="w-full py-4 rounded-2xl bg-orange-400 text-white font-bold text-lg shadow-md active:scale-95 transition-transform"
        >
          {t('modeCpuCat')}
        </button>
        <button
          onClick={() => setCpuMode('cpu_mouse')}
          className="w-full py-4 rounded-2xl bg-blue-400 text-white font-bold text-lg shadow-md active:scale-95 transition-transform"
        >
          {t('modeCpuMouse')}
        </button>
      </div>

      <div className="text-xs text-amber-600 text-center max-w-xs bg-amber-100 rounded-xl p-3">
        <p className="font-semibold mb-1">{t('howToTitle')}</p>
        <p>{t('howToBody')}</p>
      </div>

      <button
        onClick={onTips}
        className="w-full max-w-xs py-3 rounded-2xl bg-white border-2 border-amber-300 text-amber-700 font-bold shadow-sm active:scale-95 transition-transform"
      >
        {t('readTips')}
      </button>

      <ShareButtons text={t('shareText')} />

      <AffiliateBanner variant="full" />

      <button onClick={onPrivacy} className="text-xs text-amber-500 underline mt-2">
        {t('privacy')}
      </button>
    </div>
  );
}
