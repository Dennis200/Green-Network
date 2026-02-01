
import React from 'react';
import { Bookmark, Share2, Ban, Flag, Copy, Send, Camera, Instagram, Twitter, MessageSquare, Repeat, PenTool, Trash2 } from 'lucide-react';
import { ActionSheet } from './ActionSheet';

// --- Reusable Menu Components ---

export const MenuButton = ({ 
    icon, 
    label, 
    subLabel, 
    onClick, 
    color = "text-white", 
    bg = "bg-zinc-800",
    danger = false 
}: { 
    icon: React.ReactNode, 
    label: string, 
    subLabel?: string, 
    onClick: () => void, 
    color?: string, 
    bg?: string,
    danger?: boolean
}) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-[0.98] ${danger ? 'bg-red-500/10 hover:bg-red-500/20' : 'bg-zinc-800 hover:bg-zinc-700'}`}
    >
        <div className={`${danger ? 'text-red-500' : color}`}>{icon}</div>
        <div className="text-left">
            <span className={`block font-bold text-base ${danger ? 'text-red-500' : 'text-white'}`}>{label}</span>
            {subLabel && <span className="text-xs text-zinc-400 font-normal">{subLabel}</span>}
        </div>
    </button>
);

export const CancelButton = ({ onClick }: { onClick: () => void }) => (
    <button 
        onClick={onClick}
        className="w-full py-4 mt-2 bg-black border border-zinc-800 rounded-2xl font-bold text-zinc-400 hover:text-white transition-colors active:bg-zinc-900"
    >
        Cancel
    </button>
);

// --- Specific Menus ---

export const MoreMenu = ({ onClose, type, onReport, onBookmark, isBookmarked }: { onClose: () => void, type: string, onReport: () => void, onBookmark?: () => void, isBookmarked?: boolean }) => (
    <ActionSheet onClose={onClose}>
        <div className="space-y-2">
            {onBookmark && (
                <MenuButton 
                    icon={<Bookmark size={22} fill={isBookmarked ? "currentColor" : "none"} />} 
                    label={isBookmarked ? "Remove from Saved" : "Save"} 
                    onClick={() => { onBookmark(); onClose(); }}
                />
            )}
            
            <MenuButton 
                icon={<Share2 size={22} />} 
                label="Share" 
                onClick={() => {
                    // Logic handled in parent usually, or we trigger ShareSheet
                    // For now this is just an option in the More menu
                    alert("Share triggered"); 
                    onClose();
                }} 
            />
            
            {(type === 'User' || type === 'Chat') && (
                <MenuButton 
                    icon={<Ban size={22} />} 
                    label="Block" 
                    onClick={() => { alert("Block triggered"); onClose(); }} 
                />
            )}

            <MenuButton 
                icon={<Flag size={22} />} 
                label={`Report ${type}`} 
                onClick={onReport} 
                danger
            />
        </div>
        <CancelButton onClick={onClose} />
    </ActionSheet>
);

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
        <ActionSheet onClose={onClose} title="Share to...">
            <div className="grid grid-cols-4 gap-4 mb-4">
                <ShareOption icon={<Copy size={24} />} label="Copy" color="bg-zinc-800" onClick={() => { if(postLink) navigator.clipboard.writeText(postLink); alert("Copied!"); onClose(); }} />
                <ShareOption icon={<Send size={24} />} label="DM" color="bg-gsn-green" iconColor="text-black" onClick={() => handleShare('DM')} />
                <ShareOption icon={<Camera size={24} />} label="Story" color="bg-white" iconColor="text-black" onClick={() => handleShare('Vibe')} />
                <ShareOption icon={<Instagram size={24} />} label="Stories" color="bg-gradient-to-tr from-yellow-500 to-purple-600" onClick={() => handleShare('Instagram')} />
                <ShareOption icon={<Twitter size={24} />} label="X" color="bg-black border border-zinc-700" onClick={() => handleShare('X')} />
                <ShareOption icon={<MessageSquare size={24} />} label="SMS" color="bg-green-500" onClick={() => handleShare('SMS')} />
            </div>
            <CancelButton onClick={onClose} />
        </ActionSheet>
    );
};

const ShareOption = ({ icon, label, color, iconColor = 'text-white', onClick }: { icon: React.ReactNode, label: string, color: string, iconColor?: string, onClick?: () => void }) => (
    <button onClick={onClick} className="flex flex-col items-center gap-2">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${color} ${iconColor} shadow-lg active:scale-90 transition-transform`}>
            {icon}
        </div>
        <span className="text-xs font-bold text-zinc-400">{label}</span>
    </button>
);

export const RepostMenu = ({ onClose, onRepost, onQuote }: { onClose: () => void, onRepost: () => void, onQuote: () => void }) => (
    <ActionSheet onClose={onClose} title="Repost">
        <div className="space-y-2">
            <MenuButton 
                icon={<Repeat size={24} className="text-green-500" />} 
                label="Repost" 
                subLabel="Instantly share to your feed"
                onClick={onRepost}
            />
            
            <MenuButton 
                icon={<PenTool size={24} className="text-blue-400" />} 
                label="Quote Post" 
                subLabel="Add your own thoughts"
                onClick={onQuote}
            />
        </div>
        <CancelButton onClick={onClose} />
    </ActionSheet>
);
