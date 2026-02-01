
import React, { useState, useRef } from 'react';
import { ArrowLeft, Plus, Image as ImageIcon, CreditCard, CheckCircle, BarChart2, Calendar, MousePointer, Eye, DollarSign, X, ExternalLink, Zap, Globe, Loader2, Sparkles } from 'lucide-react';
import { CURRENT_USER } from '../constants';
import { AdCampaign } from '../types';
import { calculateAdCost } from '../utils';

interface AdCenterProps {
    onBack: () => void;
}

// Mock initial data
const MOCK_CAMPAIGNS: AdCampaign[] = [
    {
        id: 'ad_1',
        userId: CURRENT_USER.id,
        content: 'Check out the new organic nutrients lineup! 🌱',
        image: 'https://picsum.photos/800/400?random=ad1',
        link: 'https://greenstoners.com/shop',
        linkText: 'Shop Now',
        durationDays: 7,
        cost: 21,
        currency: 'USD',
        status: 'Active',
        impressions: 12450,
        clicks: 342,
        startDate: '2023-10-20'
    }
];

const AdCenter: React.FC<AdCenterProps> = ({ onBack }) => {
    const [view, setView] = useState<'dashboard' | 'create'>('dashboard');
    const [campaigns, setCampaigns] = useState<AdCampaign[]>(MOCK_CAMPAIGNS);

    if (view === 'create') {
        return <CreateAdFlow onBack={() => setView('dashboard')} onComplete={(ad) => {
            setCampaigns([ad, ...campaigns]);
            setView('dashboard');
        }} />;
    }

    return (
        <div className="min-h-screen bg-black pb-20 md:pb-0">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-zinc-900/90 backdrop-blur-md border-b border-white/10 p-4">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                            AD MANAGER <span className="bg-gsn-green text-black text-[10px] px-2 py-0.5 rounded uppercase font-bold">Beta</span>
                        </h1>
                    </div>
                </div>
            </div>

            <div className="p-4 md:p-8 max-w-5xl mx-auto">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-zinc-900 border border-white/5 p-6 rounded-2xl">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400"><Eye size={24} /></div>
                            <span className="text-xs text-zinc-500 font-bold uppercase">Total Views</span>
                        </div>
                        <p className="text-3xl font-black text-white">45.2k</p>
                        <p className="text-xs text-green-500 mt-1 font-bold">+12% this week</p>
                    </div>
                    <div className="bg-zinc-900 border border-white/5 p-6 rounded-2xl">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-gsn-green/10 rounded-xl text-gsn-green"><MousePointer size={24} /></div>
                            <span className="text-xs text-zinc-500 font-bold uppercase">Total Clicks</span>
                        </div>
                        <p className="text-3xl font-black text-white">1,240</p>
                        <p className="text-xs text-green-500 mt-1 font-bold">+5% this week</p>
                    </div>
                    <div className="bg-zinc-900 border border-white/5 p-6 rounded-2xl">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400"><DollarSign size={24} /></div>
                            <span className="text-xs text-zinc-500 font-bold uppercase">Spend</span>
                        </div>
                        <p className="text-3xl font-black text-white">$420.00</p>
                    </div>
                </div>

                {/* Campaigns List */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Your Campaigns</h2>
                    <button 
                        onClick={() => setView('create')}
                        className="bg-gsn-green text-black px-6 py-2.5 rounded-full font-bold flex items-center gap-2 hover:bg-green-400 transition-all shadow-lg shadow-green-500/20"
                    >
                        <Plus size={20} /> Create New Ad
                    </button>
                </div>

                <div className="space-y-4">
                    {campaigns.map(ad => (
                        <div key={ad.id} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row gap-6 hover:border-gsn-green/30 transition-colors">
                            <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden bg-black shrink-0 relative">
                                <img src={ad.image} className="w-full h-full object-cover" alt="Ad" />
                                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur px-2 py-0.5 rounded text-[10px] text-white font-bold">
                                    {ad.status}
                                </div>
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-white text-lg line-clamp-1">{ad.content}</h3>
                                    <span className="text-zinc-500 text-xs font-mono">{ad.startDate}</span>
                                </div>
                                <a href={ad.link} target="_blank" rel="noreferrer" className="text-gsn-green text-xs hover:underline flex items-center gap-1 mb-4">
                                    {ad.link} <ExternalLink size={10} />
                                </a>
                                
                                <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-4">
                                    <div>
                                        <p className="text-zinc-500 text-[10px] uppercase font-bold">Duration</p>
                                        <p className="text-white font-bold">{ad.durationDays} Days</p>
                                    </div>
                                    <div>
                                        <p className="text-zinc-500 text-[10px] uppercase font-bold">Impressions</p>
                                        <p className="text-white font-bold">{ad.impressions.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-zinc-500 text-[10px] uppercase font-bold">Clicks</p>
                                        <p className="text-white font-bold">{ad.clicks.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const CreateAdFlow = ({ onBack, onComplete }: { onBack: () => void, onComplete: (ad: AdCampaign) => void }) => {
    const [step, setStep] = useState(1);
    const [content, setContent] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [link, setLink] = useState('');
    const [cta, setCta] = useState('Shop Now');
    const [duration, setDuration] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const costData = calculateAdCost(duration);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handlePayment = (gateway: 'PayChangu' | 'PayPal') => {
        setIsProcessing(true);
        // Simulate API Payment Delay
        setTimeout(() => {
            setIsProcessing(false);
            const newAd: AdCampaign = {
                id: `ad_${Date.now()}`,
                userId: CURRENT_USER.id,
                content,
                image: image || 'https://picsum.photos/800/400',
                link,
                linkText: cta,
                durationDays: duration,
                cost: costData.amount,
                currency: costData.currency,
                status: 'Active',
                impressions: 0,
                clicks: 0,
                startDate: new Date().toLocaleDateString()
            };
            onComplete(newAd);
        }, 3000);
    };

    return (
        <div className="min-h-screen bg-black flex flex-col">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-white/10 bg-zinc-900 sticky top-0 z-50">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white">
                    <X size={24} />
                </button>
                <h2 className="font-bold text-white">Create Campaign</h2>
                <div className="w-10"></div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-xl mx-auto p-6 space-y-8">
                    
                    {/* Progress */}
                    <div className="flex items-center gap-2 mb-8">
                        <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-gsn-green' : 'bg-zinc-800'}`}></div>
                        <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-gsn-green' : 'bg-zinc-800'}`}></div>
                        <div className={`h-1 flex-1 rounded-full ${step >= 3 ? 'bg-gsn-green' : 'bg-zinc-800'}`}></div>
                    </div>

                    {/* Step 1: Content */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                            <h3 className="text-2xl font-black text-white">Design Your Ad</h3>
                            
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className={`w-full aspect-video rounded-2xl border-2 border-dashed ${image ? 'border-transparent' : 'border-zinc-700 hover:border-gsn-green'} bg-zinc-900 flex flex-col items-center justify-center cursor-pointer overflow-hidden group relative transition-colors`}
                            >
                                {image ? (
                                    <>
                                        <img src={image} className="w-full h-full object-cover" alt="Preview" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <p className="font-bold text-white">Change Image</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="p-4 bg-zinc-800 rounded-full mb-3 text-zinc-400 group-hover:text-gsn-green transition-colors">
                                            <ImageIcon size={32} />
                                        </div>
                                        <p className="text-zinc-400 text-sm font-bold">Upload Media</p>
                                    </>
                                )}
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Ad Text</label>
                                <textarea 
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="What are you promoting?"
                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gsn-green h-32 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Link URL</label>
                                    <input 
                                        type="text" 
                                        value={link}
                                        onChange={(e) => setLink(e.target.value)}
                                        placeholder="https://"
                                        className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-gsn-green text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Button Text</label>
                                    <select 
                                        value={cta} 
                                        onChange={(e) => setCta(e.target.value)}
                                        className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-gsn-green text-sm"
                                    >
                                        <option>Shop Now</option>
                                        <option>Learn More</option>
                                        <option>Sign Up</option>
                                        <option>View Profile</option>
                                    </select>
                                </div>
                            </div>

                            <button 
                                onClick={() => setStep(2)}
                                disabled={!content || !image || !link}
                                className={`w-full py-4 rounded-xl font-bold text-black transition-all ${content && image && link ? 'bg-gsn-green hover:bg-green-400' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
                            >
                                Next Step
                            </button>
                        </div>
                    )}

                    {/* Step 2: Duration */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                            <h3 className="text-2xl font-black text-white">Duration & Budget</h3>
                            
                            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-sm font-bold text-zinc-400">Daily Budget</span>
                                    <span className="text-white font-bold">$3.00 USD / Day</span>
                                </div>
                                
                                <div className="mb-8">
                                    <div className="flex justify-between mb-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase">Run For</label>
                                        <span className="text-gsn-green font-bold">{duration} Days</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="1" 
                                        max="30" 
                                        value={duration} 
                                        onChange={(e) => setDuration(parseInt(e.target.value))}
                                        className="w-full accent-gsn-green h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-[10px] text-zinc-600 mt-2 font-mono">
                                        <span>1 Day</span>
                                        <span>30 Days</span>
                                    </div>
                                </div>

                                <div className="border-t border-white/10 pt-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-white">Total Cost</span>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-gsn-green">{costData.display}</p>
                                            <p className="text-xs text-zinc-500 uppercase font-bold">{costData.currency}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Preview Card */}
                            <div>
                                <label className="text-xs font-bold text-zinc-500 uppercase mb-3 block">Preview</label>
                                <div className="bg-zinc-900 rounded-2xl p-4 border border-white/5 opacity-80 pointer-events-none scale-95 origin-top">
                                    <div className="flex gap-3 mb-3">
                                        <img src={CURRENT_USER.avatar} className="w-10 h-10 rounded-full" alt="User" />
                                        <div>
                                            <p className="font-bold text-white text-sm">{CURRENT_USER.name} <Zap size={10} className="inline text-yellow-400" fill="currentColor"/></p>
                                            <p className="text-[10px] text-zinc-500 uppercase">Sponsored</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-zinc-200 mb-3">{content}</p>
                                    <div className="rounded-xl overflow-hidden mb-3">
                                        <img src={image!} className="w-full h-48 object-cover" alt="Ad" />
                                        <div className="bg-zinc-800 p-3 flex justify-between items-center">
                                            <span className="text-xs text-zinc-400">{new URL(link).hostname}</span>
                                            <span className="text-xs font-bold text-white flex items-center gap-1">{cta} <ExternalLink size={12}/></span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button onClick={() => setStep(1)} className="flex-1 py-4 bg-zinc-800 rounded-xl font-bold text-white hover:bg-zinc-700 transition-colors">Back</button>
                                <button onClick={() => setStep(3)} className="flex-[2] py-4 bg-gsn-green text-black rounded-xl font-bold hover:bg-green-400 transition-colors">Proceed to Payment</button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Payment */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                            <h3 className="text-2xl font-black text-white">Select Payment</h3>
                            
                            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 mb-4">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-zinc-400 text-sm">Amount to Pay</span>
                                    <span className="text-xl font-black text-white">{costData.display}</span>
                                </div>
                                <div className="text-right text-xs text-zinc-500 uppercase font-bold">{costData.currency}</div>
                            </div>

                            {isProcessing ? (
                                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                    <Loader2 size={48} className="text-gsn-green animate-spin" />
                                    <p className="text-white font-bold">Processing Payment...</p>
                                    <p className="text-zinc-500 text-sm">Please do not close this window.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <button 
                                        onClick={() => handlePayment('PayChangu')}
                                        className="w-full p-4 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-between hover:border-gsn-green transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                                                {/* PayChangu Logo Placeholder */}
                                                <span className="font-black text-black text-xs">PCh</span>
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-white group-hover:text-gsn-green transition-colors">PayChangu</p>
                                                <p className="text-xs text-zinc-500">Mobile Money, Card (Africa)</p>
                                            </div>
                                        </div>
                                        <div className="w-6 h-6 rounded-full border-2 border-zinc-700 group-hover:border-gsn-green group-hover:bg-gsn-green/20"></div>
                                    </button>

                                    <button 
                                        onClick={() => handlePayment('PayPal')}
                                        className="w-full p-4 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-between hover:border-blue-500 transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600">
                                                {/* PayPal Logo Placeholder */}
                                                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M7.076 21.337l.732-4.632 2.668-1.764.757-4.793h2.643l-1.63 10.323H9.136l-.37 2.353H2.93l.35-2.217.37-2.353.49-3.107H2.93l4.146 6.19zM17.067 9.87c-.63 2.768-3.418 4.21-6.155 4.394l-.32 2.023-.37 2.354h-2.67l.37-2.354.73-4.633.918-5.817h3.832c2.25 0 3.73.99 4.093 3.42.063.352.09.712.08 1.074.004-.37-.024-.736-.08-1.074.062.352.09.712.08 1.074 0 0 0 .002 0 .003zM20.25 6.757c-.773 3.407-4.188 5.18-7.54 5.405l-.26 1.635-.37 2.354h-2.67l.37-2.354 1.648-10.426h4.72c2.753 0 4.567 1.21 5.013 4.185.08.43.11.87.09 1.312.003-.45-.03-.896-.09-1.313.08.43.11.87.09 1.312 0 0 0 .003 0 .004z"/></svg>
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-white group-hover:text-blue-500 transition-colors">PayPal</p>
                                                <p className="text-xs text-zinc-500">International Cards</p>
                                            </div>
                                        </div>
                                        <div className="w-6 h-6 rounded-full border-2 border-zinc-700 group-hover:border-blue-500 group-hover:bg-blue-500/20"></div>
                                    </button>
                                    
                                    <div className="flex gap-4 mt-8">
                                        <button onClick={() => setStep(2)} className="flex-1 py-4 bg-zinc-800 rounded-xl font-bold text-white hover:bg-zinc-700 transition-colors">Back</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdCenter;
