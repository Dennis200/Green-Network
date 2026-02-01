
import React, { useState, useEffect, useCallback } from 'react';
import { X, MoreHorizontal, Heart, Send } from 'lucide-react';
import { Vibe } from '../types';

interface StoryViewerProps {
  stories: Vibe[];
  startIndex: number;
  onClose: () => void;
  onStorySeen: (storyId: string) => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({ stories, startIndex, onClose, onStorySeen }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentStory = stories[currentIndex];
  const DURATION = 5000; // 5 seconds per story

  const handleNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    } else {
      // Reached start, maybe loop or just stay? Let's stay or close if preferred. 
      // Typically tapping left on first story resets it.
      setProgress(0);
    }
  }, [currentIndex]);

  // Mark as seen when story opens
  useEffect(() => {
    if (currentStory && !currentStory.isSeen) {
      onStorySeen(currentStory.id);
    }
  }, [currentIndex, currentStory, onStorySeen]);

  // Timer Logic
  useEffect(() => {
    if (isPaused) return;

    const interval = 100; // Update every 100ms
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

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center animate-in fade-in duration-200">
      <div className="relative w-full h-full md:max-w-md md:h-[90vh] md:rounded-2xl overflow-hidden bg-zinc-900 shadow-2xl">
        
        {/* Background Blur Effect (if image aspect ratio leaves gaps) */}
        <div 
          className="absolute inset-0 bg-cover bg-center blur-3xl opacity-50"
          style={{ backgroundImage: `url(${currentStory.media})` }}
        />

        {/* Main Image */}
        <img 
          src={currentStory.media} 
          alt="Story" 
          className="absolute inset-0 w-full h-full object-cover md:object-contain z-10" 
        />

        {/* Overlay Gradients */}
        <div className="absolute inset-0 z-20 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none" />

        {/* Progress Bars */}
        <div className="absolute top-4 left-2 right-2 z-30 flex gap-1 h-1">
          {stories.map((story, index) => (
            <div key={story.id} className="flex-1 bg-white/30 rounded-full h-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{ 
                  width: index < currentIndex ? '100%' : index === currentIndex ? `${progress}%` : '0%' 
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-8 left-4 right-4 z-30 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <img src={currentStory.user.avatar} className="w-8 h-8 rounded-full border border-white/20" alt={currentStory.user.name} />
                <div className="flex flex-col">
                     <span className="text-white font-bold text-sm flex items-center gap-1">
                        {currentStory.user.name}
                        {currentStory.user.verified && <span className="text-gsn-green text-xs">✓</span>}
                     </span>
                     <span className="text-white/70 text-xs">{currentStory.timestamp}</span>
                </div>
            </div>
            <div className="flex gap-4">
                <button className="text-white/80 hover:text-white"><MoreHorizontal size={24} /></button>
                <button onClick={onClose} className="text-white/80 hover:text-white"><X size={24} /></button>
            </div>
        </div>

        {/* Navigation Touch Areas */}
        <div className="absolute inset-0 z-20 flex">
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

        {/* Footer Actions */}
        <div className="absolute bottom-4 left-4 right-4 z-30 flex items-center gap-4">
            <div className="flex-1 relative">
                <input 
                    type="text" 
                    placeholder="Send message" 
                    className="w-full bg-transparent border border-white/30 rounded-full py-2.5 pl-4 pr-10 text-white placeholder-white/70 focus:outline-none focus:border-white focus:bg-black/20 backdrop-blur-md transition-all"
                />
            </div>
            <button className="p-2 text-white/90 hover:text-gsn-green transition-colors"><Heart size={28} /></button>
            <button className="p-2 text-white/90 hover:text-gsn-green transition-colors"><Send size={28} /></button>
        </div>

      </div>
    </div>
  );
};

export default StoryViewer;
