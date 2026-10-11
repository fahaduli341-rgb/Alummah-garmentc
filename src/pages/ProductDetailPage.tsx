import React, { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { Heart, ShieldCheck, Truck, RefreshCw, MessageCircle, Ruler, Plus, Minus, ArrowLeft } from 'lucide-react';

interface ProductDetailPageProps {
  product: Product;
  allProducts: Product[];
  onSelectProduct: (product: Product) => void;
  onNavigate: (path: string, params?: Record<string, string>) => void;
  onBack: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  onSelectProduct,
  onNavigate,
  onBack,
}) => {
  const { addToCart, isInWishlist, toggleWishlist, formatPrice, settings, setIsCartOpen } = useStore();

  const [activeImage, setActiveImage] = useState<string>(product.images[0]);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'L (Chest 42")');
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string }>(
    product.colors[0] || { name: 'Black', hex: '#000000' }
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'details' | 'care'>('details');
  const [showSizeModal, setShowSizeModal] = useState<boolean>(false);

  const wishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    setIsCartOpen(true);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    onNavigate('/checkout');
  };

  const getWhatsAppOrderUrl = () => {
    const message = `আসসালামু আলাইকুম আল উম্মাহ গার্মেন্টস,\nআমি এই টি-শার্টটি অর্ডার করতে চাই:\n\n• পণ্য: ${product.name}\n• SKU: ${product.sku}\n• সাইজ: ${selectedSize}\n• কালার: ${selectedColor.name}\n• পরিমাণ: ${quantity} টি\n• মোট মূল্য: ${formatPrice(product.price * quantity)}\n\nদয়া করে অর্ডারটি কনফার্ম করুন।`;
    const cleanNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  };

  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      
      {/* Breadcrumb & Back */}
      <div className="flex items-center gap-3 text-xs text-stone-500">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-stone-700 hover:text-stone-900 font-medium py-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> পেছনে যান
        </button>
        <span aria-hidden="true">/</span>
        <button onClick={() => onNavigate('/shop')} className="hover:underline">টি-শার্ট শপ</button>
        <span aria-hidden="true">/</span>
        <span className="text-stone-900 font-medium truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[4/5] rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shadow-xs relative">
            <img
              src={activeImage}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            {product.discountPercentage && product.discountPercentage > 0 && (
              <span className="absolute top-4 left-4 bg-[#0C1F15] text-white text-xs font-semibold px-2.5 py-1 rounded">
                {product.discountPercentage}% ছাড়
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-24 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                    activeImage === img ? 'border-stone-900 scale-95' : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Purchase Module */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2 border-b border-stone-200 pb-5">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span className="font-mono uppercase tracking-wider text-[11px] text-stone-600">
                SKU: {product.sku}
              </span>
              <span className="text-emerald-900 font-semibold">{product.gsm || '230 GSM'} · {product.fit}</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-snug">
              {product.name}
            </h1>

            {/* In stock badge */}
            <div className="flex items-center justify-between gap-4 pt-1">
              {product.inStock ? (
                <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                  ইন স্টক ({product.stock} টি অবশিষ্ট আছে)
                </span>
              ) : (
                <span className="text-xs font-medium text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200">
                  স্টক শেষ
                </span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 pt-3">
              <span className="text-2xl font-bold text-stone-900 tabular-nums">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-stone-400 line-through tabular-nums">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Color Selector */}
          <div className="space-y-2.5">
            <span className="text-xs font-semibold text-stone-800 block">
              কালার: <strong className="text-stone-900">{selectedColor.name}</strong>
            </span>
            <div className="flex gap-2">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all ${
                    selectedColor.name === color.name
                      ? 'border-stone-950 bg-stone-50 font-semibold shadow-xs'
                      : 'border-stone-200 hover:border-stone-400 text-stone-700'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-stone-300"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span>{color.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Size Selector + Size Chart Modal */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-stone-800">
                সাইজ সিলেক্ট করুন: <strong className="text-stone-900">{selectedSize}</strong>
              </span>
              <button
                onClick={() => setShowSizeModal(true)}
                className="text-emerald-900 hover:underline flex items-center gap-1 font-semibold"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>সাইজ চার্ট (ইঞ্চি)</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-2 text-xs font-semibold rounded-md border transition-all ${
                    selectedSize === size
                      ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                      : 'bg-white text-stone-800 border-stone-300 hover:border-stone-500'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-stone-800 block">পরিমাণ</span>
            <div className="flex items-center border border-stone-300 rounded-lg w-fit bg-white">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-2 text-stone-600 hover:text-stone-950 hover:bg-stone-50"
                aria-label="Decrease"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-4 text-xs font-bold text-stone-900 tabular-nums">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                disabled={quantity >= product.stock}
                className="p-2 text-stone-600 hover:text-stone-950 hover:bg-stone-50 disabled:opacity-40"
                aria-label="Increase"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2.5 pt-2">
            <div className="grid grid-cols-5 gap-2">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="col-span-4 py-3.5 bg-[#0C1F15] hover:bg-[#153824] disabled:bg-stone-300 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span>{product.inStock ? 'ব্যাগে যোগ করুন' : 'স্টক শেষ'}</span>
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`col-span-1 rounded-lg border flex items-center justify-center transition-colors ${
                  wishlisted
                    ? 'border-rose-300 bg-rose-50 text-rose-600'
                    : 'border-stone-300 hover:border-stone-400 text-stone-700'
                }`}
                aria-label="Wishlist toggle"
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-rose-600' : ''}`} />
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              disabled={!product.inStock}
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              এখনই অর্ডার করুন (ক্যাশ অন ডেলিভারি)
            </button>

            {/* WhatsApp direct order */}
            <a
              href={getWhatsAppOrderUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>হোয়াটসঅ্যাপে সরাসরি অর্ডার করুন</span>
            </a>
          </div>

          {/* Delivery & Trust Box */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2.5 text-xs text-stone-700">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-emerald-800 shrink-0" />
              <span>ঢাকা সিটিতে ৳{settings.deliveryInsideDhaka} এবং ঢাকার বাইরে ৳{settings.deliveryOutsideDhaka} ডেলিভারি চার্জ।</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-800 shrink-0" />
              <span>ক্যাশ অন ডেলিভারি (পার্সেল দেখে রাইডারকে টাকা দিন)।</span>
            </div>
            <div className="flex items-center gap-2.5">
              <RefreshCw className="w-4 h-4 text-emerald-800 shrink-0" />
              <span>৭ দিনের মধ্যে সহজ সাইজ পরিবর্তন বা এক্সচেঞ্জ সুবিধা।</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs (Zero fake reviews) */}
      <div className="border-t border-stone-200 pt-10 space-y-6">
        <div className="flex items-center gap-6 border-b border-stone-200">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'details' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            ফ্যাব্রিক ও সাইজ বিবরণ
          </button>
          <button
            onClick={() => setActiveTab('care')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'care' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            ধোয়া ও যত্ন নেওয়ার নিয়মাবলী
          </button>
        </div>

        {activeTab === 'details' && (
          <div className="space-y-4 max-w-3xl text-sm text-stone-700 leading-relaxed">
            <p>{product.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-stone-100">
              <div className="p-3 bg-stone-50 rounded-lg">
                <span className="text-xs text-stone-500 block">কাপড়ের ধরন</span>
                <span className="font-semibold text-stone-900">{product.fabric}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-lg">
                <span className="text-xs text-stone-500 block">কাটিং ও ফিটিং</span>
                <span className="font-semibold text-stone-900">{product.fit}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'care' && (
          <div className="max-w-xl space-y-2 text-sm text-stone-700">
            <p className="font-medium text-stone-900 mb-2">টি-শার্টের দীর্ঘস্থায়িত্বের জন্য:</p>
            <ul className="space-y-1.5 list-disc list-inside text-xs sm:text-sm">
              {product.careInstructions.map((inst, i) => (
                <li key={i}>{inst}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Related T-shirts */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-stone-200 pt-12 space-y-6">
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
            সম্পর্কিত অন্যান্য টি-শার্ট
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
            {relatedProducts.map((rel) => (
              <div
                key={rel.id}
                onClick={() => onSelectProduct(rel)}
                className="cursor-pointer group"
              >
                <div className="aspect-[3/4] rounded-lg overflow-hidden bg-stone-100 border border-stone-200 mb-2">
                  <img
                    src={rel.images[0]}
                    alt={rel.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <h4 className="text-xs font-medium text-stone-900 line-clamp-1">{rel.name}</h4>
                <span className="text-xs font-bold text-stone-900">{formatPrice(rel.price)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sizing Modal (Inches) */}
      {showSizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                আল উম্মাহ টি-শার্ট সাইজ চার্ট (ইঞ্চি)
              </h3>
              <button
                onClick={() => setShowSizeModal(false)}
                className="text-stone-400 hover:text-stone-800 p-1"
              >
                ✕
              </button>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-100 text-stone-700">
                    <th className="p-2.5 border">সাইজ</th>
                    <th className="p-2.5 border">বুক (Chest)</th>
                    <th className="p-2.5 border">দৈর্ঘ্য (Length)</th>
                    <th className="p-2.5 border">শোল্ডার (Shoulder)</th>
                    <th className="p-2.5 border">হাতা (Sleeve)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  <tr>
                    <td className="p-2.5 font-bold border">M</td>
                    <td className="p-2.5 border">40"</td>
                    <td className="p-2.5 border">28"</td>
                    <td className="p-2.5 border">19"</td>
                    <td className="p-2.5 border">8.5"</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold border">L</td>
                    <td className="p-2.5 border">42"</td>
                    <td className="p-2.5 border">29"</td>
                    <td className="p-2.5 border">20"</td>
                    <td className="p-2.5 border">9.0"</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold border">XL</td>
                    <td className="p-2.5 border">44"</td>
                    <td className="p-2.5 border">30"</td>
                    <td className="p-2.5 border">21"</td>
                    <td className="p-2.5 border">9.5"</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold border">XXL</td>
                    <td className="p-2.5 border">46"</td>
                    <td className="p-2.5 border">31"</td>
                    <td className="p-2.5 border">22"</td>
                    <td className="p-2.5 border">10.0"</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs text-stone-500">
              * আমাদের সকল টি-শার্ট ওভারসাইজড ড্রপ-শোল্ডার প্যাটার্নে তৈরি। সাইজ নিয়ে সংশয় থাকলে সরাসরি হোয়াটসঅ্যাপে আমাদের মেসেজ দিন।
            </p>

            <button
              onClick={() => setShowSizeModal(false)}
              className="w-full py-2 bg-stone-900 text-white text-xs font-semibold rounded hover:bg-stone-800"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
