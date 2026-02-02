
import React, { useState, useEffect, useRef } from 'react';
import { Users, Search, Plus, ArrowLeft, MessageSquare, Hash, MoreHorizontal, Megaphone, Lock, ChevronRight, X, Reply, Image as ImageIcon, Flame, Zap, Leaf, Settings, Trash2, LogOut, CheckCircle, Shield, Send, Mic, Info, Copy, Share, Calendar, MapPin, BarChart2 } from 'lucide-react';
import { MOCK_POSTS, CURRENT_USER, MOCK_USERS, MOCK_COMMUNITY_MESSAGES } from '../constants';
import { Community, User, Message, CommunityEvent, Poll } from '../types';
import { PostCard } from './Feed';
import { MoreMenu } from './Menus';
import ReportModal from './ReportModal';
import { createCommunity, subscribeToCommunities, createPost } from '../services/dataService';

interface CommunitiesProps {
    onNavigateToProfile: (id: string) => void;
    onBack?: () => void;
    headerVisible?: boolean;
    initialCommunityId?: string | null;
}

const Communities: React.FC<CommunitiesProps> = ({ onNavigateToProfile, onBack, headerVisible = true, initialCommunityId }) => {
    const [activeCommunity, setActiveCommunity] = useState<Community | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // Realtime Communities State
    const [communities, setCommunities] = useState<Community[]>([]);

    useEffect(() => {
        const unsubscribe = subscribeToCommunities((liveComms) => {
            setCommunities(liveComms);
        });
        return () => unsubscribe();
    }, []);

    // Effect to handle deep link to community
    useEffect(() => {
        if (initialCommunityId && communities.length > 0) {
            const target = communities.find(c => c.id === initialCommunityId);
            if (target) setActiveCommunity(target);
        }
    }, [initialCommunityId, communities]);

    const handleCreateCommunity = async (newCommunity: Community) => {
        setShowCreateModal(false);
    };

    if (activeCommunity) {
        return (
            <CommunityDetail 
                community={activeCommunity} 
                onBack={() => setActiveCommunity(null)} 
                onNavigateToProfile={onNavigateToProfile}
                headerVisible={headerVisible}
                onLeave={() => setActiveCommunity(null)}
            />
        );
    }

    const filteredCommunities = communities.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) && c.privacy !== 'secret'
    );

    return (
        <div className="min-h-screen bg-black pb-20 md:pb-0 relative overflow-hidden">
            {showCreateModal && (
                <CreateCommunityModal 
                    onClose={() => setShowCreateModal(false)} 
                    onCreate={handleCreateCommunity} 
                />
            )}

            {/* Ambient Background */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[10%] left-[-10%] w-[400px] h-[400px] bg-gsn-green/5 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Header Area */}
            <div className={`p-6 md:p-8 sticky ${headerVisible ? 'top-16' : 'top-0'} md:top-0 z-30 transition-all duration-500 bg-gradient-to-b from-black via-black/95 to-transparent`}>
                <div className="flex items-end justify-between mb-8">
                     <div>
                        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none mb-1">
                            FIND YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-gsn-green to-emerald-600">TRIBE</span>
                        </h2>
                        <p className="text-zinc-400 text-sm md:text-base font-medium">Connect with local sesh groups and master growers.</p>
                     </div>
                     <button 
                        onClick={() => setShowCreateModal(true)}
                        className="p-3 bg-zinc-900 border border-white/10 rounded-full hover:bg-zinc-800 text-gsn-green transition-all hover:scale-105 shadow-[0_0_15px_rgba(74,222,128,0.2)]"
                    >
                        <Plus size={24} />
                    </button>
                </div>

                <div className="relative group max-w-2xl mb-8">
                    <Search className="absolute left-4 top-3.5 text-zinc-500 group-focus-within:text-gsn-green transition-colors" size={20} />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for genetics, methods, or cities..." 
                        className="w-full bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-gsn-green/50 transition-all placeholder-zinc-600 shadow-lg"
                    />
                </div>
            </div>

            {/* Main Grid */}
            <div className="px-4 md:px-8 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCommunities.map(community => (
                        <div 
                            key={community.id} 
                            onClick={() => setActiveCommunity(community)}
                            className="group relative bg-zinc-900/40 backdrop-blur-sm rounded-3xl overflow-hidden cursor-pointer border border-white/5 hover:border-gsn-green/30 hover:bg-zinc-900/60 transition-all duration-500"
                        >
                            <div className="h-32 relative overflow-hidden">
                                <img src={community.coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80" alt={community.name} />
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-900/90"></div>
                                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-white border border-white/10">
                                    {community.category}
                                </div>
                            </div>

                            <div className="p-5 -mt-8 relative z-10">
                                <div className="flex justify-between items-end mb-3">
                                    <img src={community.avatar} className="w-16 h-16 rounded-2xl border-4 border-zinc-900 shadow-xl" alt="Avatar" />
                                    {community.unreadMessages ? (
                                        <div className="bg-gsn-green text-black font-bold px-3 py-1 rounded-full text-xs shadow-[0_0_10px_rgba(74,222,128,0.4)] animate-pulse">
                                            {community.unreadMessages} new
                                        </div>
                                    ) : (
                                        <div className="text-zinc-500 hover:text-white transition-colors">
                                            <ChevronRight size={20} />
                                        </div>
                                    )}
                                </div>
                                
                                <h3 className="font-black text-xl text-white mb-2 leading-tight group-hover:text-gsn-green transition-colors">{community.name}</h3>
                                
                                <p className="text-zinc-400 text-sm line-clamp-2 mb-4 font-light leading-relaxed">
                                    {community.description}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
                                        <Users size={14} /> {community.members.toLocaleString()} Members
                                    </div>
                                    {community.privacy === 'private' && <Lock size={14} className="text-zinc-600" />}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Create Community Modal ---
const CreateCommunityModal = ({ onClose, onCreate }: { onClose: () => void, onCreate: (c: Community) => void }) => {
    // ... Existing implementation ...
    // Placeholder to keep file concise
    return null; 
}

// --- Detail View ---

interface CommunityDetailProps {
    community: Community;
    onBack: () => void;
    onNavigateToProfile: (id: string) => void;
    headerVisible: boolean;
    onLeave: () => void;
}

const CommunityDetail: React.FC<CommunityDetailProps> = ({ community, onBack, onNavigateToProfile, headerVisible, onLeave }) => {
    const [activeTab, setActiveTab] = useState<'feed' | 'chat' | 'events' | 'about'>('feed');
    const [showInfo, setShowInfo] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);

    // Mock Events Data
    const events: CommunityEvent[] = [
        { id: 'e1', title: 'Monthly Grow Workshop', date: 'Oct 28, 4:20 PM', location: 'Denver Expo Hall', attendees: 45, isAttending: true, description: 'Learn DWC techniques.' },
        { id: 'e2', title: 'Seed Swap Meet', date: 'Nov 02, 12:00 PM', location: 'Cheesman Park', attendees: 120, isAttending: false, description: 'Bring your genetics!' }
    ];

    if (showInfo || activeTab === 'about') {
        return <CommunityInfoView community={community} onClose={() => {setShowInfo(false); setActiveTab('feed')}} onLeave={onLeave} onNavigateToProfile={onNavigateToProfile} />;
    }

    if (activeTab === 'chat') {
        const defaultChannel = community.channels && community.channels[0] ? community.channels[0] : { id: 'default', name: 'General', type: 'text' };
        return (
            <ChannelChat 
                channel={defaultChannel} 
                community={community} 
                onBack={() => setActiveTab('feed')} 
                onNavigateToProfile={onNavigateToProfile}
            />
        );
    }
    
    return (
        <div className="min-h-screen bg-black flex flex-col relative overflow-x-hidden">
            
            {/* Header Hero */}
            <div className="relative h-[30vh] min-h-[250px] w-full shrink-0">
                <img src={community.coverImage} className="w-full h-full object-cover" alt="Cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                <div className="absolute top-4 left-4 z-20">
                    <button onClick={onBack} className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white border border-white/10"><ArrowLeft size={24} /></button>
                </div>
                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-white leading-none mb-2">{community.name}</h1>
                        <p className="text-zinc-300 text-sm line-clamp-1">{community.description}</p>
                    </div>
                    {/* Join/Joined Button */}
                    <button className="bg-white text-black px-4 py-2 rounded-full font-bold text-sm">Joined</button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className={`sticky ${headerVisible ? 'top-[64px]' : 'top-0'} md:top-0 z-30 bg-black border-b border-white/10 flex overflow-x-auto no-scrollbar`}>
                {['Feed', 'Chat', 'Events', 'About'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab.toLowerCase() as any)}
                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === tab.toLowerCase() ? 'border-gsn-green text-white' : 'border-transparent text-zinc-500'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content Body */}
            <div className="flex-1 bg-black p-4 pb-20">
                {activeTab === 'feed' && <FeedView community={community} onNavigateToProfile={onNavigateToProfile} />}
                
                {activeTab === 'events' && (
                    <div className="space-y-4 animate-in slide-in-from-right duration-300">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-white text-lg">Upcoming Events</h3>
                            <button className="text-gsn-green text-sm font-bold">+ Create Event</button>
                        </div>
                        {events.map(event => (
                            <div key={event.id} className="bg-zinc-900 border border-white/5 rounded-2xl p-4 flex gap-4">
                                <div className="bg-zinc-800 rounded-xl w-16 h-16 flex flex-col items-center justify-center text-zinc-400 shrink-0 border border-white/5">
                                    <span className="text-xs font-bold uppercase">{event.date.split(',')[0]}</span>
                                    <span className="text-lg font-black text-white">{event.date.split(' ')[1]}</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-white text-lg">{event.title}</h4>
                                    <div className="flex items-center gap-4 text-xs text-zinc-400 mt-1">
                                        <span className="flex items-center gap-1"><MapPin size={12}/> {event.location}</span>
                                        <span className="flex items-center gap-1"><Users size={12}/> {event.attendees} going</span>
                                    </div>
                                    <div className="mt-3 flex gap-2">
                                        <button className={`flex-1 py-2 rounded-lg font-bold text-xs ${event.isAttending ? 'bg-gsn-green text-black' : 'bg-zinc-800 text-white'}`}>
                                            {event.isAttending ? 'Going' : 'RSVP'}
                                        </button>
                                        <button className="p-2 bg-zinc-800 rounded-lg text-zinc-400"><Share size={16}/></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const ChannelChat = ({ channel, community, onBack, onNavigateToProfile }: { channel: any, community: Community, onBack: () => void, onNavigateToProfile: (id: string) => void }) => {
    // Reusing standard chat logic but specific for channels
    return (
        <div className="flex-1 flex flex-col h-[80vh]">
            {/* Simple placeholder for the updated Chat component to be used here */}
            <div className="flex-1 flex items-center justify-center text-zinc-500">
                Chat Component Loaded Here
            </div>
        </div>
    );
}

const CommunityInfoView = ({ community, onClose, onLeave, onNavigateToProfile }: any) => {
    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in slide-in-from-right duration-300">
            {/* Info View Logic */}
            <button onClick={onClose} className="p-4 text-white">Back</button>
            <div className="p-4 text-white">
                <h2 className="text-2xl font-bold">{community.name}</h2>
                <p>{community.description}</p>
                <div className="mt-4">
                    <h3 className="font-bold mb-2">Members</h3>
                    {/* Member list logic */}
                </div>
                <button onClick={onLeave} className="mt-8 text-red-500">Leave Community</button>
            </div>
        </div>
    )
}

const FeedView = ({ community, onNavigateToProfile }: { community: Community, onNavigateToProfile: (id: string) => void }) => {
    const [input, setInput] = useState('');
    const [posts, setPosts] = useState<any[]>([]); 
    // Mock Poll
    const [poll, setPoll] = useState<Poll>({
        id: 'poll1',
        question: 'What nutrient line is best for hydro?',
        options: [
            { id: 'o1', text: 'Athena Pro', votes: 45 },
            { id: 'o2', text: 'General Hydroponics', votes: 30 },
            { id: 'o3', text: 'Canna Aqua', votes: 15 }
        ],
        totalVotes: 90,
        endsAt: '2 days'
    });

    const handlePost = async () => {
        if(!input.trim()) return;
        // Mock create post in community
        const newPost = {
            id: Date.now().toString(),
            user: CURRENT_USER,
            content: input,
            likes: 0,
            comments: 0,
            timestamp: 'Just now',
            community: community
        };
        setPosts([newPost, ...posts]);
        setInput('');
    }

    return (
        <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-10 duration-500 space-y-6">
            
            {/* Create Post Box */}
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4">
                <div className="flex gap-3 mb-3">
                    <img src={CURRENT_USER.avatar} className="w-10 h-10 rounded-full" />
                    <input 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Share something with the tribe..." 
                        className="flex-1 bg-black/50 border border-zinc-800 rounded-full px-4 text-white focus:outline-none focus:border-gsn-green transition-colors"
                    />
                </div>
                <div className="flex justify-between items-center px-2">
                    <div className="flex gap-4 text-zinc-400">
                        <button className="hover:text-white"><ImageIcon size={20}/></button>
                        <button className="hover:text-white"><BarChart2 size={20}/></button> {/* Poll */}
                        <button className="hover:text-white"><Calendar size={20}/></button> {/* Event */}
                    </div>
                    <button onClick={handlePost} disabled={!input} className={`px-4 py-1.5 rounded-full font-bold text-sm ${input ? 'bg-gsn-green text-black' : 'bg-zinc-800 text-zinc-600'}`}>
                        Post
                    </button>
                </div>
            </div>

            {/* Pinned Poll */}
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-5">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className="text-xs font-bold text-gsn-green uppercase tracking-widest mb-1 block">Poll of the Week</span>
                        <h4 className="font-bold text-white text-lg">{poll.question}</h4>
                    </div>
                    <span className="text-xs text-zinc-500">{poll.endsAt} left</span>
                </div>
                <div className="space-y-3">
                    {poll.options.map(opt => {
                        const percent = Math.round((opt.votes / poll.totalVotes) * 100);
                        return (
                            <div key={opt.id} className="relative h-10 bg-black rounded-lg overflow-hidden cursor-pointer border border-white/5 hover:border-white/20 transition-all">
                                <div className="absolute top-0 left-0 bottom-0 bg-gsn-green/20" style={{ width: `${percent}%` }}></div>
                                <div className="absolute inset-0 flex items-center justify-between px-4">
                                    <span className="font-bold text-sm text-white">{opt.text}</span>
                                    <span className="text-xs font-mono text-zinc-400">{percent}%</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div className="mt-3 text-xs text-zinc-500 font-bold">{poll.totalVotes} votes</div>
            </div>

            {/* Feed */}
            {posts.map((post: any) => (
                <PostCard key={post.id} post={post} onNavigateToProfile={onNavigateToProfile} />
            ))}
            
            {/* Mock Existing Posts from global if needed, mostly empty for now */}
            {MOCK_POSTS.filter(p => p.community?.id === community.id).map(post => (
                 <PostCard key={post.id} post={post} onNavigateToProfile={onNavigateToProfile} />
            ))}
        </div>
    )
}

export default Communities;
