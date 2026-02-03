
import React, { useState, useEffect } from 'react';
import { 
    Leaf, ArrowRight, ChevronDown, ChevronUp, Moon, Sun, Lock, Shield, 
    FileText, CheckCircle, Mail, User, Eye, EyeOff, CheckSquare, 
    Instagram, Twitter, Linkedin, Github, MessageSquare, Zap, Flame, 
    Camera, ShoppingBag, Radio, Heart, Globe, Briefcase, GraduationCap, 
    Search, HelpCircle, AlertTriangle, Send, Users, BookOpen, ShieldCheck,
    MapPin, TrendingUp, Sprout, Megaphone, Terminal, Cpu, Boxes, Store,
    Truck, Award, Headphones, Map
} from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { createUserProfile, userProfileExists } from '../services/userService';
import { formatCurrency } from '../utils';

interface LandingPageProps {
    onEnterApp: () => void;
    isAuthenticated: boolean;
}

type PublicView = 
    'HOME' | 'LOGIN' | 'SIGNUP' | 
    'TERMS' | 'PRIVACY' | 'COOKIES' | 'RULES' | 
    'MARKETPLACE' | 'LINK_UP' |
    'MANIFESTO' | 'CAREERS' | 'MERCH' | 'PARTNERS' |
    'HELP' | 'SAFETY' | 'CONTACT';

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, isAuthenticated }) => {
    const [view, setView] = useState<PublicView>('HOME');

    const navigate = (newView: PublicView) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setView(newView);
    };

    const renderView = () => {
        switch (view) {
            // Main Views
            case 'HOME': return <HomeView onNavigate={navigate} onEnterApp={onEnterApp} isAuthenticated={isAuthenticated} />;
            case 'LOGIN': return <LoginView onNavigate={navigate} onEnterApp={onEnterApp} />;
            case 'SIGNUP': return <SignupView onNavigate={navigate} onEnterApp={onEnterApp} />;
            
            // Platform Pages
            case 'MARKETPLACE': return <PublicMarketplaceView onNavigate={navigate} />;
            case 'LINK_UP': return <LinkUpPreviewView onNavigate={navigate} />;
            
            // Company Pages
            case 'MANIFESTO': return <ManifestoView onNavigate={navigate} />;
            case 'CAREERS': return <CareersView onNavigate={navigate} />;
            case 'MERCH': return <MerchView onNavigate={navigate} />;
            case 'PARTNERS': return <PartnersView onNavigate={navigate} />;
            
            // Support Pages
            case 'HELP': return <HelpCenterView onNavigate={navigate} />;
            case 'SAFETY': return <SafetyView onNavigate={navigate} />;
            case 'CONTACT': return <ContactView onNavigate={navigate} />;
            
            // Legal Pages
            case 'RULES': return <LegalView title="Community Rules" onNavigate={navigate} />;
            case 'TERMS': return <LegalView title="Terms of Service" onNavigate={navigate} />;
            case 'PRIVACY': return <LegalView title="Privacy Policy" onNavigate={navigate} />;
            case 'COOKIES': return <LegalView title="Cookie Policy" onNavigate={navigate} />;
            
            default: return <HomeView onNavigate={navigate} onEnterApp={onEnterApp} isAuthenticated={isAuthenticated} />;
        }
    };

    const showFooter = view !== 'LOGIN' && view !== 'SIGNUP';

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-gsn-green selection:text-black">
            <PublicHeader onNavigate={navigate} currentView={view} isAuthenticated={isAuthenticated} onEnterApp={onEnterApp} />
            {renderView()}
            {showFooter && <PublicFooter onNavigate={navigate} />}
        </div>
    );
};

const PublicHeader = ({ onNavigate, currentView, isAuthenticated, onEnterApp }: { onNavigate: (v: PublicView) => void, currentView: PublicView, isAuthenticated: boolean, onEnterApp: () => void }) => (
    <nav className="fixed top-0 left-0 right-0 z-50 mix-blend-difference py-4 px-6 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <button onClick={() => onNavigate('HOME')} className="flex items-center gap-2 group">
                <span className="material-symbols-outlined text-white text-3xl">cannabis</span>
                <span className="text-lg font-bold tracking-tighter text-white">GREEN</span>
            </button>
            
            <div className="flex items-center gap-4">
                {isAuthenticated ? (
                     <button 
                        onClick={onEnterApp}
                        className="bg-white text-black px-5 py-2 rounded-full font-bold text-xs hover:bg-zinc-200 transition-all"
                    >
                        Enter App
                    </button>
                ) : (
                    currentView !== 'LOGIN' && currentView !== 'SIGNUP' && (
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => onNavigate('LOGIN')}
                                className="text-white font-bold text-xs hover:text-zinc-300 transition-colors hidden md:block"
                            >
                                Login
                            </button>
                            <button 
                                onClick={() => onNavigate('SIGNUP')}
                                className="bg-white text-black px-5 py-2 rounded-full font-bold text-xs hover:bg-zinc-200 transition-all"
                            >
                                Join
                            </button>
                        </div>
                    )
                )}
            </div>
        </div>
    </nav>
);

