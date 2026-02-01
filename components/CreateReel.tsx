
import React, { useState, useEffect, useRef } from 'react';
import { 
    X, Zap, Music, RotateCcw, ArrowRight, ArrowLeft, Send, Image as ImageIcon, 
    Check, Mic, Timer, Gauge, ChevronDown, Search, Play, Pause, Grid3X3, Layers
} from 'lucide-react';
import { CURRENT_USER } from '../constants';

interface CreateReelProps {
    onExit: () => void;
    onPostComplete: () => void;
}

const MOCK_MUSIC = [
    { id: 'm1', title: 'Lofi Chill Beats', artist: 'Green Beats', duration: '3:00', category: 'Trending', cover: 'https://picsum.photos/100/100?random=m1' },
    { id: 'm2', title: 'High Energy Trap', artist: 'Smoke Signal', duration: '2:45', category: 'Trending', cover: 'https://picsum.photos/100/100?random=m2' },
    { id: 'm3', title: 'Reggae Dub', artist: 'Island Vibes', duration: '4:20', category: 'Trending', cover: 'https://picsum.photos/100/100?random=m3' },
    { id: 'm4', title: 'Deep House Grow', artist: 'Hydro Sonic', duration: '3:30', category: 'Trending', cover: 'https://picsum.photos/100/100?random=m4' },
    { id: 'm5', title: 'Morning Sativa', artist: 'Leafy Tunes', duration: '2:15', category: 'Saved', cover: 'https://picsum.photos/100/100?random=m5' },
    { id: 'm6', title: 'Late Night Indica', artist: 'Sleepy Head', duration: '4:00', category: 'Saved', cover: 'https://picsum.photos/100/100?random=m6' },
    { id: 'm7', title: 'Harvest Season', artist: 'Crop Circle', duration: '3:10', category: 'Trending', cover: 'https://picsum.photos/100/100?random=m7' },
    { id: 'm8', title: 'Original Sound', artist: 'You', duration: '0:30', category: 'Originals', cover: CURRENT_USER.avatar },
];

const SPEEDS = [0.5, 1, 2, 3];

