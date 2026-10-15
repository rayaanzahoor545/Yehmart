import {
  Product,
  Category,
  Order,
  Coupon,
  Review,
  UserProfile,
  Address,
  FlashSale,
  CartItem,
  OrderStatus,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_COUPONS,
  INITIAL_FLASH_SALE,
  INITIAL_ORDERS,
  INITIAL_REVIEWS,
} from '../data/seedData';
import { stripHtml } from '../utils/htmlUtils';

const STORAGE_KEYS = {
  PRODUCTS: 'yehmart_products_v1',
  CATEGORIES: 'yehmart_categories_v1',
  ORDERS: 'yehmart_orders_v1',
  COUPONS: 'yehmart_coupons_v1',
  FLASH_SALE: 'yehmart_flash_sale_v1',
  REVIEWS: 'yehmart_reviews_v1',
  USER: 'yehmart_current_user_v1',
  ADDRESSES: 'yehmart_user_addresses_v1',
  WISHLIST: 'yehmart_wishlist_v1',
  CART: 'yehmart_cart_v1',
};

// Default Demo User
export const DEMO_CUSTOMER: UserProfile = {
  id: 'usr-customer-01',
  email: 'a.aliahmed9704@gmail.com',
  fullName: 'Ali Ahmed',
  phone: '03001234567',
  role: 'customer',
  createdAt: '2026-09-01T10:00:00Z',
};

export const DEMO_ADMIN: UserProfile = {
  id: 'usr-admin-01',
  email: 'admin@yehmart.pk',
  fullName: 'YehMart Executive Store Manager',
  phone: '03008492026',
  role: 'admin',
  createdAt: '2026-01-01T00:00:00Z',
};

class StoreService {
  constructor() {
    this.initSeedData();
  }

