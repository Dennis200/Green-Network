
import React, { useState, useEffect, useMemo } from 'react';
import { Search, TrendingUp, Users, Leaf, ArrowUpRight, Play, ArrowLeft, Sparkles, Filter, Hash, Loader2, Video, Image as ImageIcon } from 'lucide-react';
import { PostCard } from './Feed';
import { subscribeToPosts } from '../services/dataService';
import { subscribeToAllUsers } from '../services/userService';
import { Post, User } from '../types';
import { CURRENT_USER } from '../constants';

const Explore: React.FC<{ initialQuery?: string }> = ({ initialQuery }) => {
  const [activeTab, setActiveTab] = useState('For You');
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSearchQuery(initialQuery || '');
  }, [initialQuery]);

  useEffect(() => {
    const unsubPosts = subscribeToPosts((data) => {
        setPosts(data);
        setLoading(false);
    });
    const unsubUsers = subscribeToAllUsers((data) => {
        setUsers(data);
    });
    return () => {
        unsubPosts();
        unsubUsers();
    }
  }, []);

  const tabs = ['For You', 'Strains', 'Growers', 'News', 'Events', 'Marketplace'];
  const searchTabs = ['All', 'Posts', 'People', 'Photos', 'Videos'];
  const [activeSearchTab, setActiveSearchTab] = useState('All');

  const filteredResults = useMemo(() => {
      if (!searchQuery) return { posts: [], users: [] };
      const q = searchQuery.toLowerCase();

      const matchedUsers = users.filter(u => 
          u.name.toLowerCase().includes(q) || 
          u.handle.toLowerCase().includes(q) ||
          u.bio?.toLowerCase().includes(q)
      );

      const matchedPosts = posts.filter(post => 
          post.content?.toLowerCase().includes(q) || 
          post.tags?.some((t: string) => t.toLowerCase().includes(q)) ||
          post.user.name.toLowerCase().includes(q) ||
          post.user.handle.toLowerCase().includes(q)
      );

      let finalPosts = matchedPosts;

      if (activeSearchTab === 'Photos') {
          finalPosts = matchedPosts.filter(p => p.mediaType === 'image' || (p.images && p.images.length > 0));
      }
      if (activeSearchTab === 'Videos') {
          finalPosts = matchedPosts.filter(p => p.mediaType === 'video' || (p.images && p.images.some(img => img.includes('mp4'))));
      }

      return { posts: finalPosts, users: matchedUsers };
  }, [searchQuery, posts, users, activeSearchTab]);

  const { posts: resultPosts, users: resultUsers } = filteredResults;

  // Filter for posts with images for the explore grid
  const exploreGridPosts = useMemo(() => {
      return posts.filter(p => (p.images && p.images.length > 0) || p.mediaType === 'video');
  }, [posts]);

  // Find trending strain/post (mock logic: mostly liked post with image)
  const featuredPost = useMemo(() => {
      return exploreGridPosts.length > 0 
        ? exploreGridPosts.reduce((prev, current) => (prev.likes > current.likes) ? prev : current)
        : null;
  }, [exploreGridPosts]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }

  return (
    <div className="min-h-screen bg-black pb-24 relative overflow-x-hidden">
        
      {/* Breathtaking Ambient Background */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-indigo-900/20 via-black to-black pointer-events-none z-0"></div>
      <div className="absolute top-[-100px] right-[-100px] w-[600px] h-[600px] bg-gsn-green/5 rounded-full blur-[150px] pointer-events-none z-0"></div>

      {/* Hero Search Section */}
      <div className="relative z-10 pt-8 px-6 md:pt-16 md:px-12 mb-8">
        {!searchQuery && (
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8 animate-in slide-in-from-bottom-5 duration-700">
                Discover the <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gsn-green to-emerald-600">High Life.</span>
            </h1>
        )}

        <div className="relative group max-w-3xl">
            {searchQuery && (
                <button 
                    onClick={() => setSearchQuery('')} 
                    className="absolute -left-10 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-white transition-colors md:block hidden"
                >
                    <ArrowLeft size={24} />
                </button>
            )}
            <div className={`relative transition-all duration-500 ${searchQuery ? 'scale-100' : 'hover:scale-[1.01]'}`}>
                <div className="absolute inset-0 bg-gsn-green/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center p-2 shadow-2xl">
                    <Search className="ml-4 text-zinc-400 group-focus-within:text-gsn-green transition-colors" size={24} />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Search strains, growers, genetics..." 
                        className="w-full bg-transparent border-none text-lg md:text-xl text-white placeholder-zinc-500 px-4 py-3 focus:outline-none focus:ring-0 font-medium"
                        autoFocus={!!initialQuery}
                    />
                    <button className="p-3 bg-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors">
                        <Filter size={20} />
                    </button>
                </div>
            </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar mt-8 pb-2 mask-image-linear-gradient">
            {(searchQuery ? searchTabs : tabs).map((tab, i) => {
                const isActive = searchQuery ? activeSearchTab === tab : activeTab === tab;
                const setTab = searchQuery ? setActiveSearchTab : setActiveTab;
                return (
                    <button 
                        key={tab}
                        onClick={() => setTab(tab)}
                        className={`px-6 py-2.5 rounded-full whitespace-nowrap text-sm font-bold transition-all duration-300 border ${
                            isActive 
                            ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)] transform scale-105' 
                            : 'bg-zinc-900/50 text-zinc-400 border-white/5 hover:border-white/20 hover:text-white'
                        }`}
                        style={{ animationDelay: `${i * 50}ms` }}
                    >
                        {tab}
                    </button>
                )
            })}
        </div>
      </div>

      <div className="px-4 md:px-12 relative z-10">
        {loading ? (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-gsn-green" size={40} />
            </div>
        ) : searchQuery ? (
            /* SEARCH RESULTS VIEW */
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2 mb-6 text-zinc-400 text-sm font-bold uppercase tracking-wider">
                    <Sparkles size={14} className="text-gsn-green" />
                    Top Results
                </div>
                <div className="space-y-6">
                    {/* Render People Results if selected or 'All' */}
                    {(activeSearchTab === 'All' || activeSearchTab === 'People') && resultUsers.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {resultUsers.map((user) => (
                                <div key={user.id} className="flex items-center gap-4 p-4 bg-zinc-900/50 rounded-2xl border border-white/5 hover:bg-zinc-900 transition-colors">
                                    <img src={user.avatar} className="w-12 h-12 rounded-full border border-white/10" alt={user.name} />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-white">{user.name}</h4>
                                        <p className="text-zinc-500 text-sm">{user.handle}</p>
                                    </div>
                                    <button className="px-4 py-1.5 bg-white text-black text-xs font-bold rounded-full hover:bg-zinc-200">View</button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Render Post Results */}
                    {activeSearchTab !== 'People' && resultPosts.length > 0 ? (
                        resultPosts.map((post) => (
                             <div key={post.id} className="bg-zinc-900/50 backdrop-blur-md rounded-3xl border border-white/5 overflow-hidden hover:border-white/10 transition-colors">
                                <PostCard 
                                    post={post} 
                                    currentUser={CURRENT_USER}
                                    onNavigateToProfile={() => {}} 
                                    onQuote={() => {}} 
                                    onSearch={(t) => setSearchQuery(t)}
                                />
                             </div>
                        ))
                    ) : (
                        activeSearchTab !== 'People' && activeSearchTab !== 'All' && (
                            <div className="text-center text-zinc-500 py-10">No posts found for "{searchQuery}"</div>
                        )
                    )}

                    {resultUsers.length === 0 && resultPosts.length === 0 && (
                        <div className="text-center text-zinc-500 py-20">
                            <Search size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="text-lg">No results found for "{searchQuery}"</p>
                            <p className="text-sm">Try searching for tags like #Hydro or #Sativa</p>
                        </div>
                    )}
                </div>
            </div>
        ) : (
          /* DEFAULT EXPLORE VIEW */
          <div className="animate-in fade-in duration-700">
            {activeTab === 'For You' && (
                <div className="mb-12 grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Featured Large Card - Uses the most liked post with an image */}
                    {featuredPost && (
                        <div className="md:col-span-8 relative h-96 rounded-[2rem] overflow-hidden cursor-pointer group border border-white/5">
                            <img src={featuredPost.images ? featuredPost.images[0] : 'https://picsum.photos/1200/800'} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Featured" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-8 flex flex-col justify-end">
                                <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
                                    <span className="inline-flex items-center gap-2 bg-gsn-green text-black text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider mb-4 shadow-lg shadow-green-500/20">
                                        <TrendingUp size={12} /> Featured Post
                                    </span>
                                    <h3 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight line-clamp-2">{featuredPost.content}</h3>
                                    <p className="text-zinc-200 text-sm font-light">by {featuredPost.user.name}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Side Cards */}
                    <div className="md:col-span-4 flex flex-col gap-6">
                        <div className="flex-1 bg-zinc-900/50 backdrop-blur-md rounded-[2rem] p-6 flex flex-col justify-between border border-white/5 hover:bg-zinc-900 hover:border-gsn-green/30 transition-all cursor-pointer group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gsn-green/10 rounded-full blur-3xl group-hover:bg-gsn-green/20 transition-colors"></div>
                            <div className="flex justify-between items-start z-10">
                                <div className="p-3 bg-black rounded-2xl text-gsn-green border border-white/10 group-hover:scale-110 transition-transform">
                                    <TrendingUp size={24} />
                                </div>
                                <ArrowUpRight className="text-zinc-600 group-hover:text-white transition-colors" />
                            </div>
                            <div className="z-10">
                                <h4 className="text-2xl font-bold text-white mb-1">Market Movers</h4>
                                <p className="text-zinc-400 text-sm">See what's selling hot in your area right now.</p>
                            </div>
                        </div>

                        <div className="flex-1 bg-gradient-to-br from-blue-900/20 to-zinc-900/50 backdrop-blur-md rounded-[2rem] p-6 flex flex-col justify-between border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer group relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors"></div>
                            <div className="flex justify-between items-start z-10">
                                <div className="p-3 bg-black rounded-2xl text-blue-400 border border-white/10 group-hover:scale-110 transition-transform">
                                    <Users size={24} />
                                </div>
                                <ArrowUpRight className="text-zinc-600 group-hover:text-white transition-colors" />
                            </div>
                            <div className="z-10">
                                <h4 className="text-2xl font-bold text-white mb-1">Community Events</h4>
                                <p className="text-zinc-400 text-sm">3 major expos happening this weekend.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tags Strip */}
            <div className="flex gap-4 overflow-x-auto no-scrollbar mb-10 pb-2">
                {['#Hydroponics', '#LivingSoil', '#LEDGrow', '#CannabisCommunity', '#Terps', '#DabLife', '#GrowOp'].map(tag => (
                    <button key={tag} className="flex items-center gap-2 px-5 py-3 bg-zinc-900/80 border border-white/5 rounded-2xl text-zinc-300 font-bold text-sm whitespace-nowrap hover:bg-zinc-800 hover:text-white hover:border-white/20 transition-all">
                        <Hash size={14} className="text-gsn-green" /> {tag.replace('#','')}
                    </button>
                ))}
            </div>

            {/* Masonry Grid */}
            <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
                <Leaf size={24} className="text-gsn-green" /> 
                Explore Feed
            </h3>
            
            <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
                {exploreGridPosts.map((post) => (
                    <ExploreItem key={post.id} post={post} />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ExploreItem: React.FC<{ post: Post }> = ({ post }) => {
   // Determine if it's a video
   const isVideo = post.mediaType === 'video' || (post.images && post.images.some(img => img.includes('mp4')));
   const mediaSrc = post.images && post.images.length > 0 ? post.images[0] : '';

   if (!mediaSrc && !isVideo) return null; // Skip text-only posts for masonry grid

   return (
       <div className={`relative rounded-3xl overflow-hidden group break-inside-avoid mb-6 bg-zinc-900 border border-white/5 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-gsn-green/10 transition-all duration-500`}>
           <img 
             src={mediaSrc || `https://picsum.photos/400/600?random=${post.id}`} 
             className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" 
             alt="Explore Content" 
           />
           
           {isVideo && (
               <div className="absolute top-3 right-3 bg-black/40 p-2 rounded-full backdrop-blur-md border border-white/10">
                   <Play size={12} fill="white" className="text-white" />
               </div>
           )}

           <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
               <p className="font-bold text-white text-sm line-clamp-2 leading-tight transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                   {post.content}
               </p>
               <div className="flex items-center gap-2 mt-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                   <img src={post.user.avatar} className="w-6 h-6 rounded-full border border-white/20" alt="User" />
                   <p className="text-xs text-zinc-300 font-bold">{post.user.handle}</p>
               </div>
           </div>
       </div>
   )
}

export default Explore;
