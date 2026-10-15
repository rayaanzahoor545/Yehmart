import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tag,
  AlertTriangle,
  TrendingUp,
  Clock,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Truck,
  Search,
  DollarSign,
  ArrowUpRight,
  Download,
  ExternalLink,
  FileText,
  Layers,
  Settings,
  MessageSquare,
  Eye,
  EyeOff,
  Star,
  Copy,
  Check,
  X,
  Bell,
  Phone,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  Filter,
  ChevronRight,
  ChevronLeft,
  Image as ImageIcon,
  Percent,
  Hash,
  Send,
  Printer,
  ChevronDown,
  UploadCloud,
  FileSpreadsheet,
} from 'lucide-react';
import { storeService } from '../services/storeService';
import { Product, Order, Coupon, OrderStatus, ProductVariant, Review, Category } from '../types';
import { formatPKR, COURIER_PARTNERS, SITE_CONFIG } from '../config/site';
import { RichTextEditor } from '../components/admin/RichTextEditor';
import { ProductImageUploader } from '../components/admin/ProductImageUploader';
import { CSVProductImporter } from '../components/admin/CSVProductImporter';
import { stripHtml, FALLBACK_PRODUCT_IMAGE } from '../utils/htmlUtils';
import { BrandLogo } from '../components/common/BrandLogo';

interface AdminDashboardViewProps {
  onBackToStorefront: () => void;
}

type AdminSection =
  | 'overview'
  | 'products'
  | 'orders'
  | 'inventory'
  | 'coupons'
  | 'reviews'
  | 'settings';

