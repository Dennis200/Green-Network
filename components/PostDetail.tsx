
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, MessageCircle, Share2, MoreHorizontal, Image, Send, Zap, Flame, Repeat } from 'lucide-react';
import { Post, Comment, User } from '../types';
import MediaViewer from './MediaViewer';
import ReportModal from './ReportModal';
import { MoreMenu, ShareSheet, RepostMenu } from './Menus';
import { auth } from '../services/firebase';
import { checkIsLiked, toggleLikePost, incrementView, incrementShare, repostPost, addComment, subscribeToComments } from '../services/dataService';
import { formatTimeShort } from '../utils';

interface PostDetailProps {
    post: Post;
    currentUser: User;
    onBack: () => void;
    onNavigateToProfile: (id: string) => void;
    onNavigateToCommunity?: (id: string) => void;
    onSearch: (tag: string) => void;
    onQuote?: (post: Post) => void;
}

const PostDetail: React.FC<PostDetailProps> = ({ post, currentUser, onBack, onNavigateToProfile, onNavigateToCommunity, onSearch, onQuote }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likes);
    const [shareCount, setShareCount] = useState(post.shares || 0);
    const [repostCount, setRepostCount] = useState(post.reposts || 0);
    const [bookmarked, setBookmarked] = useState(false);
    const [viewerMedia, setViewerMedia] = useState<{media: string[], index: number} | null>(null);
    const [showShareSheet, setShowShareSheet] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showRepostMenu, setShowRepostMenu] = useState(false);

    useEffect(() => {
        if (auth.currentUser) {
            checkIsLiked(post.id, auth.currentUser.uid).then(setIsLiked);
            incrementView(post.id, auth.currentUser.uid);
        }
        
        const unsubComments = subscribeToComments(post.id, (loadedComments) => {
            setComments(loadedComments);
        });

        return () => unsubComments();
    }, [post.id]);

    const handleLike = () => {
        if (!auth.currentUser) return;
        const newStatus = !isLiked;
        setIsLiked(newStatus);
        setLikeCount(prev => newStatus ? prev + 1 : Math.max(0, prev - 1));
        
        toggleLikePost(post.id, auth.currentUser.uid, post.user.id);
    }

    const handleBookmark = () => {
        setBookmarked(!bookmarked);
    }

    const handlePostComment = async () => {
        if (!newComment.trim() || !auth.currentUser) return;
        
        try {
            await addComment(post.id, newComment, currentUser, post.user.id);
            setNewComment('');
        } catch (e) {
            console.error("Comment failed", e);
        }
    }

    const handleShare = async () => {
        setShareCount(prev => prev + 1);
        incrementShare(post.id);
        setShowShareSheet(true);
    }

    const handleRepostClick = () => {
        setShowRepostMenu(true);
    }

    const performRepost = async () => {
        if (!auth.currentUser) return;
        setRepostCount(prev => prev + 1);
        await repostPost(post, currentUser);
        setShowRepostMenu(false);
    }

    const performQuote = () => {
        if (onQuote) onQuote(post);
        setShowRepostMenu(false);
    }

    const renderContent = (content: string) => {
        const parts = content.split(/(#[a-zA-Z0-9_]+)/g);
        return parts.map((part, index) => {
            if (part.startsWith('#')) {
                return <span key={index} className="text-gsn-green hover:underline cursor-pointer" onClick={() => onSearch(part.slice(1))}>{part}</span>;
            }
            return <span key={index}>{part}</span>;
        });
    };

    return (
        <div className="min-h-screen bg-black pb-20 md:pb-0 animate-in slide-in-from-right duration-300">
            {viewerMedia && (
                <MediaViewer 
                    media={viewerMedia.media} 
                    initialIndex={viewerMedia.index} 
                    onClose={() => setViewerMedia(null)} 
                />
            )}

            {showReportModal && (
                <ReportModal 
                    type="Post" 
                    targetId={post.id} 
                    onClose={() => setShowReportModal(false)} 
                />
            )}

            {/* Header */}
            <div className="sticky top-0 bg-black/80 backdrop-blur-md z-30 flex items-center justify-between p-3 border-b border-white/10">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                        <ArrowLeft size={20} className="text-white" />
                    </button>
                    <h2 className="text-lg font-bold text-white">Post</h2>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-0 md:px-2 md:pt-4">
                {/* Main Post Card */}
                <div className="bg-black md:bg-zinc-900/20 backdrop-blur-sm md:rounded-[2rem] p-4 border-b md:border border-white/5 relative overflow-hidden mb-2">
                    
                    {/* Menu Positioned Inside Relative Container */}
                    {showMoreMenu && (
                        <div className="absolute top-10 right-2 z-50">
                            <MoreMenu 
                                onClose={() => setShowMoreMenu(false)} 
                                type="Post" 
                                onReport={() => {
                                    setShowMoreMenu(false);
                                    setShowReportModal(true);
                                }}
                                onBookmark={handleBookmark}
                                isBookmarked={bookmarked}
                            />
                        </div>
                    )}

                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                            <img 
                                src={post.user.avatar} 
                                alt={post.user.name} 
                                className="w-10 h-10 rounded-full border border-white/10 object-cover cursor-pointer hover:opacity-80" 
                                onClick={() => onNavigateToProfile(post.user.id)}
                            />
                            <div>
                                <h3 
                                    className="font-bold text-white text-base leading-tight flex items-center gap-1 cursor-pointer hover:underline"
                                    onClick={() => onNavigateToProfile(post.user.id)}
                                >
                                    {post.user.name}
                                    {post.user.verified && <span className="text-gsn-green"><Zap size={12} fill="currentColor" /></span>}
                                </h3>
                                <div className="flex gap-1 items-center">
                                    <p className="text-zinc-500 cursor-pointer hover:text-zinc-300 text-xs" onClick={() => onNavigateToProfile(post.user.id)}>{post.user.handle}</p>
                                    {post.community && (
                                        <>
                                            <span className="text-zinc-500 text-[10px]">· in</span>
                                            <span 
                                                className="text-zinc-400 text-xs font-bold cursor-pointer hover:text-gsn-green hover:underline"
                                                onClick={() => onNavigateToCommunity?.(post.community!.id)}
                                            >
                                                {post.community.name}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setShowMoreMenu(true)} className="text-zinc-500 hover:text-white p-2 rounded-full hover:bg-zinc-800 transition-colors">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="text-base text-white mb-3 whitespace-pre-wrap leading-relaxed">
                        {renderContent(post.content)}
                    </div>

                    {/* Media */}
                    {post.images && post.images.length > 0 && (
                        <div className={`mb-3 rounded-xl overflow-hidden border border-white/5 ${post.images.length > 1 ? 'grid grid-cols-2 gap-1' : ''}`}>
                            {post.images.map((img, i) => (
                                <img 
                                    key={i} 
                                    src={img} 
                                    alt="Post media" 
                                    className="w-full object-cover max-h-[500px] cursor-pointer" 
                                    onClick={() => setViewerMedia({ media: post.images!, index: i })}
                                />
                            ))}
                        </div>
                    )}

                    {post.quotedPost && (
                        <div 
                            onClick={(e) => { e.stopPropagation(); onNavigateToProfile(post.quotedPost!.user.id); }}
                            className="mt-3 border border-white/10 rounded-lg p-3 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-2 mb-1.5">
                                <img src={post.quotedPost.user.avatar} className="w-4 h-4 rounded-full" />
                                <span className="text-xs font-bold text-white hover:underline">{post.quotedPost.user.name}</span>
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
                    
                    {/* Timestamp & Metadata */}
                    <div className="text-zinc-500 text-xs mb-3 pb-3 border-b border-white/5 flex gap-2">
                        <span>{formatTimeShort(post.timestamp)}</span><span>·</span><span className="text-white font-bold">{post.views || 0} Views</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center px-1 relative">
                        <div className="flex items-center gap-6">
                            <ActionButton 
                                icon={<MessageCircle size={20} />} 
                                count={comments.length} 
                                color="hover:text-blue-400" 
                                bg="group-hover:bg-blue-500/10" 
                            />
                            <div className="relative">
                                <ActionButton 
                                    icon={<Repeat size={20} />} 
                                    count={repostCount} 
                                    color="hover:text-green-500" 
                                    bg="group-hover:bg-green-500/10" 
                                    onClick={handleRepostClick}
                                />
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
                                <ActionButton 
                                    icon={<Share2 size={20} />} 
                                    count={shareCount}
                                    color="hover:text-blue-400" 
                                    bg="group-hover:bg-blue-500/10" 
                                    onClick={handleShare}
                                />
                                {showShareSheet && (
                                    <div className="absolute top-8 left-0 z-50">
                                        <ShareSheet onClose={() => setShowShareSheet(false)} postLink={`https://green.app/post/${post.id}`} />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center">
                            <ActionButton 
                                icon={<Flame size={20} fill={isLiked ? "currentColor" : "none"} />} 
                                count={likeCount} 
                                color={isLiked ? "text-orange-500" : "hover:text-orange-500"} 
                                bg={isLiked ? "" : "group-hover:bg-orange-500/10"} 
                                onClick={handleLike}
                            />
                        </div>
                    </div>
                </div>

                {/* Comment Input Area */}
                <div className="p-3 mb-2 border-b border-white/5">
                    <div className="flex gap-3 items-start">
                        <img src={currentUser.avatar} alt="Me" className="w-8 h-8 rounded-full flex-shrink-0 border border-white/10" />
                        <div className="flex-1">
                            <div className="bg-zinc-900 border border-zinc-800 rounded-xl flex items-center px-3 py-2 focus-within:border-gsn-green transition-colors">
                                <input 
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Write a comment..." 
                                    className="bg-transparent flex-1 text-sm text-white focus:outline-none placeholder-zinc-500 min-h-[20px]"
                                    onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                                />
                                <div className="flex gap-2 text-zinc-500 items-center">
                                    <button className="hover:text-gsn-green transition-colors"><Image size={18} /></button>
                                    <button 
                                        onClick={handlePostComment}
                                        disabled={!newComment.trim()}
                                        className={`ml-1 transition-colors ${newComment.trim() ? 'text-gsn-green' : 'opacity-40 cursor-not-allowed'}`}
                                    >
                                        <Send size={18} fill={newComment.trim() ? "currentColor" : "none"} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Comments List */}
                <div className="pb-20 space-y-1">
                    {comments.map(comment => (
                        <CommentItem 
                            key={comment.id} 
                            comment={comment} 
                            onNavigateToProfile={onNavigateToProfile}
                        />
                    ))}
                    
                    {comments.length === 0 && (
                        <div className="p-8 text-center text-zinc-500 text-sm">
                            No comments yet. Be the first to start the conversation.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ActionButton = ({ icon, count, color, bg, onClick }: { icon: React.ReactNode, count?: number, color: string, bg: string, onClick?: (e: React.MouseEvent) => void }) => (
    <div className={`flex items-center gap-1 group/btn transition-colors cursor-pointer ${color}`} onClick={onClick}>
        <div className={`p-2 rounded-full transition-colors ${bg}`}>
            {icon}
        </div>
        {count !== undefined && <span className="text-xs font-medium">{count}</span>}
    </div>
);

interface CommentItemProps {
    comment: Comment;
    onNavigateToProfile: (id: string) => void;
    depth?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onNavigateToProfile, depth = 0 }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [likes, setLikes] = useState(comment.likes);
    const [isExpanded, setIsExpanded] = useState(true);
    const [showMore, setShowMore] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    const toggleLike = () => {
        setIsLiked(!isLiked);
        setLikes(prev => isLiked ? prev - 1 : prev + 1);
    }

    return (
        <div className={`relative ${depth > 0 ? 'ml-8 md:ml-12 mt-2 pl-3 border-l border-white/10' : ''}`}>
            {showReportModal && (
                <ReportModal 
                    type="Comment" 
                    targetId={comment.id} 
                    onClose={() => setShowReportModal(false)} 
                />
            )}
            
            <div className="px-4 py-2 flex gap-3 animate-in fade-in duration-300">
                 {/* Avatar */}
                 <img src={comment.user.avatar} className="w-8 h-8 rounded-full cursor-pointer mt-1 flex-shrink-0 object-cover border border-white/10" onClick={() => onNavigateToProfile(comment.user.id)} />
                 
                 <div className="flex-1 max-w-[calc(100%-40px)]">
                     <div className="group relative inline-block max-w-full">
                         {/* Comment Bubble */}
                         <div className="rounded-xl px-3 py-2 bg-zinc-900 border border-white/5 relative group/bubble">
                             <div className="flex justify-between items-start gap-4 mb-0.5">
                                 <div onClick={() => onNavigateToProfile(comment.user.id)} className="font-bold text-xs text-white cursor-pointer hover:underline flex items-center gap-1">
                                     {comment.user.name}
                                     {comment.user.verified && <span className="text-gsn-green text-[8px]"><Zap size={8} fill="currentColor"/></span>}
                                     <span className="text-zinc-500 font-normal ml-1 text-[10px]">· {formatTimeShort(comment.timestamp)}</span>
                                 </div>
                                 <div className="relative">
                                     <button onClick={() => setShowMore(true)} className="opacity-0 group-hover/bubble:opacity-100 transition-opacity text-zinc-500 hover:text-white">
                                         <MoreHorizontal size={12} />
                                     </button>
                                     {showMore && (
                                         <div className="absolute right-0 top-6 z-50">
                                             <MoreMenu 
                                                 onClose={() => setShowMore(false)} 
                                                 type="Comment" 
                                                 onReport={() => {
                                                     setShowMore(false);
                                                     setShowReportModal(true);
                                                 }}
                                             />
                                         </div>
                                     )}
                                 </div>
                             </div>
                             <p className="text-xs md:text-sm text-zinc-200 leading-relaxed break-words whitespace-pre-wrap">{comment.text}</p>
                         </div>
                         
                         {/* Reaction Count Bubble */}
                         {likes > 0 && (
                             <div className="absolute -bottom-2 -right-1 bg-zinc-800 rounded-full px-1.5 py-0.5 flex items-center gap-1 shadow-lg border border-black z-10">
                                 <div className="bg-pink-500 rounded-full p-[2px]">
                                     <Heart size={6} className="text-white" fill="currentColor" />
                                 </div>
                                 <span className="text-[9px] text-zinc-200 font-bold">{likes}</span>
                             </div>
                         )}
                     </div>

                     {/* Action Bar */}
                     <div className="flex items-center gap-3 mt-1 ml-2 relative">
                         <button 
                            onClick={toggleLike}
                            className={`flex items-center gap-1 text-[10px] font-bold transition-colors ${isLiked ? 'text-pink-500' : 'text-zinc-400 hover:text-pink-500'}`}
                         >
                            Like
                         </button>
                         <button className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 hover:text-blue-400 transition-colors">
                            Reply
                         </button>
                     </div>
                     
                     {/* Replies Indicator */}
                     {comment.repliesList && comment.repliesList.length > 0 && (
                        <div className="mt-2">
                            {isExpanded && comment.repliesList.map(reply => (
                                <CommentItem 
                                    key={reply.id} 
                                    comment={reply} 
                                    onNavigateToProfile={onNavigateToProfile}
                                    depth={depth + 1}
                                />
                            ))}
                        </div>
                     )}
                 </div>
            </div>
        </div>
    )
}

export default PostDetail;
