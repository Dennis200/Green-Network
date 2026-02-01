
import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, Check } from 'lucide-react';

interface TourStep {
    target: string;
    title: string;
    description: string;
    position: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTourProps {
    refs: {
        feed: React.RefObject<HTMLButtonElement | null>;
        marketplace: React.RefObject<HTMLButtonElement | null>;
        create: React.RefObject<HTMLButtonElement | null>;
        communities: React.RefObject<HTMLButtonElement | null>;
        profile: React.RefObject<HTMLButtonElement | null>;
    };
    onComplete: () => void;
}

const STEPS: TourStep[] = [
    { 
        target: 'feed', 
        title: 'The Pulse', 
        description: 'Your uncensored feed. Connect with growers and enthusiasts worldwide without fear of bans.', 
        position: 'top' 
    },
    { 
        target: 'marketplace', 
        title: 'The Stash', 
        description: 'Buy, sell, and trade genetics, equipment, and glass. Peer-to-peer and secure.', 
        position: 'top' 
    },
    { 
        target: 'create', 
        title: 'Spark It', 
        description: 'Share your harvest, go live, start a link-up, or create an Ad Campaign from the main menu.', 
        position: 'top' 
    },
    { 
        target: 'communities', 
        title: 'Your Tribe', 
        description: 'Find local sesh groups, master grower circles, and invite-only clubs.', 
        position: 'top' 
    },
    { 
        target: 'profile', 
        title: 'Your Identity', 
        description: 'Build your reputation. Track your grow history and manage your ads via the sidebar.', 
        position: 'top' 
    }
];

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ refs, onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [spotlightStyle, setSpotlightStyle] = useState<React.CSSProperties>({});
    const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
    const [isVisible, setIsVisible] = useState(false);

    const stepData = STEPS[currentStep];

    const updatePosition = () => {
        // Map step target string to actual ref
        const targetRef = refs[stepData.target as keyof typeof refs];
        
        if (targetRef && targetRef.current) {
            const rect = targetRef.current.getBoundingClientRect();
            const padding = 8; // Extra space around the element
            
            // Spotlight Position
            setSpotlightStyle({
                top: rect.top - padding,
                left: rect.left - padding,
                width: rect.width + (padding * 2),
                height: rect.height + (padding * 2),
                opacity: 1
            });

            // Tooltip Position Logic
            // Default to showing above for bottom nav items
            let tooltipTop = rect.top - 200; // Rough estimate above
            let tooltipLeft = rect.left + (rect.width / 2) - 160; // Center horizontally (width 320px)

            // Desktop Adjustment (Sidebar is on the left)
            if (window.innerWidth >= 768) {
                tooltipTop = rect.top;
                tooltipLeft = rect.right + 20; // Show to the right of sidebar
            } else {
                // Mobile adjustment to keep onscreen
                if (tooltipLeft < 10) tooltipLeft = 10;
                if (tooltipLeft + 320 > window.innerWidth) tooltipLeft = window.innerWidth - 330;
                
                // If element is at top (unlikely for main nav but good safety), flip to bottom
                if (rect.top < 200) {
                    tooltipTop = rect.bottom + 20;
                }
            }

            setTooltipStyle({
                top: tooltipTop,
                left: tooltipLeft,
                position: 'fixed'
            });
            setIsVisible(true);
        }
    };

    useEffect(() => {
        // Small delay to ensure DOM is ready and transitions look good
        setTimeout(updatePosition, 100);
        window.addEventListener('resize', updatePosition);
        return () => window.removeEventListener('resize', updatePosition);
    }, [currentStep, refs]);

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setIsVisible(false); // Fade out briefly
            setTimeout(() => setCurrentStep(prev => prev + 1), 200);
        } else {
            handleFinish();
        }
    };

    const handleFinish = () => {
        setIsVisible(false);
        setTimeout(onComplete, 300);
    };

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden pointer-events-none">
            {/* Backdrop with a hole (using clip-path is hard dynamically, using stacked divs or huge border is easier) 
                Alternative: Just a dark background and a high z-index glowing box for the "hole" visual.
            */}
            <div className="absolute inset-0 bg-black/80 transition-opacity duration-500 pointer-events-auto" />

            {/* The Spotlight Glow Ring */}
            <div 
                className="absolute transition-all duration-500 ease-in-out rounded-2xl border-2 border-gsn-green shadow-[0_0_30px_rgba(74,222,128,0.5),inset_0_0_20px_rgba(74,222,128,0.2)] pointer-events-none z-[101]"
                style={spotlightStyle}
            />

            {/* The Explanation Card */}
            <div 
                className={`w-[320px] bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl transition-all duration-500 ease-out z-[102] pointer-events-auto flex flex-col gap-4 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
                style={tooltipStyle}
            >
                <div className="flex justify-between items-start">
                    <div>
                        <span className="text-gsn-green text-xs font-bold uppercase tracking-widest">
                            Step {currentStep + 1}/{STEPS.length}
                        </span>
                        <h3 className="text-2xl font-black text-white mt-1 leading-none">{stepData.title}</h3>
                    </div>
                    <button 
                        onClick={handleFinish}
                        className="text-zinc-500 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                <p className="text-zinc-300 text-sm leading-relaxed">
                    {stepData.description}
                </p>

                <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/5">
                    <div className="flex gap-1">
                        {STEPS.map((_, idx) => (
                            <div 
                                key={idx} 
                                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-6 bg-gsn-green' : 'w-1.5 bg-zinc-700'}`}
                            />
                        ))}
                    </div>
                    
                    <button 
                        onClick={handleNext}
                        className="bg-white text-black px-6 py-2 rounded-full font-bold text-sm hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                    >
                        {currentStep === STEPS.length - 1 ? 'Get Started' : 'Next'}
                        {currentStep === STEPS.length - 1 ? <Check size={16} /> : <ChevronRight size={16} />}
                    </button>
                </div>
            </div>
        </div>
    );
};
