
import React, { useState, useEffect, useRef } from 'react';
import { X, Users, MessageCircle, Heart, Send, Mic, Video, Settings, Zap, RotateCcw, Smile, Radio, Camera, Signal } from 'lucide-react';
import { CURRENT_USER, MOCK_USERS } from '../constants';

interface LiveStreamProps {
    onEnd: () => void;
}

const LiveStream: React.FC<LiveStreamProps> = ({ onEnd }) => {
    const [isLive, setIsLive] = useState(false);
    const [title, setTitle] = useState('');
    const [viewers, setViewers] = useState(0);
    const [comments, setComments] = useState<any[]>([]);
    const [duration, setDuration] = useState(0);
    const [chatInput, setChatInput] = useState('');
    const [cameraActive, setCameraActive] = useState(false);
    
    // Floating Hearts System
    const [hearts, setHearts] = useState<{id: number, left: string, animationDuration: string}[]>([]);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // --- CAMERA SETUP ---
    useEffect(() => {
        let mounted = true;

        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: 'user', width: { ideal: 1080 }, height: { ideal: 1920 } }, 
                    audio: true 
                });
                
                if (mounted) {
                    streamRef.current = stream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                    setCameraActive(true);
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                // Fallback or error handling could go here
            }
        };

        startCamera();

        return () => {
            mounted = false;
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Re-attach stream when switching view modes (Setup -> Live)
    useEffect(() => {
        if (videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
        }
    }, [isLive]);


    // --- SIMULATION LOGIC ---
    useEffect(() => {
        let interval: any;
        if (isLive) {
            interval = setInterval(() => {
                setDuration(prev => prev + 1);
                
                // Simulate viewer fluctuation
                setViewers(prev => {
                    const change = Math.floor(Math.random() * 5) - 2;
                    return Math.max(12, prev + change);
                });
                
                // Simulate random hearts from audience
                if (Math.random() > 0.6) {
                    triggerHeart();
                }

                // Simulate incoming comments
                if (Math.random() > 0.8) {
                    const randomUser = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
                    const randomComments = ["Dope setup! 🔥", "What strain is that?", "Sending vibes ✌️", "Show the nutrients", "Hi from Cali!", "Greens looks healthy 🌱", "Can I join?", "Top shelf only 😤"];
                    const text = randomComments[Math.floor(Math.random() * randomComments.length)];
                    
                    const newComment = {
                        id: Date.now(),
                        user: randomUser,
                        text: text
                    };
                    setComments(prev => [...prev, newComment]);
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isLive]);

    // Auto-scroll chat
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [comments]);

    const handleGoLive = () => {
        if (!title.trim()) {
            // Shake effect or error toast could go here
            return;
        }
        setIsLive(true);
        setViewers(12); // Start with some viewers
        
        // Add system message
        setComments([{
            id: Date.now(),
            system: true,
            text: "Welcome to the stream! Keep it chill. 🌿"
        }]);
    };

    const handleSendComment = () => {
        if (!chatInput.trim()) return;
        setComments(prev => [...prev, {
            id: Date.now(),
            user: CURRENT_USER,
            text: chatInput,
            isMe: true
        }]);
        setChatInput('');
    };

    const triggerHeart = () => {
        const id = Date.now() + Math.random();
        const left = Math.floor(Math.random() * 40) + 30 + '%'; // Randomize horizontal position slightly
        const duration = (Math.random() * 2 + 2) + 's'; // Random speed
        setHearts(prev => [...prev, { id, left, animationDuration: duration }]);
        
        // Cleanup heart after animation
        setTimeout(() => {
            setHearts(prev => prev.filter(h => h.id !== id));
        }, 4000);
    };

    const formatDuration = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // Common Video Component
    const CameraFeed = () => (
        <div className="absolute inset-0 bg-zinc-900 overflow-hidden">
            {cameraActive ? (
                <video 
                    ref={videoRef}
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover transform scale-105" // slight scale to cover edges
                />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500">
                    <Camera size={48} className="mb-4 opacity-50" />
                    <p>Accessing Camera...</p>
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none"></div>
        </div>
    );

    // --- SETUP SCREEN ---
    if (!isLive) {
        return (
            <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-300">
                <div className="flex-1 relative">
                    <CameraFeed />
                    
                    {/* Header */}
                    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start pt-safe z-20">
                        <button onClick={onEnd} className="p-3 bg-black/20 backdrop-blur-xl border border-white/10 rounded-full text-white hover:bg-black/40 transition-all">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Controls Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10">
                        <div className="w-full max-w-sm space-y-6">
                            <div className="bg-black/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 shadow-2xl">
                                <div className="flex items-center justify-center gap-2 mb-6">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                    <h2 className="text-xl font-bold text-white tracking-wide">GO LIVE</h2>
                                </div>
                                
                                <div className="space-y-5">
                                    {/* User Info */}
                                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                                        <img src={CURRENT_USER.avatar} className="w-10 h-10 rounded-full border border-white/10" alt="Me" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-white text-sm truncate">{CURRENT_USER.name}</p>
                                            <p className="text-zinc-400 text-xs flex items-center gap-1">
                                                <Signal size={10} className="text-gsn-green" /> Excellent Connection
                                            </p>
                                        </div>
                                    </div>

                                    {/* Title Input */}
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="What are we smoking today?" 
                                            className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white placeholder-zinc-500 focus:outline-none focus:border-gsn-green transition-all text-center font-medium"
                                        />
                                    </div>

                                    {/* Category Pills */}
                                    <div className="flex gap-2 justify-center">
                                        {['Chat & Chill', 'Grow Room', 'Sesh'].map(cat => (
                                            <button key={cat} className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all">
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Toolbar */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 pb-safe z-20">
                        <div className="flex items-center justify-between mb-8 max-w-sm mx-auto">
                             <div className="flex gap-4">
                                 <button className="p-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-white hover:bg-white/10 transition-all"><RotateCcw size={24} /></button>
                                 <button className="p-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-white hover:bg-white/10 transition-all"><Zap size={24} /></button>
                             </div>
                             <div className="flex gap-4">
                                 <button className="p-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-white hover:bg-white/10 transition-all"><Settings size={24} /></button>
                             </div>
                        </div>
                        
                        <button 
                            onClick={handleGoLive}
                            disabled={!title}
                            className={`w-full max-w-sm mx-auto font-black text-lg py-5 rounded-3xl shadow-[0_0_40px_rgba(220,38,38,0.3)] flex items-center justify-center gap-3 transition-all transform hover:scale-105 active:scale-95 ${title ? 'bg-red-600 text-white hover:bg-red-500 cursor-pointer' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
                        >
                            <Radio size={24} className={title ? 'animate-pulse' : ''} /> 
                            START BROADCAST
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- LIVE BROADCAST SCREEN ---
    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
            <div className="flex-1 relative bg-black">
                <CameraFeed />
                
                {/* Floating Hearts Container */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
                    {hearts.map(h => (
                        <div 
                            key={h.id}
                            className="absolute bottom-20 text-4xl animate-float-up opacity-0"
                            style={{ 
                                left: h.left, 
                                animationDuration: h.animationDuration,
                                filter: 'drop-shadow(0 0 10px rgba(236,72,153,0.5))'
                            }}
                        >
                            ❤️
                        </div>
                    ))}
                </div>

                {/* LIVE UI OVERLAY */}
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between pb-safe">
                    
                    {/* Top Header */}
                    <div className="p-4 pt-safe flex justify-between items-start pointer-events-auto bg-gradient-to-b from-black/80 to-transparent">
                        <div className="flex items-center gap-3">
                             <div className="flex items-center gap-2 bg-red-600/90 backdrop-blur px-3 py-1.5 rounded-lg text-white shadow-lg border border-red-500/50">
                                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                                <span className="text-[10px] font-black tracking-widest">LIVE</span>
                             </div>
                             
                             <div className="bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 text-white shadow-lg">
                                 <Users size={14} className="text-zinc-400" />
                                 <span className="text-xs font-bold font-mono">{viewers}</span>
                             </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white text-xs font-mono font-bold shadow-lg">
                                {formatDuration(duration)}
                            </div>
                            <button onClick={onEnd} className="p-2 bg-black/30 backdrop-blur-md rounded-lg text-white hover:bg-red-500/80 transition-colors border border-white/10">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Bottom Area: Chat & Interactions */}
                    <div className="p-4 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-20 pointer-events-auto">
                        
                        {/* Chat Messages */}
                        <div ref={chatContainerRef} className="h-64 overflow-y-auto mask-image-linear-gradient space-y-3 mb-4 no-scrollbar pr-2">
                            {comments.map((comment) => (
                                <div key={comment.id} className={`flex items-start gap-2 animate-in slide-in-from-bottom-4 fade-in duration-300 ${comment.system ? 'opacity-80' : ''}`}>
                                    {comment.system ? (
                                        <div className="bg-gsn-green/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-gsn-green/30">
                                            <p className="text-xs text-gsn-green font-bold">System</p>
                                            <p className="text-sm text-white font-bold">{comment.text}</p>
                                        </div>
                                    ) : (
                                        <>
                                            <img src={comment.user.avatar} className="w-8 h-8 rounded-full border border-white/20 shadow-sm object-cover shrink-0" alt="User" />
                                            <div className="flex flex-col items-start">
                                                <span className="text-white/60 text-[10px] font-bold px-1">{comment.user.name}</span>
                                                <div className="bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-2xl rounded-tl-none border border-white/5">
                                                    <p className="text-sm text-white font-medium shadow-black drop-shadow-sm">{comment.text}</p>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Input Bar & Actions */}
                        <div className="flex items-end gap-3">
                            <div className="flex-1 bg-white/10 backdrop-blur-xl rounded-[2rem] p-1.5 flex items-center gap-2 border border-white/10 shadow-xl transition-all focus-within:bg-black/60 focus-within:border-gsn-green/50">
                                <div className="p-2 bg-white/10 rounded-full">
                                    <img src={CURRENT_USER.avatar} className="w-6 h-6 rounded-full" />
                                </div>
                                <input 
                                    type="text" 
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                                    placeholder="Say something..." 
                                    className="bg-transparent text-white text-sm focus:outline-none flex-1 placeholder-zinc-400 h-10"
                                />
                                <button 
                                    onClick={handleSendComment} 
                                    disabled={!chatInput} 
                                    className={`p-2 rounded-full transition-all ${chatInput ? 'bg-gsn-green text-black scale-100' : 'bg-transparent text-zinc-500 scale-90'}`}
                                >
                                    <Send size={18} fill="currentColor" />
                                </button>
                            </div>
                            
                            {/* Reaction Buttons */}
                            <div className="flex flex-col gap-3 pb-1">
                                <button className="p-3 bg-black/40 backdrop-blur-xl rounded-full text-white hover:bg-white/10 active:scale-95 transition-transform border border-white/10 shadow-lg">
                                    <Video size={24} />
                                </button>
                                <button className="p-3 bg-black/40 backdrop-blur-xl rounded-full text-white hover:bg-white/10 active:scale-95 transition-transform border border-white/10 shadow-lg">
                                    <Mic size={24} />
                                </button>
                                <button 
                                    className="p-3 bg-gradient-to-tr from-pink-500 to-rose-600 rounded-full text-white shadow-lg active:scale-90 transition-transform hover:brightness-110 border border-white/20"
                                    onClick={triggerHeart}
                                >
                                    <Heart size={24} fill="white" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes float-up {
                    0% { transform: translateY(0) scale(0.5); opacity: 0; }
                    20% { opacity: 1; transform: translateY(-50px) scale(1.2) rotate(-10deg); }
                    100% { transform: translateY(-400px) scale(1) rotate(10deg); opacity: 0; }
                }
                .animate-float-up {
                    animation-name: float-up;
                    animation-timing-function: ease-out;
                    animation-fill-mode: forwards;
                }
            `}</style>
        </div>
    );
}

export default LiveStream;
