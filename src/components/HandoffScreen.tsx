import { useLang } from '../i18n';

interface Props {
  to: 'mouse' | 'cat';
  onReady: () => void;
  isSetup?: boolean;
  name?: string;
}

export default function HandoffScreen({ to, onReady, isSetup, name }: Props) {
  const { t } = useLang();
  const isMouse = to === 'mouse';
  const displayName = name || (isMouse ? t('defaultMouse') : t('defaultCat'));

  return (
    <div
      className={`flex flex-col items-center justify-center h-full gap-6 px-6 ${
        isMouse ? 'bg-green-50' : 'bg-blue-50'
      }`}
    >
      <div className="text-center animate-bounce-in">
        <div className="text-7xl mb-3">{isMouse ? '🐭' : '🐱'}</div>
        <h2 className="text-xl font-bold text-gray-800">
          {displayName}{t('yourTurn')}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {isMouse ? t('mouseSide') : t('catSide')}・{t('closeEyes')}
        </p>
      </div>

      <div
        className={`rounded-2xl p-4 text-center text-sm w-full max-w-xs ${
          isMouse ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
        }`}
      >
        {isMouse && isSetup && <p>{t('setupHint')}</p>}
        {isMouse && !isSetup && <p>🏃 {t('mouseMoveHint')}</p>}
        {!isMouse && <p>🔍 {t('selectCat')}</p>}
      </div>

      <button
        onClick={onReady}
        className={`w-full max-w-xs py-4 rounded-2xl text-white font-bold text-lg shadow-md active:scale-95 transition-transform ${
          isMouse ? 'bg-green-500' : 'bg-blue-500'
        }`}
      >
        {t('ready')}
      </button>
    </div>
  );
}
