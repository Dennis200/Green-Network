
import React, { useState, useMemo, useEffect } from 'react';
import { MapPin, Link as LinkIcon, ArrowLeft, MessageCircle, MoreHorizontal, Leaf, GraduationCap, Briefcase, Globe, Music, Shield, Grid, Heart, Film, ShoppingBag } from 'lucide-react';
import { MOCK_POSTS, getUserById, MOCK_REELS, MOCK_VIBES, MOCK_PRODUCTS, CURRENT_USER } from '../constants';
import { User, Vibe } from '../types';
import MediaViewer from './MediaViewer';
import VibeViewer from './VibeViewer';
import { MoreMenu } from './PostDetail';
import ReportModal from './ReportModal';
import UserShop from './UserShop';
import { checkIsFollowing, followUser, unfollowUser, subscribeToFollowStats } from '../services/dataService';
import { auth } from '../services/firebase';

interface ProfileProps {
    userId: string;
    isCurrentUser: boolean;
    isFollowing: boolean; // Initial state passed from parent, but we'll fetch real
    onToggleFollow: () => void; // Parent handler (legacy), we'll implement local
    onNavigateToProfile: (id: string) => void;
    onBack?: () => void;
    onEditProfile?: () => void;
    onNavigateToAdmin?: () => void;
    userData?: User; 
}

