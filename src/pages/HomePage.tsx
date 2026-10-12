import React, { useState } from 'react';
import { Product, Category } from '../types';
import { ProductCard } from '../components/product/ProductCard';
import { ArrowRight, Shield, Truck, RefreshCw, MessageSquare } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface HomePageProps {
  products: Product[];
  categories: Category[];
  onSelectProduct: (product: Product) => void;
  onNavigate: (path: string, params?: Record<string, string>) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  categories,
  onSelectProduct,
  onNavigate,
}) => {
  const { settings } = useStore();
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'bestseller'>('all');

  const filteredProducts = products.filter((p) => {
    if (activeTab === 'new') return p.isNewArrival;
    if (activeTab === 'bestseller') return p.isBestSeller;
    return true;
  });

  return (
    <div className="space-y-16 lg:space-y-20 pb-16">
      
      {/* Hero Campaign (Pure Islamic Streetwear T-shirt aesthetic, NO sparkle icons, NO pill badges) */}
      <section className="relative bg-[#0C1F15] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6 z-10">
            {/* Clean unboxed editorial kicker */}
            <div className="text-xs font-semibold text-emerald-300 tracking-widest uppercase">
              আল উম্মাহ প্রিমিয়াম ড্রপ-শোল্ডার টি-শার্ট কালেকশন
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-100 leading-[1.18] text-balance">
              {settings.heroMainHeading || 'মার্জিত ইসলামিক ক্যালিগ্রাফি ও খাঁটি কটনের টি-শার্ট।'}
            </h1>

            <p className="text-stone-300 text-sm sm:text-base max-w-xl leading-relaxed">
              {settings.heroSubHeading || '১০০% প্রিমিয়াম কম্বড কটন, ২২০-২৪০ জিএসএম হেভিওয়েট ড্রপ-শোল্ডার কাটিং। শালীন ও রুচিশীল সবর, তাওয়াক্কুল ও মিনিমাল ইসলামিক ক্যালিগ্রাফি নকশায় তৈরি।'}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('/shop')}
                className="px-6 py-3.5 bg-white text-stone-950 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-stone-100 transition-colors shadow-md flex items-center gap-2"
              >
                <span>টি-শার্ট কালেকশন দেখুন</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('/shop', { category: 'islamic-calligraphy' })}
                className="px-6 py-3.5 bg-[#143323] hover:bg-[#1a442f] text-emerald-200 border border-emerald-800 text-xs font-semibold rounded-lg transition-colors"
              >
                সবর ও ক্যালিগ্রাফি টি-শার্ট
              </button>
            </div>

            {/* Quick Trust Highlights / Numbers Above Banner */}
            <div className="pt-8 border-t border-emerald-900/60 grid grid-cols-3 gap-6 text-stone-300">
              <div>
                <span className="block text-xl sm:text-2xl font-bold text-white tabular-nums font-serif">
                  {settings.stat1Number || '২২০+ GSM'}
                </span>
                <span className="text-xs text-stone-400">
                  {settings.stat1Label || '১০০% কম্বড কটন'}
                </span>
              </div>
              <div>
                <span className="block text-xl sm:text-2xl font-bold text-white tabular-nums font-serif">
                  {settings.stat2Number || 'ক্যাশ অন'}
                </span>
                <span className="text-xs text-stone-400">
                  {settings.stat2Label || 'সারা দেশে ডেলিভারি'}
                </span>
              </div>
              <div>
                <span className="block text-xl sm:text-2xl font-bold text-white tabular-nums font-serif">
                  {settings.stat3Number || '৭ দিন'}
                </span>
                <span className="text-xs text-stone-400">
                  {settings.stat3Label || 'সাইজ এক্সচেঞ্জ সুবিধা'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-emerald-950 aspect-[4/5] bg-stone-900">
              <img
                src={settings.heroImage?.replace('/src/assets/images/', '/images/') || '/images/hero_islamic_tshirt_banner_1791712348157.jpg'}
                alt="Al Ummah Islamic T-Shirts Campaign"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1200&auto=format&fit=crop&q=80';
                }}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold block">
                  {settings.heroBadge || 'ড্রপ-শোল্ডার এডিশন'}
                </span>
                <p className="text-lg font-serif font-bold text-white">
                  {settings.heroTitle || 'সবর (Sabr) ও তাওয়াক্কুল (Tawakkul) সিরিজ'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Guarantee Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 rounded-xl bg-white border border-stone-200/80 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-emerald-50 text-emerald-900 rounded-lg">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-stone-900">সারা বাংলাদেশে ডেলিভারি</h4>
              <p className="text-xs text-stone-500 mt-0.5">ঢাকা সিটিতে ২-৩ দিন এবং ঢাকার বাইরে ৩-৫ দিনে ডেলিভারি।</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-emerald-50 text-emerald-900 rounded-lg">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-stone-900">ক্যাশ অন ডেলিভারি</h4>
              <p className="text-xs text-stone-500 mt-0.5">পণ্য হাতে পেয়ে রাইডারের কাছে মূল্য পরিশোধ করুন।</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-emerald-50 text-emerald-900 rounded-lg">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-stone-900">সহজ সাইজ এক্সচেঞ্জ</h4>
              <p className="text-xs text-stone-500 mt-0.5">সাইজে সমস্যা হলে ৭ দিনের মধ্যে পরিবর্তন সুবিধা।</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-emerald-50 text-emerald-900 rounded-lg">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-stone-900">হোয়াটসঅ্যাপ সাপোর্ট</h4>
              <p className="text-xs text-stone-500 mt-0.5">সরাসরি হোয়াটসঅ্যাপে সাইজ ও অর্ডার সহায়তা।</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-emerald-900 font-semibold block mb-1">
              টি-শার্ট ক্যাটাগরি
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              আমাদের টি-শার্ট কালেকশন
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/shop')}
            className="text-xs font-semibold text-stone-900 hover:text-emerald-800 flex items-center gap-1 group self-start sm:self-auto"
          >
            <span>সব টি-শার্ট দেখুন</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate('/shop', { category: cat.slug })}
              className="group relative rounded-xl overflow-hidden aspect-[4/5] bg-stone-900 cursor-pointer shadow-sm hover:shadow-lg transition-all"
            >
              <img
                src={cat.image?.replace('/src/assets/images/', '/images/')}
                alt={cat.name}
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80';
                }}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/20 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <h3 className="text-base font-semibold text-white group-hover:text-emerald-200 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-stone-300 line-clamp-2 mt-1">
                  {cat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
          <div>
            <span className="text-xs uppercase tracking-widest text-emerald-900 font-semibold block mb-1">
              আকর্ষণীয় ডিজাইন
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              জনপ্রিয় টি-শার্ট সমূহ
            </h2>
          </div>

          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'all'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              সকল ডিজাইন
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'new'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              নতুন কালেকশন
            </button>
            <button
              onClick={() => setActiveTab('bestseller')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'bestseller'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              বেস্টসেলার
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>

        <div className="text-center pt-6">
          <button
            onClick={() => onNavigate('/shop')}
            className="px-8 py-3.5 bg-[#0C1F15] hover:bg-[#1a3d2c] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm inline-flex items-center gap-2"
          >
            <span>সকল টি-শার্ট এক্সপ্লোর করুন</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Fabric Quality & Craftsmanship Feature */}
      <section className="bg-stone-100 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-stone-200 shadow-lg">
            <img
              src="/images/tshirt_sabr_calligraphy_1791712281050.jpg"
              alt="Al Ummah Fabric Quality"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80';
              }}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-6">
            <span className="text-xs uppercase tracking-widest text-emerald-900 font-semibold block">
              ফ্যাব্রিক ও ফিনিশিং কোয়ালিটি
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 leading-tight">
              কেন আল উম্মাহ টি-শার্ট অন্যদের চেয়ে আলাদা?
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              আমরা শতভাগ কম্বড কটনের সুতা ব্যবহার করি এবং রিঅ্যাক্টিভ ডাইং প্রক্রিয়ায় রঙ করা হয়, ফলে বহু ওয়াশের পরেও কাপড়ের রঙ ও মসৃণতা অটুট থাকে।
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-sm text-stone-800">
                <span className="w-2 h-2 rounded-full bg-emerald-800" />
                <span>২২০+ থেকে ২৪০ জিএসএম প্রিমিয়াম ড্রপ-শোল্ডার কাটিং</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-stone-800">
                <span className="w-2 h-2 rounded-full bg-emerald-800" />
                <span>হাই-ডেনসিটি ও রাবার স্ক্রিন প্রিন্ট যা ফেটে যায় না</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-stone-800">
                <span className="w-2 h-2 rounded-full bg-emerald-800" />
                <span>ডাবল স্টিচ নেকলাইন ও স্প্যানডেক্স রিব কলার</span>
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('/about')}
                className="px-6 py-3 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors"
              >
                আমাদের সম্পর্কে আরও জানুন
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Direct Order Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0C1F15] text-white rounded-2xl p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-3 max-w-xl text-center lg:text-left">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              সহজ সরাসরি অর্ডার
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold">
              হোয়াটসঅ্যাপে সরাসরি অর্ডার করুন
            </h3>
            <p className="text-xs sm:text-sm text-stone-300">
              আপনার পছন্দের টি-শার্টের ছবি পাঠিয়ে সাইজ কনফার্ম করে ক্যাশ অন ডেলিভারিতে অর্ডার বুক করুন।
            </p>
          </div>
          <a
            href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('আসসালামু আলাইকুম, আমি আল উম্মাহ গার্মেন্টস থেকে টি-শার্ট অর্ডার করতে চাই।')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap shadow-lg flex items-center gap-2"
          >
            <span>হোয়াটসঅ্যাপে চ্যাট করুন</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

    </div>
  );
};
