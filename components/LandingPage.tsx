
import React, { useState, useEffect } from 'react';
import { 
    Leaf, ArrowRight, ChevronDown, ChevronUp, Moon, Sun, Lock, Shield, 
    FileText, CheckCircle, Mail, User, Eye, EyeOff, CheckSquare, 
    Instagram, Twitter, Linkedin, Github, MessageSquare, Zap, Flame, 
    Camera, ShoppingBag, Radio, Heart, Globe, Briefcase, GraduationCap, 
    Search, HelpCircle, AlertTriangle, Send, Users, BookOpen, ShieldCheck,
    MapPin, TrendingUp, Sprout, Megaphone
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
            case 'RULES': return <LegalView title="Community Rules" onNavigate={navigate} />;
            
            // Legal Pages
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
    <nav className="fixed top-0 left-0 right-0 z-50 mix-blend-difference py-6 px-6 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <button onClick={() => onNavigate('HOME')} className="flex items-center gap-2 group">
                <Leaf className="w-6 h-6 text-white" />
                <span className="text-xl font-bold tracking-tighter text-white">GREEN</span>
            </button>
            
            <div className="flex items-center gap-4">
                {isAuthenticated ? (
                     <button 
                        onClick={onEnterApp}
                        className="bg-white text-black px-6 py-2 rounded-full font-bold text-sm hover:bg-zinc-200 transition-all"
                    >
                        Enter App
                    </button>
                ) : (
                    currentView !== 'LOGIN' && currentView !== 'SIGNUP' && (
                        <div className="flex items-center gap-6">
                            <button 
                                onClick={() => onNavigate('LOGIN')}
                                className="text-white font-bold text-sm hover:text-zinc-300 transition-colors hidden md:block"
                            >
                                Login
                            </button>
                            <button 
                                onClick={() => onNavigate('SIGNUP')}
                                className="bg-white text-black px-6 py-2 rounded-full font-bold text-sm hover:bg-zinc-200 transition-all"
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
        <footer className="bg-black border-t border-white/5 pt-20 pb-10 px-6 relative overflow-hidden">
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-2">
                            <Leaf className="w-6 h-6 text-white" />
                            <span className="text-2xl font-bold text-white tracking-tighter">GREEN</span>
                        </div>
                        <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
                            The definitive home for Smokers and Enthusiasts. Uncensored connection for the culture.
                        </p>
                    </div>
                    {/* Simplified Footer Columns */}
                    <div className="space-y-4">
                        <h4 className="text-white font-bold text-sm uppercase tracking-widest">Platform</h4>
                        <ul className="space-y-2 text-zinc-500 text-sm">
                            <li onClick={() => onNavigate('MARKETPLACE')} className="hover:text-white cursor-pointer transition-colors">Marketplace</li>
                            <li onClick={() => onNavigate('LINK_UP')} className="hover:text-white cursor-pointer transition-colors">Link Up Map</li>
                            <li onClick={() => onNavigate('LOGIN')} className="hover:text-white cursor-pointer transition-colors">Login</li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-white font-bold text-sm uppercase tracking-widest">Company</h4>
                        <ul className="space-y-2 text-zinc-500 text-sm">
                            <li onClick={() => onNavigate('MANIFESTO')} className="hover:text-white cursor-pointer transition-colors">Manifesto</li>
                            <li onClick={() => onNavigate('CAREERS')} className="hover:text-white cursor-pointer transition-colors">Careers</li>
                            <li onClick={() => onNavigate('CONTACT')} className="hover:text-white cursor-pointer transition-colors">Contact</li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-white font-bold text-sm uppercase tracking-widest">Support</h4>
                        <ul className="space-y-2 text-zinc-500 text-sm">
                            <li onClick={() => onNavigate('HELP')} className="hover:text-white cursor-pointer transition-colors">Help Center</li>
                            <li onClick={() => onNavigate('SAFETY')} className="hover:text-white cursor-pointer transition-colors">Safety</li>
                            <li onClick={() => onNavigate('RULES')} className="hover:text-white cursor-pointer transition-colors">Community Rules</li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-white font-bold text-sm uppercase tracking-widest">Social</h4>
                        <div className="flex gap-4">
                            <SocialIcon icon={<Twitter size={20} />} />
                            <SocialIcon icon={<Instagram size={20} />} />
                            <SocialIcon icon={<Github size={20} />} />
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const SocialIcon = ({ icon }: { icon: React.ReactNode }) => (
    <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-white hover:text-black transition-all">
        {icon}
    </a>
);

// --- Components for HomeView ---

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-3xl hover:border-gsn-green/30 transition-all hover:bg-zinc-900 group">
        <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mb-6 text-zinc-400 group-hover:text-gsn-green group-hover:scale-110 transition-all border border-white/5">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-zinc-400 leading-relaxed text-sm">{desc}</p>
    </div>
);

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-white/10 last:border-0">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex justify-between items-center text-left hover:text-gsn-green transition-colors group"
            >
                <span className={`font-bold text-lg transition-colors ${isOpen ? 'text-gsn-green' : 'text-white'}`}>{question}</span>
                {isOpen ? <ChevronUp className="text-gsn-green" /> : <ChevronDown className="text-zinc-500 group-hover:text-white" />}
            </button>
            {isOpen && (
                <div className="pb-6 text-zinc-400 leading-relaxed animate-in slide-in-from-top-2">
                    {answer}
                </div>
            )}
        </div>
    )
}

const HomeView = ({ onNavigate, onEnterApp, isAuthenticated }: { onNavigate: (v: PublicView) => void, onEnterApp: () => void, isAuthenticated: boolean }) => (
    <div className="bg-black min-h-screen font-sans selection:bg-gsn-green selection:text-black">
        {/* Hero Section */}
        <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(74,222,128,0.1),transparent_70%)]"></div>
            <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none"></div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                <span className="text-[20vw] font-black text-white/5 tracking-tighter leading-none animate-pulse-slow">
                    STONER
                </span>
            </div>

            <div className="relative z-10 text-center space-y-8 px-6 max-w-5xl">
                <div className="inline-flex items-center gap-2 border border-white/10 rounded-full px-4 py-1.5 bg-white/5 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-1000">
                    <span className="w-1.5 h-1.5 rounded-full bg-gsn-green animate-pulse"></span>
                    <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Live Network</span>
                </div>

                <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter leading-[0.9] animate-in zoom-in-95 duration-1000 delay-100 mix-blend-overlay">
                    THE ULTIMATE <br/>
                    STONER NETWORK
                </h1>

                <p className="text-lg md:text-xl text-zinc-400 max-w-xl mx-auto font-light leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                    Built by smokers, for smokers. The premier uncensored social sanctuary to share your sessions, discover new strains, and connect with the culture.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                    <button 
                        onClick={() => isAuthenticated ? onEnterApp() : onNavigate('SIGNUP')}
                        className="px-10 py-4 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-all hover:scale-105 min-w-[180px] tracking-tight"
                    >
                        Join the Sesh
                    </button>
                    <button 
                        onClick={() => onNavigate('LOGIN')}
                        className="px-10 py-4 bg-transparent border border-white/20 text-white font-bold rounded-full hover:bg-white/5 transition-all min-w-[180px] tracking-tight"
                    >
                        Login
                    </button>
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section className="py-32 px-6 bg-black relative z-10">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">Everything You Need to <span className="text-gsn-green">Blaze</span>.</h2>
                    <p className="text-zinc-400 text-lg">More than just a social network. Green is your daily destination for everything cannabis.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FeatureCard 
                        icon={<Shield size={32} />} 
                        title="Uncensored Social" 
                        desc="Post your smoke spots, new glass, and favorite strains without fear of bans. We protect your right to share." 
                    />
                    <FeatureCard 
                        icon={<Flame size={32} />} 
                        title="Strain Discovery" 
                        desc="Find what hits. Read real reviews from real smokers and discover new genetics dropping near you." 
                    />
                    <FeatureCard 
                        icon={<MapPin size={32} />} 
                        title="Link Up Map" 
                        desc="Find active sessions, chill spots, and like-minded friends in your area. Connect in the real world." 
                    />
                </div>
            </div>
        </section>

        {/* The Sesh Section (Replaced Craft) */}
        <section className="py-32 px-6 bg-zinc-900/30 border-y border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gsn-green/5 rounded-full blur-[150px] pointer-events-none"></div>
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <div className="relative">
                    <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl relative z-10">
                        <img src="https://picsum.photos/800/1000?random=sesh" className="w-full h-full object-cover opacity-90" alt="Sesh" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-8 flex flex-col justify-end">
                            <div className="flex items-center gap-3 mb-2">
                                <img src="https://picsum.photos/50/50?random=user2" className="w-10 h-10 rounded-full border-2 border-gsn-green" alt="User" />
                                <div>
                                    <p className="font-bold text-white text-sm">Sativa Diva</p>
                                    <p className="text-gsn-green text-xs font-bold uppercase">Connoisseur</p>
                                </div>
                            </div>
                            <p className="text-white text-lg font-medium leading-tight">"Friday night vibes. This new piece hits incredibly smooth. 💨✨"</p>
                        </div>
                    </div>
                    {/* Decorative Elements */}
                    <div className="absolute -top-10 -left-10 w-32 h-32 bg-gsn-green/20 rounded-full blur-2xl"></div>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl"></div>
                </div>
                
                <div>
                    <div className="w-16 h-16 bg-gsn-green/10 rounded-2xl flex items-center justify-center mb-8 border border-gsn-green/20">
                        <MessageSquare size={32} className="text-gsn-green" />
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter leading-none">
                        FIND YOUR <br/> <span className="text-zinc-500">FLOW</span>
                    </h2>
                    <p className="text-xl text-zinc-400 mb-8 leading-relaxed max-w-lg">
                        Connect with a community that shares your passion. Whether you're into rolling art, glass collecting, or just chilling, you'll find your people here.
                    </p>
                    <ul className="space-y-4 mb-10">
                        {['Uncensored Feed', 'Exclusive Strain Drops', 'Local Events & Sesh Groups'].map(item => (
                            <li key={item} className="flex items-center gap-3 text-white font-bold">
                                <div className="w-6 h-6 rounded-full bg-gsn-green flex items-center justify-center text-black">
                                    <CheckCircle size={14} />
                                </div>
                                {item}
                            </li>
                        ))}
                    </ul>
                    <button 
                        onClick={() => !isAuthenticated && onNavigate('SIGNUP')}
                        className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-all"
                    >
                        Join the Community
                    </button>
                </div>
            </div>
        </section>

        {/* Grower & Brand Advertising Section */}
        <section className="py-24 px-6 bg-black relative">
            <div className="max-w-7xl mx-auto bg-gradient-to-r from-zinc-900 to-black border border-white/10 rounded-[3rem] p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="bg-gsn-green text-black text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">For Growers & Brands</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">ADVERTISE YOUR FIRE</h2>
                        <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                            Are you a cultivator, breeder, or brand owner? You can be on the platform too. 
                            Sell your products and advertise directly to the most dedicated community of smokers on the planet.
                        </p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            <li className="flex items-center gap-3 text-white font-medium">
                                <Megaphone size={18} className="text-gsn-green" /> Targeted Ad Campaigns
                            </li>
                            <li className="flex items-center gap-3 text-white font-medium">
                                <ShoppingBag size={18} className="text-gsn-green" /> Product Listings
                            </li>
                            <li className="flex items-center gap-3 text-white font-medium">
                                <Users size={18} className="text-gsn-green" /> Direct Consumer Access
                            </li>
                            <li className="flex items-center gap-3 text-white font-medium">
                                <TrendingUp size={18} className="text-gsn-green" /> Brand Analytics
                            </li>
                        </ul>
                        <button className="px-8 py-4 bg-gsn-green text-black font-bold rounded-xl hover:bg-green-400 transition-all flex items-center gap-2">
                            Start Advertising <ArrowRight size={18} />
                        </button>
                    </div>
                    <div className="relative">
                        <div className="w-64 h-64 bg-zinc-800 rounded-3xl rotate-3 border border-white/10 flex items-center justify-center shadow-2xl">
                            <Sprout size={64} className="text-gsn-green opacity-50" />
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-black rounded-3xl -rotate-6 border border-white/10 flex items-center justify-center shadow-2xl p-6">
                            <div className="text-center">
                                <div className="text-3xl font-black text-white">45k+</div>
                                <div className="text-xs text-zinc-500 uppercase font-bold mt-1">Active Smokers</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Questions Section */}
        <section className="py-32 px-6 bg-black">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-black text-white mb-4">Frequently Asked Questions</h2>
                    <p className="text-zinc-400">Got questions? We've got answers.</p>
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

