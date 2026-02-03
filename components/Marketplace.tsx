
import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, ShoppingBag, Heart, MessageCircle, MapPin, Tag, X, ChevronRight, Share2, MoreHorizontal, Plus, Camera, DollarSign, Image as ImageIcon, ArrowLeft, Check, Upload, Sparkles, ShieldCheck, Tag as TagIcon } from 'lucide-react';
import { CURRENT_USER } from '../constants';
import { Product, User } from '../types';
import { formatCurrency } from '../utils';
import { MoreMenu } from './Menus';
import ReportModal from './ReportModal';
import { createProduct, subscribeToProducts } from '../services/dataService';
import { uploadToCloudinary } from '../services/cloudinary';
import { auth } from '../services/firebase';
import { subscribeToUserProfile } from '../services/userService';

interface MarketplaceProps {
    onNavigateToChat: () => void;
    startCreating?: boolean;
}

const CATEGORIES = ['All', 'Seeds', 'Equipment', 'Glass', 'Merch', 'Nutrients', 'Art'];

const FEATURED_DROPS = [
    { id: 1, title: 'Limited Edition Glass', image: 'https://picsum.photos/800/400?random=glass', tag: 'Featured Drop', linkText: 'Shop Glass' },
    { id: 2, title: 'Rare Genetics Drop', image: 'https://picsum.photos/800/400?random=genetics', tag: 'New Arrival', linkText: 'View Seeds' },
    { id: 3, title: 'Advanced LED Systems', image: 'https://picsum.photos/800/400?random=led', tag: 'Tech Deal', linkText: 'Upgrade Now' },
    { id: 4, title: 'Organic Nutrients', image: 'https://picsum.photos/800/400?random=nutes', tag: 'Best Seller', linkText: 'Buy Now' },
];

