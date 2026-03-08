import { Loader2 } from 'lucide-react';

interface WelcomeOverlayProps {
    isLoading?: boolean;
}

export function WelcomeOverlay({ isLoading }: WelcomeOverlayProps) {
    return (
        <div className="absolute inset-0 z-40 bg-[#E6E6E6] flex items-center justify-center overflow-hidden">
            <img
                src="/images/等待页.jpg"
                alt="等待页"
                className="w-full h-full object-contain pointer-events-none"
            />
            {isLoading && (
                <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                    <Loader2 className="w-16 h-16 text-[#F4C522] animate-spin mb-4" />
                    <p className="text-white font-bold tracking-widest text-xl drop-shadow-md">LOADING MODEL...</p>
                </div>
            )}
        </div>
    );
}
