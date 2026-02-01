
import React, { useEffect, useState, useRef } from 'react';

interface ActionSheetProps {
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
}

export const ActionSheet: React.FC<ActionSheetProps> = ({ onClose, children, title }) => {
    const [translateY, setTranslateY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const startY = useRef(0);
    const sheetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Lock body scroll to prevent background scrolling
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    const handleClose = () => {
        setIsClosing(true);
        // Wait for animation to finish before calling parent onClose
        setTimeout(onClose, 300);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        // Allow scrolling content if not at top
        // But for this simple implementation, we assume handle drag mostly on header/empty space
        // or if we strictly check scrollTop
        startY.current = e.touches[0].clientY;
        setIsDragging(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        const currentY = e.touches[0].clientY;
        const diff = currentY - startY.current;
        
        // Only allow dragging down
        if (diff > 0) {
            // Prevent default to stop scrolling if we are dragging the sheet
            if (e.cancelable) e.preventDefault(); 
            setTranslateY(diff);
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        // Threshold to close
        if (translateY > 100) {
            handleClose();
        } else {
            setTranslateY(0);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex justify-center items-end" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div 
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`} 
                onClick={handleClose}
            />
            
            {/* Sheet */}
            <div 
                ref={sheetRef}
                className={`w-full max-w-md bg-[#18181b] rounded-t-[2rem] border-t border-white/10 shadow-2xl relative z-10 p-6 pb-safe transition-transform duration-300 ease-out ${isClosing ? 'translate-y-full' : 'translate-y-0'}`}
                style={{ 
                    transform: isClosing ? 'translateY(100%)' : `translateY(${translateY}px)`,
                    transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)' 
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Drag Handle */}
                <div className="w-full flex justify-center pt-0 pb-6 cursor-grab active:cursor-grabbing">
                    <div className="w-12 h-1.5 bg-zinc-700 rounded-full opacity-50" />
                </div>

                {title && (
                    <div className="text-center mb-6">
                        <h3 className="font-bold text-white text-lg">{title}</h3>
                    </div>
                )}

                <div className="space-y-4">
                    {children}
                </div>
            </div>
        </div>
    );
};
