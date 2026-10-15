import React, { useState, useMemo, useEffect } from 'react';
import { Filter, SlidersHorizontal, ArrowUpDown, X, Check, Search, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { storeService } from '../services/storeService';
import { ProductCard } from '../components/storefront/ProductCard';
import { Product } from '../types';
import { formatPKR } from '../config/site';
import { stripHtml } from '../utils/htmlUtils';

interface ShopViewProps {
  initialCategory: string | null;
  onSelectProduct: (p: Product) => void;
  onQuickView: (p: Product) => void;
}

export const ShopView: React.FC<ShopViewProps> = ({
  initialCategory,
  onSelectProduct,
  onQuickView,
}) => {
  const categories = storeService.getCategories();
  const allProducts = storeService.getProducts();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [searchFilter, setSearchFilter] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(25000);
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<
    'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating'
  >('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Pagination & items per page (20, 50, 100, all)
  const [pageSize, setPageSize] = useState<number | 'all'>(20);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Reset to first page whenever filtering or sorting changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchFilter, maxPrice, minRating, inStockOnly, sortBy, pageSize]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return allProducts
      .filter((p) => {
        if (p.isPublished === false) return false;
        if (selectedCategory && p.categoryId !== selectedCategory) {
          const matchCat = categories.find((c) => c.slug === selectedCategory);
          if (matchCat && p.categoryId !== matchCat.id) return false;
        }
        if (searchFilter.trim()) {
          const q = searchFilter.toLowerCase();
          const match =
            p.name.toLowerCase().includes(q) ||
            p.shortDescription.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q);
          if (!match) return false;
        }
        if (p.price > maxPrice) return false;
        if (minRating > 0 && p.rating < minRating) return false;
        if (inStockOnly && p.stock <= 0) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [allProducts, selectedCategory, searchFilter, maxPrice, minRating, inStockOnly, sortBy, categories]);

  // Compute pagination slices
  const totalProducts = filteredProducts.length;
  const totalPages = pageSize === 'all' ? 1 : Math.max(1, Math.ceil(totalProducts / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedProducts = useMemo(() => {
    if (pageSize === 'all') return filteredProducts;
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredProducts.slice(startIndex, startIndex + pageSize);
  }, [filteredProducts, safeCurrentPage, pageSize]);

  const startIndex = pageSize === 'all' ? 1 : totalProducts === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endIndex = pageSize === 'all' ? totalProducts : Math.min(totalProducts, safeCurrentPage * pageSize);

  const clearAllFilters = () => {
    setSelectedCategory(null);
    setSearchFilter('');
    setMaxPrice(25000);
    setMinRating(0);
    setInStockOnly(false);
    setSortBy('featured');
  };

  return (
    <div className="bg-white min-h-screen py-8 lg:py-12 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-stone-200 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-stone-500 font-semibold font-mono">
              Store Catalog
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-950 font-['Syne'] mt-0.5">
              {selectedCategory
                ? categories.find((c) => c.slug === selectedCategory || c.id === selectedCategory)?.name || 'All Products'
                : 'All Products & Audio'}
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Showing <span className="font-semibold text-stone-900 font-mono">{startIndex}-{endIndex}</span> of{' '}
              <span className="font-semibold text-stone-900 font-mono">{totalProducts}</span> articles with nationwide Cash on Delivery.
            </p>
          </div>

          {/* Sort & Mobile Filter Controls & Items Per Page */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Items Per Page Selector (20, 50, 100, All) */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
              <span className="text-[11px] font-semibold text-stone-500 px-1.5 hidden sm:inline">
                Show:
              </span>
              {[20, 50, 100].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPageSize(num)}
                  className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-all ${
                    pageSize === num
                      ? 'bg-stone-950 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-white/80'
                  }`}
                  title={`View ${num} products per page`}
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPageSize('all')}
                className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-all ${
                  pageSize === 'all'
                    ? 'bg-stone-950 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/80'
                }`}
                title="View all products on single page"
              >
                All
              </button>
            </div>

            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-800 flex items-center gap-1.5 hover:bg-stone-50"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-stone-500 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 font-medium focus:outline-hidden focus:border-stone-900"
              >
                <option value="featured">Featured Picks</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Customer Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main 2-Column Catalog Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
          {/* DESKTOP SIDEBAR FILTERS (Col 1) */}
          <aside className="hidden lg:block space-y-6">
            {/* Search within category */}
            <div>
              <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter by keyword..."
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-hidden focus:border-stone-900"
                />
              </div>
            </div>

            {/* Category Tree */}
            <div>
              <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
                Departments
              </label>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    !selectedCategory
                      ? 'bg-stone-950 text-white'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-950'
                  }`}
                >
                  <span>All Categories</span>
                  <span className="font-mono text-[11px] opacity-70">{allProducts.length}</span>
                </button>
                {categories.map((c, idx) => {
                  const count = allProducts.filter((p) => p.categoryId === c.id && p.isPublished !== false).length;
                  const isSelected = selectedCategory === c.slug || selectedCategory === c.id;
                  const categoryTitle = stripHtml(c.name);
                  return (
                    <button
                      key={`${c.id}-${idx}`}
                      onClick={() => setSelectedCategory(c.id)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                        isSelected
                          ? 'bg-stone-950 text-white'
                          : 'text-stone-600 hover:bg-stone-100 hover:text-stone-950'
                      }`}
                    >
                      <span className="truncate mr-2">{categoryTitle}</span>
                      <span className="font-mono text-[11px] opacity-70 shrink-0">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
                <span>Max Price</span>
                <span className="font-mono text-emerald-700">{formatPKR(maxPrice)}</span>
              </div>
              <input
                type="range"
                min={1500}
                max={25000}
                step={500}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-stone-900 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono mt-1">
                <span>Rs. 1,500</span>
                <span>Rs. 25,000+</span>
              </div>
            </div>

            {/* In Stock Only */}
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-700">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded border-stone-300 text-stone-900 focus:ring-stone-900 w-4 h-4"
                />
                <span>In-Stock Items Only</span>
              </label>
            </div>

            {/* Reset Filters */}
            <button
              onClick={clearAllFilters}
              className="w-full py-2 px-3 border border-stone-200 text-stone-600 hover:text-stone-950 text-xs font-semibold rounded-lg hover:bg-stone-50 transition-colors"
            >
              Clear All Filters
            </button>
          </aside>

          {/* PRODUCTS GRID (Col 2-4) */}
          <main className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-stone-200 rounded-2xl">
                <p className="text-base font-semibold text-stone-800">No products match your criteria</p>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Try adjusting the maximum price or clear your category filter to see available inventory.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-4 px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedProducts.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onSelect={onSelectProduct}
                      onQuickView={onQuickView}
                    />
                  ))}
                </div>

                {/* BOTTOM PAGINATION CONTROLS */}
                {totalProducts > 0 && (
                  <div className="pt-8 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-stone-500 font-mono">
                      Showing <span className="font-bold text-stone-900">{startIndex}-{endIndex}</span> of{' '}
                      <span className="font-bold text-stone-900">{totalProducts}</span> articles
                    </div>

                    {/* Page Numbers */}
                    {totalPages > 1 && pageSize !== 'all' && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentPage((p) => Math.max(1, p - 1));
                            window.scrollTo({ top: 180, behavior: 'smooth' });
                          }}
                          disabled={safeCurrentPage === 1}
                          className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 disabled:opacity-40 disabled:pointer-events-none text-stone-700 transition-colors cursor-pointer"
                          aria-label="Previous Page"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter((page) => {
                            return (
                              page === 1 ||
                              page === totalPages ||
                              Math.abs(page - safeCurrentPage) <= 2
                            );
                          })
                          .map((page, idx, arr) => {
                            const prev = arr[idx - 1];
                            const showEllipsis = prev && page - prev > 1;

                            return (
                              <React.Fragment key={page}>
                                {showEllipsis && (
                                  <span className="px-1 text-stone-400 font-mono text-xs">...</span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCurrentPage(page);
                                    window.scrollTo({ top: 180, behavior: 'smooth' });
                                  }}
                                  className={`w-9 h-9 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                                    safeCurrentPage === page
                                      ? 'bg-stone-950 text-white shadow-xs'
                                      : 'border border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-400'
                                  }`}
                                >
                                  {page}
                                </button>
                              </React.Fragment>
                            );
                          })}

                        <button
                          type="button"
                          onClick={() => {
                            setCurrentPage((p) => Math.min(totalPages, p + 1));
                            window.scrollTo({ top: 180, behavior: 'smooth' });
                          }}
                          disabled={safeCurrentPage === totalPages}
                          className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 disabled:opacity-40 disabled:pointer-events-none text-stone-700 transition-colors cursor-pointer"
                          aria-label="Next Page"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Quick Per-Page Switcher */}
                    <div className="flex items-center gap-1.5 text-xs text-stone-500">
                      <span className="font-mono text-[11px]">Per page:</span>
                      {[20, 50, 100].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setPageSize(num)}
                          className={`px-2 py-1 rounded text-xs font-mono font-bold transition-colors cursor-pointer ${
                            pageSize === num
                              ? 'bg-stone-900 text-white'
                              : 'text-stone-600 hover:bg-stone-100'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setPageSize('all')}
                        className={`px-2 py-1 rounded text-xs font-mono font-bold transition-colors cursor-pointer ${
                          pageSize === 'all'
                            ? 'bg-stone-900 text-white'
                            : 'text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        All
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl p-6 flex flex-col justify-between z-10 overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                <h3 className="text-base font-bold text-stone-950 font-['Syne']">Catalog Filters</h3>
                <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-stone-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Departments */}
              <div>
                <p className="text-xs font-bold text-stone-900 uppercase mb-2">Department</p>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs ${
                      !selectedCategory ? 'bg-stone-900 text-white font-semibold' : 'text-stone-600'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((c, idx) => (
                    <button
                      key={`mob-cat-${c.id}-${idx}`}
                      onClick={() => {
                        setSelectedCategory(c.id);
                        setMobileFilterOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded text-xs ${
                        selectedCategory === c.id ? 'bg-stone-900 text-white font-semibold' : 'text-stone-600'
                      }`}
                    >
                      {stripHtml(c.name)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Price Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold text-stone-900 mb-2">
                  <span>Max Budget</span>
                  <span className="font-mono text-emerald-700">{formatPKR(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min={1500}
                  max={25000}
                  step={500}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-stone-900"
                />
              </div>

              {/* In stock */}
              <label className="flex items-center gap-2 text-xs font-medium text-stone-700">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-stone-900 w-4 h-4"
                />
                <span>In-Stock Only</span>
              </label>
            </div>

            <div className="pt-6 border-t border-stone-200 space-y-2">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-2.5 bg-stone-950 text-white text-xs font-bold rounded-lg"
              >
                Apply Filters ({filteredProducts.length})
              </button>
              <button
                onClick={() => {
                  clearAllFilters();
                  setMobileFilterOpen(false);
                }}
                className="w-full py-2 bg-stone-100 text-stone-700 text-xs font-semibold rounded-lg"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
