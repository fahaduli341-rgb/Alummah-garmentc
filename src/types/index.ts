export type Currency = 'BDT';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  category: string;
  gsm?: string;
  fit: 'Oversized Drop-Shoulder' | 'Classic Regular Fit' | 'Boxy Heavyweight';
  images: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  stock: number;
  inStock: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  sku: string;
  fabric: string;
  careInstructions: string[];
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: { name: string; hex: string };
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'rocket';
export type DeliveryZone = 'inside_dhaka' | 'outside_dhaka';

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  items: OrderItem[];
  customer: {
    fullName: string;
    phone: string;
    altPhone?: string;
    district: string;
    thana: string;
    fullAddress: string;
    notes?: string;
  };
  deliveryZone: DeliveryZone;
  deliveryFee: number;
  subtotal: number;
  discount: number;
  total: number;
  couponCode?: string;
  paymentMethod: PaymentMethod;
  paymentTransactionId?: string;
  isPaid: boolean;
  courierName?: string;
  trackingNumber?: string;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
}

export interface Coupon {
  id?: string;
  code: string;
  discountPercentage: number;
  minSpend?: number;
  expiresAt?: string;
  isActive: boolean;
  description?: string;
}

export interface StoreSettings {
  storeName: string;
  storeTagline: string;
  phone: string;
  whatsappNumber: string;
  bkashNumber: string;
  nagadNumber: string;
  address: string;
  currencySymbol: string;
  deliveryInsideDhaka: number;
  deliveryOutsideDhaka: number;
  freeShippingThreshold: number;
  isCodEnabled: boolean;
  isBkashEnabled: boolean;
  isNagadEnabled: boolean;
  adminPassword: string; // Customizable secure admin password

  // Hero Banner Picture & Titles (Configurable from Admin Panel)
  heroImage?: string;
  heroBadge?: string;
  heroTitle?: string;
  heroMainHeading?: string;
  heroSubHeading?: string;

  // Top 3 Highlights / Numbers (Configurable from Admin Panel)
  stat1Number?: string;
  stat1Label?: string;
  stat2Number?: string;
  stat2Label?: string;
  stat3Number?: string;
  stat3Label?: string;
}
