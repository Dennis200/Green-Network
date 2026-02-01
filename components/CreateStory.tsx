import React, { useState, useRef } from 'react';
import { X, Type, Image, Settings, Palette, ChevronLeft } from 'lucide-react';
import { CURRENT_USER } from '../constants';

interface CreateStoryProps {
    onExit: () => void;
    onPost: () => void;
}

const CreateStory: React.FC<CreateStoryProps> = ({ onExit, onPost }) => {
    const [mode, setMode] = useState<'selection' | 'text' | 'media'>('selection');
    const [text, setText] = useState('');
    const [bgColor, setBgColor] = useState('bg-gradient-to-br from-blue-600 to-purple-600');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const gradients = [
        'bg-gradient-to-br from-blue-600 to-purple-600',
        'bg-gradient-to-br from-red-500 to-orange-500',
        'bg-gradient-to-br from-green-500 to-teal-500',
        'bg-gradient-to-br from-pink-500 to-rose-500',
        'bg-zinc-800'
    ];

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(URL.createObjectURL(file));
            setMode('media');
        }
    };

    if (mode === 'selection') {
        return (
            <div className="min-h-screen bg-black flex flex-col">
                {/* Header */}
                <div className="p-4 flex justify-between items-center bg-zinc-900 border-b border-white/10">
                    <button onClick={onExit} className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white">
                        <X size={20} />
                    </button>
                    <h2 className="font-bold text-white text-lg">Create Story</h2>
                    <button className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white">
                        <Settings size={20} />
                    </button>
                </div>

                {/* Selection Cards */}
                <div className="flex-1 flex flex-col md:flex-row gap-4 p-4 items-center justify-center max-w-4xl mx-auto w-full">
                    {/* Text Card */}
                    <div 
                        onClick={() => setMode('text')}
                        className="flex-1 w-full h-64 md:h-96 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:scale-[1.02] transition-transform shadow-2xl relative overflow-hidden group"
                    >
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Type size={32} className="text-black" />
                        </div>
                        <span className="font-bold text-white text-lg">Create a Text Story</span>
                    </div>

                    {/* Media Card */}
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 w-full h-64 md:h-96 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:scale-[1.02] transition-transform shadow-2xl relative overflow-hidden group"
                    >
                         <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Image size={32} className="text-black" />
                        </div>
                        <span className="font-bold text-white text-lg">Create a Photo Story</span>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleFileSelect}
                        />
                    </div>
                </div>
            </div>
        );
    }

    if (mode === 'text') {
        return (
            <div className={`min-h-screen flex flex-col relative ${bgColor}`}>
                <div className="p-4 flex justify-between items-center z-20">
                    <button onClick={() => setMode('selection')} className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white">
                        <ChevronLeft size={24} />
                    </button>
                    <button onClick={onPost} className="px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-colors">
                        Share to Story
                    </button>
                </div>

                <div className="flex-1 flex items-center justify-center p-8">
                    <textarea 
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Start typing..."
                        className="w-full h-full bg-transparent text-white text-center text-3xl md:text-5xl font-bold placeholder-white/50 focus:outline-none resize-none"
                        autoFocus
                    />
                </div>

                <div className="p-6 pb-safe z-20 bg-gradient-to-t from-black/50 to-transparent">
                    <div className="flex items-center gap-2 mb-2">
                        <Palette size={16} className="text-white" />
                        <span className="text-xs font-bold text-white uppercase">Backgrounds</span>
                    </div>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                        {gradients.map(grad => (
                            <button 
                                key={grad}
                                onClick={() => setBgColor(grad)}
                                className={`w-8 h-8 rounded-full border-2 ${grad} ${bgColor === grad ? 'border-white scale-110' : 'border-transparent'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (mode === 'media') {
        return (
            <div className="min-h-screen bg-black flex flex-col relative">
                <div className="p-4 flex justify-between items-center absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/60 to-transparent">
                     <button onClick={() => { setMode('selection'); setSelectedImage(null); }} className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md">
                        <ChevronLeft size={24} />
                    </button>
                    <button onClick={onPost} className="px-6 py-2 bg-gsn-green text-black font-bold rounded-full hover:bg-green-400 transition-colors shadow-lg">
                        Share
                    </button>
                </div>

                <div className="flex-1 flex items-center justify-center bg-zinc-900">
                    {selectedImage && (
                        <img src={selectedImage} alt="Story Preview" className="max-h-screen w-full object-contain" />
                    )}
                </div>
                
                 <div className="absolute bottom-8 left-4 right-4 z-20">
                    <div className="flex items-center gap-2">
                        <img src={CURRENT_USER.avatar} className="w-10 h-10 rounded-full border-2 border-white" alt="Me" />
                        <p className="text-white text-sm font-bold shadow-black drop-shadow-md">Your Story</p>
                    </div>
                 </div>
            </div>
        )
    }

    return null;
}

export default CreateStory;