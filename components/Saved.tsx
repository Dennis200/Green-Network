
import React from 'react';
import { ArrowLeft, Bookmark, Grid } from 'lucide-react';
import { MOCK_POSTS, CURRENT_USER } from '../constants';
import { PostCard } from './Feed';

interface SavedProps {
    onBack: () => void;
    onNavigateToProfile: (id: string) => void;
}

const Saved: React.FC<SavedProps> = ({ onBack, onNavigateToProfile }) => {
    // Mock saved posts (just taking a slice of mock posts)
    const savedPosts = MOCK_POSTS.slice(0, 4);

    return (
        <div className="min-h-screen bg-black pb-20 md:pb-0">
            <div className="sticky top-0 z-30 bg-zinc-900/90 backdrop-blur-md border-b border-white/10 p-4 flex items-center gap-4">
                <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-white">Saved</h1>
            </div>

            <div className="max-w-2xl mx-auto p-4 md:p-6">
                {savedPosts.length > 0 ? (
                    <div className="space-y-6">
                        {savedPosts.map(post => (
                            <div key={post.id} className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
                                <PostCard 
                                    post={post} 
                                    currentUser={CURRENT_USER}
                                    onNavigateToProfile={onNavigateToProfile} 
                                    onQuote={() => {}} 
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                        <Bookmark size={48} className="mb-4 opacity-20" />
                        <p className="font-bold text-lg">No saved posts yet</p>
                        <p className="text-sm">Tap the bookmark icon on posts to save them for later.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Saved;
