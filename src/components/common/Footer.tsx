import React from 'react';
import { Phone, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface FooterProps {
  onNavigate: (path: string, params?: Record<string, string>) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { settings } = useStore();

  return (
    <footer className="bg-[#0C1F15] text-[#D8E6DE] pt-16 pb-12 border-t border-emerald-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-emerald-900/60">
          
          {/* Brand & Mission */}
          <div className="space-y-4">
            <div>
              <span className="font-serif text-2xl font-bold tracking-wider text-white uppercase block">
                AL UMMAH
              </span>
              <span className="text-[10px] tracking-[0.25em] text-emerald-400 uppercase block font-semibold">
                GARMENTS · T-SHIRTS
              </span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              বাংলাদেশের জন্য তৈরি প্রিমিয়াম ইসলামিক ড্রপ-শোল্ডার টি-শার্ট। শতভাগ কম্বড কটন, ২২০+ জিএসএম এবং শালীন মার্জিত নকশা।
            </p>
            <div className="pt-2 flex flex-col gap-2 text-xs text-stone-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{settings.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{settings.phone}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-wider text-stone-100 uppercase">
              টি-শার্ট কালেকশন
            </h4>
            <ul className="space-y-2 text-xs text-stone-300">
              <li>
                <button
                  onClick={() => onNavigate('/shop', { category: 'islamic-calligraphy' })}
                  className="hover:text-white transition-colors"
                >
                  সবর ও ইসলামিক ক্যালিগ্রাফি
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/shop', { category: 'heavyweight-oversized' })}
                  className="hover:text-white transition-colors"
                >
                  হেভিওয়েট ওভারসাইজড (২২০+ GSM)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/shop', { category: 'minimalist-signature' })}
                  className="hover:text-white transition-colors"
                >
                  মিনিমালিস্ট সিগনেচার টি-শার্ট
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/shop')}
                  className="hover:text-white transition-colors"
                >
                  সকল টি-শার্ট দেখুন
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-wider text-stone-100 uppercase">
              কাস্টমার কেয়ার
            </h4>
            <ul className="space-y-2 text-xs text-stone-300">
              <li>
                <button onClick={() => onNavigate('/track-order')} className="hover:text-white transition-colors">
                  পার্সেল ট্র্যাক করুন
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/about')} className="hover:text-white transition-colors">
                  আমাদের গল্প ও গুণগত মান
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/contact')} className="hover:text-white transition-colors">
                  যোগাযোগ ও সাধারণ জিজ্ঞাসা
                </button>
              </li>
              <li>
                <a
                  href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-300 transition-colors flex items-center gap-1"
                >
                  <span>হোয়াটসঅ্যাপ সাপোর্ট</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Admin & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-wider text-stone-100 uppercase">
              অ্যাডমিন পোর্টাল
            </h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              স্টোরের টি-শার্ট, স্টক, ডেলিভারি চার্জ এবং অর্ডার ম্যানেজমেন্টের জন্য সুরক্ষিত অ্যাডমিন প্যানেল।
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('/admin')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:text-white bg-black/40 border border-emerald-800 rounded hover:border-emerald-600 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>অ্যাডমিন ড্যাশবোর্ড</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sub-Footer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div>
            © {new Date().getFullYear()} AL UMMAH GARMENTS. সর্বস্বত্ব সংরক্ষিত।
          </div>
          <div className="flex items-center gap-4">
            <span>ক্যাশ অন ডেলিভারি</span>
            <span aria-hidden="true">·</span>
            <span>বিকাশ</span>
            <span aria-hidden="true">·</span>
            <span>নগদ</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
