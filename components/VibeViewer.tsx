
import React, { useState, useEffect, useCallback } from 'react';
import { X, MoreHorizontal, Heart, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import { Vibe } from '../types';

interface VibeViewerProps {
  vibes: Vibe[]; // Pre-filtered list for a specific user
  initialIndex: number;
  onClose: () => void;
}

const VibeViewer: React.FC<VibeViewerProps> = ({ vibes, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentVibe = vibes[currentIndex];
  const DURATION = 5000; // 5 seconds per vibe

  const handleNext = useCallback(() => {
    if (currentIndex < vibes.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    } else {
      onClose(); // Close if end of user's vibes
    }
  }, [currentIndex, vibes.length, onClose]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    }
  }, [currentIndex]);

  // Timer Logic
  useEffect(() => {
    if (isPaused) return;

    const interval = 50; 
    const step = 100 / (DURATION / interval);

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused, handleNext]);

  if (!currentVibe) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center animate-in fade-in duration-200">
      
      {/* Desktop Close Button */}
      <button onClick={onClose} className="absolute top-6 right-6 text-white hover:text-zinc-300 hidden md:block z-50">
          <X size={32} />
      </button>

      <div className="relative w-full h-full md:max-w-[400px] md:h-[90vh] md:rounded-3xl overflow-hidden bg-zinc-900 shadow-2xl border border-white/10">
        
        {/* Background Layer (Blurred for images) */}
        {currentVibe.mediaType === 'image' && (
             <div 
                className="absolute inset-0 bg-cover bg-center blur-2xl opacity-30"
                style={{ backgroundImage: `url(${currentVibe.media})` }}
             />
        )}

        {/* Content Layer */}
        {currentVibe.mediaType === 'image' && (
            <img 
              src={currentVibe.media} 
              alt="Vibe" 
              className="absolute inset-0 w-full h-full object-cover z-10" 
            />
        )}
        
        {currentVibe.mediaType === 'text' && (
            <div className={`absolute inset-0 z-10 flex items-center justify-center p-8 ${currentVibe.background || 'bg-zinc-800'}`}>
                {/* Text vibes usually have overlays, handled below */}
            </div>
        )}

        {/* Overlays Layer (Text/Emoji) */}
        <div className="absolute inset-0 z-20 pointer-events-none">
            {currentVibe.overlays.map(overlay => (
                <div 
                    key={overlay.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{ 
                        left: `${overlay.x}%`, 
                        top: `${overlay.y}%`,
                        color: overlay.color || 'white'
                    }}
                >
                    {overlay.type === 'text' ? (
                        <span className={`font-bold text-2xl drop-shadow-md text-center block ${overlay.style === 'neon' ? 'neon-text' : ''}`}>{overlay.content}</span>
                    ) : (
                        <span className="text-6xl drop-shadow-md">{overlay.content}</span>
                    )}
                </div>
            ))}
        </div>

        {/* UI Overlay Gradient */}
        <div className="absolute inset-0 z-30 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />

        {/* Progress Bars */}
        <div className="absolute top-4 left-3 right-3 z-40 flex gap-1.5 h-1">
          {vibes.map((vibe, index) => (
            <div key={vibe.id} className="flex-1 bg-white/30 rounded-full h-full overflow-hidden backdrop-blur-sm">
              <div 
                className="h-full bg-white transition-all duration-100 ease-linear shadow-[0_0_5px_rgba(255,255,255,0.8)]"
                style={{ 
                  width: index < currentIndex ? '100%' : index === currentIndex ? `${progress}%` : '0%' 
                }}
              />
            </div>
          ))}
        </div>

        {/* Header User Info */}
        <div className="absolute top-8 left-4 right-4 z-40 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <img src={currentVibe.user.avatar} className="w-10 h-10 rounded-full border-2 border-white/20" alt={currentVibe.user.name} />
                <div className="flex flex-col">
                     <span className="text-white font-black text-sm flex items-center gap-1 shadow-black drop-shadow-md">
                        {currentVibe.user.name}
                        {currentVibe.user.verified && <span className="text-gsn-green text-xs">✓</span>}
                     </span>
                     <span className="text-white/80 text-xs font-medium drop-shadow-md">{currentVibe.timestamp}</span>
                </div>
            </div>
            <div className="flex gap-4 pointer-events-auto">
                <button className="text-white/80 hover:text-white"><MoreHorizontal size={24} /></button>
                <button onClick={onClose} className="text-white/80 hover:text-white md:hidden"><X size={24} /></button>
            </div>
        </div>

        {/* Navigation Touch Zones */}
        <div className="absolute inset-0 z-30 flex">
            <div 
                className="w-1/3 h-full" 
                onClick={handlePrev} 
                onMouseDown={() => setIsPaused(true)}
                onMouseUp={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
            />
            <div 
                className="w-2/3 h-full" 
                onClick={handleNext}
                onMouseDown={() => setIsPaused(true)}
                onMouseUp={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
            />
        </div>

        {/* Footer (Caption & Interactions) */}
        <div className="absolute bottom-0 left-0 right-0 z-40 p-4 pb-8 flex flex-col gap-4">
            {currentVibe.caption && (
                <p className="text-white text-sm font-medium drop-shadow-md line-clamp-2 px-2">
                    <span className="font-bold mr-2">{currentVibe.user.name}</span>
                    {currentVibe.caption}
                </p>
            )}
            
            <div className="flex items-center gap-3 pointer-events-auto">
                <div className="flex-1 relative">
                    <input 
                        type="text" 
                        placeholder="Reply to vibe..." 
                        className="w-full bg-white/10 border border-white/20 rounded-full py-3 pl-5 pr-10 text-white placeholder-white/70 focus:outline-none focus:bg-black/40 backdrop-blur-md transition-all text-sm font-bold"
                    />
                </div>
                <button className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-colors border border-white/10">
                    <Heart size={24} />
                </button>
                <button className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-colors border border-white/10">
                    <Send size={24} />
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default VibeViewer;
