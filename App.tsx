
import React, { useState, useEffect, useRef } from 'react';
import { Leaf, Home, Film, MessageCircle, User as UserIcon, ShieldCheck, Plus, Image as ImageIcon, Video, Camera, Mic, PenTool, X, Search, MapPin, Bell, Users, ShoppingBag, Shield, Settings, Bookmark, Star, LogOut, Moon, Zap, ChevronRight, Menu, Megaphone, Wallet, Radio } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './services/firebase';
import { subscribeToUserProfile, createUserProfile, userProfileExists } from './services/userService';
import { subscribeToNotifications, subscribeToChats } from './services/dataService';
import { ViewState, User, Notification } from './types';
import Feed from './components/Feed';
import Reels from './components/Reels';
import { Profile } from './components/Profile';
import Chat from './components/Chat';
import Explore from './components/Explore';
import CreatePost from './components/CreatePost';
import CreateVibe from './components/CreateVibe';
import LinkUp from './components/LinkUp';
import CreateReel from './components/CreateReel';
import PostDetail from './components/PostDetail';
import Notifications from './components/Notifications';
import Communities from './components/Communities';
import EditProfile from './components/EditProfile';
import Marketplace from './components/Marketplace';
import AdminDashboard from './components/AdminDashboard';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import AdCenter from './components/AdCenter';
import SettingsPage from './components/Settings';
import WalletPage from './components/Wallet';
import SavedPage from './components/Saved';
import { CURRENT_USER, MOCK_POSTS } from './constants';
import { OnboardingTour } from './components/OnboardingTour';

