
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Share2, MoreHorizontal, Repeat, RefreshCw, Bookmark, Plus, Play, X, Zap, Flame, PenTool, ShieldCheck, Rss } from 'lucide-react';
import { Post, Vibe, User } from '../types';
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
    currentUser: User;
    onNavigateToProfile: (id: string) => void;
    onNavigateToPost?: (id: string) => void;
    onNavigateToCommunity?: (id: string) => void;
    onSearch: (query: string) => void;
    onNavigateToCreateStory: () => void;
    onNavigateToMessages: () => void;
    followingIds: string[];
    headerVisible?: boolean;
    onNavigateToReels: () => void;
    onQuotePost: (post: Post) => void;
}

const Feed: React.FC<FeedProps> = ({ 
    currentUser,
    onNavigateToProfile, 
    onNavigateToPost, 
    onNavigateToCommunity,
    onSearch, 
    onNavigateToCreateStory, 
    headerVisible = true,
    onNavigateToReels,
    onQuotePost
}) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [posts, setPosts] = useState<Post[]>([]);
    const [vibes, setVibes] = useState<Vibe[]>([]);
    const [viewingVibes, setViewingVibes] = useState<{vibes: Vibe[], initialIndex: number} | null>(null);
    
    // Pull-to-refresh state
    const [pullY, setPullY] = useState(0);
    const startY = useRef(0);
    const isDragging = useRef(false);
    
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
        setTimeout(() => {
            setIsRefreshing(false);
            setPullY(0);
        }, 1500);
    }

    const handleTouchStart = (e: React.TouchEvent) => {
        if (window.scrollY === 0) {
            startY.current = e.touches[0].clientY;
            isDragging.current = true;
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging.current) return;
        if (window.scrollY > 0) {
            isDragging.current = false;
            setPullY(0);
            return;
        }
        const currentY = e.touches[0].clientY;
        const diff = currentY - startY.current;
        if (diff > 0) {
            setPullY(diff * 0.4);
        } else {
            setPullY(0);
        }
    };

    const handleTouchEnd = () => {
        if (!isDragging.current) return;
        isDragging.current = false;
        if (pullY > 80) { 
            handleRefresh();
        } else {
            setPullY(0);
        }
    };

    const handleOpenVibe = (vibes: Vibe[]) => {
        const firstUnseen = vibes.findIndex(v => !v.isSeen);
        setViewingVibes({
            vibes,
            initialIndex: firstUnseen !== -1 ? firstUnseen : 0
        });
    }

    return (
        <div 
            className="min-h-screen bg-black pb-20 md:pb-0 relative"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {viewingVibes && (
                <VibeViewer 
                    vibes={viewingVibes.vibes}
                    initialIndex={viewingVibes.initialIndex}
                    onClose={() => setViewingVibes(null)}
                />
            )}

            <div 
                className="absolute top-0 left-0 right-0 flex justify-center z-40 pointer-events-none"
                style={{ 
                    transform: isRefreshing ? 'translateY(20px)' : `translateY(${Math.min(pullY - 40, 40)}px)`,
                    opacity: isRefreshing ? 1 : Math.max(0, (pullY - 20) / 60),
                    transition: isDragging.current ? 'none' : 'all 0.3s cubic-bezier(0,0,0.2,1)'
                }}
            >
                <div className="bg-zinc-900 rounded-full p-2 shadow-xl border border-white/10 mt-4">
                    <RefreshCw 
                        className={`text-gsn-green ${isRefreshing ? 'animate-spin' : ''}`} 
                        size={20} 
                        style={{ transform: `rotate(${pullY * 2}deg)` }}
                    />
                </div>
            </div>

            <div style={{ 
                transform: isRefreshing ? 'translateY(60px)' : `translateY(${pullY * 0.4}px)`,
                transition: isDragging.current ? 'none' : 'transform 0.3s cubic-bezier(0,0,0.2,1)'
            }}>
                {/* VIBES Rail */}
                <div className="pt-3 pb-3 md:pt-4 bg-black border-b border-white/5">
                    <div className="flex gap-3 overflow-x-auto no-scrollbar px-3">
                        <div 
                            onClick={onNavigateToCreateStory}
                            className="min-w-[85px] w-[85px] h-[135px] rounded-[1.2rem] overflow-hidden relative cursor-pointer group bg-zinc-900/50 shrink-0 border border-white/5 hover:border-gsn-green/30 transition-all"
                        >
                            <img src={currentUser.avatar} alt="Me" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-50 grayscale group-hover:grayscale-0" />
                            <div className="absolute inset-0 flex flex-col items-center justify-end pb-3">
                                <div className="w-7 h-7 bg-gsn-green rounded-xl flex items-center justify-center mb-1 shadow-lg shadow-green-900/50">
                                    <Plus size={16} className="text-black stroke-[3px]" />
                                </div>
                                <span className="text-white text-[10px] font-bold">New</span>
                            </div>
                        </div>

                        {vibeUsers.map((group) => (
                            <div 
                                key={group.user.id} 
                                onClick={() => handleOpenVibe(group.vibes)}
                                className="min-w-[85px] w-[85px] h-[135px] rounded-[1.2rem] overflow-hidden relative cursor-pointer group bg-zinc-900 shrink-0 border border-white/20 transition-all"
                            >
                                <img src={group.latestVibe.media} alt={group.user.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90"></div>
                                <div className={`absolute top-2 left-2 w-7 h-7 rounded-full p-[2px] ${group.allSeen ? 'bg-zinc-700' : 'bg-gradient-to-tr from-gsn-green to-blue-500'} shadow-lg`}>
                                    <img src={group.user.avatar} className="w-full h-full rounded-full border border-black" alt="User" />
                                </div>
                                <span className="absolute bottom-2 left-2 text-white text-[9px] font-bold drop-shadow-md truncate w-[90%]">{group.user.name}</span>
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
                                    currentUser={currentUser}
                                    index={index}
                                    onNavigateToProfile={onNavigateToProfile}
                                    onNavigateToCommunity={onNavigateToCommunity}
                                    onNavigateToPost={onNavigateToPost}
                                    onClick={() => onNavigateToPost?.(post.id)}
                                    onSearch={onSearch}
                                    onQuote={() => onQuotePost(post)}
                                />
                            </React.Fragment>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

interface PostCardProps {
    post: Post;
    currentUser: User;
    index?: number;
    onNavigateToProfile: (id: string) => void;
    onNavigateToPost?: (id: string) => void;
    onNavigateToCommunity?: (id: string) => void;
    onClick?: () => void;
    onSearch?: (tag: string) => void;
    onQuote?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, currentUser, index = 0, onNavigateToProfile, onNavigateToPost, onNavigateToCommunity, onClick, onSearch, onQuote }) => {
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
            await repostPost(post, currentUser); 
            setShowRepostMenu(false);
        }
    }

    const performQuote = () => {
        if (onQuote) onQuote();
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

    const isEven = index % 2 === 0;
    const bgClass = isEven ? 'bg-black' : 'bg-[#0c0c0c]';

    return (
        <>
            <div 
                onClick={onClick}
                className={`group relative p-4 cursor-pointer transition-colors ${bgClass}`}
            >
                {/* Menus positioned relative to the card */}
                {showOptions && (
                    <div className="absolute top-10 right-2 z-50">
                        <MoreMenu 
                            onClose={() => setShowOptions(false)} 
                            type="Post" 
                            onReport={() => {
                                setShowOptions(false);
                                setShowReport(true);
                            }}
                            onBookmark={() => {
                                setShowOptions(false);
                            }}
                        />
                    </div>
                )}

                <div className="flex gap-3">
                    <div onClick={(e) => {e.stopPropagation(); onNavigateToProfile(post.user.id)}} className="shrink-0 cursor-pointer">
                        <img src={post.user.avatar} className="w-10 h-10 rounded-full border border-zinc-700 object-cover hover:opacity-80 transition-opacity" alt={post.user.name} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <span 
                                        onClick={(e) => { e.stopPropagation(); onNavigateToProfile(post.user.id); }}
                                        className="font-bold text-white text-sm hover:underline cursor-pointer"
                                    >
                                        {post.user.name}
                                    </span>
                                    {post.user.verified && <span className="text-gsn-green"><Zap size={10} fill="currentColor" /></span>}
                                    
                                    {post.community && (
                                        <>
                                            <span className="text-zinc-500 text-[10px]">in</span>
                                            <span 
                                                onClick={(e) => { e.stopPropagation(); onNavigateToCommunity?.(post.community!.id); }}
                                                className="font-bold text-zinc-300 text-xs hover:text-gsn-green hover:underline cursor-pointer"
                                            >
                                                {post.community.name}
                                            </span>
                                        </>
                                    )}

                                    <span className="text-zinc-600 text-[10px] md:text-xs">· {formatTimeShort(post.timestamp)}</span>
                                </div>
                                <span 
                                    onClick={(e) => { e.stopPropagation(); onNavigateToProfile(post.user.id); }}
                                    className="text-zinc-500 text-xs hover:text-zinc-400 cursor-pointer"
                                >
                                    @{post.user.handle.replace('@','')}
                                </span>
                            </div>
                            <button onClick={handleOptionsClick} className="text-zinc-600 hover:text-white p-1 -mr-2 rounded-full hover:bg-zinc-800 transition-colors">
                                <MoreHorizontal size={18} />
                            </button>
                        </div>

                        <div className="mt-1.5 text-sm text-zinc-100 whitespace-pre-wrap leading-relaxed">
                            {renderContent(post.content)}
                        </div>

                        {post.images && post.images.length > 0 && (
                            <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1">
                                {post.images.map((img, i) => (
                                    <div key={i} className={`shrink-0 snap-center overflow-hidden rounded-lg border border-white/5 bg-zinc-900 ${post.images!.length > 1 ? 'w-[85%] aspect-[4/5]' : 'w-full h-auto max-h-[400px]'}`}>
                                        <img src={img} className="h-full w-full object-cover" alt="Post media" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {post.quotedPost && (
                            <div 
                                onClick={(e) => { e.stopPropagation(); onNavigateToPost?.(post.quotedPost!.id); }}
                                className="mt-3 border border-white/10 rounded-lg p-3 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group/quote"
                            >
                                <div className="flex items-center gap-2 mb-1.5">
                                    <img src={post.quotedPost.user.avatar} className="w-4 h-4 rounded-full" />
                                    <span className="text-xs font-bold text-white hover:underline" onClick={(e) => {e.stopPropagation(); onNavigateToProfile(post.quotedPost!.user.id)}}>{post.quotedPost.user.name}</span>
                                    <span className="text-[10px] text-zinc-500">@{post.quotedPost.user.handle.replace('@','')}</span>
                                </div>
                                <p className="text-xs text-zinc-300 line-clamp-3">{post.quotedPost.content}</p>
                                {post.quotedPost.images && post.quotedPost.images.length > 0 && (
                                    <div className="mt-2 h-24 w-full rounded-md overflow-hidden relative">
                                        <img src={post.quotedPost.images[0]} className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-between items-center mt-3 pt-1 relative">
                            {/* Left Group */}
                            <div className="flex items-center gap-5">
                                <ActionButton icon={<MessageCircle size={18} />} count={post.comments} color="hover:text-blue-400" bg="group-hover:bg-blue-500/10" onClick={onClick} />
                                <div className="relative">
                                    <ActionButton icon={<Repeat size={18} />} count={repostCount} color="hover:text-green-500" bg="group-hover:bg-green-500/10" onClick={handleRepostClick} />
                                    {showRepostMenu && (
                                        <div className="absolute top-8 left-0 z-50">
                                            <RepostMenu 
                                                onClose={() => setShowRepostMenu(false)}
                                                onRepost={performRepost}
                                                onQuote={performQuote}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="relative">
                                    <ActionButton icon={<Share2 size={18} />} count={post.shares} color="hover:text-blue-400" bg="group-hover:bg-blue-500/10" onClick={handleShareClick} />
                                    {showShare && (
                                        <div className="absolute top-8 left-0 z-50">
                                            <ShareSheet onClose={() => setShowShare(false)} postLink={`https://green.app/post/${post.id}`} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Group */}
                            <div className="flex items-center">
                                <ActionButton icon={<Flame size={18} fill={liked ? "currentColor" : "none"} />} count={likeCount} color={liked ? "text-orange-500" : "hover:text-orange-500"} bg={liked ? "" : "group-hover:bg-orange-500/10"} onClick={handleLike} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showReport && (
                <ReportModal 
                    type="Post" 
                    targetId={post.id} 
                    onClose={() => setShowReport(false)} 
                />
            )}
        </>
    );
};

const ActionButton = ({ icon, count, color, bg, onClick }: any) => (
    <div className={`flex items-center gap-1 group/btn transition-colors text-zinc-500 cursor-pointer ${color}`} onClick={onClick}>
        <div className={`p-1.5 rounded-full transition-colors ${bg} -ml-2`}>{icon}</div>
        {count !== undefined && <span className="text-xs font-medium">{count}</span>}
    </div>
);

export default Feed;
