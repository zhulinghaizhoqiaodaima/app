export type Gesture = 'ROCK' | 'PAPER' | 'SCISSORS' | null;
export type GameResult = 'WIN' | 'LOSE' | 'DRAW' | null;

export interface GameScore {
  player: number;
  ai: number;
  draw: number;
}

export interface GameState {
  score: GameScore;
  currentGesture: Gesture;
  aiGesture: Gesture;
  gameResult: GameResult;
  isPlaying: boolean;
  stableGesture: Gesture;
  gestureStartTime: number | null;
}

export const GESTURE_NAMES: Record<string, string> = {
  ROCK: '✊ 锤',
  PAPER: '✋ 包',
  SCISSORS: '✌️ 剪',
};

export const RESULT_TEXTS: Record<string, { text: string; color: string }> = {
  WIN: { text: '🎉 你赢了！', color: '#4fbdba' },
  LOSE: { text: '😢 你输了！', color: '#e94560' },
  DRAW: { text: '🤝 平局！', color: '#ffd700' },
};
