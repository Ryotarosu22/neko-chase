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

  {
    id: 'column',
    icon: '📰',
    name: { ja: 'ボードゲームコラム', en: 'Board Game Column' },
    color: 'bg-rose-400',
    description: { ja: '元ネタや、おうちで遊べる関連ゲームの話', en: 'Origins and real games you can play at home' },
    articles: [
      {
        id: 'origin',
        title: { ja: 'このゲームのルーツ「逃走系ボードゲーム」', en: 'Roots: hidden-movement chase games' },
        summary: { ja: '追いかけっこゲームの魅力とは', en: 'Why asymmetric chases are fun' },
        body: {
          ja: [
            '1人が逃げ、複数人が協力して追い詰める——この「非対称な追いかけっこ」は、ボードゲームの世界で長く愛されてきた人気ジャンルです。',
            '逃げる側は1人だけ情報を隠し持ち、追う側はわずかな手がかりから居場所を推理する。この情報の非対称性が、何度遊んでも飽きない駆け引きを生みます。',
            '本作「ニャンコ探偵とこそ泥ネズミ」も、この伝統的な面白さをスマホで手軽に味わえるようデザインしました。',
          ],
          en: [
            'One player flees while others cooperate to corner them — this "asymmetric chase" is a beloved board-game genre.',
            'The runner alone hides information; the chasers deduce the location from scant clues. That asymmetry creates endlessly replayable tension.',
            'Detective Cats & The Cheese Thief brings this classic appeal to your phone in a quick, casual form.',
          ],
        },
      },
      {
        id: 'real-boardgames',
        title: { ja: 'おうちで遊べる！似たボードゲーム', en: 'Real board games like this one' },
        summary: { ja: '実物の名作を紹介します', en: 'Physical classics we recommend' },
        body: {
          ja: [
            'デジタルで気に入ったら、ぜひ実物のボードゲームも。テーブルを囲む臨場感は格別です。',
            '「ねことねずみの大レース」は、ネズミがチーズを集めながらネコから逃げる、本作と同じテーマの名作。子どもから大人まで一緒に遊べます。',
            '推理して追い詰める面白さが好きなら「クルード」や「犯人は踊る」もおすすめ。誰が・どこで・何をしたかを推理する定番です。',
          ],
          en: [
            'If you enjoy the digital version, try the physical games — gathering around a table is special.',
            '"Viva Topo!" (Cat & Mouse) has the mouse collect cheese while fleeing cats — the same theme as this game, fun for all ages.',
            'If you like deduction, try "Cluedo" or "A Criminal Dance" — classics of figuring out who, where, and how.',
          ],
        },
      },
      {
        id: 'strategic-games',
        title: { ja: '戦略が光るボードゲーム名作選', en: 'Great strategic board games' },
        summary: { ja: '読み合いが好きな人へおすすめ3作', en: 'Three picks for mind-game lovers' },
        body: {
          ja: [
            '本作の「隠れて逃げる相手を推理して追い詰める」面白さが気に入ったなら、戦略性の高い名作もきっと楽しめます。',
            '①「スコットランドヤード」：怪盗Xを探偵が追う隠れ移動ゲームの金字塔。本作と同じジャンルの元祖的存在です。',
            '②「ガイスター」：相手のコマが良いオバケか悪いオバケか分からないまま戦う、2人用の心理戦の傑作。',
            '③「ブラフ」：全員のサイコロの出目を推理し合う、観察力と度胸が試されるダイスゲーム。',
          ],
          en: [
            'If you enjoyed deducing and cornering a hidden runner here, you will likely love these strategic classics.',
            '1) "Scotland Yard": the gold standard of hidden-movement games, where detectives chase the thief Mr. X — the origin of this genre.',
            '2) "Ghosts (Geister)": a 2-player mind game where you fight without knowing if your opponent\'s pieces are good or evil ghosts.',
            '3) "Bluff": a dice game of guessing everyone\'s rolls, testing observation and nerve.',
          ],
        },
      },
      {
        id: 'family-play',
        title: { ja: '家族で遊ぶときのコツ', en: 'Tips for family play' },
        summary: { ja: '年齢差があっても盛り上がる遊び方', en: 'Fun even with mixed ages' },
        body: {
          ja: [
            '実力差があるときは、大人がネズミ（逃げる側）を持つと白熱します。3匹のネコを子どもたちで分担すれば自然とチーム戦に。',
            '逆に大人がネコ役で手加減し、子どものネズミが逃げ切る達成感を演出するのも一案です。',
            '勝敗のあとは「どこで捕まりそうだった？」と振り返ると、次の戦略を考える力が育ちます。',
          ],
          en: [
            'When skills differ, let an adult play the mouse for a thrill. Kids can split the three cats for a natural team game.',
            'Or let an adult play the cats and ease up, giving a child playing the mouse the joy of escaping.',
            'After each game, ask "where were you almost caught?" — reflecting builds strategic thinking.',
          ],
        },
      },
    ],
  },

  {
    id: 'faq',
    icon: '❓',
    name: { ja: 'よくある質問', en: 'FAQ' },
    color: 'bg-teal-400',
    description: { ja: '操作やルールの疑問をまとめて解決', en: 'Common questions about rules and controls' },
    articles: [
      {
        id: 'faq-trail-search',
        title: { ja: 'Q. 痕跡のあるビルは捜索できる？', en: 'Q. Can cats search a building with a trail?' },
        summary: { ja: 'ネコ視点とネズミ視点の違い', en: 'Cat view vs mouse view' },
        body: {
          ja: [
            'はい、ネコは痕跡のあるビルも捜索できます。ネコ側には痕跡が見えないため、すべての隣接ビルが捜索対象です。',
            '一方、ネズミは痕跡を残したビルには二度と入れません。これは移動制限であり、捜索ルールとは別物です。',
            '同じビルでも、ネコには「いるかもしれない場所」、ネズミには「もう行けない場所」と意味が異なります。',
          ],
          en: [
            'Yes. Cats can search buildings with trails, because the cat player cannot see trails — every adjacent building is a valid target.',
            'The mouse, however, can never re-enter a building with its trail. That is a movement limit, separate from the search rules.',
            'The same building means different things: "maybe there" for cats, "can\'t go back" for the mouse.',
          ],
        },
      },
      {
        id: 'faq-turn-count',
        title: { ja: 'Q. 「11ターン」はどう数える？', en: 'Q. How are the 11 turns counted?' },
        summary: { ja: 'ターンの区切りをはっきりさせる', en: 'Where each turn begins and ends' },
        body: {
          ja: [
            '1ターンは「ネコ3匹の行動 → ネズミの移動」を1セットとして数えます。これを11回繰り返して終了です。',
            '最後の11ターン目はネコの捜索で締めくくられます。ここで見つからなければネズミの逃げ切り勝ちです。',
            '画面上部のターン表示とドットで、今が何ターン目か確認できます。',
          ],
          en: [
            'One turn is a set of "all 3 cats act, then the mouse moves." The game ends after 11 such sets.',
            'The 11th turn closes with the cats searching. If they fail, the mouse escapes and wins.',
            'The turn counter and dots at the top show which turn you are on.',
          ],
        },
      },
      {
        id: 'faq-operation',
        title: { ja: 'Q. ネコの操作方法がわからない', en: 'Q. How do I control the cats?' },
        summary: { ja: 'タップだけのかんたん操作', en: 'Simple tap-only controls' },
        body: {
          ja: [
            'まず動かしたいネコをタップして選びます。選択中は黄色い枠、未行動のネコは緑の枠で示されます。',
            '選んだら、移動先の通路マスをタップで移動、隣接ビルをタップで捜索。1匹につき移動か捜索を1回行います。',
            '3匹すべてが行動するとネズミの番へ。動かす順番は自由なので、捜索結果を見て次を決められます。',
          ],
          en: [
            'First tap the cat you want to move. The selected cat shows a yellow ring; cats that have not acted show a green ring.',
            'Then tap a path square to move, or an adjacent building to search. Each cat moves or searches once.',
            'Once all three act, it is the mouse\'s turn. The order is free, so you can decide based on search results.',
          ],
        },
      },
      {
        id: 'faq-data',
        title: { ja: 'Q. 個人情報やデータは保存される？', en: 'Q. Is any personal data saved?' },
        summary: { ja: '安心して遊べる設計です', en: 'Built to be safe and private' },
        body: {
          ja: [
            '本ゲームは進行状態を端末内だけで処理し、氏名やメールアドレスなどの個人情報は一切収集しません。',
            'ゲーム記録もサーバーに送信されず、ブラウザを閉じると進行中のゲームはリセットされます。登録も不要です。',
            '広告やアフィリエイトの詳細はプライバシーポリシーに記載しています。',
          ],
          en: [
            'The game processes state only on your device and collects no personal information such as name or email.',
            'No game records are sent to a server, and closing the browser resets the current game. No account is needed.',
            'Details on ads and affiliate links are in the Privacy Policy.',
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
