
import React from 'react';
import { Search, Menu } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
    user: User;
    onOpenSidebar: () => void; // Left Profile Sidebar
    onOpenRightMenu: () => void; // Right Burger Menu
    onSearch: (query: string) => void;
    isVisible: boolean;
    hasUnread: boolean;
}

const Header: React.FC<HeaderProps> = ({ user, onOpenSidebar, onOpenRightMenu, onSearch, isVisible, hasUnread }) => {
    return (
        <div 
            className="fixed top-0 left-0 right-0 z-[60] bg-black/80 backdrop-blur-md border-b border-white/10 transition-transform duration-500 md:hidden"
            style={{ transform: isVisible ? 'translateY(0)' : 'translateY(-100%)' }}
        >
             <div className="flex justify-between items-center px-4 h-16">
                {/* Left: Logo (Triggers Sidebar) */}
                <button onClick={onOpenSidebar} className="flex items-center gap-2 group">
                    <span className="material-symbols-outlined text-gsn-green text-3xl">cannabis</span>
                    <span className="font-black text-xl tracking-tighter text-white">GREEN</span>
                </button>

                {/* Right: Search & Burger Menu */}
                <div className="flex gap-4 items-center">
                    <button onClick={() => onSearch('')} className="text-white/80 hover:text-white transition-colors">
                        <Search size={24} />
                    </button>
                    
                    <button onClick={onOpenRightMenu} className="text-white/80 hover:text-white transition-colors relative p-1">
                        <Menu size={28} />
                        {hasUnread && (
                            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-black rounded-full animate-pulse"></span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Header;