  private initSeedData() {
    if (typeof window === 'undefined') return;

    // User explicit request: "sub product delete kro sirf dummy products rakho baqi csv sai uplaod krun ga"
    const resetKey = 'yehmart_reset_to_dummy_only_v2';
    if (!localStorage.getItem(resetKey)) {
      localStorage.setItem(resetKey, 'true');
      localStorage.removeItem('yehmart_dummy_cleared_v1');
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      this.recalculateCategoryCounts(INITIAL_PRODUCTS);
    }

    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.COUPONS)) {
      localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(INITIAL_COUPONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.FLASH_SALE)) {
      localStorage.setItem(STORAGE_KEYS.FLASH_SALE, JSON.stringify(INITIAL_FLASH_SALE));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ADDRESSES)) {
      const defaultAddresses: Address[] = [
        {
          id: 'addr-1',
          userId: DEMO_CUSTOMER.id,
          label: 'Home',
          recipientName: 'Ali Ahmed',
          phone: '03001234567',
          streetAddress: 'House 14-B, Street 3, Sector F-7/2',
          areaLocality: 'F-7 Markaz',
          city: 'Islamabad',
          province: 'Islamabad Capital Territory',
          postalCode: '44000',
          isDefault: true,
        },
      ];
      localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(defaultAddresses));
    }
    if (!localStorage.getItem(STORAGE_KEYS.WISHLIST)) {
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(['prod-01', 'prod-02']));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CART)) {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
    }
  }

  // --- PRODUCTS ---
  getProducts(): Product[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (data !== null) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          // Strictly deduplicate products by ID
          const seen = new Set<string>();
          const deduped: Product[] = [];
          for (const p of parsed) {
            if (!p || typeof p !== 'object') continue;
            const pid = p.id || `prod-${Math.random().toString(36).substring(2, 9)}`;
            if (!seen.has(pid)) {
              seen.add(pid);
              deduped.push({ ...p, id: pid });
            }
          }
          return deduped;
        }
      }
      const dummyCleared = localStorage.getItem('yehmart_dummy_cleared_v1');
      if (dummyCleared === 'true') {
        return [];
      }
      return INITIAL_PRODUCTS;
    } catch {
      return [];
    }
  }

  getDummyProductCount(): number {
    const dummyIds = new Set(INITIAL_PRODUCTS.map((p) => p.id));
    const current = this.getProducts();
    return current.filter((p) => dummyIds.has(p.id)).length;
  }

  clearDummyProducts(): number {
    const dummyIds = new Set(INITIAL_PRODUCTS.map((p) => p.id));
    const current = this.getProducts();
    const remaining = current.filter((p) => !dummyIds.has(p.id));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(remaining));
    localStorage.setItem('yehmart_dummy_cleared_v1', 'true');
    this.recalculateCategoryCounts(remaining);
    return current.length - remaining.length;
  }

  clearAllProducts(): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
    localStorage.setItem('yehmart_dummy_cleared_v1', 'true');
    this.recalculateCategoryCounts([]);
  }

  resetToDummyProductsOnly(): Product[] {
    localStorage.removeItem('yehmart_dummy_cleared_v1');
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    this.recalculateCategoryCounts(INITIAL_PRODUCTS);
    return INITIAL_PRODUCTS;
  }


  bulkImportProducts(
    newProducts: Product[],
    removeDummyFirst = true,
    autoCreateCategories = true
  ): Product[] {
    let existing = this.getProducts();
    if (removeDummyFirst) {
      const dummyIds = new Set(INITIAL_PRODUCTS.map((p) => p.id));
      existing = existing.filter((p) => !dummyIds.has(p.id));
    }

    if (autoCreateCategories) {
      const currentCats = this.getCategories();
      const existingCatNames = new Set(
        currentCats.map((c) => stripHtml(c.name).toLowerCase().trim())
      );
      const existingCatIds = new Set(currentCats.map((c) => c.id.trim()));
      const updatedCats = [...currentCats];

      newProducts.forEach((p) => {
        const rawCatName = (p.categoryName || '').trim();
        const cleanCatName = stripHtml(rawCatName).trim();
        if (!cleanCatName || cleanCatName.length < 2) return;

        const normName = cleanCatName.toLowerCase();
        let catId = (p.categoryId || '').trim();
        if (!catId || catId.startsWith('cat--li-') || catId.includes('<') || catId.includes('>')) {
          catId = `cat-${cleanCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`;
        }

        if (!existingCatNames.has(normName) && !existingCatIds.has(catId)) {
          existingCatNames.add(normName);
          existingCatIds.add(catId);
          updatedCats.push({
            id: catId,
            name: cleanCatName,
            slug: cleanCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'collection',
            description: `Exclusive curated ${cleanCatName} merchandise`,
            imageUrl:
              p.images[0] ||
              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
            displayOrder: updatedCats.length + 1,
            isFeatured: true,
            productCount: 1,
          });
        }
      });

      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updatedCats));
    }

    // Deduplicate combined products by ID
    const seenProductIds = new Set<string>();
    const combined: Product[] = [];
    for (const p of [...newProducts, ...existing]) {
      if (!p || !p.id) continue;
      if (!seenProductIds.has(p.id)) {
        seenProductIds.add(p.id);
        combined.push(p);
      }
    }

    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(combined));
    localStorage.setItem('yehmart_dummy_cleared_v1', 'true');
    this.recalculateCategoryCounts(combined);
    return combined;
  }

  recalculateCategoryCounts(productList?: Product[]): void {
    try {
      const products = productList || this.getProducts();
      const categories = this.getCategories();
      const counts: Record<string, number> = {};

      products.forEach((p) => {
        counts[p.categoryId] = (counts[p.categoryId] || 0) + 1;
      });

      const updated = categories.map((cat) => ({
        ...cat,
        productCount: counts[cat.id] || 0,
      }));

      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
    } catch (e) {
      console.error('Error recalculating category counts', e);
    }
  }

  getProductBySlug(slug: string): Product | undefined {
    return this.getProducts().find((p) => p.slug === slug);
  }

  getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id);
  }

  saveProduct(product: Partial<Product>): Product {
    const products = this.getProducts();
    if (product.id) {
      const index = products.findIndex((p) => p.id === product.id);
      if (index !== -1) {
        products[index] = { ...products[index], ...product };
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
        this.recalculateCategoryCounts(products);
        return products[index];
      }
    }
    // New product
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: product.name || 'Untitled Product',
      slug: (product.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      categoryId: product.categoryId || 'cat-tech-audio',
      categoryName: product.categoryName || 'Tech & Wireless Audio',
      sku: product.sku || `YM-${Math.floor(Math.random() * 8999 + 1000)}`,
      shortDescription: product.shortDescription || '',
      description: product.description || '',
      price: product.price || 1999,
      compareAtPrice: product.compareAtPrice,
      costPrice: product.costPrice,
      stock: product.stock ?? 20,
      lowStockThreshold: product.lowStockThreshold ?? 5,
      images: product.images && product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'],
      specifications: product.specifications || {},
      isPublished: product.isPublished ?? true,
      isFeatured: product.isFeatured ?? false,
      isNewArrival: product.isNewArrival ?? true,
      isBestseller: product.isBestseller ?? false,
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    };
    products.unshift(newProduct);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    this.recalculateCategoryCounts(products);
    return newProduct;
  }

  deleteProduct(productId: string): boolean {
    const products = this.getProducts().filter((p) => p.id !== productId);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    localStorage.setItem('yehmart_dummy_cleared_v1', 'true');
    this.recalculateCategoryCounts(products);
    return true;
  }

  deleteProducts(productIds: string[]): number {
    if (!productIds || productIds.length === 0) return 0;
    const toDelete = new Set(productIds);
    const products = this.getProducts().filter((p) => !toDelete.has(p.id));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    localStorage.setItem('yehmart_dummy_cleared_v1', 'true');
    this.recalculateCategoryCounts(products);
    return toDelete.size;
  }

  setProductsStatus(productIds: string[], isPublished: boolean): number {
    if (!productIds || productIds.length === 0) return 0;
    const targetIds = new Set(productIds);
    const products = this.getProducts().map((p) => {
      if (targetIds.has(p.id)) {
        return { ...p, isPublished };
      }
      return p;
    });
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    this.recalculateCategoryCounts(products);
    return targetIds.size;
  }

  toggleProductStatus(productId: string): Product | undefined {
    const products = this.getProducts();
    const idx = products.findIndex((p) => p.id === productId);
    if (idx === -1) return undefined;
    const current = products[idx].isPublished !== false;
    products[idx] = { ...products[idx], isPublished: !current };
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    this.recalculateCategoryCounts(products);
    return products[idx];
  }

  // --- CATEGORIES ---
  getCategories(): Category[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      const rawList: Category[] = data ? JSON.parse(data) : INITIAL_CATEGORIES;
      if (!Array.isArray(rawList)) {
        return INITIAL_CATEGORIES;
      }

      const seenIds = new Set<string>();
      const seenNames = new Set<string>();
      const cleaned: Category[] = [];

      for (const cat of rawList) {
        if (!cat || typeof cat !== 'object') continue;
        const cleanName = stripHtml(cat.name || '').trim();
        if (!cleanName || cleanName.length < 2) continue;

        // Clean and normalize ID
        let cleanId = (cat.id || '').trim();
        if (
          !cleanId ||
          cleanId.startsWith('cat--li-') ||
          cleanId.includes('<') ||
          cleanId.includes('>') ||
          cleanId.includes('-strong-')
        ) {
          cleanId = `cat-${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'general'}`;
        }

        const normName = cleanName.toLowerCase();
        // Skip duplicate IDs or duplicate Category Names
        if (seenIds.has(cleanId) || seenNames.has(normName)) {
          continue;
        }

        seenIds.add(cleanId);
        seenNames.add(normName);

        cleaned.push({
          ...cat,
          id: cleanId,
          name: cleanName,
          slug: cat.slug
            ? stripHtml(cat.slug).trim().replace(/^-+|-+$/g, '')
            : cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'collection',
          description: cat.description
            ? stripHtml(cat.description).trim()
            : `Exclusive ${cleanName} collection`,
        });
      }

      const finalCats = cleaned.length > 0 ? cleaned : INITIAL_CATEGORIES;

      // Auto-repair persisted localStorage if duplicates or corrupt entries were scrubbed
      if (typeof window !== 'undefined' && cleaned.length !== rawList.length) {
        try {
          localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(finalCats));
        } catch {
          // Ignore write failure
        }
      }

      return finalCats;
    } catch {
      return INITIAL_CATEGORIES;
    }
  }

  // --- FLASH SALE ---
  getFlashSale(): FlashSale {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FLASH_SALE);
      return data ? JSON.parse(data) : INITIAL_FLASH_SALE;
    } catch {
      return INITIAL_FLASH_SALE;
    }
  }

  // --- REVIEWS ---
  getReviewsForProduct(productId: string): Review[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      const all: Review[] = data ? JSON.parse(data) : INITIAL_REVIEWS;
      return all.filter((r) => r.productId === productId);
    } catch {
      return INITIAL_REVIEWS.filter((r) => r.productId === productId);
    }
  }

  addReview(review: Omit<Review, 'id' | 'createdAt' | 'isApproved'>): Review {
    const all = this.getAllReviews();
    const newRev: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      isApproved: true,
      createdAt: new Date().toISOString(),
    };
    all.unshift(newRev);
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(all));

    // Update product rating
    const prodReviews = all.filter((r) => r.productId === review.productId);
    const avgRating = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
    const products = this.getProducts();
    const pIdx = products.findIndex((p) => p.id === review.productId);
    if (pIdx !== -1) {
      products[pIdx].rating = Number(avgRating.toFixed(1));
      products[pIdx].reviewCount = prodReviews.length;
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    }

    return newRev;
  }

  getReviews(): Review[] {
    return this.getAllReviews();
  }

  private getAllReviews(): Review[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      return data ? JSON.parse(data) : INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  }

  // --- COUPONS ---
  getCoupons(): Coupon[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COUPONS);
      return data ? JSON.parse(data) : INITIAL_COUPONS;
    } catch {
      return INITIAL_COUPONS;
    }
  }

  validateCoupon(code: string, subtotal: number): { valid: boolean; discountAmount: number; message: string; coupon?: Coupon } {
    const coupons = this.getCoupons();
    const coupon = coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());

    if (!coupon) {
      return { valid: false, discountAmount: 0, message: 'Invalid coupon code.' };
    }
    if (!coupon.isActive) {
      return { valid: false, discountAmount: 0, message: 'This coupon is no longer active.' };
    }
    if (subtotal < coupon.minOrderAmount) {
      return {
        valid: false,
        discountAmount: 0,
        message: `Requires minimum order of Rs. ${coupon.minOrderAmount.toLocaleString()}.`,
      };
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else {
      discount = coupon.discountValue;
    }

    return {
      valid: true,
      discountAmount: Math.round(discount),
      message: `Coupon applied! You saved Rs. ${Math.round(discount).toLocaleString()}.`,
      coupon,
    };
  }

  saveCoupon(coupon: Coupon): void {
    const coupons = this.getCoupons();
    const index = coupons.findIndex((c) => c.id === coupon.id);
    if (index !== -1) {
      coupons[index] = coupon;
    } else {
      coupons.unshift(coupon);
    }
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
  }

  // --- ORDERS ---
  getOrders(): Order[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return data ? JSON.parse(data) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  }

  getOrderByNumber(orderNumber: string): Order | undefined {
    return this.getOrders().find(
      (o) => o.orderNumber.toUpperCase() === orderNumber.trim().toUpperCase()
    );
  }

  createOrder(
    orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'history' | 'status'>
  ): Order {
    const orders = this.getOrders();
    const orderNumber = `YM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      status: 'pending',
      history: [
        {
          id: `h-${Date.now()}`,
          orderId: `ord-${Date.now()}`,
          status: 'pending',
          note: `Order placed via ${orderData.paymentMethod.replace('_', ' ').toUpperCase()}`,
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Deduct stock safely
    const products = this.getProducts();
    newOrder.items.forEach((item) => {
      const p = products.find((prod) => prod.id === item.productId);
      if (p) {
        p.stock = Math.max(0, p.stock - item.quantity);
      }
    });
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    orders.unshift(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    // Increment coupon used count if any
    if (newOrder.couponCode) {
      const coupons = this.getCoupons();
      const c = coupons.find((cp) => cp.code.toUpperCase() === newOrder.couponCode?.toUpperCase());
      if (c) {
        c.usedCount = (c.usedCount || 0) + 1;
        localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
      }
    }

    return newOrder;
  }

  updateOrderStatus(orderId: string, status: OrderStatus, note?: string, carrier?: 'TCS' | 'Leopards' | 'Trax' | 'PostEx' | 'CallCourier', trackingNum?: string): Order | undefined {
    const orders = this.getOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx === -1) return undefined;

    const order = orders[idx];
    order.status = status;
    order.updatedAt = new Date().toISOString();
    if (carrier) order.trackingCarrier = carrier;
    if (trackingNum) order.trackingNumber = trackingNum;
    if (status === 'delivered') order.paymentStatus = 'paid';

    order.history.push({
      id: `h-${Date.now()}`,
      orderId,
      status,
      note: note || `Status updated to ${status}`,
      createdAt: new Date().toISOString(),
    });

    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    return order;
  }

  // --- CART PERSISTENCE ---
  getCart(): CartItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CART);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveCart(cart: CartItem[]): void {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }

  // --- WISHLIST PERSISTENCE ---
  getWishlist(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  toggleWishlist(productId: string): boolean {
    const list = this.getWishlist();
    const index = list.indexOf(productId);
    let isAdded = false;
    if (index > -1) {
      list.splice(index, 1);
      isAdded = false;
    } else {
      list.push(productId);
      isAdded = true;
    }
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(list));
    return isAdded;
  }

  // --- ADDRESSES ---
  getAddresses(userId?: string): Address[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ADDRESSES);
      const all: Address[] = data ? JSON.parse(data) : [];
      return userId ? all.filter((a) => a.userId === userId) : all;
    } catch {
      return [];
    }
  }

  saveAddress(address: Address): Address[] {
    const all = this.getAddresses();
    const index = all.findIndex((a) => a.id === address.id);
    if (index !== -1) {
      all[index] = address;
    } else {
      if (address.isDefault) {
        all.forEach((a) => (a.isDefault = false));
      }
      all.unshift(address);
    }
    localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(all));
    return all;
  }

  // --- USER AUTH ---
  getCurrentUser(): UserProfile | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : DEMO_CUSTOMER;
    } catch {
      return DEMO_CUSTOMER;
    }
  }

  setCurrentUser(user: UserProfile | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }
}

export const storeService = new StoreService();