const CreateReel: React.FC<CreateReelProps> = ({ onExit, onPostComplete }) => {
    const [stage, setStage] = useState<'capture' | 'preview' | 'details'>('capture');
    
    // Camera State
    const [recording, setRecording] = useState(false);
    const [progress, setProgress] = useState(0);
    const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
    const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('off');
    const [activeSpeed, setActiveSpeed] = useState(1);
    const [timer, setTimer] = useState(0); // 0 = off, 3 = 3s, 10 = 10s
    const [gridVisible, setGridVisible] = useState(false);
    const [greenScreen, setGreenScreen] = useState<string | null>(null);
    
    // Workflow State
    const [countdown, setCountdown] = useState<number | null>(null);
    const [selectedMusic, setSelectedMusic] = useState<typeof MOCK_MUSIC[0] | null>(null);
    const [showMusicPicker, setShowMusicPicker] = useState(false);
    
    // Post State
    const [caption, setCaption] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    // Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // --- CAMERA INITIALIZATION ---
    useEffect(() => {
        let mounted = true;
        const startCamera = async () => {
            if (stage !== 'capture') return;
            try {
                // Stop previous stream if any
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                }

                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: cameraFacing, width: { ideal: 1080 }, height: { ideal: 1920 } },
                    audio: true
                });
                
                if (mounted) {
                    streamRef.current = stream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                }
            } catch (err) {
                console.error("Camera access error:", err);
            }
        };

        startCamera();

        return () => {
            mounted = false;
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [cameraFacing, stage]);

    // --- RECORDING LOGIC ---
    const startRecordingFlow = () => {
        if (timer > 0) {
            setCountdown(timer);
            const countInterval = setInterval(() => {
                setCountdown(prev => {
                    if (prev === 1) {
                        clearInterval(countInterval);
                        setTimeout(() => {
                            setCountdown(null);
                            beginCapture();
                        }, 500); // slight delay after 1
                        return 0;
                    }
                    return (prev || 0) - 1;
                });
            }, 1000);
        } else {
            beginCapture();
        }
    };

    const beginCapture = () => {
        setRecording(true);
        // Simulate flash if enabled
        if (flashMode === 'on') {
            const flash = document.getElementById('camera-flash');
            if (flash) {
                flash.style.opacity = '0.8';
                setTimeout(() => { flash.style.opacity = '0'; }, 100);
            }
        }
    };

    useEffect(() => {
        let interval: any;
        if (recording) {
            // Speed affects how fast progress fills relative to real time limits (mock logic)
            const tickRate = 50 * activeSpeed; 
            interval = setInterval(() => {
                setProgress(p => {
                    if (p >= 100) {
                        setRecording(false);
                        setStage('preview');
                        return 100;
                    }
                    return p + 0.5; // Arbitrary increment
                });
            }, 50);
        }
        return () => clearInterval(interval);
    }, [recording, activeSpeed]);

    const handlePost = () => {
        setIsPosting(true);
        setTimeout(() => {
            setIsPosting(false);
            onPostComplete();
        }, 2000);
    };

    // --- RENDERERS ---

    if (showMusicPicker) {
        return (
            <MusicPicker 
                onClose={() => setShowMusicPicker(false)} 
                onSelect={(track) => { setSelectedMusic(track); setShowMusicPicker(false); }} 
            />
        );
    }

    if (stage === 'details') {
        return (
            <div className="min-h-screen bg-black flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-4 flex justify-between items-center border-b border-white/10 bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50">
                    <button onClick={() => setStage('preview')} className="text-white hover:text-gsn-green transition-colors p-2 rounded-full hover:bg-white/10">
                        <ArrowLeft size={24} />
                    </button>
                    <h3 className="font-black text-white text-lg tracking-tight">NEW REEL</h3>
                    <div className="w-10"></div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-8 max-w-3xl mx-auto w-full">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Final Preview Thumbnail */}
                        <div className="w-32 h-56 md:w-56 md:h-[400px] bg-zinc-800 rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl shrink-0 mx-auto md:mx-0 group cursor-pointer">
                            <img src="https://picsum.photos/400/800?random=reel_thumb" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Thumb" />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                            {selectedMusic && (
                                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 text-[10px] bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl text-white border border-white/10">
                                    <Music size={12} className="text-gsn-green animate-pulse" />
                                    <div className="truncate font-bold">{selectedMusic.title}</div>
                                </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                                    <Play size={24} fill="white" className="text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Metadata Inputs */}
                        <div className="flex-1 space-y-6">
                            <div>
                                <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block ml-1">Caption</label>
                                <textarea 
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    placeholder="Write a caption... Use tags like #HomeGrow or #Hydroponics."
                                    className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 text-white resize-none focus:outline-none focus:border-gsn-green focus:bg-black transition-all h-32 text-base leading-relaxed placeholder-zinc-600"
                                    autoFocus
                                />
                            </div>
                            
                            <div>
                                <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block ml-1">Quick Tags</label>
                                <div className="flex flex-wrap gap-2">
                                    {['#Hydroponics', '#Organic', '#Sativa', '#Indica', '#HarvestDay', '#Terps', '#710'].map(tag => (
                                        <button 
                                            key={tag}
                                            onClick={() => setCaption(prev => prev ? `${prev} ${tag}` : tag)}
                                            className="px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-full text-xs font-bold text-zinc-400 hover:text-gsn-green hover:border-gsn-green/50 transition-all"
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1 bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 divide-y divide-white/5">
                                <SettingRow label="Tag People" icon={<UsersIcon />} />
                                <SettingRow label="Add Location" icon={<MapPinIcon />} value="Denver, CO" />
                                <SettingRow label="Advanced Settings" icon={<SettingsIcon />} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-white/10 bg-zinc-900 pb-safe z-50">
                     <button 
                        onClick={handlePost}
                        disabled={isPosting}
                        className="w-full bg-gsn-green text-black font-black text-lg py-4 rounded-2xl hover:bg-green-400 transition-all shadow-[0_0_30px_rgba(74,222,128,0.4)] flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 disabled:scale-100"
                    >
                        {isPosting ? (
                            <>Uploading Reel...</>
                        ) : (
                            <>
                                Share Reel <Send size={20} strokeWidth={3} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        )
    }

    // --- CAPTURE & PREVIEW STAGE ---
    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col h-full overflow-hidden">
            {/* Countdown Overlay */}
            {countdown !== null && (
                <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in">
                    <span className="text-[12rem] font-black text-white animate-ping">{countdown}</span>
                </div>
            )}

            {/* Flash Effect */}
            <div id="camera-flash" className="absolute inset-0 bg-white opacity-0 pointer-events-none z-[55] transition-opacity duration-100"></div>

            {/* Camera Viewfinder */}
            <div className="flex-1 relative bg-zinc-900 overflow-hidden">
                {/* Simulated Video Feed */}
                {stage === 'capture' ? (
                    <video 
                        ref={videoRef}
                        autoPlay 
                        playsInline 
                        muted 
                        className={`w-full h-full object-cover transition-transform duration-500 ${cameraFacing === 'user' ? 'scale-x-[-1]' : ''}`} 
                    />
                ) : (
                    <div className="w-full h-full relative">
                        <img 
                            src="https://picsum.photos/1080/1920?random=preview" 
                            className="w-full h-full object-cover" 
                            alt="Preview" 
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <Play size={64} className="text-white/80 drop-shadow-lg" fill="currentColor" />
                        </div>
                    </div>
                )}
                
                {/* Grid Overlay */}
                {gridVisible && stage === 'capture' && (
                    <div className="absolute inset-0 pointer-events-none opacity-30 z-10 grid grid-cols-3 grid-rows-3">
                        {[...Array(9)].map((_, i) => <div key={i} className="border border-white/40"></div>)}
                    </div>
                )}

                {/* --- HEADER CONTROLS --- */}
                <div className="absolute top-0 left-0 right-0 p-4 pt-safe z-30 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent">
                    <button onClick={onExit} className="p-3 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition-all border border-white/10">
                        <X size={24} />
                    </button>
                    
                    {/* Selected Music Pill */}
                    {selectedMusic && (
                        <div 
                            onClick={() => setShowMusicPicker(true)}
                            className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white cursor-pointer hover:bg-black/60 transition-all animate-in slide-in-from-top-4"
                        >
                            <Music size={14} className="text-gsn-green" />
                            <span className="text-xs font-bold max-w-[120px] truncate">{selectedMusic.title}</span>
                            <X size={12} className="text-zinc-400 hover:text-white" onClick={(e) => { e.stopPropagation(); setSelectedMusic(null); }} />
                        </div>
                    )}

                    {stage === 'preview' && (
                         <button 
                            onClick={() => setStage('details')}
                            className="bg-white text-black px-6 py-2.5 rounded-full font-bold flex items-center gap-2 hover:bg-gsn-green transition-all shadow-lg"
                         >
                            Next <ArrowRight size={18} />
                         </button>
                    )}
                </div>

                {/* --- SIDEBAR TOOLS (RIGHT) --- */}
                {stage === 'capture' && (
                    <div className="absolute top-24 right-4 z-30 flex flex-col gap-4 bg-black/30 backdrop-blur-sm p-2 rounded-full border border-white/5 animate-in slide-in-from-right duration-500">
                        <ToolButton 
                            icon={<Zap size={20} fill={flashMode === 'on' ? 'currentColor' : 'none'} />} 
                            label={flashMode === 'auto' ? 'Auto' : flashMode === 'on' ? 'On' : 'Off'}
                            active={flashMode !== 'off'}
                            onClick={() => setFlashMode(prev => prev === 'off' ? 'on' : prev === 'on' ? 'auto' : 'off')} 
                        />
                        <ToolButton 
                            icon={<RotateCcw size={20} />} 
                            label="Flip"
                            onClick={() => setCameraFacing(prev => prev === 'user' ? 'environment' : 'user')} 
                        />
                        <ToolButton 
                            icon={<Gauge size={20} />} 
                            label={`${activeSpeed}x`}
                            active={activeSpeed !== 1}
                            onClick={() => setActiveSpeed(prev => {
                                const idx = SPEEDS.indexOf(prev);
                                return SPEEDS[(idx + 1) % SPEEDS.length];
                            })} 
                        />
                        <ToolButton 
                            icon={<Timer size={20} />} 
                            label={timer > 0 ? `${timer}s` : 'Off'}
                            active={timer > 0}
                            onClick={() => setTimer(prev => prev === 0 ? 3 : prev === 3 ? 10 : 0)} 
                        />
                        <ToolButton 
                            icon={<Grid3X3 size={20} />} 
                            label="Grid"
                            active={gridVisible}
                            onClick={() => setGridVisible(!gridVisible)} 
                        />
                        <ToolButton 
                            icon={<Layers size={20} />} 
                            label="Green"
                            active={!!greenScreen}
                            onClick={() => setGreenScreen(prev => prev ? null : 'active')} 
                        />
                        <ToolButton 
                            icon={<ChevronDown size={20} />} 
                            onClick={() => {}} 
                        />
                    </div>
                )}

                {/* Progress Bar (Instagram Style) */}
                <div className="absolute top-0 left-0 right-0 h-1.5 z-40 bg-white/20">
                    <div 
                        className="h-full bg-gradient-to-r from-gsn-green to-emerald-500 transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(74,222,128,0.5)]" 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            {/* --- BOTTOM CONTROLS --- */}
            {stage === 'capture' && (
                <div className="h-44 bg-black/90 backdrop-blur-xl flex flex-col justify-end pb-safe relative border-t border-white/5">
                    
                    {/* Mode Selector (Optional, for future features) */}
                    <div className="flex justify-center gap-6 mb-6 text-sm font-bold text-zinc-500 uppercase tracking-widest">
                        <span>Post</span>
                        <span className="text-white">Reel</span>
                        <span>Live</span>
                    </div>

                    <div className="flex items-center justify-around px-8 mb-8">
                        {/* Gallery Button */}
                        <div className="w-12 h-12 rounded-xl border-2 border-white/20 overflow-hidden cursor-pointer hover:border-white transition-all hover:scale-105 active:scale-95 group">
                            <img src={CURRENT_USER.avatar} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" alt="Gallery" />
                        </div>

                        {/* Shutter Button */}
                        <button 
                            className="relative group touch-manipulation"
                            onClick={() => recording ? setRecording(false) : startRecordingFlow()}
                        >
                            {/* Outer Ring */}
                            <div className={`w-20 h-20 rounded-full border-[5px] transition-all duration-300 flex items-center justify-center ${recording ? 'border-red-500 scale-110' : 'border-white group-hover:scale-105'}`}>
                                {/* Inner Circle */}
                                <div className={`w-16 h-16 rounded-full transition-all duration-300 ${recording ? 'bg-red-500 scale-50 rounded-lg' : 'bg-white'}`}></div>
                            </div>
                        </button>

                        {/* Effects / Music Button (Secondary) */}
                        <button 
                            className="w-12 h-12 flex items-center justify-center rounded-full bg-zinc-800 border border-white/10 text-white hover:bg-zinc-700 transition-all active:scale-95"
                            onClick={() => setShowMusicPicker(true)}
                        >
                            <Music size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* --- PREVIEW CONTROLS --- */}
            {stage === 'preview' && (
                <div className="h-32 bg-black/90 backdrop-blur-xl flex items-center justify-between px-8 pb-safe border-t border-white/5 animate-in slide-in-from-bottom duration-300">
                    <button 
                        onClick={() => {
                            setProgress(0);
                            setStage('capture');
                        }}
                        className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white transition-colors"
                    >
                        <div className="p-3 rounded-full bg-zinc-800 border border-white/5"><RotateCcw size={20} /></div>
                        <span className="text-[10px] font-bold">Retake</span>
                    </button>

                    <div className="flex gap-4">
                        <button className="flex flex-col items-center gap-1 text-white hover:text-gsn-green transition-colors group">
                            <div className="p-3 rounded-full bg-zinc-800 border border-white/5 group-hover:border-gsn-green/50"><Music size={20} /></div>
                            <span className="text-[10px] font-bold">Audio</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 text-white hover:text-gsn-green transition-colors group">
                            <div className="p-3 rounded-full bg-zinc-800 border border-white/5 group-hover:border-gsn-green/50"><TypeIcon /></div>
                            <span className="text-[10px] font-bold">Text</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 text-white hover:text-gsn-green transition-colors group">
                            <div className="p-3 rounded-full bg-zinc-800 border border-white/5 group-hover:border-gsn-green/50"><StickerIcon /></div>
                            <span className="text-[10px] font-bold">Sticker</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- SUB-COMPONENTS ---

const ToolButton = ({ icon, label, onClick, active }: { icon: React.ReactNode, label?: string, onClick?: () => void, active?: boolean }) => (
    <button onClick={onClick} className="flex flex-col items-center gap-1 group relative py-1">
        <div className={`p-2.5 rounded-full transition-all duration-300 ${active ? 'bg-gsn-green text-black shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 'text-white group-hover:bg-white/10'}`}>
            {icon}
        </div>
        {label && (
            <span className={`text-[9px] font-bold absolute right-full mr-3 bg-black/60 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap backdrop-blur-md pointer-events-none ${active ? 'text-gsn-green' : 'text-white'}`}>
                {label}
            </span>
        )}
    </button>
);

const SettingRow = ({ label, icon, value }: { label: string, icon: React.ReactNode, value?: string }) => (
    <div className="flex items-center justify-between p-4 bg-zinc-900 hover:bg-zinc-800 transition-colors cursor-pointer group">
        <div className="flex items-center gap-3 text-white">
            <span className="text-zinc-400 group-hover:text-white transition-colors">{icon}</span>
            <span className="font-bold text-sm">{label}</span>
        </div>
        <div className="flex items-center gap-2">
            {value && <span className="text-gsn-green text-xs font-bold uppercase">{value}</span>}
            <ArrowRight size={16} className="text-zinc-600 group-hover:text-white transition-colors" />
        </div>
    </div>
);

const MusicPicker = ({ onClose, onSelect }: { onClose: () => void, onSelect: (track: typeof MOCK_MUSIC[0]) => void }) => {
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('Trending');
    const [playingId, setPlayingId] = useState<string | null>(null);

    const filteredMusic = MOCK_MUSIC.filter(track => {
        const matchesSearch = track.title.toLowerCase().includes(search.toLowerCase()) || 
                              track.artist.toLowerCase().includes(search.toLowerCase());
        const matchesTab = activeTab === 'Trending' ? track.category === 'Trending' : 
                           activeTab === 'Saved' ? track.category === 'Saved' : true;
        
        // If searching, ignore tabs, otherwise filter by tab
        return matchesSearch && (search ? true : matchesTab);
    });

    const togglePlay = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setPlayingId(prev => prev === id ? null : id);
    };

    return (
        <div className="fixed inset-0 z-[70] bg-zinc-900 flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center gap-4 sticky top-0 bg-zinc-900 z-10">
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><ChevronDown className="text-white" /></button>
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-2.5 text-zinc-500" size={16} />
                    <input 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search music..." 
                        className="w-full bg-black border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-gsn-green"
                        autoFocus
                    />
                </div>
            </div>

            {/* Tabs */}
            {!search && (
                <div className="flex px-4 border-b border-white/5">
                    {['Trending', 'Saved', 'Originals'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === tab ? 'text-white border-gsn-green' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2">
                {filteredMusic.length > 0 ? (
                    filteredMusic.map((track) => (
                        <div 
                            key={track.id} 
                            onClick={() => onSelect(track)}
                            className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors group"
                        >
                            <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                                <img src={track.cover} className="w-full h-full object-cover" alt={track.title} />
                                <div 
                                    className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${playingId === track.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                    onClick={(e) => togglePlay(e, track.id)}
                                >
                                    {playingId === track.id ? (
                                        <Pause size={20} fill="white" className="text-white" />
                                    ) : (
                                        <Play size={20} fill="white" className="text-white" />
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <p className={`font-bold text-sm truncate ${playingId === track.id ? 'text-gsn-green' : 'text-white'}`}>{track.title}</p>
                                <p className="text-xs text-zinc-400 truncate">{track.artist} • {track.duration}</p>
                            </div>

                            {playingId === track.id && (
                                <div className="flex gap-0.5 items-end h-4 mr-2">
                                    <div className="w-1 bg-gsn-green animate-music-bar-1 h-3"></div>
                                    <div className="w-1 bg-gsn-green animate-music-bar-2 h-4"></div>
                                    <div className="w-1 bg-gsn-green animate-music-bar-3 h-2"></div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center text-zinc-500">
                        <p>No music found.</p>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes music-bar-1 { 0%, 100% { height: 40%; } 50% { height: 100%; } }
                @keyframes music-bar-2 { 0%, 100% { height: 60%; } 50% { height: 30%; } }
                @keyframes music-bar-3 { 0%, 100% { height: 20%; } 50% { height: 80%; } }
                .animate-music-bar-1 { animation: music-bar-1 0.6s infinite ease-in-out; }
                .animate-music-bar-2 { animation: music-bar-2 0.8s infinite ease-in-out; }
                .animate-music-bar-3 { animation: music-bar-3 0.5s infinite ease-in-out; }
            `}</style>
        </div>
    )
}

// Simple Icons
const UsersIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const MapPinIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const SettingsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const TypeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>;
const StickerIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/><path d="M15 3v6h6"/><path d="M10 18a4 4 0 0 0 4-4"/></svg>;

export default CreateReel;