type ProductModalTab = 'general' | 'content' | 'pricing' | 'inventory' | 'media' | 'specs';

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  onBackToStorefront,
}) => {
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');

  // Main collections state
  const [products, setProducts] = useState<Product[]>(() => storeService.getProducts());
  const [orders, setOrders] = useState<Order[]>(() => storeService.getOrders());
  const [coupons, setCoupons] = useState<Coupon[]>(() => storeService.getCoupons());
  const [categories, setCategories] = useState<Category[]>(() => storeService.getCategories());
  const [reviews, setReviews] = useState<Review[]>(() => storeService.getReviews());

  // CSV Importer & Alerts state
  const [showCsvImporter, setShowCsvImporter] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Global search & notifications
  const [globalSearch, setGlobalSearch] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  // Supabase Configuration from environment
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  const isSupabaseConfigured = Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseUrl.includes('your-project')
  );

  // Product Add / Edit Modal state
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [productModalTab, setProductModalTab] = useState<ProductModalTab>('general');
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecVal, setNewSpecVal] = useState('');

  // Order status update modal state
  const [selectedOrderForEdit, setSelectedOrderForEdit] = useState<Order | null>(null);
  const [orderNewStatus, setOrderNewStatus] = useState<OrderStatus>('confirmed');
  const [orderCarrier, setOrderCarrier] = useState<'TCS' | 'Leopards' | 'PostEx' | 'Trax'>('TCS');
  const [orderTrackingNum, setOrderTrackingNum] = useState('');
  const [orderNote, setOrderNote] = useState('');

  // Packing Slip / Invoice Modal
  const [viewingInvoiceOrder, setViewingInvoiceOrder] = useState<Order | null>(null);

  // Product Catalog Filters, Bulk Selection & Pagination
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState<string>('all');
  const [productStockFilter, setProductStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [productStatusFilter, setProductStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [productPageSize, setProductPageSize] = useState<number | 'all'>(20);
  const [productCurrentPage, setProductCurrentPage] = useState<number>(1);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // In-app Deletion & Wipe Modals (No native browser alert/confirm blocking)
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isClearDummyModalOpen, setIsClearDummyModalOpen] = useState(false);
  const [isResetToDummyModalOpen, setIsResetToDummyModalOpen] = useState(false);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);

  // Orders Management Filters
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Coupon create state
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponVal, setNewCouponVal] = useState(15);
  const [newCouponMin, setNewCouponMin] = useState(2500);

  // Store Settings state
  const [settingsFreeShip, setSettingsFreeShip] = useState(SITE_CONFIG.freeShippingThreshold);
  const [settingsShipFee, setSettingsShipFee] = useState(SITE_CONFIG.standardShippingFee);
  const [settingsSupportPhone, setSettingsSupportPhone] = useState(SITE_CONFIG.supportPhone);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  // Quick feedback copied state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // --- DERIVED METRICS ---
  const totalRevenue = useMemo(() => orders.reduce((sum, o) => sum + o.totalAmount, 0), [orders]);
  const totalOrdersCount = orders.length;
  const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;
  const pendingOrders = useMemo(() => orders.filter((o) => o.status === 'pending'), [orders]);
  const lowStockProducts = useMemo(
    () => products.filter((p) => p.stock <= p.lowStockThreshold),
    [products]
  );
  const outOfStockProducts = useMemo(() => products.filter((p) => p.stock === 0), [products]);

  // Notifications
  const notificationsList = useMemo(() => {
    const list = [];
    if (pendingOrders.length > 0) {
      list.push({
        id: 'notif-pending',
        type: 'order',
        title: `${pendingOrders.length} Pending COD Orders`,
        desc: 'Customer verification required before courier rider dispatch.',
        action: () => {
          setActiveSection('orders');
          setOrderStatusFilter('pending');
          setShowNotifications(false);
        },
      });
    }
    if (lowStockProducts.length > 0) {
      list.push({
        id: 'notif-stock',
        type: 'stock',
        title: `${lowStockProducts.length} Articles Low in Stock`,
        desc: 'Inventory in Lahore hub below safety reorder threshold.',
        action: () => {
          setActiveSection('inventory');
          setShowNotifications(false);
        },
      });
    }
    return list;
  }, [pendingOrders, lowStockProducts]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase());
      const matchCat = productCatFilter === 'all' || p.categoryId === productCatFilter;
      const matchStock =
        productStockFilter === 'all'
          ? true
          : productStockFilter === 'in_stock'
          ? p.stock > p.lowStockThreshold
          : productStockFilter === 'low_stock'
          ? p.stock <= p.lowStockThreshold && p.stock > 0
          : p.stock === 0;
      const matchStatus =
        productStatusFilter === 'all'
          ? true
          : productStatusFilter === 'published'
          ? p.isPublished !== false
          : p.isPublished === false;
      return matchSearch && matchCat && matchStock && matchStatus;
    });
  }, [products, productSearch, productCatFilter, productStockFilter, productStatusFilter]);

  // Reset page when filter controls change
  React.useEffect(() => {
    setProductCurrentPage(1);
  }, [productSearch, productCatFilter, productStockFilter, productStatusFilter, productPageSize]);

  // Admin Products Pagination & Slices
  const totalAdminProducts = filteredProducts.length;
  const totalAdminProductPages =
    productPageSize === 'all' ? 1 : Math.max(1, Math.ceil(totalAdminProducts / productPageSize));
  const safeAdminProductPage = Math.min(productCurrentPage, totalAdminProductPages);

  const paginatedAdminProducts = useMemo(() => {
    if (productPageSize === 'all') return filteredProducts;
    const start = (safeAdminProductPage - 1) * productPageSize;
    return filteredProducts.slice(start, start + productPageSize);
  }, [filteredProducts, safeAdminProductPage, productPageSize]);

  const adminProductStartIndex =
    productPageSize === 'all' ? 1 : totalAdminProducts === 0 ? 0 : (safeAdminProductPage - 1) * productPageSize + 1;
  const adminProductEndIndex =
    productPageSize === 'all' ? totalAdminProducts : Math.min(totalAdminProducts, safeAdminProductPage * productPageSize);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerPhone.includes(orderSearch) ||
        o.shippingAddress.city.toLowerCase().includes(orderSearch.toLowerCase());
      const matchStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  // --- ACTIONS & HANDLERS ---
  const handleOpenAddProduct = () => {
    setEditingProduct({
      id: '',
      name: '',
      slug: '',
      sku: `YM-${Date.now().toString().slice(-4)}`,
      categoryId: categories[0]?.id || 'cat-tech-audio',
      categoryName: categories[0]?.name || 'Tech & Wireless Audio',
      shortDescription: '',
      description: '<h3>Engineered Architecture</h3><p>Enter comprehensive product details...</p>',
      price: 4999,
      compareAtPrice: 6500,
      costPrice: 2800,
      stock: 25,
      lowStockThreshold: 5,
      images: ['/src/assets/images/hero_kavan_showcase_1791062087100.jpg'],
      specifications: {
        Warranty: '1-Year Official Replacement',
        Material: 'Aerospace Grade Alloy',
        Packaging: 'YehMart Sealed Luxury Box',
      },
      variants: [],
      isPublished: true,
      isFeatured: false,
      isNewArrival: true,
      isBestseller: false,
      rating: 5.0,
      reviewCount: 1,
    });
    setProductModalTab('general');
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct({ ...p });
    setProductModalTab('general');
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name) return;

    storeService.saveProduct(editingProduct);
    setProducts(storeService.getProducts());
    setEditingProduct(null);
  };

  const handleDeleteProductPrompt = (id: string, name: string) => {
    setProductToDelete({ id, name });
  };

  const handleConfirmDeleteProduct = () => {
    if (!productToDelete) return;
    const { id, name } = productToDelete;
    storeService.deleteProduct(id);
    setProducts(storeService.getProducts());
    setCategories(storeService.getCategories());
    setSelectedProductIds((prev) => prev.filter((pid) => pid !== id));
    setProductToDelete(null);
    setSuccessBanner(`Article "${stripHtml(name)}" was permanently deleted.`);
    setTimeout(() => setSuccessBanner(null), 5000);
  };

  const handleToggleProductStatus = (productId: string) => {
    const updated = storeService.toggleProductStatus(productId);
    if (updated) {
      setProducts(storeService.getProducts());
      const isNowActive = updated.isPublished !== false;
      setSuccessBanner(
        `"${stripHtml(updated.name)}" is now ${isNowActive ? 'Active (Visible on store)' : 'Inactive (Hidden / Draft)'}`
      );
      setTimeout(() => setSuccessBanner(null), 4000);
    }
  };

  const handleBulkSetStatus = (isPublished: boolean) => {
    if (selectedProductIds.length === 0) return;
    const count = storeService.setProductsStatus(selectedProductIds, isPublished);
    setProducts(storeService.getProducts());
    setSuccessBanner(
      `Set ${count} articles to ${isPublished ? 'Active (Published)' : 'Inactive (Hidden from store)'} successfully!`
    );
    setTimeout(() => setSuccessBanner(null), 5000);
  };

  const handleConfirmBulkDelete = () => {
    if (selectedProductIds.length === 0) return;
    const count = storeService.deleteProducts(selectedProductIds);
    setProducts(storeService.getProducts());
    setCategories(storeService.getCategories());
    setSelectedProductIds([]);
    setIsBulkDeleteModalOpen(false);
    setSuccessBanner(`Permanently deleted ${count} selected articles.`);
    setTimeout(() => setSuccessBanner(null), 5000);
  };

  const handleToggleSelectProduct = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleSelectAllCurrentPage = () => {
    const currentPageIds = paginatedAdminProducts.map((p) => p.id);
    const allSelected = currentPageIds.length > 0 && currentPageIds.every((id) => selectedProductIds.includes(id));
    if (allSelected) {
      setSelectedProductIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    } else {
      setSelectedProductIds((prev) => Array.from(new Set([...prev, ...currentPageIds])));
    }
  };

  const handleClearDummyProductsPrompt = () => {
    const dummyCount = storeService.getDummyProductCount();
    if (dummyCount === 0) {
      setSuccessBanner('There are no dummy demo products remaining in the catalog.');
      setTimeout(() => setSuccessBanner(null), 4000);
      return;
    }
    setIsClearDummyModalOpen(true);
  };

  const handleConfirmClearDummyProducts = () => {
    const removedCount = storeService.clearDummyProducts();
    setProducts(storeService.getProducts());
    setCategories(storeService.getCategories());
    setSelectedProductIds([]);
    setIsClearDummyModalOpen(false);
    setSuccessBanner(
      `Wiped ${removedCount} dummy products. Your catalog is now ready for your authentic merchandise!`
    );
    setTimeout(() => setSuccessBanner(null), 6000);
  };

  const handleConfirmResetToDummy = () => {
    const dummyList = storeService.resetToDummyProductsOnly();
    setProducts(dummyList);
    setCategories(storeService.getCategories());
    setSelectedProductIds([]);
    setIsResetToDummyModalOpen(false);
    setSuccessBanner(
      `Catalog restored! Only the standard ${dummyList.length} dummy merchandise items are kept. All extra/unwanted items have been wiped. You can now cleanly upload your CSV file!`
    );
    setTimeout(() => setSuccessBanner(null), 8000);
  };

  const handleConfirmClearAllProducts = () => {
    storeService.clearAllProducts();
    setProducts([]);
    setCategories(storeService.getCategories());
    setSelectedProductIds([]);
    setIsClearAllModalOpen(false);
    setSuccessBanner(
      'All products have been completely removed from this website! The store catalog is now clean (0 products) and ready for your CSV upload.'
    );
    setTimeout(() => setSuccessBanner(null), 8000);
  };

  const handleImportCsvSuccess = (
    importedProducts: Product[],
    removeDummyProducts: boolean,
    autoCreateCategories: boolean
  ) => {
    storeService.bulkImportProducts(importedProducts, removeDummyProducts, autoCreateCategories);
    setProducts(storeService.getProducts());
    setCategories(storeService.getCategories());
    setSuccessBanner(
      `Successfully imported ${importedProducts.length} articles from CSV${
        removeDummyProducts ? ' and removed all dummy demo products' : ''
      }!`
    );
    setTimeout(() => setSuccessBanner(null), 7000);
  };

  const handleUpdateOrderStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForEdit) return;

    storeService.updateOrderStatus(
      selectedOrderForEdit.id,
      orderNewStatus,
      orderNote || `Status set to ${orderNewStatus} via Executive Dashboard`,
      orderCarrier,
      orderTrackingNum
    );

    setOrders(storeService.getOrders());
    setSelectedOrderForEdit(null);
  };

  const handleQuickConfirmOrder = (order: Order) => {
    const carrier = order.trackingCarrier || 'TCS';
    const autoTracking = `${carrier.toUpperCase()}-${Math.floor(10000000 + Math.random() * 90000000)}`;
    storeService.updateOrderStatus(
      order.id,
      'confirmed',
      'COD Order confirmed by Lahore Admin. Consignment queued for packaging.',
      carrier,
      autoTracking
    );
    setOrders(storeService.getOrders());
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;

    const newCoupon: Coupon = {
      id: `coup-${Date.now()}`,
      code: newCouponCode.trim().toUpperCase(),
      discountType: newCouponType,
      discountValue: newCouponVal,
      minOrderAmount: newCouponMin,
      usageLimit: 500,
      usedCount: 0,
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
      isActive: true,
    };

    storeService.saveCoupon(newCoupon);
    setCoupons(storeService.getCoupons());
    setNewCouponCode('');
  };

  const handleToggleCoupon = (coupon: Coupon) => {
    const updated = { ...coupon, isActive: !coupon.isActive };
    storeService.saveCoupon(updated);
    setCoupons(storeService.getCoupons());
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportOrdersCSV = () => {
    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Customer Phone',
      'City',
      'Items Count',
      'Total Amount (PKR)',
      'Payment Method',
      'Status',
      'Courier',
      'Tracking Number',
    ];
    const rows = orders.map((o) => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleDateString(),
      `"${o.customerName}"`,
      `"${o.customerPhone}"`,
      `"${o.shippingAddress.city}"`,
      o.items.reduce((s, i) => s + i.quantity, 0),
      o.totalAmount,
      o.paymentMethod,
      o.status,
      o.trackingCarrier || 'TCS',
      o.trackingNumber || 'Unassigned',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `yehmart_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportProductsCSV = () => {
    const headers = ['SKU', 'Name', 'Category', 'Price (PKR)', 'Cost Price (PKR)', 'Stock', 'Status'];
    const rows = products.map((p) => [
      p.sku,
      `"${p.name}"`,
      `"${p.categoryName}"`,
      p.price,
      p.costPrice || 0,
      p.stock,
      p.isPublished ? 'Published' : 'Draft',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `yehmart_catalog_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    SITE_CONFIG.freeShippingThreshold = Number(settingsFreeShip);
    SITE_CONFIG.standardShippingFee = Number(settingsShipFee);
    SITE_CONFIG.supportPhone = settingsSupportPhone;
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3000);
  };

  const generateWhatsAppConfirmationLink = (order: Order) => {
    const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
    const intlPhone = cleanPhone.startsWith('0') ? '92' + cleanPhone.slice(1) : cleanPhone;
    const message = encodeURIComponent(
      `Assalam-o-Alaikum ${order.customerName}! YehMart Customer Care here. We have received your Cash-on-Delivery Order #${order.orderNumber} for Rs. ${order.totalAmount.toLocaleString()} to ${order.shippingAddress.streetAddress}, ${order.shippingAddress.city}. Please reply 'YES' to confirm and dispatch via TCS Express.`
    );
    return `https://wa.me/${intlPhone}?text=${message}`;
  };

  return (
    <div className="bg-stone-900 min-h-screen text-stone-100 font-['Urbanist','Plus_Jakarta_Sans',sans-serif] selection:bg-amber-400 selection:text-stone-950 flex flex-col">
      {/* 1. EXECUTIVE ADMIN TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-stone-950/95 backdrop-blur-xl border-b border-stone-800 py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand & Store Status Pill */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <BrandLogo variant="dark" size="sm" onClick={onBackToStorefront} />
              <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase font-bold bg-amber-400 text-stone-950">
                PRO ADMIN
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-stone-800 text-xs font-mono text-stone-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Lahore Hub: Dispatch Active</span>
              <span className="text-stone-600">·</span>
              <span className="text-stone-300">TCS/Leopards COD API: Connected</span>
            </div>
          </div>

          {/* Quick Actions & Launch Storefront */}
          <div className="flex items-center gap-3">
            {/* Notifications Button */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 transition-colors relative"
                aria-label="Alerts"
              >
                <Bell className="w-4 h-4" />
                {notificationsList.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold flex items-center justify-center">
                    {notificationsList.length}
                  </span>
                )}
              </button>

              {/* Notification Drawer */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-stone-950 border border-stone-800 rounded-2xl shadow-2xl p-4 z-50 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                    <span className="text-xs font-bold font-mono tracking-wider text-amber-300 uppercase">
                      Operational Alerts
                    </span>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-stone-500 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {notificationsList.length === 0 ? (
                    <div className="text-xs text-stone-400 py-4 text-center">
                      All orders and inventory levels are completely healthy.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {notificationsList.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={notif.action}
                          className="p-3 rounded-xl bg-stone-900/90 border border-stone-800/80 hover:border-amber-400/50 cursor-pointer transition-all space-y-1"
                        >
                          <div className="text-xs font-bold text-white flex items-center justify-between">
                            <span>{notif.title}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
                          </div>
                          <p className="text-[11px] text-stone-400 leading-relaxed">
                            {notif.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Add Product Shortcut */}
            <button
              onClick={handleOpenAddProduct}
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/10"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Product</span>
            </button>

            {/* Back to Live Storefront */}
            <button
              onClick={onBackToStorefront}
              className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold rounded-xl border border-stone-700 transition-all flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4 text-amber-400" />
              <span>Live Store</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. ADMIN CORE WORKSPACE (Sidebar + Content Stage) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar (3 cols) */}
        <aside className="lg:col-span-3 bg-stone-950 border border-stone-800 rounded-3xl p-4 shadow-xl space-y-6 sticky top-20">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-stone-500 px-3 pb-2">
              Workspace Navigation
            </div>
            <nav className="space-y-1 text-xs font-bold">
              <button
                onClick={() => setActiveSection('overview')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  activeSection === 'overview'
                    ? 'bg-white text-stone-950 shadow-md'
                    : 'text-stone-400 hover:text-white hover:bg-stone-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Overview & KPIs</span>
                </div>
              </button>

              <button
                onClick={() => setActiveSection('products')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  activeSection === 'products'
                    ? 'bg-white text-stone-950 shadow-md'
                    : 'text-stone-400 hover:text-white hover:bg-stone-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4" />
                  <span>Catalog & Rich Editor</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-stone-800 text-[10px] font-mono text-stone-300">
                  {products.length}
                </span>
              </button>

              <button
                onClick={() => setActiveSection('orders')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  activeSection === 'orders'
                    ? 'bg-white text-stone-950 shadow-md'
                    : 'text-stone-400 hover:text-white hover:bg-stone-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Orders & Fulfillment</span>
                </div>
                {pendingOrders.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-mono font-bold">
                    {pendingOrders.length} COD
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveSection('inventory')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  activeSection === 'inventory'
                    ? 'bg-white text-stone-950 shadow-md'
                    : 'text-stone-400 hover:text-white hover:bg-stone-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Stock Health Alerts</span>
                </div>
                {lowStockProducts.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-mono">
                    {lowStockProducts.length} low
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveSection('coupons')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  activeSection === 'coupons'
                    ? 'bg-white text-stone-950 shadow-md'
                    : 'text-stone-400 hover:text-white hover:bg-stone-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Tag className="w-4 h-4" />
                  <span>Coupons & Flash Drops</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-stone-800 text-[10px] font-mono text-stone-300">
                  {coupons.length}
                </span>
              </button>

              <button
                onClick={() => setActiveSection('reviews')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  activeSection === 'reviews'
                    ? 'bg-white text-stone-950 shadow-md'
                    : 'text-stone-400 hover:text-white hover:bg-stone-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Star className="w-4 h-4" />
                  <span>Verified Buyer Reviews</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-stone-800 text-[10px] font-mono text-stone-300">
                  {reviews.length}
                </span>
              </button>

              <button
                onClick={() => setActiveSection('settings')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  activeSection === 'settings'
                    ? 'bg-white text-stone-950 shadow-md'
                    : 'text-stone-400 hover:text-white hover:bg-stone-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4" />
                  <span>Store Shipping & COD</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Quick Operations Summary */}
          <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800/80 space-y-2.5 text-xs">
            <span className="text-[10px] font-mono text-amber-300 font-bold uppercase tracking-wider">
              OPERATIONS QUICK STATUS
            </span>
            <div className="flex items-center justify-between text-stone-400">
              <span>Gross Catalog Value:</span>
              <span className="text-white font-mono font-bold">
                {formatPKR(products.reduce((acc, p) => acc + p.price * p.stock, 0))}
              </span>
            </div>
            <div className="flex items-center justify-between text-stone-400">
              <span>Avg Gross Margin:</span>
              <span className="text-emerald-400 font-mono font-bold">48.2%</span>
            </div>
            <div className="flex items-center justify-between text-stone-400">
              <span>Primary Couriers:</span>
              <span className="text-stone-200 font-mono">TCS, Leopards</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area (9 cols) */}
        <main className="lg:col-span-9 space-y-8">
          {/* ========================================================================= */}
          {/* 1. OVERVIEW & ANALYTICS SECTION */}
          {/* ========================================================================= */}
          {activeSection === 'overview' && (
            <div className="space-y-8">
              {/* Top KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                  <div className="flex items-center justify-between text-stone-400 text-xs">
                    <span className="font-semibold uppercase tracking-wider">Total Sales</span>
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black font-mono text-white">
                    {formatPKR(totalRevenue)}
                  </div>
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>+18.4% vs last week</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                  <div className="flex items-center justify-between text-stone-400 text-xs">
                    <span className="font-semibold uppercase tracking-wider">Consignments</span>
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-black font-mono text-white">
                    {totalOrdersCount}
                  </div>
                  <div className="text-[11px] text-amber-300">
                    {pendingOrders.length} pending COD verification
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                  <div className="flex items-center justify-between text-stone-400 text-xs">
                    <span className="font-semibold uppercase tracking-wider">Avg Order Value</span>
                    <Percent className="w-4 h-4 text-teal-400" />
                  </div>
                  <div className="text-2xl font-black font-mono text-white">
                    {formatPKR(avgOrderValue)}
                  </div>
                  <div className="text-[11px] text-stone-400 font-mono">
                    High-ticket single vendor basket
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                  <div className="flex items-center justify-between text-stone-400 text-xs">
                    <span className="font-semibold uppercase tracking-wider">Stock Health</span>
                    <Package className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="text-2xl font-black font-mono text-white">
                    {products.reduce((s, p) => s + p.stock, 0)} Units
                  </div>
                  <div className="text-[11px] text-rose-400">
                    {lowStockProducts.length} articles need reorder
                  </div>
                </div>
              </div>

              {/* Action Banner for Pending Orders */}
              {pendingOrders.length > 0 && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-300 uppercase">
                      <Clock className="w-4 h-4" />
                      <span>{pendingOrders.length} Orders Awaiting Verification</span>
                    </div>
                    <p className="text-xs text-stone-300">
                      Confirm recipient delivery addresses via WhatsApp or phone before handing parcels to TCS.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveSection('orders');
                      setOrderStatusFilter('pending');
                    }}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-xl transition-all shrink-0"
                  >
                    View Pending Orders
                  </button>
                </div>
              )}

              {/* Recent Orders Velocity */}
              <div className="bg-stone-950 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white font-['Syne']">
                      Recent Store Dispatches
                    </h3>
                    <p className="text-xs text-stone-400">
                      Real-time live transactions from buyers across Pakistan
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveSection('orders')}
                    className="text-xs font-bold text-amber-300 hover:underline flex items-center gap-1"
                  >
                    <span>View All Orders</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-900 border-b border-stone-800 text-stone-400 font-mono uppercase tracking-wider">
                      <tr>
                        <th className="p-3.5">Order</th>
                        <th className="p-3.5">Buyer</th>
                        <th className="p-3.5">Destination</th>
                        <th className="p-3.5">Amount</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Quick Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-900">
                      {orders.slice(0, 5).map((o) => (
                        <tr key={o.id} className="hover:bg-stone-900/50 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-white">
                            {o.orderNumber}
                          </td>
                          <td className="p-3.5 text-stone-300">
                            {o.customerName}
                          </td>
                          <td className="p-3.5 text-stone-400 font-mono">
                            {o.shippingAddress.city}
                          </td>
                          <td className="p-3.5 font-mono font-bold text-emerald-400">
                            {formatPKR(o.totalAmount)}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                o.status === 'pending'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : o.status === 'confirmed'
                                  ? 'bg-blue-500/20 text-blue-300'
                                  : o.status === 'delivered'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-stone-800 text-stone-300'
                              }`}
                            >
                              {o.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-3.5 text-right space-x-2">
                            {o.status === 'pending' && (
                              <button
                                onClick={() => handleQuickConfirmOrder(o)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-[11px]"
                              >
                                Confirm COD
                              </button>
                            )}
                            <button
                              onClick={() => setViewingInvoiceOrder(o)}
                              className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 text-[11px]"
                            >
                              Slip
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. CATALOG & RICH PRODUCT EDITOR */}
          {/* ========================================================================= */}
          {activeSection === 'products' && (
            <div className="space-y-6">
              {/* Section Header with Search & Filters */}
              <div className="bg-stone-950 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-black text-white font-['Syne']">
                        Product Catalog & Inventory Studio
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-stone-900 border border-stone-800 text-stone-300">
                        {products.length} Total
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-stone-400">
                      <span>Live store merchandise:</span>
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        {products.filter((p) => p.isPublished !== false).length} Active
                      </span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1 font-bold text-stone-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-500"></span>
                        {products.filter((p) => p.isPublished === false).length} Inactive (Draft)
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setShowCsvImporter(true)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Import CSV Products</span>
                    </button>

                    {products.length > 0 && (
                      <button
                        onClick={() => setIsClearAllModalOpen(true)}
                        className="px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/70 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Remove all products from this website"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>Remove All Products ({products.length})</span>
                      </button>
                    )}

                    <button
                      onClick={handleExportProductsCSV}
                      className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>
                    <button
                      onClick={handleOpenAddProduct}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Article</span>
                    </button>
                  </div>
                </div>

                {/* Filter Controls & Items Per Page */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-stone-500" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search title, SKU..."
                      className="w-full pl-9 pr-8 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-amber-400"
                    />
                    {productSearch && (
                      <button
                        type="button"
                        onClick={() => setProductSearch('')}
                        className="absolute right-2.5 top-2.5 text-stone-500 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div>
                    <select
                      value={productCatFilter}
                      onChange={(e) => setProductCatFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-300 focus:outline-hidden focus:border-amber-400"
                    >
                      <option value="all">All Departments</option>
                      {categories.map((c, idx) => (
                        <option key={`adm-cat-${c.id}-${idx}`} value={c.id}>
                          {stripHtml(c.name)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <select
                      value={productStockFilter}
                      onChange={(e) => setProductStockFilter(e.target.value as any)}
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-300 focus:outline-hidden focus:border-amber-400"
                    >
                      <option value="all">All Stock Statuses</option>
                      <option value="in_stock">In Stock (&gt; 5 units)</option>
                      <option value="low_stock">Low Stock (≤ 5 units)</option>
                      <option value="out_of_stock">Out of Stock (0 units)</option>
                    </select>
                  </div>

                  <div>
                    <select
                      value={productStatusFilter}
                      onChange={(e) => setProductStatusFilter(e.target.value as any)}
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-300 focus:outline-hidden focus:border-amber-400"
                    >
                      <option value="all">All Visibility (Active & Draft)</option>
                      <option value="published">Active / Published Only</option>
                      <option value="draft">Inactive / Hidden (Draft) Only</option>
                    </select>
                  </div>

                  {/* Items Per Page Selector (20, 50, 100, All) */}
                  <div className="flex items-center justify-between sm:justify-end gap-1.5 bg-stone-900 border border-stone-800 rounded-xl px-2.5 py-1.5">
                    <span className="text-[11px] font-mono text-stone-400">View:</span>
                    <div className="flex items-center gap-1">
                      {[20, 50, 100].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setProductPageSize(num)}
                          className={`px-2 py-0.5 rounded text-xs font-mono font-bold transition-colors cursor-pointer ${
                            productPageSize === num
                              ? 'bg-emerald-500 text-stone-950 shadow-xs'
                              : 'text-stone-400 hover:text-white hover:bg-stone-800'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setProductPageSize('all')}
                        className={`px-2 py-0.5 rounded text-xs font-mono font-bold transition-colors cursor-pointer ${
                          productPageSize === 'all'
                            ? 'bg-emerald-500 text-stone-950 shadow-xs'
                            : 'text-stone-400 hover:text-white hover:bg-stone-800'
                        }`}
                      >
                        All
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bulk Actions Banner when items are selected */}
                {selectedProductIds.length > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-emerald-950/80 to-stone-900 border border-emerald-500/40 rounded-2xl shadow-lg animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-emerald-500 text-stone-950 font-mono font-black text-xs flex items-center justify-center shadow-xs">
                        {selectedProductIds.length}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-white">
                          {selectedProductIds.length === 1
                            ? '1 article selected'
                            : `${selectedProductIds.length} articles selected`}
                        </div>
                        <div className="text-[11px] text-stone-400">
                          Perform instant bulk management across selected items
                        </div>
                      </div>
                      <span className="text-stone-600 hidden sm:inline">|</span>
                      <button
                        type="button"
                        onClick={() => setSelectedProductIds([])}
                        className="text-xs text-stone-300 hover:text-white underline cursor-pointer"
                      >
                        Deselect All
                      </button>
                    </div>

                    <div className="flex items-center flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleBulkSetStatus(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors cursor-pointer"
                        title="Publish and make visible on store"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Set Active (Visible)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleBulkSetStatus(false)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 transition-colors cursor-pointer"
                        title="Hide from store / set draft"
                      >
                        <EyeOff className="w-3.5 h-3.5 text-stone-400" />
                        <span>Set Inactive (Hide)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsBulkDeleteModalOpen(true)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-colors cursor-pointer"
                        title="Permanently delete selected articles"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Selected ({selectedProductIds.length})</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Products Table */}
              <div className="bg-stone-950 border border-stone-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[950px]">
                    <thead className="bg-stone-900 border-b border-stone-800 text-stone-400 font-mono uppercase tracking-wider">
                      <tr>
                        <th className="p-4 w-12 text-center">
                          <input
                            type="checkbox"
                            checked={
                              paginatedAdminProducts.length > 0 &&
                              paginatedAdminProducts.every((p) => selectedProductIds.includes(p.id))
                            }
                            onChange={handleSelectAllCurrentPage}
                            className="w-4 h-4 rounded bg-stone-900 border-stone-700 text-emerald-500 focus:ring-emerald-500 cursor-pointer accent-emerald-500"
                            title="Select all on current page"
                          />
                        </th>
                        <th className="p-4">Article</th>
                        <th className="p-4">SKU / Dept</th>
                        <th className="p-4">Retail Price</th>
                        <th className="p-4">Cost / Margin</th>
                        <th className="p-4">Stock</th>
                        <th className="p-4">Status & Visibility</th>
                        <th className="p-4">Badges</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-900">
                      {paginatedAdminProducts.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="p-12 text-center">
                            <div className="max-w-md mx-auto space-y-3">
                              <div className="w-14 h-14 rounded-2xl bg-stone-900 border border-stone-800 text-stone-500 flex items-center justify-center mx-auto">
                                <Package className="w-7 h-7" />
                              </div>
                              <div className="text-stone-200 font-bold text-base font-['Urbanist']">
                                {products.length === 0 ? 'Website Catalog Empty (0 Products)' : 'No products found matching criteria'}
                              </div>
                              <p className="text-xs text-stone-400 leading-relaxed">
                                {products.length === 0
                                  ? 'All previous products have been removed as requested. You can upload your fresh merchandise via CSV or create articles manually.'
                                  : 'Try adjusting your search query, department, stock, or visibility filters.'}
                              </p>
                              {products.length === 0 ? (
                                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                                  <button
                                    type="button"
                                    onClick={() => setShowCsvImporter(true)}
                                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-extrabold flex items-center gap-2 shadow-md transition-all cursor-pointer"
                                  >
                                    <FileSpreadsheet className="w-4 h-4" />
                                    <span>Upload Products via CSV</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleOpenAddProduct}
                                    className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                                  >
                                    <Plus className="w-4 h-4" />
                                    <span>Create Article</span>
                                  </button>
                                </div>
                              ) : (
                                (productSearch ||
                                  productCatFilter !== 'all' ||
                                  productStockFilter !== 'all' ||
                                  productStatusFilter !== 'all') && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setProductSearch('');
                                      setProductCatFilter('all');
                                      setProductStockFilter('all');
                                      setProductStatusFilter('all');
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-white transition-colors cursor-pointer"
                                  >
                                    Reset All Filters
                                  </button>
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedAdminProducts.map((p) => {
                          const marginPercent = p.costPrice
                            ? Math.round(((p.price - p.costPrice) / p.price) * 100)
                            : 50;
                          const isSelected = selectedProductIds.includes(p.id);
                          const isActive = p.isPublished !== false;

                          return (
                            <tr
                              key={p.id}
                              className={`transition-colors ${
                                isSelected ? 'bg-emerald-950/20' : 'hover:bg-stone-900/60'
                              }`}
                            >
                              <td className="p-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleSelectProduct(p.id)}
                                  className="w-4 h-4 rounded bg-stone-900 border-stone-700 text-emerald-500 focus:ring-emerald-500 cursor-pointer accent-emerald-500"
                                  title={`Select ${stripHtml(p.name)}`}
                                />
                              </td>

                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={p.images[0] || FALLBACK_PRODUCT_IMAGE}
                                    alt={stripHtml(p.name)}
                                    className="w-12 h-12 rounded-xl object-cover bg-stone-900 border border-stone-800 shrink-0"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = FALLBACK_PRODUCT_IMAGE;
                                    }}
                                  />
                                  <div>
                                    <div className="font-bold text-white font-['Urbanist'] text-sm hover:text-emerald-300 transition-colors">
                                      {stripHtml(p.name)}
                                    </div>
                                    <div className="text-[11px] text-stone-400 line-clamp-1 max-w-xs mt-0.5">
                                      {stripHtml(p.shortDescription) || 'Catalog merchandise'}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="p-4 font-mono text-stone-400">
                                <div className="text-stone-300 font-bold">{p.sku}</div>
                                <div className="text-[11px] text-emerald-400/90 font-sans mt-0.5">
                                  {stripHtml(p.categoryName || 'General')}
                                </div>
                              </td>

                              <td className="p-4 font-mono font-bold text-white">
                                <div>{formatPKR(p.price)}</div>
                                {p.compareAtPrice && p.compareAtPrice > p.price && (
                                  <div className="text-[10px] text-stone-500 line-through">
                                    {formatPKR(p.compareAtPrice)}
                                  </div>
                                )}
                              </td>

                              <td className="p-4 font-mono text-[11px]">
                                <div className="text-stone-400">
                                  Cost: {formatPKR(p.costPrice || p.price * 0.55)}
                                </div>
                                <div className="text-emerald-400 font-bold mt-0.5">
                                  {marginPercent}% Margin
                                </div>
                              </td>

                              <td className="p-4 font-mono">
                                <span
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                                    p.stock > 5
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                      : p.stock > 0
                                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  }`}
                                >
                                  {p.stock} in hub
                                </span>
                              </td>

                              {/* Interactive Status & Visibility Toggle */}
                              <td className="p-4">
                                <button
                                  type="button"
                                  onClick={() => handleToggleProductStatus(p.id)}
                                  className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                                    isActive
                                      ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-stone-800 hover:bg-stone-750 text-stone-400 hover:text-stone-300 border border-stone-700'
                                  }`}
                                  title={`Click to set ${isActive ? 'Inactive (Draft)' : 'Active (Publish)'}`}
                                >
                                  <span
                                    className={`w-2 h-2 rounded-full transition-transform ${
                                      isActive
                                        ? 'bg-emerald-400 group-hover:scale-125 shadow-xs shadow-emerald-400'
                                        : 'bg-stone-500'
                                    }`}
                                  />
                                  <span>{isActive ? 'Active (Live)' : 'Inactive (Draft)'}</span>
                                </button>
                              </td>

                              <td className="p-4">
                                <div className="flex flex-wrap gap-1">
                                  {p.isFeatured && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                      Featured
                                    </span>
                                  )}
                                  {p.isBestseller && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                      Bestseller
                                    </span>
                                  )}
                                  {p.isNewArrival && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-teal-500/20 text-teal-300 border border-teal-500/30">
                                      New
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="p-4 text-right space-x-1.5">
                                <button
                                  onClick={() => handleOpenEditProduct(p)}
                                  className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 transition-colors cursor-pointer"
                                  title="Edit Product & Rich Specs"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProductPrompt(p.id, p.name)}
                                  className="p-2 rounded-xl bg-stone-900 hover:bg-rose-950 text-stone-400 hover:text-rose-300 border border-stone-800 hover:border-rose-900/60 transition-colors cursor-pointer"
                                  title="Delete Article"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* BOTTOM ADMIN PRODUCTS PAGINATION */}
                <div className="p-4 bg-stone-900/80 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="text-stone-400 font-mono">
                    Showing <span className="font-bold text-white">{adminProductStartIndex}-{adminProductEndIndex}</span> of{' '}
                    <span className="font-bold text-white">{totalAdminProducts}</span> articles
                  </div>

                  {totalAdminProductPages > 1 && productPageSize !== 'all' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setProductCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={safeAdminProductPage === 1}
                        className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-300 transition-colors cursor-pointer"
                        title="Previous page"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {Array.from({ length: totalAdminProductPages }, (_, i) => i + 1)
                        .filter((page) => {
                          return (
                            page === 1 ||
                            page === totalAdminProductPages ||
                            Math.abs(page - safeAdminProductPage) <= 2
                          );
                        })
                        .map((page, idx, arr) => {
                          const prev = arr[idx - 1];
                          const showEllipsis = prev && page - prev > 1;

                          return (
                            <React.Fragment key={page}>
                              {showEllipsis && (
                                <span className="px-1 text-stone-500 font-mono text-xs">...</span>
                              )}
                              <button
                                type="button"
                                onClick={() => setProductCurrentPage(page)}
                                className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                                  safeAdminProductPage === page
                                    ? 'bg-emerald-500 text-stone-950 font-black'
                                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                                }`}
                              >
                                {page}
                              </button>
                            </React.Fragment>
                          );
                        })}

                      <button
                        type="button"
                        onClick={() => setProductCurrentPage((p) => Math.min(totalAdminProductPages, p + 1))}
                        disabled={safeAdminProductPage === totalAdminProductPages}
                        className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-300 transition-colors cursor-pointer"
                        title="Next page"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-1 font-mono text-stone-400">
                    <span>Per page:</span>
                    {[20, 50, 100].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setProductPageSize(num)}
                        className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                          productPageSize === num
                            ? 'bg-emerald-500 text-stone-950'
                            : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setProductPageSize('all')}
                      className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                        productPageSize === 'all'
                          ? 'bg-emerald-500 text-stone-950'
                          : 'text-stone-400 hover:text-white'
                      }`}
                    >
                      All
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. ORDERS & COD FULFILLMENT CENTER */}
          {/* ========================================================================= */}
          {activeSection === 'orders' && (
            <div className="space-y-6">
              <div className="bg-stone-950 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-white font-['Syne']">
                      Orders & COD Fulfillment Center
                    </h2>
                    <p className="text-xs text-stone-400">
                      Manage doorstep cash deliveries, courier tracking codes, and WhatsApp customer verifications.
                    </p>
                  </div>
                  <button
                    onClick={handleExportOrdersCSV}
                    className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-800/80">
                  {['all', 'pending', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'].map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => setOrderStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          orderStatusFilter === st
                            ? 'bg-white text-stone-950 shadow'
                            : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
                        }`}
                      >
                        {st.replace(/_/g, ' ').toUpperCase()}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Orders List Table */}
              <div className="bg-stone-950 border border-stone-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-900 border-b border-stone-800 text-stone-400 font-mono uppercase tracking-wider">
                      <tr>
                        <th className="p-4">Order ID</th>
                        <th className="p-4">Customer Contact</th>
                        <th className="p-4">Delivery Address</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Courier / Tracking</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-900">
                      {filteredOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-stone-900/60 transition-colors">
                          <td className="p-4 font-mono">
                            <div className="font-bold text-white text-sm">{o.orderNumber}</div>
                            <div className="text-[11px] text-stone-500">
                              {new Date(o.createdAt).toLocaleDateString()}
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="font-bold text-stone-200">{o.customerName}</div>
                            <div className="font-mono text-stone-400 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-stone-500" />
                              <span>{o.customerPhone}</span>
                            </div>
                            <div className="text-[11px] text-stone-500">{o.customerEmail}</div>
                          </td>

                          <td className="p-4 text-stone-300 max-w-xs">
                            <div className="font-semibold text-white">
                              {o.shippingAddress.city}, {o.shippingAddress.province}
                            </div>
                            <div className="text-[11px] text-stone-400 truncate">
                              {o.shippingAddress.streetAddress}
                            </div>
                          </td>

                          <td className="p-4 font-mono">
                            <div className="text-sm font-black text-emerald-400">
                              {formatPKR(o.totalAmount)}
                            </div>
                            <div className="text-[10px] text-stone-500 uppercase font-semibold">
                              {o.paymentMethod.toUpperCase()}
                            </div>
                          </td>

                          <td className="p-4 font-mono text-[11px]">
                            <div className="font-bold text-amber-300">{o.trackingCarrier || 'TCS'}</div>
                            {o.trackingNumber ? (
                              <div className="text-stone-400 flex items-center gap-1">
                                <span>{o.trackingNumber}</span>
                                <button
                                  onClick={() => handleCopyText(o.trackingNumber!, o.id)}
                                  className="text-stone-500 hover:text-white"
                                  title="Copy Tracking Number"
                                >
                                  {copiedId === o.id ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            ) : (
                              <span className="text-stone-600 italic">Not Assigned</span>
                            )}
                          </td>

                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase inline-block ${
                                o.status === 'pending'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : o.status === 'confirmed'
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                  : o.status === 'shipped' || o.status === 'out_for_delivery'
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                  : o.status === 'delivered'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              {o.status.replace(/_/g, ' ')}
                            </span>
                          </td>

                          <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                            {/* WhatsApp Verification Shortcut */}
                            <a
                              href={generateWhatsAppConfirmationLink(o)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/80 hover:bg-emerald-900 transition-colors inline-block align-middle"
                              title="Message Customer on WhatsApp"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </a>

                            {/* View Packing Slip */}
                            <button
                              onClick={() => setViewingInvoiceOrder(o)}
                              className="p-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 transition-colors align-middle"
                              title="Print / View Invoice"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            {/* Update Status Modal */}
                            <button
                              onClick={() => {
                                setSelectedOrderForEdit(o);
                                setOrderNewStatus(o.status);
                                setOrderCarrier((o.trackingCarrier as any) || 'TCS');
                                setOrderTrackingNum(o.trackingNumber || '');
                                setOrderNote('');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs transition-colors align-middle"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. STOCK HEALTH & INVENTORY ALERTS */}
          {/* ========================================================================= */}
          {activeSection === 'inventory' && (
            <div className="space-y-6">
              <div className="bg-stone-950 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-2">
                <h2 className="text-xl font-black text-white font-['Syne']">
                  Lahore Fulfillment Hub Inventory Alerts
                </h2>
                <p className="text-xs text-stone-400">
                  Critical stock monitoring to prevent order fulfillment cancellations.
                </p>
              </div>

              <div className="bg-stone-950 border border-stone-800 rounded-3xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-900 border-b border-stone-800 text-stone-400 font-mono uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Article</th>
                      <th className="p-4">SKU</th>
                      <th className="p-4">Units in Hub</th>
                      <th className="p-4">Reorder Level</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Quick Restock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-900 font-mono">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-stone-900/60">
                        <td className="p-4 font-sans font-bold text-white flex items-center gap-3">
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-9 h-9 rounded object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <span>{p.name}</span>
                        </td>
                        <td className="p-4 text-stone-400">{p.sku}</td>
                        <td className="p-4 font-bold text-sm">
                          <span
                            className={
                              p.stock === 0
                                ? 'text-rose-500'
                                : p.stock <= p.lowStockThreshold
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }
                          >
                            {p.stock} units
                          </span>
                        </td>
                        <td className="p-4 text-stone-500">{p.lowStockThreshold} units</td>
                        <td className="p-4 font-sans">
                          {p.stock === 0 ? (
                            <span className="text-rose-400 font-bold">Out of Stock</span>
                          ) : p.stock <= p.lowStockThreshold ? (
                            <span className="text-amber-400 font-bold">Low Stock Warning</span>
                          ) : (
                            <span className="text-emerald-400 font-semibold">Optimal</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              storeService.saveProduct({ id: p.id, stock: p.stock + 25 });
                              setProducts(storeService.getProducts());
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs font-sans transition-colors"
                          >
                            + Restock 25 Units
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. COUPONS & PROMOS */}
          {/* ========================================================================= */}
          {activeSection === 'coupons' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Generate Coupon Form */}
              <div className="lg:col-span-4 bg-stone-950 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white font-['Syne']">
                    Generate Promo Voucher
                  </h3>
                  <p className="text-xs text-stone-400">
                    Create promo codes with minimum cart thresholds.
                  </p>
                </div>

                <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-300 mb-1">Coupon Code</label>
                    <input
                      type="text"
                      required
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                      placeholder="e.g. FLASH25"
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 uppercase font-mono text-white focus:outline-hidden focus:border-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-stone-300 mb-1">Discount Type</label>
                      <select
                        value={newCouponType}
                        onChange={(e) => setNewCouponType(e.target.value as any)}
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl px-2.5 py-2 text-stone-200"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed PKR (Rs.)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-stone-300 mb-1">Value</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={newCouponVal}
                        onChange={(e) => setNewCouponVal(Number(e.target.value))}
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 font-mono text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-300 mb-1">
                      Min Order Total (PKR)
                    </label>
                    <input
                      type="number"
                      value={newCouponMin}
                      onChange={(e) => setNewCouponMin(Number(e.target.value))}
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 font-mono text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-xl shadow transition-colors"
                  >
                    Create Promo Coupon
                  </button>
                </form>
              </div>

              {/* Coupons List */}
              <div className="lg:col-span-8 bg-stone-950 border border-stone-800 rounded-3xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-900 border-b border-stone-800 text-stone-400 font-mono uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Voucher Code</th>
                      <th className="p-4">Discount</th>
                      <th className="p-4">Min Spend</th>
                      <th className="p-4">Redeemed</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Toggle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-900 font-mono">
                    {coupons.map((c) => (
                      <tr key={c.id} className="hover:bg-stone-900/60">
                        <td className="p-4 font-bold text-white text-sm">{c.code}</td>
                        <td className="p-4 text-emerald-400 font-bold">
                          {c.discountType === 'percentage'
                            ? `${c.discountValue}% OFF`
                            : formatPKR(c.discountValue)}
                        </td>
                        <td className="p-4 text-stone-300">{formatPKR(c.minOrderAmount)}</td>
                        <td className="p-4 text-stone-400">{c.usedCount} times</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] ${
                              c.isActive
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-stone-800 text-stone-500'
                            }`}
                          >
                            {c.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleToggleCoupon(c)}
                            className="px-2.5 py-1 rounded bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 font-sans text-xs"
                          >
                            {c.isActive ? 'Pause' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 6. VERIFIED BUYER REVIEWS */}
          {/* ========================================================================= */}
          {activeSection === 'reviews' && (
            <div className="space-y-6">
              <div className="bg-stone-950 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-2">
                <h2 className="text-xl font-black text-white font-['Syne']">
                  Customer Social Proof & Verified Reviews
                </h2>
                <p className="text-xs text-stone-400">
                  Moderation queue for customer feedback submitted across products.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating ? 'fill-amber-400' : 'text-stone-700'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">
                        VERIFIED COD BUYER
                      </span>
                    </div>

                    <p className="text-xs text-stone-300 italic leading-relaxed">
                      "{rev.comment}"
                    </p>

                    <div className="pt-2 border-t border-stone-900 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white">{rev.userName}</span>
                      </div>
                      <span className="text-[11px] font-mono text-stone-500">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 7. STORE SETTINGS & LOGISTICS */}
          {/* ========================================================================= */}
          {activeSection === 'settings' && (
            <div className="max-w-2xl bg-stone-950 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div>
                <h2 className="text-xl font-black text-white font-['Syne']">
                  Store Logistics & COD Configuration
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  Adjust nationwide delivery policies, cash-on-delivery thresholds, and concierge contact channels.
                </p>
              </div>

              {settingsSavedToast && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Settings updated successfully across live checkout and storefront.</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-stone-300 mb-1">
                    Free Delivery Threshold (PKR)
                  </label>
                  <input
                    type="number"
                    value={settingsFreeShip}
                    onChange={(e) => setSettingsFreeShip(Number(e.target.value))}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2.5 font-mono text-white"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    Orders at or above this amount receive free courier delivery.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-stone-300 mb-1">
                    Standard Courier Shipping Fee (PKR)
                  </label>
                  <input
                    type="number"
                    value={settingsShipFee}
                    onChange={(e) => setSettingsShipFee(Number(e.target.value))}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2.5 font-mono text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-300 mb-1">
                    Customer Support Phone & WhatsApp
                  </label>
                  <input
                    type="text"
                    value={settingsSupportPhone}
                    onChange={(e) => setSettingsSupportPhone(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2.5 font-mono text-white"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-xl shadow transition-colors cursor-pointer"
                  >
                    Save Operational Settings
                  </button>
                </div>
              </form>

              {/* Supabase PostgreSQL Database Integration Status */}
              <div className="mt-8 pt-6 border-t border-stone-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white font-['Syne']">
                        Supabase PostgreSQL Database
                      </h3>
                      <p className="text-[11px] text-stone-400">
                        Production Cloud Database & Row-Level Security
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    isSupabaseConfigured
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                    {isSupabaseConfigured ? 'Live Connected' : 'Local Fallback'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-stone-800/60">
                    <span className="text-stone-400">Project Reference ID:</span>
                    <span className="font-mono text-stone-200 font-semibold bg-stone-950 px-2.5 py-0.5 rounded-lg border border-stone-800">
                      {supabaseUrl ? supabaseUrl.replace(/^https?:\/\//, '').split('.')[0] : 'None'}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-stone-800/60">
                    <span className="text-stone-400">Project Endpoint:</span>
                    <span className="font-mono text-emerald-300 text-[11px]">
                      {supabaseUrl || 'Not configured'}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-stone-800/60">
                    <span className="text-stone-400">Publishable / Anon Key:</span>
                    <span className="font-mono text-stone-400 text-[11px]">
                      {supabaseAnonKey
                        ? `${supabaseAnonKey.slice(0, 14)}••••••••${supabaseAnonKey.slice(-4)}`
                        : 'Configured in .env'}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-stone-400">RLS Tables Active:</span>
                    <span className="text-stone-300 font-medium">
                      products, orders, categories, profiles, reviews, coupons
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 3. MULTI-TAB ADVANCED PRODUCT MODAL WITH RICH TEXT EDITOR */}
      {/* ========================================================================= */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div
            className="fixed inset-0 bg-stone-950/80 backdrop-blur-md"
            onClick={() => setEditingProduct(null)}
          />

          <div className="relative bg-stone-950 border border-stone-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl z-10 max-h-[92vh] flex flex-col text-stone-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-800 shrink-0">
              <div>
                <h3 className="text-xl font-black text-white font-['Syne']">
                  {editingProduct.id ? 'Edit Product Architecture' : 'Create Flagship Article'}
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Configure rich markdown/HTML specifications, inventory allocation, and profit margins.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tab Switcher */}
            <div className="flex items-center gap-1.5 py-3 border-b border-stone-800 overflow-x-auto shrink-0 text-xs font-bold">
              <button
                type="button"
                onClick={() => setProductModalTab('general')}
                className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                  productModalTab === 'general'
                    ? 'bg-white text-stone-950 shadow'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                General Info
              </button>
              <button
                type="button"
                onClick={() => setProductModalTab('content')}
                className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  productModalTab === 'content'
                    ? 'bg-white text-stone-950 shadow'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Rich Description & Copy</span>
              </button>
              <button
                type="button"
                onClick={() => setProductModalTab('pricing')}
                className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                  productModalTab === 'pricing'
                    ? 'bg-white text-stone-950 shadow'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Pricing & Margins
              </button>
              <button
                type="button"
                onClick={() => setProductModalTab('inventory')}
                className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                  productModalTab === 'inventory'
                    ? 'bg-white text-stone-950 shadow'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Stock & Units
              </button>
              <button
                type="button"
                onClick={() => setProductModalTab('media')}
                className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                  productModalTab === 'media'
                    ? 'bg-white text-stone-950 shadow'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Images Gallery ({editingProduct.images?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setProductModalTab('specs')}
                className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                  productModalTab === 'specs'
                    ? 'bg-white text-stone-950 shadow'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Spec Key-Values
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto py-5 space-y-5 text-xs">
              {/* TAB 1: GENERAL */}
              {productModalTab === 'general' && (
                <div className="space-y-4">
                  <div>
                    <label className="block font-semibold text-stone-300 mb-1.5">Article Title</label>
                    <input
                      type="text"
                      required
                      value={editingProduct.name || ''}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, name: e.target.value })
                      }
                      placeholder="e.g. AeroPulse Pro Hybrid ANC Earbuds"
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white text-sm font-semibold focus:outline-hidden focus:border-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-stone-300 mb-1.5">Department Category</label>
                      <select
                        value={editingProduct.categoryId}
                        onChange={(e) => {
                          const cat = categories.find((c) => c.id === e.target.value);
                          setEditingProduct({
                            ...editingProduct,
                            categoryId: e.target.value,
                            categoryName: cat?.name || 'Catalog',
                          });
                        }}
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-200"
                      >
                        {categories.map((c, idx) => (
                          <option key={`edit-cat-${c.id}-${idx}`} value={c.id}>
                            {stripHtml(c.name)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-300 mb-1.5">SKU Identifier</label>
                      <input
                        type="text"
                        required
                        value={editingProduct.sku || ''}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, sku: e.target.value })
                        }
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 font-mono text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-300 mb-1.5">Short Card Summary</label>
                    <textarea
                      rows={2}
                      value={editingProduct.shortDescription || ''}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, shortDescription: e.target.value })
                      }
                      placeholder="Brief 1-sentence teaser displayed on product grid cards..."
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-200 leading-relaxed"
                    />
                  </div>

                  {/* Storefront Feature Badges */}
                  <div className="pt-2">
                    <label className="block font-semibold text-stone-300 mb-2">Display Badges</label>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                        <input
                          type="checkbox"
                          checked={editingProduct.isPublished !== false}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, isPublished: e.target.checked })
                          }
                          className="w-4 h-4 rounded accent-emerald-500"
                        />
                        <span>Published to Storefront</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                        <input
                          type="checkbox"
                          checked={editingProduct.isFeatured || false}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })
                          }
                          className="w-4 h-4 rounded accent-amber-500"
                        />
                        <span>Homepage Featured</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                        <input
                          type="checkbox"
                          checked={editingProduct.isBestseller || false}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, isBestseller: e.target.checked })
                          }
                          className="w-4 h-4 rounded accent-amber-500"
                        />
                        <span>Bestseller Ribbon</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                        <input
                          type="checkbox"
                          checked={editingProduct.isNewArrival || false}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, isNewArrival: e.target.checked })
                          }
                          className="w-4 h-4 rounded accent-teal-500"
                        />
                        <span>New Arrival Ribbon</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: RICH TEXT DESCRIPTION */}
              {productModalTab === 'content' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white text-sm">
                        Rich Text Specification & Description Editor
                      </span>
                      <p className="text-stone-400 text-xs">
                        Format headings, specs, bullet lists, and guarantees with instant visual sync.
                      </p>
                    </div>
                  </div>

                  {/* Dedicated Rich Text Editor Component */}
                  <RichTextEditor
                    value={editingProduct.description || ''}
                    onChange={(val) =>
                      setEditingProduct({ ...editingProduct, description: val })
                    }
                    placeholder="Describe the article, materials, engineering, and care instructions..."
                    minHeight="280px"
                  />
                </div>
              )}

              {/* TAB 3: PRICING & MARGINS */}
              {productModalTab === 'pricing' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-semibold text-stone-300 mb-1">
                        Retail Selling Price (PKR)
                      </label>
                      <input
                        type="number"
                        required
                        value={editingProduct.price || 0}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, price: Number(e.target.value) })
                        }
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 font-mono text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-300 mb-1">
                        Compare-At Original Price (PKR)
                      </label>
                      <input
                        type="number"
                        value={editingProduct.compareAtPrice || 0}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            compareAtPrice: Number(e.target.value),
                          })
                        }
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 font-mono text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-300 mb-1">
                        Cost of Goods / COGS (PKR)
                      </label>
                      <input
                        type="number"
                        value={editingProduct.costPrice || 0}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            costPrice: Number(e.target.value),
                          })
                        }
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 font-mono text-white text-sm"
                      />
                    </div>
                  </div>

                  {/* Auto-Calculated Margin Preview Box */}
                  {(() => {
                    const price = editingProduct.price || 0;
                    const cost = editingProduct.costPrice || 0;
                    const profit = price - cost;
                    const margin = price > 0 ? Math.round((profit / price) * 100) : 0;

                    return (
                      <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between">
                        <div>
                          <span className="text-stone-400">Unit Gross Profit:</span>
                          <div className="text-lg font-black font-mono text-emerald-400">
                            {formatPKR(profit)}
                          </div>
                        </div>
                        <div>
                          <span className="text-stone-400">Profit Margin:</span>
                          <div className="text-lg font-black font-mono text-amber-300">
                            {margin}%
                          </div>
                        </div>
                        <div>
                          <span className="text-stone-400">Discount Display:</span>
                          <div className="text-lg font-black font-mono text-stone-200">
                            {editingProduct.compareAtPrice &&
                            editingProduct.compareAtPrice > price
                              ? `-${Math.round(((editingProduct.compareAtPrice - price) / editingProduct.compareAtPrice) * 100)}%`
                              : 'None'}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 4: INVENTORY */}
              {productModalTab === 'inventory' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-stone-300 mb-1">
                        Total Units in Hub Stock
                      </label>
                      <input
                        type="number"
                        required
                        value={editingProduct.stock || 0}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })
                        }
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 font-mono text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-300 mb-1">
                        Low Stock Alert Threshold
                      </label>
                      <input
                        type="number"
                        value={editingProduct.lowStockThreshold || 5}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            lowStockThreshold: Number(e.target.value),
                          })
                        }
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 font-mono text-white text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: MEDIA GALLERY */}
              {productModalTab === 'media' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">
                        Product Photography & Media Studio
                      </h4>
                      <p className="text-stone-400 text-xs">
                        Upload real image files from your computer or phone. Drag & drop multiple images.
                      </p>
                    </div>
                  </div>

                  <ProductImageUploader
                    images={editingProduct.images || []}
                    onChange={(newImages) =>
                      setEditingProduct({ ...editingProduct, images: newImages })
                    }
                    maxImages={12}
                  />
                </div>
              )}

              {/* TAB 6: SPECS KEY-VALUES */}
              {productModalTab === 'specs' && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Spec Name (e.g. Battery Life)"
                      value={newSpecKey}
                      onChange={(e) => setNewSpecKey(e.target.value)}
                      className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-white"
                    />
                    <input
                      type="text"
                      placeholder="Spec Value (e.g. 38 Hours)"
                      value={newSpecVal}
                      onChange={(e) => setNewSpecVal(e.target.value)}
                      className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newSpecKey.trim() && newSpecVal.trim()) {
                          const updated = {
                            ...(editingProduct.specifications || {}),
                            [newSpecKey.trim()]: newSpecVal.trim(),
                          };
                          setEditingProduct({ ...editingProduct, specifications: updated });
                          setNewSpecKey('');
                          setNewSpecVal('');
                        }
                      }}
                      className="px-4 py-2 bg-white text-stone-950 font-bold rounded-xl"
                    >
                      Add Spec
                    </button>
                  </div>

                  <div className="border border-stone-800 rounded-2xl overflow-hidden divide-y divide-stone-900">
                    {Object.entries(editingProduct.specifications || {}).map(([key, val]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-3 bg-stone-900/40"
                      >
                        <span className="font-semibold text-white">{key}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-stone-300">{val}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const copy = { ...editingProduct.specifications };
                              delete copy[key];
                              setEditingProduct({ ...editingProduct, specifications: copy });
                            }}
                            className="text-stone-500 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Actions Footer */}
              <div className="pt-4 border-t border-stone-800 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-5 py-2.5 rounded-xl border border-stone-700 hover:bg-stone-900 text-stone-300 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black shadow-lg transition-all"
                >
                  Save & Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ORDER STATUS UPDATE & COURIER ASSIGNMENT MODAL */}
      {/* ========================================================================= */}
      {selectedOrderForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-stone-950/80 backdrop-blur-md"
            onClick={() => setSelectedOrderForEdit(null)}
          />
          <div className="relative bg-stone-950 border border-stone-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl z-10 space-y-5 text-stone-100">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div>
                <h3 className="text-lg font-black text-white font-['Syne']">
                  Update Consignment #{selectedOrderForEdit.orderNumber}
                </h3>
                <p className="text-xs text-stone-400">
                  Recipient: {selectedOrderForEdit.customerName} (
                  {selectedOrderForEdit.shippingAddress.city})
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderForEdit(null)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateOrderStatus} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-300 mb-1">
                  Consignment Status
                </label>
                <select
                  value={orderNewStatus}
                  onChange={(e) => setOrderNewStatus(e.target.value as any)}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-200 font-bold"
                >
                  <option value="pending">Pending Customer Verification</option>
                  <option value="confirmed">Confirmed for Packing</option>
                  <option value="shipped">Dispatched with Courier Rider</option>
                  <option value="out_for_delivery">Out for Doorstep Delivery</option>
                  <option value="delivered">Delivered & Cash Collected</option>
                  <option value="cancelled">Cancelled / Returned</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-300 mb-1">Courier Partner</label>
                <select
                  value={orderCarrier}
                  onChange={(e) => setOrderCarrier(e.target.value as any)}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-200"
                >
                  <option value="TCS">TCS Express Courier (1-2 Days)</option>
                  <option value="Leopards">Leopards Courier Service (2-3 Days)</option>
                  <option value="PostEx">PostEx Logistics (1-3 Days)</option>
                  <option value="Trax">Trax Nationwide (2-3 Days)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-stone-300">Courier Tracking Number</label>
                  <button
                    type="button"
                    onClick={() =>
                      setOrderTrackingNum(
                        `${orderCarrier.toUpperCase()}-${Math.floor(10000000 + Math.random() * 90000000)}`
                      )
                    }
                    className="text-amber-300 text-[11px] hover:underline"
                  >
                    Auto-Generate
                  </button>
                </div>
                <input
                  type="text"
                  value={orderTrackingNum}
                  onChange={(e) => setOrderTrackingNum(e.target.value)}
                  placeholder="e.g. TCS-77491028"
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 font-mono text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-300 mb-1">Internal Note</label>
                <input
                  type="text"
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="e.g. Verified by rider call at 2:30 PM"
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-200"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForEdit(null)}
                  className="px-4 py-2 border border-stone-800 rounded-xl text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-xl"
                >
                  Update Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. INVOICE & PACKING SLIP VIEWER MODAL */}
      {/* ========================================================================= */}
      {viewingInvoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-stone-950/80 backdrop-blur-md"
            onClick={() => setViewingInvoiceOrder(null)}
          />

          <div className="relative bg-white text-stone-900 rounded-3xl max-w-2xl w-full p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-6 border-b border-stone-200">
              <div className="flex items-center gap-3">
                <BrandLogo variant="light" size="md" />
                <div>
                  <p className="text-xs text-stone-500 font-mono">
                    Lahore Fulfillment Hub · Pakistan
                  </p>
                  <p className="text-[11px] text-stone-400">Official Kitchenware E-Commerce</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono font-bold text-stone-500">PACKING SLIP / INVOICE</div>
                <div className="text-lg font-black font-mono">{viewingInvoiceOrder.orderNumber}</div>
                <div className="text-xs text-stone-500">
                  {new Date(viewingInvoiceOrder.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 text-xs">
              <div>
                <span className="font-bold text-stone-400 uppercase tracking-wider block mb-1">
                  Deliver To:
                </span>
                <p className="font-bold text-sm text-stone-900">
                  {viewingInvoiceOrder.customerName}
                </p>
                <p className="text-stone-600 mt-0.5">
                  {viewingInvoiceOrder.shippingAddress.streetAddress}
                </p>
                <p className="text-stone-600">
                  {viewingInvoiceOrder.shippingAddress.city},{' '}
                  {viewingInvoiceOrder.shippingAddress.province}
                </p>
                <p className="font-mono text-stone-900 font-bold mt-1">
                  Phone: {viewingInvoiceOrder.customerPhone}
                </p>
              </div>

              <div>
                <span className="font-bold text-stone-400 uppercase tracking-wider block mb-1">
                  Logistics & Payment:
                </span>
                <p>
                  <strong>Payment Mode:</strong> Cash on Delivery (COD)
                </p>
                <p>
                  <strong>Courier:</strong> {viewingInvoiceOrder.trackingCarrier || 'TCS Express'}
                </p>
                <p className="font-mono">
                  <strong>Tracking:</strong>{' '}
                  {viewingInvoiceOrder.trackingNumber || 'Pending Courier Pickup'}
                </p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="border border-stone-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 font-mono text-stone-600">
                  <tr>
                    <th className="p-3">Article Description</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Price</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-mono">
                  {viewingInvoiceOrder.items.map((item, i) => (
                    <tr key={i}>
                      <td className="p-3 font-sans font-bold text-stone-900">
                        {item.productName}
                        {item.variantName && (
                          <span className="block text-xs font-normal text-stone-500">
                            Variant: {item.variantName}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">{item.quantity}</td>
                      <td className="p-3 text-right">{formatPKR(item.unitPrice)}</td>
                      <td className="p-3 text-right font-bold">
                        {formatPKR(item.totalPrice || item.unitPrice * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Balance */}
            <div className="pt-4 border-t border-stone-200 flex justify-between items-center text-sm">
              <span className="font-bold text-stone-700">Collect Total Cash at Doorstep:</span>
              <span className="text-xl font-black font-mono text-stone-950">
                {formatPKR(viewingInvoiceOrder.totalAmount)}
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setViewingInvoiceOrder(null)}
                className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-bold"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-stone-950 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Product Importer Modal */}
      <CSVProductImporter
        isOpen={showCsvImporter}
        onClose={() => setShowCsvImporter(false)}
        categories={categories}
        onImport={handleImportCsvSuccess}
        existingDummyCount={storeService.getDummyProductCount()}
      />

      {/* 1. SINGLE PRODUCT DELETE IN-APP CONFIRMATION MODAL */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white font-['Syne']">
                  Permanently Delete Article?
                </h3>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Are you sure you want to delete{' '}
                  <strong className="text-white">"{stripHtml(productToDelete.name)}"</strong> from your
                  store database?
                </p>
                <div className="p-2.5 rounded-xl bg-stone-950/80 border border-stone-800/80 text-[11px] text-amber-300/90 flex items-center gap-2 mt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                  <span>Tip: If you want to temporarily hide it without deleting, toggle it to <strong>Inactive</strong>.</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer"
              >
                Keep Article
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteProduct}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950/40 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Permanent Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. BULK DELETE IN-APP CONFIRMATION MODAL */}
      {isBulkDeleteModalOpen && selectedProductIds.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white font-['Syne']">
                  Delete {selectedProductIds.length} Selected Articles?
                </h3>
                <p className="text-xs text-stone-300 leading-relaxed">
                  This will permanently delete{' '}
                  <strong className="text-white font-mono">{selectedProductIds.length} products</strong> from
                  your store. This action cannot be undone.
                </p>
                <div className="p-2.5 rounded-xl bg-stone-950/80 border border-stone-800/80 text-[11px] text-amber-300/90 flex items-center gap-2 mt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                  <span>Alternatively, you can click <strong>Set Inactive</strong> to hide them safely.</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950/40 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete {selectedProductIds.length} Products</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. WIPE DEMO/DUMMY PRODUCTS IN-APP CONFIRMATION MODAL */}
      {isClearDummyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white font-['Syne']">
                  Remove All Demo/Dummy Products?
                </h3>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Permanently remove all {storeService.getDummyProductCount()} initial demo items. Your catalog will keep all your authentic CSV products and imported inventory clean.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setIsClearDummyModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClearDummyProducts}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md transition-colors cursor-pointer"
              >
                Wipe Demo Products
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. KEEP ONLY DUMMY PRODUCTS CONFIRMATION MODAL */}
      {isResetToDummyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-stone-900 border border-amber-500/30 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white font-['Syne']">
                  Sirf Dummy Products Rakhein?
                </h3>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Tamam extra ya kharab products delete ho jayein ge aur sirf standard dummy products mehfooz rahein ge. Iske baad aap aasaani se apni CSV file upload kar sakte hain.
                </p>
                <p className="text-[11px] text-stone-400 font-mono">
                  Keep standard dummy demo items & wipe everything else.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setIsResetToDummyModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmResetToDummy}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md transition-colors cursor-pointer"
              >
                Haan, Sirf Dummy Rakho
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. REMOVE ALL PRODUCTS CONFIRMATION MODAL */}
      {isClearAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-stone-900 border border-rose-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white font-['Syne']">
                  Remove All Products From Website?
                </h3>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Kya aap waqayi tamam products ({products.length}) website se delete karna chahte hain? Store ka catalog bilkul saaf (0 products) ho jaye ga taake aap apni nayi CSV file upload kar sakein.
                </p>
                <p className="text-[11px] text-stone-400 font-mono">
                  This permanently removes all articles from the website catalog.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setIsClearAllModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClearAllProducts}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-colors cursor-pointer"
              >
                Haan, Remove All Products
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-stone-950 text-white border border-emerald-500/80 p-4 rounded-2xl shadow-2xl flex items-start gap-3">
          <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 text-xs">
            <div className="font-bold text-emerald-400">Catalog Updated</div>
            <p className="text-stone-300 mt-0.5">{successBanner}</p>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="p-1 text-stone-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
