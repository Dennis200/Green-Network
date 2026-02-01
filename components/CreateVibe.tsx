
import React, { useState, useRef, useEffect } from 'react';
import { X, Type, Image, Camera, Palette, ChevronLeft, Smile, Check, ArrowRight, Music, Zap, Video } from 'lucide-react';
import { CURRENT_USER } from '../constants';
import { VibeOverlay, User } from '../types';
import { createVibe } from '../services/dataService';
import { uploadToCloudinary } from '../services/cloudinary';
import { auth } from '../services/firebase';
import { subscribeToUserProfile } from '../services/userService';

interface CreateVibeProps {
    onExit: () => void;
    onPost: () => void;
}

const CreateVibe: React.FC<CreateVibeProps> = ({ onExit, onPost }) => {
    const [step, setStep] = useState<'select' | 'capture' | 'edit' | 'caption'>('select');
    const [type, setType] = useState<'text' | 'media'>('media');
    const [media, setMedia] = useState<string | null>(null);
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [bgColor, setBgColor] = useState('bg-gradient-to-br from-purple-600 to-blue-600');
    const [overlays, setOverlays] = useState<VibeOverlay[]>([]);
    const [caption, setCaption] = useState('');
    const [activeFont, setActiveFont] = useState<'sans' | 'serif' | 'mono'>('sans');
    const [isPosting, setIsPosting] = useState(false);
    const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (auth.currentUser) {
            subscribeToUserProfile(auth.currentUser.uid, (user) => {
                if (user) setCurrentUser(user);
            });
        }
    }, []);

    // --- STEP 1: SELECTION ---
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setMediaFile(file);
            setMedia(URL.createObjectURL(file));
            setType('media');
            setStep('edit');
        }
    };

    const handleTextMode = () => {
        setType('text');
        setStep('edit');
        // Add an initial text overlay
        addOverlay('text', 'Tap to type');
    };

    // --- STEP 2: EDITING ---
    const addOverlay = (type: 'text' | 'emoji', content: string) => {
        setOverlays([...overlays, {
            id: Date.now().toString(),
            type,
            content,
            x: 50,
            y: 50,
            style: 'neon',
            scale: 1,
            color: '#ffffff'
        }]);
    };

    const handlePostVibe = async () => {
        setIsPosting(true);
        try {
            let mediaUrl = media || '';
            
            if (type === 'media' && mediaFile) {
                mediaUrl = await uploadToCloudinary(mediaFile);
            }

            await createVibe({
                media: mediaUrl,
                mediaType: type === 'text' ? 'text' : 'image', // simplified
                background: type === 'text' ? bgColor : undefined,
                overlays,
                caption
            }, currentUser);
            onPost();
        } catch (e) {
            console.error(e);
            alert("Failed to post vibe.");
        } finally {
            setIsPosting(false);
        }
    };

    // --- RENDERERS ---

    if (step === 'select') {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
                <button onClick={onExit} className="absolute top-6 left-6 p-2 bg-zinc-900 rounded-full text-white hover:bg-zinc-800">
                    <X size={24} />
                </button>
                
                <h1 className="text-4xl font-black text-white mb-12 tracking-tighter">CREATE A <span className="text-gsn-green">VIBE</span></h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-[4/5] bg-zinc-900 rounded-3xl border border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-gsn-green hover:bg-zinc-800 transition-all group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-gsn-green/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform z-10">
                            <Camera size={32} className="text-gsn-green" />
                        </div>
                        <span className="text-xl font-bold text-white z-10">Media</span>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileSelect} />
                    </div>

                    <div 
                        onClick={handleTextMode}
                        className="aspect-[4/5] bg-gradient-to-br from-purple-900 to-black rounded-3xl border border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition-all group relative overflow-hidden"
                    >
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform z-10">
                            <Type size={32} className="text-purple-400" />
                        </div>
                        <span className="text-xl font-bold text-white z-10">Text Mode</span>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'edit') {
        return (
            <div className={`min-h-screen flex flex-col relative overflow-hidden ${type === 'text' ? bgColor : 'bg-black'}`}>
                {/* Media Layer */}
                {type === 'media' && media && (
                    <img src={media} className="absolute inset-0 w-full h-full object-cover" alt="Vibe Media" />
                )}

                {/* Overlays Layer */}
                <div className="absolute inset-0 pointer-events-none">
                    {overlays.map((overlay, idx) => (
                        <div 
                            key={overlay.id}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move pointer-events-auto"
                            style={{ 
                                left: `${overlay.x}%`, 
                                top: `${overlay.y}%`,
                                fontSize: overlay.type === 'emoji' ? '4rem' : '2rem'
                            }}
                            draggable
                            onDragEnd={(e) => {
                                // Basic Drag Logic Simulation
                                const newOverlays = [...overlays];
                                newOverlays[idx].x = (e.clientX / window.innerWidth) * 100;
                                newOverlays[idx].y = (e.clientY / window.innerHeight) * 100;
                                setOverlays(newOverlays);
                            }}
                        >
                            {overlay.type === 'text' ? (
                                <span 
                                    className={`font-bold text-white drop-shadow-lg ${overlay.style === 'neon' ? 'neon-text' : ''}`}
                                    style={{ fontFamily: activeFont === 'mono' ? 'monospace' : activeFont === 'serif' ? 'serif' : 'sans-serif' }}
                                    contentEditable
                                    suppressContentEditableWarning
                                >
                                    {overlay.content}
                                </span>
                            ) : (
                                <span>{overlay.content}</span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Controls Overlay */}
                <div className="absolute inset-0 flex flex-col justify-between p-6 z-20 pointer-events-none">
                    <div className="flex justify-between items-start pointer-events-auto">
                        <button onClick={() => setStep('select')} className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-white/20">
                            <ChevronLeft size={24} />
                        </button>
                        <div className="flex flex-col gap-4">
                            <button 
                                onClick={() => addOverlay('text', 'Text')}
                                className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-white/20"
                            >
                                <Type size={24} />
                            </button>
                            <button 
                                onClick={() => addOverlay('emoji', '🔥')}
                                className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-white/20"
                            >
                                <Smile size={24} />
                            </button>
                            {type === 'text' && (
                                <button 
                                    onClick={() => setBgColor(prev => prev.includes('purple') ? 'bg-gradient-to-tr from-green-400 to-blue-500' : 'bg-gradient-to-br from-purple-600 to-blue-600')}
                                    className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-white/20"
                                >
                                    <Palette size={24} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end pointer-events-auto">
                        <button 
                            onClick={() => setStep('caption')}
                            className="px-8 py-4 bg-white text-black font-black rounded-full shadow-xl flex items-center gap-2 hover:bg-zinc-200 transition-all transform hover:scale-105"
                        >
                            Next <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'caption') {
        return (
            <div className="min-h-screen bg-black flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-4 border-b border-white/10 bg-zinc-900 flex items-center gap-4">
                    <button onClick={() => setStep('edit')}><ChevronLeft className="text-white" /></button>
                    <h3 className="font-bold text-white">Final Touches</h3>
                </div>

                <div className="flex-1 p-6 flex flex-col md:flex-row gap-8 max-w-4xl mx-auto w-full">
                    {/* Preview */}
                    <div className="w-full md:w-1/3 aspect-[9/16] rounded-2xl overflow-hidden relative border border-white/10 shadow-2xl mx-auto">
                        {type === 'text' ? (
                            <div className={`w-full h-full ${bgColor} flex items-center justify-center p-4`}>
                                {overlays.map(o => (
                                    <div key={o.id} className="text-white font-bold text-2xl text-center">{o.content}</div>
                                ))}
                            </div>
                        ) : (
                            <img src={media!} className="w-full h-full object-cover" />
                        )}
                        {/* Overlay Preview (Static for simplicity) */}
                        <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
                    </div>

                    {/* Inputs */}
                    <div className="flex-1 space-y-6">
                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Add a Caption</label>
                            <textarea 
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder="Describe the vibe..."
                                className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gsn-green h-32 resize-none"
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl border border-white/5">
                                <span className="font-bold text-white flex items-center gap-3"><Zap size={18} className="text-yellow-400"/> Save to Archive</span>
                                <div className="w-12 h-6 bg-gsn-green rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-black rounded-full"></div></div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl border border-white/5">
                                <span className="font-bold text-white flex items-center gap-3"><Music size={18} className="text-pink-400"/> Add Music</span>
                                <span className="text-zinc-500 text-xs">None Selected</span>
                            </div>
                        </div>

                        <button 
                            onClick={handlePostVibe}
                            disabled={isPosting}
                            className="w-full py-4 bg-gsn-green text-black font-black rounded-xl hover:bg-green-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                        >
                            {isPosting ? 'Posting Vibe...' : 'Share Vibe'}
                            {!isPosting && <Check size={20} />}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return null;
}

export default CreateVibe;
