import { Product, Category, Order, StoreSettings, Coupon, CartItem, OrderStatus } from '../types';
import { INITIAL_CATEGORIES, INITIAL_COUPONS, INITIAL_PRODUCTS, INITIAL_SETTINGS } from './initialData';
import { db } from './firebase';
import { doc, setDoc, deleteDoc, getDoc, getDocs, collection, onSnapshot, Unsubscribe } from 'firebase/firestore';

const STORAGE_KEYS = {
  PRODUCTS: 'alummah_tshirts_products',
  CATEGORIES: 'alummah_tshirts_categories',
  ORDERS: 'alummah_tshirts_orders',
  SETTINGS: 'alummah_tshirts_settings',
  COUPONS: 'alummah_tshirts_coupons',
  CART: 'alummah_tshirts_cart',
  WISHLIST: 'alummah_tshirts_wishlist',
  ADMIN_PWD: 'alummah_admin_custom_pwd',
};

// Safe storage reader with automatic migration from legacy /src/assets/images/ to /images/
const getItem = <T>(key: string, defaultValue: T): T => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return defaultValue;
    const cleaned = data.replace(/\/src\/assets\/images\//g, '/images/');
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.error(`Error reading ${key}:`, err);
    return defaultValue;
  }
};

// Safe storage writer
const setItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key}:`, err);
  }
};

export const StorageService = {
  // Products
  getProducts: (): Product[] => {
    return getItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  },

  getProductById: (id: string): Product | undefined => {
    const products = StorageService.getProducts();
    return products.find((p) => p.id === id || p.slug === id);
  },

  saveProducts: (products: Product[]): void => {
    setItem(STORAGE_KEYS.PRODUCTS, products);
  },

  saveProduct: async (product: Product): Promise<void> => {
    const products = StorageService.getProducts();
    const index = products.findIndex((p) => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.unshift(product);
    }
    StorageService.saveProducts(products);

    // Sync to Firebase Firestore live
    try {
      await setDoc(doc(db, 'products', product.id), product);
    } catch (e) {
      console.warn('Firestore product sync error:', e);
    }
  },

  deleteProduct: async (id: string): Promise<void> => {
    const products = StorageService.getProducts().filter((p) => p.id !== id);
    StorageService.saveProducts(products);

    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (e) {
      console.warn('Firestore product delete error:', e);
    }
  },

  // Categories
  getCategories: (): Category[] => {
    return getItem<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  },

  saveCategories: (categories: Category[]): void => {
    setItem(STORAGE_KEYS.CATEGORIES, categories);
  },

  saveCategory: async (category: Category): Promise<void> => {
    const categories = StorageService.getCategories();
    const index = categories.findIndex((c) => c.id === category.id);
    if (index >= 0) {
      categories[index] = category;
    } else {
      categories.push(category);
    }
    StorageService.saveCategories(categories);

    try {
      await setDoc(doc(db, 'categories', category.id), category);
    } catch (e) {
      console.warn('Firestore category sync error:', e);
    }
  },

  deleteCategory: async (id: string): Promise<void> => {
    const categories = StorageService.getCategories().filter((c) => c.id !== id);
    StorageService.saveCategories(categories);

    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (e) {
      console.warn('Firestore category delete error:', e);
    }
  },

  // Orders
  getOrders: (): Order[] => {
    return getItem<Order[]>(STORAGE_KEYS.ORDERS, []);
  },

  getOrderById: (orderIdOrNumber: string): Order | undefined => {
    const query = orderIdOrNumber.trim().toUpperCase();
    const orders = StorageService.getOrders();
    return orders.find(
      (o) => o.id.toUpperCase() === query || o.orderNumber.toUpperCase() === query
    );
  },

  createOrder: async (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'statusHistory'>): Promise<Order> => {
    const orders = StorageService.getOrders();
    const nextNum = 1001 + orders.length;
    const now = new Date().toISOString();

    const newOrder: Order = {
      ...orderData,
      id: `ord-${nextNum}`,
      orderNumber: `AUG-${nextNum}`,
      createdAt: now,
      statusHistory: [
        {
          status: 'pending',
          timestamp: now,
          note: `অর্ডার গ্রহণ করা হয়েছে (${orderData.paymentMethod.toUpperCase()})।`,
        },
      ],
    };

    orders.unshift(newOrder);
    setItem(STORAGE_KEYS.ORDERS, orders);

    // Stock deduction
    const products = StorageService.getProducts();
    newOrder.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
        prod.inStock = prod.stock > 0;
      }
    });
    StorageService.saveProducts(products);

    // Sync order to Firestore live
    try {
      await setDoc(doc(db, 'orders', newOrder.id), newOrder);
    } catch (e) {
      console.warn('Firestore order sync error:', e);
    }

    return newOrder;
  },

  updateOrderStatus: async (orderId: string, status: OrderStatus, note?: string, trackingNumber?: string, courierName?: string): Promise<Order | undefined> => {
    const orders = StorageService.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return undefined;

    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (courierName) order.courierName = courierName;
    if (status === 'delivered') order.isPaid = true;

    order.statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      note: note || `অর্ডার স্ট্যাটাস পরিবর্তিত: ${status}`,
    });

    setItem(STORAGE_KEYS.ORDERS, orders);

    try {
      await setDoc(doc(db, 'orders', order.id), order);
    } catch (e) {
      console.warn('Firestore order status sync error:', e);
    }

    return order;
  },

  deleteOrder: async (orderId: string): Promise<void> => {
    const orders = StorageService.getOrders().filter((o) => o.id !== orderId);
    setItem(STORAGE_KEYS.ORDERS, orders);

    try {
      await deleteDoc(doc(db, 'orders', orderId));
    } catch (e) {
      console.warn('Firestore order delete error:', e);
    }
  },

  // Settings
  getSettings: (): StoreSettings => {
    const local = getItem<StoreSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    const customPwd = localStorage.getItem(STORAGE_KEYS.ADMIN_PWD);
    if (customPwd) {
      local.adminPassword = customPwd;
    }
    return local;
  },

  saveSettings: async (settings: StoreSettings): Promise<void> => {
    setItem(STORAGE_KEYS.SETTINGS, settings);
    if (settings.adminPassword) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_PWD, settings.adminPassword);
    }

    try {
      await setDoc(doc(db, 'settings', 'general'), settings);
    } catch (e) {
      console.warn('Firestore settings sync error:', e);
    }
  },

  getAdminPassword: (): string => {
    const settings = StorageService.getSettings();
    const customPwd = localStorage.getItem(STORAGE_KEYS.ADMIN_PWD);
    return customPwd || settings.adminPassword || 'admin';
  },

  verifyAdminPassword: (password: string): boolean => {
    const current = StorageService.getAdminPassword();
    return password.trim() === current.trim();
  },

  verifyAdminPasswordAsync: async (password: string): Promise<boolean> => {
    // 1. Check local cache first
    if (StorageService.verifyAdminPassword(password)) {
      return true;
    }
    // 2. Fetch live settings from Firestore in case updated from another browser
    try {
      const snap = await getDoc(doc(db, 'settings', 'general'));
      if (snap.exists()) {
        const liveSettings = snap.data() as StoreSettings;
        if (liveSettings.adminPassword) {
          localStorage.setItem(STORAGE_KEYS.ADMIN_PWD, liveSettings.adminPassword);
          const local = getItem<StoreSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
          local.adminPassword = liveSettings.adminPassword;
          setItem(STORAGE_KEYS.SETTINGS, local);
          return password.trim() === liveSettings.adminPassword.trim();
        }
      }
    } catch (err) {
      console.warn('Firestore verify password lookup error:', err);
    }
    return false;
  },

  updateAdminPassword: async (newPassword: string): Promise<void> => {
    const cleanPwd = newPassword.trim();
    const settings = StorageService.getSettings();
    settings.adminPassword = cleanPwd;
    localStorage.setItem(STORAGE_KEYS.ADMIN_PWD, cleanPwd);
    setItem(STORAGE_KEYS.SETTINGS, settings);

    // Save live directly to Firestore settings/general
    try {
      await setDoc(doc(db, 'settings', 'general'), {
        ...settings,
        adminPassword: cleanPwd,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Firestore admin password cloud save error:', e);
    }
  },

  // Coupons
  getCoupons: (): Coupon[] => {
    return getItem<Coupon[]>(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
  },

  validateCoupon: (code: string, currentTotal: number): { valid: boolean; discountPercentage?: number; message: string } => {
    const coupons = StorageService.getCoupons();
    const coupon = coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive);
    if (!coupon) {
      return { valid: false, message: 'কুপন কোডটি সঠিক নয় বা মেয়াদোত্তীর্ণ।' };
    }
    if (coupon.minSpend && currentTotal < coupon.minSpend) {
      return { valid: false, message: `সর্বনিম্ন ৳${coupon.minSpend} টাকার অর্ডারে এই কুপন প্রযোজ্য।` };
    }
    return { valid: true, discountPercentage: coupon.discountPercentage, message: `${coupon.discountPercentage}% ছাড় প্রযোজ্য হয়েছে!` };
  },

  saveCoupons: (coupons: Coupon[]): void => {
    setItem(STORAGE_KEYS.COUPONS, coupons);
  },

  saveCoupon: async (coupon: Coupon): Promise<void> => {
    const coupons = StorageService.getCoupons();
    const index = coupons.findIndex((c) => c.id === coupon.id || c.code.toUpperCase() === coupon.code.toUpperCase());
    if (index >= 0) {
      coupons[index] = coupon;
    } else {
      coupons.push(coupon);
    }
    setItem(STORAGE_KEYS.COUPONS, coupons);

    try {
      await setDoc(doc(db, 'coupons', coupon.id || coupon.code), coupon);
    } catch (e) {
      console.warn('Firestore coupon sync error:', e);
    }
  },

  deleteCoupon: async (idOrCode: string): Promise<void> => {
    const coupons = StorageService.getCoupons().filter(
      (c) => c.id !== idOrCode && c.code.toUpperCase() !== idOrCode.toUpperCase()
    );
    setItem(STORAGE_KEYS.COUPONS, coupons);

    try {
      await deleteDoc(doc(db, 'coupons', idOrCode));
    } catch (e) {
      console.warn('Firestore coupon delete error:', e);
    }
  },

  // Wishlist
  getWishlist: (): string[] => {
    return getItem<string[]>(STORAGE_KEYS.WISHLIST, []);
  },

  toggleWishlist: (productId: string): boolean => {
    const wishlist = StorageService.getWishlist();
    const index = wishlist.indexOf(productId);
    let isInWishlist = false;
    if (index >= 0) {
      wishlist.splice(index, 1);
    } else {
      wishlist.push(productId);
      isInWishlist = true;
    }
    setItem(STORAGE_KEYS.WISHLIST, wishlist);
    return isInWishlist;
  },

  // Cart
  getCart: (): CartItem[] => {
    return getItem<CartItem[]>(STORAGE_KEYS.CART, []);
  },

  saveCart: (cart: CartItem[]): void => {
    setItem(STORAGE_KEYS.CART, cart);
  },

  // FULL LIVE FIRESTORE CLOUD SYNC
  syncAllFromFirestore: async (): Promise<{
    settingsUpdated: boolean;
    productsCount: number;
    categoriesCount: number;
    ordersCount: number;
    couponsCount: number;
  }> => {
    let settingsUpdated = false;
    let productsCount = 0;
    let categoriesCount = 0;
    let ordersCount = 0;
    let couponsCount = 0;

    try {
      // 1. Settings
      const settingsSnap = await getDoc(doc(db, 'settings', 'general'));
      if (settingsSnap.exists()) {
        const liveSettings = settingsSnap.data() as StoreSettings;
        const current = StorageService.getSettings();
        const merged = { ...current, ...liveSettings };
        setItem(STORAGE_KEYS.SETTINGS, merged);
        if (liveSettings.adminPassword) {
          localStorage.setItem(STORAGE_KEYS.ADMIN_PWD, liveSettings.adminPassword);
        }
        settingsUpdated = true;
      } else {
        // Seed initial settings to Firestore
        const initSettings = StorageService.getSettings();
        await setDoc(doc(db, 'settings', 'general'), initSettings);
      }

      // 2. Products
      const prodSnap = await getDocs(collection(db, 'products'));
      if (!prodSnap.empty) {
        const liveProducts = prodSnap.docs.map((d) => d.data() as Product);
        setItem(STORAGE_KEYS.PRODUCTS, liveProducts);
        productsCount = liveProducts.length;
      } else {
        // Seed initial products to Firestore
        const initProducts = StorageService.getProducts();
        for (const p of initProducts) {
          await setDoc(doc(db, 'products', p.id), p);
        }
        productsCount = initProducts.length;
      }

      // 3. Categories
      const catSnap = await getDocs(collection(db, 'categories'));
      if (!catSnap.empty) {
        const liveCategories = catSnap.docs.map((d) => d.data() as Category);
        setItem(STORAGE_KEYS.CATEGORIES, liveCategories);
        categoriesCount = liveCategories.length;
      } else {
        const initCategories = StorageService.getCategories();
        for (const c of initCategories) {
          await setDoc(doc(db, 'categories', c.id), c);
        }
        categoriesCount = initCategories.length;
      }

      // 4. Orders
      const ordSnap = await getDocs(collection(db, 'orders'));
      if (!ordSnap.empty) {
        const liveOrders = ordSnap.docs.map((d) => d.data() as Order);
        setItem(STORAGE_KEYS.ORDERS, liveOrders);
        ordersCount = liveOrders.length;
      }

      // 5. Coupons
      const coupSnap = await getDocs(collection(db, 'coupons'));
      if (!coupSnap.empty) {
        const liveCoupons = coupSnap.docs.map((d) => d.data() as Coupon);
        setItem(STORAGE_KEYS.COUPONS, liveCoupons);
        couponsCount = liveCoupons.length;
      }
    } catch (err) {
      console.warn('Error during syncAllFromFirestore:', err);
    }

    return {
      settingsUpdated,
      productsCount,
      categoriesCount,
      ordersCount,
      couponsCount,
    };
  },

  // Real-time Firestore Listeners
  subscribeToLiveUpdates: (callbacks: {
    onSettings?: (settings: StoreSettings) => void;
    onProducts?: (products: Product[]) => void;
    onCategories?: (categories: Category[]) => void;
    onOrders?: (orders: Order[]) => void;
  }): (() => void) => {
    const unsubscribes: Unsubscribe[] = [];

    try {
      // Settings listener
      const unsubSettings = onSnapshot(doc(db, 'settings', 'general'), (snap) => {
        if (snap.exists()) {
          const live = snap.data() as StoreSettings;
          const current = StorageService.getSettings();
          const merged = { ...current, ...live };
          setItem(STORAGE_KEYS.SETTINGS, merged);
          if (live.adminPassword) {
            localStorage.setItem(STORAGE_KEYS.ADMIN_PWD, live.adminPassword);
          }
          callbacks.onSettings?.(merged);
        }
      });
      unsubscribes.push(unsubSettings);

      // Products listener
      const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
        if (!snap.empty) {
          const prods = snap.docs.map((d) => d.data() as Product);
          setItem(STORAGE_KEYS.PRODUCTS, prods);
          callbacks.onProducts?.(prods);
        }
      });
      unsubscribes.push(unsubProducts);

      // Categories listener
      const unsubCategories = onSnapshot(collection(db, 'categories'), (snap) => {
        if (!snap.empty) {
          const cats = snap.docs.map((d) => d.data() as Category);
          setItem(STORAGE_KEYS.CATEGORIES, cats);
          callbacks.onCategories?.(cats);
        }
      });
      unsubscribes.push(unsubCategories);

      // Orders listener
      const unsubOrders = onSnapshot(collection(db, 'orders'), (snap) => {
        if (!snap.empty) {
          const ords = snap.docs.map((d) => d.data() as Order);
          setItem(STORAGE_KEYS.ORDERS, ords);
          callbacks.onOrders?.(ords);
        }
      });
      unsubscribes.push(unsubOrders);
    } catch (err) {
      console.warn('Firestore live listener error:', err);
    }

    return () => {
      unsubscribes.forEach((unsub) => {
        try {
          unsub();
        } catch (_) {}
      });
    };
  },
};
