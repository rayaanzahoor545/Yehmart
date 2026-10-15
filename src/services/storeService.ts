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
  OrderItem,
  OrderStatusHistoryItem,
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
import { supabase, isSupabaseConfigured } from './supabase';

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

// Demo Admin reference
export const DEMO_ADMIN: UserProfile = {
  id: 'usr-admin-01',
  email: 'admin@yehmart.pk',
  fullName: 'YehMart Executive Store Manager',
  phone: '03008492026',
  role: 'admin',
  createdAt: '2026-01-01T00:00:00Z',
};

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

class StoreService {
  private productListeners: Array<(products: Product[]) => void> = [];

  constructor() {
    this.initSeedData();
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        this.syncProductsWithSupabase();
      }, 100);
    }
  }

  // Subscribe to changes in products catalog
  subscribeProducts(cb: (products: Product[]) => void): () => void {
    this.productListeners.push(cb);
    return () => {
      this.productListeners = this.productListeners.filter((l) => l !== cb);
    };
  }

  private notifyListeners() {
    const current = this.getProducts();
    this.productListeners.forEach((cb) => {
      try {
        cb(current);
      } catch (e) {
        console.error('Error notifying product listener', e);
      }
    });
  }

  private initSeedData() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
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
      localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.WISHLIST)) {
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CART)) {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
    }

    // Clean up hardcoded demo customer from previous sessions
    try {
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed?.id === 'usr-customer-01' || parsed?.email === 'a.aliahmed9704@gmail.com') {
          localStorage.removeItem(STORAGE_KEYS.USER);
        }
      }
    } catch {}
  }

  // --- SUPABASE LIVE SYNC ---
  async syncProductsWithSupabase(): Promise<Product[]> {
    if (!supabase || !isSupabaseConfigured) {
      return this.getProducts();
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(*)')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase products fetch info:', error.message);
        return this.getProducts();
      }

      if (Array.isArray(data)) {
        const categories = this.getCategories();
        const catMap = new Map(categories.map((c) => [c.id, c.name]));

        const mapped: Product[] = data.map((row: any) => {
          let imgs: string[] = [];
          if (Array.isArray(row.product_images) && row.product_images.length > 0) {
            imgs = row.product_images
              .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
              .map((im: any) => im.url)
              .filter(Boolean);
          } else if (Array.isArray(row.images)) {
            imgs = row.images;
          }
          if (imgs.length === 0) {
            imgs = [
              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
            ];
          }

          return {
            id: row.id,
            name: row.name || 'Untitled Article',
            slug:
              row.slug ||
              (row.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            categoryId: row.category_id || 'general',
            categoryName: catMap.get(row.category_id) || row.category_name || 'General Collection',
            sku: row.sku || `YM-${Math.floor(1000 + Math.random() * 9000)}`,
            shortDescription: row.short_description || '',
            description: row.description || '',
            price: Number(row.price) || 0,
            compareAtPrice: row.compare_at_price ? Number(row.compare_at_price) : undefined,
            costPrice: row.cost_price ? Number(row.cost_price) : undefined,
            stock: typeof row.stock === 'number' ? row.stock : 20,
            lowStockThreshold: row.low_stock_threshold || 5,
            images: imgs,
            specifications: row.specifications || {},
            isPublished: row.is_published !== false,
            isFeatured: Boolean(row.is_featured),
            isNewArrival: Boolean(row.is_new_arrival),
            isBestseller: Boolean(row.is_bestseller),
            rating: Number(row.rating) || 5.0,
            reviewCount: Number(row.review_count) || 0,
            createdAt: row.created_at || new Date().toISOString(),
          };
        });

        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(mapped));
        localStorage.setItem('yehmart_dummy_cleared_v1', 'true');
        this.recalculateCategoryCounts(mapped);
        this.notifyListeners();
        return mapped;
      }
    } catch (e) {
      console.warn('Error during Supabase sync:', e);
    }
    return this.getProducts();
  }

  // --- PRODUCTS ---
  getProducts(): Product[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (data !== null) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
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
      return [];
    } catch {
      return [];
    }
  }

  getDummyProductCount(): number {
    return 0;
  }

  clearDummyProducts(): number {
    return 0;
  }

  clearAllProducts(): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
    localStorage.setItem('yehmart_dummy_cleared_v1', 'true');
    this.recalculateCategoryCounts([]);
    this.notifyListeners();

    if (supabase && isSupabaseConfigured) {
      (async () => {
        try {
          await supabase
            .from('products')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
        } catch (e) {
          console.warn('Supabase clear products note:', e);
        }
      })();
    }
  }

  resetToDummyProductsOnly(): Product[] {
    localStorage.removeItem('yehmart_dummy_cleared_v1');
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    this.recalculateCategoryCounts(INITIAL_PRODUCTS);
    this.notifyListeners();
    return INITIAL_PRODUCTS;
  }

  bulkImportProducts(
    newProducts: Product[],
    removeDummyFirst = true,
    autoCreateCategories = true
  ): Product[] {
    let existing = this.getProducts();

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
    this.notifyListeners();
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
    const isNew = !product.id;
    const finalId = product.id || generateUUID();

    let savedItem: Product;

    if (!isNew) {
      const index = products.findIndex((p) => p.id === finalId);
      if (index !== -1) {
        products[index] = { ...products[index], ...product, id: finalId };
        savedItem = products[index];
      } else {
        savedItem = {
          id: finalId,
          name: product.name || 'Untitled Product',
          slug: (product.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          categoryId: product.categoryId || 'cat-general',
          categoryName: product.categoryName || 'General',
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
        products.unshift(savedItem);
      }
    } else {
      savedItem = {
        id: finalId,
        name: product.name || 'Untitled Product',
        slug: (product.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        categoryId: product.categoryId || 'cat-general',
        categoryName: product.categoryName || 'General',
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
      products.unshift(savedItem);
    }

    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    this.recalculateCategoryCounts(products);
    this.notifyListeners();

    if (supabase && isSupabaseConfigured) {
      (async () => {
        try {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(savedItem.id);
          const payload: any = {
            name: savedItem.name,
            slug: savedItem.slug,
            sku: savedItem.sku,
            short_description: savedItem.shortDescription,
            description: savedItem.description,
            price: savedItem.price,
            compare_at_price: savedItem.compareAtPrice || null,
            cost_price: savedItem.costPrice || null,
            stock: savedItem.stock,
            low_stock_threshold: savedItem.lowStockThreshold,
            is_published: savedItem.isPublished,
            is_featured: savedItem.isFeatured,
            is_new_arrival: savedItem.isNewArrival,
            is_bestseller: savedItem.isBestseller,
            specifications: savedItem.specifications,
          };
          if (isUuid) payload.id = savedItem.id;
          await supabase.from('products').upsert(payload);
        } catch (e) {
          console.warn('Supabase product save note:', e);
        }
      })();
    }

    return savedItem;
  }

  deleteProduct(productId: string): boolean {
    const products = this.getProducts().filter((p) => p.id !== productId);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    localStorage.setItem('yehmart_dummy_cleared_v1', 'true');
    this.recalculateCategoryCounts(products);
    this.notifyListeners();

    if (supabase && isSupabaseConfigured) {
      (async () => {
        try {
          await supabase.from('products').delete().eq('id', productId);
        } catch (e) {
          console.warn('Supabase delete error note:', e);
        }
      })();
    }

    return true;
  }

  deleteProducts(productIds: string[]): number {
    if (!productIds || productIds.length === 0) return 0;
    const toDelete = new Set(productIds);
    const products = this.getProducts().filter((p) => !toDelete.has(p.id));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    localStorage.setItem('yehmart_dummy_cleared_v1', 'true');
    this.recalculateCategoryCounts(products);
    this.notifyListeners();

    if (supabase && isSupabaseConfigured) {
      (async () => {
        try {
          await supabase.from('products').delete().in('id', productIds);
        } catch (e) {
          console.warn('Supabase bulk delete note:', e);
        }
      })();
    }

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
    this.notifyListeners();

    if (supabase && isSupabaseConfigured) {
      (async () => {
        try {
          await supabase.from('products').update({ is_published: isPublished }).in('id', productIds);
        } catch {}
      })();
    }

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
    this.notifyListeners();

    if (supabase && isSupabaseConfigured) {
      (async () => {
        try {
          await supabase.from('products').update({ is_published: !current }).eq('id', productId);
        } catch {}
      })();
    }

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
        if (seenIds.has(cleanId) || seenNames.has(normName)) {
          continue;
        }

        seenIds.add(cleanId);
        seenNames.add(normName);

        cleaned.push({
          ...cat,
          id: cleanId,
          name: cleanName,
          slug: cat.slug || cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'collection',
        });
      }

      return cleaned;
    } catch {
      return INITIAL_CATEGORIES;
    }
  }

  getCategoryBySlug(slug: string): Category | undefined {
    return this.getCategories().find((c) => c.slug === slug);
  }

  saveCategory(category: Partial<Category>): Category {
    const categories = this.getCategories();
    if (category.id) {
      const index = categories.findIndex((c) => c.id === category.id);
      if (index !== -1) {
        categories[index] = { ...categories[index], ...category };
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
        return categories[index];
      }
    }
    const newCategory: Category = {
      id: category.id || `cat-${Date.now()}`,
      name: category.name || 'New Category',
      slug: (category.name || 'category').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: category.description || '',
      imageUrl: category.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      displayOrder: categories.length + 1,
      isFeatured: category.isFeatured ?? true,
      productCount: 0,
    };
    categories.push(newCategory);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    return newCategory;
  }

  // --- ORDERS ---
  getOrders(): Order[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  getOrderById(id: string): Order | undefined {
    return this.getOrders().find((o) => o.id === id);
  }

  getOrderByNumber(orderNumber: string): Order | undefined {
    const clean = orderNumber.trim().toUpperCase();
    return this.getOrders().find(
      (o) =>
        o.orderNumber.toUpperCase() === clean ||
        (o.trackingNumber && o.trackingNumber.toUpperCase() === clean) ||
        o.id.toUpperCase() === clean
    );
  }

  getOrderByTrackingNumber(trackingNumber: string): Order | undefined {
    return this.getOrderByNumber(trackingNumber);
  }

  createOrder(orderData: Partial<Order>): Order {
    const orders = this.getOrders();
    const orderId = generateUUID();
    const newOrder: Order = {
      id: orderId,
      orderNumber: `YM-${new Date().getFullYear().toString().slice(-2)}${Math.floor(100000 + Math.random() * 900000)}`,
      userId: orderData.userId,
      customerName: orderData.customerName || 'Customer',
      customerEmail: orderData.customerEmail || '',
      customerPhone: orderData.customerPhone || '',
      shippingAddress: orderData.shippingAddress || {
        recipientName: orderData.customerName || 'Customer',
        phone: orderData.customerPhone || '',
        streetAddress: 'House / Street',
        city: 'Lahore',
        province: 'Punjab',
      },
      deliveryNotes: orderData.deliveryNotes,
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      discountAmount: orderData.discountAmount || 0,
      couponCode: orderData.couponCode,
      shippingFee: orderData.shippingFee || 0,
      totalAmount: orderData.totalAmount || 0,
      status: 'pending',
      paymentMethod: orderData.paymentMethod || 'cash_on_delivery',
      paymentStatus: 'unpaid',
      trackingCarrier: 'TCS',
      trackingNumber: `TCS${Math.floor(10000000 + Math.random() * 90000000)}`,
      history: [
        {
          id: generateUUID(),
          orderId: orderId,
          status: 'pending',
          note: 'Consignment booked successfully via YehMart portal.',
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orders.unshift(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    if (supabase && isSupabaseConfigured) {
      (async () => {
        try {
          await supabase.from('orders').insert({
            id: newOrder.id,
            order_number: newOrder.orderNumber,
            customer_name: newOrder.customerName,
            customer_email: newOrder.customerEmail,
            customer_phone: newOrder.customerPhone,
            shipping_address: newOrder.shippingAddress,
            subtotal: newOrder.subtotal,
            discount_amount: newOrder.discountAmount,
            shipping_fee: newOrder.shippingFee,
            total_amount: newOrder.totalAmount,
            payment_method: newOrder.paymentMethod,
            payment_status: newOrder.paymentStatus,
            delivery_notes: newOrder.deliveryNotes,
          });
        } catch (e) {
          console.warn('Supabase order creation note:', e);
        }
      })();
    }

    return newOrder;
  }

  updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    note?: string,
    carrier?: any,
    trackingNumber?: string
  ): Order | undefined {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) return undefined;

    const currentOrder = orders[index];
    const newHistory: OrderStatusHistoryItem[] = [
      ...(currentOrder.history || []),
      {
        id: generateUUID(),
        orderId,
        status,
        note: note || `Status updated to ${status}.`,
        createdAt: new Date().toISOString(),
      },
    ];

    orders[index] = {
      ...currentOrder,
      status,
      trackingCarrier: carrier || currentOrder.trackingCarrier,
      trackingNumber: trackingNumber || currentOrder.trackingNumber,
      history: newHistory,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    return orders[index];
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

  saveCoupon(coupon: Coupon): Coupon {
    const coupons = this.getCoupons();
    const index = coupons.findIndex((c) => c.id === coupon.id);
    if (index !== -1) {
      coupons[index] = coupon;
    } else {
      coupons.unshift(coupon);
    }
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
    return coupon;
  }

  validateCoupon(code: string, cartSubtotal: number): {
    valid: boolean;
    discountAmount: number;
    discount: number;
    message: string;
    coupon?: Coupon;
  } {
    const cleanCode = code.trim().toUpperCase();
    const coupons = this.getCoupons();
    const coupon = coupons.find((c) => c.code.toUpperCase() === cleanCode);

    if (!coupon) {
      return { valid: false, discountAmount: 0, discount: 0, message: 'Invalid voucher code.' };
    }
    if (!coupon.isActive) {
      return { valid: false, discountAmount: 0, discount: 0, message: 'This promo code is currently inactive.' };
    }
    const now = new Date().toISOString();
    if (coupon.validFrom && now < coupon.validFrom) {
      return { valid: false, discountAmount: 0, discount: 0, message: 'This promo voucher has not started yet.' };
    }
    if (coupon.validUntil && now > coupon.validUntil) {
      return { valid: false, discountAmount: 0, discount: 0, message: 'This promo voucher has expired.' };
    }
    if (cartSubtotal < coupon.minOrderAmount) {
      return {
        valid: false,
        discountAmount: 0,
        discount: 0,
        message: `Cart subtotal must be at least Rs. ${coupon.minOrderAmount.toLocaleString()} to apply.`,
      };
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (cartSubtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else {
      discount = coupon.discountValue;
    }

    const finalDiscount = Math.min(discount, cartSubtotal);
    return {
      valid: true,
      discountAmount: finalDiscount,
      discount: finalDiscount,
      message: `Coupon applied: ${coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `Rs. ${coupon.discountValue} OFF`}`,
      coupon,
    };
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
  getReviews(productId?: string): Review[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      const all: Review[] = data ? JSON.parse(data) : INITIAL_REVIEWS;
      return productId ? all.filter((r) => r.productId === productId && r.isApproved) : all;
    } catch {
      return INITIAL_REVIEWS;
    }
  }

  getReviewsForProduct(productId: string): Review[] {
    return this.getReviews(productId);
  }

  addReview(reviewData: Partial<Review>): Review {
    const reviews = this.getReviews();
    const newReview: Review = {
      id: generateUUID(),
      productId: reviewData.productId || '',
      userName: reviewData.userName || 'Verified Shopper',
      userEmail: reviewData.userEmail,
      rating: reviewData.rating || 5,
      title: reviewData.title || 'Excellent article',
      comment: reviewData.comment || '',
      isVerifiedPurchase: true,
      isApproved: true,
      createdAt: new Date().toISOString(),
    };
    reviews.unshift(newReview);
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
    return newReview;
  }

  // --- CART & WISHLIST STORAGE ---
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
    const idx = list.indexOf(productId);
    let isIn = false;
    if (idx !== -1) {
      list.splice(idx, 1);
      isIn = false;
    } else {
      list.push(productId);
      isIn = true;
    }
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(list));
    return isIn;
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
      if (!data) return null;
      const parsed = JSON.parse(data);
      if (parsed && (parsed.id === 'usr-customer-01' || parsed.email === 'a.aliahmed9704@gmail.com')) {
        localStorage.removeItem(STORAGE_KEYS.USER);
        return null;
      }
      return parsed;
    } catch {
      return null;
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
