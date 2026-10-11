import { Product, Category, Order, StoreSettings, Coupon, CartItem, OrderStatus } from '../types';
import { INITIAL_CATEGORIES, INITIAL_COUPONS, INITIAL_PRODUCTS, INITIAL_SETTINGS } from './initialData';
import { db } from './firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

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

// Safe storage reader
const getItem = <T>(key: string, defaultValue: T): T => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return defaultValue;
    return JSON.parse(data) as T;
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

  saveProduct: (product: Product): void => {
    const products = StorageService.getProducts();
    const index = products.findIndex((p) => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.unshift(product);
    }
    StorageService.saveProducts(products);

    // Sync to Firebase Firestore
    try {
      setDoc(doc(db, 'products', product.id), product).catch((e) =>
        console.warn('Firestore product sync warning:', e)
      );
    } catch (e) {
      console.warn('Firestore sync failed:', e);
    }
  },

  deleteProduct: (id: string): void => {
    const products = StorageService.getProducts().filter((p) => p.id !== id);
    StorageService.saveProducts(products);

    try {
      deleteDoc(doc(db, 'products', id)).catch((e) =>
        console.warn('Firestore product delete warning:', e)
      );
    } catch (e) {
      console.warn('Firestore delete failed:', e);
    }
  },

  // Categories
  getCategories: (): Category[] => {
    return getItem<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  },

  saveCategories: (categories: Category[]): void => {
    setItem(STORAGE_KEYS.CATEGORIES, categories);
  },

  saveCategory: (category: Category): void => {
    const categories = StorageService.getCategories();
    const index = categories.findIndex((c) => c.id === category.id);
    if (index >= 0) {
      categories[index] = category;
    } else {
      categories.push(category);
    }
    StorageService.saveCategories(categories);

    try {
      setDoc(doc(db, 'categories', category.id), category).catch((e) =>
        console.warn('Firestore category sync warning:', e)
      );
    } catch (e) {
      console.warn('Firestore sync failed:', e);
    }
  },

  deleteCategory: (id: string): void => {
    const categories = StorageService.getCategories().filter((c) => c.id !== id);
    StorageService.saveCategories(categories);

    try {
      deleteDoc(doc(db, 'categories', id)).catch((e) =>
        console.warn('Firestore category delete warning:', e)
      );
    } catch (e) {
      console.warn('Firestore delete failed:', e);
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

  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'statusHistory'>): Order => {
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

    // Sync order to Firestore
    try {
      setDoc(doc(db, 'orders', newOrder.id), newOrder).catch((e) =>
        console.warn('Firestore order sync warning:', e)
      );
    } catch (e) {
      console.warn('Firestore sync failed:', e);
    }

    return newOrder;
  },

  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string, trackingNumber?: string, courierName?: string): Order | undefined => {
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
      setDoc(doc(db, 'orders', order.id), order).catch((e) =>
        console.warn('Firestore order status sync warning:', e)
      );
    } catch (e) {
      console.warn('Firestore sync failed:', e);
    }

    return order;
  },

  deleteOrder: (orderId: string): void => {
    const orders = StorageService.getOrders().filter((o) => o.id !== orderId);
    setItem(STORAGE_KEYS.ORDERS, orders);

    try {
      deleteDoc(doc(db, 'orders', orderId)).catch((e) =>
        console.warn('Firestore order delete warning:', e)
      );
    } catch (e) {
      console.warn('Firestore sync failed:', e);
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

  saveSettings: (settings: StoreSettings): void => {
    setItem(STORAGE_KEYS.SETTINGS, settings);
    if (settings.adminPassword) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_PWD, settings.adminPassword);
    }

    try {
      setDoc(doc(db, 'settings', 'general'), settings).catch((e) =>
        console.warn('Firestore settings sync warning:', e)
      );
    } catch (e) {
      console.warn('Firestore sync failed:', e);
    }
  },

  verifyAdminPassword: (password: string): boolean => {
    const settings = StorageService.getSettings();
    return password.trim() === (settings.adminPassword || 'admin').trim();
  },

  updateAdminPassword: (newPassword: string): void => {
    const settings = StorageService.getSettings();
    settings.adminPassword = newPassword.trim();
    StorageService.saveSettings(settings);
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

  saveCoupon: (coupon: Coupon): void => {
    const coupons = StorageService.getCoupons();
    const index = coupons.findIndex((c) => c.id === coupon.id || c.code.toUpperCase() === coupon.code.toUpperCase());
    if (index >= 0) {
      coupons[index] = coupon;
    } else {
      coupons.push(coupon);
    }
    setItem(STORAGE_KEYS.COUPONS, coupons);

    try {
      setDoc(doc(db, 'coupons', coupon.id || coupon.code), coupon).catch((e) =>
        console.warn('Firestore coupon sync warning:', e)
      );
    } catch (e) {
      console.warn('Firestore sync failed:', e);
    }
  },

  deleteCoupon: (idOrCode: string): void => {
    const coupons = StorageService.getCoupons().filter(
      (c) => c.id !== idOrCode && c.code.toUpperCase() !== idOrCode.toUpperCase()
    );
    setItem(STORAGE_KEYS.COUPONS, coupons);

    try {
      deleteDoc(doc(db, 'coupons', idOrCode)).catch((e) =>
        console.warn('Firestore coupon delete warning:', e)
      );
    } catch (e) {
      console.warn('Firestore delete failed:', e);
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
};
