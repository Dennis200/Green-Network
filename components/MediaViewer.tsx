
import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface MediaViewerProps {
    media: string[];
    initialIndex: number;
    onClose: () => void;
}

const MediaViewer: React.FC<MediaViewerProps> = ({ media, initialIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const startPos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    }, [currentIndex]);

    const handleNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (currentIndex < media.length - 1) setCurrentIndex(prev => prev + 1);
    };

    const handlePrev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
    };

    const toggleZoom = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (scale === 1) {
            setScale(2.5);
        } else {
            setScale(1);
            setPosition({ x: 0, y: 0 });
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (scale > 1) {
            setIsDragging(true);
            startPos.current = { x: e.clientX - position.x, y: e.clientY - position.y };
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && scale > 1) {
            e.preventDefault();
            setPosition({
                x: e.clientX - startPos.current.x,
                y: e.clientY - startPos.current.y
            });
        }
    };

    const handleMouseUp = () => setIsDragging(false);

    const isVideo = (url: string) => {
        return url.match(/\.(mp4|webm|mov)$/i) || url.includes('video') || url.includes('mp4'); 
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center animate-in fade-in duration-300">
            {/* Controls */}
            <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-black/50 rounded-full text-white hover:bg-white/20 backdrop-blur-sm">
                <X size={24} />
            </button>

            {media.length > 1 && (
                <>
                    <button 
                        onClick={handlePrev} 
                        className={`absolute left-4 z-50 p-2 bg-black/50 rounded-full text-white backdrop-blur-sm transition-opacity ${currentIndex === 0 ? 'opacity-0 pointer-events-none' : 'hover:bg-white/20'}`}
                    >
                        <ChevronLeft size={32} />
                    </button>
                    <button 
                        onClick={handleNext} 
                        className={`absolute right-4 z-50 p-2 bg-black/50 rounded-full text-white backdrop-blur-sm transition-opacity ${currentIndex === media.length - 1 ? 'opacity-0 pointer-events-none' : 'hover:bg-white/20'}`}
                    >
                        <ChevronRight size={32} />
                    </button>
                </>
            )}

            {/* Media Container */}
            <div 
                className="relative w-full h-full flex items-center justify-center overflow-hidden"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={onClose} // Clicking background closes
            >
                <div onClick={(e) => e.stopPropagation()} className="relative">
                    {isVideo(media[currentIndex]) ? (
                        <video 
                            src={media[currentIndex]} 
                            controls 
                            autoPlay 
                            className="max-h-screen max-w-full"
                        />
                    ) : (
                        <img 
                            src={media[currentIndex]} 
                            alt="Preview" 
                            className="max-h-screen max-w-full object-contain transition-transform duration-200 ease-out select-none"
                            style={{ 
                                transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                                cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
                            }}
                            onDoubleClick={toggleZoom}
                        />
                    )}
                </div>
            </div>
            
            {/* Index Indicator */}
            {media.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-1.5 rounded-full text-white text-sm font-bold backdrop-blur-md border border-white/10">
                    {currentIndex + 1} / {media.length}
                </div>
            )}
        </div>
    );
};

export default MediaViewer;
