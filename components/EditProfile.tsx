
import React, { useState, useRef } from 'react';
import { ArrowLeft, Camera, Leaf, Save, X, GraduationCap, Briefcase, Globe, Music, ExternalLink } from 'lucide-react';
import { User } from '../types';
import { updateUserProfile } from '../services/userService';
import { uploadToCloudinary } from '../services/cloudinary';

interface EditProfileProps {
    user: User;
    onUpdate: (updatedUser: User) => void;
    onCancel: () => void;
}

const EditProfile: React.FC<EditProfileProps> = ({ user, onUpdate, onCancel }) => {
    const [name, setName] = useState(user.name);
    const [handle, setHandle] = useState(user.handle);
    const [bio, setBio] = useState(user.bio || '');
    const [showBadge, setShowBadge] = useState(user.showStonerBadge || false);
    const [avatar, setAvatar] = useState(user.avatar);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    
    // New Fields
    const [school, setSchool] = useState(user.school || '');
    const [business, setBusiness] = useState(user.business || '');
    const [website, setWebsite] = useState(user.website || '');
    const [spotify, setSpotify] = useState(user.spotifyPlaylist || '');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = async () => {
        setIsSaving(true);
        let finalAvatar = avatar;

        if (avatarFile) {
            try {
                finalAvatar = await uploadToCloudinary(avatarFile);
            } catch (e) {
                console.error("Avatar upload failed", e);
                // Optionally alert user, but proceed with other updates or abort
            }
        }

        const updates = {
            name,
            handle,
            bio,
            showStonerBadge: showBadge,
            avatar: finalAvatar,
            school,
            business,
            website,
            spotifyPlaylist: spotify
        };

        try {
            await updateUserProfile(user.id, updates);
            // We can just close, because the real-time listener in App.tsx will update the state
            onUpdate({ ...user, ...updates });
        } catch (error) {
            console.error("Failed to update profile", error);
            alert("Failed to save profile. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            const url = URL.createObjectURL(file);
            setAvatar(url);
        }
    };

    return (
        <div className="min-h-screen bg-black pb-20 md:pb-0 animate-in slide-in-from-bottom-10 duration-200">
             {/* Header */}
             <div className="sticky top-0 z-30 bg-zinc-900/80 backdrop-blur-md border-b border-white/10 p-4 flex justify-between items-center">
                <button onClick={onCancel} className="text-white hover:text-zinc-300">
                    <X size={24} />
                </button>
                <h2 className="font-bold text-lg text-white">Edit Profile</h2>
                <button onClick={handleSave} disabled={isSaving} className={`text-gsn-green font-bold text-sm hover:text-green-400 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {isSaving ? 'Saving...' : 'Save'}
                </button>
             </div>

             <div className="p-4 space-y-8 max-w-xl mx-auto pb-12">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <img src={avatar} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-zinc-800 object-cover opacity-100 group-hover:opacity-50 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera size={24} className="text-white" />
                        </div>
                        {/* Preview Badge */}
                        {showBadge && (
                             <div className="absolute bottom-0 right-0 bg-gsn-black rounded-full p-1 border border-gsn-green shadow-[0_0_10px_rgba(74,222,128,0.5)]">
                                <Leaf size={14} className="text-gsn-green" fill="currentColor" />
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                    </div>
                    <button onClick={() => fileInputRef.current?.click()} className="text-gsn-green text-sm font-bold">Change Profile Photo</button>
                </div>

                {/* Main Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-2">Basic Info</h3>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Name</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-white focus:border-gsn-green focus:outline-none"
                        />
                    </div>

                    <div className="space-y-1">
                         <label className="text-xs font-bold text-zinc-500 uppercase">Handle</label>
                        <input 
                            type="text" 
                            value={handle} 
                            onChange={(e) => setHandle(e.target.value)}
                            className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-white focus:border-gsn-green focus:outline-none"
                        />
                    </div>

                    <div className="space-y-1">
                         <label className="text-xs font-bold text-zinc-500 uppercase">Bio</label>
                        <textarea 
                            value={bio} 
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-white focus:border-gsn-green focus:outline-none resize-none h-24"
                        />
                    </div>
                </div>

                {/* Stoner Badge Toggle */}
                <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gsn-green/10 flex items-center justify-center border border-gsn-green/30">
                            <Leaf size={20} className="text-gsn-green" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">Stoner Badge</h3>
                            <p className="text-xs text-zinc-400">Show the leaf icon on your profile picture.</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => setShowBadge(!showBadge)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${showBadge ? 'bg-gsn-green' : 'bg-zinc-700'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${showBadge ? 'left-7' : 'left-1'}`}></div>
                    </button>
                </div>

                {/* Account Details */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                    <h3 className="text-lg font-bold text-white mb-2">Details & Links</h3>
                    
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
                            <GraduationCap size={14} /> School / University
                        </label>
                        <input 
                            type="text" 
                            value={school} 
                            onChange={(e) => setSchool(e.target.value)}
                            placeholder="e.g. Oaksterdam University"
                            className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-white focus:border-gsn-green focus:outline-none"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
                            <Briefcase size={14} /> Business / Workplace
                        </label>
                        <input 
                            type="text" 
                            value={business} 
                            onChange={(e) => setBusiness(e.target.value)}
                            placeholder="e.g. High Grade Hydro"
                            className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-white focus:border-gsn-green focus:outline-none"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
                            <Globe size={14} /> Website URL
                        </label>
                        <input 
                            type="text" 
                            value={website} 
                            onChange={(e) => setWebsite(e.target.value)}
                            placeholder="https://..."
                            className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-white focus:border-gsn-green focus:outline-none"
                        />
                        {/* URL Preview */}
                        {website && (
                            <div className="mt-2 bg-zinc-800 rounded-lg p-3 flex items-center gap-3 border border-white/5">
                                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                                    <Globe size={20} className="text-gsn-green" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-xs font-bold text-white truncate">Website Linked</p>
                                    <p className="text-[10px] text-gsn-green truncate">{website}</p>
                                </div>
                                <ExternalLink size={16} className="text-zinc-500" />
                            </div>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
                            <Music size={14} /> Spotify Playlist URL
                        </label>
                        <input 
                            type="text" 
                            value={spotify} 
                            onChange={(e) => setSpotify(e.target.value)}
                            placeholder="https://open.spotify.com/playlist/..."
                            className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-white focus:border-gsn-green focus:outline-none"
                        />
                        {/* Spotify Preview */}
                        {spotify && (
                            <div className="mt-2 bg-[#1DB954]/10 rounded-lg p-3 flex items-center gap-3 border border-[#1DB954]/30">
                                <div className="w-10 h-10 rounded-lg bg-[#1DB954] flex items-center justify-center text-black">
                                    <Music size={20} fill="currentColor" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-xs font-bold text-white truncate">Spotify Playlist</p>
                                    <p className="text-[10px] text-[#1DB954] truncate">{spotify}</p>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-[#1DB954] animate-pulse"></div>
                            </div>
                        )}
                    </div>
                </div>
             </div>
        </div>
    );
};

export default EditProfile;
