import { useState } from 'react';
import { useLang } from '../i18n';

interface Props {
  onClose: () => void;
}

interface Step {
  emoji: string;
  title: { ja: string; en: string };
  body: { ja: string; en: string };
}

const STEPS: Step[] = [
  {
    emoji: '🧀',
    title: { ja: 'チーズを盗んだネズミ', en: 'A mouse stole the cheese' },
    body: {
      ja: 'こそ泥ネズミ1匹と、追う3匹のニャンコ探偵で対戦します。ネズミは11ターン逃げ切れば勝ち、ネコは見つければ勝ちです。',
      en: 'One thieving mouse runs from 3 detective cats. The mouse wins by surviving 11 turns; the cats win by finding it.',
    },
  },
  {
    emoji: '🏢',
    title: { ja: '盤面の見方', en: 'Reading the board' },
    body: {
      ja: '大きなマス＝ビル（ネズミが隠れる場所）。その間の小さなマス＝ネコの位置。ネコ1匹は隣接する4つのビルを捜索できます。',
      en: 'Big tiles are buildings (where the mouse hides). The small squares between them are cat positions. Each cat can search its 4 adjacent buildings.',
    },
  },
  {
    emoji: '🐱',
    title: { ja: 'ネコの操作', en: 'Controlling the cats' },
    body: {
      ja: '動かすネコをタップ→ 通路マスをタップで移動、ビルをタップで捜索。1匹につき1回行動し、3匹動かすとネズミの番です。',
      en: 'Tap a cat, then tap a path to move or a building to search. Each cat acts once; after all three, it is the mouse\'s turn.',
    },
  },
  {
    emoji: '🐭',
    title: { ja: 'ネズミの動き', en: 'How the mouse moves' },
    body: {
      ja: 'ネズミは隣のビルへ1マス移動し、通った場所に痕跡（チーズ）を残します。痕跡のあるビルには二度と戻れません。',
      en: 'The mouse steps to an adjacent building, leaving a cheese trail. It can never return to a building with its trail.',
    },
  },
  {
    emoji: '🏆',
    title: { ja: '勝敗', en: 'Winning' },
    body: {
      ja: 'ネコがネズミのいるビルを捜索すれば捕獲・ネコの勝ち。11ターン逃げ切ればネズミの勝ち。まずはCPU対戦で慣れましょう！',
      en: 'If a cat searches the mouse\'s building, it is caught. Survive 11 turns and the mouse wins. Try CPU mode first to get the hang of it!',
    },
  },
];

export default function Tutorial({ onClose }: Props) {
  const { lang, t } = useLang();
  const [step, setStep] = useState(0);
  const s = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="bg-amber-50 px-6 py-8 text-center">
          <div className="text-6xl mb-3 animate-bounce-in">{s.emoji}</div>
          <h2 className="text-xl font-bold text-amber-900">{s.title[lang]}</h2>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-gray-700 leading-relaxed min-h-[5rem]">{s.body[lang]}</p>

          {/* progress dots */}
          <div className="flex justify-center gap-1.5 my-4">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-amber-500' : 'bg-gray-200'}`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-2">
            {step > 0 ? (
              <button onClick={() => setStep(step - 1)} className="text-sm text-gray-500 font-bold px-3 py-2">
                {t('tutBack')}
              </button>
            ) : (
              <button onClick={onClose} className="text-sm text-gray-400 px-3 py-2">
                {t('tutSkip')}
              </button>
            )}
            {isLast ? (
              <button
                onClick={onClose}
                className="flex-1 ml-2 py-3 rounded-2xl bg-amber-400 text-white font-bold shadow active:scale-95 transition-transform"
              >
                {t('tutStart')}
              </button>
            ) : (
              <button
                onClick={() => setStep(step + 1)}
                className="flex-1 ml-2 py-3 rounded-2xl bg-amber-400 text-white font-bold shadow active:scale-95 transition-transform"
              >
                {t('tutNext')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
