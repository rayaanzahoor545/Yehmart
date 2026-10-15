import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  Truck,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { SITE_CONFIG, formatPKR } from '../../config/site';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { storeService } from '../../services/storeService';
import { Product } from '../../types';
import { stripHtml } from '../../utils/htmlUtils';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (catSlug: string | null) => void;
  onSelectProduct: (product: Product) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  selectedCategory,
  setSelectedCategory,
  onSelectProduct,
}) => {
  const { itemCount, setIsCartOpen, subtotal } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAdmin, openLoginModal } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const products = storeService.getProducts();
    const matches = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.categoryName?.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q)
    );
    setSearchResults(matches.slice(0, 5));
  }, [searchQuery]);

  const categories = storeService.getCategories();

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-stone-950 text-stone-300 text-[11px] py-2 px-4 border-b border-stone-800/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-stone-200 font-medium tracking-wide">
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              <span>COMPLIMENTARY EXPRESS DISPATCH OVER RS. 2,000</span>
            </span>
            <span className="hidden md:inline text-stone-700">·</span>
            <span className="hidden md:inline text-stone-400">100% Cash on Delivery Nationwide</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentView('track-order')}
              className="hover:text-white transition-colors hidden sm:inline tracking-wider uppercase text-[10px]"
            >
              Track Consignment
            </button>
            <button
              onClick={() => setCurrentView('contact')}
              className="hover:text-white transition-colors hidden sm:inline tracking-wider uppercase text-[10px]"
            >
              Concierge Care
            </button>
          </div>
        </div>
      </div>

      {/* Main Header (Sticky 3-Zone Contract) */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 bg-white/95 backdrop-blur-xl ${
          isScrolled ? 'border-b border-stone-200/90 shadow-sm py-3' : 'border-b border-stone-100 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-stone-800 hover:text-stone-950"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Zone 1: Official YehMart Brand Logo */}
            <div className="flex items-center gap-4">
              <BrandLogo
                size="md"
                onClick={() => {
                  setSelectedCategory(null);
                  setCurrentView('home');
                }}
              />
            </div>

            {/* Zone 2: Clean text navigation links */}
            <nav className="hidden lg:flex items-center gap-8 text-[13px] font-semibold text-stone-700 tracking-wide uppercase">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setCurrentView('home');
                }}
                className={`relative py-1 transition-colors hover:text-stone-950 ${
                  currentView === 'home' && !selectedCategory
                    ? 'text-stone-950 font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-stone-950'
                    : ''
                }`}
              >
                Home
              </button>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setCurrentView('shop');
                }}
                className={`relative py-1 transition-colors hover:text-stone-950 ${
                  currentView === 'shop' && !selectedCategory
                    ? 'text-stone-950 font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-stone-950'
                    : ''
                }`}
              >
                Catalog
              </button>
              <button
                onClick={() => {
                  setSelectedCategory('tech-audio');
                  setCurrentView('shop');
                }}
                className="hover:text-stone-950 transition-colors"
              >
                Acoustics
              </button>
              <button
                onClick={() => {
                  setSelectedCategory('watches');
                  setCurrentView('shop');
                }}
                className="hover:text-stone-950 transition-colors"
              >
                Horology
              </button>
              <button
                onClick={() => {
                  setSelectedCategory('mens-wear');
                  setCurrentView('shop');
                }}
                className="hover:text-stone-950 transition-colors"
              >
                Apparel
              </button>
              <button
                onClick={() => setCurrentView('deals')}
                className="flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-bold transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Flash Drops</span>
              </button>
            </nav>

            {/* Zone 3: Actions (Search, Wishlist, Account, Cart) */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search Toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-stone-700 hover:text-stone-950 rounded-md hover:bg-stone-100 transition-colors"
                aria-label="Search catalog"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist */}
              <button
                onClick={() => setCurrentView('wishlist')}
                className="p-2 text-stone-700 hover:text-stone-950 rounded-md hover:bg-stone-100 transition-colors relative"
                aria-label="View wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-stone-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Account / Admin */}
              {user ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentView('account')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 hover:border-stone-400 bg-stone-50 hover:bg-stone-100 transition-colors text-xs font-semibold text-stone-900 cursor-pointer"
                    title={`Signed in as ${user.fullName || user.email}`}
                  >
                    <User className="w-4 h-4 text-emerald-700" />
                    <span className="max-w-[110px] truncate hidden sm:inline">
                      {user.fullName || user.email?.split('@')[0]}
                    </span>
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => setCurrentView('admin')}
                      className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-stone-900 text-amber-300 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                      title="Open Store Administration"
                    >
                      <span>Admin</span>
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={openLoginModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-900 transition-colors text-xs font-bold cursor-pointer"
                  title="Sign In or Register"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}

              {/* Shopping Bag / Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-stone-950 text-white rounded-md hover:bg-stone-800 transition-colors ml-1"
                aria-label="Shopping bag"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="text-xs font-semibold tabular-nums">
                  {itemCount}
                </span>
                {subtotal > 0 && (
                  <span className="hidden md:inline text-xs border-l border-stone-700 pl-2 font-mono">
                    {formatPKR(subtotal)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Live Search Drawer / Popup */}
        {searchOpen && (
          <div className="border-t border-stone-200 bg-stone-50/95 backdrop-blur-md px-4 py-3">
            <div className="max-w-3xl mx-auto">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-stone-400 absolute left-3" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search earbuds, watches, 320 GSM hoodies, wallets..."
                  className="w-full bg-white border border-stone-300 rounded-lg pl-9 pr-10 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                />
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchOpen(false);
                  }}
                  className="absolute right-3 text-stone-400 hover:text-stone-600 text-xs uppercase font-medium"
                >
                  ESC
                </button>
              </div>

              {/* Quick suggestions or results */}
              {searchResults.length > 0 && (
                <div className="mt-3 bg-white border border-stone-200 rounded-lg divide-y divide-stone-100 shadow-md overflow-hidden">
                  {searchResults.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => {
                        onSelectProduct(product);
                        setSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="w-full text-left p-3 hover:bg-stone-50 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded bg-stone-100 shrink-0"
                        />
                        <div>
                          <p className="text-xs font-semibold text-stone-900">{product.name}</p>
                          <p className="text-[11px] text-stone-500">{product.categoryName} · SKU: {product.sku}</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-stone-950 font-mono">
                        {formatPKR(product.price)}
                      </span>
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setCurrentView('shop');
                      setSearchOpen(false);
                    }}
                    className="w-full p-2.5 text-center text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-50/60"
                  >
                    View all results in Shop Catalog →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-xl z-10 flex flex-col justify-between p-6">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-stone-100">
                <BrandLogo
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(null);
                    setCurrentView('home');
                    setMobileMenuOpen(false);
                  }}
                />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-stone-500 hover:text-stone-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-6 space-y-4">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setCurrentView('home');
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-base font-medium text-stone-900"
                >
                  Home
                </button>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setCurrentView('shop');
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-base font-medium text-stone-900"
                >
                  Shop Catalog
                </button>
                <button
                  onClick={() => {
                    setCurrentView('deals');
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-base font-semibold text-emerald-700"
                >
                  ⚡ Flash Drop Discounts
                </button>
                <button
                  onClick={() => {
                    setCurrentView('track-order');
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-base font-medium text-stone-700"
                >
                  Track Order
                </button>
                <button
                  onClick={() => {
                    setCurrentView('wishlist');
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-base font-medium text-stone-700"
                >
                  Wishlist ({wishlistCount})
                </button>
                {user ? (
                  <>
                    <button
                      onClick={() => {
                        setCurrentView('account');
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left text-base font-medium text-stone-700"
                    >
                      My Account ({user.fullName || user.email?.split('@')[0]})
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setCurrentView('admin');
                          setMobileMenuOpen(false);
                        }}
                        className="block w-full text-left text-base font-semibold text-amber-600"
                      >
                        Admin Dashboard ⚙
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => {
                      openLoginModal();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left text-base font-semibold text-emerald-800"
                  >
                    Sign In / Register
                  </button>
                )}
              </div>

              <div className="pt-4 border-t border-stone-100">
                <p className="text-xs uppercase tracking-wider text-stone-400 font-semibold mb-3">Categories</p>
                <div className="space-y-2.5">
                  {categories.map((c, idx) => (
                    <button
                      key={`hdr-cat-${c.id}-${idx}`}
                      onClick={() => {
                        setSelectedCategory(c.slug);
                        setCurrentView('shop');
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left text-xs text-stone-600 hover:text-stone-950"
                    >
                      {stripHtml(c.name)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-stone-100 text-xs text-stone-500">
              <p className="font-medium text-stone-800">Support Hotline</p>
              <p className="mt-0.5">{SITE_CONFIG.supportPhone}</p>
              <p className="text-[11px] text-stone-400 mt-1">Cash on Delivery across Pakistan</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
