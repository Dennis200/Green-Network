
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, UserPlus, Shield } from 'lucide-react';
import { User } from '../types';
import { getWhoToFollow } from '../services/userService';
import { auth } from '../services/firebase';
import { followUser, unfollowUser, checkIsFollowing } from '../services/dataService';

interface ConnectPeopleProps {
    onBack: () => void;
    onNavigateToProfile: (id: string) => void;
}

const ConnectPeople: React.FC<ConnectPeopleProps> = ({ onBack, onNavigateToProfile }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (auth.currentUser) {
            getWhoToFollow(auth.currentUser.uid).then((data) => {
                setUsers(data);
                setLoading(false);
            });
        }
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col">
                <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-white/10 p-4 flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-xl font-bold text-white">Connect</h1>
                </div>
                <div className="p-8 text-center text-zinc-500">Loading recommendations...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black pb-20 md:pb-0">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-black/90 backdrop-blur-md border-b border-white/10 p-4 flex items-center gap-4">
                <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-white">Who to follow</h1>
                    <p className="text-xs text-zinc-500">Suggested for you</p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto">
                {users.map(user => (
                    <UserFollowCard key={user.id} user={user} onNavigateToProfile={onNavigateToProfile} />
                ))}
                {users.length === 0 && (
                    <div className="p-12 text-center text-zinc-500">
                        No suggestions right now. Try exploring the feed!
                    </div>
                )}
            </div>
        </div>
    );
};

const UserFollowCard: React.FC<{ user: User, onNavigateToProfile: (id: string) => void }> = ({ user, onNavigateToProfile }) => {
    const [isFollowing, setIsFollowing] = useState(false);

    useEffect(() => {
        if (auth.currentUser) {
            checkIsFollowing(auth.currentUser.uid, user.id).then(setIsFollowing);
        }
    }, [user.id]);

    const handleToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!auth.currentUser) return;
        
        if (isFollowing) {
            await unfollowUser(auth.currentUser.uid, user.id);
            setIsFollowing(false);
        } else {
            await followUser(auth.currentUser.uid, user.id);
            setIsFollowing(true);
        }
    }

    return (
        <div 
            onClick={() => onNavigateToProfile(user.id)}
            className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5"
        >
            <img src={user.avatar} className="w-12 h-12 rounded-full object-cover border border-white/10" alt={user.name} />
            
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-base hover:underline truncate">{user.name}</span>
                    {user.verified && <Shield size={14} className="text-blue-400 fill-blue-400/20" />}
                </div>
                <div className="text-zinc-500 text-sm truncate">{user.handle}</div>
                {user.bio && <p className="text-zinc-400 text-sm mt-1 line-clamp-1">{user.bio}</p>}
            </div>

            <button 
                onClick={handleToggle}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                    isFollowing 
                    ? 'bg-transparent text-white border border-zinc-600 hover:border-red-500 hover:text-red-500' 
                    : 'bg-white text-black hover:bg-zinc-200'
                }`}
            >
                {isFollowing ? 'Following' : 'Follow'}
            </button>
        </div>
    );
};

export default ConnectPeople;