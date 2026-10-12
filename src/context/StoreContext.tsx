import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { CartItem, Product, StoreSettings } from '../types';
import { StorageService } from '../lib/storage';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface StoreContextType {
  cart: CartItem[];
  addToCart: (product: Product, size: string, color: { name: string; hex: string }, quantity?: number) => void;
  removeFromCart: (index: number) => void;
  updateCartQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  settings: StoreSettings;
  updateSettings: (newSettings: StoreSettings) => void;
  formatPrice: (amount: number) => string;

  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => StorageService.getCart());
  const [wishlist, setWishlist] = useState<string[]>(() => StorageService.getWishlist());
  const [settings, setSettings] = useState<StoreSettings>(() => StorageService.getSettings());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    StorageService.saveCart(cart);
  }, [cart]);

  // Sync and listen to live Firestore cloud updates
  useEffect(() => {
    // Initial fetch from cloud
    StorageService.syncAllFromFirestore().then((res) => {
      if (res.settingsUpdated) {
        setSettings(StorageService.getSettings());
      }
    });

    // Real-time listener for settings changes (banner, stats, address, adminPassword, etc.)
    const unsubscribe = StorageService.subscribeToLiveUpdates({
      onSettings: (liveSettings) => {
        setSettings(liveSettings);
      },
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3800);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToCart = (
    product: Product,
    size: string,
    color: { name: string; hex: string },
    quantity = 1
  ) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor.name === color.name
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: Math.min(newQty, product.stock),
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            product,
            quantity: Math.min(quantity, product.stock),
            selectedSize: size,
            selectedColor: color,
          },
        ];
      }
    });

    showToast(`"${product.name}" ব্যাগে যোগ করা হয়েছে।`);
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => {
      const item = prev[index];
      if (item) {
        showToast(`"${item.product.name}" ব্যাগ থেকে সরানো হয়েছে।`, 'info');
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateCartQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }
    setCart((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          quantity: Math.min(quantity, updated[index].product.stock),
        };
      }
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const toggleWishlist = (productId: string) => {
    const isAdded = StorageService.toggleWishlist(productId);
    setWishlist(StorageService.getWishlist());
    if (isAdded) {
      showToast('উইশলিস্টে সেভ করা হয়েছে।');
    } else {
      showToast('উইশলিস্ট থেকে সরানো হয়েছে।', 'info');
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.includes(productId);
  };

  const updateSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
    showToast('সেটিংস আপডেট হয়েছে।');
  };

  const formatPrice = (amount: number): string => {
    return `৳${Math.round(amount).toLocaleString('en-BD')}`;
  };

  return (
    <StoreContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        wishlist,
        toggleWishlist,
        isInWishlist,
        settings,
        updateSettings,
        formatPrice,
        toasts,
        showToast,
        removeToast,
        searchQuery,
        setSearchQuery,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
