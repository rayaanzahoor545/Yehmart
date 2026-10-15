export type Role = 'customer' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: Role;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label: 'Home' | 'Office' | 'Other';
  recipientName: string;
  phone: string;
  streetAddress: string;
  areaLocality?: string;
  city: string;
  province: string;
  postalCode?: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  displayOrder: number;
  isFeatured: boolean;
  productCount?: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  isActive: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  priceOverride?: number;
  attributes: Record<string, string>; // e.g. { Color: "Matte Black", Size: "M" }
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName?: string;
  brandId?: string;
  brandName?: string;
  sku: string;
  shortDescription: string;
  description: string;
  price: number; // in PKR
  compareAtPrice?: number; // original price
  costPrice?: number; // admin view
  stock: number;
  lowStockThreshold: number;
  images: string[];
  variants?: ProductVariant[];
  specifications: Record<string, string>;
  isPublished: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestseller: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  product: Product;
  selectedVariant?: ProductVariant;
  quantity: number;
  unitPrice: number;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type PaymentMethod = 'cash_on_delivery' | 'bank_transfer' | 'card';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  imageUrl?: string;
}

export interface OrderStatusHistoryItem {
  id: string;
  orderId: string;
  status: OrderStatus;
  note?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    recipientName: string;
    phone: string;
    streetAddress: string;
    areaLocality?: string;
    city: string;
    province: string;
    postalCode?: string;
  };
  deliveryNotes?: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  shippingFee: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  trackingCarrier?: 'TCS' | 'Leopards' | 'Trax' | 'PostEx' | 'CallCourier';
  trackingNumber?: string;
  history: OrderStatusHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId?: string;
  userName: string;
  userEmail?: string;
  rating: number; // 1 - 5
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string;
}

export interface FlashSale {
  id: string;
  title: string;
  subtitle: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  productIds: string[];
}

export interface SiteSettings {
  storeName: string;
  tagline: string;
  announcementText: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  supportPhone: string;
  supportEmail: string;
  whatsappNumber: string;
  instagramHandle: string;
}
