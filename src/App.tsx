import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { QuickViewModal } from './components/storefront/QuickViewModal';
import { AuthModal } from './components/common/AuthModal';
import { HomeView } from './views/HomeView';
import { ShopView } from './views/ShopView';
import { ProductDetailView } from './views/ProductDetailView';
import { CartView } from './views/CartView';
import { CheckoutView } from './views/CheckoutView';
import { OrderSuccessView } from './views/OrderSuccessView';
import { TrackOrderView } from './views/TrackOrderView';
import { CustomerAccountView } from './views/CustomerAccountView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { StaticPagesView } from './views/StaticPagesView';
import { Product, Order } from './types';
import { storeService } from './services/storeService';

// Helper to determine active view from browser URL path or hash
const getViewFromLocation = (): string => {
  if (typeof window === 'undefined') return 'home';
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const search = window.location.search.toLowerCase();

  if (
    path === '/admin' ||
    path.startsWith('/admin') ||
    hash === '#admin' ||
    hash.startsWith('#admin') ||
    search.includes('admin')
  ) {
    return 'admin';
  }
  if (path === '/shop' || hash === '#shop') return 'shop';
  if (path === '/cart' || hash === '#cart') return 'cart';
  if (path === '/checkout' || hash === '#checkout') return 'checkout';
  if (path === '/account' || hash === '#account') return 'account';
  if (path === '/wishlist' || hash === '#wishlist') return 'wishlist';
  if (path === '/track-order' || hash === '#track' || hash === '#track-order') return 'track-order';
  const staticPages = ['about', 'contact', 'faq', 'delivery', 'returns', 'privacy', 'terms'];
  for (const sp of staticPages) {
    if (path === `/${sp}` || hash === `#${sp}`) return sp;
  }
  return 'home';
};

function AppContent() {
  const [currentView, setCurrentView] = useState<string>(() => getViewFromLocation());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [trackOrderParam, setTrackOrderParam] = useState<string>('');

  const { isAdmin } = useAuth();
  const { setIsCartOpen } = useCart();

  // Listen to browser URL changes (e.g. typing /admin, #admin, browser Back/Forward)
  useEffect(() => {
    const handleUrlSync = () => {
      const targetView = getViewFromLocation();
      setCurrentView(targetView);
    };

    window.addEventListener('popstate', handleUrlSync);
    window.addEventListener('hashchange', handleUrlSync);
    return () => {
      window.removeEventListener('popstate', handleUrlSync);
      window.removeEventListener('hashchange', handleUrlSync);
    };
  }, []);

  // Update browser URL state cleanly on view transitions
  const navigateToView = (view: string) => {
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      const targetPath = view === 'home' ? '/' : `/${view}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, '', targetPath);
      }
    }
  };

  // Scroll to top on view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, selectedProduct]);

  // Handler for selecting a product
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    navigateToView('product');
  };

  // Handler for category selection from home/nav
  const handleSelectCategory = (catSlug: string | null) => {
    setSelectedCategory(catSlug);
    navigateToView('shop');
  };

  // Handler for order success
  const handleOrderSuccess = (order: Order) => {
    setCompletedOrder(order);
    navigateToView('order-success');
  };

  // Handler for track order jump
  const handleTrackOrder = (orderNumber: string) => {
    setTrackOrderParam(orderNumber);
    navigateToView('track-order');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-stone-900 font-['Urbanist','Plus_Jakarta_Sans',sans-serif] selection:bg-stone-950 selection:text-white">
      {/* Header (Hidden only inside Admin view for maximum screen estate) */}
      {currentView !== 'admin' && (
        <Header
          currentView={currentView}
          setCurrentView={navigateToView}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          onSelectProduct={handleSelectProduct}
        />
      )}

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            onSelectProduct={handleSelectProduct}
            onQuickView={(p) => setQuickViewProduct(p)}
            onSelectCategory={handleSelectCategory}
            onExploreShop={() => {
              setSelectedCategory(null);
              navigateToView('shop');
            }}
            onViewDeals={() => navigateToView('deals')}
          />
        )}

        {(currentView === 'shop' || currentView === 'deals') && (
          <ShopView
            initialCategory={selectedCategory}
            onSelectProduct={handleSelectProduct}
            onQuickView={(p) => setQuickViewProduct(p)}
          />
        )}

        {currentView === 'product' && selectedProduct && (
          <ProductDetailView
            product={selectedProduct}
            onSelectProduct={handleSelectProduct}
            onInstantCheckout={() => navigateToView('checkout')}
            onBackToShop={() => navigateToView('shop')}
          />
        )}

        {currentView === 'cart' && (
          <CartView
            onProceedToCheckout={() => navigateToView('checkout')}
            onContinueShopping={() => navigateToView('shop')}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutView
            onOrderSuccess={handleOrderSuccess}
            onBackToCart={() => navigateToView('cart')}
          />
        )}

        {currentView === 'order-success' && completedOrder && (
          <OrderSuccessView
            order={completedOrder}
            onTrackOrder={handleTrackOrder}
            onContinueShopping={() => navigateToView('home')}
          />
        )}

        {currentView === 'track-order' && (
          <TrackOrderView
            initialOrderNumber={trackOrderParam}
            onExploreProducts={() => navigateToView('shop')}
          />
        )}

        {(currentView === 'account' || currentView === 'wishlist') && (
          <CustomerAccountView
            onTrackOrder={handleTrackOrder}
            onSelectProduct={handleSelectProduct}
            onGoToShop={() => navigateToView('shop')}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboardView
            onBackToStorefront={() => navigateToView('home')}
          />
        )}

        {['about', 'contact', 'faq', 'delivery', 'returns', 'privacy', 'terms'].includes(currentView) && (
          <StaticPagesView
            page={currentView as any}
            onExploreShop={() => navigateToView('shop')}
          />
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        onCheckout={() => navigateToView('checkout')}
        onViewCart={() => navigateToView('cart')}
      />

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onViewFullProduct={(p) => {
          setQuickViewProduct(null);
          handleSelectProduct(p);
        }}
        onInstantCheckout={() => {
          setQuickViewProduct(null);
          navigateToView('checkout');
        }}
      />

      {/* Global Authentication Modal (Supabase sign in / sign up) */}
      <AuthModal />

      {/* Global Footer (Hidden in Admin console) */}
      {currentView !== 'admin' && (
        <Footer
          setCurrentView={navigateToView}
          setSelectedCategory={handleSelectCategory}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
