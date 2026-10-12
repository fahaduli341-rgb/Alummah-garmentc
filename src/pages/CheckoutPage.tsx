import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { StorageService } from '../lib/storage';
import { PaymentMethod, DeliveryZone, Order } from '../types';
import confetti from 'canvas-confetti';
import { ShieldCheck, Truck, ArrowLeft, CheckCircle2, Lock, Tag } from 'lucide-react';

interface CheckoutPageProps {
  initialCoupon?: string;
  onNavigate: (path: string, params?: Record<string, string>) => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  initialCoupon,
  onNavigate,
  onOrderSuccess,
}) => {
  const { cart, cartSubtotal, settings, formatPrice, clearCart, showToast } = useStore();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [district, setDistrict] = useState('ঢাকা (Dhaka)');
  const [thana, setThana] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>('inside_dhaka');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [trxId, setTrxId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [couponCode, setCouponCode] = useState(initialCoupon || '');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercentage: number } | null>(() => {
    if (initialCoupon) {
      const res = StorageService.validateCoupon(initialCoupon, cartSubtotal);
      if (res.valid && res.discountPercentage) {
        return { code: initialCoupon, discountPercentage: res.discountPercentage };
      }
    }
    return null;
  });

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = StorageService.validateCoupon(couponCode, cartSubtotal);
    if (res.valid && res.discountPercentage) {
      setAppliedCoupon({ code: couponCode.toUpperCase(), discountPercentage: res.discountPercentage });
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const discountAmount = appliedCoupon
    ? Math.round((cartSubtotal * appliedCoupon.discountPercentage) / 100)
    : 0;

  const freeShippingThreshold = settings.freeShippingThreshold || 2000;
  const isFreeShipping = cartSubtotal >= freeShippingThreshold;

  const deliveryFee = isFreeShipping
    ? 0
    : deliveryZone === 'inside_dhaka'
    ? settings.deliveryInsideDhaka || 70
    : settings.deliveryOutsideDhaka || 130;

  const total = Math.max(0, cartSubtotal - discountAmount + deliveryFee);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast('আপনার ব্যাগ খালি!', 'error');
      return;
    }

    if (!fullName.trim() || !phone.trim() || !fullAddress.trim()) {
      showToast('দয়া করে আপনার নাম, মোবাইল নম্বর এবং সম্পূর্ণ ঠিকানা লিখুন।', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems = cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.images[0],
        price: item.product.price,
        quantity: item.quantity,
        size: item.selectedSize,
        color: item.selectedColor.name,
      }));

      const newOrder = await StorageService.createOrder({
        status: 'pending',
        items: orderItems,
        customer: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          altPhone: altPhone.trim() || '',
          district,
          thana: thana.trim() || 'Not specified',
          fullAddress: fullAddress.trim(),
          notes: orderNotes.trim() || '',
        },
        deliveryZone,
        deliveryFee,
        subtotal: cartSubtotal,
        discount: discountAmount,
        total,
        couponCode: appliedCoupon?.code || '',
        paymentMethod,
        paymentTransactionId: trxId.trim() || '',
        isPaid: paymentMethod !== 'cod' && trxId.trim().length > 0,
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      clearCart();
      showToast(`অর্ডার সফল হয়েছে! আপনার অর্ডার নং: ${newOrder.orderNumber}`);
      onOrderSuccess(newOrder);
    } catch (err) {
      console.error(err);
      showToast('অর্ডার সম্পন্ন করতে সমস্যা হয়েছে, আবার চেষ্টা করুন।', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const bangladeshDistricts = [
    'ঢাকা (Dhaka)',
    'চট্টগ্রাম (Chattogram)',
    'সিলেট (Sylhet)',
    'রাজশাহী (Rajshahi)',
    'খুলনা (Khulna)',
    'বরিশাল (Barishal)',
    'রংপুর (Rangpur)',
    'ময়মনসিংহ (Mymensingh)',
    'গাজীপুর (Gazipur)',
    'নারায়ণগঞ্জ (Narayanganj)',
    'কুমিল্লা (Cumilla)',
    'বগুড়া (Bogura)',
    'কক্সবাজার (Cox\'s Bazar)',
    'অন্যান্য জেলা (Other District)',
  ];

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto py-24 text-center px-4 space-y-4">
        <h2 className="font-serif text-2xl font-bold text-stone-900">আপনার ব্যাগ খালি</h2>
        <p className="text-xs text-stone-500">চেকআউট করতে প্রথমে টি-শার্ট ব্যাগে যোগ করুন।</p>
        <button
          onClick={() => onNavigate('/shop')}
          className="px-6 py-2.5 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800"
        >
          টি-শার্ট শপে যান
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onNavigate('/shop')}
          className="text-xs font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> শপিং চালিয়ে যান
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Checkout Form */}
        <div className="lg:col-span-7 space-y-8">
          <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-8">
            
            {/* Step 1: Customer Details */}
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-stone-900 text-white text-xs flex items-center justify-center font-sans">১</span>
                  ডেলিভারি ঠিকানা
                </h2>
                <span className="text-xs text-stone-500">* সঠিক তথ্য প্রদান করুন</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-stone-700 block mb-1">
                    আপনার পূর্ণ নাম *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: মোঃ সাকিব হাসান"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-700 block mb-1">
                    মোবাইল নম্বর * (সচল নম্বর)
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="017XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-700 block mb-1">
                    বিকল্প মোবাইল নম্বর (ঐচ্ছিক)
                  </label>
                  <input
                    type="tel"
                    placeholder="018XXXXXXXX"
                    value={altPhone}
                    onChange={(e) => setAltPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-700 block mb-1">
                    জেলা (District) *
                  </label>
                  <select
                    value={district}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDistrict(val);
                      if (val.includes('Dhaka')) {
                        setDeliveryZone('inside_dhaka');
                      } else {
                        setDeliveryZone('outside_dhaka');
                      }
                    }}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 focus:bg-white"
                  >
                    {bangladeshDistricts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-700 block mb-1">
                    থানা / উপজেলা *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: উত্তরা / ধানমন্ডি / কোতোয়ালি"
                    value={thana}
                    onChange={(e) => setThana(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-stone-700 block mb-1">
                    বিস্তারিত ঠিকানা (বাসা/রোড/এলাকার নাম) *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="যেমন: বাড়ি ১২, রোড ৪, সেক্টর ৭"
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-stone-700 block mb-1">
                    অর্ডার সংক্রান্ত কোনো নির্দেশনা (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: ডেলিভারির আগে কল দিবেন"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Delivery Zone */}
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-xs space-y-4">
              <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
                <span className="w-6 h-6 rounded-full bg-stone-900 text-white text-xs flex items-center justify-center font-sans">২</span>
                ডেলিভারি এরিয়া
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    deliveryZone === 'inside_dhaka'
                      ? 'border-stone-900 bg-stone-50 shadow-xs ring-1 ring-stone-900'
                      : 'border-stone-200 hover:border-stone-400 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-stone-900 block text-sm">ঢাকা সিটির ভিতরে</span>
                      <span className="text-stone-500 mt-0.5 block">২-৩ কার্যদিবস</span>
                    </div>
                    <input
                      type="radio"
                      name="deliveryZone"
                      checked={deliveryZone === 'inside_dhaka'}
                      onChange={() => setDeliveryZone('inside_dhaka')}
                      className="accent-stone-900 mt-1"
                    />
                  </div>
                  <div className="mt-3 font-semibold text-stone-900">
                    {isFreeShipping ? 'ফ্রি' : `৳${settings.deliveryInsideDhaka}`}
                  </div>
                </label>

                <label
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    deliveryZone === 'outside_dhaka'
                      ? 'border-stone-900 bg-stone-50 shadow-xs ring-1 ring-stone-900'
                      : 'border-stone-200 hover:border-stone-400 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-stone-900 block text-sm">ঢাকার বাইরে (সারা বাংলাদেশ)</span>
                      <span className="text-stone-500 mt-0.5 block">৩-৫ কার্যদিবস (রেডএক্স/স্টেডফাস্ট)</span>
                    </div>
                    <input
                      type="radio"
                      name="deliveryZone"
                      checked={deliveryZone === 'outside_dhaka'}
                      onChange={() => setDeliveryZone('outside_dhaka')}
                      className="accent-stone-900 mt-1"
                    />
                  </div>
                  <div className="mt-3 font-semibold text-stone-900">
                    {isFreeShipping ? 'ফ্রি' : `৳${settings.deliveryOutsideDhaka}`}
                  </div>
                </label>
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-xs space-y-4">
              <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
                <span className="w-6 h-6 rounded-full bg-stone-900 text-white text-xs flex items-center justify-center font-sans">৩</span>
                পেমেন্ট পদ্ধতি
              </h2>

              <div className="space-y-3 text-xs">
                {/* Cash on Delivery */}
                <label
                  className={`p-4 rounded-xl border cursor-pointer block transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-stone-900 bg-stone-50 shadow-xs ring-1 ring-stone-900'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Truck className="w-4 h-4 text-emerald-800" />
                      <div>
                        <span className="font-bold text-stone-900 text-sm block">ক্যাশ অন ডেলিভারি (Cash on Delivery)</span>
                        <span className="text-stone-500">পণ্য হাতে পেয়ে ডেলিভারি ম্যানের কাছে টাকা দিন।</span>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="accent-stone-900"
                    />
                  </div>
                </label>

                {/* bKash */}
                <label
                  className={`p-4 rounded-xl border cursor-pointer block transition-all ${
                    paymentMethod === 'bkash'
                      ? 'border-stone-900 bg-stone-50 shadow-xs ring-1 ring-stone-900'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Lock className="w-4 h-4 text-emerald-800" />
                      <div>
                        <span className="font-bold text-stone-900 text-sm block">বিকাশ (bKash Send Money)</span>
                        <span className="text-stone-500">আমাদের বিকাশ নম্বরে সেন্ড মানি করুন।</span>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'bkash'}
                      onChange={() => setPaymentMethod('bkash')}
                      className="accent-stone-900"
                    />
                  </div>

                  {paymentMethod === 'bkash' && (
                    <div className="mt-3 pt-3 border-t border-stone-200/80 bg-stone-100/80 p-3 rounded-lg text-xs space-y-2">
                      <p><strong>বিকাশ নম্বর:</strong> <span className="font-mono font-bold text-emerald-900">{settings.bkashNumber}</span></p>
                      <p className="text-stone-600">উপরের নম্বরে মোট <strong>{formatPrice(total)}</strong> টাকা সেন্ড মানি করে নিচের বক্সে ট্রানজেকশন আইডি (TrxID) লিখুন:</p>
                      <input
                        type="text"
                        placeholder="বিকাশ TrxID লিখুন (যেমন: 9J3K8L2M)"
                        value={trxId}
                        onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                        className="w-full p-2 bg-white border border-stone-300 rounded font-mono"
                      />
                    </div>
                  )}
                </label>

                {/* Nagad */}
                <label
                  className={`p-4 rounded-xl border cursor-pointer block transition-all ${
                    paymentMethod === 'nagad'
                      ? 'border-stone-900 bg-stone-50 shadow-xs ring-1 ring-stone-900'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Lock className="w-4 h-4 text-emerald-800" />
                      <div>
                        <span className="font-bold text-stone-900 text-sm block">নগদ (Nagad Send Money)</span>
                        <span className="text-stone-500">আমাদের নগদ নম্বরে সেন্ড মানি করুন।</span>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'nagad'}
                      onChange={() => setPaymentMethod('nagad')}
                      className="accent-stone-900"
                    />
                  </div>

                  {paymentMethod === 'nagad' && (
                    <div className="mt-3 pt-3 border-t border-stone-200/80 bg-stone-100/80 p-3 rounded-lg text-xs space-y-2">
                      <p><strong>নগদ নম্বর:</strong> <span className="font-mono font-bold text-emerald-900">{settings.nagadNumber}</span></p>
                      <p className="text-stone-600">উপরের নম্বরে মোট <strong>{formatPrice(total)}</strong> টাকা সেন্ড মানি করে TrxID লিখুন:</p>
                      <input
                        type="text"
                        placeholder="নগদ TrxID লিখুন"
                        value={trxId}
                        onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                        className="w-full p-2 bg-white border border-stone-300 rounded font-mono"
                      />
                    </div>
                  )}
                </label>
              </div>
            </div>

          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-5">
            <h3 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
              অর্ডার বিবরণ ({cart.reduce((s, i) => s + i.quantity, 0)} টি টি-শার্ট)
            </h3>

            <div className="space-y-3 max-h-72 overflow-y-auto divide-y divide-stone-100 pr-1">
              {cart.map((item, idx) => (
                <div key={idx} className="pt-3 first:pt-0 flex gap-3 text-xs">
                  <img
                    src={item.product.images[0]?.replace('/src/assets/images/', '/images/')}
                    alt={item.product.name}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80';
                    }}
                    referrerPolicy="no-referrer"
                    className="w-14 h-18 object-cover rounded bg-stone-100 border border-stone-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-stone-900 truncate">{item.product.name}</h4>
                    <p className="text-stone-500 text-[11px] mt-0.5">
                      সাইজ: {item.selectedSize} · {item.selectedColor.name}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-stone-600">{item.quantity} টি</span>
                      <span className="font-bold text-stone-900 tabular-nums">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Voucher input */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2 pt-2 border-t border-stone-100">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="কুপন (যেমন: UMMAH10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="w-full pl-9 pr-3 py-2 text-xs uppercase bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800"
              >
                প্রয়োগ
              </button>
            </form>

            <div className="space-y-2 text-xs text-stone-600 pt-2 border-t border-stone-100">
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
                <span className="font-medium text-stone-900 tabular-nums">
                  {deliveryFee === 0 ? 'ফ্রি' : formatPrice(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-stone-900 pt-3 border-t border-stone-200">
                <span>মোট প্রদেয়</span>
                <span className="tabular-nums text-lg">{formatPrice(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#0C1F15] hover:bg-[#153424] disabled:bg-stone-400 text-white text-sm font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span>অর্ডার প্রসেস হচ্ছে...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>অর্ডার নিশ্চিত করুন ({formatPrice(total)})</span>
                </>
              )}
            </button>

            <div className="text-[11px] text-stone-500 text-center flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>নিরাপদ ক্যাশ অন ডেলিভারি ও দ্রুত হোম ডেলিভারি</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
