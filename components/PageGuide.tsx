
import React, { useState, useEffect } from 'react';
import { X, ChevronRight, Check, Sparkles } from 'lucide-react';

interface Step {
    title: string;
    description: string;
    icon?: React.ReactNode;
}

interface PageGuideProps {
    pageKey: string;
    steps: Step[];
    forceShow?: boolean;
}

const PageGuide: React.FC<PageGuideProps> = ({ pageKey, steps, forceShow = false }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const hasSeen = localStorage.getItem(`guide_${pageKey}`);
        if (!hasSeen || forceShow) {
            // Small delay to allow page transition to finish before showing modal
            const timer = setTimeout(() => setIsVisible(true), 500);
            return () => clearTimeout(timer);
        }
    }, [pageKey, forceShow]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleClose();
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem(`guide_${pageKey}`, 'true');
    };

    if (!isVisible) return null;

    const step = steps[currentStep];

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-zinc-900 border border-white/10 w-full max-w-sm rounded-[2rem] p-6 shadow-2xl relative overflow-hidden flex flex-col gap-6 animate-in slide-in-from-bottom-8 duration-500">
                
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gsn-green/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                {/* Header */}
                <div className="flex justify-between items-start z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center text-gsn-green">
                            {step.icon || <Sparkles size={20} />}
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">
                                Guide {currentStep + 1}/{steps.length}
                            </span>
                            <h3 className="text-xl font-black text-white leading-none mt-1">{step.title}</h3>
                        </div>
                    </div>
                    <button onClick={handleClose} className="text-zinc-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="min-h-[80px] z-10">
                    <p className="text-zinc-300 text-sm leading-relaxed font-medium">
                        {step.description}
                    </p>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5 z-10">
                    <div className="flex gap-1.5">
                        {steps.map((_, idx) => (
                            <div 
                                key={idx} 
                                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-6 bg-gsn-green' : 'w-1.5 bg-zinc-700'}`}
                            />
                        ))}
                    </div>
                    
                    <button 
                        onClick={handleNext}
                        className="bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                    >
                        {currentStep === steps.length - 1 ? 'Got it' : 'Next'}
                        {currentStep === steps.length - 1 ? <Check size={16} /> : <ChevronRight size={16} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PageGuide;
