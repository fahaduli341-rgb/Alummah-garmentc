import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types';
import { StorageService } from '../lib/storage';
import { useStore } from '../context/StoreContext';
import { Search, CheckCircle, Clock, Truck, Package, MessageCircle } from 'lucide-react';

interface OrderTrackingPageProps {
  initialOrderId?: string;
  onNavigate: (path: string, params?: Record<string, string>) => void;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ initialOrderId }) => {
  const { formatPrice, settings } = useStore();
  const [query, setQuery] = useState(initialOrderId || '');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialOrderId) {
      handleSearch(initialOrderId);
    }
  }, [initialOrderId]);

  const handleSearch = (searchQuery = query) => {
    if (!searchQuery.trim()) return;
    setHasSearched(true);
    const order = StorageService.getOrderById(searchQuery);
    setTrackedOrder(order || null);
  };

  const getStepState = (currentStatus: OrderStatus, step: OrderStatus) => {
    const sequence: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = sequence.indexOf(currentStatus);
    const stepIndex = sequence.indexOf(step);

    if (currentStatus === 'cancelled') return 'cancelled';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs uppercase tracking-widest text-emerald-900 font-semibold">
          লাইভ পার্সেল ট্র্যাকিং
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
          আপনার টি-শার্টের অর্ডার ট্র্যাক করুন
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
          আপনার অর্ডার নাম্বার লিখে সার্চ করুন এবং পার্সেলের বর্তমান অবস্থান জানুন।
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-stone-200 shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="অর্ডার নাম্বার লিখুন (যেমন: AUG-1001)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 focus:bg-white uppercase font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#0C1F15] text-white text-xs font-semibold rounded-lg hover:bg-[#183a28] transition-colors"
          >
            ট্র্যাক করুন
          </button>
        </form>
      </div>

      {/* Tracked Order Details */}
      {hasSearched && (
        <>
          {trackedOrder ? (
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden space-y-6 p-6 sm:p-8">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
                <div>
                  <span className="text-xs text-stone-500 font-mono">অর্ডার নাম্বার</span>
                  <h2 className="font-serif text-2xl font-bold text-stone-900">
                    {trackedOrder.orderNumber}
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    অর্ডার তারিখ: {new Date(trackedOrder.createdAt).toLocaleDateString('bn-BD')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs px-3 py-1 rounded font-semibold capitalize ${
                    trackedOrder.status === 'delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : trackedOrder.status === 'shipped'
                      ? 'bg-blue-100 text-blue-800'
                      : trackedOrder.status === 'processing'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-stone-100 text-stone-800'
                  }`}>
                    স্ট্যাটাস: {trackedOrder.status}
                  </span>
                </div>
              </div>

              {/* Progress Milestones */}
              <div className="py-4">
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { id: 'pending', label: 'অর্ডার গৃহীত', icon: Clock },
                    { id: 'processing', label: 'প্যাকেজিং হচ্ছে', icon: Package },
                    { id: 'shipped', label: 'কুরিয়ারে হস্তান্তর', icon: Truck },
                    { id: 'delivered', label: 'ডেলিভারি সম্পন্ন', icon: CheckCircle },
                  ].map((step, idx) => {
                    const state = getStepState(trackedOrder.status, step.id as OrderStatus);
                    const IconComponent = step.icon;
                    return (
                      <div key={idx} className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            state === 'completed'
                              ? 'bg-emerald-700 text-white'
                              : state === 'active'
                              ? 'bg-[#0C1F15] text-white ring-4 ring-emerald-100'
                              : 'bg-stone-100 text-stone-400'
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className={`text-[11px] font-medium mt-2 leading-tight ${
                          state === 'active' || state === 'completed' ? 'text-stone-900 font-bold' : 'text-stone-400'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Courier details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-stone-50 p-4 rounded-xl text-xs text-stone-700">
                <div>
                  <span className="text-stone-400 block mb-1">গ্রাহকের তথ্য</span>
                  <p className="font-semibold text-stone-900">{trackedOrder.customer.fullName}</p>
                  <p>{trackedOrder.customer.phone}</p>
                  <p className="text-stone-600">{trackedOrder.customer.fullAddress}, {trackedOrder.customer.thana}, {trackedOrder.customer.district}</p>
                </div>

                <div>
                  <span className="text-stone-400 block mb-1">ডেলিভারি ও কুরিয়ার</span>
                  <p>
                    <strong>এলাকা:</strong>{' '}
                    {trackedOrder.deliveryZone === 'inside_dhaka' ? 'ঢাকা সিটির ভেতরে' : 'ঢাকার বাইরে (সারা বাংলাদেশ)'}
                  </p>
                  {trackedOrder.courierName && (
                    <p><strong>কুরিয়ার:</strong> {trackedOrder.courierName}</p>
                  )}
                  {trackedOrder.trackingNumber && (
                    <p className="font-mono text-emerald-800">
                      <strong>ট্র্যাকিং কোড:</strong> {trackedOrder.trackingNumber}
                    </p>
                  )}
                  <p>
                    <strong>পেমেন্ট:</strong>{' '}
                    {trackedOrder.paymentMethod.toUpperCase()} ({trackedOrder.isPaid ? 'পরিশোধিত' : 'ক্যাশ অন ডেলিভারি'})
                  </p>
                </div>
              </div>

              {/* Ordered Items */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  অর্ডারকৃত টি-শার্ট সমূহ
                </h4>
                <div className="divide-y divide-stone-100">
                  {trackedOrder.items.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.productImage?.replace('/src/assets/images/', '/images/')}
                          alt={item.productName}
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80';
                          }}
                          referrerPolicy="no-referrer"
                          className="w-12 h-14 object-cover rounded bg-stone-100 border border-stone-200"
                        />
                        <div>
                          <p className="font-medium text-stone-900">{item.productName}</p>
                          <p className="text-stone-500">সাইজ: {item.size} · কালার: {item.color}</p>
                        </div>
                      </div>
                      <div className="text-right tabular-nums">
                        <span className="text-stone-500">{item.quantity} x {formatPrice(item.price)}</span>
                        <p className="font-bold text-stone-900">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-stone-200 flex justify-between text-sm font-bold text-stone-900">
                  <span>সর্বমোট বিল</span>
                  <span className="tabular-nums">{formatPrice(trackedOrder.total)}</span>
                </div>
              </div>

              {/* WhatsApp Support Button */}
              <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-stone-600">
                  পার্সেল নিয়ে কোনো প্রশ্ন থাকলে সরাসরি আমাদের সাথে যোগাযোগ করুন:
                </p>
                <a
                  href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`আসসালামু আলাইকুম, আমি আমার অর্ডার #${trackedOrder.orderNumber} এর আপডেট জানতে চাই।`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>হোয়াটসঅ্যাপে ডেলিভারি সাপোর্ট</span>
                </a>
              </div>

            </div>
          ) : (
            <div className="bg-white p-8 rounded-xl border border-stone-200 text-center space-y-3">
              <p className="text-sm font-semibold text-stone-800">
                "{query}" নাম্বারে কোনো অর্ডার পাওয়া যায়নি।
              </p>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                দয়া করে সঠিক অর্ডার নাম্বার লিখুন অথবা আমাদের হোয়াটসঅ্যাপে যোগাযোগ করুন।
              </p>
            </div>
          )}
        </>
      )}

    </div>
  );
};