export const Profile: React.FC<ProfileProps> = ({ userId, isCurrentUser, onNavigateToProfile, onBack, onEditProfile, onNavigateToAdmin, userData }) => {
  const user = userData || getUserById(userId); // Fallback to mock for now if DB fetch delay
  
  // Real State
  const [isFollowingState, setIsFollowingState] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  
  const [viewerMedia, setViewerMedia] = useState<{media: string[], index: number} | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'shop'>('posts');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [viewingVibes, setViewingVibes] = useState<{vibes: Vibe[], initialIndex: number} | null>(null);
  
  const userPosts = MOCK_POSTS.filter(p => p.user.id === userId); // Should use real posts eventually
  const userReels = MOCK_REELS.filter(r => r.user.id === userId);
  const userProducts = MOCK_PRODUCTS.filter(p => p.seller.id === userId);
  const userVibes = useMemo(() => MOCK_VIBES.filter(v => v.user.id === userId), [userId]);
  const hasActiveVibe = userVibes.length > 0;

  useEffect(() => {
      if (auth.currentUser && !isCurrentUser) {
          checkIsFollowing(auth.currentUser.uid, userId).then(setIsFollowingState);
      }
      
      const unsubStats = subscribeToFollowStats(userId, (followers, following) => {
          setFollowerCount(followers);
          setFollowingCount(following);
      });

      return () => unsubStats();
  }, [userId, isCurrentUser]);

  const handleToggleFollow = async () => {
      if (!auth.currentUser) return;
      if (isFollowingState) {
          await unfollowUser(auth.currentUser.uid, userId);
          setIsFollowingState(false);
      } else {
          await followUser(auth.currentUser.uid, userId);
          setIsFollowingState(true);
      }
  };

  if (!user) return null;

  const handleAvatarClick = () => {
      if (hasActiveVibe) {
          const firstUnseen = userVibes.findIndex(v => !v.isSeen);
          setViewingVibes({
              vibes: userVibes,
              initialIndex: firstUnseen !== -1 ? firstUnseen : 0
          });
      } else {
          const history = [user.avatar, ...(user.previousAvatars || [])];
          setViewerMedia({ media: history, index: 0 });
      }
  };

  const handleCoverClick = () => {
      const currentCover = user.coverImage || `https://picsum.photos/1200/400?blur=5&random=${user.id}`;
      const history = [currentCover, ...(user.previousCovers || [])];
      setViewerMedia({ media: history, index: 0 });
  };

  return (
    <div className="min-h-screen bg-black pb-32 relative overflow-x-hidden">
        {viewingVibes && (
            <VibeViewer 
                vibes={viewingVibes.vibes}
                initialIndex={viewingVibes.initialIndex}
                onClose={() => setViewingVibes(null)}
            />
        )}

        {viewerMedia && (
            <MediaViewer 
                media={viewerMedia.media} 
                initialIndex={viewerMedia.index} 
                onClose={() => setViewerMedia(null)} 
            />
        )}
        
        {showReportModal && (
            <ReportModal 
                type="User" 
                targetId={user.id} 
                onClose={() => setShowReportModal(false)} 
            />
        )}
        
        {showMoreMenu && (
            <MoreMenu 
                onClose={() => setShowMoreMenu(false)} 
                type="User" 
                onReport={() => {
                    setShowMoreMenu(false);
                    setShowReportModal(true);
                }}
            />
        )}
        
        {/* --- HERO SECTION --- */}
        <div className="relative w-full h-[50vh] min-h-[350px]">
            <img 
                src={user.coverImage || `https://picsum.photos/1200/800?blur=5&random=${user.id}`} 
                className="w-full h-full object-cover" 
                alt="Cover" 
                onClick={handleCoverClick}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
            
            {/* Top Nav */}
            <div className="absolute top-0 left-0 right-0 p-6 pt-12 md:pt-6 flex justify-between z-20">
                <button 
                    onClick={onBack} 
                    className={`p-3 rounded-full backdrop-blur-md transition-all ${isCurrentUser ? 'opacity-0 pointer-events-none' : 'bg-black/20 hover:bg-white/10 text-white'}`}
                >
                    <ArrowLeft size={24} />
                </button>
                <button 
                    onClick={() => setShowMoreMenu(true)}
                    className="p-3 rounded-full bg-black/20 hover:bg-white/10 backdrop-blur-md text-white transition-all"
                >
                    <MoreHorizontal size={24} />
                </button>
            </div>
        </div>

        {/* --- PROFILE CONTENT --- */}
        <div className="relative z-10 px-6 md:px-10 max-w-7xl mx-auto -mt-36 mb-16">
            
            {/* Identity Row */}
            <div className="flex flex-col md:flex-row items-end gap-8 mb-10">
                {/* Avatar */}
                <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                    {hasActiveVibe && (
                        <div className="absolute -inset-1 rounded-[2.8rem] bg-gradient-to-tr from-gsn-green via-blue-500 to-purple-600 z-0 animate-pulse-slow"></div>
                    )}
                    <div className="w-40 h-40 md:w-52 md:h-52 rounded-[2.5rem] p-1.5 bg-black shadow-2xl relative z-10 overflow-hidden transform transition-transform duration-500 hover:scale-105">
                        <img src={user.avatar} alt="Profile" className="w-full h-full rounded-[2.2rem] object-cover" />
                    </div>
                    {user.showStonerBadge && (
                        <div className="absolute -bottom-2 -right-2 z-20 bg-black rounded-full p-3 border-[5px] border-black shadow-lg">
                            <Leaf size={28} className="text-gsn-green fill-gsn-green animate-pulse-slow" />
                        </div>
                    )}
                </div>

                {/* Name & Handle */}
                <div className="flex-1 pb-3 space-y-2">
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">{user.name}</h1>
                    <div className="flex items-center gap-4 text-zinc-400 font-medium text-xl">
                        <span>{user.handle}</span>
                        {user.verified && <Shield size={20} className="text-blue-400 fill-blue-400/20" />}
                        <span className="px-3 py-1 rounded-full bg-zinc-800 border border-white/10 text-xs uppercase tracking-wider text-zinc-300 font-bold">
                            {user.role}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="w-full md:w-auto flex gap-4 pb-3">
                    {isCurrentUser ? (
                        <>
                            <button 
                                onClick={onEditProfile} 
                                className="flex-1 md:flex-none h-14 px-10 rounded-2xl bg-white text-black font-bold hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] text-lg"
                            >
                                Edit Profile
                            </button>
                            <button 
                                onClick={onNavigateToAdmin} 
                                className="h-14 w-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                            >
                                <Shield size={24} />
                            </button>
                        </>
                    ) : (
                        <>
                            <button 
                                onClick={handleToggleFollow}
                                className={`flex-1 md:flex-none h-14 px-10 rounded-2xl font-bold transition-all shadow-lg text-lg ${
                                    isFollowingState 
                                    ? 'bg-zinc-900 text-white border border-zinc-700 hover:border-red-500 hover:text-red-500' 
                                    : 'bg-gsn-green text-black hover:bg-green-400 shadow-green-500/20'
                                }`}
                            >
                                {isFollowingState ? 'Following' : 'Follow'}
                            </button>
                            <button className="h-14 w-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-white hover:bg-zinc-800 transition-colors">
                                <MessageCircle size={26} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Bio & Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-20 mb-16">
                
                {/* Bio Column */}
                <div className="lg:col-span-2 space-y-8">
                    <p className="text-2xl text-zinc-200 font-light leading-relaxed whitespace-pre-wrap">
                        {user.bio || "Just growing through life. 🌱"}
                    </p>
                    
                    {/* Metadata Pills */}
                    <div className="flex flex-wrap gap-4">
                        {user.business && (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-white/5 text-zinc-400 text-sm font-medium">
                                <Briefcase size={16} /> {user.business}
                            </div>
                        )}
                        {user.school && (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-white/5 text-zinc-400 text-sm font-medium">
                                <GraduationCap size={16} /> {user.school}
                            </div>
                        )}
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-white/5 text-zinc-400 text-sm font-medium">
                            <MapPin size={16} /> Denver, CO
                        </div>
                        {user.website && (
                            <a href={user.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-white/5 text-gsn-green hover:bg-zinc-800 text-sm font-medium transition-colors">
                                <LinkIcon size={16} /> {user.website.replace(/^https?:\/\//, '')}
                            </a>
                        )}
                    </div>
                </div>

                {/* Stats Column */}
                <div className="flex justify-between lg:justify-end items-start gap-12 pt-8 lg:pt-0 border-t lg:border-t-0 lg:border-l border-white/5">
                    <StatItem label="Posts" value={userPosts.length.toString()} />
                    <StatItem label="Followers" value={followerCount.toLocaleString()} />
                    <StatItem label="Following" value={followingCount.toLocaleString()} />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-12 border-b border-white/10 mb-10 sticky top-0 z-30 bg-black/80 backdrop-blur-xl -mx-6 px-6 md:mx-0 md:px-0 pt-4">
                <TabButton active={activeTab === 'posts'} onClick={() => setActiveTab('posts')} icon={<Grid size={20} />} label="Posts" />
                <TabButton active={activeTab === 'reels'} onClick={() => setActiveTab('reels')} icon={<Film size={20} />} label="Reels" />
                <TabButton active={activeTab === 'shop'} onClick={() => setActiveTab('shop')} icon={<ShoppingBag size={20} />} label="Shop" />
            </div>

            {/* Content Grid */}
            {activeTab === 'posts' && (
                <div className="grid grid-cols-3 gap-1 md:gap-6">
                    {userPosts.map(post => (
                        <div key={post.id} className="aspect-square bg-zinc-900 relative group cursor-pointer overflow-hidden md:rounded-3xl">
                            {post.images && post.images.length > 0 ? (
                                <img src={post.images[0]} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Post" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center p-6 text-center text-sm text-zinc-500 leading-relaxed font-medium">
                                    {post.content}
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-bold backdrop-blur-sm">
                                <span className="flex items-center gap-2"><Heart size={20} fill="white"/> {post.likes}</span>
                                <span className="flex items-center gap-2"><MessageCircle size={20} fill="white"/> {post.comments}</span>
                            </div>
                        </div>
                    ))}
                    {userPosts.length === 0 && (
                        <EmptyState label="No posts yet" />
                    )}
                </div>
            )}

            {activeTab === 'reels' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {userReels.map(reel => (
                        <div key={reel.id} className="aspect-[9/16] bg-zinc-900 rounded-3xl overflow-hidden relative group cursor-pointer">
                            <img src={reel.videoUrl} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-500" alt="Reel" />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 flex flex-col justify-end p-5">
                                <div className="flex items-center gap-2 text-white text-sm font-bold mb-2">
                                    <Film size={14} /> {reel.likes}
                                </div>
                                <p className="text-white text-sm line-clamp-2 leading-snug opacity-90 font-medium">{reel.caption}</p>
                            </div>
                        </div>
                    ))}
                    {userReels.length === 0 && (
                        <EmptyState label="No reels yet" />
                    )}
                </div>
            )}

            {activeTab === 'shop' && (
                <UserShop products={userProducts} />
            )}

        </div>
    </div>
  );
};

const StatItem = ({ label, value }: { label: string, value: string }) => (
    <div className="text-center lg:text-right">
        <div className="text-3xl md:text-4xl font-black text-white mb-2">{value}</div>
        <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{label}</div>
    </div>
);

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
    <button 
        onClick={onClick} 
        className={`flex items-center gap-3 py-5 border-b-2 transition-all ${
            active 
            ? 'border-gsn-green text-white' 
            : 'border-transparent text-zinc-500 hover:text-zinc-300'
        }`}
    >
        {icon}
        <span className="font-bold text-sm uppercase tracking-widest">{label}</span>
    </button>
);

const EmptyState = ({ label, sub }: { label: string, sub?: string }) => (
    <div className="col-span-full py-32 flex flex-col items-center justify-center text-zinc-500">
        <Grid size={64} className="opacity-20 mb-6" />
        <p className="font-bold text-xl mb-2">{label}</p>
        {sub && <p className="text-base">{sub}</p>}
    </div>
);

export default Profile;
