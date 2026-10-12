import React from 'react';
import { ShieldCheck, Sparkles, Scissors, HeartHandshake } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const AboutPage: React.FC = () => {
  const { settings } = useStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-16">
      
      {/* Hero Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-widest text-emerald-900 font-semibold">
          আমাদের গল্প ও ঐতিহ্য
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 leading-tight">
          শালীনতা ও আধুনিক টি-শার্টের মেলবন্ধন।
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          আল উম্মাহ গার্মেন্টস (AL UMMAH GARMENTS) বাংলাদেশের তরুণ প্রজন্মের জন্য প্রিমিয়াম মানের কম্বড কটন ড্রপ-শোল্ডার ও ইসলামিক ক্যালিগ্রাফি টি-শার্ট তৈরি করছে।
        </p>
      </div>

      {/* Grid: Image + Story */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 shadow-lg border border-stone-200">
          <img
            src="/images/tshirt_sabr_calligraphy_1791712281050.jpg"
            alt="Al Ummah Garments Workshop"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80';
            }}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            খাঁটি সুতা ও উন্নত কোয়ালিটির প্রতিশ্রুতি
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            সিন্থেটিক মিশ্রণ নয়, আমরা প্রতিটি টি-শার্ট তৈরিতে ব্যবহার করি ১০০% খাঁটি কম্বড কটন। সুতার ঘনত্ব ২২০ থেকে ২৪০ জিএসএম যা টি-শার্টকে করে তোলে ড্রপ-শোল্ডার লুকের উপযোগী এবং আরামদায়ক।
          </p>
          <p className="text-sm text-stone-600 leading-relaxed">
            প্রতিটি টি-শার্টের ক্যালিগ্রাফি ও জ্যামিতিক নকশায় ফুটিয়ে তোলা হয়েছে ইসলামিক মূল্যবোধ — সবর, তাওয়াক্কুল ও উম্মাহর ঐক্য।
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-stone-200">
            <div>
              <span className="font-serif text-2xl font-bold text-stone-900 block">১০০% কটন</span>
              <span className="text-xs text-stone-500">প্রিমিয়াম কম্বড সুতা</span>
            </div>
            <div>
              <span className="font-serif text-2xl font-bold text-stone-900 block">২২০+ GSM</span>
              <span className="text-xs text-stone-500">হেভিওয়েট ড্রপ-শোল্ডার</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Pillars */}
      <div className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h3 className="font-serif text-2xl font-bold text-stone-900">
            আমাদের মূল বৈশিষ্ট্য
          </h3>
          <p className="text-xs text-stone-500">প্রতিটি পোশাকে যা আমরা নিশ্চিত করি</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-xl bg-white border border-stone-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-900 flex items-center justify-center">
              <Scissors className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-stone-900">পারফেক্ট কাটিং</h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              পরিমিত ঢিলেঢালা ড্রপ-শোল্ডার প্যাটার্ন যা নামায ও দৈনন্দিন চলাফেরায় পুরোপুরি শালীন।
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-stone-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-900 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-stone-900">টেকসই প্রিন্ট</h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              উচ্চমানের রাবার ও হাই-ডেনসিটি স্ক্রিন প্রিন্ট যা ওয়াশে সহজে ফিকে হয় না।
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-stone-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-900 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-stone-900">মানের নিশ্চয়তা</h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              ডেলিভারির পূর্বে প্রতি পিস টি-শার্টের ত্রুটিমুক্ত ফিনিশিং নিশ্চিত করা হয়।
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-stone-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-900 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-stone-900">সরাসরি সেবা</h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              হোয়াটসঅ্যাপের মাধ্যমে কাস্টমার সাপোর্ট এবং সাইজ সংক্রান্ত পূর্ণ গাইডলাইন।
            </p>
          </div>
        </div>
      </div>

      {/* Flagship Store Card */}
      <div className="bg-[#0C1F15] text-white p-8 sm:p-12 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-lg">
          <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">
            হেড অফিস ও ডিসপ্যাচ সেন্টার
          </span>
          <h3 className="font-serif text-2xl font-bold">আল উম্মাহ গার্মেন্টস ওয়্যারহাউজ</h3>
          <p className="text-xs sm:text-sm text-stone-300">
            {settings.address}
          </p>
          <p className="text-xs text-stone-400">
            হটলাইন: {settings.phone} · হোয়াটসঅ্যাপ: {settings.whatsappNumber}
          </p>
        </div>

        <a
          href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('আসসালামু আলাইকুম, আমি টি-শার্ট অর্ডার সংক্রান্ত তথ্য জানতে চাই।')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 bg-white text-stone-900 font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-stone-100 transition-colors whitespace-nowrap"
        >
          হোয়াটসঅ্যাপে যোগাযোগ
        </a>
      </div>

    </div>
  );
};
