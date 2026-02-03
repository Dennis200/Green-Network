
import React from 'react';
import { Bookmark, Share2, Ban, Flag, Copy, Send, Camera, Instagram, Twitter, MessageSquare, Repeat, PenTool, Trash2 } from 'lucide-react';
import { ActionSheet } from './ActionSheet';

// --- Reusable Menu Components ---

interface DropdownMenuProps {
    children?: React.ReactNode;
    onClose: () => void;
    className?: string;
}

export const DropdownMenu = ({ children, onClose, className = "top-10 right-2" }: DropdownMenuProps) => (
    <>
        <div className="fixed inset-0 z-[40]" onClick={(e) => { e.stopPropagation(); onClose(); }} />
        <div 
            className={`absolute z-[50] w-64 bg-[#111] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right ${className}`}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="py-1.5">
                {children}
            </div>
        </div>
    </>
);

export const MenuButton = ({ 
    icon, 
    label, 
    subLabel, 
    onClick, 
    color = "text-zinc-400", 
    hoverColor = "group-hover:text-white",
    danger = false 
}: { 
    icon: React.ReactNode, 
    label: string, 
    subLabel?: string, 
    onClick: () => void, 
    color?: string, 
    hoverColor?: string,
    danger?: boolean
}) => (
    <button 
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors group ${danger ? 'hover:bg-red-500/10' : 'hover:bg-white/5'}`}
    >
        <div className={`${danger ? 'text-red-500' : color} ${!danger ? hoverColor : ''} transition-colors`}>{icon}</div>
        <div className="flex-1">
            <span className={`block text-sm font-bold ${danger ? 'text-red-500' : 'text-zinc-200 group-hover:text-white'}`}>{label}</span>
            {subLabel && <span className="text-[10px] text-zinc-500">{subLabel}</span>}
        </div>
    </button>
);

// --- Specific Menus ---

export const MoreMenu = ({ onClose, type, onReport, onBookmark, isBookmarked }: { onClose: () => void, type: string, onReport: () => void, onBookmark?: () => void, isBookmarked?: boolean }) => {
    
    const MenuItems = () => (
        <>
            {onBookmark && (
                <MenuButton 
                    icon={<Bookmark size={20} fill={isBookmarked ? "currentColor" : "none"} />} 
                    label={isBookmarked ? "Remove from Saved" : "Save"} 
                    onClick={() => { onBookmark(); onClose(); }}
                />
            )}
            
            <MenuButton 
                icon={<Share2 size={20} />} 
                label="Share" 
                onClick={() => {
                    alert("Share triggered"); 
                    onClose();
                }} 
            />
            
            {(type === 'User' || type === 'Chat') && (
                <MenuButton 
                    icon={<Ban size={20} />} 
                    label={`Block @${type === 'User' ? 'user' : 'chat'}`} 
                    onClick={() => { alert("Block triggered"); onClose(); }} 
                />
            )}

            {/* Desktop Divider */}
            <div className="h-px bg-white/5 my-1 md:block hidden" />

            <MenuButton 
                icon={<Flag size={20} />} 
                label={`Report ${type}`} 
                onClick={onReport} 
                danger
            />
        </>
    );

    return (
        <>
            {/* Desktop Dropdown */}
            <div className="hidden md:block">
                <DropdownMenu onClose={onClose}>
                    <MenuItems />
                </DropdownMenu>
            </div>

            {/* Mobile Action Sheet */}
            <div className="md:hidden">
                <ActionSheet onClose={onClose}>
                    <div className="bg-zinc-800/50 rounded-2xl overflow-hidden divide-y divide-white/5">
                        <MenuItems />
                    </div>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                        className="w-full bg-zinc-900 border border-white/10 text-white font-bold py-4 rounded-2xl mt-2 active:scale-95 transition-transform"
                    >
                        Cancel
                    </button>
                </ActionSheet>
            </div>
        </>
    );
};

export const ShareSheet = ({ onClose, postLink }: { onClose: () => void, postLink?: string }) => {
    const handleShare = async (platform: string) => {
        const text = `Check out this post on Green: ${postLink}`;
        if (navigator.share && platform === 'native') {
            try {
                await navigator.share({ title: 'Green Stoners Network', text, url: postLink });
            } catch (e) { console.error(e); }
        } else {
            if (postLink && platform === 'Copy') {
                navigator.clipboard.writeText(postLink);
                alert("Link copied!");
            } else {
                alert(`Shared to ${platform}`);
            }
        }
        onClose();
    };

    const ShareItems = () => (
        <>
            <div className="px-4 py-2 text-xs font-bold text-zinc-500 uppercase tracking-wider md:block hidden">Share to</div>
            <MenuButton icon={<Copy size={20} />} label="Copy Link" onClick={() => handleShare('Copy')} />
            <MenuButton icon={<Send size={20} />} label="Send as Message" onClick={() => handleShare('DM')} />
            <MenuButton icon={<Instagram size={20} />} label="Instagram Stories" onClick={() => handleShare('Instagram')} />
            <MenuButton icon={<Twitter size={20} />} label="Post to X" onClick={() => handleShare('X')} />
        </>
    );

    return (
        <>
            <div className="hidden md:block">
                <DropdownMenu onClose={onClose} className="bottom-12 left-4 w-72 origin-bottom-left top-auto">
                    <ShareItems />
                </DropdownMenu>
            </div>
            <div className="md:hidden">
                <ActionSheet onClose={onClose} title="Share to">
                    <div className="bg-zinc-800/50 rounded-2xl overflow-hidden divide-y divide-white/5">
                        <ShareItems />
                    </div>
                    <button onClick={onClose} className="w-full bg-zinc-900 border border-white/10 text-white font-bold py-4 rounded-2xl mt-2">Cancel</button>
                </ActionSheet>
            </div>
        </>
    );
};

export const RepostMenu = ({ onClose, onRepost, onQuote }: { onClose: () => void, onRepost: () => void, onQuote: () => void }) => {
    const MenuItems = () => (
        <>
            <MenuButton 
                icon={<Repeat size={20} className="text-green-500" />} 
                label="Repost" 
                subLabel="Instantly share to your feed"
                onClick={onRepost}
            />
            <MenuButton 
                icon={<PenTool size={20} className="text-blue-400" />} 
                label="Quote Post" 
                subLabel="Add your own thoughts"
                onClick={onQuote}
            />
        </>
    );

    return (
        <>
            <div className="hidden md:block">
                <DropdownMenu onClose={onClose} className="bottom-12 left-0 origin-bottom-left top-auto">
                    <MenuItems />
                </DropdownMenu>
            </div>
            <div className="md:hidden">
                <ActionSheet onClose={onClose}>
                    <div className="bg-zinc-800/50 rounded-2xl overflow-hidden divide-y divide-white/5">
                        <MenuItems />
                    </div>
                    <button onClick={onClose} className="w-full bg-zinc-900 border border-white/10 text-white font-bold py-4 rounded-2xl mt-2">Cancel</button>
                </ActionSheet>
            </div>
        </>
    );
};
