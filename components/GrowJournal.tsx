import React, { useState, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';
import { Sprout, Droplets, Thermometer, Wind, Plus, ArrowLeft, Calendar, Image as ImageIcon, MoreHorizontal, Settings, Share2, Camera, X, Check, Activity, Leaf, Zap } from 'lucide-react';
import { MOCK_JOURNALS, CURRENT_USER } from '../constants';
import { GrowJournal as GrowJournalType, GrowLogEntry } from '../types';
import { uploadToCloudinary } from '../services/cloudinary';

interface GrowJournalProps {
    onBack?: () => void;
}

const GrowJournal: React.FC<GrowJournalProps> = ({ onBack }) => {
    const [journals, setJournals] = useState<GrowJournalType[]>(MOCK_JOURNALS);
    const [activeJournal, setActiveJournal] = useState<GrowJournalType | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const handleCreateJournal = (newJournal: GrowJournalType) => {
        setJournals([newJournal, ...journals]);
        setShowCreateModal(false);
        setActiveJournal(newJournal);
    };

    if (activeJournal) {
        return (
            <JournalDetailView 
                journal={activeJournal} 
                onBack={() => setActiveJournal(null)} 
                onUpdate={(updated) => {
                    setJournals(prev => prev.map(j => j.id === updated.id ? updated : j));
                    setActiveJournal(updated);
                }}
            />
        );
    }

    return (
        <div className="min-h-screen bg-black pb-24 md:pb-0">
            {showCreateModal && <CreateJournalModal onClose={() => setShowCreateModal(false)} onCreate={handleCreateJournal} />}
            
            {/* Dashboard Header */}
            <div className="p-6 md:p-8 flex justify-between items-end bg-gradient-to-b from-zinc-900/50 to-black sticky top-0 z-20 backdrop-blur-xl border-b border-white/5">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-1">MY GROWS</h1>
                    <p className="text-zinc-400 text-sm">Manage your active cultivations.</p>
                </div>
                <button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gsn-green text-black px-5 py-2.5 rounded-full font-bold flex items-center gap-2 hover:bg-green-400 transition-all shadow-[0_0_15px_rgba(74,222,128,0.3)]"
                >
                    <Plus size={20} /> <span className="hidden md:inline">New Journal</span>
                </button>
            </div>

            {/* Journal Grid */}
            <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                {journals.map(journal => (
                    <JournalCard key={journal.id} journal={journal} onClick={() => setActiveJournal(journal)} />
                ))}
                
                {/* Empty State / Add New Card */}
                {journals.length === 0 && (
                    <div 
                        onClick={() => setShowCreateModal(true)}
                        className="border-2 border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center p-8 cursor-pointer hover:border-gsn-green/50 hover:bg-zinc-900/30 transition-all group min-h-[300px]"
                    >
                        <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Sprout size={32} className="text-zinc-500 group-hover:text-gsn-green transition-colors" />
                        </div>
                        <h3 className="text-zinc-400 font-bold group-hover:text-white transition-colors">Start Your First Journal</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS ---

export const JournalCard: React.FC<{ journal: GrowJournalType, onClick?: () => void }> = ({ journal, onClick }) => (
    <div 
        onClick={onClick}
        className="bg-zinc-900/50 rounded-3xl overflow-hidden border border-white/5 hover:border-gsn-green/30 transition-all cursor-pointer group hover:shadow-2xl hover:shadow-black/50 relative"
    >
        <div className="h-48 relative overflow-hidden">
            <img src={journal.coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" alt={journal.title} />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent"></div>
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10 uppercase tracking-wider">
                {journal.status}
            </div>
        </div>
        <div className="p-6 relative z-10 -mt-12">
            <div className="flex justify-between items-end mb-4">
                <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center border border-white/10 shadow-lg text-gsn-green">
                    <Leaf size={24} />
                </div>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-1 truncate">{journal.title}</h3>
            <p className="text-zinc-400 text-sm mb-4">{journal.strain} • {journal.method}</p>
            
            <div className="flex items-center gap-4 text-xs font-bold text-zinc-500 border-t border-white/5 pt-4">
                <span className="flex items-center gap-1"><Activity size={14}/> Day {calculateDays(journal.startDate)}</span>
                <span className="flex items-center gap-1"><ImageIcon size={14}/> {journal.logs.length} Logs</span>
            </div>
        </div>
    </div>
);

const calculateDays = (start: string) => {
    const diff = new Date().getTime() - new Date(start).getTime();
    return Math.floor(diff / (1000 * 3600 * 24));
};

const JournalDetailView: React.FC<{ journal: GrowJournalType, onBack: () => void, onUpdate: (j: GrowJournalType) => void }> = ({ journal, onBack, onUpdate }) => {
    const [activeTab, setActiveTab] = useState<'timeline' | 'stats' | 'gallery'>('timeline');
    const [showAddLog, setShowAddLog] = useState(false);

    const handleAddLog = (newLog: GrowLogEntry) => {
        const updatedJournal = {
            ...journal,
            logs: [newLog, ...journal.logs]
        };
        onUpdate(updatedJournal);
        setShowAddLog(false);
    };

    // Prepare chart data
    const chartData = journal.logs.slice().reverse().map(log => ({
        name: `Wk ${log.week}`,
        temp: log.temp || 0,
        humidity: log.humidity || 0,
        ec: log.ec || 0
    }));

    const currentStage = journal.logs[0]?.stage || 'Seedling';

    return (
        <div className="min-h-screen bg-black flex flex-col relative animate-in fade-in duration-300">
            {showAddLog && <AddLogModal onClose={() => setShowAddLog(false)} onSave={handleAddLog} journalStart={journal.startDate} />}
            
            {/* Header */}
            <div className="relative h-64 shrink-0">
                <img src={journal.coverImage} className="w-full h-full object-cover opacity-60" alt="Cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black"></div>
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
                    <button onClick={onBack} className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-white/10"><ArrowLeft size={24} /></button>
                    <div className="flex gap-2">
                        <button className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-white/10"><Settings size={24} /></button>
                    </div>
                </div>
                <div className="absolute bottom-4 left-6 right-6">
                    <div className="flex justify-between items-end">
                        <div>
                            <span className="text-gsn-green font-bold text-xs uppercase tracking-widest mb-1 block">{currentStage} Phase</span>
                            <h1 className="text-3xl md:text-4xl font-black text-white">{journal.title}</h1>
                            <p className="text-zinc-300 text-sm mt-1">{journal.strain} by {journal.breeder || 'Unknown'}</p>
                        </div>
                        <button 
                            onClick={() => setShowAddLog(true)}
                            className="bg-white text-black px-6 py-3 rounded-full font-bold shadow-lg hover:bg-zinc-200 transition-colors flex items-center gap-2"
                        >
                            <Plus size={18} /> Log
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10 px-6 sticky top-0 bg-black/90 backdrop-blur-xl z-20">
                {['timeline', 'stats', 'gallery'].map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`py-4 mr-8 text-sm font-bold uppercase tracking-wider relative ${activeTab === tab ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        {tab}
                        {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-gsn-green rounded-t-full shadow-[0_0_10px_rgba(74,222,128,0.5)]"></div>}
                    </button>
                ))}
            </div>

            <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                {activeTab === 'timeline' && (
                    <div className="max-w-3xl mx-auto space-y-8 relative">
                        {/* Timeline Line */}
                        <div className="absolute left-[19px] top-4 bottom-0 w-[2px] bg-zinc-800"></div>
                        
                        {journal.logs.map((log, i) => (
                            <div key={log.id} className="relative pl-12 group">
                                <div className={`absolute left-0 top-0 w-10 h-10 rounded-full border-4 border-black flex items-center justify-center z-10 transition-colors ${i===0 ? 'bg-gsn-green text-black' : 'bg-zinc-800 text-zinc-500 group-hover:bg-zinc-700'}`}>
                                    <Sprout size={18} />
                                </div>
                                
                                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 hover:border-gsn-green/20 transition-all">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="font-bold text-white text-lg">Week {log.week} <span className="text-zinc-500 text-sm font-normal">Day {log.day}</span></h4>
                                            <p className="text-xs text-gsn-green font-bold uppercase tracking-wide">{log.stage}</p>
                                        </div>
                                        <span className="text-zinc-500 text-xs">{log.date}</span>
                                    </div>
                                    
                                    <p className="text-zinc-300 text-sm leading-relaxed mb-4">{log.notes}</p>
                                    
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        {log.temp && (
                                            <div className="bg-black/40 rounded-lg p-2 flex items-center gap-2">
                                                <Thermometer size={14} className="text-orange-400"/>
                                                <span className="text-xs font-bold text-white">{log.temp}°F</span>
                                            </div>
                                        )}
                                        {log.humidity && (
                                            <div className="bg-black/40 rounded-lg p-2 flex items-center gap-2">
                                                <Droplets size={14} className="text-blue-400"/>
                                                <span className="text-xs font-bold text-white">{log.humidity}%</span>
                                            </div>
                                        )}
                                        {log.ec && (
                                            <div className="bg-black/40 rounded-lg p-2 flex items-center gap-2">
                                                <Zap size={14} className="text-yellow-400"/>
                                                <span className="text-xs font-bold text-white">{log.ec} EC</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Images */}
                                    {log.images && log.images.length > 0 && (
                                        <div className="flex gap-2 overflow-x-auto no-scrollbar">
                                            {log.images.map((img, idx) => (
                                                <img key={idx} src={img} className="h-24 w-24 object-cover rounded-xl border border-white/10" alt="Log" />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'stats' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5">
                            <h3 className="font-bold text-white mb-6">Temperature & Humidity Trends</h3>
                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                        <XAxis dataKey="name" stroke="#666" axisLine={false} tickLine={false} />
                                        <YAxis stroke="#666" axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#333', borderRadius: '12px' }} />
                                        <Area type="monotone" dataKey="temp" stroke="#f97316" fillOpacity={1} fill="url(#colorTemp)" />
                                        <Area type="monotone" dataKey="humidity" stroke="#3b82f6" fillOpacity={1} fill="url(#colorHum)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'gallery' && (
                    <div className="columns-2 md:columns-3 gap-4 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                        {journal.logs.flatMap(l => l.images || []).map((img, i) => (
                            <div key={i} className="break-inside-avoid rounded-2xl overflow-hidden group relative cursor-pointer">
                                <img src={img} className="w-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Gallery" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Share2 className="text-white" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MODALS ---

const CreateJournalModal: React.FC<{ onClose: () => void, onCreate: (j: GrowJournalType) => void }> = ({ onClose, onCreate }) => {
    const [title, setTitle] = useState('');
    const [strain, setStrain] = useState('');
    const [method, setMethod] = useState<'Hydro'|'Soil'|'Coco'>('Soil');

    const handleSubmit = () => {
        if (!title || !strain) return;
        const newJournal: GrowJournalType = {
            id: `j_${Date.now()}`,
            userId: CURRENT_USER.id,
            user: CURRENT_USER,
            title,
            strain,
            method,
            startDate: new Date().toISOString().split('T')[0],
            status: 'Active',
            coverImage: `https://picsum.photos/800/400?random=${Date.now()}`,
            logs: [],
            likes: 0,
            views: 0
        };
        onCreate(newJournal);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-zinc-900 w-full max-w-lg rounded-3xl border border-white/10 p-6 relative shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={24} /></button>
                <h2 className="text-2xl font-black text-white mb-6">Start New Grow</h2>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Journal Title</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-white focus:border-gsn-green focus:outline-none" placeholder="e.g. Tent 1 - Winter Run" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Strain</label>
                        <input type="text" value={strain} onChange={e => setStrain(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-white focus:border-gsn-green focus:outline-none" placeholder="e.g. Blue Dream" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Method</label>
                        <select value={method} onChange={(e) => setMethod(e.target.value as any)} className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-white focus:border-gsn-green outline-none">
                            <option value="Soil">Soil</option>
                            <option value="Hydro">Hydroponics</option>
                            <option value="Coco">Coco Coir</option>
                        </select>
                    </div>
                    <button onClick={handleSubmit} disabled={!title || !strain} className="w-full bg-gsn-green text-black font-bold py-4 rounded-xl mt-4 hover:bg-green-400 transition-colors disabled:opacity-50">
                        Create Journal
                    </button>
                </div>
            </div>
        </div>
    );
};

const AddLogModal: React.FC<{ onClose: () => void, onSave: (l: GrowLogEntry) => void, journalStart: string }> = ({ onClose, onSave, journalStart }) => {
    const [notes, setNotes] = useState('');
    const [temp, setTemp] = useState('');
    const [humidity, setHumidity] = useState('');
    const [stage, setStage] = useState('Veg');
    const [images, setImages] = useState<string[]>([]);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files) as File[];
            setImageFiles(prev => [...prev, ...files]);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setImages(prev => [...prev, ...newPreviews]);
        }
    };

    const handleSubmit = async () => {
        setIsUploading(true);
        const diff = new Date().getTime() - new Date(journalStart).getTime();
        const days = Math.floor(diff / (1000 * 3600 * 24));
        const week = Math.ceil(days / 7) || 1;

        let finalImages = images;
        if (imageFiles.length > 0) {
            const urls = await Promise.all(imageFiles.map(file => uploadToCloudinary(file)));
            finalImages = urls;
        }

        const newLog: GrowLogEntry = {
            id: `l_${Date.now()}`,
            week,
            day: days,
            stage: stage as any,
            notes,
            temp: parseFloat(temp),
            humidity: parseFloat(humidity),
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            images: finalImages
        };
        setIsUploading(false);
        onSave(newLog);
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-zinc-900 w-full max-w-lg rounded-3xl border border-white/10 p-6 relative shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={24} /></button>
                <h2 className="text-xl font-bold text-white mb-6">New Entry</h2>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Stage</label>
                            <select value={stage} onChange={e => setStage(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-white outline-none">
                                <option>Seedling</option>
                                <option>Veg</option>
                                <option>Flower</option>
                                <option>Harvest</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Add Photo</label>
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-zinc-400 flex items-center justify-center gap-2 hover:text-white"
                            >
                                <Camera size={16} /> Upload
                            </button>
                            <input type="file" ref={fileInputRef} hidden multiple accept="image/*" onChange={handleImageSelect} />
                        </div>
                    </div>

                    {images.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {images.map((img, i) => (
                                <img key={i} src={img} className="w-16 h-16 object-cover rounded-lg border border-white/10" />
                            ))}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Temp (°F)</label>
                            <input type="number" value={temp} onChange={e => setTemp(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-white outline-none" placeholder="75" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Humidity (%)</label>
                            <input type="number" value={humidity} onChange={e => setHumidity(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-white outline-none" placeholder="60" />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Notes</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-white outline-none h-32 resize-none" placeholder="How are the ladies looking today?" />
                    </div>

                    <button onClick={handleSubmit} disabled={isUploading} className="w-full bg-white text-black font-bold py-4 rounded-xl mt-2 hover:bg-zinc-200 transition-colors">
                        {isUploading ? 'Uploading...' : 'Save Log'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default GrowJournal;