
import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share2, MoreVertical, Music, Camera, X, Zap, RotateCcw, Check, Sparkles, Disc, Send, Flag, Ban, VolumeX, Save, ArrowRight, ArrowLeft, Smartphone, PlayCircle, Star } from 'lucide-react';
import { MOCK_REELS, CURRENT_USER } from '../constants';
import { Reel } from '../types';
import ReportModal from './ReportModal';
import PageGuide from './PageGuide';

type ReelFeedItem = Reel | { type: 'promo'; id: string };

const MOCK_COMMENTS = [
    { id: 1, user: 'GrowMaster99', text: 'This is insane! 🔥', avatar: 'https://picsum.photos/50/50?random=101' },
    { id: 2, user: 'MaryJane_Doe', text: 'What nutrient line are you using?', avatar: 'https://picsum.photos/50/50?random=102' },
    { id: 3, user: 'CannaKing', text: 'Goals. 🙌', avatar: 'https://picsum.photos/50/50?random=103' },
    { id: 4, user: 'TerpHunter', text: 'That frost is unreal 🥶', avatar: 'https://picsum.photos/50/50?random=104' },
];

const Reels: React.FC<{ onNavigateToProfile: (id: string) => void, onNavigateToCreateReel: () => void, onBack: () => void }> = ({ onNavigateToProfile, onNavigateToCreateReel, onBack }) => {
  const [items, setItems] = useState<ReelFeedItem[]>([]);

  useEffect(() => {
    // Duplicate mock data to create a longer feed
    const baseReels = [...MOCK_REELS, ...MOCK_REELS, ...MOCK_REELS];
    const withPromo: ReelFeedItem[] = [...baseReels];
    
    // Inject the "Post Reel" promo card randomly between index 1 and 4
    const promoIndex = Math.floor(Math.random() * 3) + 1; 
    withPromo.splice(promoIndex, 0, { type: 'promo', id: 'promo-card' });
    
    setItems(withPromo);
  }, []);

  return (
    <div className="h-screen w-full bg-black relative">
        <PageGuide 
            pageKey="reels"
            steps={[
                { title: "Swipe Up", description: "Discover endless short-form content from the best growers and creators.", icon: <Smartphone size={20} /> },
                { title: "Get Creative", description: "Tap the camera icon to record your own clips, add music, and share your harvest.", icon: <Camera size={20} /> },
                { title: "Engage", description: "Double tap to like, share with friends, and join the conversation in the comments.", icon: <Heart size={20} /> }
            ]}
        />

      {/* Header overlay for Reels view */}
      <div className="absolute top-4 left-4 right-4 z-40 flex justify-between items-center pointer-events-none">
         <div className="flex items-center gap-4 pointer-events-auto">
             <button onClick={onBack} className="p-2 -ml-2 text-white/80 hover:text-white transition-colors">
                <ArrowLeft size={24} />
             </button>
             <h2 className="text-xl font-bold font-sans tracking-tighter drop-shadow-md text-white">Reels</h2>
         </div>
         <button 
            onClick={onNavigateToCreateReel}
            className="pointer-events-auto p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all"
         >
            <Camera className="text-white" size={24} />
         </button>
      </div>

      <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar">
        {items.map((item, index) => (
          <div key={`${item.id}-${index}`} className="h-full w-full snap-start relative flex justify-center bg-black border-b border-zinc-900">
             {('type' in item && item.type === 'promo') ? (
                 <PromoSlide onAction={onNavigateToCreateReel} />
             ) : (
                 <ReelPlayer reel={item as Reel} onNavigateToProfile={onNavigateToProfile} />
             )}
          </div>
        ))}
      </div>
    </div>
  );
};

