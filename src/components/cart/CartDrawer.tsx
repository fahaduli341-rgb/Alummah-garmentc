import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag, Tag, CheckCircle } from 'lucide-react';
import { StorageService } from '../../lib/storage';

interface CartDrawerProps {
  onNavigate: (path: string, params?: Record<string, string>) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigate }) => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartSubtotal,
    cartCount,
    isCartOpen,
    setIsCartOpen,
    settings,
    formatPrice,
    showToast,
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercentage: number } | null>(null);

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    const res = StorageService.validateCoupon(couponInput, cartSubtotal);
    if (res.valid && res.discountPercentage) {
      setAppliedCoupon({ code: couponInput.toUpperCase(), discountPercentage: res.discountPercentage });
      showToast(res.message, 'success');
      setCouponInput('');
    } else {
      showToast(res.message, 'error');
    }
  };

  const discountAmount = appliedCoupon
    ? Math.round((cartSubtotal * appliedCoupon.discountPercentage) / 100)
    : 0;

  const total = Math.max(0, cartSubtotal - discountAmount);

  const freeShippingThreshold = settings.freeShippingThreshold || 2000;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);
  const progressPercent = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);

  const getWhatsAppCartUrl = () => {
    if (cart.length === 0) return '#';
    const itemsText = cart
      .map(
        (c) =>
          `• ${c.product.name} (সাইজ: ${c.selectedSize}, কালার: ${c.selectedColor.name}) x ${c.quantity} = ${formatPrice(c.product.price * c.quantity)}`
      )
      .join('\n');

    const message = `আসসালামু আলাইকুম আল উম্মাহ গার্মেন্টস,\nআমি নিচের টি-শার্টগুলো অর্ডার করতে চাই:\n\n${itemsText}\n\nমোট মূল্য: ${formatPrice(total)}\n\nদয়া করে ডেলিভারির জন্য কনফার্ম করুন।`;

    const cleanNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-black/60 transition-opacity backdrop-blur-xs"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-stone-800" />
              <h2 className="text-base font-semibold text-stone-900">
                শপিং ব্যাগ ({cartCount})
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-[11px] text-rose-600 hover:text-rose-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-rose-50 transition-colors"
                  title="ব্যাগ খালি করুন"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>সব মুছুন</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-800 rounded-md transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Free Shipping Meter */}
          <div className="bg-emerald-50/70 border-b border-emerald-100 p-3.5 px-5">
            {amountNeededForFreeShipping > 0 ? (
              <p className="text-xs text-emerald-950 font-medium mb-1.5">
                আর মাত্র <span className="font-bold">{formatPrice(amountNeededForFreeShipping)}</span> টাকার অর্ডারে <span className="font-bold text-emerald-900">ফ্রি ডেলিভারি</span>!
              </p>
            ) : (
              <p className="text-xs text-emerald-900 font-semibold mb-1.5 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> অভিনন্দন! আপনি ফ্রি ডেলিভারি পেয়েছেন।
              </p>
            )}
            <div className="w-full bg-emerald-200/80 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-700 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-stone-100">
            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-medium text-stone-800">আপনার ব্যাগ খালি</h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  আমাদের প্রিমিয়াম ড্রপ-শোল্ডার ও ইসলামিক ক্যালিগ্রাফি টি-শার্ট দেখুন।
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onNavigate('/shop');
                  }}
                  className="mt-4 px-5 py-2.5 bg-[#0C1F15] text-white text-xs font-semibold rounded-lg hover:bg-[#1a3d2c]"
                >
                  টি-শার্ট দেখুন
                </button>
              </div>
            ) : (
              cart.map((item, index) => (
                <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor.name}`} className="pt-4 first:pt-0 flex gap-4">
                  <img
                    src={item.product.images[0]?.replace('/src/assets/images/', '/images/')}
                    alt={item.product.name}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80';
                    }}
                    referrerPolicy="no-referrer"
                    className="w-20 h-24 object-cover rounded-md bg-stone-100 shrink-0 border border-stone-200"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-stone-900 line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(index)}
                          className="text-stone-400 hover:text-rose-600 p-1"
                          aria-label="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-stone-500">
                        <span>সাইজ: <strong className="text-stone-700">{item.selectedSize}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>{item.selectedColor.name}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-stone-300 rounded-md bg-white">
                        <button
                          onClick={() => updateCartQuantity(index, item.quantity - 1)}
                          className="p-1.5 text-stone-600 hover:text-stone-900"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold tabular-nums text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(index, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="p-1.5 text-stone-600 hover:text-stone-900 disabled:opacity-40"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-sm font-semibold text-stone-900 tabular-nums">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="border-t border-stone-200 p-5 bg-stone-50 space-y-4">
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="কুপন কোড (যেমন: UMMAH10)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="w-full pl-9 pr-3 py-2 text-xs uppercase bg-white border border-stone-300 rounded-md focus:ring-1 focus:ring-stone-900 font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-2 bg-stone-800 text-white text-xs font-semibold rounded-md hover:bg-stone-900"
                >
                  প্রয়োগ
                </button>
              </form>

              {appliedCoupon && (
                <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-900 p-2 rounded border border-emerald-200">
                  <span>কুপন {appliedCoupon.code} প্রয়োগ হয়েছে ({appliedCoupon.discountPercentage}% ছাড়)</span>
                  <button onClick={() => setAppliedCoupon(null)} className="text-stone-500 font-bold">
                    ✕
                  </button>
                </div>
              )}

              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>সাবটোটাল</span>
                  <span className="font-medium text-stone-900 tabular-nums">{formatPrice(cartSubtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-800 font-medium">
                    <span>কুপন ছাড়</span>
                    <span className="tabular-nums">- {formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>ডেলিভারি চার্জ</span>
                  <span className="text-stone-700">
                    {cartSubtotal >= freeShippingThreshold ? 'ফ্রি' : 'চেকআউটে নির্ধারিত হবে'}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-200">
                  <span>মোট প্রদেয়</span>
                  <span className="tabular-nums text-base">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onNavigate('/checkout', appliedCoupon ? { coupon: appliedCoupon.code } : undefined);
                  }}
                  className="w-full py-3 bg-[#0C1F15] hover:bg-[#1a3d2c] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>অর্ডার করতে এগিয়ে যান</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href={getWhatsAppCartUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>হোয়াটসঅ্যাপে সরাসরি অর্ডার</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
