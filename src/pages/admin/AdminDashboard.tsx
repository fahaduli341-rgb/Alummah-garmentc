import React, { useState, useEffect } from 'react';
import { Product, Category, Order, OrderStatus, Coupon } from '../../types';
import { StorageService } from '../../lib/storage';
import { useStore } from '../../context/StoreContext';
import { checkFirestoreConnection } from '../../lib/firebase';
import {
  Package,
  Layers,
  ShoppingBag,
  Settings,
  Database,
  Plus,
  Trash2,
  Edit2,
  TrendingUp,
  CheckCircle,
  Eye,
  LogOut,
  RefreshCw,
  ExternalLink,
  Lock,
  KeyRound,
  Tag,
  X,
  Upload,
  AlertTriangle,
  ImageIcon,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigateHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateHome }) => {
  const { settings, updateSettings, formatPrice, showToast } = useStore();

  // Admin Auth Gate State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('alummah_admin_session') === 'active';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Tabs
  const [activeTab, setActiveTab] = useState<
    'overview' | 'banner' | 'products' | 'categories' | 'orders' | 'coupons' | 'settings' | 'security' | 'firebase'
  >('overview');

  // Data states
  const [products, setProducts] = useState<Product[]>(() => StorageService.getProducts());
  const [categories, setCategories] = useState<Category[]>(() => StorageService.getCategories());
  const [orders, setOrders] = useState<Order[]>(() => StorageService.getOrders());
  const [coupons, setCoupons] = useState<Coupon[]>(() => StorageService.getCoupons());

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Delete Confirmation Modal State (Reliable in-app replacement for window.confirm)
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'product' | 'order' | 'category' | 'coupon';
    id: string;
    title: string;
    subtitle?: string;
  } | null>(null);

  // Modals & form states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Banner & Stats Editor State (Supports changing hero pic and the numbers above it)
  const [bannerForm, setBannerForm] = useState({
    heroImage: settings.heroImage || '/src/assets/images/hero_islamic_tshirt_banner_1791712348157.jpg',
    heroBadge: settings.heroBadge || 'ড্রপ-শোল্ডার এডিশন',
    heroTitle: settings.heroTitle || 'সবর (Sabr) ও তাওয়াক্কুল (Tawakkul) সিরিজ',
    heroMainHeading: settings.heroMainHeading || 'মার্জিত ইসলামিক ক্যালিগ্রাফি ও খাঁটি কটনের টি-শার্ট।',
    heroSubHeading: settings.heroSubHeading || '১০০% প্রিমিয়াম কম্বড কটন, ২২০-২৪০ জিএসএম হেভিওয়েট ড্রপ-শোল্ডার কাটিং। শালীন ও রুচিশীল সবর, তাওয়াক্কুল ও মিনিমাল ইসলামিক ক্যালিগ্রাফি নকশায় তৈরি।',
    stat1Number: settings.stat1Number || '২২০+ GSM',
    stat1Label: settings.stat1Label || '১০০% কম্বড কটন',
    stat2Number: settings.stat2Number || 'ক্যাশ অন',
    stat2Label: settings.stat2Label || 'সারা দেশে ডেলিভারি',
    stat3Number: settings.stat3Number || '৭ দিন',
    stat3Label: settings.stat3Label || 'সাইজ এক্সচেঞ্জ সুবিধা',
  });

  useEffect(() => {
    setBannerForm({
      heroImage: settings.heroImage || '/src/assets/images/hero_islamic_tshirt_banner_1791712348157.jpg',
      heroBadge: settings.heroBadge || 'ড্রপ-শোল্ডার এডিশন',
      heroTitle: settings.heroTitle || 'সবর (Sabr) ও তাওয়াক্কুল (Tawakkul) সিরিজ',
      heroMainHeading: settings.heroMainHeading || 'মার্জিত ইসলামিক ক্যালিগ্রাফি ও খাঁটি কটনের টি-শার্ট।',
      heroSubHeading: settings.heroSubHeading || '১০০% প্রিমিয়াম কম্বড কটন, ২২০-২৪০ জিএসএম হেভিওয়েট ড্রপ-শোল্ডার কাটিং। শালীন ও রুচিশীল সবর, তাওয়াক্কুল ও মিনিমাল ইসলামিক ক্যালিগ্রাফি নকশায় তৈরি।',
      stat1Number: settings.stat1Number || '২২০+ GSM',
      stat1Label: settings.stat1Label || '১০০% কম্বড কটন',
      stat2Number: settings.stat2Number || 'ক্যাশ অন',
      stat2Label: settings.stat2Label || 'সারা দেশে ডেলিভারি',
      stat3Number: settings.stat3Number || '৭ দিন',
      stat3Label: settings.stat3Label || 'সাইজ এক্সচেঞ্জ সুবিধা',
    });
  }, [settings]);

  const handleBannerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        setBannerForm((prev) => ({ ...prev, heroImage: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBannerAndStats = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      ...settings,
      ...bannerForm,
    });
    showToast('ব্যানার ছবি ও উপরের সংখ্যা সফলভাবে সেভ ও লাইভ আপডেট হয়েছে!');
  };

  const PRESET_BANNER_IMAGES = [
    {
      name: 'ইসলামিক ড্রপ-শোল্ডার মডেল (অফিশিয়াল)',
      url: '/src/assets/images/hero_islamic_tshirt_banner_1791712348157.jpg',
    },
    {
      name: 'সবর (Sabr) গোল্ড ক্যালিগ্রাফি টি-শার্ট',
      url: '/src/assets/images/tshirt_sabr_calligraphy_1791712281050.jpg',
    },
    {
      name: 'তাওয়াক্কুল (Tawakkul) অলিভ গ্রিন টি-শার্ট',
      url: '/src/assets/images/tshirt_tawakkul_green_1791712291944.jpg',
    },
    {
      name: 'আল-উম্মাহ লাইট ক্রিম ওভারসাইজড',
      url: '/src/assets/images/tshirt_al_ummah_cream_1791712303018.jpg',
    },
  ];

  // Firebase test state
  const [firebaseStatus, setFirebaseStatus] = useState<{ testing: boolean; message?: string; success?: boolean }>({
    testing: false,
  });

  // Filters
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  useEffect(() => {
    runFirebaseTest();
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (StorageService.verifyAdminPassword(passwordInput)) {
      setIsAuthenticated(true);
      localStorage.setItem('alummah_admin_session', 'active');
      setAuthError('');
      showToast('অ্যাডমিন প্যানেলে স্বাগতম।');
    } else {
      setAuthError('ভুল পাসওয়ার্ড। দয়া করে সঠিক অ্যাডমিন পাসওয়ার্ড প্রদান করুন।');
    }
  };

  const handleAdminLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('alummah_admin_session');
    showToast('অ্যাডমিন প্যানেল থেকে সাইন আউট করা হয়েছে।', 'info');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!StorageService.verifyAdminPassword(oldPassword)) {
      showToast('বর্তমান পাসওয়ার্ড সঠিক নয়!', 'error');
      return;
    }
    if (newPassword.length < 4) {
      showToast('নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('নতুন পাসওয়ার্ড দুটি মিলছে না!', 'error');
      return;
    }

    StorageService.updateAdminPassword(newPassword);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('অ্যাডমিন পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে।');
  };

  const runFirebaseTest = async () => {
    setFirebaseStatus({ testing: true });
    const res = await checkFirestoreConnection();
    setFirebaseStatus({
      testing: false,
      success: res.success,
      message: res.message,
    });
  };

  // Metrics
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const lowStockProducts = products.filter((p) => p.stock <= 10);

  // EXECUTE DELETE HANDLER
  const confirmExecuteDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'product') {
      StorageService.deleteProduct(deleteTarget.id);
      setProducts(StorageService.getProducts());
      showToast(`টি-শার্ট "${deleteTarget.title}" সফলভাবে ডিলিট করা হয়েছে।`);
    } else if (deleteTarget.type === 'order') {
      StorageService.deleteOrder(deleteTarget.id);
      setOrders(StorageService.getOrders());
      if (selectedOrder?.id === deleteTarget.id) {
        setSelectedOrder(null);
      }
      showToast(`অর্ডার "${deleteTarget.title}" মুছে ফেলা হয়েছে।`);
    } else if (deleteTarget.type === 'category') {
      StorageService.deleteCategory(deleteTarget.id);
      setCategories(StorageService.getCategories());
      showToast(`ক্যাটাগরি "${deleteTarget.title}" ডিলিট করা হয়েছে।`);
    } else if (deleteTarget.type === 'coupon') {
      StorageService.deleteCoupon(deleteTarget.id);
      setCoupons(StorageService.getCoupons());
      showToast(`কুপন "${deleteTarget.title}" ডিলিট করা হয়েছে।`);
    }

    setDeleteTarget(null);
  };

  // OPEN PRODUCT MODAL
  const openProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductImages(product.images && product.images.length > 0 ? [...product.images] : ['/src/assets/images/tshirt_sabr_calligraphy_1791712281050.jpg']);
    } else {
      setEditingProduct(null);
      setProductImages(['/src/assets/images/tshirt_sabr_calligraphy_1791712281050.jpg']);
    }
    setNewImageUrl('');
    setIsProductModalOpen(true);
  };

  const handleAddImageToProduct = () => {
    if (!newImageUrl.trim()) return;
    setProductImages((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const handleRemoveImageFromProduct = (indexToRemove: number) => {
    setProductImages((prev) => {
      const filtered = prev.filter((_, i) => i !== indexToRemove);
      return filtered.length > 0 ? filtered : ['/src/assets/images/tshirt_sabr_calligraphy_1791712281050.jpg'];
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        setProductImages((prev) => [...prev, result]);
      }
    };
    reader.readAsDataURL(file);
  };

  // PRODUCTS CRUD
  const handleSaveProduct = (productData: Partial<Product>) => {
    const isNew = !editingProduct;
    const now = new Date().toISOString();

    const finalImages = productImages.length > 0
      ? productImages
      : ['/src/assets/images/tshirt_sabr_calligraphy_1791712281050.jpg'];

    const productToSave: Product = {
      id: editingProduct?.id || `prod-ts-${Date.now()}`,
      name: productData.name || 'Untitled T-Shirt',
      slug: (productData.name || 'tshirt').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: productData.description || '',
      shortDescription: productData.shortDescription || '',
      price: Number(productData.price) || 0,
      originalPrice: productData.originalPrice ? Number(productData.originalPrice) : undefined,
      discountPercentage: productData.originalPrice && productData.price
        ? Math.round(((Number(productData.originalPrice) - Number(productData.price)) / Number(productData.originalPrice)) * 100)
        : 0,
      category: productData.category || categories[0]?.slug || 'islamic-calligraphy',
      gsm: productData.gsm || '230 GSM',
      fit: (productData.fit as any) || 'Oversized Drop-Shoulder',
      images: finalImages,
      sizes: productData.sizes && productData.sizes.length > 0 ? productData.sizes : ['M (Chest 40")', 'L (Chest 42")', 'XL (Chest 44")', 'XXL (Chest 46")'],
      colors: productData.colors && productData.colors.length > 0
        ? productData.colors
        : [{ name: 'Black', hex: '#111111' }],
      stock: Number(productData.stock) ?? 20,
      inStock: (Number(productData.stock) ?? 20) > 0,
      isFeatured: Boolean(productData.isFeatured),
      isNewArrival: Boolean(productData.isNewArrival),
      isBestSeller: Boolean(productData.isBestSeller),
      sku: productData.sku || `AUG-TS-${Math.floor(100 + Math.random() * 900)}`,
      fabric: productData.fabric || '100% Combed Cotton (230 GSM)',
      careInstructions: productData.careInstructions || ['ঠাণ্ডা পানিতে ধুয়ে নিন', 'প্রিন্টে সরাসরি ইস্ত্রি করবেন না'],
      createdAt: editingProduct?.createdAt || now,
    };

    StorageService.saveProduct(productToSave);
    setProducts(StorageService.getProducts());
    setIsProductModalOpen(false);
    setEditingProduct(null);
    showToast(`টি-শার্ট "${productToSave.name}" ${isNew ? 'যোগ' : 'আপডেট'} করা হয়েছে।`);
  };

  const handleUpdateStock = (productId: string, delta: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const newStock = Math.max(0, prod.stock + delta);
    const updated = { ...prod, stock: newStock, inStock: newStock > 0 };
    StorageService.saveProduct(updated);
    setProducts(StorageService.getProducts());
  };

  // CATEGORIES CRUD
  const openCategoryModal = (cat?: Category) => {
    if (cat) {
      setEditingCategory(cat);
    } else {
      setEditingCategory(null);
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (catData: Partial<Category>) => {
    const isNew = !editingCategory;
    const catToSave: Category = {
      id: editingCategory?.id || `cat-${Date.now()}`,
      name: catData.name || 'নতুন ক্যাটাগরি',
      slug: (catData.slug || catData.name || 'category').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: catData.description || '',
      image: catData.image || '/src/assets/images/category_calligraphy_tshirts_1791712297126.jpg',
      productCount: editingCategory?.productCount || 0,
    };
    StorageService.saveCategory(catToSave);
    setCategories(StorageService.getCategories());
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    showToast(`ক্যাটাগরি "${catToSave.name}" ${isNew ? 'যোগ' : 'আপডেট'} করা হয়েছে।`);
  };

  // COUPONS CRUD
  const handleSaveCoupon = (couponData: Partial<Coupon>) => {
    if (!couponData.code) return;
    const newCoupon: Coupon = {
      id: `cpn-${Date.now()}`,
      code: couponData.code.trim().toUpperCase(),
      discountPercentage: Number(couponData.discountPercentage) || 10,
      minSpend: couponData.minSpend ? Number(couponData.minSpend) : undefined,
      isActive: true,
      description: couponData.description || '',
    };
    StorageService.saveCoupon(newCoupon);
    setCoupons(StorageService.getCoupons());
    setIsCouponModalOpen(false);
    showToast(`কুপন "${newCoupon.code}" সফলভাবে সেভ হয়েছে।`);
  };

  // ORDERS STATUS
  const handleOrderStatusChange = (orderId: string, newStatus: OrderStatus, trackingNo?: string, courier?: string) => {
    const updated = StorageService.updateOrderStatus(orderId, newStatus, undefined, trackingNo, courier);
    if (updated) {
      setOrders(StorageService.getOrders());
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }
      showToast(`অর্ডার স্ট্যাটাস আপডেট: "${newStatus}"`);
    }
  };

  // Secure Admin Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-stone-100">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-stone-200 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-[#0C1F15] text-white flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-[11px] uppercase tracking-widest text-emerald-950 font-bold block">
              সিকিউর অ্যাডমিন অ্যাক্সেস
            </span>
            <h1 className="font-serif text-2xl font-bold text-stone-900">
              AL UMMAH GARMENTS
            </h1>
            <p className="text-xs text-stone-500">
              দয়া করে আপনার অ্যাডমিন পাসওয়ার্ড প্রদান করুন।
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
              {authError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            <div>
              <label className="font-medium text-stone-700 block mb-1">অ্যাডমিন পাসওয়ার্ড</label>
              <input
                type="password"
                required
                autoFocus
                placeholder="গোপন পাসওয়ার্ড লিখুন"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-stone-900 text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#0C1F15] hover:bg-[#183a28] text-white font-semibold rounded-lg shadow-sm transition-colors text-xs"
            >
              ড্যাশবোর্ডে প্রবেশ করুন
            </button>
          </form>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={onNavigateHome}
              className="text-xs text-stone-500 hover:text-stone-800"
            >
              ← স্টোরফ্রন্টে ফিরে যান
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans">
      {/* Top Bar */}
      <header className="bg-[#0C1F15] text-white px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-emerald-950">
        <div className="flex items-center gap-3">
          <button onClick={onNavigateHome} className="font-serif font-bold text-lg text-white hover:text-emerald-200">
            AL UMMAH GARMENTS
          </button>
          <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded font-mono border border-emerald-800">
            ADMIN PANEL
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <button
            onClick={onNavigateHome}
            className="hidden sm:flex items-center gap-1.5 text-stone-300 hover:text-white"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>লাইভ স্টোর দেখুন</span>
          </button>
          <button
            onClick={handleAdminLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-stone-200 rounded border border-emerald-800 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>লগ আউট</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-300 text-xs font-semibold">
          {[
            { id: 'overview', label: 'ওভারভিউ ও সেলস', icon: TrendingUp },
            { id: 'banner', label: 'ব্যানার ছবি ও উপরের সংখ্যা', icon: ImageIcon },
            { id: 'products', label: `টি-শার্ট ইনভেন্টরি (${products.length})`, icon: Package },
            { id: 'orders', label: `অর্ডার সমূহ (${orders.length})`, icon: ShoppingBag },
            { id: 'categories', label: `ক্যাটাগরি (${categories.length})`, icon: Layers },
            { id: 'coupons', label: `কুপন ও ডিসকাউন্ট (${coupons.length})`, icon: Tag },
            { id: 'settings', label: 'কন্টাক্ট, লোকেশন ও ডেলিভারি ফি', icon: Settings },
            { id: 'security', label: 'পাসওয়ার্ড পরিবর্তন', icon: KeyRound },
            { id: 'firebase', label: 'ফায়ারবেস ক্লাউড ডাটাবেস', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-1">
                <span className="text-xs text-stone-500 font-medium">মোট বিক্রয় (Revenue)</span>
                <p className="font-serif text-2xl font-bold text-stone-900 tabular-nums">
                  {formatPrice(totalRevenue)}
                </p>
                <span className="text-[11px] text-emerald-700 font-medium">সম্পূর্ণ লাইভ অর্ডার থেকে হিসাবকৃত</span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-1">
                <span className="text-xs text-stone-500 font-medium">পেন্ডিং অর্ডার</span>
                <p className="font-serif text-2xl font-bold text-amber-700 tabular-nums">
                  {pendingOrdersCount}
                </p>
                <span className="text-[11px] text-stone-500">অনুমোদনের অপেক্ষায়</span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-1">
                <span className="text-xs text-stone-500 font-medium">মোট টি-শার্ট</span>
                <p className="font-serif text-2xl font-bold text-stone-900 tabular-nums">
                  {products.length}
                </p>
                <span className="text-[11px] text-stone-500">স্টোর ক্যাটালগে একটিভ</span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-1">
                <span className="text-xs text-stone-500 font-medium">লো স্টক অ্যালার্ট</span>
                <p className="font-serif text-2xl font-bold text-rose-700 tabular-nums">
                  {lowStockProducts.length}
                </p>
                <span className="text-[11px] text-rose-600 font-medium">১০ টির কম অবশিষ্ট</span>
              </div>
            </div>

            {/* Quick Banner & Stats Shortcut Card */}
            <div className="bg-gradient-to-r from-[#0C1F15] to-[#183a28] text-white p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-emerald-300" />
                  <h3 className="font-serif font-bold text-base text-white">হোমপেজ ব্যানার ছবি ও ৩টি সংখ্যা পরিবর্তন</h3>
                </div>
                <p className="text-xs text-emerald-200/80">
                  বর্তমান ব্যানার: "{bannerForm.heroTitle}" · সংখ্যা: {bannerForm.stat1Number}, {bannerForm.stat2Number}, {bannerForm.stat3Number}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('banner')}
                className="px-4 py-2 bg-white text-stone-900 text-xs font-bold rounded-lg hover:bg-stone-100 transition-colors shrink-0 flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span>ব্যানার ও সংখ্যা এডিট করুন</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="font-serif text-base font-bold text-stone-900">সাম্প্রতিক অর্ডার সমূহ</h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-emerald-800 font-semibold hover:underline"
                >
                  সব অর্ডার দেখুন
                </button>
              </div>

              {orders.length === 0 ? (
                <p className="text-xs text-stone-500 py-6 text-center">এখনও কোনো অর্ডার আসেনি। কাস্টমার অর্ডার করলে এখানে প্রদর্শিত হবে।</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-stone-50 text-stone-600">
                        <th className="p-2.5">অর্ডার #</th>
                        <th className="p-2.5">গ্রাহক</th>
                        <th className="p-2.5">মোবাইল</th>
                        <th className="p-2.5">টি-শার্ট</th>
                        <th className="p-2.5">বিল</th>
                        <th className="p-2.5">পদ্ধতি</th>
                        <th className="p-2.5">স্ট্যাটাস</th>
                        <th className="p-2.5 text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {orders.slice(0, 5).map((ord) => (
                        <tr key={ord.id} className="hover:bg-stone-50/80">
                          <td className="p-2.5 font-mono font-bold text-stone-900">{ord.orderNumber}</td>
                          <td className="p-2.5 font-medium text-stone-800">{ord.customer.fullName}</td>
                          <td className="p-2.5 text-stone-600">{ord.customer.phone}</td>
                          <td className="p-2.5 text-stone-500">{ord.items.length} টি</td>
                          <td className="p-2.5 font-bold tabular-nums text-stone-900">{formatPrice(ord.total)}</td>
                          <td className="p-2.5 uppercase font-medium text-stone-700">{ord.paymentMethod}</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold capitalize bg-stone-100 text-stone-800">
                              {ord.status}
                            </span>
                          </td>
                          <td className="p-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(ord)}
                              className="p-1 text-stone-600 hover:text-stone-900"
                              title="বিস্তারিত"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: BANNER & TOP STATS (Dedicated system to change hero image & top numbers) */}
        {activeTab === 'banner' && (
          <div className="space-y-8">
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
                <div>
                  <h2 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-emerald-800" />
                    <span>হোমপেজ ব্যানার ছবি ও উপরের ৩টি সংখ্যা পরিবর্তন</span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    এখান থেকে হোমপেজের প্রধান ক্যাম্পেইন ছবি, টাইটেল এবং উপরের ৩টি সংখ্যা/হাইলাইটস পরিবর্তন করুন।
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSaveBannerAndStats}
                  className="px-5 py-2.5 bg-[#0C1F15] hover:bg-[#183a28] text-white font-semibold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-2 self-start sm:self-auto"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>পরিবর্তন সংরক্ষণ করুন</span>
                </button>
              </div>

              <form onSubmit={handleSaveBannerAndStats} className="space-y-8 text-xs">
                {/* SECTION 1: TOP 3 HIGHLIGHTS / STATS */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center text-xs">১</span>
                    <span>উপরের ৩টি সংখ্যা ও হাইলাইটস (Top 3 Highlights/Numbers)</span>
                  </div>
                  <p className="text-stone-500 text-[11px]">
                    হোমপেজে ব্যানারের ঠিক উপরে বা পাশে ৩টি প্রধান ট্রাস্ট ব্যাজ প্রদর্শিত হয়। আপনি যেকোনো সংখ্যা ও বিবরণ লিখতে পারেন।
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Stat 1 */}
                    <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                      <span className="font-semibold text-stone-800 text-xs block">১ম হাইলাইট / সংখ্যা</span>
                      <div>
                        <label className="text-[11px] font-medium text-stone-600 block mb-1">বড় সংখ্যা বা টেক্সট</label>
                        <input
                          type="text"
                          value={bannerForm.stat1Number}
                          onChange={(e) => setBannerForm({ ...bannerForm, stat1Number: e.target.value })}
                          placeholder="২২০+ GSM"
                          className="w-full p-2 bg-white border border-stone-300 rounded font-serif font-bold text-sm text-stone-900"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-stone-600 block mb-1">ছোট বিবরণ / লেবেল</label>
                        <input
                          type="text"
                          value={bannerForm.stat1Label}
                          onChange={(e) => setBannerForm({ ...bannerForm, stat1Label: e.target.value })}
                          placeholder="১০০% কম্বড কটন"
                          className="w-full p-2 bg-white border border-stone-300 rounded text-xs text-stone-700"
                        />
                      </div>
                    </div>

                    {/* Stat 2 */}
                    <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                      <span className="font-semibold text-stone-800 text-xs block">২য় হাইলাইট / সংখ্যা</span>
                      <div>
                        <label className="text-[11px] font-medium text-stone-600 block mb-1">বড় সংখ্যা বা টেক্সট</label>
                        <input
                          type="text"
                          value={bannerForm.stat2Number}
                          onChange={(e) => setBannerForm({ ...bannerForm, stat2Number: e.target.value })}
                          placeholder="ক্যাশ অন"
                          className="w-full p-2 bg-white border border-stone-300 rounded font-serif font-bold text-sm text-stone-900"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-stone-600 block mb-1">ছোট বিবরণ / লেবেল</label>
                        <input
                          type="text"
                          value={bannerForm.stat2Label}
                          onChange={(e) => setBannerForm({ ...bannerForm, stat2Label: e.target.value })}
                          placeholder="সারা দেশে ডেলিভারি"
                          className="w-full p-2 bg-white border border-stone-300 rounded text-xs text-stone-700"
                        />
                      </div>
                    </div>

                    {/* Stat 3 */}
                    <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                      <span className="font-semibold text-stone-800 text-xs block">৩য় হাইলাইট / সংখ্যা</span>
                      <div>
                        <label className="text-[11px] font-medium text-stone-600 block mb-1">বড় সংখ্যা বা টেক্সট</label>
                        <input
                          type="text"
                          value={bannerForm.stat3Number}
                          onChange={(e) => setBannerForm({ ...bannerForm, stat3Number: e.target.value })}
                          placeholder="৭ দিন"
                          className="w-full p-2 bg-white border border-stone-300 rounded font-serif font-bold text-sm text-stone-900"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-stone-600 block mb-1">ছোট বিবরণ / লেবেল</label>
                        <input
                          type="text"
                          value={bannerForm.stat3Label}
                          onChange={(e) => setBannerForm({ ...bannerForm, stat3Label: e.target.value })}
                          placeholder="সাইজ এক্সচেঞ্জ সুবিধা"
                          className="w-full p-2 bg-white border border-stone-300 rounded text-xs text-stone-700"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: HERO BANNER IMAGE & TEXTS */}
                <div className="space-y-4 pt-4 border-t border-stone-200">
                  <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center text-xs">২</span>
                    <span>প্রধান ব্যানার ছবি ও টাইটেল (Hero Banner Picture & Titles)</span>
                  </div>
                  <p className="text-stone-500 text-[11px]">
                    মোবাইল ও কম্পিউটারের হোমপেজে যে ব্যানার ছবি ও লেখা দেখা যায় তা এখান থেকে পরিবর্তন করুন।
                  </p>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left: Inputs */}
                    <div className="lg:col-span-7 space-y-4">
                      {/* Image Source & Upload */}
                      <div className="space-y-2">
                        <label className="font-semibold text-stone-800 block">ব্যানার ছবি নির্ধারণ করুন</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={bannerForm.heroImage}
                            onChange={(e) => setBannerForm({ ...bannerForm, heroImage: e.target.value })}
                            placeholder="ছবির লিংক (URL) লিখুন"
                            className="flex-1 p-2.5 border border-stone-300 rounded text-xs font-mono"
                          />
                          <label className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded border border-stone-300 cursor-pointer flex items-center gap-1.5 font-semibold text-xs shrink-0 transition-colors">
                            <Upload className="w-4 h-4 text-stone-600" />
                            <span>আপলোড ছবি</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleBannerImageUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Presets */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] text-stone-500 font-medium block">
                          অথবা তৈরি হাই-রেজ্যুলুশন ইসলামিক ব্যানার থেকে বেছে নিন:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {PRESET_BANNER_IMAGES.map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setBannerForm({ ...bannerForm, heroImage: preset.url })}
                              className={`p-1.5 rounded-lg border text-left flex flex-col items-center gap-1.5 transition-all ${
                                bannerForm.heroImage === preset.url
                                  ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20'
                                  : 'border-stone-200 hover:border-stone-300 bg-white'
                              }`}
                            >
                              <img
                                src={preset.url}
                                alt={preset.name}
                                className="w-full h-16 object-cover rounded"
                              />
                              <span className="text-[10px] text-stone-700 font-medium line-clamp-1 text-center w-full">
                                {preset.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Banner Titles */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="font-medium text-stone-700 block mb-1">
                            ব্যানার ব্যাজ টেক্সট (ছোট লেখা)
                          </label>
                          <input
                            type="text"
                            value={bannerForm.heroBadge}
                            onChange={(e) => setBannerForm({ ...bannerForm, heroBadge: e.target.value })}
                            placeholder="ড্রপ-শোল্ডার এডিশন"
                            className="w-full p-2 border border-stone-300 rounded"
                          />
                        </div>

                        <div>
                          <label className="font-medium text-stone-700 block mb-1">
                            ব্যানার ছবির টাইটেল
                          </label>
                          <input
                            type="text"
                            value={bannerForm.heroTitle}
                            onChange={(e) => setBannerForm({ ...bannerForm, heroTitle: e.target.value })}
                            placeholder="সবর (Sabr) ও তাওয়াক্কুল (Tawakkul) সিরিজ"
                            className="w-full p-2 border border-stone-300 rounded font-semibold"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="font-medium text-stone-700 block mb-1">
                            হোমপেজের প্রধান শিরোনাম (H1 Heading)
                          </label>
                          <input
                            type="text"
                            value={bannerForm.heroMainHeading}
                            onChange={(e) => setBannerForm({ ...bannerForm, heroMainHeading: e.target.value })}
                            placeholder="মার্জিত ইসলামিক ক্যালিগ্রাফি ও খাঁটি কটনের টি-শার্ট।"
                            className="w-full p-2 border border-stone-300 rounded text-sm font-serif font-bold"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="font-medium text-stone-700 block mb-1">
                            হোমপেজের উপ-শিরোনাম / বিবরণ (Subheading)
                          </label>
                          <textarea
                            rows={3}
                            value={bannerForm.heroSubHeading}
                            onChange={(e) => setBannerForm({ ...bannerForm, heroSubHeading: e.target.value })}
                            placeholder="১০০% প্রিমিয়াম কম্বড কটন, ২২০-২৪০ জিএসএম হেভিওয়েট ড্রপ-শোল্ডার কাটিং..."
                            className="w-full p-2 border border-stone-300 rounded"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right: Live Visual Preview */}
                    <div className="lg:col-span-5 space-y-3">
                      <span className="font-semibold text-stone-800 text-xs block">
                        লাইভ প্রিভিউ (কাস্টমাররা যেমন দেখবে)
                      </span>

                      {/* Mockup Container */}
                      <div className="bg-[#0C1F15] p-4 rounded-2xl border border-emerald-950 shadow-lg space-y-4 text-white">
                        {/* 3 Stats Live Preview */}
                        <div className="grid grid-cols-3 gap-2 pb-3 border-b border-emerald-900/60 text-center">
                          <div>
                            <span className="block text-sm font-bold font-serif text-white">{bannerForm.stat1Number}</span>
                            <span className="text-[9px] text-stone-400">{bannerForm.stat1Label}</span>
                          </div>
                          <div>
                            <span className="block text-sm font-bold font-serif text-white">{bannerForm.stat2Number}</span>
                            <span className="text-[9px] text-stone-400">{bannerForm.stat2Label}</span>
                          </div>
                          <div>
                            <span className="block text-sm font-bold font-serif text-white">{bannerForm.stat3Number}</span>
                            <span className="text-[9px] text-stone-400">{bannerForm.stat3Label}</span>
                          </div>
                        </div>

                        {/* Banner Image Card Live Preview */}
                        <div className="relative rounded-xl overflow-hidden aspect-[4/5] bg-stone-900 border border-emerald-900">
                          <img
                            src={bannerForm.heroImage}
                            alt="Banner Preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4">
                            <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold block">
                              {bannerForm.heroBadge}
                            </span>
                            <p className="text-sm font-serif font-bold text-white mt-0.5">
                              {bannerForm.heroTitle}
                            </p>
                          </div>
                        </div>

                        <p className="text-[10px] text-stone-400 text-center">
                          * সংরক্ষণ করার সাথে সাথেই লাইভ ওয়েবসাইটে পরিবর্তন হয়ে যাবে।
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t border-stone-200 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#0C1F15] hover:bg-[#183a28] text-white font-semibold text-xs rounded-lg shadow-md transition-colors flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>সকল পরিবর্তন সংরক্ষণ ও লাইভ আপডেট করুন</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS */}
        {activeTab === 'products' && (
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-stone-900">টি-শার্ট ইনভেন্টরি ও স্টক</h2>
                <p className="text-xs text-stone-500">নতুন টি-শার্ট যোগ করুন, ফটো পরিবর্তন করুন, স্টক আপডেট করুন অথবা ডিলিট করুন।</p>
              </div>

              <button
                type="button"
                onClick={() => openProductModal()}
                className="px-4 py-2 bg-[#0C1F15] text-white text-xs font-semibold rounded-lg hover:bg-[#183a28] transition-colors flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>নতুন টি-শার্ট যোগ করুন</span>
              </button>
            </div>

            {/* Filter */}
            <div className="flex flex-col sm:flex-row gap-3 text-xs">
              <input
                type="text"
                placeholder="টি-শার্টের নাম বা SKU দিয়ে খুঁজুন..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="p-2 border border-stone-300 rounded-lg flex-1"
              />
              <select
                value={productCatFilter}
                onChange={(e) => setProductCatFilter(e.target.value)}
                className="p-2 border border-stone-300 rounded-lg"
              >
                <option value="all">সব ক্যাটাগরি</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-stone-50 text-stone-600">
                    <th className="p-3">টি-শার্ট</th>
                    <th className="p-3">জিএসএম ও ফিট</th>
                    <th className="p-3">মূল্য</th>
                    <th className="p-3">স্টক</th>
                    <th className="p-3 text-right">অ্যাকশন (এডিট / ডিলিট)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {products
                    .filter((p) => {
                      if (productCatFilter !== 'all' && p.category !== productCatFilter) return false;
                      if (productSearch.trim()) {
                        const q = productSearch.toLowerCase();
                        return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
                      }
                      return true;
                    })
                    .map((prod) => (
                      <tr key={prod.id} className="hover:bg-stone-50/60">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.images[0]}
                              alt={prod.name}
                              referrerPolicy="no-referrer"
                              className="w-10 h-12 object-cover rounded bg-stone-100 border border-stone-200 shrink-0"
                            />
                            <div>
                              <p className="font-semibold text-stone-900 line-clamp-1">{prod.name}</p>
                              <span className="text-[10px] text-stone-500 font-mono">SKU: {prod.sku}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-stone-700">
                          <span className="font-semibold text-emerald-900">{prod.gsm || '230 GSM'}</span>
                          <span className="block text-[11px] text-stone-500">{prod.fit}</span>
                        </td>
                        <td className="p-3 font-bold tabular-nums text-stone-900">
                          {formatPrice(prod.price)}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateStock(prod.id, -1)}
                              className="w-5 h-5 rounded border bg-white flex items-center justify-center hover:bg-stone-100 font-bold"
                            >
                              -
                            </button>
                            <span className={`font-mono font-bold px-1 tabular-nums ${prod.stock <= 5 ? 'text-rose-600' : 'text-stone-900'}`}>
                              {prod.stock}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateStock(prod.id, 1)}
                              className="w-5 h-5 rounded border bg-white flex items-center justify-center hover:bg-stone-100 font-bold"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openProductModal(prod)}
                              className="p-1.5 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded transition-colors"
                              title="এডিট করুন"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteTarget({
                                  type: 'product',
                                  id: prod.id,
                                  title: prod.name,
                                  subtitle: `SKU: ${prod.sku} · স্টক: ${prod.stock} টি`,
                                })
                              }
                              className="p-1.5 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded transition-colors"
                              title="ডিলিট করুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS */}
        {activeTab === 'orders' && (
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-stone-900">গ্রাহকদের অর্ডার সমূহ</h2>
                <p className="text-xs text-stone-500">অর্ডার স্ট্যাটাস পরিবর্তন করুন, কুরিয়ার কোড যোগ করুন অথবা অপ্রয়োজনীয় অর্ডার ডিলিট করুন।</p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-stone-500">ফিল্টার:</span>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="p-2 border border-stone-300 rounded-lg text-xs"
                >
                  <option value="all">সব অর্ডার ({orders.length})</option>
                  <option value="pending">পেন্ডিং (Pending)</option>
                  <option value="processing">প্রসেসিং (Processing)</option>
                  <option value="shipped">কুরিয়ারে দেওয়া হয়েছে (Shipped)</option>
                  <option value="delivered">ডেলিভারড (Delivered)</option>
                  <option value="cancelled">বাতিল (Cancelled)</option>
                </select>
              </div>
            </div>

            {orders.length === 0 ? (
              <p className="text-xs text-stone-500 py-12 text-center">এখনও কোনো অর্ডার আসেনি।</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-stone-50 text-stone-600">
                      <th className="p-3">অর্ডার #</th>
                      <th className="p-3">গ্রাহক ও মোবাইল</th>
                      <th className="p-3">ঠিকানা</th>
                      <th className="p-3">বিল</th>
                      <th className="p-3">পেমেন্ট</th>
                      <th className="p-3">স্ট্যাটাস</th>
                      <th className="p-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {orders
                      .filter((o) => (orderStatusFilter === 'all' ? true : o.status === orderStatusFilter))
                      .map((ord) => (
                        <tr key={ord.id} className="hover:bg-stone-50/60">
                          <td className="p-3 font-mono font-bold text-stone-900">{ord.orderNumber}</td>
                          <td className="p-3">
                            <p className="font-semibold text-stone-900">{ord.customer.fullName}</p>
                            <span className="text-stone-500 font-mono">{ord.customer.phone}</span>
                          </td>
                          <td className="p-3 text-stone-600 max-w-xs truncate">
                            {ord.customer.district}, {ord.customer.thana}
                          </td>
                          <td className="p-3 font-bold tabular-nums text-stone-900">{formatPrice(ord.total)}</td>
                          <td className="p-3 uppercase font-medium text-stone-700">
                            {ord.paymentMethod} {ord.paymentTransactionId ? `(${ord.paymentTransactionId})` : ''}
                          </td>
                          <td className="p-3">
                            <select
                              value={ord.status}
                              onChange={(e) => handleOrderStatusChange(ord.id, e.target.value as OrderStatus)}
                              className="p-1 border border-stone-300 rounded text-[11px] font-semibold capitalize"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedOrder(ord)}
                                className="p-1.5 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded transition-colors"
                                title="অর্ডার দেখুন"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteTarget({
                                    type: 'order',
                                    id: ord.id,
                                    title: ord.orderNumber,
                                    subtitle: `গ্রাহক: ${ord.customer.fullName} (${ord.customer.phone})`,
                                  })
                                }
                                className="p-1.5 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded transition-colors"
                                title="অর্ডার ডিলিট করুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-stone-900">টি-শার্ট ক্যাটাগরি</h2>
                <p className="text-xs text-stone-500">ক্যাটাগরি তৈরি করুন, এডিট করুন বা মুছে ফেলুন।</p>
              </div>

              <button
                type="button"
                onClick={() => openCategoryModal()}
                className="px-4 py-2 bg-[#0C1F15] text-white text-xs font-semibold rounded-lg hover:bg-[#183a28] transition-colors flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>নতুন ক্যাটাগরি যোগ করুন</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <div key={cat.id} className="p-4 border border-stone-200 rounded-xl space-y-3 bg-stone-50 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="aspect-[16/9] rounded-lg overflow-hidden bg-stone-200">
                      <img src={cat.image} alt={cat.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-base text-stone-900">{cat.name}</h3>
                      <p className="text-xs text-stone-500 line-clamp-2 mt-1">{cat.description}</p>
                      <span className="text-[11px] font-mono text-emerald-800 mt-1 block">/{cat.slug}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openCategoryModal(cat)}
                      className="px-2.5 py-1 text-stone-700 bg-white border border-stone-300 rounded hover:bg-stone-100 flex items-center gap-1 text-[11px]"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>এডিট</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTarget({
                          type: 'category',
                          id: cat.id,
                          title: cat.name,
                          subtitle: `স্লাগ: /${cat.slug}`,
                        })
                      }
                      className="px-2.5 py-1 text-rose-700 bg-rose-50 border border-rose-200 rounded hover:bg-rose-100 flex items-center gap-1 text-[11px]"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>ডিলিট</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: COUPONS */}
        {activeTab === 'coupons' && (
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-stone-900">ডিসকাউন্ট কুপন ও প্রোমো কোড</h2>
                <p className="text-xs text-stone-500">কাস্টমারদের জন্য প্রোমো কোড তৈরি ও নিয়ন্ত্রণ করুন।</p>
              </div>

              <button
                type="button"
                onClick={() => setIsCouponModalOpen(true)}
                className="px-4 py-2 bg-[#0C1F15] text-white text-xs font-semibold rounded-lg hover:bg-[#183a28] transition-colors flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>নতুন কুপন কোড যোগ করুন</span>
              </button>
            </div>

            {coupons.length === 0 ? (
              <p className="text-xs text-stone-500 py-12 text-center">কোনো কুপন কোড নেই।</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-stone-50 text-stone-600">
                      <th className="p-3">কুপন কোড</th>
                      <th className="p-3">ছাড় (Discount)</th>
                      <th className="p-3">নূন্যতম কেনাকাটা</th>
                      <th className="p-3">বিবরণ</th>
                      <th className="p-3">স্ট্যাটাস</th>
                      <th className="p-3 text-right">ডিলিট</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {coupons.map((cpn) => (
                      <tr key={cpn.id || cpn.code} className="hover:bg-stone-50/60">
                        <td className="p-3 font-mono font-bold text-emerald-900">{cpn.code}</td>
                        <td className="p-3 font-bold text-stone-900">{cpn.discountPercentage}%</td>
                        <td className="p-3 text-stone-700">
                          {cpn.minSpend ? formatPrice(cpn.minSpend) : 'শর্তহীন'}
                        </td>
                        <td className="p-3 text-stone-500">{cpn.description || '—'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${cpn.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'}`}>
                            {cpn.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteTarget({
                                type: 'coupon',
                                id: cpn.id || cpn.code,
                                title: cpn.code,
                                subtitle: `${cpn.discountPercentage}% ছাড়ের কুপন`,
                              })
                            }
                            className="p-1.5 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded transition-colors"
                            title="কুপন মুছুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: SETTINGS, CONTACT & LOCATION */}
        {activeTab === 'settings' && (
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-xs space-y-6 max-w-4xl">
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-900">স্টোর ইনফরমেশন, কন্টাক্ট নম্বর ও ডেলিভারি চার্জ</h2>
              <p className="text-xs text-stone-500">এখান থেকে মোবাইল নম্বর, হোয়াটসঅ্যাপ, লোকেশন ও ডেলিভারি ফি আপডেট করুন।</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast('সকল তথ্য ফায়ারবেসে সেভ হয়েছে।');
              }}
              className="space-y-6 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-medium text-stone-700 block mb-1">স্টোরের নাম</label>
                  <input
                    type="text"
                    value={settings.storeName}
                    onChange={(e) => updateSettings({ ...settings, storeName: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded"
                  />
                </div>

                <div>
                  <label className="font-medium text-stone-700 block mb-1">ট্যাগলাইন</label>
                  <input
                    type="text"
                    value={settings.storeTagline}
                    onChange={(e) => updateSettings({ ...settings, storeTagline: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded"
                  />
                </div>

                <div>
                  <label className="font-medium text-stone-700 block mb-1">হটলাইন মোবাইল নম্বর</label>
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={(e) => updateSettings({ ...settings, phone: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded"
                  />
                </div>

                <div>
                  <label className="font-medium text-stone-700 block mb-1">হোয়াটসঅ্যাপ নম্বর</label>
                  <input
                    type="text"
                    value={settings.whatsappNumber}
                    onChange={(e) => updateSettings({ ...settings, whatsappNumber: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded"
                  />
                </div>

                <div>
                  <label className="font-medium text-stone-700 block mb-1">বিকাশ পার্সোনাল নম্বর</label>
                  <input
                    type="text"
                    value={settings.bkashNumber}
                    onChange={(e) => updateSettings({ ...settings, bkashNumber: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded"
                  />
                </div>

                <div>
                  <label className="font-medium text-stone-700 block mb-1">নগদ নম্বর</label>
                  <input
                    type="text"
                    value={settings.nagadNumber}
                    onChange={(e) => updateSettings({ ...settings, nagadNumber: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-medium text-stone-700 block mb-1">স্টোর ও ওয়্যারহাউজ ঠিকানা / লোকেশন</label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) => updateSettings({ ...settings, address: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded"
                  />
                </div>

                <div>
                  <label className="font-medium text-stone-700 block mb-1">ঢাকা সিটির ভিতরে ডেলিভারি চার্জ (টাকা)</label>
                  <input
                    type="number"
                    value={settings.deliveryInsideDhaka}
                    onChange={(e) => updateSettings({ ...settings, deliveryInsideDhaka: Number(e.target.value) })}
                    className="w-full p-2 border border-stone-300 rounded"
                  />
                </div>

                <div>
                  <label className="font-medium text-stone-700 block mb-1">ঢাকার বাইরে ডেলিভারি চার্জ (টাকা)</label>
                  <input
                    type="number"
                    value={settings.deliveryOutsideDhaka}
                    onChange={(e) => updateSettings({ ...settings, deliveryOutsideDhaka: Number(e.target.value) })}
                    className="w-full p-2 border border-stone-300 rounded"
                  />
                </div>

                <div>
                  <label className="font-medium text-stone-700 block mb-1">ফ্রি ডেলিভারি নূন্যতম অর্ডার মূল্য (টাকা)</label>
                  <input
                    type="number"
                    value={settings.freeShippingThreshold}
                    onChange={(e) => updateSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                    className="w-full p-2 border border-stone-300 rounded"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-stone-900 text-white rounded font-medium hover:bg-stone-800"
                >
                  তথ্য সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 7: SECURITY & PASSWORD CHANGE */}
        {activeTab === 'security' && (
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-xs space-y-6 max-w-xl">
            <div className="flex items-center gap-2.5 border-b border-stone-100 pb-3">
              <KeyRound className="w-5 h-5 text-emerald-800" />
              <div>
                <h2 className="font-serif text-lg font-bold text-stone-900">অ্যাডমিন পাসওয়ার্ড পরিবর্তন</h2>
                <p className="text-xs text-stone-500">আপনার নিজস্ব গোপন পাসওয়ার্ড সেট করুন।</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="font-medium text-stone-700 block mb-1">বর্তমান পাসওয়ার্ড</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="বর্তমান পাসওয়ার্ড লিখুন"
                  className="w-full p-2.5 border border-stone-300 rounded"
                />
              </div>

              <div>
                <label className="font-medium text-stone-700 block mb-1">নতুন পাসওয়ার্ড</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="নতুন গোপন পাসওয়ার্ড লিখুন"
                  className="w-full p-2.5 border border-stone-300 rounded"
                />
              </div>

              <div>
                <label className="font-medium text-stone-700 block mb-1">নতুন পাসওয়ার্ড নিশ্চিত করুন</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="নতুন পাসওয়ার্ড পুনরায় লিখুন"
                  className="w-full p-2.5 border border-stone-300 rounded"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-stone-900 text-white font-semibold rounded hover:bg-stone-800 transition-colors"
              >
                পাসওয়ার্ড পরিবর্তন করুন
              </button>
            </form>
          </div>
        )}

        {/* TAB 8: FIREBASE CLOUD DATABASE */}
        {activeTab === 'firebase' && (
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-xs space-y-6 max-w-3xl">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-emerald-800" />
                <div>
                  <h2 className="font-serif text-xl font-bold text-stone-900">Firebase Firestore লাইভ ডাটাবেস</h2>
                  <p className="text-xs text-stone-500">ক্লাউড ডাটাবেস সংযোগ ও রুলস স্ট্যাটাস</p>
                </div>
              </div>

              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-semibold rounded flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Firebase Live
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-stone-500">Firebase প্রজেক্ট আইডি:</span>
                  <span className="font-mono font-bold text-stone-900">intrepid-fort-7dtd0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Firestore ডাটাবেস আইডি:</span>
                  <span className="font-mono font-bold text-stone-900">ai-studio-alummahgarmentsm-d5cfa713-0f7c-482c-b908-41086d7fdaa5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">রুলস সিকিউরিটি:</span>
                  <span className="text-emerald-800 font-semibold">ডিপ্লয় করা হয়েছে (Active)</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={runFirebaseTest}
                  disabled={firebaseStatus.testing}
                  className="px-4 py-2 bg-stone-900 text-white rounded font-semibold flex items-center gap-2 hover:bg-stone-800 disabled:opacity-50"
                >
                  {firebaseStatus.testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
                  <span>Firebase সংযোগ পরীক্ষা করুন</span>
                </button>
              </div>

              {firebaseStatus.message && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
                  {firebaseStatus.message}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Product Add/Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl my-8 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {editingProduct ? `টি-শার্ট এডিট: ${editingProduct.name}` : 'নতুন টি-শার্ট যোগ করুন'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsProductModalOpen(false);
                  setEditingProduct(null);
                }}
                className="text-stone-400 hover:text-stone-800"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as any;
                handleSaveProduct({
                  name: form.name.value,
                  price: Number(form.price.value),
                  originalPrice: form.originalPrice.value ? Number(form.originalPrice.value) : undefined,
                  category: form.category.value,
                  gsm: form.gsm.value,
                  fit: form.fit.value,
                  stock: Number(form.stock.value),
                  sku: form.sku.value,
                  fabric: form.fabric.value,
                  shortDescription: form.shortDescription.value,
                  description: form.description.value,
                  isFeatured: form.isFeatured.checked,
                  isNewArrival: form.isNewArrival.checked,
                  isBestSeller: form.isBestSeller.checked,
                });
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="font-medium text-stone-700 block mb-1">টি-শার্টের নাম</label>
                  <input
                    name="name"
                    required
                    defaultValue={editingProduct?.name || ''}
                    placeholder="যেমন: SABR Gold Arabic Calligraphy Oversized Tee"
                    className="w-full p-2 border border-stone-300 rounded"
                  />
                </div>

                <div>
                  <label className="font-medium text-stone-700 block mb-1">ক্যাটাগরি</label>
                  <select
                    name="category"
                    defaultValue={editingProduct?.category || categories[0]?.slug}
                    className="w-full p-2 border border-stone-300 rounded"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-medium text-stone-700 block mb-1">জিএসএম (GSM)</label>
                  <input
                    name="gsm"
                    defaultValue={editingProduct?.gsm || '230 GSM'}
                    className="w-full p-2 border border-stone-300 rounded"
                  />
                </div>

                <div>
                  <label className="font-medium text-stone-700 block mb-1">ফিটিং ধরণ</label>
                  <select
                    name="fit"
                    defaultValue={editingProduct?.fit || 'Oversized Drop-Shoulder'}
                    className="w-full p-2 border border-stone-300 rounded"
                  >
                    <option value="Oversized Drop-Shoulder">Oversized Drop-Shoulder</option>
                    <option value="Classic Regular Fit">Classic Regular Fit</option>
                    <option value="Boxy Heavyweight">Boxy Heavyweight</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-stone-700 block mb-1">ফ্যাব্রিক কোয়ালিটি</label>
                  <input
                    name="fabric"
                    defaultValue={editingProduct?.fabric || '100% Combed Cotton (230 GSM)'}
                    className="w-full p-2 border border-stone-300 rounded"
                  />
                </div>

                <div>
                  <label className="font-medium text-stone-700 block mb-1">বিক্রয় মূল্য (টাকা)</label>
                  <input
                    name="price"
                    type="number"
                    required
                    defaultValue={editingProduct?.price || ''}
                    className="w-full p-2 border border-stone-300 rounded"
                  />
                </div>

                <div>
                  <label className="font-medium text-stone-700 block mb-1">রেগুলার মূল্য (ছাড়ের হিসাবের জন্য)</label>
                  <input
                    name="originalPrice"
                    type="number"
                    defaultValue={editingProduct?.originalPrice || ''}
                    className="w-full p-2 border border-stone-300 rounded"
                  />
                </div>

                <div>
                  <label className="font-medium text-stone-700 block mb-1">স্টক পরিমাণ</label>
                  <input
                    name="stock"
                    type="number"
                    required
                    defaultValue={editingProduct?.stock ?? 30}
                    className="w-full p-2 border border-stone-300 rounded"
                  />
                </div>

                <div>
                  <label className="font-medium text-stone-700 block mb-1">SKU কোড</label>
                  <input
                    name="sku"
                    required
                    defaultValue={editingProduct?.sku || `AUG-TS-${Math.floor(100 + Math.random() * 900)}`}
                    className="w-full p-2 border border-stone-300 rounded font-mono"
                  />
                </div>

                {/* IMAGE MANAGEMENT WITH REMOVE/DELETE */}
                <div className="sm:col-span-2 space-y-2 pt-2 border-t border-stone-200">
                  <label className="font-medium text-stone-800 block">
                    টি-শার্টের ছবি সমূহ (ছবি মুছুন বা নতুন ছবি যোগ করুন)
                  </label>
                  
                  {/* Images Preview & Delete */}
                  <div className="flex flex-wrap gap-3">
                    {productImages.map((img, idx) => (
                      <div key={idx} className="relative group w-20 h-24 rounded-lg overflow-hidden border border-stone-300 bg-stone-100">
                        <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImageFromProduct(idx)}
                          className="absolute inset-0 bg-black/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          title="এই ছবিটি মুছুন"
                        >
                          <Trash2 className="w-4 h-4 text-rose-400" />
                          <span className="text-[9px] mt-0.5">মুছুন</span>
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-0 inset-x-0 bg-emerald-950/80 text-[8px] text-white text-center py-0.5">
                            প্রধান
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Image Control */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="ছবির সরাসরি লিংক (URL) লিখুন"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="flex-1 p-2 border border-stone-300 rounded font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageToProduct}
                      className="px-3 py-2 bg-stone-800 text-white rounded hover:bg-stone-900 shrink-0 font-medium"
                    >
                      + ছবি যোগ করুন
                    </button>
                    <label className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded border border-stone-300 cursor-pointer flex items-center justify-center gap-1 shrink-0 font-medium">
                      <Upload className="w-3.5 h-3.5" />
                      <span>আপলোড</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-medium text-stone-700 block mb-1">সংক্ষিপ্ত বিবরণ (১ লাইন)</label>
                  <input
                    name="shortDescription"
                    defaultValue={editingProduct?.shortDescription || ''}
                    placeholder="প্রিমিয়াম কোয়ালিটি হেভিওয়েট ইসলামিক ড্রপ-শোল্ডার টি-শার্ট"
                    className="w-full p-2 border border-stone-300 rounded"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-medium text-stone-700 block mb-1">বিস্তারিত বিবরণ</label>
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={editingProduct?.description || ''}
                    className="w-full p-2 border border-stone-300 rounded"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-wrap items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input name="isFeatured" type="checkbox" defaultChecked={editingProduct?.isFeatured} className="accent-stone-900" />
                    <span>ফিচার্ড টি-শার্ট</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input name="isNewArrival" type="checkbox" defaultChecked={editingProduct?.isNewArrival} className="accent-stone-900" />
                    <span>নতুন কালেকশন</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input name="isBestSeller" type="checkbox" defaultChecked={editingProduct?.isBestSeller} className="accent-stone-900" />
                    <span>বেস্টসেলার</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded hover:bg-stone-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 text-white rounded font-medium hover:bg-stone-800"
                >
                  টি-শার্ট সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Add/Edit Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {editingCategory ? `ক্যাটাগরি এডিট: ${editingCategory.name}` : 'নতুন ক্যাটাগরি তৈরি করুন'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-stone-400 hover:text-stone-800"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as any;
                handleSaveCategory({
                  name: form.name.value,
                  slug: form.slug.value,
                  description: form.description.value,
                  image: form.image.value,
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="font-medium text-stone-700 block mb-1">ক্যাটাগরির নাম</label>
                <input
                  name="name"
                  required
                  defaultValue={editingCategory?.name || ''}
                  placeholder="যেমন: Minimal Sabr Tees"
                  className="w-full p-2 border border-stone-300 rounded"
                />
              </div>

              <div>
                <label className="font-medium text-stone-700 block mb-1">ইউআরএল স্লাগ (Slug)</label>
                <input
                  name="slug"
                  required
                  defaultValue={editingCategory?.slug || ''}
                  placeholder="যেমন: minimal-sabr"
                  className="w-full p-2 border border-stone-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="font-medium text-stone-700 block mb-1">ক্যাটাগরি ব্যানার ছবি (URL)</label>
                <input
                  name="image"
                  required
                  defaultValue={editingCategory?.image || '/src/assets/images/category_calligraphy_tshirts_1791712297126.jpg'}
                  className="w-full p-2 border border-stone-300 rounded font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="font-medium text-stone-700 block mb-1">বিবরণ</label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={editingCategory?.description || ''}
                  placeholder="ক্যাটাগরির সংক্ষিপ্ত বিবরণ..."
                  className="w-full p-2 border border-stone-300 rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded hover:bg-stone-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 text-white rounded font-medium hover:bg-stone-800"
                >
                  ক্যাটাগরি সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                নতুন কুপন কোড তৈরি করুন
              </h3>
              <button
                type="button"
                onClick={() => setIsCouponModalOpen(false)}
                className="text-stone-400 hover:text-stone-800"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as any;
                handleSaveCoupon({
                  code: form.code.value,
                  discountPercentage: Number(form.discountPercentage.value),
                  minSpend: form.minSpend.value ? Number(form.minSpend.value) : undefined,
                  description: form.description.value,
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="font-medium text-stone-700 block mb-1">কুপন কোড (যেমন: EID20)</label>
                <input
                  name="code"
                  required
                  placeholder="EID20"
                  className="w-full p-2 border border-stone-300 rounded font-mono uppercase font-bold"
                />
              </div>

              <div>
                <label className="font-medium text-stone-700 block mb-1">ডিসকাউন্ট শতকরা (%)</label>
                <input
                  name="discountPercentage"
                  type="number"
                  min="1"
                  max="90"
                  required
                  placeholder="যেমন: 15"
                  className="w-full p-2 border border-stone-300 rounded"
                />
              </div>

              <div>
                <label className="font-medium text-stone-700 block mb-1">সর্বনিম্ন অর্ডারের শর্ত (টাকা, অপশনাল)</label>
                <input
                  name="minSpend"
                  type="number"
                  placeholder="যেমন: 1500"
                  className="w-full p-2 border border-stone-300 rounded"
                />
              </div>

              <div>
                <label className="font-medium text-stone-700 block mb-1">কুপনের বিবরণ</label>
                <input
                  name="description"
                  placeholder="ঈদ উপলক্ষে বিশেষ ছাড়"
                  className="w-full p-2 border border-stone-300 rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded hover:bg-stone-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 text-white rounded font-medium hover:bg-stone-800"
                >
                  কুপন তৈরি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  অর্ডার #{selectedOrder.orderNumber}
                </h3>
                <span className="text-[11px] text-stone-500">
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-stone-400 hover:text-stone-800"
              >
                ✕
              </button>
            </div>

            <div className="bg-stone-50 p-3 rounded-lg space-y-1">
              <p><strong>গ্রাহক:</strong> {selectedOrder.customer.fullName}</p>
              <p><strong>মোবাইল:</strong> {selectedOrder.customer.phone}</p>
              <p><strong>ঠিকানা:</strong> {selectedOrder.customer.fullAddress}, {selectedOrder.customer.thana}, {selectedOrder.customer.district}</p>
              {selectedOrder.customer.notes && (
                <p className="text-amber-800"><strong>গ্রাহকের নোট:</strong> {selectedOrder.customer.notes}</p>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-stone-900 uppercase">অর্ডারকৃত টি-শার্ট</h4>
              <div className="divide-y divide-stone-100 max-h-40 overflow-y-auto">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-stone-900">{item.productName}</p>
                      <span className="text-stone-500">সাইজ: {item.size} · কালার: {item.color} · পরিমাণ: {item.quantity} টি</span>
                    </div>
                    <span className="font-bold tabular-nums">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-sm">
              <span>মোট প্রদেয়</span>
              <span>{formatPrice(selectedOrder.total)}</span>
            </div>

            {/* Courier & Status */}
            <div className="pt-2 border-t border-stone-200 space-y-3">
              <div>
                <label className="font-semibold text-stone-800 block mb-1">কুরিয়ার সার্ভিস ও ট্র্যাকিং কোড</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="কুরিয়ার (যেমন: Steadfast / RedX)"
                    defaultValue={selectedOrder.courierName || ''}
                    onBlur={(e) => handleOrderStatusChange(selectedOrder.id, selectedOrder.status, selectedOrder.trackingNumber, e.target.value)}
                    className="p-1.5 border border-stone-300 rounded flex-1"
                  />
                  <input
                    type="text"
                    placeholder="ট্র্যাকিং কোড"
                    defaultValue={selectedOrder.trackingNumber || ''}
                    onBlur={(e) => handleOrderStatusChange(selectedOrder.id, selectedOrder.status, e.target.value, selectedOrder.courierName)}
                    className="p-1.5 border border-stone-300 rounded flex-1 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-800 block mb-1">স্ট্যাটাস পরিবর্তন</label>
                <div className="flex flex-wrap gap-2">
                  {(['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleOrderStatusChange(selectedOrder.id, st)}
                      className={`flex-1 py-1.5 rounded capitalize font-medium text-[11px] ${
                        selectedOrder.status === st
                          ? 'bg-stone-900 text-white'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions: Delete Order + Close */}
            <div className="flex items-center gap-2 pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget({
                    type: 'order',
                    id: selectedOrder.id,
                    title: selectedOrder.orderNumber,
                    subtitle: `গ্রাহক: ${selectedOrder.customer.fullName} (${selectedOrder.customer.phone})`,
                  });
                }}
                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded font-semibold flex items-center gap-1.5 transition-colors"
                title="অর্ডারটি মুছুন"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>অর্ডার ডিলিট</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="flex-1 py-2 bg-stone-100 text-stone-800 rounded font-semibold hover:bg-stone-200"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL DELETE CONFIRMATION MODAL (Replaces window.confirm) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-stone-200 text-stone-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                মুছে ফেলার নিশ্চিতকরণ
              </h3>
              <p className="text-xs text-stone-600">
                আপনি কি নিশ্চিত যে <span className="font-bold text-rose-700">"{deleteTarget.title}"</span> ডিলিট করতে চান?
              </p>
              {deleteTarget.subtitle && (
                <p className="text-[11px] text-stone-500 font-mono bg-stone-50 py-1 px-2 rounded">
                  {deleteTarget.subtitle}
                </p>
              )}
              <p className="text-[11px] text-stone-400">
                এটি লোকাল স্টোরেজ এবং ফায়ারবেস ক্লাউড ডাটাবেস থেকে মুছে যাবে।
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="w-full py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-medium text-xs transition-colors"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={confirmExecuteDelete}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>হ্যাঁ, ডিলিট করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
