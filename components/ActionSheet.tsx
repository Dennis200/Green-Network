
import React, { useEffect, useState, useRef } from 'react';

interface ActionSheetProps {
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
}

export const ActionSheet: React.FC<ActionSheetProps> = ({ onClose, children, title }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [translateY, setTranslateY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const startY = useRef(0);
    const sheetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Lock body scroll to prevent background scrolling
        document.body.style.overflow = 'hidden';
        
        // Trigger enter animation
        requestAnimationFrame(() => setIsVisible(true));
        
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        // Wait for animation to finish before calling parent onClose
        setTimeout(onClose, 300);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        startY.current = e.touches[0].clientY;
        setIsDragging(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        const currentY = e.touches[0].clientY;
        const diff = currentY - startY.current;
        
        // Only allow dragging down
        if (diff > 0) {
            if (e.cancelable) e.preventDefault(); 
            setTranslateY(diff);
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        // Threshold to close (dragged down by more than 100px)
        if (translateY > 100) {
            handleClose();
        } else {
            setTranslateY(0);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex justify-center items-end" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div 
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`} 
                onClick={handleClose}
            />
            
            {/* Sheet */}
            <div 
                ref={sheetRef}
                className={`w-full max-w-md bg-zinc-900 rounded-t-[2rem] border-t border-white/10 shadow-2xl relative z-10 p-6 pb-12 transition-transform duration-300 ease-out`}
                style={{ 
                    transform: isVisible ? `translateY(${translateY}px)` : 'translateY(100%)',
                    transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)' 
                }}
            >
                {/* Drag Handle */}
                <div 
                    className="w-full flex justify-center pt-0 pb-6 cursor-grab active:cursor-grabbing touch-none"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
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
