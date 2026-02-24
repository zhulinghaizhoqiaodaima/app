import { useState, useCallback, useRef } from 'react';
import type { Gesture, GameResult, GameState } from '@/types/game';

const GESTURE_HOLD_TIME = 1000; // 手势需要稳定1秒

export function useGame() {
  const [state, setState] = useState<GameState>({
    score: { player: 0, ai: 0, draw: 0 },
    currentGesture: null,
    aiGesture: null,
    gameResult: null,
    isPlaying: false,
    stableGesture: null,
    gestureStartTime: null,
  });

  const stableGestureRef = useRef<Gesture>(null);
  const gestureStartTimeRef = useRef<number | null>(null);

  // 胜负规则
  const rules: Record<string, string> = {
    'ROCK-SCISSORS': 'WIN',
    'SCISSORS-PAPER': 'WIN',
    'PAPER-ROCK': 'WIN',
  };

  // AI随机出拳
  const aiMove = useCallback((): Gesture => {
    const gestures: Gesture[] = ['ROCK', 'PAPER', 'SCISSORS'];
    return gestures[Math.floor(Math.random() * gestures.length)];
  }, []);

  // 判定胜负
  const judge = useCallback((player: Gesture, ai: Gesture): GameResult => {
    if (!player || !ai) return null;
    if (player === ai) return 'DRAW';
    const key = `${player}-${ai}`;
    return rules[key] ? 'WIN' : 'LOSE';
  }, [rules]);

  // 开始游戏
  const startGame = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPlaying: true,
      currentGesture: null,
      aiGesture: null,
      gameResult: null,
      stableGesture: null,
      gestureStartTime: null,
    }));
    stableGestureRef.current = null;
    gestureStartTimeRef.current = null;
  }, []);

  // 锁定手势并进行游戏
  const lockGesture = useCallback((gesture: Gesture) => {
    if (!gesture || !state.isPlaying || state.currentGesture) return;

    const aiGesture = aiMove();
    const result = judge(gesture, aiGesture);

    setState(prev => {
      const newScore = { ...prev.score };
      if (result === 'WIN') newScore.player += 1;
      else if (result === 'LOSE') newScore.ai += 1;
      else if (result === 'DRAW') newScore.draw += 1;

      return {
        ...prev,
        currentGesture: gesture,
        aiGesture,
        gameResult: result,
        score: newScore,
      };
    });
  }, [state.isPlaying, state.currentGesture, aiMove, judge]);

  // 重置回合
  const resetRound = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPlaying: false,
      currentGesture: null,
      aiGesture: null,
      gameResult: null,
      stableGesture: null,
      gestureStartTime: null,
    }));
    stableGestureRef.current = null;
    gestureStartTimeRef.current = null;
  }, []);

  // 重置分数
  const resetScore = useCallback(() => {
    setState(prev => ({
      ...prev,
      score: { player: 0, ai: 0, draw: 0 },
      currentGesture: null,
      aiGesture: null,
      gameResult: null,
      isPlaying: false,
      stableGesture: null,
      gestureStartTime: null,
    }));
    stableGestureRef.current = null;
    gestureStartTimeRef.current = null;
  }, []);

  // 处理手势稳定性检测
  const processGestureStability = useCallback((gesture: Gesture): boolean => {
    if (!state.isPlaying || state.currentGesture) return false;

    const now = Date.now();

    if (gesture === stableGestureRef.current && gesture !== null) {
      if (gestureStartTimeRef.current && (now - gestureStartTimeRef.current) >= GESTURE_HOLD_TIME) {
        return true;
      }
    } else {
      stableGestureRef.current = gesture;
      gestureStartTimeRef.current = now;
    }

    return false;
  }, [state.isPlaying, state.currentGesture]);

  return {
    ...state,
    startGame,
    lockGesture,
    resetRound,
    resetScore,
    processGestureStability,
  };
}
