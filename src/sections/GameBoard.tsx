import { useEffect, useState, useCallback } from 'react';
import { useHandGesture } from '@/hooks/useHandGesture';
import { useGame } from '@/hooks/useGame';
import { GESTURE_NAMES } from '@/types/game';
import { Camera } from 'lucide-react';
import { WelcomeOverlay } from './WelcomeOverlay';


const GESTURE_EMOJIS = {
  ROCK: <img src="/icons/石头.png" alt="石头" className="w-full h-full object-contain drop-shadow-md" />,
  PAPER: <img src="/icons/包.png" alt="包" className="w-full h-full object-contain drop-shadow-md" />,
  SCISSORS: <img src="/icons/剪刀.png" alt="剪刀" className="w-full h-full object-contain drop-shadow-md" />
};
export function GameBoard() {
  const { videoRef, canvasRef, currentGesture, isStable, isModelLoaded, hasHand, countdownTime, error } = useHandGesture();
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
    }, 10000);
  }, [lockGesture, resetRound, hasHand, startGame]);

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

      {/* 加载遮罩与待机页 */}
      <div
        className={`absolute inset-0 z-50 transition-opacity duration-500 origin-top pointer-events-none ${!isModelLoaded || gamePhase === 'waiting' ? 'opacity-100 pointer-events-auto' : 'opacity-0'
          }`}
      >
        <WelcomeOverlay isLoading={!isModelLoaded} />
      </div>

      {/* ============ CANVAS LAYER (ALWAYS MOUNTED) ============ */}
      <div className={`transition-all duration-500 flex justify-center items-center overflow-hidden
        ${(gamePhase === 'waiting' || gamePhase === 'detecting')
          ? 'absolute left-1/2 top-[12vh] sm:top-[15vh] md:top-[18vh] xl:top-[24vh] -translate-x-1/2 z-20 w-[85vw] max-w-[450px] xl:max-w-[900px] aspect-square bg-white border-[16px] xl:border-[32px] border-white drop-shadow-2xl'
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
            <div className="absolute top-0 left-0 w-6 h-6 sm:w-8 sm:h-8 xl:w-16 xl:h-16 border-t-[6px] sm:border-t-[8px] xl:border-t-[16px] border-l-[6px] sm:border-l-[8px] xl:border-l-[16px] border-[#F4C522] rounded-tl-sm xl:rounded-tl-lg px-2"></div>
            <div className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8 xl:w-16 xl:h-16 border-t-[6px] sm:border-t-[8px] xl:border-t-[16px] border-r-[6px] sm:border-r-[8px] xl:border-r-[16px] border-[#F4C522] rounded-tr-sm xl:rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 sm:w-8 sm:h-8 xl:w-16 xl:h-16 border-b-[6px] sm:border-b-[8px] xl:border-b-[16px] border-l-[6px] sm:border-l-[8px] xl:border-l-[16px] border-[#F4C522] rounded-bl-sm xl:rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-8 sm:h-8 xl:w-16 xl:h-16 border-b-[6px] sm:border-b-[8px] xl:border-b-[16px] border-r-[6px] sm:border-r-[8px] xl:border-r-[16px] border-[#F4C522] rounded-br-sm xl:rounded-br-lg"></div>
            {/* Center Cross */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 xl:w-32 xl:h-32 flex items-center justify-center opacity-90 drop-shadow-md">
              <div className="absolute w-full h-[4px] sm:h-[6px] xl:h-[12px] bg-[#F4C522] rounded-full"></div>
              <div className="absolute h-full w-[4px] sm:h-[6px] xl:w-[12px] bg-[#F4C522] rounded-full"></div>
            </div>

            {/* 倒计时提示与准备提示 */}
            {hasHand && !isStable && currentGesture && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 xl:px-8 xl:py-4 xl:bottom-12 rounded-full text-sm xl:text-2xl font-bold tracking-widest whitespace-nowrap backdrop-blur flex items-center gap-2 xl:gap-4">
                <span>保持[{GESTURE_NAMES[currentGesture]}]</span>
                <span className="text-[#F4C522] text-lg xl:text-4xl">{countdownTime}s</span>
                <span>以开始比赛</span>
              </div>
            )}
            {hasHand && isStable && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#F4C522] text-black px-6 py-2 xl:px-12 xl:py-4 xl:bottom-12 rounded-full text-lg xl:text-4xl font-bold tracking-widest whitespace-nowrap animate-bounce shadow-xl">
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
          <h1 className="text-black text-[50px] sm:text-[70px] md:text-[90px] lg:text-[110px] xl:text-[220px] font-black tracking-widest sm:tracking-[0.1em] leading-none pointer-events-auto">
            一盘定胜负
          </h1>
        </div>

        {/* Bottom Gray Half */}
        <div className="flex-1 min-h-[250px] bg-[#E6E6E6] flex flex-col sm:flex-row items-center sm:items-end justify-between p-6 sm:p-10 xl:p-20 pb-8 sm:pb-12 xl:pb-24 pointer-events-auto gap-6 sm:gap-0">

          {/* Left Interface */}
          <div className="flex items-end gap-2 sm:gap-4 h-full w-full sm:w-auto mt-auto">
            <div className="flex flex-col h-full justify-end w-full sm:w-auto">

              {/* Current Gesture Icon Large Square */}
              <div className="w-[100px] h-[100px] sm:w-[130px] sm:h-[130px] xl:w-[260px] xl:h-[260px] bg-white flex items-center justify-center border-[6px] xl:border-[12px] border-white shadow-sm overflow-hidden relative">
                <div className={`w-[80%] h-[80%] transition-transform duration-300 ${isStable ? 'scale-110 drop-shadow-lg' : 'scale-100 opacity-60'}`}>
                  {currentGesture ? GESTURE_EMOJIS[currentGesture] : GESTURE_EMOJIS['ROCK']}
                </div>
              </div>

              <div className="mt-2 sm:mt-4 xl:mt-8 flex flex-col">
                <h2 className="text-[32px] sm:text-[44px] xl:text-[88px] font-black text-black leading-none -ml-1 whitespace-nowrap tracking-tight">我的手势</h2>
                <div className="flex items-end justify-between w-[120px] sm:w-[150px] xl:w-[300px]">
                  <div className="flex flex-col text-[8px] sm:text-[10px] xl:text-[20px] font-black text-[#cca619] leading-[0.9] mt-1 xl:mt-3 -ml-1 tracking-tighter opacity-80">
                    <span>COW'OK</span>
                    <span>FRESH STORE</span>
                    <span>COLLECTION</span>
                  </div>
                  <h2 className="text-[32px] sm:text-[44px] xl:text-[88px] font-black text-black leading-none whitespace-nowrap tracking-tighter -mb-1 xl:-mb-3">显示</h2>
                </div>
              </div>
            </div>

            {/* Small adjacent icons */}
            <div className="hidden min-[400px]:flex self-start gap-2 sm:mt-[calc(140px-44px)] xl:mt-[calc(300px-88px)] mt-2 xl:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 xl:w-20 xl:h-20 bg-white shadow-sm flex items-center justify-center p-1.5 xl:p-3 opacity-80" aria-hidden="true">
                {GESTURE_EMOJIS['SCISSORS']}
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 xl:w-20 xl:h-20 bg-white shadow-sm flex items-center justify-center p-1.5 xl:p-3 opacity-80" aria-hidden="true">
                {GESTURE_EMOJIS['PAPER']}
              </div>
            </div>
          </div>

          {/* Right Interface */}
          <div className="flex flex-col items-start sm:items-end text-left sm:text-right h-full justify-end w-full sm:w-auto border-t-2 sm:border-t-0 border-[#cccccc] sm:border-transparent pt-4 sm:pt-0 mt-2 sm:mt-0">
            <div className="text-[14px] sm:text-[20px] lg:text-[24px] xl:text-[48px] xl:mb-8 font-black text-[#cc9f18] leading-[1.1] mb-2 sm:mb-4 pr-1 tracking-wider uppercase opacity-90 hidden sm:block">
              COW'OK<br />
              FRESH STORE<br />
              COLLECTION
            </div>
            <p className="text-black text-[14px] sm:text-[16px] lg:text-[20px] xl:text-[40px] font-bold leading-tight max-w-[200px] sm:max-w-[260px] lg:max-w-[300px] xl:max-w-[600px]">
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
            <div className="w-[500px] h-[500px] xl:w-[1000px] xl:h-[1000px] bg-[#F4C522]/90 rounded-full flex flex-col items-center justify-center shadow-[0_0_100px_rgba(244,197,34,0.5)] animate-pulse">
              <div className="text-black font-black text-2xl xl:text-6xl xl:mb-8 tracking-widest mb-4 opacity-70">判定开始</div>
              <div
                className="text-[300px] xl:text-[600px] xl:-mt-20 font-black text-black leading-none drop-shadow-2xl -mt-10"
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

              <div className="absolute top-8 xl:top-16 text-[#F4C522] text-xl xl:text-4xl tracking-widest font-black uppercase">Battle Phase</div>

              <div className="flex items-center justify-center gap-6 sm:gap-12 md:gap-24 w-full">
                {/* 玩家 */}
                <div className="text-center animate-bounce flex-1 flex flex-col items-center max-w-[300px] xl:max-w-[600px] xl:gap-8">
                  <p className="text-white text-3xl xl:text-6xl font-black mb-6 tracking-widest">你</p>
                  <div className="w-full aspect-square bg-white border-8 xl:border-[16px] xl:rounded-[40px] border-transparent flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.2)] rounded-2xl relative overflow-hidden">
                    <div className="w-1/2 h-1/2 drop-shadow-xl z-10 transition-transform hover:scale-110">
                      {GESTURE_EMOJIS[lockedGesture!]}
                    </div>
                    <div className="absolute w-full h-1/2 bottom-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                  </div>
                  <p className="text-white text-3xl md:text-5xl xl:text-8xl xl:mt-16 font-black mt-8 tracking-widest">
                    {GESTURE_NAMES[lockedGesture!]}
                  </p>
                </div>

                {/* VS VS VS */}
                <div className="flex flex-col items-center text-[#F4C522] gap-2 pt-16">
                  <div className="text-[120px] md:text-[160px] xl:text-[320px] font-black leading-none italic drop-shadow-[0_0_20px_rgba(244,197,34,0.8)] filter">
                    V
                  </div>
                  <div className="text-[80px] md:text-[120px] xl:text-[240px] xl:-mt-20 font-black leading-none italic -mt-10 text-[#cca619]">
                    S
                  </div>
                </div>

                {/* AI */}
                <div className="text-center animate-bounce flex-1 flex flex-col items-center max-w-[300px] xl:max-w-[600px] xl:gap-8" style={{ animationDelay: '0.1s' }}>
                  <p className="text-[#F4C522] text-3xl xl:text-6xl font-black mb-6 tracking-widest">AI</p>
                  <div className="w-full aspect-square bg-[#1a1a1a] border-8 xl:border-[16px] xl:rounded-[40px] border-[#F4C522] flex items-center justify-center shadow-[0_0_60px_rgba(244,197,34,0.3)] rounded-2xl relative overflow-hidden">
                    <div className="w-1/2 h-1/2 drop-shadow-xl z-10">
                      {GESTURE_EMOJIS[aiGesture!]}
                    </div>
                    <div className="absolute w-full h-1/2 bottom-0 bg-gradient-to-t from-[#F4C522]/20 to-transparent"></div>
                  </div>
                  <p className="text-[#F4C522] text-3xl md:text-5xl xl:text-8xl xl:mt-16 font-black mt-8 tracking-widest">
                    {GESTURE_NAMES[aiGesture]}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 结果展示 */}
        {gamePhase === 'result' && showResult && gameResult && (
          <div className="absolute inset-0 z-40 pointer-events-auto flex flex-col bg-transparent">

            {/* Top Yellow Half */}
            <div className="relative h-[55%] bg-[#F4C522] flex flex-col items-center justify-start pt-[8vh] md:pt-[10vh]">
              {gameResult === 'WIN' && (
                <div className="flex flex-col items-center z-10 relative">
                  <h1 className="text-black text-[80px] md:text-[110px] xl:text-[220px] font-black leading-[1.0] text-center tracking-tighter">
                    OK您<br />胜利了
                  </h1>
                  <div className="absolute -bottom-[60px] md:-bottom-[80px] xl:-bottom-[160px] text-[70px] md:text-[100px] xl:text-[200px] font-black text-[#D4A51A] tracking-tighter whitespace-nowrap z-0">
                    YOU WIN
                  </div>
                </div>
              )}
              {gameResult === 'LOSE' && (
                <div className="flex flex-col items-center z-10 relative">
                  <h1 className="text-black text-[90px] md:text-[120px] xl:text-[240px] font-black leading-[1.0] text-center tracking-tighter">
                    AI<br />胜利了
                  </h1>
                  <div className="absolute -bottom-[50px] md:-bottom-[70px] xl:-bottom-[140px] text-[70px] md:text-[100px] xl:text-[200px] font-black text-[#D4A51A] tracking-tighter whitespace-nowrap z-0">
                    YOU LOSE
                  </div>
                </div>
              )}
              {gameResult === 'DRAW' && (
                <div className="flex flex-col items-center z-10 relative">
                  <h1 className="text-black text-[80px] md:text-[110px] xl:text-[220px] font-black leading-[1.0] text-center tracking-tighter">
                    平局<br />再来一盘
                  </h1>
                  <div className="absolute -bottom-[60px] md:-bottom-[80px] xl:-bottom-[160px] text-[70px] md:text-[100px] xl:text-[200px] font-black text-[#D4A51A] tracking-tighter whitespace-nowrap z-0">
                    DRAW
                  </div>
                </div>
              )}

              {/* 双方出拳框 */}
              <div className="absolute bottom-4 sm:bottom-6 w-full px-6 md:px-24 flex justify-between items-end z-20">
                <div className="flex flex-col gap-1 items-start">
                  <span className="text-black font-black text-xl md:text-2xl xl:text-5xl tracking-widest leading-none">你出</span>
                  <div className="w-[80px] h-[80px] md:w-[110px] md:h-[110px] xl:w-[220px] xl:h-[220px] bg-white border-0 flex items-center justify-center p-2">
                    {GESTURE_EMOJIS[lockedGesture!]}
                  </div>
                </div>

                <div className="flex flex-col gap-1 items-end">
                  <span className="text-black font-black text-xl md:text-2xl xl:text-5xl tracking-widest leading-none">AI出</span>
                  <div className="w-[80px] h-[80px] md:w-[110px] md:h-[110px] xl:w-[220px] xl:h-[220px] bg-white border-0 flex items-center justify-center p-2">
                    {GESTURE_EMOJIS[aiGesture!]}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Gray Half */}
            <div className="relative h-[45%] bg-[#E6E6E6] flex flex-col items-center justify-start pt-[5vh] md:pt-[8vh]">

              {gameResult === 'WIN' && (
                <div className="relative w-[220px] h-[220px] md:w-[320px] md:h-[320px] xl:w-[640px] xl:h-[640px] rounded-full border-[16px] md:border-[20px] xl:border-[40px] border-black flex items-center justify-center bg-transparent mt-4 md:mt-0 xl:mt-12">
                  <span className="text-[110px] md:text-[160px] xl:text-[320px] font-black tracking-tighter text-black leading-none drop-shadow-sm">ok</span>

                  {/* Heart Bubble */}
                  <div className="absolute -top-6 -right-6 md:-top-8 md:-right-10 xl:-top-16 xl:-right-20 w-24 h-24 md:w-32 md:h-32 xl:w-64 xl:h-64 bg-white rounded-full border-[8px] md:border-[10px] xl:border-[20px] border-black flex items-center justify-center">
                    <div className="absolute -bottom-2 -left-2 md:-bottom-3 md:-left-3 xl:-bottom-6 xl:-left-6 w-8 h-8 md:w-10 md:h-10 xl:w-20 xl:h-20 bg-white border-l-[8px] border-b-[8px] md:border-l-[10px] md:border-b-[10px] xl:border-l-[20px] xl:border-b-[20px] border-black rotate-45"></div>
                    <svg className="w-12 h-12 md:w-16 md:h-16 xl:w-32 xl:h-32 text-[#F4C522] z-10 mt-1 md:mt-2 xl:mt-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                </div>
              )}

              {gameResult === 'LOSE' && (
                <div className="relative w-[220px] h-[220px] md:w-[320px] md:h-[320px] xl:w-[640px] xl:h-[640px] rounded-full border-[16px] md:border-[20px] xl:border-[40px] border-black flex items-center justify-center bg-transparent mt-4 md:mt-0 xl:mt-12">
                  {/* Left Eye */}
                  <div className="absolute top-[55%] left-[20%] w-[45px] h-[15px] md:w-[60px] md:h-[20px] xl:w-[120px] xl:h-[40px] bg-black rotate-[-15deg] z-10"></div>
                  {/* Left Tear */}
                  <div className="absolute top-[60%] left-[23%] md:left-[23%] w-[25px] h-[60px] md:w-[35px] md:h-[80px] xl:w-[70px] xl:h-[160px] bg-[#BDE0FE] rounded-b-full"></div>

                  {/* Right Eye */}
                  <div className="absolute top-[55%] right-[20%] w-[45px] h-[15px] md:w-[60px] md:h-[20px] xl:w-[120px] xl:h-[40px] bg-black rotate-[15deg] z-10"></div>
                  {/* Right Tear */}
                  <div className="absolute top-[60%] right-[23%] md:right-[23%] w-[25px] h-[60px] md:w-[35px] md:h-[80px] xl:w-[70px] xl:h-[160px] bg-[#BDE0FE] rounded-b-full"></div>

                  {/* Mouth - Vertical block */}
                  <div className="absolute top-[52%] left-1/2 -translate-x-1/2 w-[16px] h-[45px] md:w-[20px] md:h-[60px] xl:w-[40px] xl:h-[120px] bg-black z-10"></div>
                </div>
              )}

              {gameResult === 'DRAW' && (
                <div className="relative w-[220px] h-[220px] md:w-[320px] md:h-[320px] xl:w-[640px] xl:h-[640px] rounded-full border-[16px] md:border-[20px] xl:border-[40px] border-black flex items-center justify-center bg-transparent mt-4 md:mt-0 xl:mt-12">
                  <div className="flex gap-10 md:gap-14 xl:gap-28 mt-6">
                    <div className="w-[16px] h-[45px] md:w-[20px] md:h-[60px] xl:w-[40px] xl:h-[120px] bg-black"></div>
                    <div className="w-[16px] h-[45px] md:w-[20px] md:h-[60px] xl:w-[40px] xl:h-[120px] bg-black"></div>
                  </div>
                </div>
              )}

              {/* <button
                onClick={handleReset}
                className="absolute bottom-6 md:bottom-10 px-8 py-3 bg-[#F4C522] text-black font-black text-xl md:text-2xl border-4 border-black shadow-[4px_4px_0_0_#000] md:shadow-[6px_6px_0_0_#000] hover:translate-y-1 hover:shadow-none transition-all active:scale-95 z-50"
              >
                返回主页
              </button> */}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