const PublicFooter = ({ onNavigate }: { onNavigate: (v: PublicView) => void }) => {
    return (
        <footer className="bg-black border-t border-white/5 pt-12 pb-8 px-6 relative overflow-hidden">
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
                    <div className="col-span-2 lg:col-span-2 space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-white text-2xl">cannabis</span>
                            <span className="text-lg font-bold text-white tracking-tighter">GREEN</span>
                        </div>
                        <p className="text-zinc-500 text-xs leading-relaxed max-w-xs">
                            The definitive home for Smokers and Enthusiasts. Uncensored connection for the culture.
                        </p>
                    </div>
                    {/* Simplified Footer Columns */}
                    <div className="space-y-3">
                        <h4 className="text-white font-bold text-xs uppercase tracking-widest">Platform</h4>
                        <ul className="space-y-2 text-zinc-500 text-xs">
                            <li onClick={() => onNavigate('MARKETPLACE')} className="hover:text-white cursor-pointer transition-colors">Marketplace</li>
                            <li onClick={() => onNavigate('LINK_UP')} className="hover:text-white cursor-pointer transition-colors">Link Up Map</li>
                            <li onClick={() => onNavigate('LOGIN')} className="hover:text-white cursor-pointer transition-colors">Login</li>
                        </ul>
                    </div>
                    <div className="space-y-3">
                        <h4 className="text-white font-bold text-xs uppercase tracking-widest">Company</h4>
                        <ul className="space-y-2 text-zinc-500 text-xs">
                            <li onClick={() => onNavigate('MANIFESTO')} className="hover:text-white cursor-pointer transition-colors">Manifesto</li>
                            <li onClick={() => onNavigate('CAREERS')} className="hover:text-white cursor-pointer transition-colors">Careers</li>
                            <li onClick={() => onNavigate('MERCH')} className="hover:text-white cursor-pointer transition-colors">Merch</li>
                            <li onClick={() => onNavigate('PARTNERS')} className="hover:text-white cursor-pointer transition-colors">Partners</li>
                            <li onClick={() => onNavigate('CONTACT')} className="hover:text-white cursor-pointer transition-colors">Contact</li>
                        </ul>
                    </div>
                    <div className="space-y-3">
                        <h4 className="text-white font-bold text-xs uppercase tracking-widest">Support</h4>
                        <ul className="space-y-2 text-zinc-500 text-xs">
                            <li onClick={() => onNavigate('HELP')} className="hover:text-white cursor-pointer transition-colors">Help Center</li>
                            <li onClick={() => onNavigate('SAFETY')} className="hover:text-white cursor-pointer transition-colors">Safety</li>
                            <li onClick={() => onNavigate('RULES')} className="hover:text-white cursor-pointer transition-colors">Community Rules</li>
                        </ul>
                    </div>
                    <div className="space-y-3">
                        <h4 className="text-white font-bold text-xs uppercase tracking-widest">Social</h4>
                        <div className="flex gap-4">
                            <SocialIcon icon={<Twitter size={16} />} />
                            <SocialIcon icon={<Instagram size={16} />} />
                            <SocialIcon icon={<Github size={16} />} />
                        </div>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 text-[10px] text-zinc-600 gap-4">
                    <p>&copy; 2024 Green Stoners Network. All rights reserved.</p>
                    <div className="flex gap-6">
                        <button onClick={() => onNavigate('TERMS')} className="hover:text-white transition-colors">Terms</button>
                        <button onClick={() => onNavigate('PRIVACY')} className="hover:text-white transition-colors">Privacy</button>
                        <button onClick={() => onNavigate('COOKIES')} className="hover:text-white transition-colors">Cookies</button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const SocialIcon = ({ icon }: { icon: React.ReactNode }) => (
    <a href="#" className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-white hover:text-black transition-all">
        {icon}
    </a>
);

// --- UNIQUE PAGE IMPLEMENTATIONS ---

// 1. Marketplace Preview
const PublicMarketplaceView = ({ onNavigate }: any) => (
    <div className="min-h-screen bg-black pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter">THE <span className="text-gsn-green">STASH</span></h2>
                <p className="text-zinc-400 text-lg">
                    Buy, sell, and trade genetics, glass, and equipment peer-to-peer. 
                    <br/>The world's first open market for the culture.
                </p>
                <button onClick={() => onNavigate('SIGNUP')} className="mt-8 px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-all">Start Trading</button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
                {['Seeds', 'Glass', 'Lights', 'Nutrients'].map((cat, i) => (
                    <div key={i} className="aspect-square bg-zinc-900 rounded-3xl border border-white/5 flex flex-col items-center justify-center group cursor-pointer hover:border-gsn-green/50 transition-all">
                        <ShoppingBag size={32} className="text-zinc-500 group-hover:text-gsn-green mb-4 transition-colors" />
                        <span className="font-bold text-white">{cat}</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-zinc-900/50 rounded-3xl overflow-hidden border border-white/5 group">
                        <div className="h-64 relative">
                            <img src={`https://picsum.photos/600/600?random=${i+50}`} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" alt="Item" />
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="px-4 py-2 bg-white text-black font-bold rounded-full text-xs">Login to View Price</span>
                            </div>
                        </div>
                        <div className="p-6">
                            <h4 className="font-bold text-white text-lg mb-1">Premium Item #{i}</h4>
                            <p className="text-zinc-500 text-sm">Verified Seller • Denver, CO</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// 2. Link Up Preview (Map/Radar aesthetic)
const LinkUpPreviewView = ({ onNavigate }: any) => (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden flex flex-col pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(74,222,128,0.1)_0%,transparent_70%)] pointer-events-none"></div>
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6">
            <div className="w-24 h-24 rounded-full border-2 border-gsn-green bg-black/50 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(74,222,128,0.4)] animate-pulse">
                <MapPin size={40} className="text-gsn-green" />
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-6">LINK UP</h1>
            <p className="text-xl text-zinc-400 max-w-xl mb-10">
                Find sesh spots, local events, and fellow enthusiasts on the live map. 
                <br/>Your circle just got bigger.
            </p>
            
            <div className="flex gap-4">
                <button onClick={() => onNavigate('SIGNUP')} className="px-8 py-4 bg-gsn-green text-black font-black rounded-xl hover:bg-green-400 transition-all flex items-center gap-2">
                    <Radio size={20} /> GO LIVE
                </button>
            </div>

            <div className="mt-20 grid grid-cols-3 gap-12 text-center">
                <div>
                    <div className="text-3xl font-black text-white">15k+</div>
                    <div className="text-xs text-gsn-green font-bold uppercase tracking-widest mt-2">Active Signals</div>
                </div>
                <div>
                    <div className="text-3xl font-black text-white">420</div>
                    <div className="text-xs text-gsn-green font-bold uppercase tracking-widest mt-2">Cities</div>
                </div>
                <div>
                    <div className="text-3xl font-black text-white">24/7</div>
                    <div className="text-xs text-gsn-green font-bold uppercase tracking-widest mt-2">Live Activity</div>
                </div>
            </div>
        </div>
    </div>
);

// 3. Manifesto (Typography Heavy)
const ManifestoView = ({ onNavigate }: any) => (
    <div className="min-h-screen bg-zinc-950 pt-32 px-6 pb-20">
        <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter leading-[0.85] mb-12">
                WE ARE <br/> THE <span className="text-transparent bg-clip-text bg-gradient-to-b from-gsn-green to-emerald-800">CULTURE</span>.
            </h1>
            
            <div className="space-y-8 text-xl md:text-3xl font-light text-zinc-300 leading-normal max-w-3xl">
                <p>
                    For too long, our community has been shadowed by stigma and silenced by algorithms.
                </p>
                <p>
                    <strong className="text-white font-bold">Green</strong> is our answer. A digital sanctuary built by smokers, for smokers.
                </p>
                <p>
                    We believe in the right to grow. The right to share. The right to connect without fear of censorship.
                </p>
                <p>
                    This isn't just an app. It's a movement.
                </p>
            </div>

            <div className="mt-20 pt-12 border-t border-white/10 flex justify-between items-end">
                <div className="text-zinc-500 text-sm font-mono">EST. 2024 • WORLDWIDE</div>
                <button onClick={() => onNavigate('SIGNUP')} className="text-white text-lg font-bold hover:text-gsn-green flex items-center gap-2 group transition-colors">
                    Join the Movement <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    </div>
);

// 4. Careers (Corporate/Cool)
const CareersView = ({ onNavigate }: any) => (
    <div className="min-h-screen bg-black pt-24 px-6 pb-20">
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start mb-20">
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Briefcase size={20} className="text-gsn-green" />
                        <span className="text-gsn-green font-bold uppercase tracking-widest text-xs">Careers</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight">BUILD THE <br/> FUTURE.</h1>
                </div>
                <p className="text-zinc-400 max-w-md mt-8 md:mt-0 text-lg">
                    We're looking for passionate growers, engineers, and creatives to help us build the world's largest cannabis network.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                <div className="p-8 bg-zinc-900/50 rounded-[2rem] border border-white/5">
                    <Globe size={32} className="text-white mb-6" />
                    <h3 className="text-xl font-bold text-white mb-2">Remote First</h3>
                    <p className="text-zinc-400 text-sm">Work from anywhere. We care about output, not hours.</p>
                </div>
                <div className="p-8 bg-zinc-900/50 rounded-[2rem] border border-white/5">
                    <Heart size={32} className="text-white mb-6" />
                    <h3 className="text-xl font-bold text-white mb-2">Full Health</h3>
                    <p className="text-zinc-400 text-sm">Comprehensive medical, dental, and vision coverage.</p>
                </div>
                <div className="p-8 bg-zinc-900/50 rounded-[2rem] border border-white/5">
                    <Sprout size={32} className="text-white mb-6" />
                    <h3 className="text-xl font-bold text-white mb-2">Product Samples</h3>
                    <p className="text-zinc-400 text-sm">Regular "research" materials for verified staff in legal states.</p>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-8 border-b border-white/10 pb-4">Open Positions</h2>
            <div className="space-y-4">
                {['Senior React Engineer', 'Community Manager (Denver)', 'Growth Marketer', 'Content Moderator'].map((role, i) => (
                    <div key={i} className="flex items-center justify-between p-6 bg-zinc-900 rounded-2xl hover:bg-zinc-800 transition-colors group cursor-pointer">
                        <div>
                            <h3 className="font-bold text-white text-lg group-hover:text-gsn-green transition-colors">{role}</h3>
                            <p className="text-zinc-500 text-sm">Engineering • Remote</p>
                        </div>
                        <ArrowRight size={20} className="text-zinc-500 group-hover:text-white transition-colors" />
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// 5. Merch Store (Visual/Gallery)
const MerchView = ({ onNavigate }: any) => (
    <div className="min-h-screen bg-black pt-24 px-6 pb-20">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <span className="text-gsn-green font-bold uppercase tracking-widest text-xs mb-2 block">Official Gear</span>
                <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter">REP THE <span className="text-stroke">NET</span></h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                    { name: 'Stealth Hoodie', price: '$65', img: 'https://picsum.photos/600/800?random=hoodie' },
                    { name: 'Crop Tee', price: '$35', img: 'https://picsum.photos/600/800?random=tee' },
                    { name: 'Grinder v2', price: '$45', img: 'https://picsum.photos/600/800?random=grinder' },
                    { name: 'Smell-Proof Bag', price: '$55', img: 'https://picsum.photos/600/800?random=bag' },
                    { name: 'Dad Hat', price: '$30', img: 'https://picsum.photos/600/800?random=hat' },
                    { name: 'Rolling Tray', price: '$25', img: 'https://picsum.photos/600/800?random=tray' },
                ].map((item, i) => (
                    <div key={i} className="group cursor-pointer">
                        <div className="aspect-[3/4] bg-zinc-900 rounded-3xl overflow-hidden mb-4 relative">
                            <img src={item.img} className="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500" alt={item.name} />
                            <div className="absolute bottom-4 right-4 bg-white text-black font-bold px-3 py-1 rounded-full text-sm">
                                {item.price}
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-white group-hover:text-gsn-green transition-colors">{item.name}</h3>
                        <p className="text-zinc-500 text-sm">Limited Edition</p>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// 6. Partners (B2B Focus)
const PartnersView = ({ onNavigate }: any) => (
    <div className="min-h-screen bg-black pt-24 px-6 pb-20 flex flex-col items-center">
        <div className="max-w-4xl w-full text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6">GROW WITH GREEN</h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                Connect your brand directly with the most engaged cannabis community on the planet. 
                Targeted advertising, verified profiles, and direct-to-consumer tools.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-20">
            <div className="bg-zinc-900 p-8 rounded-3xl border border-white/5 text-center">
                <div className="text-4xl font-black text-white mb-2">45k+</div>
                <div className="text-zinc-500 text-sm uppercase tracking-widest font-bold">Active Smokers</div>
            </div>
            <div className="bg-zinc-900 p-8 rounded-3xl border border-white/5 text-center">
                <div className="text-4xl font-black text-white mb-2">85%</div>
                <div className="text-zinc-500 text-sm uppercase tracking-widest font-bold">Engagement Rate</div>
            </div>
            <div className="bg-zinc-900 p-8 rounded-3xl border border-white/5 text-center">
                <div className="text-4xl font-black text-white mb-2">3.5x</div>
                <div className="text-zinc-500 text-sm uppercase tracking-widest font-bold">ROAS Average</div>
            </div>
        </div>

        <div className="bg-gradient-to-br from-zinc-900 to-black p-10 rounded-[3rem] border border-white/10 w-full max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Partner Application</h2>
            <p className="text-zinc-400 mb-8 text-sm">
                We are currently vetting new brand partners. Apply now to get early access to our business tools.
            </p>
            <form className="max-w-md mx-auto space-y-4">
                <input type="text" placeholder="Brand Name" className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white focus:border-gsn-green focus:outline-none" />
                <input type="email" placeholder="Business Email" className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white focus:border-gsn-green focus:outline-none" />
                <button type="button" className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 transition-colors">Apply Now</button>
            </form>
        </div>
    </div>
);

// 7. Help Center (Search Focused)
const HelpCenterView = ({ onNavigate }: any) => (
    <div className="min-h-screen bg-black pt-32 px-6 pb-20">
        <div className="max-w-2xl mx-auto text-center mb-16">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-8">How can we help?</h1>
            <div className="relative">
                <Search className="absolute left-4 top-4 text-zinc-500" />
                <input 
                    type="text" 
                    placeholder="Search for answers..." 
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white text-lg focus:outline-none focus:border-gsn-green transition-colors"
                />
            </div>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {['Account Settings', 'Privacy & Safety', 'Marketplace', 'Content Rules', 'Verification', 'Advertising'].map((topic, i) => (
                <div key={i} className="p-6 bg-zinc-900/50 rounded-2xl border border-white/5 hover:bg-zinc-900 transition-colors cursor-pointer group">
                    <h3 className="font-bold text-white mb-2 group-hover:text-gsn-green transition-colors">{topic}</h3>
                    <p className="text-zinc-500 text-sm">Manage your settings and learn how {topic} works on Green.</p>
                </div>
            ))}
        </div>

        <div className="max-w-4xl mx-auto mt-16 text-center">
            <p className="text-zinc-400 mb-4">Still need help?</p>
            <button onClick={() => onNavigate('CONTACT')} className="text-gsn-green font-bold hover:underline">Contact Support</button>
        </div>
    </div>
);

// 8. Safety Center (Educational)
const SafetyView = ({ onNavigate }: any) => (
    <div className="min-h-screen bg-black pt-24 px-6 pb-20">
        <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row gap-12 items-center mb-20">
                <div className="flex-1">
                    <ShieldCheck size={64} className="text-gsn-green mb-6" />
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6">SAFE. SECURE. <br/> PRIVATE.</h1>
                    <p className="text-zinc-300 text-lg leading-relaxed">
                        Your safety is our priority. We use end-to-end encryption for all private messages and never sell your personal data. 
                        This is a sanctuary, not a surveillance state.
                    </p>
                </div>
                <div className="flex-1 bg-zinc-900 p-8 rounded-3xl border border-white/10">
                    <ul className="space-y-6">
                        <li className="flex gap-4">
                            <Lock className="text-white shrink-0" />
                            <div>
                                <h3 className="font-bold text-white">End-to-End Encryption</h3>
                                <p className="text-sm text-zinc-400">Your DMs are between you and the recipient. No one else.</p>
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <User className="text-white shrink-0" />
                            <div>
                                <h3 className="font-bold text-white">Age Verification</h3>
                                <p className="text-sm text-zinc-400">Strict 21+ policy to ensure a compliant community.</p>
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <EyeOff className="text-white shrink-0" />
                            <div>
                                <h3 className="font-bold text-white">Zero Tracking</h3>
                                <p className="text-sm text-zinc-400">We don't track your location unless you explicitly enable Link Up.</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 bg-blue-900/10 rounded-3xl border border-blue-500/20">
                    <h3 className="font-bold text-blue-400 text-xl mb-4">Reporting Content</h3>
                    <p className="text-zinc-300 mb-6">
                        If you see something that violates our community guidelines, report it immediately. Our moderation team reviews reports 24/7.
                    </p>
                    <button onClick={() => onNavigate('RULES')} className="text-white font-bold underline">Read Community Rules</button>
                </div>
                <div className="p-8 bg-gsn-green/10 rounded-3xl border border-gsn-green/20">
                    <h3 className="font-bold text-gsn-green text-xl mb-4">Mental Health Resources</h3>
                    <p className="text-zinc-300 mb-6">
                        Cannabis should enhance life, not escape it. If you're struggling with substance abuse, help is available.
                    </p>
                    <a href="#" className="text-white font-bold underline">Get Help</a>
                </div>
            </div>
        </div>
    </div>
);

// 9. Contact (Split Form)
const ContactView = ({ onNavigate }: any) => (
    <div className="min-h-screen bg-black pt-24 px-6 pb-20">
        <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-12 text-center">GET IN TOUCH</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                    <h3 className="text-2xl font-bold text-white mb-6">General Support</h3>
                    <p className="text-zinc-400 mb-8">For account issues, bug reports, and general feedback.</p>
                    <form className="space-y-4">
                        <input type="text" placeholder="Your Name" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-white" />
                        <input type="email" placeholder="Your Email" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-white" />
                        <textarea placeholder="How can we help?" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-white h-32 resize-none"></textarea>
                        <button type="button" className="bg-white text-black font-bold px-8 py-4 rounded-xl hover:bg-zinc-200 transition-colors">Send Message</button>
                    </form>
                </div>

                <div className="bg-zinc-900 p-10 rounded-[2rem] border border-white/5">
                    <h3 className="text-2xl font-bold text-white mb-6">Business Inquiries</h3>
                    <p className="text-zinc-400 mb-8">For partnerships, press, and advertising opportunities.</p>
                    
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 text-zinc-300">
                            <Mail size={20} className="text-gsn-green" />
                            <span>partnerships@green.app</span>
                        </div>
                        <div className="flex items-center gap-4 text-zinc-300">
                            <Megaphone size={20} className="text-gsn-green" />
                            <span>press@green.app</span>
                        </div>
                        <div className="flex items-center gap-4 text-zinc-300">
                            <MapPin size={20} className="text-gsn-green" />
                            <span>1200 Broadway, Denver, CO 80203</span>
                        </div>
                    </div>

                    <div className="mt-12">
                        <p className="text-xs font-bold text-zinc-500 uppercase mb-4">Connect</p>
                        <div className="flex gap-4">
                            <SocialIcon icon={<Twitter size={20} />} />
                            <SocialIcon icon={<Linkedin size={20} />} />
                            <SocialIcon icon={<Instagram size={20} />} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// --- Components for HomeView ---
const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-white/10 last:border-0">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-4 flex justify-between items-center text-left hover:text-gsn-green transition-colors group"
            >
                <span className={`font-bold text-base transition-colors ${isOpen ? 'text-gsn-green' : 'text-white'}`}>{question}</span>
                {isOpen ? <ChevronUp className="text-gsn-green" size={18} /> : <ChevronDown className="text-zinc-500 group-hover:text-white" size={18} />}
            </button>
            {isOpen && (
                <div className="pb-4 text-zinc-400 leading-relaxed animate-in slide-in-from-top-2 text-sm">
                    {answer}
                </div>
            )}
        </div>
    )
}

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl hover:border-gsn-green/30 transition-all hover:bg-zinc-900 group">
        <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-4 text-zinc-400 group-hover:text-gsn-green group-hover:scale-110 transition-all border border-white/5">
            {icon}
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-zinc-400 leading-relaxed text-xs">{desc}</p>
    </div>
);

const HomeView = ({ onNavigate, onEnterApp, isAuthenticated }: { onNavigate: (v: PublicView) => void, onEnterApp: () => void, isAuthenticated: boolean }) => (
    <div className="bg-black min-h-screen font-sans selection:bg-gsn-green selection:text-black">
        {/* Hero Section */}
        <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(74,222,128,0.1),transparent_70%)]"></div>
            <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none"></div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                <span className="text-[18vw] font-black text-white/5 tracking-tighter leading-none animate-pulse-slow">
                    STONER
                </span>
            </div>

            <div className="relative z-10 text-center space-y-6 px-4 max-w-4xl">
                <div className="inline-flex items-center gap-2 border border-white/10 rounded-full px-3 py-1 bg-white/5 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-1000">
                    <span className="w-1.5 h-1.5 rounded-full bg-gsn-green animate-pulse"></span>
                    <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Live Network</span>
                </div>

                <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.95] animate-in zoom-in-95 duration-1000 delay-100 mix-blend-overlay">
                    THE ULTIMATE <br/>
                    STONER NETWORK
                </h1>

                <p className="text-base md:text-lg text-zinc-400 max-w-lg mx-auto font-light leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                    Built by smokers, for smokers. The premier uncensored social sanctuary to share your sessions, discover new strains, and connect with the culture.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                    <button 
                        onClick={() => isAuthenticated ? onEnterApp() : onNavigate('SIGNUP')}
                        className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-all hover:scale-105 min-w-[160px] tracking-tight text-sm"
                    >
                        Join the Sesh
                    </button>
                    <button 
                        onClick={() => onNavigate('LOGIN')}
                        className="px-8 py-3 bg-transparent border border-white/20 text-white font-bold rounded-full hover:bg-white/5 transition-all min-w-[160px] tracking-tight text-sm"
                    >
                        Login
                    </button>
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-4 bg-black relative z-10">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12 max-w-xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">Everything You Need to <span className="text-gsn-green">Blaze</span>.</h2>
                    <p className="text-zinc-400 text-sm md:text-base">More than just a social network. Green is your daily destination for everything cannabis.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FeatureCard 
                        icon={<Shield size={24} />} 
                        title="Uncensored Social" 
                        desc="Post your smoke spots, new glass, and favorite strains without fear of bans. We protect your right to share." 
                    />
                    <FeatureCard 
                        icon={<Flame size={24} />} 
                        title="Strain Discovery" 
                        desc="Find what hits. Read real reviews from real smokers and discover new genetics dropping near you." 
                    />
                    <FeatureCard 
                        icon={<MapPin size={24} />} 
                        title="Link Up Map" 
                        desc="Find active sessions, chill spots, and like-minded friends in your area. Connect in the real world." 
                    />
                </div>
            </div>
        </section>

        {/* The Sesh Section */}
        <section className="py-24 px-4 bg-zinc-900/30 border-y border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gsn-green/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="relative">
                    <div className="aspect-[4/5] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl relative z-10">
                        <img src="https://picsum.photos/800/1000?random=sesh" className="w-full h-full object-cover opacity-90" alt="Sesh" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-6 flex flex-col justify-end">
                            <div className="flex items-center gap-3 mb-2">
                                <img src="https://picsum.photos/50/50?random=user2" className="w-8 h-8 rounded-full border-2 border-gsn-green" alt="User" />
                                <div>
                                    <p className="font-bold text-white text-xs">Sativa Diva</p>
                                    <p className="text-gsn-green text-[10px] font-bold uppercase">Connoisseur</p>
                                </div>
                            </div>
                            <p className="text-white text-base font-medium leading-tight">"Friday night vibes. This new piece hits incredibly smooth. 💨✨"</p>
                        </div>
                    </div>
                    {/* Decorative Elements */}
                    <div className="absolute -top-10 -left-10 w-24 h-24 bg-gsn-green/20 rounded-full blur-2xl"></div>
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl"></div>
                </div>
                
                <div>
                    <div className="w-14 h-14 bg-gsn-green/10 rounded-2xl flex items-center justify-center mb-6 border border-gsn-green/20">
                        <MessageSquare size={28} className="text-gsn-green" />
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter leading-none">
                        FIND YOUR <br/> <span className="text-zinc-500">FLOW</span>
                    </h2>
                    <p className="text-base text-zinc-400 mb-8 leading-relaxed max-w-md">
                        Connect with a community that shares your passion. Whether you're into rolling art, glass collecting, or just chilling, you'll find your people here.
                    </p>
                    <ul className="space-y-3 mb-8">
                        {['Uncensored Feed', 'Exclusive Strain Drops', 'Local Events & Sesh Groups'].map(item => (
                            <li key={item} className="flex items-center gap-3 text-white text-sm font-bold">
                                <div className="w-5 h-5 rounded-full bg-gsn-green flex items-center justify-center text-black">
                                    <CheckCircle size={12} />
                                </div>
                                {item}
                            </li>
                        ))}
                    </ul>
                    <button 
                        onClick={() => !isAuthenticated && onNavigate('SIGNUP')}
                        className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-all text-sm"
                    >
                        Join the Community
                    </button>
                </div>
            </div>
        </section>

        {/* Questions Section */}
        <section className="py-24 px-4 bg-black">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-black text-white mb-2">Frequently Asked Questions</h2>
                    <p className="text-zinc-400 text-sm">Got questions? We've got answers.</p>
                </div>
                
                <div className="space-y-2">
                    <FAQItem 
                        question="Is Green really uncensored?" 
                        answer="Yes. We do not ban users for posting cannabis-related content. We believe in your right to share your cultivation journey and lifestyle. However, we strictly prohibit illegal activities that violate federal or international laws regarding trafficking and harm." 
                    />
                    <FAQItem 
                        question="Can I sell my products here?" 
                        answer="Yes! Growers and brands can use our Advertising tools and Marketplace to reach smokers. While we facilitate connections, all transactions must adhere to local laws." 
                    />
                    <FAQItem 
                        question="Is my data safe?" 
                        answer="Absolutely. We use end-to-end encryption for private messages and never sell your personal data to third-party advertisers. Your privacy is our priority." 
                    />
                    <FAQItem 
                        question="Is the app free?" 
                        answer="Green is free to download and use for all smokers. We offer premium features for businesses and power users, but the core social experience will always be free." 
                    />
                </div>
            </div>
        </section>
    </div>
);

const LoginView = ({ onNavigate, onEnterApp }: { onNavigate: (v: PublicView) => void, onEnterApp: () => void }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err: any) {
            setError(err.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (err: any) {
            setError(err.message || 'Google login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 flex items-center justify-center px-4 bg-black">
            <div className="w-full max-w-sm space-y-6 animate-in fade-in duration-500">
                <div className="text-center">
                    <h2 className="text-2xl font-black text-white mb-1 tracking-tight">Welcome Back</h2>
                    <p className="text-zinc-400 text-sm">Enter the green zone.</p>
                </div>

                <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 space-y-5">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3 text-zinc-500" size={16} />
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black text-white text-sm rounded-xl py-2.5 pl-10 pr-4 border border-zinc-800 focus:outline-none focus:border-gsn-green transition-colors"
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase">Password</label>
                                <button className="text-[10px] text-gsn-green hover:underline font-bold">Forgot?</button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3 text-zinc-500" size={16} />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black text-white text-sm rounded-xl py-2.5 pl-10 pr-10 border border-zinc-800 focus:outline-none focus:border-gsn-green transition-colors"
                                    placeholder="••••••••"
                                />
                                <button 
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-zinc-500 hover:text-white"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs flex items-center gap-2">
                            <AlertTriangle size={14} /> {error}
                        </div>
                    )}

                    <button 
                        onClick={handleLogin}
                        disabled={loading || !email || !password}
                        className="w-full bg-gsn-green text-black font-black py-3 rounded-xl hover:bg-green-400 transition-all shadow-[0_0_20px_rgba(74,222,128,0.2)] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>

                    <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-zinc-800"></div>
                        <span className="flex-shrink-0 mx-4 text-zinc-600 text-[10px] uppercase font-bold">Or</span>
                        <div className="flex-grow border-t border-zinc-800"></div>
                    </div>

                    <button 
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-3 text-sm"
                    >
                        Continue with Google
                    </button>
                </div>

                <p className="text-center text-zinc-500 text-xs">
                    New to Green? <button onClick={() => onNavigate('SIGNUP')} className="text-white font-bold hover:underline">Join the movement</button>
                </p>
            </div>
        </div>
    );
};

const SignupView = ({ onNavigate, onEnterApp }: { onNavigate: (v: PublicView) => void, onEnterApp: () => void }) => {
    const [name, setName] = useState('');
    const [handle, setHandle] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [ageVerified, setAgeVerified] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!ageVerified) {
            setError("You must verify your age.");
            return;
        }
        setLoading(true);
        setError('');
        
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: name });
            await createUserProfile(userCredential.user.uid, {
                name: name,
                handle: handle.startsWith('@') ? handle : `@${handle}`,
                email: email,
                avatar: `https://picsum.photos/150/150?random=${Date.now()}`
            });
        } catch (err: any) {
            setError(err.message || "Failed to create account");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        if (!ageVerified) {
            setError("Please confirm you are 21+ to continue.");
            return;
        }
        setLoading(true);
        setError('');
        try {
            await signInWithPopup(auth, googleProvider);
            // Profile creation is handled in App.tsx onAuthStateChanged
        } catch (err: any) {
            setError(err.message || 'Google signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 flex items-center justify-center px-4 bg-black">
            <div className="w-full max-w-sm space-y-6 animate-in fade-in duration-500">
                <div className="text-center">
                    <h2 className="text-2xl font-black text-white mb-1 tracking-tight">Create Account</h2>
                    <p className="text-zinc-400 text-sm">Join the fastest growing cannabis community.</p>
                </div>

                <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Display Name</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black text-white text-sm rounded-xl py-2.5 px-3 border border-zinc-800 focus:outline-none focus:border-gsn-green transition-colors" placeholder="Dr. Green" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Username</label>
                            <input type="text" value={handle} onChange={(e) => setHandle(e.target.value)} className="w-full bg-black text-white text-sm rounded-xl py-2.5 px-3 border border-zinc-800 focus:outline-none focus:border-gsn-green transition-colors" placeholder="@dr_green" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black text-white text-sm rounded-xl py-2.5 px-3 border border-zinc-800 focus:outline-none focus:border-gsn-green transition-colors" placeholder="you@example.com" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black text-white text-sm rounded-xl py-2.5 px-3 border border-zinc-800 focus:outline-none focus:border-gsn-green transition-colors" placeholder="••••••••" />
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-xl cursor-pointer hover:bg-zinc-800 transition-colors" onClick={() => setAgeVerified(!ageVerified)}>
                        <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${ageVerified ? 'bg-gsn-green border-gsn-green' : 'border-zinc-600 bg-transparent'}`}>
                            {ageVerified && <CheckSquare size={12} className="text-black" />}
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed select-none">
                            I certify that I am 21+ years of age. I agree to the Terms & Privacy.
                        </p>
                    </div>
                    {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs flex items-center gap-2"><AlertTriangle size={14} /> {error}</div>}
                    
                    <button onClick={handleSignup} disabled={loading || !name || !email || !password || !ageVerified} className="w-full bg-gsn-green text-black font-black py-3 rounded-xl hover:bg-green-400 transition-all shadow-[0_0_20px_rgba(74,222,128,0.2)] disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                        {loading ? 'Creating Profile...' : 'Create Account'}
                    </button>

                    <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-zinc-800"></div>
                        <span className="flex-shrink-0 mx-4 text-zinc-600 text-[10px] uppercase font-bold">Or</span>
                        <div className="flex-grow border-t border-zinc-800"></div>
                    </div>

                    <button 
                        onClick={handleGoogleSignup}
                        disabled={loading}
                        className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-3 text-sm"
                    >
                        Continue with Google
                    </button>
                </div>
                <p className="text-center text-zinc-500 text-xs">
                    Already a member? <button onClick={() => onNavigate('LOGIN')} className="text-white font-bold hover:underline">Sign In</button>
                </p>
            </div>
        </div>
    );
};

const LegalView = ({ title, onNavigate }: { title: string, onNavigate: (v: PublicView) => void }) => (
    <div className="pt-24 pb-12 max-w-3xl mx-auto px-6 min-h-screen">
        <button onClick={() => onNavigate('HOME')} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors text-sm">
            <ArrowRight className="rotate-180" size={18} /> Back to Home
        </button>
        <h1 className="text-3xl font-black mb-6 text-white">{title}</h1>
        <div className="text-zinc-400 space-y-4 leading-relaxed text-sm">
            <p>Last Updated: October 2024</p>
            <p>Welcome to Green Stoners Network. By accessing our platform, you agree to comply with these terms...</p>
            <div className="h-64 bg-zinc-900 rounded-xl animate-pulse"></div>
            <p>[Legal content placeholder - This would contain full legal text in production]</p>
        </div>
    </div>
);

export default LandingPage;
