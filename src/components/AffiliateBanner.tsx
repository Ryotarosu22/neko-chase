import { AFFILIATE_ENABLED, PRODUCTS, buildAffiliateUrl } from '../affiliate';

interface Props {
  variant?: 'full' | 'compact';
}

export default function AffiliateBanner({ variant = 'full' }: Props) {
  if (!AFFILIATE_ENABLED || PRODUCTS.length === 0) return null;

  return (
    <div className="w-full max-w-xs mx-auto">
      <p className="text-xs text-amber-700 font-semibold text-center mb-2">
        🛒 リアルなボードゲームもおすすめ
      </p>
      <div className={variant === 'compact' ? 'flex gap-2 overflow-x-auto pb-1' : 'grid grid-cols-2 gap-2'}>
        {PRODUCTS.map((p) => (
          <a
            key={p.asin || p.title}
            href={buildAffiliateUrl(p)}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex flex-col items-center justify-center bg-white border border-amber-200 rounded-xl px-2 py-3 shadow-sm active:scale-95 transition-transform shrink-0"
            style={{ minWidth: variant === 'compact' ? '5.5rem' : undefined }}
          >
            <span className="text-2xl mb-1">{p.emoji}</span>
            <span className="text-[10px] text-gray-700 font-bold text-center leading-tight">{p.title}</span>
            <span className="text-[9px] text-amber-600 mt-1">Amazonで見る →</span>
          </a>
        ))}
      </div>
      <p className="text-[8px] text-gray-400 text-center mt-1">
        ※ Amazonアソシエイトのリンクを含みます
      </p>
    </div>
  );
}
