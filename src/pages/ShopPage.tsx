import React, { useState, useMemo, useEffect } from 'react';
import { Product, Category } from '../types';
import { ProductCard } from '../components/product/ProductCard';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface ShopPageProps {
  products: Product[];
  categories: Category[];
  initialCategory?: string;
  initialSearch?: string;
  initialWishlistOnly?: boolean;
  onSelectProduct: (product: Product) => void;
  onNavigate: (path: string, params?: Record<string, string>) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  products,
  categories,
  initialCategory,
  initialSearch,
  initialWishlistOnly,
  onSelectProduct,
}) => {
  const { wishlist, formatPrice } = useStore();
  
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [wishlistOnly, setWishlistOnly] = useState<boolean>(Boolean(initialWishlistOnly));
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('featured');
  const [search, setSearch] = useState<string>(initialSearch || '');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    if (initialSearch !== undefined) setSearch(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    if (initialWishlistOnly !== undefined) setWishlistOnly(initialWishlistOnly);
  }, [initialWishlistOnly]);

  const allSizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.sizes.forEach((s) => set.add(s)));
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchCat = p.category.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchSku = p.sku.toLowerCase().includes(q);
          if (!matchName && !matchCat && !matchDesc && !matchSku) return false;
        }

        if (selectedCategory !== 'all' && p.category !== selectedCategory) {
          return false;
        }

        if (selectedSize !== 'all' && !p.sizes.includes(selectedSize)) {
          return false;
        }

        if (p.price > maxPrice) {
          return false;
        }

        if (inStockOnly && !p.inStock) {
          return false;
        }

        if (wishlistOnly && !wishlist.includes(p.id)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [products, search, selectedCategory, selectedSize, maxPrice, inStockOnly, wishlistOnly, sortBy, wishlist]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedSize('all');
    setMaxPrice(2000);
    setInStockOnly(false);
    setWishlistOnly(false);
    setSearch('');
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedSize !== 'all' ||
    maxPrice < 2000 ||
    inStockOnly ||
    wishlistOnly ||
    search.trim().length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <span className="text-xs uppercase tracking-widest text-emerald-900 font-semibold block mb-1">
            টি-শার্ট শপ
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            {wishlistOnly
              ? 'আপনার সেভ করা টি-শার্ট'
              : selectedCategory !== 'all'
              ? categories.find((c) => c.slug === selectedCategory)?.name || 'টি-শার্ট কালেকশন'
              : 'সকল টি-শার্ট'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            মোট <strong className="text-stone-900">{filteredProducts.length}</strong> টি ডিজাইন প্রদর্শন করা হচ্ছে
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white border border-stone-300 rounded-lg text-stone-700"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>ফিল্টার</span>
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-500 hidden sm:inline">সর্ট করুন:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs font-medium bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-800"
            >
              <option value="featured">জনপ্রিয় ও নির্বাচিত</option>
              <option value="newest">নতুন আগমন</option>
              <option value="price-asc">দাম: কম থেকে বেশি</option>
              <option value="price-desc">দাম: বেশি থেকে কম</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters */}
        <aside className="hidden lg:block space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <div className="flex items-center gap-2 text-sm font-semibold text-stone-900">
              <SlidersHorizontal className="w-4 h-4 text-emerald-800" />
              <span>ফিল্টার</span>
            </div>
            {hasActiveFilters && (
              <button onClick={resetFilters} className="text-xs text-rose-600 hover:text-rose-800 font-medium">
                রিসেট
              </button>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
              সার্চ করুন
            </label>
            <input
              type="text"
              placeholder="নাম বা SKU দিয়ে খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-900"
            />
          </div>

          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
              ক্যাটাগরি
            </label>
            <div className="space-y-1 text-xs">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-2.5 py-1.5 rounded transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-stone-900 text-white font-semibold'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                সব ক্যাটাগরি
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`w-full text-left px-2.5 py-1.5 rounded transition-colors flex items-center justify-between ${
                    selectedCategory === cat.slug
                      ? 'bg-stone-900 text-white font-semibold'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="text-[11px] opacity-70">
                    {products.filter((p) => p.category === cat.slug).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
              সাইজ
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedSize('all')}
                className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                  selectedSize === 'all'
                    ? 'bg-stone-900 text-white border-stone-900 font-semibold'
                    : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-50'
                }`}
              >
                সব
              </button>
              {allSizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`px-2 py-1 text-xs rounded border transition-colors ${
                    selectedSize === s
                      ? 'bg-stone-900 text-white border-stone-900 font-semibold'
                      : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-stone-700 uppercase tracking-wider">
                সর্বোচ্চ বাজেট
              </label>
              <span className="font-bold text-stone-900 tabular-nums">
                {formatPrice(maxPrice)}
              </span>
            </div>
            <input
              type="range"
              min="500"
              max="2000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-stone-900 cursor-pointer"
            />
          </div>

          <div className="space-y-2.5 pt-2 border-t border-stone-200 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-stone-700">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded accent-stone-900 w-3.5 h-3.5"
              />
              <span>স্টকে আছে এমন পণ্য</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-stone-700">
              <input
                type="checkbox"
                checked={wishlistOnly}
                onChange={(e) => setWishlistOnly(e.target.checked)}
                className="rounded accent-stone-900 w-3.5 h-3.5"
              />
              <span>উইশলিস্ট পণ্য ({wishlist.length})</span>
            </label>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center bg-white border border-stone-200 rounded-xl space-y-4">
              <p className="text-base font-semibold text-stone-800">
                কোনো টি-শার্ট পাওয়া যায়নি।
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2 bg-stone-900 text-white text-xs font-semibold rounded-md hover:bg-stone-800 transition-colors"
              >
                ফিল্টার রিসেট করুন
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={onSelectProduct}
                />
              ))}
            </div>
          )}
        </main>
      </div>

    </div>
  );
};
