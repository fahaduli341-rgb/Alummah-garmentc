import React from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Heart, ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { toggleWishlist, isInWishlist, addToCart, formatPrice } = useStore();
  const wishlisted = isInWishlist(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultSize = product.sizes[0] || 'L (Chest 42")';
    const defaultColor = product.colors[0] || { name: 'Black', hex: '#000000' };
    addToCart(product, defaultSize, defaultColor, 1);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className="group flex flex-col bg-white border border-stone-200/90 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
    >
      {/* Product Image */}
      <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {product.images[1] && (
          <img
            src={product.images[1]}
            alt={`${product.name} view`}
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
        )}

        {/* Clean Top Discount Tag if on sale (NO sparkle icon, NO pill badge) */}
        <div className="absolute top-3 left-3">
          {product.discountPercentage && product.discountPercentage > 0 ? (
            <span className="bg-[#0C1F15] text-white text-[11px] font-semibold px-2 py-0.5 rounded tracking-wide">
              {product.discountPercentage}% ছাড়
            </span>
          ) : product.isNewArrival ? (
            <span className="bg-stone-900 text-white text-[11px] font-semibold px-2 py-0.5 rounded tracking-wide">
              নতুন
            </span>
          ) : null}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors ${
            wishlisted
              ? 'bg-rose-50 text-rose-600 shadow-sm'
              : 'bg-white/80 text-stone-700 hover:bg-white hover:text-stone-950'
          }`}
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Quick Add Overlay */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block">
          <button
            onClick={handleQuickAdd}
            disabled={!product.inStock}
            className="w-full py-2.5 bg-white/95 hover:bg-[#0C1F15] hover:text-white text-stone-900 text-xs font-semibold rounded-md shadow-md transition-colors flex items-center justify-center gap-1.5 backdrop-blur-sm"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{product.inStock ? 'দ্রুত ব্যাগে যোগ করুন' : 'স্টক শেষ'}</span>
          </button>
        </div>
      </div>

      {/* Product Details (Zero fake reviews) */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          {/* GSM & Fit Metadata */}
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
            <span className="font-medium text-emerald-900 text-[11px]">
              {product.gsm || '230 GSM'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-[11px] text-stone-600 truncate">{product.fit}</span>
          </div>

          <h3 className="text-sm font-semibold text-stone-900 line-clamp-1 group-hover:text-emerald-900 transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
            {product.shortDescription}
          </p>
        </div>

        {/* Price & Colors */}
        <div className="flex items-baseline justify-between pt-2 border-t border-stone-100">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-stone-900 tabular-nums">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-stone-400 line-through tabular-nums">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {product.colors.slice(0, 3).map((col) => (
              <span
                key={col.name}
                title={col.name}
                className="w-2.5 h-2.5 rounded-full border border-stone-300"
                style={{ backgroundColor: col.hex }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