const Marketplace: React.FC<MarketplaceProps> = ({ onNavigateToChat, startCreating = false }) => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isCreating, setIsCreating] = useState(startCreating);
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        setIsCreating(startCreating);
    }, [startCreating]);

    useEffect(() => {
        const unsubscribe = subscribeToProducts((liveProducts) => {
            setProducts(liveProducts);
        });
        return () => unsubscribe();
    }, []);

    const filteredProducts = products.filter(product => {
        const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
        const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              product.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (isCreating) {
        return <CreateListingView onClose={() => setIsCreating(false)} />;
    }

    return (
        <div className="min-h-screen bg-black pb-24 md:pb-0 overflow-x-hidden">
            {/* Modal */}
            {selectedProduct && (
                <ProductModal 
                    product={selectedProduct} 
                    onClose={() => setSelectedProduct(null)} 
                    onContact={onNavigateToChat}
                />
            )}

            {/* Header */}
            <div className="sticky top-0 z-30 bg-black/95 backdrop-blur-md pt-6 px-6 pb-4 border-b border-white/10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-black text-white flex items-center gap-3">
                        <ShoppingBag className="text-gsn-green" size={28} /> Market
                    </h2>
                    <button 
                        onClick={() => setIsCreating(true)}
                        className="p-3 bg-gsn-green rounded-full hover:bg-green-400 text-black shadow-[0_0_15px_rgba(74,222,128,0.4)] transition-all transform hover:scale-105"
                    >
                        <Plus size={24} strokeWidth={3} />
                    </button>
                </div>

                <div className="flex gap-4 items-center mb-6">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-3.5 text-zinc-500 group-focus-within:text-gsn-green transition-colors" size={20} />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search genetics, gear, glass..." 
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-gsn-green transition-all shadow-lg"
                        />
                    </div>
                    <button className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-400 hover:text-white hover:border-white/20 transition-colors">
                        <Filter size={20} />
                    </button>
                </div>

                {/* Categories */}
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${
                                activeCategory === cat 
                                ? 'bg-gsn-green text-black border-gsn-green' 
                                : 'bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Featured Drops Marquee (Only shows on 'All' view) */}
                {activeCategory === 'All' && !searchQuery && (
                    <div className="mb-10 overflow-hidden relative -mx-6 md:mx-0 group">
                        <style>{`
                            @keyframes scroll {
                                0% { transform: translateX(0); }
                                100% { transform: translateX(-50%); }
                            }
                            .animate-scroll {
                                animation: scroll 40s linear infinite;
                                width: max-content;
                            }
                            .animate-scroll:hover {
                                animation-play-state: paused;
                            }
                        `}</style>
                        <div className="flex gap-4 animate-scroll px-6">
                            {/* Duplicate items for seamless loop */}
                            {[...FEATURED_DROPS, ...FEATURED_DROPS].map((drop, idx) => (
                                <div 
                                    key={`${drop.id}-${idx}`} 
                                    className="relative w-[85vw] md:w-[500px] h-64 md:h-72 rounded-3xl overflow-hidden bg-zinc-800 border border-white/5 cursor-pointer shadow-xl shrink-0 hover:border-gsn-green/30 transition-colors"
                                >
                                    <img src={drop.image} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" alt="Promo" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent flex flex-col justify-center p-8 md:p-10">
                                        <span className="text-gsn-green text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <Sparkles size={12} /> {drop.tag}
                                        </span>
                                        <h3 className="text-3xl md:text-4xl font-black text-white mb-6 max-w-sm leading-none drop-shadow-lg">{drop.title}</h3>
                                        <button className="bg-white text-black px-6 py-3 rounded-xl font-bold text-sm w-fit hover:bg-gsn-green transition-colors shadow-lg">
                                            {drop.linkText}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Product Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredProducts.map(product => (
                        <div 
                            key={product.id} 
                            onClick={() => setSelectedProduct(product)}
                            className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/5 hover:border-gsn-green/30 transition-all cursor-pointer group shadow-lg"
                        >
                            <div className="relative aspect-square overflow-hidden bg-zinc-800">
                                <img src={product.images && product.images[0] ? product.images[0] : 'https://picsum.photos/400'} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                {product.condition === 'New' && (
                                    <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg border border-white/10">NEW</span>
                                )}
                                <div className="absolute bottom-3 right-3 bg-white text-black font-bold text-xs px-3 py-1.5 rounded-lg shadow-xl">
                                    {formatCurrency(product.price)}
                                </div>
                            </div>
                            <div className="p-4">
                                <h4 className="text-white font-bold text-base truncate mb-2 leading-tight">{product.title}</h4>
                                <div className="flex justify-between items-center">
                                    <span className="text-zinc-500 text-xs truncate font-medium flex items-center gap-1">
                                        <MapPin size={12} /> {product.location}
                                    </span>
                                    <div className="flex items-center gap-1 text-zinc-400 text-xs font-bold">
                                        <Heart size={12} className="text-zinc-500 group-hover:text-red-500 transition-colors" /> {product.likes}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="py-32 text-center text-zinc-500">
                        <p className="text-lg">No items found.</p>
                        <button onClick={() => {setActiveCategory('All'); setSearchQuery('');}} className="text-gsn-green font-bold mt-4 hover:underline">Clear filters</button>
                    </div>
                )}
            </div>
        </div>
    );
};

const CreateListingView = ({ onClose }: { onClose: () => void }) => {
    const [images, setImages] = useState<string[]>([]);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('Equipment');
    const [condition, setCondition] = useState('New');
    const [description, setDescription] = useState('');
    const [isPublishing, setIsPublishing] = useState(false);
    const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (auth.currentUser) {
            subscribeToUserProfile(auth.currentUser.uid, (user) => {
                if (user) setCurrentUser(user);
            });
        }
    }, []);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            setImageFiles(prev => [...prev, ...files]);
            const newImages = files.map((file: any) => URL.createObjectURL(file));
            setImages(prev => [...prev, ...newImages]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handlePublish = async () => {
        if (!title || !price || !category) return;
        setIsPublishing(true);
        try {
            const uploadedUrls = await Promise.all(imageFiles.map(async (file) => {
                try { return await uploadToCloudinary(file); } catch (e) { return null; }
            }));
            const validUrls = uploadedUrls.filter((url): url is string => url !== null);
            const finalImages = validUrls.length > 0 ? validUrls : images;

            await createProduct({
                title, price: parseFloat(price), category: category as any, condition: condition as any, description, images: finalImages, location: 'Denver, CO'
            }, currentUser);

            alert("Listing Published!");
            onClose();
        } catch (error) {
            console.error("Publish failed", error);
            alert("Failed to publish listing.");
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="p-6 flex items-center justify-between border-b border-white/10 bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50">
                <button onClick={onClose} className="p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 text-white transition-colors">
                    <X size={20} />
                </button>
                <h3 className="font-black text-white text-lg tracking-tight uppercase">New Listing</h3>
                <div className="w-9" />
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                <div className="max-w-2xl mx-auto space-y-12">
                    <section>
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6 block">1. Photos</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-square bg-zinc-900 rounded-3xl border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center cursor-pointer hover:border-gsn-green hover:bg-zinc-800/50 transition-all group relative overflow-hidden"
                            >
                                <div className="p-5 bg-zinc-800 rounded-full mb-4 text-zinc-400 group-hover:text-gsn-green group-hover:scale-110 transition-all">
                                    <Camera size={28} />
                                </div>
                                <span className="text-zinc-400 text-xs font-bold group-hover:text-white transition-colors">Add Photos</span>
                                <input type="file" ref={fileInputRef} multiple className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </div>
                            {images.map((img, idx) => (
                                <div key={idx} className="aspect-square bg-zinc-900 rounded-3xl overflow-hidden relative group border border-white/5">
                                    <img src={img} className="w-full h-full object-cover" alt="Preview" />
                                    <button onClick={() => removeImage(idx)} className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-full hover:bg-red-500 transition-colors backdrop-blur-md"><X size={16} /></button>
                                </div>
                            ))}
                        </div>
                    </section>
                    <section className="space-y-8">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block">2. Details</label>
                        <div className="space-y-2">
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What are you selling?" className="w-full bg-transparent text-4xl md:text-5xl font-black text-white placeholder-zinc-800 focus:outline-none focus:placeholder-zinc-900 transition-colors tracking-tight" />
                        </div>
                        <div className="flex items-center gap-4 border-b border-white/10 pb-4 focus-within:border-gsn-green transition-colors">
                            <DollarSign size={32} className="text-gsn-green" strokeWidth={3} />
                            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" className="w-full bg-transparent text-4xl font-bold text-white placeholder-zinc-800 focus:outline-none font-mono" />
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-zinc-400 uppercase">Category</label>
                            <div className="flex flex-wrap gap-3">
                                {CATEGORIES.filter(c => c !== 'All').map(cat => (
                                    <button key={cat} onClick={() => setCategory(cat)} className={`px-6 py-3 rounded-2xl text-sm font-bold border transition-all ${category === cat ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-105' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'}`}>{cat}</button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-zinc-400 uppercase">Description</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your item..." className="w-full bg-zinc-900 border border-white/5 rounded-3xl p-6 text-white focus:border-gsn-green focus:outline-none min-h-[180px] resize-none text-lg leading-relaxed" />
                        </div>
                    </section>
                </div>
            </div>
            <div className="p-6 border-t border-white/10 bg-zinc-900/90 backdrop-blur-lg pb-safe">
                <button disabled={!title || !price || !category || isPublishing} onClick={handlePublish} className={`w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl ${title && price && category && !isPublishing ? 'bg-gsn-green text-black hover:bg-green-400 shadow-[0_0_30px_rgba(74,222,128,0.3)]' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}>
                    {isPublishing ? <Sparkles size={20} className="animate-spin" /> : <Sparkles size={20} />} {isPublishing ? 'Publishing...' : 'Publish Listing'}
                </button>
            </div>
        </div>
    );
};

const ProductModal = ({ product, onClose, onContact }: { product: Product, onClose: () => void, onContact: () => void }) => {
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200" onClick={onClose}>
            {showReportModal && (
                <ReportModal 
                    type="Listing" 
                    targetId={product.id} 
                    onClose={() => setShowReportModal(false)} 
                />
            )}
            
            {showMoreMenu && (
                <MoreMenu 
                    onClose={() => setShowMoreMenu(false)} 
                    type="Listing" 
                    onReport={() => {
                        setShowMoreMenu(false);
                        setShowReportModal(true);
                    }}
                />
            )}
            
            <div className="bg-zinc-900 w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col md:flex-row shadow-2xl" onClick={e => e.stopPropagation()}>
                
                {/* Image Section */}
                <div className="w-full md:w-1/2 h-72 md:h-auto bg-black relative group">
                    <img src={product.images && product.images[0] ? product.images[0] : 'https://picsum.photos/400'} className="w-full h-full object-contain p-8" alt={product.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent md:hidden"></div>
                    <button onClick={onClose} className="absolute top-6 left-6 p-3 bg-black/50 rounded-full text-white md:hidden backdrop-blur-md">
                        <X size={24} />
                    </button>
                </div>

                {/* Details Section */}
                <div className="flex-1 p-8 md:p-10 flex flex-col overflow-y-auto bg-zinc-900">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-black text-white mb-3 leading-tight">{product.title}</h2>
                            <div className="flex items-center gap-4">
                                <span className="text-3xl font-bold text-gsn-green font-mono">{formatCurrency(product.price)}</span>
                                <span className="bg-zinc-800 text-zinc-300 text-xs font-bold px-3 py-1.5 rounded-full border border-white/5 uppercase tracking-wide">{product.condition}</span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button className="p-3 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"><Share2 size={24} /></button>
                            <button onClick={() => setShowMoreMenu(true)} className="p-3 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"><MoreHorizontal size={24} /></button>
                            <button onClick={onClose} className="hidden md:block p-3 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"><X size={24} /></button>
                        </div>
                    </div>

                    {/* Seller Info */}
                    <div className="flex items-center gap-4 p-4 bg-black/40 rounded-2xl mb-8 border border-white/5">
                        <img src={product.seller.avatar} className="w-14 h-14 rounded-full border border-white/10" alt={product.seller.name} />
                        <div className="flex-1">
                            <p className="font-bold text-white text-lg">{product.seller.name}</p>
                            <p className="text-zinc-500 text-sm">Verified Seller</p>
                        </div>
                        <button className="text-xs font-bold bg-white text-black px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors">View Profile</button>
                    </div>

                    <div className="space-y-8 mb-10">
                        <div>
                            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Description</h4>
                            <p className="text-zinc-300 leading-relaxed text-lg font-light">{product.description}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-zinc-800/50 p-4 rounded-2xl">
                                <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Location</h4>
                                <div className="flex items-center gap-2 text-white font-medium">
                                    <MapPin size={18} className="text-gsn-green" /> {product.location}
                                </div>
                            </div>
                            <div className="bg-zinc-800/50 p-4 rounded-2xl">
                                <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Category</h4>
                                <div className="flex items-center gap-2 text-white font-medium">
                                    <Tag size={18} className="text-gsn-green" /> {product.category}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-white/5 flex gap-4">
                        <button 
                            onClick={onContact}
                            className="flex-1 py-4 bg-gsn-green text-black font-black text-lg rounded-2xl hover:bg-green-400 transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(74,222,128,0.2)]"
                        >
                            <MessageCircle size={24} /> Message Seller
                        </button>
                        <button className="px-6 py-4 bg-zinc-800 text-white font-bold rounded-2xl hover:bg-zinc-700 transition-colors border border-white/5">
                            <Heart size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Marketplace;
