
import React from 'react';
import { ShoppingBag, Tag, MapPin } from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../utils';

interface UserShopProps {
    products: Product[];
}

const UserShop: React.FC<UserShopProps> = ({ products }) => {
    if (products.length === 0) {
        return (
            <div className="col-span-full py-32 flex flex-col items-center justify-center text-zinc-500">
                <ShoppingBag size={64} className="opacity-20 mb-6" />
                <p className="font-bold text-xl mb-2">Shop is empty</p>
                <p className="text-base">This user hasn't listed any items yet.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {products.map(product => (
                <div key={product.id} className="bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 group cursor-pointer hover:border-gsn-green/30 transition-all">
                    <div className="relative aspect-square">
                        <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded-lg">
                            {formatCurrency(product.price)}
                        </div>
                    </div>
                    <div className="p-3">
                        <h4 className="text-white font-bold text-sm truncate mb-1">{product.title}</h4>
                        <div className="flex justify-between items-center text-zinc-500 text-[10px] font-bold">
                            <span className="flex items-center gap-1"><Tag size={10} /> {product.category}</span>
                            <span className="bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">{product.condition}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default UserShop;
