import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ShoppingBag, Heart, Search, Menu, X, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string, params?: Record<string, string>) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, onNavigate }) => {
  const { cartCount, wishlist, setIsCartOpen, settings } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [showPromo, setShowPromo] = useState(true);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onNavigate('/shop', { q: searchInput.trim() });
      setIsSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: 'টি-শার্ট কালেকশন', path: '/shop' },
    { label: 'অর্ডার ট্র্যাক করুন', path: '/track-order' },
    { label: 'আমাদের পরিচিতি', path: '/about' },
    { label: 'যোগাযোগ ও সাপোর্ট', path: '/contact' },
  ];

  return (
    <>
      {/* Islamic Greeting & Bangladesh Delivery Banner (NO sparkle icons, NO pill badges) */}
      {showPromo && (
        <div className="bg-[#0C1F15] text-[#D8E6DE] text-xs py-2 px-4 border-b border-[#183B29] tracking-wide">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 text-[11px] sm:text-xs">
              <span className="font-serif italic text-emerald-300">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
              <span aria-hidden="true" className="text-emerald-700">·</span>
              <span>সারা বাংলাদেশে হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি</span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="hidden md:inline text-stone-300">হটলাইন: {settings.phone}</span>
              <button
                onClick={() => setShowPromo(false)}
                className="text-stone-400 hover:text-white px-1"
                aria-label="Dismiss banner"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Top Navigation (3-Zone Contract) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
          
          {/* Mobile Menu & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-stone-700 hover:text-stone-900 rounded-md"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Zone 1: Single text wordmark */}
            <button
              onClick={() => onNavigate('/')}
              className="text-left group cursor-pointer focus:outline-none"
            >
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-stone-900 uppercase block whitespace-nowrap">
                AL UMMAH
              </span>
              <span className="text-[10px] tracking-[0.25em] text-emerald-900 uppercase block -mt-1 font-sans font-semibold">
                GARMENTS · T-SHIRTS
              </span>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-stone-700">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => onNavigate(link.path)}
                className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                  currentPath === link.path
                    ? 'border-[#0C1F15] text-stone-950 font-semibold'
                    : 'border-transparent hover:text-stone-950 hover:border-stone-300'
                }`}
              >
                {link.label}
              </button>
            ))}

            <button
              onClick={() => onNavigate('/admin')}
              className="text-xs text-stone-500 hover:text-stone-900 flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 ml-2 py-1 px-2 rounded hover:bg-stone-100"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
              <span>Admin</span>
            </button>
          </nav>

          {/* Zone 3: Actions (Search, Wishlist, Shopping Bag - NO customer login) */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-full transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={() => onNavigate('/shop', { wishlist: 'true' })}
              className="relative p-2 text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-full transition-colors hidden sm:inline-flex"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 text-[10px] bg-stone-900 text-white rounded-full flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#0C1F15] hover:bg-[#153424] rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0"
              aria-label="Bag"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-300" />
              <span className="hidden sm:inline">ব্যাগ</span>
              <span className="bg-white text-stone-900 px-1.5 py-0.5 rounded text-[11px] font-bold">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        {/* Live Search Drawer */}
        {isSearchOpen && (
          <div className="border-t border-stone-200 bg-stone-50/95 px-4 py-4 sm:px-6">
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder="টি-শার্ট খুঁজুন (যেমন: Sabr, Tawakkul, ড্রপ শোল্ডার, কটন)..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-24 py-2.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 px-3 py-1.5 text-xs font-medium bg-[#0C1F15] text-white rounded-md hover:bg-[#1a382b]"
                >
                  সার্চ
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-200 bg-white px-4 py-4 space-y-3 animate-in slide-in-from-top-2">
            <div className="space-y-1">
              <button
                onClick={() => {
                  onNavigate('/');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-base font-medium text-stone-900 rounded-md hover:bg-stone-100"
              >
                হোম
              </button>
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => {
                    onNavigate(link.path);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-base font-medium text-stone-900 rounded-md hover:bg-stone-100"
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-stone-200 flex flex-col gap-2">
              <button
                onClick={() => {
                  onNavigate('/admin');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-50 rounded-md"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-800" />
                <span>অ্যাডমিন ড্যাশবোর্ড</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
