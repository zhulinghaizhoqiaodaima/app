import { Loader2 } from 'lucide-react';

interface WelcomeOverlayProps {
    isLoading?: boolean;
}

export function WelcomeOverlay({ isLoading }: WelcomeOverlayProps) {
    return (
        <div className="absolute inset-0 z-40 bg-[#E6E6E6] flex items-center justify-center overflow-hidden">
            {/* The wrapper that scales perfectly to fit the screen and match the 9:16 poster */}
            <div className="relative w-full h-full flex items-center justify-center">
                <img
                    src="/images/引导页.jpg"
                    alt="引导页"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />

                {/* Animated Hands layer (OpenCV precise overlay coordinates) */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                    {/* hand1: large hand overlapping bottom area */}
                    <div className="absolute animate-swing" style={{ left: '24.14%', top: '48.53%', width: '69.90%' }}>
                        <img src="/icons/hand1.png" alt="hand1" className="w-full h-auto drop-shadow-2xl" />
                    </div>
                    {/* hand2: bottom left of 包 */}
                    <div className="absolute animate-swing" style={{ left: '4.79%', top: '17.18%', width: '7.48%' }}>
                        <img src="/icons/hand2.png" alt="hand2" className="w-full h-auto" />
                    </div>
                    {/* hand3: right below 游 */}
                    <div className="absolute animate-swing" style={{ left: '57.50%', top: '39.55%', width: '7.21%' }}>
                        <img src="/icons/hand3.png" alt="hand3" className="w-full h-auto" />
                    </div>
                    {/* hand4: bottom right of 戏 */}
                    <div className="absolute animate-swing" style={{ left: '82.76%', top: '33.32%', width: '7.43%' }}>
                        <img src="/icons/hand4.png" alt="hand4" className="w-full h-auto" />
                    </div>
                </div>
            </div>
            {isLoading && (
                <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                    <Loader2 className="w-16 h-16 text-[#F4C522] animate-spin mb-4" />
                    <p className="text-white font-bold tracking-widest text-xl drop-shadow-md">LOADING MODEL...</p>
                </div>
            )}
        </div>
    );
}
