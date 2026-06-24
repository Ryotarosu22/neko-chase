import { createContext, useContext } from 'react';

export type Lang = 'ja' | 'en';

// UI文字列辞書。キー → { ja, en }
export const STRINGS = {
  // メニュー
  appTitle: { ja: 'ニャンコ探偵と\nこそ泥ネズミ', en: 'Detective Cats &\nThe Cheese Thief' },
  tagline: { ja: 'チーズを盗んだネズミをつかまえろ！', en: 'Catch the mouse who stole the cheese!' },
  modeLocal: { ja: '🤝 同じ端末で2人対戦', en: '🤝 2 Players (same device)' },
  modeCpuCat: { ja: '🐱 CPU対戦（自分がネズミ役）', en: '🐱 vs CPU (you play the mouse)' },
  modeCpuMouse: { ja: '🐭 CPU対戦（自分がネコ役）', en: '🐭 vs CPU (you play the cats)' },
  howToTitle: { ja: '🎮 遊び方', en: '🎮 How to play' },
  howToBody: {
    ja: 'ネコは3匹のニャンコを動かして捜索。ネズミは11ターン逃げ切れば勝ち！',
    en: 'Move 3 cats to search buildings. The mouse wins by surviving 11 turns!',
  },
  readTips: { ja: '💡 攻略のコツを読む', en: '💡 Read strategy tips' },
  privacy: { ja: 'プライバシーポリシー', en: 'Privacy Policy' },
  shareInvite: { ja: '📣 友達にシェアして対戦しよう！', en: '📣 Share with friends & play!' },
  shareText: {
    ja: '🐱🐭ニャンコ探偵とこそ泥ネズミ！チーズを盗んだネズミを3匹のネコで追いつめる無料の推理ボードゲーム。スマホでサクッと遊べるよ🧀',
    en: '🐱🐭 Detective Cats & The Cheese Thief! A free deduction board game where 3 cats chase a thieving mouse. Quick to play on your phone 🧀',
  },
  affiliateTitle: { ja: '🛒 リアルなボードゲームもおすすめ', en: '🛒 Real board games we recommend' },
  affiliateNote: { ja: '※ Amazonアソシエイトのリンクを含みます', en: '※ Contains Amazon Associate links' },
  sharePost: { ja: 'ポスト', en: 'Post' },
  shareShareBtn: { ja: '共有', en: 'Share' },
  shareLinkBtn: { ja: 'リンク', en: 'Link' },
  shareCopied: { ja: 'コピー済', en: 'Copied' },

  // 名前入力
  nameTitle: { ja: 'プレイヤー名を入力', en: 'Enter player names' },
  nameHint: { ja: '空欄のままでもOK（ニャンコ／マウス）', en: 'Leave blank for defaults (Cat / Mouse)' },
  catPlayer: { ja: '🐱 ネコ側プレイヤー', en: '🐱 Cat player' },
  mousePlayer: { ja: '🐭 ネズミ側プレイヤー', en: '🐭 Mouse player' },
  startMatch: { ja: '対戦スタート →', en: 'Start match →' },
  back: { ja: '← 戻る', en: '← Back' },
  defaultCat: { ja: 'ニャンコ', en: 'Cat' },
  defaultMouse: { ja: 'マウス', en: 'Mouse' },

  // 難易度
  diffTitle: { ja: '難易度をえらぶ', en: 'Choose difficulty' },
  diffSubMouse: { ja: 'あなたはネコ役。CPUネズミの賢さを選択', en: 'You play the cats. Pick the CPU mouse level' },
  diffSubCat: { ja: 'あなたはネズミ役。CPUネコの賢さを選択', en: 'You play the mouse. Pick the CPU cats level' },
  beginner: { ja: '初級', en: 'Easy' },
  intermediate: { ja: '中級', en: 'Normal' },
  advanced: { ja: '上級', en: 'Hard' },
  beginnerDesc: { ja: 'のんびり・戦略をあまり使わない', en: 'Relaxed — barely uses strategy' },
  intermediateDesc: { ja: '痕跡を読んで連携してくる', en: 'Reads trails and coordinates' },
  advancedDesc: { ja: '先読み・包囲・確率推理で本気', en: 'Lookahead, encircling, probability' },

  // 引き継ぎ画面
  yourTurn: { ja: 'さんの番です', en: "'s turn" },
  closeEyes: { ja: '相手は目を閉じてください', en: 'The other player, please look away' },
  mouseSide: { ja: 'ネズミ側', en: 'Mouse side' },
  catSide: { ja: 'ネコ側', en: 'Cat side' },
  setupHint: { ja: '📍 まず、ネズミのスタート位置を選んでください（ネコには見せないで！）', en: "📍 First, choose the mouse's start position (don't show the cats!)" },
  ready: { ja: '準備完了 →', en: 'Ready →' },

  // ヘッダー
  quit: { ja: '✕ やめる', en: '✕ Quit' },
  quitConfirm: { ja: 'ゲームをやめますか？', en: 'Quit this game?' },
  quitSub: { ja: '進行中のゲームは失われます', en: 'Your current game will be lost' },
  continue: { ja: '続ける', en: 'Continue' },
  quitYes: { ja: 'やめる', en: 'Quit' },

  // ネコ操作
  cpuThinking: { ja: '🤖 CPU が作戦を考えています…', en: '🤖 CPU is thinking…' },
  selectCat: { ja: '▲ どのネコを動かす？タップして選択', en: '▲ Tap a cat to move it' },
  catActionHint: { ja: '：移動先の通路か捜索するビルをタップ', en: ': tap a path to move or a building to search' },
  placeCatHint: { ja: 'の配置場所を通路マスでタップ', en: ': tap a path square to place' },
  catWord: { ja: 'ネコ', en: 'Cat ' },
  notPlaced: { ja: '未配置', en: 'not set' },

  // ネズミ操作
  mouseMoveHint: { ja: '移動先のビルを選んでください', en: 'Choose a building to move to' },
  mouseSetupHint: { ja: 'スタート位置を選んでください', en: 'Choose your start position' },
  confirmMove: { ja: 'この場所に決定', en: 'Confirm' },
  cpuMouseFleeing: { ja: 'ネズミが逃げています…', en: 'The mouse is fleeing…' },
  mouseSetupTap: { ja: '📍 スタート位置を選んでください（ネコには見せないで！）', en: "📍 Choose your start position (don't show the cats!)" },
  startHere: { ja: 'ここからスタート！', en: 'Start here!' },
  mouseMoveTap: { ja: '🏃 移動先をタップ', en: '🏃 Tap where to move' },
  turnsLeftPre: { ja: '（残り ', en: '(' },
  turnsLeftSuf: { ja: ' ターン）', en: ' turns left)' },
  noMoves: { ja: '移動できる場所がありません！', en: 'No legal moves!' },
  moveHere: { ja: 'ここへ移動する！', en: 'Move here!' },

  // 捜索結果
  caughtMsg: { ja: 'つかまえた！', en: 'Caught!' },
  cheeseFound: { ja: 'チーズ発見！', en: 'Cheese found!' },
  cheeseFoundTurn: { ja: 'ターン目）', en: ')' },
  cheeseFoundTurnPre: { ja: 'チーズ発見！（', en: 'Cheese found! (turn ' },
  notHere: { ja: 'いなかった…', en: 'Nobody here…' },
  searchedBy: { ja: 'が捜索', en: ' searched' },
  tapContinue: { ja: 'タップして続ける →', en: 'Tap to continue →' },

  // ゲーム終了
  mouseWin: { ja: 'ネズミの勝ち！', en: 'Mouse wins!' },
  catWin: { ja: 'ネコの勝ち！', en: 'Cats win!' },
  winSuffix: { ja: 'さんの勝ち！', en: ' wins!' },
  escapedSub: { ja: '11ターン逃げ切った！チーズは俺のものだ！', en: 'Survived 11 turns! The cheese is mine!' },
  caughtSub: { ja: 'ネズミを見つけた！チーズを取り返せ！', en: 'Found the mouse! Cheese recovered!' },
  trappedSub: { ja: 'ネズミに逃げ場がなくなった…', en: 'The mouse ran out of escape routes…' },
  routeHint: { ja: '↑ ネズミの移動経路', en: "↑ The mouse's route" },
  playAgain: { ja: 'もう一度！', en: 'Play again!' },

  // チュートリアル
  tutorialBtn: { ja: '❔ 遊び方を見る', en: '❔ How to play' },
  tutNext: { ja: '次へ →', en: 'Next →' },
  tutBack: { ja: '← 戻る', en: '← Back' },
  tutSkip: { ja: 'スキップ', en: 'Skip' },
  tutStart: { ja: 'はじめる！', en: 'Got it!' },

  // Tips
  tipsTitle: { ja: '攻略のコツ', en: 'Strategy Tips' },
  tipsIntro: { ja: 'カテゴリを選んで、ネコ・ネズミそれぞれの攻略法を読んでみましょう。', en: 'Pick a category to read tips for both cats and mouse.' },
  articleCount: { ja: '記事', en: ' articles' },
  readMore: { ja: '読む →', en: 'Read →' },
} as const;

export type StringKey = keyof typeof STRINGS;

export function translate(key: StringKey, lang: Lang): string {
  return STRINGS[key][lang];
}

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: StringKey) => string;
}

export const LangContext = createContext<LangContextType>({
  lang: 'ja',
  setLang: () => {},
  t: (k) => STRINGS[k].ja,
});

export function useLang(): LangContextType {
  return useContext(LangContext);
}
