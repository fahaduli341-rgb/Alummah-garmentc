import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { MessageSquare, Phone, MapPin, Send, ChevronDown, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { settings, showToast } = useStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) return;
    setSubmitted(true);
    showToast('আপনার বার্তাটি পাওয়া গেছে! খুব শীঘ্রই যোগাযোগ করা হবে।');
    setName('');
    setPhone('');
    setMessage('');
  };

  const faqs = [
    {
      q: 'ডেলিভারি চার্জ কত এবং কতদিনে ডেলিভারি পাবো?',
      a: 'ঢাকা সিটির ভিতরে ডেলিভারি চার্জ ৳৭০ (২-৩ কার্যদিবস) এবং ঢাকার বাইরে সারা বাংলাদেশে ৳১৩০ (৩-৫ কার্যদিবস)। ২,০০০ টাকার বেশি অর্ডারে সারা দেশে ডেলিভারি সম্পূর্ণ ফ্রি।',
    },
    {
      q: 'পণ্য দেখে টাকা দেওয়ার সুযোগ আছে কি?',
      a: 'হ্যাঁ, আমাদের সব অর্ডারে ক্যাশ অন ডেলিভারি সুবিধা রয়েছে। ডেলিভারি ম্যানের সামনে পার্সেল চেক করে টাকা পরিশোধ করতে পারবেন।',
    },
    {
      q: 'সাইজ না মিললে কি পরিবর্তন বা এক্সচেঞ্জ করা যাবে?',
      a: 'অবশ্যই! পার্সেল পাওয়ার ৭ দিনের মধ্যে আমাদের হোয়াটসঅ্যাপ নাম্বারে জানালে আমরা দ্রুত সাইজ পরিবর্তন বা এক্সচেঞ্জ করে দেব।',
    },
    {
      q: 'টি-শার্টের কাপড় ও জিএসএম (GSM) কেমন?',
      a: 'আমাদের প্রতিটি টি-শার্ট ১০০% প্রিমিয়াম কম্বড কটন দিয়ে তৈরি, যার জিএসএম ২২০ থেকে ২৪০। এটি যথেষ্ট হেভিওয়েট এবং ড্রপ-শোল্ডার লুক প্রদান করে।',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-16">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest text-emerald-900 font-semibold">
          কাস্টমার কেয়ার
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
          যোগাযোগ ও সাপোর্ট
        </h1>
        <p className="text-xs sm:text-sm text-stone-600">
          সাইজ নির্বাচন, ডেলিভারি আপডেট বা যেকোনো প্রয়োজনে আমাদের সাথে সরাসরি যোগাযোগ করুন।
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-6">
          <h2 className="font-serif text-xl font-bold text-stone-900 border-b border-stone-100 pb-3">
            মেসেজ পাঠান
          </h2>

          {submitted ? (
            <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
              <h3 className="font-serif text-lg font-bold text-emerald-950">মেসেজ সফলভাবে পৌঁছেছে!</h3>
              <p className="text-xs text-emerald-800">
                আমাদের প্রতিনিধি খুব দ্রুত আপনার সাথে যোগাযোগ করবে, ইনশাআল্লাহ।
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-2 text-xs font-semibold text-emerald-900 underline"
              >
                আরেকটি বার্তা পাঠান
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-medium text-stone-700 block mb-1">আপনার নাম *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="আপনার নাম লিখুন"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="font-medium text-stone-700 block mb-1">মোবাইল নম্বর *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="font-medium text-stone-700 block mb-1">আপনার বার্তা *</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="আপনার বার্তা বা প্রশ্ন লিখুন..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#0C1F15] hover:bg-[#1a3d2c] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>মেসেজ পাঠান</span>
              </button>
            </form>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-emerald-900 text-white p-6 rounded-2xl space-y-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-800 rounded-lg">
                <MessageSquare className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold">সরাসরি হোয়াটসঅ্যাপ ডেস্কে</h3>
                <span className="text-xs text-emerald-200">দ্রুততম সময়ে অর্ডার ও সাইজ সাপোর্ট</span>
              </div>
            </div>
            <p className="text-xs text-emerald-100 leading-relaxed">
              যেকোনো টি-শার্টের ফেব্রিক বা সাইজ সম্পর্কে জানতে সরাসরি আমাদের প্রতিনিধিকে মেসেজ দিন।
            </p>
            <a
              href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('আসসালামু আলাইকুম, আমি আল উম্মাহ টি-শার্ট সম্পর্কে জানতে চাই।')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <span>হোয়াটসঅ্যাপে চ্যাট করুন</span>
            </a>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4 text-xs">
            <h3 className="font-serif text-base font-bold text-stone-900 border-b border-stone-100 pb-2">
              ঠিকানা ও তথ্য
            </h3>

            <div className="space-y-3 text-stone-700">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900 block">ওয়্যারহাউজ ও অফিস</strong>
                  <span>{settings.address}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900 block">হটলাইন নম্বর</strong>
                  <span>{settings.phone}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageSquare className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900 block">বিকাশ ও নগদ সাপোর্ট</strong>
                  <span>{settings.bkashNumber}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* FAQ */}
      <div className="space-y-6 max-w-4xl mx-auto pt-6 border-t border-stone-200">
        <div className="text-center space-y-2">
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            সাধারণ জিজ্ঞাসা (FAQ)
          </h2>
          <p className="text-xs text-stone-500">টি-শার্ট অর্ডার ও ডেলিভারি সম্পর্কিত সচরাচর প্রশ্নের উত্তর।</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs transition-colors"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between gap-4 text-xs sm:text-sm font-semibold text-stone-900 hover:bg-stone-50"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-stone-500 transition-transform ${
                    openFaq === idx ? 'rotate-180 text-stone-900' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-xs text-stone-600 leading-relaxed border-t border-stone-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
