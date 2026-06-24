import { Lang } from './i18n';

// ─── 攻略Tips データ（日英対応） ──────────────────────────────────────────
type LStr = { ja: string; en: string };
type LBody = { ja: string[]; en: string[] };

export interface TipArticle {
  id: string;
  title: LStr;
  summary: LStr;
  body: LBody;
}

export interface TipCategory {
  id: string;
  icon: string;
  name: LStr;
  color: string;
  description: LStr;
  articles: TipArticle[];
}

export function L(s: LStr, lang: Lang): string { return s[lang]; }
export function LB(b: LBody, lang: Lang): string[] { return b[lang]; }

export const TIP_CATEGORIES: TipCategory[] = [
  {
    id: 'basics',
    icon: '📖',
    name: { ja: '基本ルール', en: 'Basic Rules' },
    color: 'bg-amber-400',
    description: { ja: 'はじめての人向け。盤面と勝敗条件を理解しよう', en: 'For beginners: the board and win conditions' },
    articles: [
      {
        id: 'how-to-play',
        title: { ja: 'ゲームの目的と流れ', en: 'Goal and flow of the game' },
        summary: { ja: 'ネコとネズミ、それぞれの勝利条件を知ろう', en: 'Win conditions for cats and mouse' },
        body: {
          ja: [
            '「ニャンコ探偵とこそ泥ネズミ」は、チーズを盗んで逃げるネズミ1匹と、それを追う3匹のニャンコ探偵が対戦する推理ボードゲームです。',
            'ネズミ側の目的は、11ターンのあいだネコに見つからずに逃げ切ること。ネコ側の目的は、11ターン以内にネズミが潜むビルを捜索して発見することです。',
            '盤面は5×5＝25個のビル（ネズミがいる場所）と、その間に並ぶ4×4のマス（ネコがいる場所）で構成されます。ネコの1マスは隣接する4つのビルを捜索できます。',
            'まずネコ3匹を配置し、次にネズミがスタート位置を決めます。その後ネコ→ネズミの順で交互に行動し、これを11ターン繰り返します。',
          ],
          en: [
            'Detective Cats & The Cheese Thief is a deduction board game: one mouse that stole the cheese flees, while three detective cats give chase.',
            'The mouse wins by avoiding the cats for 11 turns. The cats win by searching the building where the mouse hides within those 11 turns.',
            'The board has 25 buildings (5×5, where the mouse hides) and a 4×4 grid of squares between them (where cats stand). Each cat square can search its 4 adjacent buildings.',
            'First the 3 cats are placed, then the mouse picks a start. After that, cats and mouse alternate (cats first) for 11 turns.',
          ],
        },
      },
      {
        id: 'turn-order',
        title: { ja: 'ターンの進み方', en: 'How turns work' },
        summary: { ja: 'ネコが先、ネズミが後。この順番がカギ', en: 'Cats move first, then the mouse' },
        body: {
          ja: [
            '各ターンは必ず「ネコ3匹の行動 → ネズミの移動」の順で進みます。ネコが先に動くため、ネズミは常にネコの最新の配置を見てから逃げ先を決められます。',
            'ネコは1匹ずつ「移動」または「捜索」のどちらかを選びます。3匹全員が行動を終えると、ネズミの番です。',
            'ネズミは隣接するビルへ1マス移動します。動いたあとには「痕跡（チーズ）」が残りますが、ネコがそのビルを捜索するまで見えません。',
            '最終ターン（11ターン目）はネコの捜索で終了です。ここで発見できなければネズミの逃げ切り勝ちです。',
          ],
          en: [
            'Each turn always goes: all 3 cats act, then the mouse moves. Since cats go first, the mouse always sees the latest cat positions before deciding.',
            'Each cat chooses either to move or to search. Once all three have acted, it is the mouse\'s turn.',
            'The mouse moves one step to an adjacent building. It leaves a trail (cheese) behind, hidden until a cat searches that building.',
            'The final 11th turn ends with the cats searching. If they fail to find the mouse, the mouse escapes and wins.',
          ],
        },
      },
      {
        id: 'trail-markers',
        title: { ja: '痕跡（チーズ）の仕組み', en: 'How trail markers work' },
        summary: { ja: '通った場所には戻れない。痕跡は両者の生命線', en: 'You cannot revisit your own trail' },
        body: {
          ja: [
            'ネズミが移動すると、移動前にいたビルに痕跡が残ります。痕跡は最大11個。これがネズミの逃げた経路そのものです。',
            '重要：ネズミは痕跡を残したビルには二度と入れません。進むほど自分の行ける範囲が狭まります。',
            'ネコが痕跡を発見すると、その痕跡が「発見済み」になり、ネズミの逃げた方向を推理する手がかりになります。',
            'ネズミ側は、痕跡で自分の退路を塞がないよう、盤面の広い側へ逃げる意識が大切です。',
          ],
          en: [
            'When the mouse moves, a trail is left on the building it just left. Up to 11 trails mark the entire escape route.',
            'Key rule: the mouse can never re-enter a building with its trail. The more it moves, the smaller its reachable area becomes.',
            'When a cat finds a trail, it becomes "discovered" and hints at the direction the mouse fled.',
            'As the mouse, avoid sealing off your own escape — head toward the open side of the board.',
          ],
        },
      },
      {
        id: 'win-lose',
        title: { ja: '勝敗が決まる3つのパターン', en: 'Three ways the game ends' },
        summary: { ja: '発見・袋小路・逃げ切りの違い', en: 'Found, trapped, or escaped' },
        body: {
          ja: [
            'ネコの勝ち①「発見」：捜索したビルにネズミがいれば、その場で捕獲・ネコの勝ち。',
            'ネコの勝ち②「袋小路」：ネズミが痕跡や盤の端に囲まれ、動けるビルがなくなった場合もネコの勝ち。',
            'ネズミの勝ち「逃げ切り」：11ターン目のネコの捜索を生き延びればネズミの勝ち。チーズを持って逃走成功です。',
          ],
          en: [
            'Cats win #1 "Found": if a searched building holds the mouse, it is caught instantly.',
            'Cats win #2 "Trapped": if the mouse is boxed in by trails and the board edge with no legal move, the cats win.',
            'Mouse wins "Escaped": survive the cats\' search on turn 11 and the mouse gets away with the cheese.',
          ],
        },
      },
    ],
  },

  {
    id: 'mouse',
    icon: '🐭',
    name: { ja: 'ネズミ攻略', en: 'Mouse Tips' },
    color: 'bg-green-400',
    description: { ja: '逃げる側のコツ。読まれない動きを身につけよう', en: 'For the fleeing side: stay unpredictable' },
    articles: [
      {
        id: 'start-far',
        title: { ja: 'スタートは「ネコから遠く」が鉄則', en: 'Start far from the cats' },
        summary: { ja: '初手の捜索範囲を避けるだけで生存率UP', en: 'Avoid the cats\' first searches' },
        body: {
          ja: [
            'ネズミの配置はネコの配置を見た後に決められます。これは大きなアドバンテージです。',
            'ネコは序盤、自分の周囲を捜索しがち。3匹すべてから距離を取れる位置を選びましょう。中央はどのネコからも近く危険です。',
            'おすすめは角や辺。ただし逃げ道が少ないので、数ターン後には中央寄りへ抜ける計画を立てましょう。',
          ],
          en: [
            'You place the mouse after seeing the cats — a big advantage.',
            'Cats tend to search nearby early on, so pick a spot far from all three. The center is risky since it is close to everyone.',
            'Corners and edges are good starts, but have few exits — plan to slip toward the center after a few turns.',
          ],
        },
      },
      {
        id: 'keep-options',
        title: { ja: '「行ける場所」を減らさない動き方', en: 'Keep your escape routes open' },
        summary: { ja: '袋小路で自滅しないための退路管理', en: 'Avoid trapping yourself' },
        body: {
          ja: [
            'ネズミの敗因で多いのが、痕跡で自分を囲む「自滅」です。移動先からさらに複数方向へ逃げられるかを常に意識しましょう。',
            '壁際を這うと片側が端、もう片側が痕跡となり、すぐ退路が尽きます。盤の開けた方向へ選択肢を残して動きましょう。',
            '迷ったら「次に自分はいくつのビルへ動けるか」を数えてください。常に2方向以上を確保できれば回避しやすくなります。',
          ],
          en: [
            'A common loss is sealing yourself in with trails. Always check that your destination still has several exits.',
            'Hugging walls puts the edge on one side and trails on the other — routes vanish fast. Move toward open space.',
            'When unsure, count how many buildings you can reach next turn. Keeping 2+ options makes you hard to corner.',
          ],
        },
      },
      {
        id: 'unpredictable',
        title: { ja: '直線移動は読まれる', en: 'Straight lines get read' },
        summary: { ja: '痕跡2つで進行方向がバレる', en: 'Two trails reveal your direction' },
        body: {
          ja: [
            'ネコは発見した痕跡が2つあると、その方向にネズミが進んでいると推理し先回りします。',
            'ずっと同じ方向へ一直線は危険。ときどき直角に曲がって予測を外しましょう。',
            'ただし方向転換は退路を塞ぐリスクも。「読まれない動き」と「退路確保」のバランスが上級者への鍵です。',
          ],
          en: [
            'With two discovered trails, cats infer your direction and cut you off ahead.',
            'A long straight escape is dangerous — turn at right angles now and then to break their read.',
            'But turning can seal your routes. Balancing unpredictability with keeping exits is the mark of a strong mouse.',
          ],
        },
      },
      {
        id: 'late-game',
        title: { ja: '終盤の立ち回り', en: 'Endgame play' },
        summary: { ja: '残りターンを数えて安全地帯へ', en: 'Count turns, reach safety' },
        body: {
          ja: [
            '残り3〜4ターンになったら、ネコ3匹から最も遠いエリアを目指しましょう。ネコは1ターン1マスしか動けません。',
            '発見済みの痕跡から離れる方向へ動くと、ネコの推理を振り切りやすくなります。',
            '最終ターンはネコの捜索で終了。11ターン目に自分がいるビルが捜索範囲外なら勝ち。最後の1手は慎重に。',
          ],
          en: [
            'With 3–4 turns left, head to the area farthest from all cats. Cats move only one square per turn.',
            'Moving away from discovered trails helps you shake off their deductions.',
            'The final turn ends with their search. If your building is out of range on turn 11, you win — choose that last move carefully.',
          ],
        },
      },
    ],
  },

  {
    id: 'cat',
    icon: '🐱',
    name: { ja: 'ネコ攻略', en: 'Cat Tips' },
    color: 'bg-blue-400',
    description: { ja: '追う側のコツ。3匹の連携で追い詰めよう', en: 'For the chasers: coordinate all three' },
    articles: [
      {
        id: 'cover-efficiently',
        title: { ja: '捜索は「今いるマスを完全に」', en: 'Fully clear your current square' },
        summary: { ja: '移動の無駄をなくして捜索数を最大化', en: 'Minimize wasted moves' },
        body: {
          ja: [
            'ネコの1マスは隣接4ビルを捜索できます。むやみに移動するより、今いるマスの未捜索ビルを先に潰すほうが効率的です。',
            '11ターン×3匹＝33回の行動で25ビルをカバーするのは理論上可能。移動を最小限にして捜索回数を増やしましょう。',
            '「いなかった」情報を使い、ネズミがいる可能性が高いエリアへ網を絞るのがポイントです。',
          ],
          en: [
            'Each cat square searches 4 buildings. Rather than wandering, clear the unsearched buildings where you stand.',
            '33 actions (11 turns × 3 cats) can cover all 25 buildings in theory. Minimize moves, maximize searches.',
            'Use "nobody here" results to narrow the net toward the areas where the mouse is likely hiding.',
          ],
        },
      },
      {
        id: 'zone-defense',
        title: { ja: '3匹でゾーンを分担する', en: 'Split the board into zones' },
        summary: { ja: '痕跡を見つけるまでは分担して捜索', en: 'Divide and search until a trail appears' },
        body: {
          ja: [
            '痕跡未発見の序盤は、バラバラだと捜索が重複します。盤面を3分割し、各ネコが左・中央・右を担当すると効率的です。',
            'これでどこにネズミがいても数ターンで誰かの捜索範囲に入ります。安全に隠れ続けられる場所をなくすのが狙いです。',
            '痕跡を見つけたら分担は解除。全員でその痕跡を中心に動く追跡フェーズへ切り替えます。',
          ],
          en: [
            'Early on, uncoordinated cats overlap. Split the board into three and let each cat cover left, center, and right.',
            'Then wherever the mouse is, it enters someone\'s search range within a few turns — leaving no safe hiding spot.',
            'Once a trail appears, drop the zones and switch to a pursuit phase centered on it.',
          ],
        },
      },
      {
        id: 'read-direction',
        title: { ja: '痕跡から進行方向を読む', en: 'Read direction from trails' },
        summary: { ja: '2つの痕跡を結べば未来が見える', en: 'Two trails point to the future' },
        body: {
          ja: [
            '痕跡を2つ見つければ進行方向が読めます。古い痕跡から新しい痕跡へのベクトルが逃走方向です。',
            'その延長線上にネズミがいる可能性が高いので、1匹を先回りさせましょう。同じペースで逃げると仮定し数マス先を狙います。',
            'ただし方向転換にも備え、現在地を直接追う追跡役も残しておくと万全です。',
          ],
          en: [
            'Two trails reveal direction: the vector from the older to the newer trail is the escape heading.',
            'The mouse is likely along that line, so send one cat ahead to intercept, aiming a few squares forward.',
            'But keep a chaser on the latest position too, in case the mouse turns.',
          ],
        },
      },
      {
        id: 'encircle',
        title: { ja: '逃げ道を塞ぐ包囲戦', en: 'Encircle to cut off escape' },
        summary: { ja: '捕まえるより「逃げ場をなくす」', en: 'Remove escape, don\'t just chase' },
        body: {
          ja: [
            'ネコが強くなる最大のコツは、直接探すより「逃げ場を奪う」こと。痕跡・盤の端・ネコ自身でネズミを囲みます。',
            '役割を分けましょう。進行方向を塞ぐ先回り役、現在地を追う追跡役、横を断つ封鎖役。3方向の圧力で選択肢を削ります。',
            'ネズミは痕跡に戻れません。痕跡を壁として使い、残った逃げ道を1つずつ塞げば袋小路に追い込めます。',
          ],
          en: [
            'The key to strong cats is removing escape, not just chasing. Box the mouse in with trails, the edge, and your cats.',
            'Assign roles: an interceptor ahead, a chaser on its position, a blocker on the flank. Pressure from three sides.',
            'The mouse cannot re-enter trails. Use them as walls and seal remaining exits one by one to force a dead end.',
          ],
        },
      },
    ],
  },
];

export function findCategory(id: string): TipCategory | undefined {
  return TIP_CATEGORIES.find((c) => c.id === id);
}

export function findArticle(catId: string, artId: string): TipArticle | undefined {
  return findCategory(catId)?.articles.find((a) => a.id === artId);
}
