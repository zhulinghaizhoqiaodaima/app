import { Loader2 } from 'lucide-react';

interface WelcomeOverlayProps {
    isLoading?: boolean;
}

export function WelcomeOverlay({ isLoading }: WelcomeOverlayProps) {
    return (
        <div className="absolute inset-0 z-40 flex flex-col w-full h-full overflow-hidden font-sans">
            {/* Top Half - Yellow */}
            <div className="relative w-full h-1/2 bg-[#F4C522] flex flex-col justify-between p-6 md:p-10">

                {/* Main Title Area */}
                <div className="flex flex-col items-end w-full pt-4 md:pt-8 pr-4 md:pr-12">
                    <h1 className="text-black text-[120px] md:text-[180px] leading-none font-black tracking-tighter" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                        包剪锤
                    </h1>
                    <h1 className="text-black text-[100px] md:text-[150px] leading-none font-black tracking-tighter mt-[-10px] md:mt-[-20px]" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                        游戏
                    </h1>
                </div>

                {/* Left Side Content */}
                <div className="absolute left-6 md:left-10 bottom-6 md:bottom-10">
                    <div className="text-[#c19b16] font-bold text-xl md:text-3xl leading-tight mb-4 tracking-wider">
                        COW'OK<br />
                        FRESH STORE<br />
                        COLLECTION
                    </div>
                    <div className="w-20 h-20 md:w-32 md:h-32 bg-white flex items-center justify-center p-2">
                        <div className="w-full h-full rounded-full border-4 border-black flex items-center justify-center">
                            <span className="font-black text-black text-2xl md:text-4xl tracking-tighter">ok</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Bottom Half - Light Gray */}
            <div className="relative w-full h-1/2 bg-[#E6E6E6] p-6 md:p-10 flex items-end justify-between">

                {/* Loading Indicator in the Center if needed */}
                {isLoading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Loader2 className="w-16 h-16 text-[#F4C522] animate-spin mb-4" />
                        <p className="text-gray-500 font-bold tracking-widest text-xl">LOADING MODEL...</p>
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-black/40 font-bold tracking-widest text-2xl animate-pulse">
                            [ 伸出手掌开始游戏 ]
                        </p>
                    </div>
                )}

                {/* Footer Left Details */}
                <div className="w-1/2">
                    <p className="text-white font-bold text-[8px] md:text-xs leading-tight tracking-wider uppercase opacity-80" style={{ textShadow: '0 0 2px rgba(0,0,0,0.1)' }}>
                        BUT HE GRADUALLY FELT LONELY. FOR HE REAL-<br />
                        IZED THAT THE VAST MAJORITY OF PEOPLE ATE<br />
                        NOTHING BUT BLAND BEEF-MEAT WITHOUT A...
                    </p>
                </div>

                {/* Footer Right Logos */}
                <div className="flex items-center gap-2 md:gap-4 opacity-80">
                    <div className="w-8 h-8 md:w-12 md:h-12 border-2 border-white flex items-center justify-center text-white">
                        {/* Dummy icon 1 */}
                        <div className="w-4 h-4 md:w-6 md:h-6 border-y-2 border-white"></div>
                    </div>
                    <div className="w-8 h-8 md:w-12 md:h-12 border-2 border-white flex items-center justify-center text-white">
                        {/* Dummy icon 2 */}
                        <div className="w-4 h-4 md:w-6 md:h-6 border-2 border-white rounded-sm"></div>
                    </div>
                    <div className="w-8 h-8 md:w-12 md:h-12 border-2 border-white rounded-full flex items-center justify-center text-white font-bold text-[8px] md:text-xs">
                        ok
                    </div>
                    <div className="text-white font-black leading-none text-xl md:text-3xl" style={{ textShadow: '0 0 2px rgba(0,0,0,0.1)' }}>
                        <span className="opacity-80">COW'OK</span><br />
                        <span className="opacity-60">COLLECTION</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
