import { useEffect, useState, useCallback } from 'react';
import { useHandGesture } from '@/hooks/useHandGesture';
import { useGame } from '@/hooks/useGame';
import { GESTURE_NAMES, RESULT_TEXTS } from '@/types/game';
import { Camera } from 'lucide-react';
import { WelcomeOverlay } from './WelcomeOverlay';


const GESTURE_EMOJIS = { ROCK: '✊', PAPER: '✋', SCISSORS: '✌️' };

export function GameBoard() {
  const { videoRef, canvasRef, currentGesture, isStable, isModelLoaded, hasHand, error } = useHandGesture();
  const {
    currentGesture: lockedGesture,
    aiGesture,
    gameResult,
    lockGesture,
    resetRound,
    startGame,
  } = useGame();

  const [countdown, setCountdown] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gamePhase, setGamePhase] = useState<'waiting' | 'detecting' | 'countdown' | 'vs' | 'result'>('waiting');

  useEffect(() => {
    if (hasHand && gamePhase === 'waiting') {
      setGamePhase('detecting');
    } else if (!hasHand && gamePhase === 'detecting') {
      setGamePhase('waiting');
    }
  }, [hasHand, gamePhase]);

  useEffect(() => {
    if (gamePhase === 'detecting' && currentGesture && isStable && hasHand) {
      handleStartGame(currentGesture);
    }
  }, [gamePhase, currentGesture, isStable, hasHand]);

  const handleStartGame = useCallback(async (gesture: typeof currentGesture) => {
    if (!gesture) return;

    startGame();
    setGamePhase('countdown');

    for (let i = 3; i >= 1; i--) {
      setCountdown(i);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    setCountdown(null);

    lockGesture(gesture);

    setGamePhase('vs');
    await new Promise(resolve => setTimeout(resolve, 2000));

    setShowResult(true);
    setGamePhase('result');

    setTimeout(() => {
      setShowResult(false);
      resetRound();
      setGamePhase(hasHand ? 'detecting' : 'waiting');
    }, 3000);
  }, [lockGesture, resetRound, hasHand, startGame]);

  const getResultDisplay = () => {
    if (!gameResult) return { text: '准备开始！', color: '#fff' };
    return RESULT_TEXTS[gameResult];
  };

  const resultDisplay = getResultDisplay();

  const handleReset = () => {
    resetRound();
    setGamePhase(hasHand ? 'detecting' : 'waiting');
    setCountdown(null);
    setShowResult(false);
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
    <div className={`relative min-h-screen font-sans flex flex-col overflow-hidden transition-colors duration-500 ${(gamePhase === 'waiting' || gamePhase === 'detecting') ? 'bg-[#E6E6E6]' : 'bg-[#16213e]'}`}>

      {/* 隐藏的视频元素 */}
      <video ref={videoRef} className="hidden" playsInline />

      {/* 加载遮罩 */}
      {!isModelLoaded && (
        <div className="absolute inset-0 z-50">
          <WelcomeOverlay isLoading={true} />
        </div>
      )}

      {/* ============ CANVAS LAYER (ALWAYS MOUNTED) ============ */}
      <div className={`transition-all duration-500 flex justify-center items-center overflow-hidden
        ${(gamePhase === 'waiting' || gamePhase === 'detecting')
          ? 'absolute left-1/2 top-[12vh] sm:top-[15vh] md:top-[18vh] -translate-x-1/2 z-20 w-[85vw] max-w-[450px] aspect-square bg-white border-[16px] border-white drop-shadow-2xl'
          : 'fixed inset-0 z-0 bg-[#16213e]'
        }`}
      >
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className={`w-full h-full object-cover transform transition-opacity duration-300 ${(gamePhase === 'countdown' || gamePhase === 'vs' || gamePhase === 'result') ? 'opacity-20 blur-sm' : ''}`}
        />

        {/* 黄色边框装饰 (仅等待/检测界面) */}
        {(gamePhase === 'waiting' || gamePhase === 'detecting') && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Corners */}
            <div className="absolute top-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-t-[6px] sm:border-t-[8px] border-l-[6px] sm:border-l-[8px] border-[#F4C522] rounded-tl-sm"></div>
            <div className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-t-[6px] sm:border-t-[8px] border-r-[6px] sm:border-r-[8px] border-[#F4C522] rounded-tr-sm"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-b-[6px] sm:border-b-[8px] border-l-[6px] sm:border-l-[8px] border-[#F4C522] rounded-bl-sm"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-b-[6px] sm:border-b-[8px] border-r-[6px] sm:border-r-[8px] border-[#F4C522] rounded-br-sm"></div>
            {/* Center Cross */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center opacity-90 drop-shadow-md">
              <div className="absolute w-full h-[4px] sm:h-[6px] bg-[#F4C522] rounded-full"></div>
              <div className="absolute h-full w-[4px] sm:h-[6px] bg-[#F4C522] rounded-full"></div>
            </div>

            {/* 倒计时提示与准备提示 */}
            {hasHand && !isStable && currentGesture && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-bold tracking-widest whitespace-nowrap backdrop-blur">
                保持[{GESTURE_NAMES[currentGesture]}]以开始比赛
              </div>
            )}
            {hasHand && isStable && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#F4C522] text-black px-6 py-2 rounded-full text-lg font-bold tracking-widest whitespace-nowrap animate-bounce shadow-xl">
                倒数开始!
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============ HOME PAGE (YELLOW / GRAY POSTER) ============ */}
      <div className={`absolute inset-0 z-10 flex flex-col pointer-events-none transition-opacity duration-300 ${(gamePhase === 'countdown' || gamePhase === 'vs' || gamePhase === 'result') ? 'opacity-0' : 'opacity-100'}`}>

        {/* Top Yellow Half */}
        <div className="h-[65vh] min-h-[400px] bg-[#F4C522] flex flex-col items-center pt-[5vh] sm:pt-[6vh]">
          <h1 className="text-black text-[50px] sm:text-[70px] md:text-[90px] lg:text-[110px] font-black tracking-widest sm:tracking-[0.1em] leading-none pointer-events-auto">
            一盘定胜负
          </h1>
        </div>

        {/* Bottom Gray Half */}
        <div className="flex-1 min-h-[250px] bg-[#E6E6E6] flex flex-col sm:flex-row items-center sm:items-end justify-between p-6 sm:p-10 pb-8 sm:pb-12 pointer-events-auto gap-6 sm:gap-0">

          {/* Left Interface */}
          <div className="flex items-end gap-2 sm:gap-4 h-full w-full sm:w-auto mt-auto">
            <div className="flex flex-col h-full justify-end w-full sm:w-auto">

              {/* Current Gesture Icon Large Square */}
              <div className="w-[100px] h-[100px] sm:w-[130px] sm:h-[130px] bg-white flex items-center justify-center border-[6px] border-white shadow-sm overflow-hidden relative">
                <span className={`text-[60px] sm:text-[80px] drop-shadow-md transition-transform duration-300 ${isStable ? 'scale-110' : 'scale-100'}`}>
                  {currentGesture ? GESTURE_EMOJIS[currentGesture] : <span className="text-black/20">✊</span>}
                </span>
              </div>

              <div className="mt-2 sm:mt-4 flex flex-col">
                <h2 className="text-[32px] sm:text-[44px] font-black text-black leading-none -ml-1 whitespace-nowrap tracking-tight">我的手势</h2>
                <div className="flex items-end justify-between w-[120px] sm:w-[150px]">
                  <div className="flex flex-col text-[8px] sm:text-[10px] font-black text-[#cca619] leading-[0.9] mt-1 -ml-1 tracking-tighter opacity-80">
                    <span>COW'OK</span>
                    <span>FRESH STORE</span>
                    <span>COLLECTION</span>
                  </div>
                  <h2 className="text-[32px] sm:text-[44px] font-black text-black leading-none whitespace-nowrap tracking-tighter -mb-1">显示</h2>
                </div>
              </div>
            </div>

            {/* Small adjacent icons */}
            <div className="hidden min-[400px]:flex self-start gap-2 sm:mt-[calc(140px-44px)] mt-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white shadow-sm flex items-center justify-center text-lg sm:text-xl">✌️</div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white shadow-sm flex items-center justify-center text-lg sm:text-xl">✋</div>
            </div>
          </div>

          {/* Right Interface */}
          <div className="flex flex-col items-start sm:items-end text-left sm:text-right h-full justify-end w-full sm:w-auto border-t-2 sm:border-t-0 border-[#cccccc] sm:border-transparent pt-4 sm:pt-0 mt-2 sm:mt-0">
            <div className="text-[14px] sm:text-[20px] lg:text-[24px] font-black text-[#cc9f18] leading-[1.1] mb-2 sm:mb-4 pr-1 tracking-wider uppercase opacity-90 hidden sm:block">
              COW'OK<br />
              FRESH STORE<br />
              COLLECTION
            </div>
            <p className="text-black text-[14px] sm:text-[16px] xl:text-[20px] font-bold leading-tight max-w-[200px] sm:max-w-[260px] lg:max-w-[300px]">
              对着摄像头做出手势 <br className="hidden sm:inline" />
              (锤 / 包 / 剪) 自动识别<br />
              后开始游戏
            </p>
          </div>

        </div>
      </div>

      {/* ============ GAME PHASES (VS / RESULT) ============ */}
      <div className={`absolute inset-0 z-30 transition-opacity duration-300 pointer-events-none ${(gamePhase === 'countdown' || gamePhase === 'vs' || gamePhase === 'result') ? 'opacity-100 pointer-events-auto' : 'opacity-0'}`}>

        {/* 全屏倒计时 */}
        {gamePhase === 'countdown' && countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30 backdrop-blur-sm">
            <div className="w-[500px] h-[500px] bg-[#F4C522]/90 rounded-full flex flex-col items-center justify-center shadow-[0_0_100px_rgba(244,197,34,0.5)] animate-pulse">
              <div className="text-black font-black text-2xl tracking-widest mb-4 opacity-70">判定开始</div>
              <div
                className="text-[300px] font-black text-black leading-none drop-shadow-2xl -mt-10"
              >
                {countdown}
              </div>
            </div>
          </div>
        )}

        {/* VS 对战动画 */}
        {gamePhase === 'vs' && lockedGesture && aiGesture && (
          <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/80 backdrop-blur-md">
            <div className="flex flex-col justify-center items-center w-full h-full relative p-8">

              <div className="absolute top-8 text-[#F4C522] text-xl tracking-widest font-black uppercase">Battle Phase</div>

              <div className="flex items-center justify-center gap-6 sm:gap-12 md:gap-24 w-full">
                {/* 玩家 */}
                <div className="text-center animate-bounce flex-1 flex flex-col items-center max-w-[300px]">
                  <p className="text-white text-3xl font-black mb-6 tracking-widest">你</p>
                  <div className="w-full aspect-square bg-white border-8 border-transparent flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.2)] rounded-2xl relative overflow-hidden">
                    <span className="text-[120px] md:text-[180px] drop-shadow-xl z-10 transition-transform hover:scale-110">
                      {GESTURE_EMOJIS[lockedGesture]}
                    </span>
                    <div className="absolute w-full h-1/2 bottom-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                  </div>
                  <p className="text-white text-3xl md:text-5xl font-black mt-8 tracking-widest">
                    {GESTURE_NAMES[lockedGesture]}
                  </p>
                </div>

                {/* VS VS VS */}
                <div className="flex flex-col items-center text-[#F4C522] gap-2 pt-16">
                  <div className="text-[120px] md:text-[160px] font-black leading-none italic drop-shadow-[0_0_20px_rgba(244,197,34,0.8)] filter">
                    V
                  </div>
                  <div className="text-[80px] md:text-[120px] font-black leading-none italic -mt-10 text-[#cca619]">
                    S
                  </div>
                </div>

                {/* AI */}
                <div className="text-center animate-bounce flex-1 flex flex-col items-center max-w-[300px]" style={{ animationDelay: '0.1s' }}>
                  <p className="text-[#F4C522] text-3xl font-black mb-6 tracking-widest">AI</p>
                  <div className="w-full aspect-square bg-[#1a1a1a] border-8 border-[#F4C522] flex items-center justify-center shadow-[0_0_60px_rgba(244,197,34,0.3)] rounded-2xl relative overflow-hidden">
                    <span className="text-[120px] md:text-[180px] drop-shadow-xl z-10">
                      {GESTURE_EMOJIS[aiGesture]}
                    </span>
                    <div className="absolute w-full h-1/2 bottom-0 bg-gradient-to-t from-[#F4C522]/20 to-transparent"></div>
                  </div>
                  <p className="text-[#F4C522] text-3xl md:text-5xl font-black mt-8 tracking-widest">
                    {GESTURE_NAMES[aiGesture]}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 结果展示 */}
        {gamePhase === 'result' && showResult && gameResult && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-black/90 backdrop-blur-lg">

            {/* 顶部的战斗复盘小窗 */}
            <div className="absolute top-12 flex items-center justify-center gap-8 opacity-60 scale-75">
              <div className="text-center">
                <span className="text-6xl">{GESTURE_EMOJIS[lockedGesture!]}</span>
              </div>
              <div className="text-white font-black text-4xl italic">VS</div>
              <div className="text-center">
                <span className="text-6xl">{GESTURE_EMOJIS[aiGesture!]}</span>
              </div>
            </div>

            {/* 结果主文字 */}
            <div
              className={`text-[80px] md:text-[130px] font-black mb-16 animate-bounce tracking-[0.1em] uppercase filter
                ${gameResult === 'WIN' ? 'text-[#4fbdba] drop-shadow-[0_0_80px_rgba(79,189,186,0.8)]' :
                  gameResult === 'LOSE' ? 'text-[#e94560] drop-shadow-[0_0_80px_rgba(233,69,96,0.8)]' :
                    'text-[#F4C522] drop-shadow-[0_0_80px_rgba(244,197,34,0.8)]'}`
              }
            >
              {resultDisplay.text}
            </div>

            {/* 控制区 */}
            <div className="mt-4 flex flex-col items-center gap-4">
              <button
                onClick={handleReset}
                className="group relative overflow-hidden bg-[#F4C522] text-black font-black text-2xl py-5 px-16 transition-all hover:scale-105 active:scale-95 border-4 border-[#F4C522] hover:border-white shadow-[0_0_40px_rgba(244,197,34,0.4)]"
              >
                <span className="relative z-10 tracking-[0.2em] ml-2">再来一盘</span>
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
              <p className="text-white/40 text-sm font-bold tracking-widest mt-4">伸出双手即可再次对战</p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
