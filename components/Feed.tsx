
import React, { useState, useEffect } from 'react';
import { MessageCircle, Share2, MoreHorizontal, Repeat, RefreshCw, Bookmark, Plus, Play, X, Zap, Flame, PenTool } from 'lucide-react';
import { CURRENT_USER } from '../constants';
import { Post, Vibe } from '../types';
import VibeViewer from './VibeViewer';
import ReportModal from './ReportModal';
import { ShareSheet, MoreMenu, RepostMenu } from './Menus';
import { subscribeToPosts, toggleLikePost, subscribeToVibes, repostPost, incrementShare, checkIsLiked } from '../services/dataService';
import { auth } from '../services/firebase';
import { formatTimeShort } from '../utils';

// Helper for Vibe grouping
const getVibeGroups = (vibes: Vibe[]) => {
    const groups: { user: any, vibes: Vibe[], latestVibe: Vibe, allSeen: boolean }[] = [];
    const userIds = Array.from(new Set(vibes.map(v => v.user.id)));
    userIds.forEach(uid => {
        const userVibes = vibes.filter(v => v.user.id === uid);
        if(userVibes.length > 0) {
            groups.push({
                user: userVibes[0].user,
                vibes: userVibes,
                latestVibe: userVibes[userVibes.length-1],
                allSeen: userVibes.every(v => v.isSeen)
            })
        }
    });
    return groups;
};

interface FeedProps {
    onNavigateToProfile: (id: string) => void;
    onNavigateToPost?: (id: string) => void;
    onNavigateToCommunity?: (id: string) => void;
    onSearch: (query: string) => void;
    onNavigateToCreateStory: () => void;
    onNavigateToMessages: () => void;
    followingIds: string[];
    headerVisible?: boolean;
    onNavigateToReels: () => void;
}

