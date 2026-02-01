
import React, { useState, useRef, useEffect } from 'react';
import { 
    Image, X, MapPin, Smile, Hash, ChevronDown, 
    Users, Globe, Lock, ArrowLeft, Palette, 
    Video, Play, Loader2, Sparkles, Plus
} from 'lucide-react';
import { CURRENT_USER } from '../constants';
import { createPost } from '../services/dataService';
import { uploadToCloudinary } from '../services/cloudinary';
import { auth } from '../services/firebase';
import { subscribeToUserProfile } from '../services/userService';
import { User } from '../types';

const BACKGROUNDS = [
    { id: 'default', class: 'from-zinc-900 to-black', label: 'Noir' },
    { id: 'green-fire', class: 'from-green-900 via-black to-emerald-900', label: 'Kush' },
    { id: 'purple-haze', class: 'from-purple-900 via-black to-indigo-900', label: 'Haze' },
    { id: 'sunset', class: 'from-orange-900 via-black to-red-900', label: 'Sunset' },
    { id: 'ocean', class: 'from-blue-900 via-black to-cyan-900', label: 'Blue Dream' },
];

interface CreatePostProps {
    onBack?: () => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onBack }) => {
    const [text, setText] = useState('');
    const [selectedBg, setSelectedBg] = useState(0); 
    const [mediaPreviews, setMediaPreviews] = useState<{url: string, file: File, type: 'image' | 'video'}[]>([]);
    const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('public');
    const [location, setLocation] = useState<string | null>(null);
    const [isPosting, setIsPosting] = useState(false);
    const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const hasMedia = mediaPreviews.length > 0;

    useEffect(() => {
        // Fetch real user data for the post author info
        if (auth.currentUser) {
            const unsub = subscribeToUserProfile(auth.currentUser.uid, (userData) => {
                if (userData) setCurrentUser(userData);
            });
            return () => unsub();
        }
    }, []);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [text]);

    const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files) as File[];
            const newPreviews = files.map(file => ({
                url: URL.createObjectURL(file),
                file: file,
                type: file.type.startsWith('video/') ? 'video' as const : 'image' as const
            }));
            setMediaPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeMedia = (index: number) => {
        setMediaPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handlePost = async () => {
        setIsPosting(true);

        try {
            // Extract tags
            const tags = text.match(/#[a-zA-Z0-9_]+/g) || [];
            
            // Upload media to Cloudinary
            const mediaUrls = await Promise.all(mediaPreviews.map(async (preview) => {
                try {
                    return await uploadToCloudinary(preview.file);
                } catch (e) {
                    console.error("Failed to upload media", e);
                    return null;
                }
            }));

            // Filter out failed uploads
            const successfulUrls = mediaUrls.filter((url): url is string => url !== null);

            await createPost({
                content: text,
                images: successfulUrls,
                tags: tags as string[]
            }, currentUser);

            if (onBack) onBack();
        } catch (error) {
            console.error("Post failed", error);
            alert("Failed to create post");
        } finally {
            setIsPosting(false);
        }
    };

    const getPrivacyIcon = () => {
        switch(privacy) {
            case 'public': return <Globe size={14} />;
            case 'friends': return <Users size={14} />;
            case 'private': return <Lock size={14} />;
        }
    }

    return (
        <div className={`fixed inset-0 z-[60] flex flex-col bg-gradient-to-br ${BACKGROUNDS[selectedBg].class} animate-in fade-in duration-500`}>
            {/* Header */}
            <div className="relative z-20 flex justify-between items-center p-6 pt-safe">
                <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors">
                    <X size={28} />
                </button>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={handlePost}
                        disabled={(!text && !hasMedia) || isPosting}
                        className={`px-6 py-2.5 rounded-full font-black text-sm tracking-wide transition-all shadow-lg flex items-center gap-2 ${
                            (text || hasMedia) && !isPosting
                            ? 'bg-white text-black hover:scale-105 active:scale-95 shadow-white/10' 
                            : 'bg-zinc-800/50 text-zinc-500 cursor-not-allowed'
                        }`}
                    >
                        {isPosting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                        POST
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto relative z-10 flex flex-col no-scrollbar">
                <div className="flex-1 flex flex-col justify-center px-6 md:px-20 py-8 min-h-[40vh]">
                    <textarea 
                        ref={textareaRef}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="What's sparking?"
                        className={`w-full bg-transparent text-white font-light placeholder-white/20 text-center resize-none outline-none leading-tight transition-all duration-300 drop-shadow-lg ${
                            text.length > 80 ? 'text-2xl md:text-4xl' : 'text-4xl md:text-6xl'
                        }`}
                        rows={1}
                        style={{ overflow: 'hidden' }}
                        autoFocus
                    />
                </div>

                {hasMedia && (
                    <div className="w-full px-6 pb-8 overflow-x-auto no-scrollbar snap-x">
                        <div className="flex gap-4">
                            {mediaPreviews.map((preview, index) => (
                                <div key={index} className="relative group shrink-0 snap-center">
                                    <div className="h-64 md:h-80 aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                                        {preview.type === 'video' ? (
                                            <video src={preview.url} className="w-full h-full object-cover bg-black" />
                                        ) : (
                                            <img src={preview.url} alt="Preview" className="w-full h-full object-cover bg-zinc-800" />
                                        )}
                                    </div>
                                    <button onClick={() => removeMedia(index)} className="absolute top-3 right-3 bg-black/50 hover:bg-red-500/80 p-2 rounded-full backdrop-blur-md transition-colors border border-white/20 text-white">
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Controls */}
            <div className="relative z-20 pb-safe">
                <div className="bg-gradient-to-t from-black via-black/80 to-transparent pt-10 pb-6 px-6">
                    <div className="max-w-xl mx-auto flex flex-col gap-6">
                        <div className="flex justify-between items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2 px-6 shadow-2xl">
                            <IconButton icon={<Image size={24} />} label="Photo/Video" onClick={() => fileInputRef.current?.click()} active={hasMedia} />
                            <IconButton icon={<Users size={24} />} label="Tag" />
                            <IconButton icon={<Smile size={24} />} label="Feeling" />
                            <IconButton icon={<MapPin size={24} />} label="Location" onClick={() => setLocation("Denver, CO")} active={!!location} />
                        </div>
                    </div>
                </div>
            </div>

            <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*,video/*" onChange={handleMediaSelect} />
        </div>
    );
};

const IconButton = ({ icon, label, onClick, active }: { icon: React.ReactNode, label: string, onClick?: () => void, active?: boolean }) => (
    <button 
        onClick={onClick} 
        className={`group flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${active ? 'text-gsn-green' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
        title={label}
    >
        <div className={`transition-transform group-hover:scale-110 ${active ? 'scale-110' : ''}`}>
            {icon}
        </div>
    </button>
)

export default CreatePost;