// --- AUTH COMPONENTS ---

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
            // State update handled by listener in App.tsx
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
            const result = await signInWithPopup(auth, googleProvider);
            // Profile check handled in App.tsx listener
        } catch (err: any) {
            setError(err.message || 'Google login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 flex items-center justify-center px-4 bg-black">
            <div className="w-full max-w-md space-y-8 animate-in fade-in duration-500">
                <div className="text-center">
                    <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Welcome Back</h2>
                    <p className="text-zinc-400">Enter the green zone.</p>
                </div>

                <div className="bg-zinc-900/50 p-8 rounded-3xl border border-white/5 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 text-zinc-500" size={18} />
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black text-white rounded-xl py-3 pl-12 pr-4 border border-zinc-800 focus:outline-none focus:border-gsn-green transition-colors"
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Password</label>
                                <button className="text-xs text-gsn-green hover:underline font-bold">Forgot?</button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 text-zinc-500" size={18} />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black text-white rounded-xl py-3 pl-12 pr-12 border border-zinc-800 focus:outline-none focus:border-gsn-green transition-colors"
                                    placeholder="••••••••"
                                />
                                <button 
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-3.5 text-zinc-500 hover:text-white"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm flex items-center gap-2">
                            <AlertTriangle size={16} /> {error}
                        </div>
                    )}

                    <button 
                        onClick={handleLogin}
                        disabled={loading || !email || !password}
                        className="w-full bg-gsn-green text-black font-black py-4 rounded-xl hover:bg-green-400 transition-all shadow-[0_0_20px_rgba(74,222,128,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-zinc-800"></div>
                        <span className="flex-shrink-0 mx-4 text-zinc-600 text-xs uppercase font-bold">Or</span>
                        <div className="flex-grow border-t border-zinc-800"></div>
                    </div>

                    <button 
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-3"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                        Continue with Google
                    </button>
                </div>

                <p className="text-center text-zinc-500 text-sm">
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
            // 1. Create Auth User
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, {
                displayName: name
            });

            // 2. Create Database Profile
            await createUserProfile(userCredential.user.uid, {
                name: name,
                handle: handle.startsWith('@') ? handle : `@${handle}`,
                email: email,
                avatar: `https://picsum.photos/150/150?random=${Date.now()}` // Default random avatar
            });

            // State update handled by listener in App.tsx
        } catch (err: any) {
            setError(err.message || "Failed to create account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 flex items-center justify-center px-4 bg-black">
            <div className="w-full max-w-md space-y-8 animate-in fade-in duration-500">
                <div className="text-center">
                    <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Create Account</h2>
                    <p className="text-zinc-400">Join the fastest growing cannabis community.</p>
                </div>

                <div className="bg-zinc-900/50 p-8 rounded-3xl border border-white/5 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-zinc-500 uppercase">Display Name</label>
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-black text-white rounded-xl py-3 px-4 border border-zinc-800 focus:outline-none focus:border-gsn-green transition-colors"
                                placeholder="Dr. Green"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-zinc-500 uppercase">Username</label>
                            <input 
                                type="text" 
                                value={handle}
                                onChange={(e) => setHandle(e.target.value)}
                                className="w-full bg-black text-white rounded-xl py-3 px-4 border border-zinc-800 focus:outline-none focus:border-gsn-green transition-colors"
                                placeholder="@dr_green"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Email</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black text-white rounded-xl py-3 px-4 border border-zinc-800 focus:outline-none focus:border-gsn-green transition-colors"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Password</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black text-white rounded-xl py-3 px-4 border border-zinc-800 focus:outline-none focus:border-gsn-green transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    <div 
                        className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-xl cursor-pointer hover:bg-zinc-800 transition-colors"
                        onClick={() => setAgeVerified(!ageVerified)}
                    >
                        <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${ageVerified ? 'bg-gsn-green border-gsn-green' : 'border-zinc-600 bg-transparent'}`}>
                            {ageVerified && <CheckSquare size={14} className="text-black" />}
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed select-none">
                            I certify that I am 21+ years of age or a valid medical patient in my jurisdiction. I agree to the <span className="text-white hover:underline">Terms</span> & <span className="text-white hover:underline">Privacy Policy</span>.
                        </p>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm flex items-center gap-2">
                            <AlertTriangle size={16} /> {error}
                        </div>
                    )}

                    <button 
                        onClick={handleSignup}
                        disabled={loading || !name || !email || !password || !ageVerified}
                        className="w-full bg-gsn-green text-black font-black py-4 rounded-xl hover:bg-green-400 transition-all shadow-[0_0_20px_rgba(74,222,128,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating Profile...' : 'Create Account'}
                    </button>
                </div>

                <p className="text-center text-zinc-500 text-sm">
                    Already a member? <button onClick={() => onNavigate('LOGIN')} className="text-white font-bold hover:underline">Sign In</button>
                </p>
            </div>
        </div>
    );
};

// --- Static Pages ---
const LegalView = ({ title, onNavigate }: { title: string, onNavigate: (v: PublicView) => void }) => (
    <div className="pt-24 pb-12 max-w-3xl mx-auto px-6 min-h-screen">
        <button onClick={() => onNavigate('HOME')} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors">
            <ArrowRight className="rotate-180" size={20} /> Back to Home
        </button>
        <h1 className="text-4xl font-black mb-8 text-white">{title}</h1>
        <div className="text-zinc-400 space-y-4 leading-relaxed">
            <p>Last Updated: October 2024</p>
            <p>Welcome to Green Stoners Network. By accessing our platform, you agree to comply with these terms...</p>
            <p>[Legal content placeholder - This would contain full legal text in production]</p>
        </div>
    </div>
);

const ManifestoView = ({ onNavigate }: { onNavigate: (v: PublicView) => void }) => (
    <div className="min-h-screen bg-black pt-24 px-6 flex flex-col items-center text-center">
        <h1 className="text-5xl font-black text-white mb-6">Our Manifesto</h1>
        <p className="text-zinc-400 max-w-2xl text-lg">We believe in the freedom to grow, consume, and share without stigma.</p>
        <button onClick={() => onNavigate('HOME')} className="mt-8 text-gsn-green font-bold">Back Home</button>
    </div>
);

// Placeholder Views for completeness
const CareersView = ({ onNavigate }: any) => <LegalView title="Careers" onNavigate={onNavigate} />;
const MerchView = ({ onNavigate }: any) => <LegalView title="Merch Store" onNavigate={onNavigate} />;
const PartnersView = ({ onNavigate }: any) => <LegalView title="Partners" onNavigate={onNavigate} />;
const HelpCenterView = ({ onNavigate }: any) => <LegalView title="Help Center" onNavigate={onNavigate} />;
const SafetyView = ({ onNavigate }: any) => <LegalView title="Safety Center" onNavigate={onNavigate} />;
const ContactView = ({ onNavigate }: any) => <LegalView title="Contact Us" onNavigate={onNavigate} />;
const PublicMarketplaceView = ({ onNavigate }: any) => <LegalView title="Marketplace Preview" onNavigate={onNavigate} />;
const LinkUpPreviewView = ({ onNavigate }: any) => <LegalView title="LinkUp Preview" onNavigate={onNavigate} />;

export default LandingPage;
