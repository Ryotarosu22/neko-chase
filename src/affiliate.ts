// ─── Amazon アソシエイト設定 ───────────────────────────────────────────────
//
// 【承認後の作業】
// 1. ASSOCIATE_TAG にアソシエイトIDを入れる（例: 'ryotaro-22'）
// 2. PRODUCTS の各商品に実際の asin（Amazon商品ページURLの /dp/XXXXXXXXXX 部分）を入れる
// 3. ENABLED を true にする → サイトに広告が表示される
//
// リンクの作り方（承認後）:
//   Amazonで商品ページを開く → URLの "dp/" の後ろ10桁が ASIN
//   例: https://www.amazon.co.jp/dp/B07ABCDEFG → asin: 'B07ABCDEFG'

export const ASSOCIATE_TAG = ''; // ← 承認後にアソシエイトIDを入れる（例: 'ryotaro-22'）

export const AFFILIATE_ENABLED = false; // ← 承認 & 商品設定完了後に true

export interface AffiliateProduct {
  asin: string;          // Amazon商品ID（/dp/ の後ろ10桁）
  title: string;         // 表示名
  emoji: string;         // アイコン代わり
  searchKeyword: string; // ASIN未設定時の検索フォールバック用
}

// 紹介するボードゲーム（実在するAmazon商品のASINを設定済み）
// ※ アソシエイトIDは未設定のため、承認後に ASSOCIATE_TAG を入れると収益化される
export const PRODUCTS: AffiliateProduct[] = [
  {
    // ねことねずみの大レース (Viva Topo!) — 猫・ネズミ・チーズ。本作と完全にテーマ一致
    asin: 'B01IRRTS14',
    title: 'ねことねずみの大レース',
    emoji: '🧀',
    searchKeyword: 'ねことねずみの大レース ボードゲーム',
  },
  {
    // カワダ シティチェイス KBG-15 — 本作のモチーフ元
    asin: 'B0C65GK7L5',
    title: 'シティチェイス（カワダ）',
    emoji: '🚔',
    searchKeyword: 'シティチェイス カワダ ボードゲーム',
  },
  {
    // 犯人は踊る — 犯人を推理して探す人気カードゲーム
    asin: 'B017IBJGIK',
    title: '犯人は踊る',
    emoji: '🔍',
    searchKeyword: '犯人は踊る ボードゲーム',
  },
  {
    // クルード (Cluedo) — 定番の推理ボードゲーム
    asin: 'B000HGXZJA',
    title: 'クルード',
    emoji: '🕵️',
    searchKeyword: 'クルード Cluedo ボードゲーム',
  },
];

/** 商品のアフィリエイトURLを生成（ASIN優先、なければ検索URLにタグ付与） */
export function buildAffiliateUrl(product: AffiliateProduct): string {
  const tag = ASSOCIATE_TAG ? `?tag=${ASSOCIATE_TAG}` : '';
  if (product.asin) {
    return `https://www.amazon.co.jp/dp/${product.asin}${tag}`;
  }
  // ASIN未設定時は検索結果ページ（タグ付き）にフォールバック
  const q = encodeURIComponent(product.searchKeyword);
  const tagParam = ASSOCIATE_TAG ? `&tag=${ASSOCIATE_TAG}` : '';
  return `https://www.amazon.co.jp/s?k=${q}${tagParam}`;
}
