import { useEffect, useState, useCallback } from 'react';
import { useHandGesture } from '@/hooks/useHandGesture';
import { useGame } from '@/hooks/useGame';
import { GESTURE_NAMES, RESULT_TEXTS } from '@/types/game';
import { Camera, Loader2, Hand } from 'lucide-react';

// 首页默认图片
const HOMEPAGE_IMAGE = 'https://images.unsplash.com/photo-1614036417651-efe5912149d8?w=800&h=600&fit=crop';

// AI 虚拟人头像
const AI_AVATAR = 'https://api.dicebear.com/7.x/bottts/svg?seed=ai-opponent&backgroundColor=b6e3f4';
const PLAYER_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=player&backgroundColor=c0aede';

export function GameBoard() {
  const { videoRef, canvasRef, currentGesture, isStable, isModelLoaded, hasHand, error } = useHandGesture();
  const {
    currentGesture: lockedGesture,
    aiGesture,
    gameResult,
    lockGesture,
    resetRound,
  } = useGame();

  const [countdown, setCountdown] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gamePhase, setGamePhase] = useState<'waiting' | 'detecting' | 'countdown' | 'vs' | 'result'>('waiting');
  const [showHomepage, setShowHomepage] = useState(true);

  // 当检测到手时，隐藏首页图
  useEffect(() => {
    if (hasHand && showHomepage) {
      setShowHomepage(false);
      setGamePhase('detecting');
    } else if (!hasHand && !showHomepage && gamePhase === 'waiting') {
      setShowHomepage(true);
    }
  }, [hasHand, showHomepage, gamePhase]);

  // 监听手势稳定性并自动开始游戏
  useEffect(() => {
    if (gamePhase === 'detecting' && currentGesture && isStable && hasHand) {
      // 手势确认后开始倒数
      handleStartGame(currentGesture);
    }
  }, [gamePhase, currentGesture, isStable, hasHand]);

  // 开始游戏流程
  const handleStartGame = useCallback(async (gesture: typeof currentGesture) => {
    if (!gesture) return;

    setGamePhase('countdown');

    // 倒计时 3-2-1
    for (let i = 3; i >= 1; i--) {
      setCountdown(i);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    setCountdown(null);

    // 锁定手势并进行游戏
    lockGesture(gesture);
    
    // 显示 VS 动画
    setGamePhase('vs');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 显示结果
    setShowResult(true);
    setGamePhase('result');

    // 3秒后重置
    setTimeout(() => {
      setShowResult(false);
      resetRound();
      setGamePhase(hasHand ? 'detecting' : 'waiting');
      setShowHomepage(!hasHand);
    }, 3000);
  }, [lockGesture, resetRound, hasHand]);

  // 获取结果显示
  const getResultDisplay = () => {
    if (!gameResult) return { text: '准备开始！', color: '#fff' };
    return RESULT_TEXTS[gameResult];
  };

  const resultDisplay = getResultDisplay();

  // 处理重置
  const handleReset = () => {
    resetRound();
    setGamePhase(hasHand ? 'detecting' : 'waiting');
    setCountdown(null);
    setShowResult(false);
    setShowHomepage(!hasHand);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center p-4">
        <div className="bg-[#16213e] border border-[#0f3460] rounded-xl max-w-md w-full p-8 text-center">
          <Camera className="w-16 h-16 text-[#e94560] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">摄像头访问失败</h2>
          <p className="text-gray-400">{error}</p>
          <p className="text-gray-500 text-sm mt-4">
            请确保您已授予摄像头权限，并使用支持的浏览器（Chrome、Edge、Firefox）
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] py-4 px-4">
      {/* 标题 - 只在等待和检测阶段显示 */}
      {(gamePhase === 'waiting' || gamePhase === 'detecting') && (
        <div className="text-center mb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
            ✊ ✋ ✌️ 包剪锤 AI 对战
          </h1>
          <p className="text-gray-400 text-sm">
            {showHomepage ? '伸出手掌开始游戏' : '保持手势稳定，自动开始倒数'}
          </p>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* 主游戏区域 */}
        <div className={`relative bg-[#16213e] border border-[#0f3460] rounded-xl overflow-hidden transition-all duration-500 ${
          gamePhase === 'countdown' || gamePhase === 'vs' || gamePhase === 'result'
            ? 'fixed inset-0 z-50 rounded-none border-0 max-w-none'
            : ''
        }`}>
          {/* 视频/画布容器 */}
          <div className="relative w-full aspect-video bg-black">
            {/* 隐藏的视频元素 */}
            <video
              ref={videoRef}
              className="hidden"
              playsInline
            />
            
            {/* 首页图 - 未检测到手时显示 */}
            {showHomepage && gamePhase === 'waiting' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <img 
                  src={HOMEPAGE_IMAGE} 
                  alt="Game Homepage"
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#e94560] to-[#533483] flex items-center justify-center mb-6 animate-pulse">
                    <Hand className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">准备好了吗？</h2>
                  <p className="text-gray-300 text-lg">伸出手掌，开始对战！</p>
                  <div className="mt-8 flex gap-4 text-4xl">
                    <span>✊</span>
                    <span>✋</span>
                    <span>✌️</span>
                  </div>
                </div>
              </div>
            )}

            {/* Canvas - 检测到手时显示 */}
            {!showHomepage && (
              <canvas
                ref={canvasRef}
                width={640}
                height={480}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  gamePhase === 'countdown' || gamePhase === 'vs' || gamePhase === 'result' ? 'opacity-30' : 'opacity-100'
                }`}
              />
            )}

            {/* 加载状态 */}
            {!isModelLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20">
                <Loader2 className="w-12 h-12 text-[#e94560] animate-spin mb-4" />
                <p className="text-white">正在加载 AI 模型...</p>
              </div>
            )}

            {/* 全屏倒计时 */}
            {gamePhase === 'countdown' && countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center z-30">
                <div 
                  className="text-[30vw] md:text-[25vw] font-bold text-[#e94560] animate-pulse leading-none"
                  style={{ textShadow: '0 0 60px rgba(233,69,96,0.8)' }}
                >
                  {countdown}
                </div>
              </div>
            )}

            {/* VS 对战动画 */}
            {gamePhase === 'vs' && lockedGesture && aiGesture && (
              <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/70">
                <div className="flex items-center justify-center gap-6 md:gap-16">
                  {/* 玩家 */}
                  <div className="text-center animate-bounce">
                    <div className="w-28 h-28 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-[#4fbdba] to-[#0f3460] p-2 mb-4">
                      <img 
                        src={PLAYER_AVATAR} 
                        alt="Player"
                        className="w-full h-full rounded-full bg-[#16213e]"
                      />
                    </div>
                    <p className="text-white text-lg md:text-xl font-bold">你</p>
                    <p className="text-[#4fbdba] text-2xl md:text-4xl font-bold mt-2">
                      {GESTURE_NAMES[lockedGesture]}
                    </p>
                  </div>
                  
                  {/* VS */}
                  <div className="text-5xl md:text-8xl font-bold text-[#e94560] animate-pulse px-4">
                    VS
                  </div>
                  
                  {/* AI */}
                  <div className="text-center animate-bounce" style={{ animationDelay: '0.15s' }}>
                    <div className="w-28 h-28 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-[#e94560] to-[#533483] p-2 mb-4">
                      <img 
                        src={AI_AVATAR} 
                        alt="AI"
                        className="w-full h-full rounded-full bg-[#16213e]"
                      />
                    </div>
                    <p className="text-white text-lg md:text-xl font-bold">AI</p>
                    <p className="text-[#ffd700] text-2xl md:text-4xl font-bold mt-2">
                      {GESTURE_NAMES[aiGesture]}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 结果展示 */}
            {gamePhase === 'result' && showResult && gameResult && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-black/85">
                {/* 结果文字 */}
                <div 
                  className="text-5xl md:text-7xl font-bold mb-8 animate-bounce"
                  style={{ 
                    color: resultDisplay.color, 
                    textShadow: `0 0 50px ${resultDisplay.color}` 
                  }}
                >
                  {resultDisplay.text}
                </div>
                
                {/* 双方出拳 */}
                <div className="flex justify-center gap-12 md:gap-20">
                  <div className="text-center">
                    <p className="text-gray-400 mb-2 text-lg">你出</p>
                    <p className="text-4xl md:text-6xl">{lockedGesture ? GESTURE_NAMES[lockedGesture] : '?'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 mb-2 text-lg">AI出</p>
                    <p className="text-4xl md:text-6xl text-[#ffd700]">{aiGesture ? GESTURE_NAMES[aiGesture] : '?'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 底部信息栏 - 只在等待和检测阶段显示 */}
          {(gamePhase === 'waiting' || gamePhase === 'detecting') && (
            <div className="p-4">
              {/* 手势状态 */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                {/* 玩家手势 */}
                <div className="bg-[#0f3460] rounded-lg p-3 text-center">
                  <p className="text-gray-400 text-sm mb-1">你的手势</p>
                  <div 
                    className="text-2xl md:text-3xl font-bold transition-colors duration-300"
                    style={{ color: hasHand ? (isStable ? '#4fbdba' : '#e94560') : '#888' }}
                  >
                    {hasHand ? (currentGesture ? GESTURE_NAMES[currentGesture] : '检测中...') : '等待中...'}
                  </div>
                  {hasHand && currentGesture && (
                    <p className={`text-xs mt-1 ${isStable ? 'text-[#4fbdba]' : 'text-[#e94560]'}`}>
                      {isStable ? '✅ 即将开始！' : '⏳ 保持手势...'}
                    </p>
                  )}
                </div>

                {/* 状态 */}
                <div className="bg-[#1a1a2e] border border-[#0f3460] rounded-lg p-3 text-center flex flex-col justify-center">
                  <p className="text-gray-400 text-sm mb-1">状态</p>
                  <p className="text-xl md:text-2xl font-bold text-white">
                    {showHomepage ? '等待开始' : '检测中'}
                  </p>
                </div>

                {/* AI */}
                <div className="bg-[#533483] rounded-lg p-3 text-center">
                  <p className="text-gray-300 text-sm mb-1">AI 对手</p>
                  <div className="text-2xl md:text-3xl font-bold text-[#ffd700]">
                    🤖
                  </div>
                </div>
              </div>

              {/* 提示文字 */}
              <div className="text-center">
                <p className="text-gray-400 text-sm">
                  {showHomepage 
                    ? '👋 伸出手掌（✊ 锤 / ✋ 包 / ✌️ 剪）开始游戏'
                    : '✋ 保持手势稳定，自动开始倒数'
                  }
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 底部控制区 - 只在等待和检测阶段显示 */}
        {(gamePhase === 'waiting' || gamePhase === 'detecting') && (
          <div className="mt-6 text-center">
            <div className="mb-4">
              <span className="text-xl font-bold text-[#ffd700]">🏆 一盘决定胜负</span>
            </div>
            <button
              onClick={handleReset}
              className="bg-[#0f3460] hover:bg-[#1a4a7a] text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              🔄 重置游戏
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
