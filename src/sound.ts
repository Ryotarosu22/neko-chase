// ─── サウンドエンジン ───────────────────────────────────────────────────────
// Web Audio API で効果音を合成。音声ファイル不要・著作権フリー・容量ゼロ。
// ブラウザの制約上、最初のユーザー操作後に AudioContext を生成する。

let ctx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  // ユーザー操作で suspended から復帰
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function isMuted(): boolean { return muted; }

export function setMuted(value: boolean): void { muted = value; }

export function toggleMuted(): boolean {
  muted = !muted;
  return muted;
}

/** 単音を鳴らす */
function tone(opts: {
  freq: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
  delay?: number;
  freqEnd?: number; // 周波数をスライドさせる（鳴き声・スイープ用）
}): void {
  const c = getCtx();
  if (!c || muted) return;

  const start = c.currentTime + (opts.delay ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();

  osc.type = opts.type ?? 'sine';
  osc.frequency.setValueAtTime(opts.freq, start);
  if (opts.freqEnd != null) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, opts.freqEnd), start + opts.duration);
  }

  const peak = opts.gain ?? 0.15;
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(peak, start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, start + opts.duration);

  osc.connect(g);
  g.connect(c.destination);
  osc.start(start);
  osc.stop(start + opts.duration + 0.02);
}

// ─── ゲーム用の効果音プリセット ───────────────────────────────────────────

/** UIタップ（軽いクリック） */
export function playTap(): void {
  tone({ freq: 420, duration: 0.06, type: 'triangle', gain: 0.08 });
}

/** ネコの移動（小さな足音） */
export function playCatMove(): void {
  tone({ freq: 200, duration: 0.08, type: 'sine', gain: 0.1 });
}

/** ネズミの移動（ちょこちょこ） */
export function playMouseMove(): void {
  tone({ freq: 600, duration: 0.05, type: 'triangle', gain: 0.07 });
  tone({ freq: 720, duration: 0.05, type: 'triangle', gain: 0.07, delay: 0.05 });
}

/** ビル捜索（開ける音） */
export function playSearch(): void {
  tone({ freq: 300, duration: 0.12, type: 'square', gain: 0.06, freqEnd: 500 });
}

/** 空振り（いなかった） */
export function playEmpty(): void {
  tone({ freq: 240, duration: 0.18, type: 'sine', gain: 0.08, freqEnd: 160 });
}

/** チーズ（痕跡）発見 */
export function playCheese(): void {
  tone({ freq: 660, duration: 0.1, type: 'triangle', gain: 0.1 });
  tone({ freq: 880, duration: 0.14, type: 'triangle', gain: 0.1, delay: 0.09 });
}

/** ネズミ捕獲（ネコの勝ち・アラート） */
export function playCaught(): void {
  tone({ freq: 880, duration: 0.12, type: 'sawtooth', gain: 0.12 });
  tone({ freq: 660, duration: 0.12, type: 'sawtooth', gain: 0.12, delay: 0.12 });
  tone({ freq: 990, duration: 0.2, type: 'sawtooth', gain: 0.12, delay: 0.24 });
}

/** ネズミ逃げ切り（ネズミの勝ち・ファンファーレ） */
export function playEscape(): void {
  const notes = [523, 659, 784, 1047]; // ド・ミ・ソ・ド（上）
  notes.forEach((f, i) => {
    tone({ freq: f, duration: 0.18, type: 'triangle', gain: 0.12, delay: i * 0.12 });
  });
}

/** 袋小路（ネズミの負け・低い下降音） */
export function playTrapped(): void {
  tone({ freq: 400, duration: 0.3, type: 'sawtooth', gain: 0.1, freqEnd: 120 });
}
