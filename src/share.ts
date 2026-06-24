// ─── SNSシェア ──────────────────────────────────────────────────────────────

export const SITE_URL = 'https://neko-chase.vercel.app/';
export const SITE_HASHTAGS = 'ニャンコ探偵とこそ泥ネズミ,ボードゲーム';

/** X（旧Twitter）の投稿画面を開くURL */
export function buildXShareUrl(text: string): string {
  const params = new URLSearchParams({
    text,
    url: SITE_URL,
    hashtags: SITE_HASHTAGS,
  });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

/** LINEで送るURL */
export function buildLineShareUrl(text: string): string {
  const params = new URLSearchParams({
    url: SITE_URL,
    text,
  });
  return `https://social-plugins.line.me/lineit/share?${params.toString()}`;
}

/**
 * ネイティブ共有（対応端末のみ）。成功したら true。
 * Web Share API が無い場合は false を返すので、呼び出し側でフォールバックする。
 */
export async function nativeShare(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.share) return false;
  try {
    await navigator.share({ title: 'ニャンコ探偵とこそ泥ネズミ', text, url: SITE_URL });
    return true;
  } catch {
    // ユーザーがキャンセルした場合など
    return false;
  }
}

/** URLをクリップボードにコピー。成功したら true。 */
export async function copyLink(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) return false;
  try {
    await navigator.clipboard.writeText(SITE_URL);
    return true;
  } catch {
    return false;
  }
}
