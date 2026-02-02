
import React, { useState, useEffect } from 'react';
import { MapPin, Users, Clock, Navigation, Zap, Flame, Coffee, Gamepad, Trees, X, Radar, Shield, Activity, Target } from 'lucide-react';
import { MOCK_LINKUPS, CURRENT_USER } from '../constants';
import { LinkUpSession } from '../types';
import PageGuide from './PageGuide';

const LinkUp: React.FC = () => {
    const [isHosting, setIsHosting] = useState(false);
    const [duration, setDuration] = useState(60); // minutes
    const [message, setMessage] = useState('');
    const [selectedActivity, setSelectedActivity] = useState<string>('Sesh');
    const [showHostModal, setShowHostModal] = useState(false);
    const [rotation, setRotation] = useState(0);

    // Radar scanning animation logic
    useEffect(() => {
        const timer = setInterval(() => {
            setRotation(prev => (prev + 2) % 360);
        }, 30); // 30ms for smooth rotation
        return () => clearInterval(timer);
    }, []);

    const toggleHosting = () => {
        if (isHosting) {
            if(confirm("Stop broadcasting your location?")) setIsHosting(false);
        } else {
            setShowHostModal(true);
        }
    };

    const confirmHosting = () => {
        setIsHosting(true);
        setShowHostModal(false);
    };

    return (
        <div className="min-h-screen bg-black pb-24 md:pb-0 relative flex flex-col md:flex-row overflow-hidden font-sans">
            <PageGuide 
                pageKey="linkup"
                steps={[
                    { title: "Live Radar", description: "See active smokers, sessions, and events nearby in real-time.", icon: <Radar size={20} /> },
                    { title: "Broadcast", description: "Start your own signal to host a sesh or meet new people. You control the duration.", icon: <Zap size={20} /> },
                    { title: "Stay Safe", description: "Your location is only approximate. Always meet in public spaces and stay aware of your surroundings.", icon: <Shield size={20} /> }
                ]}
            />

            {/* --- IMMERSIVE MAP BACKGROUND --- */}
            <div className="absolute inset-0 z-0 pointer-events-none bg-[#050505]">
                 {/* Radial Gradient Glow */}
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(74,222,128,0.08)_0%,transparent_70%)]"></div>
                 
                 {/* Dark Grid Pattern */}
                 <div className="w-full h-full opacity-20" style={{ 
                     backgroundImage: `
                        linear-gradient(#1a1a1a 1px, transparent 1px), 
                        linear-gradient(90deg, #1a1a1a 1px, transparent 1px)
                     `, 
                     backgroundSize: '40px 40px' 
                 }}></div>
                 
                 {/* Moving Scan Line (Vertical) */}
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gsn-green/5 to-transparent h-[100%] w-full animate-scan-vertical pointer-events-none"></div>
            </div>

            {/* --- MAIN RADAR VIEW --- */}
            <div className="flex-1 relative flex flex-col items-center justify-center p-4 min-h-[55vh]">
                
                {/* Header HUD */}
                <div className="absolute top-6 pt-8 md:pt-0 left-6 z-20">
                     <h1 className="text-3xl font-black flex items-center gap-3 text-white tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                        <Radar className={`text-gsn-green ${isHosting ? 'animate-spin-slow' : ''}`} /> 
                        LINK UP
                     </h1>
                     <div className="flex items-center gap-2 mt-2">
                         <div className={`w-2 h-2 rounded-full ${isHosting ? 'bg-gsn-green animate-pulse' : 'bg-red-500'}`}></div>
                         <p className="text-zinc-400 text-xs font-mono uppercase tracking-widest">
                             {isHosting ? 'Signal Active' : 'Passive Mode'}
                         </p>
                     </div>
                </div>

                {/* Radar Container */}
                <div className="relative w-[340px] h-[340px] md:w-[500px] md:h-[500px] flex items-center justify-center perspective-1000">
                    
                    {/* Rotating Scan Effect */}
                    <div 
                        className="absolute inset-0 rounded-full overflow-hidden pointer-events-none opacity-40 z-0 border border-gsn-green/10"
                        style={{ transform: `rotate(${rotation}deg)` }}
                    >
                         <div className="w-full h-1/2 bg-gradient-to-t from-gsn-green/40 to-transparent origin-bottom blur-xl"></div>
                    </div>

                    {/* Static Rings */}
                    {[1, 2, 3].map(i => (
                        <div key={i} className="absolute inset-0 m-auto rounded-full border border-gsn-green/10 box-border" style={{ width: `${i * 33}%`, height: `${i * 33}%` }}></div>
                    ))}
                    <div className="absolute inset-0 m-auto w-full h-[1px] bg-gsn-green/10"></div>
                    <div className="absolute inset-0 m-auto w-[1px] h-full bg-gsn-green/10"></div>

                    {/* Me Marker (Center) */}
                    <div className="relative z-20 group cursor-pointer">
                        {isHosting && (
                            <>
                                <div className="absolute inset-0 -m-4 bg-gsn-green/30 rounded-full animate-ping opacity-75"></div>
                                <div className="absolute inset-0 -m-12 bg-gsn-green/10 rounded-full animate-pulse"></div>
                            </>
                        )}
                        <div className="w-16 h-16 rounded-full border-2 border-gsn-green bg-black p-1 shadow-[0_0_20px_rgba(74,222,128,0.6)] relative z-20 overflow-hidden">
                             <img src={CURRENT_USER.avatar} className="w-full h-full rounded-full object-cover opacity-90" alt="Me" />
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-black/80 backdrop-blur border border-white/10 px-3 py-1 rounded-lg text-white text-[10px] font-bold uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                            You
                        </div>
                    </div>

                    {/* Nearby Users Markers */}
                    {MOCK_LINKUPS.map((session, index) => {
                        // Calculate positions (Simulated)
                        const angle = index * (360 / MOCK_LINKUPS.length) * (Math.PI / 180) + (rotation * 0.005); // Subtle rotation
                        const radius = 35 + (index * 20); // % from center
                        
                        return (
                            <div 
                                key={session.id}
                                className="absolute w-12 h-12 rounded-full cursor-pointer hover:z-30 hover:scale-110 transition-all duration-300 group"
                                style={{ 
                                    top: `${50 - (Math.sin(angle) * radius)}%`, 
                                    left: `${50 + (Math.cos(angle) * radius)}%` 
                                }}
                            >
                                {/* Marker Pulse */}
                                <div className="absolute inset-0 rounded-full border border-white/20 animate-pulse"></div>
                                
                                <div className="w-full h-full rounded-full p-[2px] bg-zinc-800 border border-gsn-green/50 overflow-hidden shadow-lg shadow-black/50">
                                    <img src={session.user.avatar} className="w-full h-full rounded-full object-cover filter brightness-90 group-hover:brightness-110" alt={session.user.name} />
                                </div>

                                {/* Floating Label */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black/90 backdrop-blur-md text-white px-3 py-2 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 border border-gsn-green/30 shadow-2xl flex flex-col items-center gap-1 z-30 pointer-events-none">
                                    <span className="font-bold text-sm">{session.user.name}</span>
                                    <span className="text-[10px] text-gsn-green font-mono">{session.distance}km • {session.activity}</span>
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black rotate-45 border-r border-b border-gsn-green/30"></div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* --- SIDE PANEL / CONTROL CENTER --- */}
            <div className="w-full md:w-[400px] bg-zinc-900/80 backdrop-blur-2xl border-t md:border-t-0 md:border-l border-white/10 p-6 z-20 flex flex-col h-[45vh] md:h-screen shadow-2xl">
                
                {/* Broadcasting Status Card */}
                <div className={`p-5 rounded-3xl mb-6 border transition-all relative overflow-hidden ${isHosting ? 'bg-gsn-green/10 border-gsn-green' : 'bg-black/40 border-white/5'}`}>
                    {isHosting && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>}
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                            <h3 className={`font-black text-lg uppercase tracking-tight ${isHosting ? 'text-gsn-green' : 'text-white'}`}>
                                {isHosting ? 'Broadcasting Signal' : 'Signal Offline'}
                            </h3>
                            <p className="text-xs text-zinc-400 mt-1 font-medium">
                                {isHosting ? `Beacon active for ${duration}m. Visible to nearby stoners.` : 'Start hosting to appear on the map.'}
                            </p>
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${isHosting ? 'bg-gsn-green text-black border-gsn-green shadow-[0_0_15px_rgba(74,222,128,0.5)]' : 'bg-zinc-800 text-zinc-500 border-white/10'}`}>
                            <Zap size={20} fill={isHosting ? "currentColor" : "none"} />
                        </div>
                    </div>
                    <button 
                        onClick={toggleHosting}
                        className={`w-full py-3 rounded-xl font-bold text-sm transition-all uppercase tracking-wide flex items-center justify-center gap-2 ${
                            isHosting 
                            ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20' 
                            : 'bg-white text-black hover:bg-zinc-200'
                        }`}
                    >
                        {isHosting ? 'Stop Signal' : 'Go Live'}
                    </button>
                </div>

                <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Target size={16} className="text-gsn-green"/> Nearby Sessions
                    </h3>
                    <span className="bg-zinc-800 text-xs px-2 py-1 rounded-md text-white font-mono border border-white/5">{MOCK_LINKUPS.length} ACTIVE</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                    {MOCK_LINKUPS.map(session => (
                        <div key={session.id} className="bg-black/40 p-4 rounded-2xl border border-white/5 hover:border-gsn-green/30 hover:bg-white/[0.02] transition-all cursor-pointer group relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gsn-green opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <img src={session.user.avatar} className="w-12 h-12 rounded-xl object-cover border border-white/10" alt="User" />
                                    <div className="absolute -bottom-2 -right-2 bg-zinc-900 rounded-full p-1.5 border border-zinc-700 shadow-md text-white">
                                         {getActivityIcon(session.activity)}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <h4 className="font-bold text-white text-sm">{session.user.name}</h4>
                                        <span className="text-xs font-mono text-gsn-green">{session.distance}km</span>
                                    </div>
                                    <p className="text-xs text-zinc-400 truncate mb-2">"{session.message}"</p>
                                    <div className="flex items-center gap-2">
                                         <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-zinc-300 uppercase font-bold tracking-wide">{session.activity}</span>
                                         <span className="text-[10px] text-zinc-500 flex items-center gap-1"><Clock size={10} /> 25m left</span>
                                    </div>
                                </div>
                                <button className="p-3 bg-white/5 text-zinc-400 group-hover:text-white group-hover:bg-white/10 rounded-xl transition-all">
                                    <Navigation size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- HOST MODAL --- */}
            {showHostModal && (
                <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-end md:items-center justify-center p-4">
                    <div className="bg-[#09090b] w-full max-w-md rounded-[2rem] border border-white/10 p-6 animate-in slide-in-from-bottom duration-300 shadow-2xl relative overflow-hidden">
                        {/* Modal Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gsn-green shadow-[0_0_20px_rgba(74,222,128,0.8)] rounded-b-full"></div>
                        
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-white tracking-tight">START SIGNAL</h3>
                            <button onClick={() => setShowHostModal(false)} className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white"><X size={20} /></button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-gsn-green uppercase mb-3 tracking-wider">
                                    <Activity size={12} /> Select Vibe
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Sesh', 'Chilling', 'Hiking', 'Food', 'Gaming'].map(act => (
                                        <button 
                                            key={act}
                                            onClick={() => setSelectedActivity(act)}
                                            className={`px-2 py-3 rounded-xl text-xs font-bold transition-all border ${
                                                selectedActivity === act 
                                                ? 'bg-gsn-green text-black border-gsn-green shadow-[0_0_15px_rgba(74,222,128,0.2)]' 
                                                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
                                            }`}
                                        >
                                            {act}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-zinc-500 uppercase mb-3 block">Public Message</label>
                                <input 
                                    type="text" 
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="e.g. Rolling up at the skatepark..." 
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-gsn-green transition-colors placeholder-zinc-600 font-medium"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between mb-3">
                                    <label className="text-xs font-bold text-zinc-500 uppercase">Duration</label>
                                    <span className="text-xs font-bold text-white bg-zinc-800 px-2 py-0.5 rounded">{duration} min</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="15" 
                                    max="240" 
                                    step="15" 
                                    value={duration} 
                                    onChange={(e) => setDuration(parseInt(e.target.value))}
                                    className="w-full accent-gsn-green h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer hover:bg-zinc-700"
                                />
                            </div>

                            <div className="bg-yellow-500/5 p-4 rounded-xl flex gap-3 items-start border border-yellow-500/10">
                                <Shield className="text-yellow-500 shrink-0 mt-0.5" size={16} />
                                <p className="text-xs text-yellow-200/60 leading-relaxed font-medium">
                                    Your location will be visible to everyone on the map for the selected duration. Ensure you are in a safe, public area.
                                </p>
                            </div>

                            <button 
                                onClick={confirmHosting}
                                className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-zinc-200 transition-all shadow-xl flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
                            >
                                <Radar size={18} /> Activate Beacon
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <style>{`
                @keyframes scan-vertical {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100%); }
                }
                .animate-scan-vertical {
                    animation: scan-vertical 8s linear infinite;
                }
            `}</style>
        </div>
    );
};

const getActivityIcon = (activity: string) => {
    switch (activity) {
        case 'Sesh': return <Flame size={12} className="text-orange-500" />;
        case 'Chilling': return <Zap size={12} className="text-blue-500" />;
        case 'Food': return <Coffee size={12} className="text-yellow-500" />;
        case 'Hiking': return <Trees size={12} className="text-green-500" />;
        case 'Gaming': return <Gamepad size={12} className="text-purple-500" />;
        default: return <MapPin size={12} className="text-white" />;
    }
}

export default LinkUp;