const Feed: React.FC<FeedProps> = ({ 
    onNavigateToProfile, 
    onNavigateToPost, 
    onNavigateToCommunity,
    onSearch, 
    onNavigateToCreateStory, 
    headerVisible = true,
    onNavigateToReels
}) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [posts, setPosts] = useState<Post[]>([]);
    const [vibes, setVibes] = useState<Vibe[]>([]);
    const [viewingVibes, setViewingVibes] = useState<{vibes: Vibe[], initialIndex: number} | null>(null);
    
    const vibeUsers = getVibeGroups(vibes);

    // Subscribe to Realtime DB
    useEffect(() => {
        const unsubPosts = subscribeToPosts((livePosts) => {
            setPosts(livePosts);
        });
        const unsubVibes = subscribeToVibes((liveVibes) => {
            setVibes(liveVibes);
        });
        return () => {
            unsubPosts();
            unsubVibes();
        };
    }, []);

    const handleRefresh = () => {
        setIsRefreshing(true);
        // DB Listener updates automatically, so this is just visual
        setTimeout(() => setIsRefreshing(false), 1500);
    }

    const handleOpenVibe = (vibes: Vibe[]) => {
        const firstUnseen = vibes.findIndex(v => !v.isSeen);
        setViewingVibes({
            vibes,
            initialIndex: firstUnseen !== -1 ? firstUnseen : 0
        });
    }

    return (
        <div className="min-h-screen bg-black pb-20 md:pb-0">
            {viewingVibes && (
                <VibeViewer 
                    vibes={viewingVibes.vibes}
                    initialIndex={viewingVibes.initialIndex}
                    onClose={() => setViewingVibes(null)}
                />
            )}

            {/* Refresh Indicator */}
            <div className={`fixed top-20 left-0 right-0 flex justify-center transition-opacity duration-300 z-40 pointer-events-none ${isRefreshing ? 'opacity-100' : 'opacity-0'}`}>
                <div className="bg-zinc-900 rounded-full p-2 shadow-xl border border-white/10">
                    <RefreshCw className="animate-spin text-gsn-green" size={20} />
                </div>
            </div>

            {/* Feed Content */}
            <div style={{ 
                transform: `translateY(${isRefreshing ? 60 : 0}px)`,
                transition: 'transform 0.3s cubic-bezier(0,0,0.2,1)'
            }}>
                {/* VIBES Rail */}
                <div className="pt-4 pb-4 md:pt-6 bg-black border-b border-white/5">
                    <div className="flex gap-3 overflow-x-auto no-scrollbar px-4">
                        <div 
                            onClick={onNavigateToCreateStory}
                            className="min-w-[100px] w-[100px] h-[160px] rounded-[1.5rem] overflow-hidden relative cursor-pointer group bg-zinc-900/50 shrink-0 border border-white/5 hover:border-gsn-green/30 transition-all"
                        >
                            <img src={CURRENT_USER.avatar} alt="Me" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-50 grayscale group-hover:grayscale-0" />
                            <div className="absolute inset-0 flex flex-col items-center justify-end pb-3">
                                <div className="w-9 h-9 bg-gsn-green rounded-xl flex items-center justify-center mb-1 shadow-lg shadow-green-900/50">
                                    <Plus size={20} className="text-black stroke-[3px]" />
                                </div>
                                <span className="text-white text-[10px] font-bold">New Vibe</span>
                            </div>
                        </div>

                        {vibeUsers.map((group) => (
                            <div 
                                key={group.user.id} 
                                onClick={() => handleOpenVibe(group.vibes)}
                                className="min-w-[100px] w-[100px] h-[160px] rounded-[1.5rem] overflow-hidden relative cursor-pointer group bg-zinc-900 shrink-0 border border-white/20 transition-all"
                            >
                                <img src={group.latestVibe.media} alt={group.user.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90"></div>
                                <div className={`absolute top-2 left-2 w-8 h-8 rounded-full p-[2px] ${group.allSeen ? 'bg-zinc-700' : 'bg-gradient-to-tr from-gsn-green to-blue-500'} shadow-lg`}>
                                    <img src={group.user.avatar} className="w-full h-full rounded-full border border-black" alt="User" />
                                </div>
                                <span className="absolute bottom-2 left-2 text-white text-[10px] font-bold drop-shadow-md truncate w-[90%]">{group.user.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Posts Feed */}
                <div className="w-full max-w-2xl mx-auto">
                    {posts.length === 0 ? (
                        <div className="text-center py-20 text-zinc-500">
                            <RefreshCw className="animate-spin mx-auto mb-4" />
                            <p>Loading the network...</p>
                        </div>
                    ) : (
                        posts.map((post, index) => (
                            <React.Fragment key={post.id}>
                                <PostCard 
                                    post={post} 
                                    index={index}
                                    onNavigateToProfile={onNavigateToProfile}
                                    onNavigateToCommunity={onNavigateToCommunity}
                                    onNavigateToPost={onNavigateToPost}
                                    onClick={() => onNavigateToPost?.(post.id)}
                                    onSearch={onSearch}
                                />
                            </React.Fragment>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

// ... PostCard and sub-components ...
interface PostCardProps {
    post: Post;
    index?: number;
    onNavigateToProfile: (id: string) => void;
    onNavigateToPost?: (id: string) => void;
    onNavigateToCommunity?: (id: string) => void;
    onClick?: () => void;
    onSearch?: (tag: string) => void;
    onQuote?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, index = 0, onNavigateToProfile, onNavigateToPost, onNavigateToCommunity, onClick, onSearch, onQuote }) => {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likes);
    const [repostCount, setRepostCount] = useState(post.reposts || 0);
    
    // Menu States
    const [showShare, setShowShare] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [showRepostMenu, setShowRepostMenu] = useState(false);
    const [showReport, setShowReport] = useState(false);
    
    useEffect(() => {
        if(auth.currentUser) {
            checkIsLiked(post.id, auth.currentUser.uid).then(setLiked);
        }
    }, [post.id]);

    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!auth.currentUser) return;
        const newStatus = !liked;
        setLiked(newStatus);
        setLikeCount(prev => newStatus ? prev + 1 : Math.max(0, prev - 1));
        toggleLikePost(post.id, auth.currentUser.uid, post.user.id);
    };

    const handleShareClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        incrementShare(post.id);
        setShowShare(true);
    }

    const handleRepostClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowRepostMenu(true);
    }

    const performRepost = async () => {
        if(auth.currentUser) {
            setRepostCount(prev => prev + 1);
            await repostPost(post, CURRENT_USER); 
            setShowRepostMenu(false);
        }
    }

    const performQuote = () => {
        if (onQuote) onQuote();
        else alert("Quote feature is currently in development.");
        setShowRepostMenu(false);
    }

    const handleOptionsClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowOptions(true);
    }

    const renderContent = (content: string) => {
        if (!content) return null;
        const parts = content.split(/(#[a-zA-Z0-9_]+)/g);
        return parts.map((part, index) => {
            if (part.startsWith('#')) {
                return <span key={index} className="text-gsn-green hover:underline cursor-pointer" onClick={(e) => { e.stopPropagation(); onSearch?.(part.slice(1)); }}>{part}</span>;
            }
            return <span key={index}>{part}</span>;
        });
    };

    // Alternating Backgrounds: Two different shades of black
    // Post 1: Black (#000000)
    // Post 2: Dark Gray/Black (#0c0c0c)
    const isEven = index % 2 === 0;
    const bgClass = isEven ? 'bg-black' : 'bg-[#0c0c0c]';

    return (
        <>
            <div 
                onClick={onClick}
                className={`group relative p-5 cursor-pointer transition-colors ${bgClass}`}
            >
                <div className="flex gap-4">
                    <div onClick={(e) => {e.stopPropagation(); onNavigateToProfile(post.user.id)}} className="shrink-0 cursor-pointer">
                        <img src={post.user.avatar} className="w-12 h-12 rounded-full border border-zinc-700 object-cover hover:opacity-80 transition-opacity" alt={post.user.name} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <span 
                                        onClick={(e) => { e.stopPropagation(); onNavigateToProfile(post.user.id); }}
                                        className="font-bold text-white text-[15px] hover:underline cursor-pointer"
                                    >
                                        {post.user.name}
                                    </span>
                                    {post.user.verified && <span className="text-gsn-green"><Zap size={12} fill="currentColor" /></span>}
                                    
                                    {post.community && (
                                        <>
                                            <span className="text-zinc-500 text-xs">in</span>
                                            <span 
                                                onClick={(e) => { e.stopPropagation(); onNavigateToCommunity?.(post.community!.id); }}
                                                className="font-bold text-zinc-300 text-[13px] hover:text-gsn-green hover:underline cursor-pointer"
                                            >
                                                {post.community.name}
                                            </span>
                                        </>
                                    )}

                                    <span className="text-zinc-600 text-xs">· {formatTimeShort(post.timestamp)}</span>
                                </div>
                                <span 
                                    onClick={(e) => { e.stopPropagation(); onNavigateToProfile(post.user.id); }}
                                    className="text-zinc-500 text-xs hover:text-zinc-400 cursor-pointer"
                                >
                                    @{post.user.handle.replace('@','')}
                                </span>
                            </div>
                            <button onClick={handleOptionsClick} className="text-zinc-600 hover:text-white p-1 -mr-2 rounded-full hover:bg-zinc-800 transition-colors">
                                <MoreHorizontal size={20} />
                            </button>
                        </div>

                        <div className="mt-3 text-[15px] text-zinc-100 whitespace-pre-wrap leading-relaxed">
                            {renderContent(post.content)}
                        </div>

                        {post.images && post.images.length > 0 && (
                            <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1">
                                {post.images.map((img, i) => (
                                    <div key={i} className={`shrink-0 snap-center overflow-hidden rounded-xl border border-white/5 bg-zinc-900 ${post.images!.length > 1 ? 'w-[85%] aspect-[4/5]' : 'w-full h-auto max-h-[500px]'}`}>
                                        <img src={img} className="h-full w-full object-cover" alt="Post media" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {post.quotedPost && (
                            <div 
                                onClick={(e) => { e.stopPropagation(); onNavigateToPost?.(post.quotedPost!.id); }}
                                className="mt-4 border border-white/10 rounded-xl p-4 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <img src={post.quotedPost.user.avatar} className="w-5 h-5 rounded-full" />
                                    <span className="text-xs font-bold text-white hover:underline" onClick={(e) => {e.stopPropagation(); onNavigateToProfile(post.quotedPost!.user.id)}}>{post.quotedPost.user.name}</span>
                                    <span className="text-xs text-zinc-500">@{post.quotedPost.user.handle.replace('@','')}</span>
                                </div>
                                <p className="text-sm text-zinc-300 line-clamp-3">{post.quotedPost.content}</p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-between items-center mt-4 pt-2">
                            {/* Left Group: Comment, Repost, Share */}
                            <div className="flex items-center gap-6">
                                <ActionButton icon={<MessageCircle size={20} />} count={post.comments} color="hover:text-blue-400" bg="group-hover:bg-blue-500/10" onClick={onClick} />
                                <ActionButton icon={<Repeat size={20} />} count={repostCount} color="hover:text-green-500" bg="group-hover:bg-green-500/10" onClick={handleRepostClick} />
                                <ActionButton icon={<Share2 size={20} />} count={post.shares} color="hover:text-blue-400" bg="group-hover:bg-blue-500/10" onClick={handleShareClick} />
                            </div>

                            {/* Right Group: Fire (Like) */}
                            <div className="flex items-center">
                                <ActionButton icon={<Flame size={20} fill={liked ? "currentColor" : "none"} />} count={likeCount} color={liked ? "text-orange-500" : "hover:text-orange-500"} bg={liked ? "" : "group-hover:bg-orange-500/10"} onClick={handleLike} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Modals & Menus --- */}
            {showShare && (
                <ShareSheet onClose={() => setShowShare(false)} postLink={`https://green.app/post/${post.id}`} />
            )}

            {showOptions && (
                <MoreMenu 
                    onClose={() => setShowOptions(false)} 
                    type="Post" 
                    onReport={() => {
                        setShowOptions(false);
                        setShowReport(true);
                    }}
                    onBookmark={() => {
                        // Bookmark logic
                        setShowOptions(false);
                    }}
                />
            )}

            {showReport && (
                <ReportModal 
                    type="Post" 
                    targetId={post.id} 
                    onClose={() => setShowReport(false)} 
                />
            )}

            {showRepostMenu && (
                <RepostMenu 
                    onClose={() => setShowRepostMenu(false)}
                    onRepost={performRepost}
                    onQuote={performQuote}
                />
            )}
        </>
    );
};

const ActionButton = ({ icon, count, color, bg, onClick }: any) => (
    <div className={`flex items-center gap-1.5 group/btn transition-colors text-zinc-500 cursor-pointer ${color}`} onClick={onClick}>
        <div className={`p-2 rounded-full transition-colors ${bg} -ml-2`}>{icon}</div>
        {count !== undefined && <span className="text-xs font-medium">{count}</span>}
    </div>
);

export default Feed;