// --- RIGHT SIDE MENU (BURGER MENU) ---
const RightSideMenu = ({ isOpen, onClose, onNavigate, unreadMsg, unreadNotif }: { isOpen: boolean; onClose: () => void; onNavigate: (view: ViewState) => void, unreadMsg: number, unreadNotif: number }) => {
    return (
        <>
            {/* Backdrop */}
            <div 
                className={`fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />
            
            {/* Drawer (From Right) */}
            <div 
                className={`fixed inset-y-0 right-0 z-[90] w-[80%] max-w-[320px] bg-[#09090b] border-l border-white/10 shadow-2xl transform transition-transform duration-300 ease-out md:hidden flex flex-col`}
                style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
            >
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-xl font-black text-white tracking-tighter">MENU</h2>
                    <button onClick={onClose} className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-3">
                    <div className="text-xs font-bold text-zinc-500 uppercase px-4 mb-2 tracking-widest">Essentials</div>
                    
                    <RightMenuItem 
                        icon={<MessageCircle size={24} />} 
                        label="Messenger" 
                        onClick={() => { onNavigate(ViewState.CHAT); onClose(); }} 
                        badgeCount={unreadMsg}
                    />
                    
                    <RightMenuItem 
                        icon={<Bell size={24} />} 
                        label="Notifications" 
                        onClick={() => { onNavigate(ViewState.NOTIFICATIONS); onClose(); }} 
                        badgeCount={unreadNotif}
                    />

                    <div className="my-6 border-t border-white/5 mx-2"></div>
                    <div className="text-xs font-bold text-zinc-500 uppercase px-4 mb-2 tracking-widest">Discover</div>

                    <RightMenuItem 
                        icon={<Search size={24} />} 
                        label="Explore" 
                        onClick={() => { onNavigate(ViewState.EXPLORE); onClose(); }} 
                    />
                     <RightMenuItem 
                        icon={<MapPin size={24} />} 
                        label="Link Up Map" 
                        onClick={() => { onNavigate(ViewState.LINKUP); onClose(); }} 
                    />
                    
                    <div className="my-6 border-t border-white/5 mx-2"></div>
                    <RightMenuItem 
                        icon={<Megaphone size={24} />} 
                        label="Create Ad" 
                        onClick={() => { onNavigate(ViewState.ADS_MANAGER); onClose(); }} 
                    />
                </div>
            </div>
        </>
    );
};

const RightMenuItem = ({ icon, label, onClick, badgeCount, color }: { icon: React.ReactNode, label: string, onClick: () => void, badgeCount?: number, color?: string }) => (
    <button 
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-900 transition-all group border border-transparent hover:border-white/5"
    >
        <div className="flex items-center gap-5">
            <div className={`p-2.5 rounded-xl bg-zinc-900 group-hover:bg-black transition-colors ${color || 'text-zinc-400 group-hover:text-white'}`}>
                {icon}
            </div>
            <span className="font-bold text-white text-base">{label}</span>
        </div>
        {badgeCount ? (
            <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg shadow-red-500/20">
                {badgeCount > 9 ? '9+' : badgeCount}
            </div>
        ) : (
            <ChevronRight size={18} className="text-zinc-600 group-hover:text-zinc-400" />
        )}
    </button>
);

// --- LEFT SIDE PROFILE MENU ---
const SideMenu = ({ isOpen, onClose, user, onNavigate, onLogout }: { isOpen: boolean; onClose: () => void; user: User; onNavigate: (view: ViewState) => void; onLogout: () => void }) => {
    const [startX, setStartX] = useState<number | null>(null);
    const [currentX, setCurrentX] = useState(0);

    const handleTouchStart = (e: React.TouchEvent) => setStartX(e.touches[0].clientX);
    const handleTouchMove = (e: React.TouchEvent) => {
        if (startX === null) return;
        const diff = startX - e.touches[0].clientX;
        if (diff > 0) setCurrentX(-diff);
    };
    const handleTouchEnd = () => {
        if (currentX < -100) onClose();
        setCurrentX(0);
        setStartX(null);
    };

    return (
        <>
            <div 
                className={`fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />
            <div 
                className={`fixed inset-y-0 left-0 z-[90] w-[85%] max-w-[340px] bg-black border-r border-white/10 shadow-2xl transform transition-transform duration-300 ease-out md:hidden flex flex-col`}
                style={{ transform: isOpen ? `translateX(${currentX}px)` : 'translateX(-100%)' }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Header Profile Section */}
                <div className="p-8 pb-6 border-b border-white/5">
                    <div className="flex justify-between items-start mb-6">
                        <div onClick={() => { onNavigate(ViewState.PROFILE); onClose(); }} className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-gsn-green to-blue-500 cursor-pointer">
                            <img src={user.avatar} className="w-full h-full rounded-full border-2 border-black" alt="Me" />
                        </div>
                        <button onClick={onClose} className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white">{user.name}</h2>
                        <p className="text-zinc-500 font-medium">{user.handle}</p>
                    </div>
                    <div className="flex gap-4 mt-6">
                        <div className="text-sm text-white"><span className="font-bold">1.2k</span> <span className="text-zinc-500">Following</span></div>
                        <div className="text-sm text-white"><span className="font-bold">4.8k</span> <span className="text-zinc-500">Followers</span></div>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                    <MenuItem icon={<Home size={24} />} label="Home" onClick={() => { onNavigate(ViewState.FEED); onClose(); }} />
                    <MenuItem icon={<Users size={24} />} label="Communities" onClick={() => { onNavigate(ViewState.COMMUNITIES); onClose(); }} />
                    <MenuItem icon={<Film size={24} />} label="Reels" onClick={() => { onNavigate(ViewState.REELS); onClose(); }} />
                    <MenuItem icon={<ShoppingBag size={24} />} label="Marketplace" onClick={() => { onNavigate(ViewState.MARKETPLACE); onClose(); }} />
                    <div className="my-4 border-t border-white/5 mx-2"></div>
                    <MenuItem icon={<Wallet size={24} />} label="Wallet" onClick={() => { onNavigate(ViewState.WALLET); onClose(); }} />
                    <MenuItem icon={<Bookmark size={24} />} label="Saved" onClick={() => { onNavigate(ViewState.SAVED); onClose(); }} />
                    <MenuItem icon={<Settings size={24} />} label="Settings & Privacy" onClick={() => { onNavigate(ViewState.SETTINGS); onClose(); }} />
                    <MenuItem icon={<ShieldCheck size={24} />} label="Admin Dashboard" onClick={() => { onNavigate(ViewState.ADMIN); onClose(); }} />
                </div>

                <div className="p-6 border-t border-white/5">
                    <button 
                        onClick={onLogout}
                        className="flex items-center gap-3 text-red-500 font-bold hover:text-red-400 transition-colors w-full px-4 py-3 rounded-xl hover:bg-red-500/10"
                    >
                        <LogOut size={24} /> Log Out
                    </button>
                </div>
            </div>
        </>
    );
};

const MenuItem = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className="w-full flex items-center gap-5 p-4 rounded-2xl hover:bg-zinc-900 transition-all group"
    >
        <div className="text-zinc-400 group-hover:text-white transition-colors">{icon}</div>
        <span className="font-bold text-white text-lg group-hover:translate-x-1 transition-transform">{label}</span>
    </button>
);

// --- MAIN APP COMPONENT ---
export default function App() {
  const [view, setView] = useState<ViewState>(ViewState.FEED);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeUser, setActiveUser] = useState<string | null>(null); // ID of user being viewed
  const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER); // Logged in user state
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  
  // Navigation State
  const [showLeftMenu, setShowLeftMenu] = useState(false);
  const [showRightMenu, setShowRightMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [following, setFollowing] = useState<string[]>(['u2', 'u3']); 
  const [marketplaceStartCreate, setMarketplaceStartCreate] = useState(false);
  
  // Visibility State
  const [headerVisible, setHeaderVisible] = useState(true);
  const [bottomNavVisible, setBottomNavVisible] = useState(true);
  
  // Real-time Badge Counts
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Refs for scroll handling to avoid re-renders
  const lastScrollY = useRef(0);

  // Search State (Global)
  const [searchQuery, setSearchQuery] = useState('');

  // Onboarding Refs
  const feedRef = useRef(null);
  const marketplaceRef = useRef(null);
  const createRef = useRef(null);
  const communitiesRef = useRef(null);
  const profileRef = useRef(null);
  const [showTour, setShowTour] = useState(false);

  // --- FIREBASE AUTH & DATABASE LISTENER ---
  useEffect(() => {
    let unsubscribeUser: () => void;
    let unsubscribeNotifs: () => void;
    let unsubscribeChats: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
        if (authUser) {
            setIsAuthenticated(true);
            
            // Check if user exists in DB, if not, create default profile
            const exists = await userProfileExists(authUser.uid);
            if (!exists) {
                // Determine display name
                const displayName = authUser.displayName || authUser.email?.split('@')[0] || 'Stoner';
                await createUserProfile(authUser.uid, {
                    name: displayName,
                    email: authUser.email || undefined,
                    avatar: authUser.photoURL || CURRENT_USER.avatar,
                    handle: `@${displayName.replace(/\s+/g, '').toLowerCase()}`
                });
            }

            // Real-time listener for profile changes
            unsubscribeUser = subscribeToUserProfile(authUser.uid, (userData) => {
                setCurrentUser(userData);
            });

            // Listen for Notifications
            unsubscribeNotifs = subscribeToNotifications(authUser.uid, (notifs) => {
                const unreadCount = notifs.filter(n => !n.read).length;
                setUnreadNotifications(unreadCount);
            });

            // Listen for Chats (Unread Messages)
            unsubscribeChats = subscribeToChats(authUser.uid, (chats) => {
                let totalUnread = 0;
                chats.forEach(chat => {
                    if (chat.unread && chat.unread[authUser.uid]) {
                        totalUnread += chat.unread[authUser.uid];
                    }
                });
                setUnreadMessages(totalUnread);
            });

        } else {
            setIsAuthenticated(false);
            setCurrentUser(CURRENT_USER); // Reset to mock for safety
            if (unsubscribeUser) unsubscribeUser();
            if (unsubscribeNotifs) unsubscribeNotifs();
            if (unsubscribeChats) unsubscribeChats();
        }
    });

    return () => {
        unsubscribeAuth();
        if (unsubscribeUser) unsubscribeUser();
        if (unsubscribeNotifs) unsubscribeNotifs();
        if (unsubscribeChats) unsubscribeChats();
    };
  }, []);

  // Helper to determine if current view is immersive (hides nav/header)
  const isImmersive = [
      ViewState.REELS,
      ViewState.CREATE_REEL, 
      ViewState.CREATE_VIBE,
      ViewState.CREATE
  ].includes(view);

  // Reset marketplace create intent if view changes
  useEffect(() => {
      if (view !== ViewState.MARKETPLACE) {
          setMarketplaceStartCreate(false);
      }
  }, [view]);

  // --- SCROLL HANDLER FOR HEADER & BOTTOM NAV ---
  useEffect(() => {
    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        const lastY = lastScrollY.current;
        
        // Only trigger changes if scroll difference is significant
        if (Math.abs(currentScrollY - lastY) > 10) {
            if (currentScrollY > lastY && currentScrollY > 60) {
                // Scrolling Down -> Hide
                setHeaderVisible(false);
                setBottomNavVisible(false);
            } else if (currentScrollY < lastY) {
                // Scrolling Up -> Show
                setHeaderVisible(true);
                setBottomNavVisible(true);
            }
            lastScrollY.current = currentScrollY;
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
        window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleCreateSelect = (type: string) => {
      setShowCreateMenu(false);
      switch(type) {
          case 'post': setView(ViewState.CREATE); break;
          case 'vibe': setView(ViewState.CREATE_VIBE); break;
          case 'reel': setView(ViewState.CREATE_REEL); break;
          case 'listing': 
              setMarketplaceStartCreate(true);
              setView(ViewState.MARKETPLACE); 
              break;
      }
  };

  const handleLogout = async () => {
      try {
          await signOut(auth);
          setIsAuthenticated(false);
          setShowLeftMenu(false);
          setView(ViewState.FEED);
      } catch (error) {
          console.error("Logout failed", error);
      }
  };

  // --- RENDER CURRENT VIEW ---
  const renderView = () => {
    switch (view) {
      case ViewState.FEED:
        return (
            <Feed 
                onNavigateToProfile={(id) => { setActiveUser(id); setView(ViewState.PROFILE); }} 
                onNavigateToPost={(id) => { setSelectedPostId(id); setView(ViewState.POST_DETAILS); }}
                onSearch={(q) => { setSearchQuery(q); setView(ViewState.EXPLORE); }}
                onNavigateToCreateStory={() => setView(ViewState.CREATE_VIBE)}
                onNavigateToMessages={() => setView(ViewState.CHAT)}
                followingIds={following}
                headerVisible={headerVisible}
                onNavigateToReels={() => setView(ViewState.REELS)}
            />
        );
      case ViewState.REELS:
        return (
            <Reels 
                onNavigateToProfile={(id) => { setActiveUser(id); setView(ViewState.PROFILE); }} 
                onNavigateToCreateReel={() => setView(ViewState.CREATE_REEL)} 
                onBack={() => setView(ViewState.FEED)}
            />
        );
      case ViewState.PROFILE:
        return (
            <Profile 
                userId={activeUser || currentUser.id} 
                isCurrentUser={!activeUser || activeUser === currentUser.id}
                isFollowing={activeUser ? following.includes(activeUser) : false}
                onToggleFollow={() => {
                    if (activeUser) {
                        setFollowing(prev => prev.includes(activeUser) ? prev.filter(id => id !== activeUser) : [...prev, activeUser]);
                    }
                }}
                onNavigateToProfile={(id) => setActiveUser(id)}
                onBack={() => { setActiveUser(null); setView(ViewState.FEED); }}
                onEditProfile={() => setView(ViewState.EDIT_PROFILE)}
                onNavigateToAdmin={() => setView(ViewState.ADMIN)}
                userData={!activeUser || activeUser === currentUser.id ? currentUser : undefined}
            />
        );
      case ViewState.EDIT_PROFILE:
        return (
            <EditProfile 
                user={currentUser} 
                onUpdate={(updatedUser) => { 
                    // No local state set needed, listener handles it
                    setView(ViewState.PROFILE); 
                }} 
                onCancel={() => setView(ViewState.PROFILE)} 
            />
        )
      case ViewState.CHAT:
        return <Chat />;
      case ViewState.EXPLORE:
        return <Explore initialQuery={searchQuery} />;
      case ViewState.CREATE:
        return <CreatePost onBack={() => setView(ViewState.FEED)} />;
      case ViewState.CREATE_VIBE:
        return <CreateVibe onExit={() => setView(ViewState.FEED)} onPost={() => setView(ViewState.FEED)} />;
      case ViewState.CREATE_REEL:
        return <CreateReel onExit={() => setView(ViewState.REELS)} onPostComplete={() => setView(ViewState.REELS)} />;
      case ViewState.LINKUP:
        return <LinkUp />;
      case ViewState.MARKETPLACE:
        return <Marketplace onNavigateToChat={() => setView(ViewState.CHAT)} startCreating={marketplaceStartCreate} />;
      case ViewState.POST_DETAILS:
        const post = MOCK_POSTS.find(p => p.id === selectedPostId);
        if (!post) return <Feed onNavigateToProfile={(id) => { setActiveUser(id); setView(ViewState.PROFILE); }} onSearch={()=>{}} onNavigateToCreateStory={()=>{}} onNavigateToMessages={()=>{}} followingIds={following} onNavigateToReels={() => setView(ViewState.REELS)} />;
        return <PostDetail post={post} onBack={() => setView(ViewState.FEED)} onNavigateToProfile={(id) => { setActiveUser(id); setView(ViewState.PROFILE); }} onSearch={(q) => { setSearchQuery(q); setView(ViewState.EXPLORE); }} />;
      case ViewState.NOTIFICATIONS:
        return <Notifications onBack={() => setView(ViewState.FEED)} headerVisible={headerVisible} onSettings={() => setView(ViewState.SETTINGS)} />;
      case ViewState.COMMUNITIES:
        return <Communities onNavigateToProfile={(id) => { setActiveUser(id); setView(ViewState.PROFILE); }} onBack={() => setView(ViewState.FEED)} headerVisible={false} />;
      case ViewState.ADMIN:
        return <AdminDashboard onBack={() => setView(ViewState.FEED)} />;
      case ViewState.ADS_MANAGER:
        return <AdCenter onBack={() => setView(ViewState.FEED)} />;
      case ViewState.SETTINGS:
        return <SettingsPage onBack={() => setView(ViewState.PROFILE)} onLogout={handleLogout} />;
      case ViewState.WALLET:
        return <WalletPage onBack={() => setView(ViewState.PROFILE)} />;
      case ViewState.SAVED:
        return <SavedPage onBack={() => setView(ViewState.PROFILE)} onNavigateToProfile={(id) => { setActiveUser(id); setView(ViewState.PROFILE); }} />;
      default:
        return <Feed onNavigateToProfile={(id) => { setActiveUser(id); setView(ViewState.PROFILE); }} onSearch={()=>{}} onNavigateToCreateStory={()=>{}} onNavigateToMessages={()=>{}} followingIds={following} onNavigateToReels={() => setView(ViewState.REELS)} />;
    }
  };

  // --- LANDING PAGE HANDLER ---
  if (!isAuthenticated) {
      return (
        <LandingPage 
            onEnterApp={() => {
                // Handled by Auth Listener
            }} 
            isAuthenticated={isAuthenticated} 
        />
      );
  }

  // --- APP LAYOUT ---
  return (
    <div className="flex bg-black text-white min-h-screen font-sans selection:bg-gsn-green selection:text-black">
      
      {/* Onboarding Tour */}
      {showTour && (
          <OnboardingTour 
            refs={{ feed: feedRef, marketplace: marketplaceRef, create: createRef, communities: communitiesRef, profile: profileRef }} 
            onComplete={() => setShowTour(false)} 
          />
      )}

      {/* Left Sidebar (Desktop) */}
      <div className="hidden md:flex flex-col w-[80px] xl:w-[280px] border-r border-white/10 sticky top-0 h-screen p-4 justify-between bg-black z-50">
        <div>
            {/* Logo */}
            <div onClick={() => setView(ViewState.FEED)} className="flex items-center gap-3 px-4 mb-8 cursor-pointer group">
                <Leaf className="text-gsn-green w-8 h-8 group-hover:scale-110 transition-transform" />
                <span className="font-black text-2xl tracking-tighter hidden xl:block">GREEN</span>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
                <SidebarItem icon={<Home size={26} />} label="Home" active={view === ViewState.FEED} onClick={() => setView(ViewState.FEED)} />
                <SidebarItem icon={<Search size={26} />} label="Explore" active={view === ViewState.EXPLORE} onClick={() => setView(ViewState.EXPLORE)} />
                <SidebarItem icon={<Film size={26} />} label="Reels" active={view === ViewState.REELS} onClick={() => setView(ViewState.REELS)} />
                <SidebarItem icon={<MessageCircle size={26} />} label="Messages" active={view === ViewState.CHAT} onClick={() => setView(ViewState.CHAT)} badge={unreadMessages || undefined} />
                <SidebarItem icon={<Bell size={26} />} label="Notifications" active={view === ViewState.NOTIFICATIONS} onClick={() => setView(ViewState.NOTIFICATIONS)} badge={unreadNotifications || undefined} />
                <SidebarItem icon={<Users size={26} />} label="Communities" active={view === ViewState.COMMUNITIES} onClick={() => setView(ViewState.COMMUNITIES)} />
                <SidebarItem icon={<ShoppingBag size={26} />} label="Marketplace" active={view === ViewState.MARKETPLACE} onClick={() => setView(ViewState.MARKETPLACE)} />
                <SidebarItem icon={<MapPin size={26} />} label="Link Up" active={view === ViewState.LINKUP} onClick={() => setView(ViewState.LINKUP)} />
                <SidebarItem icon={<UserIcon size={26} />} label="Profile" active={view === ViewState.PROFILE && !activeUser} onClick={() => { setActiveUser(null); setView(ViewState.PROFILE); }} />
            </nav>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-4">
            <button 
                onClick={() => setShowCreateMenu(true)}
                className="w-full bg-gsn-green text-black font-black py-3.5 rounded-full hover:bg-green-400 transition-all flex items-center justify-center gap-2 xl:justify-center shadow-[0_0_20px_rgba(74,222,128,0.3)] hover:shadow-[0_0_30px_rgba(74,222,128,0.5)] transform hover:scale-105 active:scale-95"
            >
                <Plus size={24} strokeWidth={3} />
                <span className="hidden xl:block">CREATE</span>
            </button>
            
            <div className="relative group cursor-pointer" onClick={() => setShowRightMenu(true)}>
                <div className="flex items-center gap-3 p-3 rounded-full hover:bg-white/5 transition-colors">
                    <img src={currentUser.avatar} className="w-10 h-10 rounded-full border border-white/20" alt="Me" />
                    <div className="hidden xl:block overflow-hidden">
                        <p className="font-bold text-sm truncate">{currentUser.name}</p>
                        <p className="text-zinc-500 text-xs">@{currentUser.handle.replace('@','')}</p>
                    </div>
                    <ChevronRight className="ml-auto hidden xl:block text-zinc-500" size={16} />
                </div>
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:border-r border-white/10 relative">
        
        {/* Mobile Header (Only visible on mobile) */}
        {!isImmersive && view !== ViewState.COMMUNITIES && (
            <Header 
                user={currentUser} 
                onOpenSidebar={() => setShowLeftMenu(true)} 
                onOpenRightMenu={() => setShowRightMenu(true)}
                onSearch={(q) => { setSearchQuery(q); setView(ViewState.EXPLORE); }}
                isVisible={headerVisible}
                hasUnread={unreadNotifications > 0 || unreadMessages > 0}
            />
        )}

        {/* View Container */}
        <div className={`flex-1 ${!isImmersive ? 'pt-16 pb-16' : ''} md:pt-0 md:pb-0`}>
            {renderView()}
        </div>

        {/* Mobile Bottom Navigation */}
        {!isImmersive && (
            <div 
                className="md:hidden fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-lg border-t border-white/10 px-6 py-3 flex justify-between items-center z-50 pb-safe transition-transform duration-300 ease-in-out"
                style={{ transform: bottomNavVisible ? 'translateY(0)' : 'translateY(100%)' }}
            >
                <NavButton icon={<Home size={26} />} active={view === ViewState.FEED} onClick={() => setView(ViewState.FEED)} ref={feedRef} />
                <NavButton icon={<ShoppingBag size={26} />} active={view === ViewState.MARKETPLACE} onClick={() => setView(ViewState.MARKETPLACE)} ref={marketplaceRef} />
                
                {/* Floating Action Button */}
                <div className="relative -top-6">
                    <button 
                        ref={createRef as React.RefObject<HTMLButtonElement>}
                        onClick={() => setShowCreateMenu(true)}
                        className="w-14 h-14 bg-gsn-green rounded-full flex items-center justify-center text-black shadow-[0_0_20px_rgba(74,222,128,0.4)] border-4 border-black hover:scale-110 active:scale-95 transition-all"
                    >
                        <Plus size={28} strokeWidth={3} />
                    </button>
                </div>

                <NavButton icon={<Users size={26} />} active={view === ViewState.COMMUNITIES} onClick={() => setView(ViewState.COMMUNITIES)} ref={communitiesRef} />
                <NavButton 
                    icon={<img src={currentUser.avatar} className={`w-7 h-7 rounded-full border-2 ${view === ViewState.PROFILE && !activeUser ? 'border-white' : 'border-transparent'}`} />} 
                    active={view === ViewState.PROFILE && !activeUser} 
                    onClick={() => { setActiveUser(null); setView(ViewState.PROFILE); }} 
                    ref={profileRef}
                />
            </div>
        )}

      </div>

      {/* Menus */}
      <SideMenu 
        isOpen={showLeftMenu} 
        onClose={() => setShowLeftMenu(false)} 
        user={currentUser}
        onNavigate={(v) => { setView(v); setShowLeftMenu(false); }}
        onLogout={handleLogout}
      />
      <RightSideMenu 
        isOpen={showRightMenu} 
        onClose={() => setShowRightMenu(false)} 
        onNavigate={(v) => { setView(v); setShowRightMenu(false); }}
        unreadMsg={unreadMessages}
        unreadNotif={unreadNotifications}
      />
      
      {showCreateMenu && (
          <CreateMenu onClose={() => setShowCreateMenu(false)} onSelect={handleCreateSelect} />
      )}

    </div>
  );
}

// --- SUB COMPONENTS ---

const CreateMenu = ({ onClose, onSelect }: { onClose: () => void, onSelect: (type: string) => void }) => (
    <>
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
        <div className="fixed bottom-0 left-0 right-0 z-[101] bg-zinc-900 rounded-t-[2.5rem] border-t border-white/10 p-8 pb-safe animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-zinc-700 rounded-full mx-auto mb-8" />
            <h3 className="text-center font-black text-white text-2xl mb-8 tracking-tight">CREATE</h3>
            
            <div className="grid grid-cols-4 gap-4 mb-4">
                <CreateOption icon={<ImageIcon size={28} strokeWidth={2} />} label="Post" onClick={() => onSelect('post')} color="bg-blue-500" />
                <CreateOption icon={<Camera size={28} strokeWidth={2} />} label="Vibe" onClick={() => onSelect('vibe')} color="bg-purple-500" />
                <CreateOption icon={<Film size={28} strokeWidth={2} />} label="Reel" onClick={() => onSelect('reel')} color="bg-pink-500" />
                <CreateOption icon={<ShoppingBag size={28} strokeWidth={2} />} label="Listing" onClick={() => onSelect('listing')} color="bg-gsn-green" iconColor="text-black" />
            </div>
        </div>
    </>
);

const CreateOption = ({ icon, label, onClick, color, iconColor = 'text-white' }: any) => (
    <button onClick={onClick} className="flex flex-col items-center gap-3 group w-full">
        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg transition-all group-hover:scale-110 active:scale-95 ${color} ${iconColor}`}>
            {icon}
        </div>
        <span className="text-white font-bold text-xs tracking-wide">{label}</span>
    </button>
);

interface SidebarItemProps {
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
    badge?: number;
}

const SidebarItem = ({ icon, label, active, onClick, badge }: SidebarItemProps) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-4 p-4 rounded-full transition-all group relative ${active ? 'font-black' : 'hover:bg-white/5'}`}
    >
        <div className={`relative ${active ? 'text-gsn-green' : 'text-white group-hover:text-gsn-green transition-colors'}`}>
            {icon}
            {badge && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold border-2 border-black px-1">
                    {badge > 9 ? '9+' : badge}
                </span>
            )}
        </div>
        <span className={`text-xl hidden xl:block ${active ? 'text-white' : 'text-zinc-400 group-hover:text-white transition-colors'}`}>
            {label}
        </span>
    </button>
);

const NavButton = React.forwardRef<HTMLButtonElement, { icon: React.ReactNode, active: boolean, onClick: () => void }>(({ icon, active, onClick }, ref) => (
    <button 
        ref={ref}
        onClick={onClick}
        className={`p-2 rounded-xl transition-all ${active ? 'text-gsn-green scale-110' : 'text-zinc-500 hover:text-white'}`}
    >
        {icon}
    </button>
));
NavButton.displayName = 'NavButton';
