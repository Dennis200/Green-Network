
import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, UserPlus, Repeat, Bell, Settings, ArrowLeft, Check, Trash2, Zap, Camera, CheckCheck } from 'lucide-react';
import { Notification, User } from '../types';
import { subscribeToNotifications, markNotificationRead, markAllNotificationsRead } from '../services/dataService';
import { auth } from '../services/firebase';

interface NotificationsProps {
    onBack?: () => void;
    headerVisible?: boolean;
    onSettings?: () => void;
    onNavigateToPost: (postId: string, commentId?: string) => void;
    onNavigateToProfile: (userId: string) => void;
    onNavigateToMessages: (userId?: string) => void;
}

const Notifications: React.FC<NotificationsProps> = ({ 
    onBack, 
    headerVisible = true, 
    onSettings,
    onNavigateToPost,
    onNavigateToProfile,
    onNavigateToMessages
}) => {
    const [filter, setFilter] = useState<'all' | 'verified' | 'mentions'>('all');
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isMarkingAll, setIsMarkingAll] = useState(false);
    
    useEffect(() => {
        if (auth.currentUser) {
            const unsub = subscribeToNotifications(auth.currentUser.uid, (notifs) => {
                setNotifications(notifs);
            });
            return () => unsub();
        }
    }, []);

    const handleNotificationClick = async (notif: Notification) => {
        // 1. Mark as read in background
        if (!notif.read && auth.currentUser) {
            markNotificationRead(auth.currentUser.uid, notif.id);
        }

        // 2. Navigate based on type
        switch (notif.type) {
            case 'like':
            case 'comment':
            case 'mention':
            case 'repost':
                if (notif.targetId) {
                    onNavigateToPost(notif.targetId, notif.referenceId);
                } else if (notif.user) {
                    // Fallback to user profile if post ID missing
                    onNavigateToProfile(notif.user.id);
                }
                break;
            case 'message':
                if (notif.user) {
                    onNavigateToMessages(notif.user.id);
                } else {
                    onNavigateToMessages();
                }
                break;
            case 'follow':
                if (notif.user) {
                    onNavigateToProfile(notif.user.id);
                }
                break;
            case 'vibe':
                // Vibe logic would go here, maybe open a viewer
                break;
            case 'system':
                // System message, just stay here or open generic settings
                break;
        }
    };

    const handleMarkAllRead = async () => {
        if (!auth.currentUser) return;
        setIsMarkingAll(true);
        await markAllNotificationsRead(auth.currentUser.uid);
        setIsMarkingAll(false);
    };

    // Group notifications (Simple Logic)
    const unreadCount = notifications.filter(n => !n.read).length;
    const today = notifications.filter(n => n.timestamp && (n.timestamp.includes('m') || n.timestamp.includes('h') || n.timestamp === 'Just now'));
    const older = notifications.filter(n => !today.includes(n));

    const renderIcon = (type: string) => {
        switch (type) {
            case 'like': return <div className="p-2 bg-pink-500/10 rounded-full"><Heart size={16} fill="#ec4899" className="text-pink-500" /></div>;
            case 'follow': return <div className="p-2 bg-green-500/10 rounded-full"><UserPlus size={16} fill="#4ade80" className="text-gsn-green" /></div>;
            case 'comment': return <div className="p-2 bg-blue-500/10 rounded-full"><MessageCircle size={16} fill="#60a5fa" className="text-blue-400" /></div>;
            case 'mention': return <div className="p-2 bg-orange-500/10 rounded-full"><span className="font-black text-orange-500 text-sm">@</span></div>;
            case 'vibe': return <div className="p-2 bg-purple-500/10 rounded-full border border-purple-500/20"><Camera size={16} className="text-purple-400" /></div>;
            case 'system': return <div className="p-2 bg-zinc-800 rounded-full"><Zap size={16} className="text-white" /></div>;
            default: return <Bell size={16} className="text-white" />;
        }
    };

    return (
        <div className="min-h-screen bg-black pb-20 md:pb-0">
            {/* Immersive Header */}
            <div className={`sticky ${headerVisible ? 'top-16' : 'top-0'} md:top-0 bg-black/90 backdrop-blur-xl z-30 border-b border-white/5 transition-all duration-500 pt-4`}>
                <div className="px-6 pb-4 flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tight">Activity</h2>
                        <p className="text-zinc-500 text-sm font-medium">Notifications {unreadCount > 0 && <span className="text-gsn-green">• {unreadCount} new</span>}</p>
                    </div>
                    <div className="flex gap-2">
                        {unreadCount > 0 && (
                            <button 
                                onClick={handleMarkAllRead}
                                disabled={isMarkingAll}
                                className="p-2 bg-zinc-900 border border-white/10 rounded-full hover:bg-white/10 transition-colors group"
                                title="Mark all as read"
                            >
                                <CheckCheck size={20} className={`text-zinc-400 group-hover:text-gsn-green ${isMarkingAll ? 'animate-pulse' : ''}`} />
                            </button>
                        )}
                        <button 
                            onClick={onSettings}
                            className="p-2 bg-zinc-900 border border-white/10 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <Settings size={20} className="text-zinc-400" />
                        </button>
                    </div>
                </div>

                {/* Filter Pills */}
                <div className="flex px-6 gap-3 pb-4 overflow-x-auto no-scrollbar">
                    {['All', 'Verified', 'Mentions', 'System'].map((f) => (
                        <button 
                            key={f}
                            onClick={() => setFilter(f.toLowerCase() as any)} 
                            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap ${
                                filter === f.toLowerCase() 
                                ? 'bg-white text-black border-white' 
                                : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* List Content */}
            <div className="px-2 md:px-0 max-w-2xl mx-auto py-4 space-y-8 animate-in slide-in-from-bottom-2 duration-500">
                
                {notifications.length === 0 && (
                    <div className="text-center py-20 text-zinc-500">
                        <Bell size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No new activity.</p>
                    </div>
                )}

                {/* Section: Today */}
                {today.length > 0 && (
                    <section>
                        <h3 className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Recent</h3>
                        <div className="space-y-2">
                            {today.map(notif => (
                                <NotificationItem 
                                    key={notif.id} 
                                    notif={notif} 
                                    renderIcon={renderIcon} 
                                    onClick={() => handleNotificationClick(notif)}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Section: Yesterday */}
                {older.length > 0 && (
                    <section>
                        <h3 className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Older</h3>
                        <div className="space-y-2">
                            {older.map(notif => (
                                <NotificationItem 
                                    key={notif.id} 
                                    notif={notif} 
                                    renderIcon={renderIcon} 
                                    onClick={() => handleNotificationClick(notif)}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

interface NotificationItemProps {
    notif: Notification;
    renderIcon: (t: string) => React.ReactNode;
    onClick: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notif, renderIcon, onClick }) => (
    <div 
        onClick={onClick}
        className={`p-4 mx-2 rounded-2xl flex gap-4 items-start transition-all hover:scale-[1.01] active:scale-95 cursor-pointer border ${!notif.read ? 'bg-zinc-900/80 border-gsn-green/20' : 'bg-transparent border-transparent hover:bg-zinc-900/50'}`}
    >
        <div className="relative shrink-0">
            <div className="w-12 h-12">
                {notif.type === 'system' ? (
                    <div className="w-full h-full bg-zinc-800 rounded-full flex items-center justify-center border border-white/10">
                        <img src="https://picsum.photos/50/50?random=logo" className="w-8 h-8 rounded-full" alt="Logo" />
                    </div>
                ) : (
                    <img src={notif.user?.avatar || 'https://picsum.photos/50/50'} className="w-full h-full rounded-full border border-white/10 object-cover" alt="User" />
                )}
            </div>
            <div className="absolute -bottom-1 -right-1 shadow-lg bg-black rounded-full">
                {renderIcon(notif.type)}
            </div>
        </div>

        <div className="flex-1 pt-1 min-w-0">
            <div className="flex justify-between items-start">
                <p className="text-sm text-white leading-snug">
                    {notif.type === 'system' ? (
                        <span className="font-bold">System Alert</span>
                    ) : (
                        <span className="font-bold hover:underline">{notif.user?.name}</span>
                    )}
                    <span className="text-zinc-400 font-normal ml-1">
                        {notif.type === 'like' && 'liked your post.'}
                        {notif.type === 'follow' && 'started following you.'}
                        {notif.type === 'comment' && 'commented: '}
                        {notif.type === 'mention' && 'mentioned you in a post.'}
                        {notif.type === 'vibe' && 'interacted with your vibe.'}
                        {notif.type === 'system' && notif.text}
                    </span>
                    {notif.type === 'comment' && (
                        <span className="text-zinc-300">"{notif.text}"</span>
                    )}
                </p>
                {!notif.read && <div className="w-2 h-2 rounded-full bg-gsn-green shrink-0 mt-2 ml-2 shadow-[0_0_10px_rgba(74,222,128,0.5)]"></div>}
            </div>
            <p className="text-xs text-zinc-600 mt-1 font-medium">{notif.timestamp}</p>
        </div>

        {notif.postImage && (
            <img src={notif.postImage} className="w-12 h-12 rounded-lg object-cover border border-white/10 shrink-0" alt="Context" />
        )}
        
        {notif.type === 'follow' && (
            <button className="px-4 py-1.5 bg-white text-black text-xs font-bold rounded-full hover:bg-gsn-green transition-colors self-center shrink-0">
                View Profile
            </button>
        )}
    </div>
);

export default Notifications;
