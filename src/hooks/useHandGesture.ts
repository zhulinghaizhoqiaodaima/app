import { useCallback, useRef, useState, useEffect } from 'react';
import type { Gesture } from '@/types/game';

// 声明全局的 MediaPipe 类型
declare global {
  interface Window {
    Hands: unknown;
    Camera: unknown;
    drawConnectors: unknown;
    drawLandmarks: unknown;
    HAND_CONNECTIONS: [number, number][];
  }
}

interface UseHandGestureReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  currentGesture: Gesture;
  isStable: boolean;
  isModelLoaded: boolean;
  hasHand: boolean;
  error: string | null;
  countdownTime: number | null;
}

export function useHandGesture(): UseHandGestureReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handsRef = useRef<unknown>(null);
  const cameraRef = useRef<unknown>(null);

  const [currentGesture, setCurrentGesture] = useState<Gesture>(null);
  const [isStable, setIsStable] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [hasHand, setHasHand] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdownTime, setCountdownTime] = useState<number | null>(null);

  const stableGestureRef = useRef<Gesture>(null);
  const gestureStartTimeRef = useRef<number | null>(null);
  const GESTURE_HOLD_TIME = 5000; // 5秒稳定时间

  // 根据手指关键点判断手势
  const classifyGesture = useCallback((landmarks: { x: number; y: number; z: number }[]): Gesture => {
    const fingerTips = [8, 12, 16, 20]; // 食指、中指、无名指、小指尖
    const fingerPips = [6, 10, 14, 18]; // 对应的PIP关节

    const fingers: number[] = [];

    // 检查每根手指是否伸直
    for (let i = 0; i < fingerTips.length; i++) {
      const tip = landmarks[fingerTips[i]];
      const pip = landmarks[fingerPips[i]];
      // y坐标越小，位置越靠上（注意y轴向下）
      fingers.push(tip.y < pip.y ? 1 : 0);
    }

    const totalFingers = fingers.reduce((sum, f) => sum + f, 0);

    if (totalFingers === 0) return 'ROCK';
    if (totalFingers === 4) return 'PAPER';
    if (fingers[0] === 1 && fingers[1] === 1 && fingers[2] === 0 && fingers[3] === 0) {
      return 'SCISSORS';
    }

    return null;
  }, []);

  // 处理手势稳定性
  const processGestureStability = useCallback((gesture: Gesture) => {
    const now = Date.now();

    if (gesture === stableGestureRef.current && gesture !== null) {
      if (gestureStartTimeRef.current) {
        const elapsed = now - gestureStartTimeRef.current;
        const remaining = Math.max(0, GESTURE_HOLD_TIME - elapsed);
        setCountdownTime(Math.ceil(remaining / 1000));

        if (elapsed >= GESTURE_HOLD_TIME) {
          setIsStable(true);
          return gesture;
        }
      }
    } else {
      stableGestureRef.current = gesture;
      gestureStartTimeRef.current = now;
      setIsStable(false);
      if (gesture !== null) {
        setCountdownTime(Math.ceil(GESTURE_HOLD_TIME / 1000));
      } else {
        setCountdownTime(null);
      }
    }

    return gesture;
  }, []);

  // 处理手部检测结果
  const onResults = useCallback((results: { multiHandLandmarks?: { x: number; y: number; z: number }[][] }) => {
    // const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!video) return;

    // 1. 先处理手部检测状态更新，不管 canvas 在不在
    const handDetected = !!(results.multiHandLandmarks && results.multiHandLandmarks.length > 0);
    setHasHand(handDetected);

    // 2. 如果 canvas 还没渲染，先不画图，但后面的逻辑继续
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // 清空画布
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制视频帧（镜像）
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    let gesture: Gesture = null;

    if (handDetected && results.multiHandLandmarks) {
      const landmarks = results.multiHandLandmarks[0];

      // 绘制手部关键点
      if (window.drawConnectors && window.drawLandmarks && window.HAND_CONNECTIONS) {
        const drawConn = window.drawConnectors as (
          ctx: CanvasRenderingContext2D,
          landmarks: { x: number; y: number; z: number }[],
          connections: [number, number][],
          style?: { color?: string; lineWidth?: number }
        ) => void;
        const drawLand = window.drawLandmarks as (
          ctx: CanvasRenderingContext2D,
          landmarks: { x: number; y: number; z: number }[],
          style?: { color?: string; lineWidth?: number; radius?: number }
        ) => void;

        drawConn(ctx, landmarks, window.HAND_CONNECTIONS, {
          color: '#00FF00',
          lineWidth: 2,
        });
        drawLand(ctx, landmarks, {
          color: '#FF0000',
          lineWidth: 1,
          radius: 3,
        });
      }

      // 识别手势
      gesture = classifyGesture(landmarks);
    }

    ctx.restore();

    // 处理稳定性
    processGestureStability(gesture);
    setCurrentGesture(gesture);
  }, [classifyGesture, processGestureStability]);

  // 初始化 MediaPipe Hands
  useEffect(() => {
    let isMounted = true;

    const initHands = async () => {
      try {
        // 等待 MediaPipe 脚本加载
        if (!window.Hands || !window.Camera) {
          await new Promise<void>((resolve) => {
            const checkInterval = setInterval(() => {
              if (window.Hands) {
                clearInterval(checkInterval);
                resolve();
              }
            }, 100);
          });
        }

        if (!isMounted) return;

        console.log('[HandGesture] Initializing Hands instance...');
        // 创建 Hands 实例
        const Hands = window.Hands as {
          new(config: { locateFile: (file: string) => string }): {
            setOptions: (options: {
              maxNumHands?: number;
              modelComplexity?: number;
              minDetectionConfidence?: number;
              minTrackingConfidence?: number;
            }) => void;
            onResults: (callback: (results: {
              multiHandLandmarks?: { x: number; y: number; z: number }[][];
            }) => void) => void;
            send: (input: { image: HTMLVideoElement }) => Promise<void>;
            close: () => Promise<void>;
          };
        };

        const hands = new Hands({
          locateFile: (_file: string) => {
            return `https://unpkg.com/@mediapipe/hands/${_file}`;
          },
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.5,
        });

        hands.onResults(onResults);
        handsRef.current = hands;

        // 初始化摄像头
        if (videoRef.current && window.Camera) {
          const Camera = window.Camera as {
            new(
              videoElement: HTMLVideoElement,
              config: {
                onFrame: () => Promise<void>;
                width?: number;
                height?: number;
              }
            ): {
              start: () => Promise<void>;
              stop: () => void;
            };
          };

          const camera = new Camera(videoRef.current, {
            onFrame: async () => {
              await hands.send({ image: videoRef.current! });
            },
            width: 640,
            height: 480,
          });

          cameraRef.current = camera;
          await camera.start();

          if (isMounted) {
            setIsModelLoaded(true);
          }
        }
      } catch (err) {
        console.error('Failed to initialize MediaPipe:', err);
        if (isMounted) {
          setError('摄像头初始化失败，请检查权限设置');
        }
      }
    };

    initHands();

    return () => {
      isMounted = false;
      const camera = cameraRef.current as { stop: () => void } | null;
      const hands = handsRef.current as { close: () => Promise<void> } | null;
      if (camera?.stop) {
        camera.stop();
      }
      if (hands?.close) {
        hands.close();
      }
    };
  }, [onResults]);

  return {
    videoRef,
    canvasRef,
    currentGesture,
    isStable,
    isModelLoaded,
    hasHand,
    error,
    countdownTime,
  };
}