const ReelPlayer = ({ reel, onNavigateToProfile }: { reel: Reel, onNavigateToProfile: (id: string) => void }) => {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(reel.likes);
    const [followed, setFollowed] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [subscribed, setSubscribed] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    
    // Overlay States
    const [activeOverlay, setActiveOverlay] = useState<'none' | 'comments' | 'options' | 'music'>('none');
    const [commentText, setCommentText] = useState('');

    const handleLike = () => {
        setLiked(!liked);
        setLikeCount(prev => liked ? prev - 1 : prev + 1);
    };

    const handleFollow = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFollowed(!followed);
    };

    const handleShare = async () => {
        let shareUrl = `https://greenstoners.com/reel/${reel.id}`;
        try {
            if (window.location.protocol.startsWith('http')) {
                shareUrl = `${window.location.origin}/reel/${reel.id}`;
            }
        } catch (e) {
            // Fallback
        }

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Check out this reel on Green',
                    text: reel.caption,
                    url: shareUrl
                });
            } catch (err) {
                // Ignore AbortError which happens when user cancels the share dialog
                if ((err as Error).name === 'AbortError') return;
                
                console.error("Share failed:", err);
                try {
                    await navigator.clipboard.writeText(shareUrl);
                    alert("Link copied to clipboard!");
                } catch (clipboardErr) {
                    alert("Link: " + shareUrl);
                }
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareUrl);
                alert("Link copied to clipboard!");
            } catch (clipboardErr) {
                alert("Link: " + shareUrl);
            }
        }
    };

    const handleProfileClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onNavigateToProfile(reel.user.id);
    }

    const handleSubscribe = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSubscribed(!subscribed);
    }

    const closeOverlay = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setActiveOverlay('none');
    }

    return (
        <div className="h-full w-full md:max-w-md relative overflow-hidden bg-zinc-900 group">
            {showReportModal && (
                <ReportModal 
                    type="Post" 
                    targetId={reel.id} 
                    onClose={() => setShowReportModal(false)} 
                />
            )}
            
            {/* Video Placeholder */}
            <img 
                src={reel.videoUrl} 
                alt="Reel content" 
                className="h-full w-full object-cover opacity-80 transition-opacity duration-300" 
                onClick={() => setIsPlaying(!isPlaying)}
            />
            
            {/* Play/Pause Icon Overlay */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none z-10">
                    <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                        <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[20px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                    </div>
                </div>
            )}

            {/* Content Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90 flex flex-col justify-end p-4 pb-20 md:pb-8 pointer-events-none">
                
                {/* Right Side Actions */}
                <div className="absolute right-4 bottom-24 md:bottom-12 flex flex-col items-center gap-6 z-20 pointer-events-auto">
                    <div className="relative group/avatar cursor-pointer" onClick={handleProfileClick}>
                        <img src={reel.user.avatar} className={`w-12 h-12 rounded-full border-2 transition-all ${followed ? 'border-gsn-green' : 'border-white'}`} alt="User" />
                        {!followed && (
                            <div 
                                onClick={handleFollow}
                                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gsn-green rounded-full p-0.5 shadow-lg scale-100 transition-transform group-hover/avatar:scale-110"
                            >
                                <span className="w-4 h-4 text-black font-bold flex items-center justify-center text-xs">+</span>
                            </div>
                        )}
                        {followed && (
                             <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-zinc-800 rounded-full p-0.5 border border-gsn-green">
                                <Check size={12} className="text-gsn-green" />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col items-center gap-1">
                        <button 
                            onClick={handleLike}
                            className="p-3 bg-zinc-800/40 backdrop-blur-sm rounded-full transition-transform active:scale-90 hover:bg-zinc-800/60"
                        >
                            <Heart size={28} className={`transition-colors drop-shadow-lg ${liked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                        </button>
                        <span className="text-white text-xs font-bold drop-shadow-md">{likeCount}</span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                        <button 
                            onClick={() => setActiveOverlay('comments')}
                            className="p-3 bg-zinc-800/40 backdrop-blur-sm rounded-full transition-transform active:scale-90 hover:bg-zinc-800/60"
                        >
                            <MessageCircle size={28} className="text-white drop-shadow-lg" />
                        </button>
                        <span className="text-white text-xs font-bold drop-shadow-md">420</span>
                    </div>

                    <button 
                        onClick={handleShare}
                        className="p-3 bg-zinc-800/40 backdrop-blur-sm rounded-full transition-transform active:scale-90 hover:bg-zinc-800/60"
                    >
                        <Share2 size={28} className="text-white drop-shadow-lg" />
                    </button>
                    
                    <button 
                        onClick={() => setActiveOverlay('options')}
                        className="p-3 bg-zinc-800/40 backdrop-blur-sm rounded-full transition-transform active:scale-90 hover:bg-zinc-800/60"
                    >
                        <MoreVertical size={28} className="text-white drop-shadow-lg" />
                    </button>
                </div>

                {/* Bottom Info */}
                <div className="z-10 max-w-[80%] space-y-3 pointer-events-auto">
                    <div className="flex items-center gap-2">
                        <h3 
                            className="font-bold text-white text-lg flex items-center gap-2 shadow-black drop-shadow-sm cursor-pointer hover:underline"
                            onClick={handleProfileClick}
                        >
                            {reel.user.name}
                            {reel.user.verified && <span className="text-gsn-green text-sm bg-white/10 rounded-full px-1">✓</span>}
                        </h3>
                        <button 
                            onClick={handleSubscribe}
                            className={`border px-2 py-0.5 rounded-md text-xs font-medium backdrop-blur-sm transition-colors ${subscribed ? 'bg-white text-black border-white' : 'text-white/80 border-white/30 hover:bg-white/10'}`}
                        >
                            {subscribed ? 'Subscribed' : 'Subscribe'}
                        </button>
                    </div>

                    <p className="text-white/90 text-sm line-clamp-2 drop-shadow-md">
                        {reel.caption} <span className="text-gsn-green/80">#GreenNetwork</span>
                    </p>
                    
                    <div 
                        onClick={() => setActiveOverlay('music')}
                        className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-3 py-1.5 w-max cursor-pointer hover:bg-white/20 transition-colors"
                    >
                        <Music size={14} className="text-gsn-green animate-spin-slow" />
                        <div className="overflow-hidden w-32">
                             <div className="text-xs text-white whitespace-nowrap animate-marquee">
                                {reel.music} • Original Audio
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* OVERLAYS */}
            
            {/* 1. Comments Overlay */}
            {activeOverlay === 'comments' && (
                <>
                <div className="absolute inset-0 bg-black/50 z-30" onClick={closeOverlay}></div>
                <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-zinc-900 rounded-t-3xl z-40 flex flex-col animate-in slide-in-from-bottom duration-300">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                        <h3 className="text-white font-bold text-center flex-1">Comments (420)</h3>
                        <button onClick={closeOverlay}><X size={20} className="text-zinc-400" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {MOCK_COMMENTS.map(comment => (
                            <div key={comment.id} className="flex gap-3">
                                <img src={comment.avatar} className="w-8 h-8 rounded-full" alt="User" />
                                <div>
                                    <p className="text-xs text-zinc-400 font-bold mb-0.5">{comment.user}</p>
                                    <p className="text-sm text-white">{comment.text}</p>
                                </div>
                                <div className="flex-1"></div>
                                <button className="text-zinc-500 hover:text-red-500"><Heart size={14} /></button>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-white/10 bg-zinc-900 pb-safe">
                         <div className="flex items-center gap-2 bg-black rounded-full px-4 py-2 border border-white/10">
                            <input 
                                type="text" 
                                placeholder="Add a comment..." 
                                className="bg-transparent flex-1 text-sm text-white focus:outline-none"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                            />
                            <button 
                                className={`text-gsn-green font-bold text-sm ${!commentText && 'opacity-50'}`}
                                disabled={!commentText}
                                onClick={() => {
                                    setCommentText('');
                                    alert('Comment posted!');
                                }}
                            >
                                Post
                            </button>
                         </div>
                    </div>
                </div>
                </>
            )}

            {/* 2. Options Overlay */}
            {activeOverlay === 'options' && (
                <>
                <div className="absolute inset-0 bg-black/50 z-30" onClick={closeOverlay}></div>
                <div className="absolute bottom-0 left-0 right-0 bg-zinc-900 rounded-t-3xl z-40 flex flex-col animate-in slide-in-from-bottom duration-300 p-4 pb-8 space-y-2">
                    <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto mb-4"></div>
                    <button className="flex items-center gap-3 w-full p-4 hover:bg-white/5 rounded-xl text-white font-medium transition-colors">
                        <Save size={20} /> Save Reel
                    </button>
                    <button className="flex items-center gap-3 w-full p-4 hover:bg-white/5 rounded-xl text-white font-medium transition-colors">
                        <VolumeX size={20} /> Mute
                    </button>
                    <button className="flex items-center gap-3 w-full p-4 hover:bg-white/5 rounded-xl text-white font-medium transition-colors">
                        <Ban size={20} /> Not Interested
                    </button>
                    <div className="h-[1px] bg-white/10 my-2"></div>
                    <button 
                        onClick={() => {
                            setActiveOverlay('none');
                            setShowReportModal(true);
                        }}
                        className="flex items-center gap-3 w-full p-4 hover:bg-red-500/10 rounded-xl text-red-500 font-medium transition-colors"
                    >
                        <Flag size={20} /> Report
                    </button>
                </div>
                </>
            )}

            {/* 3. Music Overlay */}
            {activeOverlay === 'music' && (
                <>
                <div className="absolute inset-0 bg-black/50 z-30" onClick={closeOverlay}></div>
                <div className="absolute bottom-0 left-0 right-0 bg-zinc-900 rounded-t-3xl z-40 flex flex-col animate-in slide-in-from-bottom duration-300 p-6 pb-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-zinc-800 rounded-lg flex items-center justify-center border border-white/10">
                            <Music size={32} className="text-gsn-green" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">{reel.music}</h3>
                            <p className="text-zinc-400 text-sm">Original Audio • {reel.user.name}</p>
                        </div>
                    </div>
                    <button className="w-full bg-gsn-green text-black font-bold py-3 rounded-full hover:bg-green-400 transition-colors flex items-center justify-center gap-2">
                        <Disc size={20} /> Use Audio
                    </button>
                </div>
                </>
            )}

        </div>
    );
}

const PromoSlide = ({ onAction }: { onAction: () => void }) => {
    return (
        <div className="h-full w-full md:max-w-md relative overflow-hidden bg-zinc-900 flex flex-col items-center justify-center p-8 text-center group">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('https://picsum.photos/800/1200?blur=10')] bg-cover opacity-30 group-hover:scale-105 transition-transform duration-1000"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-gsn-green/20 via-black/80 to-purple-900/40"></div>
            
            <div className="relative z-10 glass-panel p-8 rounded-3xl border border-gsn-green/30 neon-glow flex flex-col items-center gap-6 max-w-sm w-full transform transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(74,222,128,0.2)]">
                <div className="w-20 h-20 bg-gsn-green rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(74,222,128,0.5)] animate-pulse">
                    <Camera size={40} className="text-black" />
                </div>
                
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Show Your Grow</h2>
                    <p className="text-zinc-300">
                        Share your latest harvest, tips, or smoke spots with the community.
                    </p>
                </div>

                <button 
                    onClick={onAction}
                    className="w-full py-4 bg-gsn-green text-black font-bold text-lg rounded-xl hover:bg-green-400 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                    <Sparkles size={20} />
                    Create Reel
                </button>
                
                <p className="text-xs text-zinc-500">Join 15k+ growers sharing daily.</p>
            </div>
        </div>
    );
};

export default Reels;
