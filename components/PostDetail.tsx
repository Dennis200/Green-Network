
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, MessageCircle, RefreshCw, Share2, MoreHorizontal, Image, Smile, Send, ThumbsUp, PenTool, Flag, VolumeX, Ban, Copy, Link as LinkIcon, Instagram, Twitter, MessageSquare, X, Camera, Bookmark, Flame, Repeat } from 'lucide-react';
import { Post, Comment } from '../types';
import { CURRENT_USER } from '../constants';
import MediaViewer from './MediaViewer';
import ReportModal from './ReportModal';
import { auth } from '../services/firebase';
import { checkIsLiked, toggleLikePost, incrementView, incrementShare, repostPost, addComment, subscribeToComments } from '../services/dataService';
import { subscribeToUserProfile } from '../services/userService';

interface PostDetailProps {
    post: Post;
    onBack: () => void;
    onNavigateToProfile: (id: string) => void;
    onSearch: (tag: string) => void;
}

const PostDetail: React.FC<PostDetailProps> = ({ post, onBack, onNavigateToProfile, onSearch }) => {
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
    const [currentUser, setCurrentUser] = useState(CURRENT_USER);

    useEffect(() => {
        if (auth.currentUser) {
            subscribeToUserProfile(auth.currentUser.uid, (user) => {
                if (user) setCurrentUser(user);
            });
            
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
        // Optimistic UI
        const newStatus = !isLiked;
        setIsLiked(newStatus);
        setLikeCount(prev => newStatus ? prev + 1 : Math.max(0, prev - 1));
        
        toggleLikePost(post.id, auth.currentUser.uid, post.user.id);
    }

    const handleBookmark = () => {
        setBookmarked(!bookmarked);
        // Add service call for bookmarking if needed
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

    const handleRepost = async () => {
        if (!auth.currentUser) return;
        if(confirm("Repost this to your feed?")) {
            setRepostCount(prev => prev + 1);
            await repostPost(post, currentUser);
        }
    }

    // Helper to render hashtags
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

            {showShareSheet && (
                <ShareSheet onClose={() => setShowShareSheet(false)} postLink={`https://green.app/post/${post.id}`} />
            )}

            {showMoreMenu && (
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
            )}

            {/* Header */}
            <div className="sticky top-0 bg-black/80 backdrop-blur-md z-30 flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                        <ArrowLeft size={20} className="text-white" />
                    </button>
                    <h2 className="text-xl font-bold text-white">Post</h2>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-2 pt-4">
                {/* Main Post Card */}
                <div className="bg-zinc-900/20 backdrop-blur-sm rounded-[2rem] p-5 border border-white/[0.05] relative overflow-hidden mb-4">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigateToProfile(post.user.id)}>
                            <img src={post.user.avatar} alt={post.user.name} className="w-12 h-12 rounded-full border border-white/10 object-cover" />
                            <div>
                                <h3 className="font-bold text-white text-lg leading-tight flex items-center gap-1">
                                    {post.user.name}
                                    {post.user.verified && <span className="text-gsn-green"><Flame size={12} fill="currentColor" /></span>}
                                </h3>
                                <p className="text-zinc-500">{post.user.handle}</p>
                            </div>
                        </div>
                        <button onClick={() => setShowMoreMenu(true)} className="text-zinc-500 hover:text-white p-2 rounded-full hover:bg-zinc-800 transition-colors">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="text-xl text-white mb-4 whitespace-pre-wrap leading-relaxed">
                        {renderContent(post.content)}
                    </div>

                    {/* Media */}
                    {post.images && post.images.length > 0 && (
                        <div className={`mb-4 rounded-2xl overflow-hidden border border-white/5 ${post.images.length > 1 ? 'grid grid-cols-2 gap-1' : ''}`}>
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
                    
                    {/* Timestamp & Metadata */}
                    <div className="text-zinc-500 text-sm mb-4 pb-4 border-b border-white/5 flex gap-2">
                        <span>{post.timestamp}</span><span>·</span><span className="text-white font-bold">{post.views || 0} Views</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center px-2">
                        <ActionButton 
                            icon={<MessageCircle size={22} />} 
                            count={comments.length} 
                            color="hover:text-blue-400" 
                            bg="group-hover:bg-blue-500/10" 
                        />
                        <ActionButton 
                            icon={<Repeat size={22} />} 
                            count={repostCount} 
                            color="hover:text-green-500" 
                            bg="group-hover:bg-green-500/10" 
                            onClick={handleRepost}
                        />
                        <ActionButton 
                            icon={<Heart size={22} fill={isLiked ? "currentColor" : "none"} />} 
                            count={likeCount} 
                            color={isLiked ? "text-pink-500" : "hover:text-pink-500"} 
                            bg={isLiked ? "" : "group-hover:bg-pink-500/10"} 
                            onClick={handleLike}
                        />
                        <div className="flex gap-2">
                            <ActionButton 
                                icon={<Share2 size={22} />} 
                                count={shareCount}
                                color="hover:text-blue-400" 
                                bg="group-hover:bg-blue-500/10" 
                                onClick={handleShare}
                            />
                        </div>
                    </div>
                </div>

                {/* Comment Input Area */}
                <div className="p-2 mb-4">
                    <div className="flex gap-3 items-start">
                        <img src={currentUser.avatar} alt="Me" className="w-10 h-10 rounded-full flex-shrink-0 border border-white/10" />
                        <div className="flex-1">
                            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl flex items-center px-4 py-3 focus-within:border-gsn-green transition-colors">
                                <input 
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Write a comment..." 
                                    className="bg-transparent flex-1 text-base text-white focus:outline-none placeholder-zinc-500 min-h-[24px]"
                                    onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                                />
                                <div className="flex gap-3 text-zinc-500 items-center">
                                    <button className="hover:text-gsn-green transition-colors"><Image size={20} /></button>
                                    <button 
                                        onClick={handlePostComment}
                                        disabled={!newComment.trim()}
                                        className={`ml-1 transition-colors ${newComment.trim() ? 'text-gsn-green' : 'opacity-40 cursor-not-allowed'}`}
                                    >
                                        <Send size={20} fill={newComment.trim() ? "currentColor" : "none"} />
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
                        <div className="p-8 text-center text-zinc-500">
                            No comments yet. Be the first to start the conversation.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper Action Button Component (Local)
const ActionButton = ({ icon, count, color, bg, onClick }: { icon: React.ReactNode, count?: number, color: string, bg: string, onClick?: (e: React.MouseEvent) => void }) => (
    <div className={`flex items-center gap-1 group/btn transition-colors cursor-pointer ${color}`} onClick={onClick}>
        <div className={`p-2 rounded-full transition-colors ${bg}`}>
            {icon}
        </div>
        {count !== undefined && <span className="text-sm font-medium">{count}</span>}
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
        <div className={`relative ${depth > 0 ? 'ml-8 md:ml-12 mt-2 pl-4 border-l border-white/10' : ''}`}>
            {showReportModal && (
                <ReportModal 
                    type="Comment" 
                    targetId={comment.id} 
                    onClose={() => setShowReportModal(false)} 
                />
            )}
            
            <div className="px-4 py-3 flex gap-3 animate-in fade-in duration-300">
                 {/* Avatar */}
                 <img src={comment.user.avatar} className="w-9 h-9 rounded-full cursor-pointer mt-1 flex-shrink-0 object-cover border border-white/10" onClick={() => onNavigateToProfile(comment.user.id)} />
                 
                 <div className="flex-1 max-w-[calc(100%-48px)]">
                     <div className="group relative inline-block max-w-full">
                         {/* Comment Bubble */}
                         <div className="rounded-2xl px-4 py-3 bg-zinc-900 border border-white/5 relative group/bubble">
                             <div className="flex justify-between items-start gap-4 mb-1">
                                 <div onClick={() => onNavigateToProfile(comment.user.id)} className="font-bold text-sm text-white cursor-pointer hover:underline flex items-center gap-1">
                                     {comment.user.name}
                                     {comment.user.verified && <span className="text-gsn-green text-[10px]"><Flame size={10} fill="currentColor"/></span>}
                                     <span className="text-zinc-500 font-normal ml-1 text-xs">· {comment.timestamp}</span>
                                 </div>
                                 <button onClick={() => setShowMore(true)} className="opacity-0 group-hover/bubble:opacity-100 transition-opacity text-zinc-500 hover:text-white">
                                     <MoreHorizontal size={14} />
                                 </button>
                             </div>
                             <p className="text-sm text-zinc-200 leading-relaxed break-words whitespace-pre-wrap">{comment.text}</p>
                         </div>
                         
                         {/* Reaction Count Bubble */}
                         {likes > 0 && (
                             <div className="absolute -bottom-2 -right-1 bg-zinc-800 rounded-full px-1.5 py-0.5 flex items-center gap-1 shadow-lg border border-black z-10">
                                 <div className="bg-pink-500 rounded-full p-[2px]">
                                     <Heart size={6} className="text-white" fill="currentColor" />
                                 </div>
                                 <span className="text-[10px] text-zinc-200 font-bold">{likes}</span>
                             </div>
                         )}
                     </div>

                     {/* Action Bar */}
                     <div className="flex items-center gap-4 mt-1.5 ml-2 relative">
                         <button 
                            onClick={toggleLike}
                            className={`flex items-center gap-1 text-xs font-bold transition-colors ${isLiked ? 'text-pink-500' : 'text-zinc-400 hover:text-pink-500'}`}
                         >
                            Like
                         </button>
                         <button className="flex items-center gap-1 text-xs font-bold text-zinc-400 hover:text-blue-400 transition-colors">
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
            
            {showMore && (
                <MoreMenu 
                    onClose={() => setShowMore(false)} 
                    type="Comment" 
                    onReport={() => {
                        setShowMore(false);
                        setShowReportModal(true);
                    }}
                />
            )}
        </div>
    )
}

export const ShareSheet = ({ onClose, postLink }: { onClose: () => void, postLink?: string }) => {
    const handleShare = async (platform: string) => {
        const text = `Check out this post on Green: ${postLink}`;
        try {
            if (navigator.share && platform === 'native') {
                await navigator.share({ title: 'Green Stoners Network', text, url: postLink });
            } else {
                alert(`Sharing to ${platform} simulated!\n${text}`);
            }
        } catch (e) {
            console.error(e);
        }
        onClose();
    };

    return (
        <>
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed bottom-0 left-0 right-0 z-[60] bg-zinc-900 rounded-t-3xl border-t border-white/10 p-6 pb-safe animate-in slide-in-from-bottom duration-300">
                <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto mb-6" />
                <h3 className="text-center font-bold text-white mb-6">Share to...</h3>
                
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 mb-4">
                    <ShareOption 
                        icon={<Copy size={24} />} 
                        label="Copy Link" 
                        color="bg-zinc-800" 
                        onClick={() => {
                            if(postLink) navigator.clipboard.writeText(postLink);
                            alert("Link copied to clipboard!");
                            onClose();
                        }}
                    />
                    <ShareOption icon={<Send size={24} />} label="DM" color="bg-gsn-green" iconColor="text-black" onClick={() => handleShare('DM')} />
                    <ShareOption icon={<Camera size={24} />} label="Add to Vibe" color="bg-white" iconColor="text-black" onClick={() => handleShare('Vibe')} />
                    <ShareOption icon={<Instagram size={24} />} label="Stories" color="bg-gradient-to-tr from-yellow-500 to-purple-600" onClick={() => handleShare('Instagram')} />
                    <ShareOption icon={<Twitter size={24} />} label="X" color="bg-black border border-zinc-700" onClick={() => handleShare('X')} />
                    <ShareOption icon={<MessageSquare size={24} />} label="SMS" color="bg-green-500" onClick={() => handleShare('SMS')} />
                </div>
                
                <div className="border-t border-white/10 pt-4">
                    <button onClick={onClose} className="w-full py-3 rounded-xl bg-zinc-800 text-white font-bold hover:bg-zinc-700">
                        Cancel
                    </button>
                </div>
            </div>
        </>
    );
};

const ShareOption = ({ icon, label, color, iconColor = 'text-white', onClick }: { icon: React.ReactNode, label: string, color: string, iconColor?: string, onClick?: () => void }) => (
    <button onClick={onClick} className="flex flex-col items-center gap-2 min-w-[72px]">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${color} ${iconColor}`}>
            {icon}
        </div>
        <span className="text-xs font-bold text-zinc-400">{label}</span>
    </button>
);

export const MoreMenu = ({ onClose, type, onReport, onBookmark, isBookmarked }: { onClose: () => void, type: string, onReport: () => void, onBookmark?: () => void, isBookmarked?: boolean }) => (
    <>
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
        <div className="fixed bottom-0 left-0 right-0 z-[101] bg-zinc-900 rounded-t-[2rem] border-t border-white/10 p-6 pb-safe animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-zinc-700 rounded-full mx-auto mb-6" />
            
            <div className="space-y-2">
                {onBookmark && (
                    <button 
                        onClick={() => { onBookmark(); onClose(); }}
                        className="w-full p-4 flex items-center gap-4 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl transition-colors font-bold text-white"
                    >
                        <Bookmark size={20} fill={isBookmarked ? "currentColor" : "none"} />
                        {isBookmarked ? 'Remove from Saved' : 'Save'}
                    </button>
                )}
                
                <button className="w-full p-4 flex items-center gap-4 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl transition-colors font-bold text-white">
                    <Share2 size={20} /> Share
                </button>
                
                {(type === 'User' || type === 'Chat') && (
                    <button className="w-full p-4 flex items-center gap-4 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl transition-colors font-bold text-white">
                        <Ban size={20} /> Block
                    </button>
                )}

                <button 
                    onClick={onReport}
                    className="w-full p-4 flex items-center gap-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors font-bold"
                >
                    <Flag size={20} /> Report {type}
                </button>
            </div>

            <button 
                onClick={onClose}
                className="w-full py-4 mt-4 bg-black border border-zinc-800 rounded-xl font-bold text-zinc-400 hover:text-white transition-colors"
            >
                Cancel
            </button>
        </div>
    </>
);

export default PostDetail;
