import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { StorageService } from './lib/storage';
import { Product, Order } from './types';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { ToastContainer } from './components/common/ToastContainer';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { MessageSquare, CheckCircle, Package } from 'lucide-react';

function StoreApp() {
  const { settings, formatPrice } = useStore();

  const [currentPath, setCurrentPath] = useState<string>('/');
  const [routeParams, setRouteParams] = useState<Record<string, string>>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const [products, setProducts] = useState<Product[]>(() => StorageService.getProducts());
  const [categories, setCategories] = useState(() => StorageService.getCategories());

  const navigate = (path: string, params?: Record<string, string>) => {
    setCurrentPath(path);
    setRouteParams(params || {});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPath('/product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (order: Order) => {
    setCompletedOrder(order);
    setCurrentPath('/order-confirmed');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    // 1. Initial immediate live fetch from Firestore cloud
    StorageService.fetchLiveProductsFromFirestore().then((live) => {
      if (live) setProducts(live);
    });
    StorageService.fetchLiveCategoriesFromFirestore().then((live) => {
      if (live) setCategories(live);
    });

    // 2. Real-time live listener for Firestore cloud changes
    const unsubscribe = StorageService.subscribeToLiveUpdates({
      onProducts: (liveProducts) => {
        setProducts(liveProducts);
      },
      onCategories: (liveCategories) => {
        setCategories(liveCategories);
      },
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Admin View
  if (currentPath === '/admin') {
    return (
      <div className="min-h-screen bg-stone-100 font-sans">
        <ToastContainer />
        <AdminDashboard onNavigateHome={() => navigate('/')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA] text-[#191919] font-sans">
      <ToastContainer />
      <CartDrawer onNavigate={navigate} />
      <Header currentPath={currentPath} onNavigate={navigate} />

      <main className="flex-1">
        {currentPath === '/' && (
          <HomePage
            products={products}
            categories={categories}
            onSelectProduct={handleSelectProduct}
            onNavigate={navigate}
          />
        )}

        {currentPath === '/shop' && (
          <ShopPage
            products={products}
            categories={categories}
            initialCategory={routeParams.category}
            initialSearch={routeParams.q}
            initialWishlistOnly={routeParams.wishlist === 'true'}
            onSelectProduct={handleSelectProduct}
            onNavigate={navigate}
          />
        )}

        {currentPath === '/product' && selectedProduct && (
          <ProductDetailPage
            product={selectedProduct}
            allProducts={products}
            onSelectProduct={handleSelectProduct}
            onNavigate={navigate}
            onBack={() => navigate('/shop')}
          />
        )}

        {currentPath === '/checkout' && (
          <CheckoutPage
            initialCoupon={routeParams.coupon}
            onNavigate={navigate}
            onOrderSuccess={handleOrderSuccess}
          />
        )}

        {currentPath === '/order-confirmed' && completedOrder && (
          <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle className="w-10 h-10 text-emerald-700" />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-emerald-900 font-bold block">
                অর্ডার নিশ্চিত হয়েছে
              </span>
              <h1 className="font-serif text-3xl font-bold text-stone-900">
                জাযাকআল্লাহ খাইরান!
              </h1>
              <p className="text-xs sm:text-sm text-stone-600">
                আপনার অর্ডার <strong className="text-stone-900 font-mono">#{completedOrder.orderNumber}</strong> সফলভাবে গৃহীত হয়েছে। খুব শীঘ্রই আমাদের প্রতিনিধি কল করে কনফার্ম করবেন।
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-white p-6 rounded-xl border border-stone-200 text-left space-y-3 text-xs shadow-xs">
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">অর্ডার রেফারেন্স</span>
                <span className="font-mono font-bold text-stone-900">{completedOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">গ্রাহকের নাম ও ফোন</span>
                <span className="font-semibold text-stone-900">{completedOrder.customer.fullName} ({completedOrder.customer.phone})</span>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">ডেলিভারি ঠিকানা</span>
                <span className="text-stone-800 text-right">{completedOrder.customer.fullAddress}, {completedOrder.customer.district}</span>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">পেমেন্ট পদ্ধতি</span>
                <span className="uppercase font-semibold text-stone-900">{completedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-stone-900 pt-1">
                <span>মোট প্রদেয় বিল</span>
                <span className="tabular-nums">{formatPrice(completedOrder.total)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => navigate('/track-order', { orderId: completedOrder.orderNumber })}
                className="flex-1 py-3 bg-[#0C1F15] text-white text-xs font-semibold rounded-lg hover:bg-[#1a3d2c] flex items-center justify-center gap-2"
              >
                <Package className="w-4 h-4" />
                <span>পার্সেল ট্র্যাক করুন</span>
              </button>
              <button
                onClick={() => navigate('/shop')}
                className="flex-1 py-3 border border-stone-300 text-stone-800 text-xs font-semibold rounded-lg hover:bg-stone-100"
              >
                আরও টি-শার্ট দেখুন
              </button>
            </div>
          </div>
        )}

        {currentPath === '/track-order' && (
          <OrderTrackingPage
            initialOrderId={routeParams.orderId}
            onNavigate={navigate}
          />
        )}

        {currentPath === '/about' && <AboutPage />}
        {currentPath === '/contact' && <ContactPage />}
      </main>

      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('আসসালামু আলাইকুম আল উম্মাহ গার্মেন্টস, আমি টি-শার্ট অর্ডার সংক্রান্ত তথ্য জানতে চাই।')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-40 bg-[#25D366] hover:bg-[#20ba5a] text-white p-3.5 rounded-full shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 group"
        aria-label="WhatsApp"
      >
        <MessageSquare className="w-5 h-5 fill-white" />
        <span className="text-xs font-bold max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300">
          হোয়াটসঅ্যাপ সহায়তা
        </span>
      </a>

      <Footer onNavigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <StoreApp />
    </StoreProvider>
  );
}
