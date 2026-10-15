import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { QuickViewModal } from './components/storefront/QuickViewModal';
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

function AppContent() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [trackOrderParam, setTrackOrderParam] = useState<string>('');

  const { isAdmin } = useAuth();
  const { setIsCartOpen } = useCart();

  // Scroll to top on view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, selectedProduct]);

  // Handler for selecting a product
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('product');
  };

  // Handler for category selection from home/nav
  const handleSelectCategory = (catSlug: string | null) => {
    setSelectedCategory(catSlug);
    setCurrentView('shop');
  };

  // Handler for order success
  const handleOrderSuccess = (order: Order) => {
    setCompletedOrder(order);
    setCurrentView('order-success');
  };

  // Handler for track order jump
  const handleTrackOrder = (orderNumber: string) => {
    setTrackOrderParam(orderNumber);
    setCurrentView('track-order');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-stone-900 font-['Urbanist','Plus_Jakarta_Sans',sans-serif] selection:bg-stone-950 selection:text-white">
      {/* Header (Hidden only inside Admin view for maximum screen estate) */}
      {currentView !== 'admin' && (
        <Header
          currentView={currentView}
          setCurrentView={setCurrentView}
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
              setCurrentView('shop');
            }}
            onViewDeals={() => setCurrentView('deals')}
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
            onInstantCheckout={() => setCurrentView('checkout')}
            onBackToShop={() => setCurrentView('shop')}
          />
        )}

        {currentView === 'cart' && (
          <CartView
            onProceedToCheckout={() => setCurrentView('checkout')}
            onContinueShopping={() => setCurrentView('shop')}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutView
            onOrderSuccess={handleOrderSuccess}
            onBackToCart={() => setCurrentView('cart')}
          />
        )}

        {currentView === 'order-success' && completedOrder && (
          <OrderSuccessView
            order={completedOrder}
            onTrackOrder={handleTrackOrder}
            onContinueShopping={() => setCurrentView('home')}
          />
        )}

        {currentView === 'track-order' && (
          <TrackOrderView
            initialOrderNumber={trackOrderParam}
            onExploreProducts={() => setCurrentView('shop')}
          />
        )}

        {(currentView === 'account' || currentView === 'wishlist') && (
          <CustomerAccountView
            onTrackOrder={handleTrackOrder}
            onSelectProduct={handleSelectProduct}
            onGoToShop={() => setCurrentView('shop')}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboardView
            onBackToStorefront={() => setCurrentView('home')}
          />
        )}

        {['about', 'contact', 'faq', 'delivery', 'returns', 'privacy', 'terms'].includes(currentView) && (
          <StaticPagesView
            page={currentView as any}
            onExploreShop={() => setCurrentView('shop')}
          />
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        onCheckout={() => setCurrentView('checkout')}
        onViewCart={() => setCurrentView('cart')}
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
          setCurrentView('checkout');
        }}
      />

      {/* Global Footer (Hidden in Admin console) */}
      {currentView !== 'admin' && (
        <Footer
          setCurrentView={setCurrentView}
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
