import React, { useState } from 'react';
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  RefreshCw,
  Check,
  ArrowRight,
  Share2,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Maximize2,
  X,
} from 'lucide-react';
import { Product, ProductVariant, Review } from '../types';
import { formatPKR, SITE_CONFIG, POPULAR_PAKISTANI_CITIES } from '../config/site';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { storeService } from '../services/storeService';
import { ProductCard } from '../components/storefront/ProductCard';
import {
  stripHtml,
  formatProductDescriptionHtml,
  FALLBACK_PRODUCT_IMAGE,
} from '../utils/htmlUtils';

interface ProductDetailViewProps {
  product: Product;
  onSelectProduct: (p: Product) => void;
  onInstantCheckout: () => void;
  onBackToShop: () => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  onSelectProduct,
  onInstantCheckout,
  onBackToShop,
}) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants?.[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Lahore');
  const [activeTab, setActiveTab] = useState<'specs' | 'shipping' | 'reviews'>('specs');

  // Review submission form state
  const [reviewerName, setReviewerName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const reviews = storeService.getReviewsForProduct(product.id);
  const allProducts = storeService.getProducts();
  const relatedProducts = allProducts
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4);

  const price = selectedVariant?.priceOverride ?? product.price;
  const maxStock = selectedVariant ? selectedVariant.stock : product.stock;
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    const success = addToCart(product, selectedVariant, quantity);
    if (success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }
  };

  const handleBuyNow = () => {
    addToCart(product, selectedVariant, quantity);
    onInstantCheckout();
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) return;

    storeService.addReview({
      productId: product.id,
      userName: reviewerName,
      rating: reviewRating,
      title: reviewTitle || 'Excellent product',
      comment: reviewComment,
      isVerifiedPurchase: true,
    });

    setReviewSubmitted(true);
    setReviewerName('');
    setReviewTitle('');
    setReviewComment('');
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Breadcrumbs */}
      <div className="border-b border-stone-100 bg-stone-50/60 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-stone-500 font-mono">
            <button onClick={onBackToShop} className="hover:text-stone-900 transition-colors">
              Store
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <button onClick={onBackToShop} className="hover:text-stone-900 transition-colors">
              {product.categoryName}
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-stone-900 font-medium truncate max-w-xs">{stripHtml(product.name)}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* LEFT: Multi-image Gallery */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="relative aspect-square sm:aspect-4/3 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 group">
              <img
                src={product.images[selectedImage] || product.images[0] || FALLBACK_PRODUCT_IMAGE}
                alt={stripHtml(product.name)}
                className="w-full h-full object-cover object-center transition-all duration-300"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_PRODUCT_IMAGE;
                }}
              />

              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <div className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-bold font-mono px-2.5 py-1 rounded shadow-md z-10">
                  SAVE {formatPKR(product.compareAtPrice - product.price)}
                </div>
              )}

              {/* Image Counter & Zoom Action */}
              <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                {product.images.length > 1 && (
                  <span className="px-2.5 py-1 bg-stone-950/70 backdrop-blur-xs text-white text-[11px] font-mono rounded-lg shadow-sm">
                    {selectedImage + 1} / {product.images.length}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setLightboxImage(product.images[selectedImage] || product.images[0] || FALLBACK_PRODUCT_IMAGE);
                    setLightboxOpen(true);
                  }}
                  className="p-2 rounded-lg bg-stone-950/70 hover:bg-stone-950 text-white backdrop-blur-xs transition-colors shadow-sm"
                  title="View Full Size Image"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Prev / Next Arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedImage((prev) => (prev > 0 ? prev - 1 : product.images.length - 1))
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-stone-900 shadow-md flex items-center justify-center transition-transform hover:scale-105 opacity-80 sm:opacity-0 group-hover:opacity-100 z-10"
                    aria-label="Previous Image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedImage((prev) => (prev < product.images.length - 1 ? prev + 1 : 0))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-stone-900 shadow-md flex items-center justify-center transition-transform hover:scale-105 opacity-80 sm:opacity-0 group-hover:opacity-100 z-10"
                    aria-label="Next Image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Row */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      selectedImage === idx
                        ? 'border-stone-950 ring-2 ring-stone-950/20'
                        : 'border-stone-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_PRODUCT_IMAGE;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Contiguous Purchase Module */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="space-y-5">
              {/* Category & SKU */}
              <div className="flex items-center justify-between text-xs text-stone-500 font-mono">
                <span className="uppercase tracking-widest text-emerald-700 font-semibold">
                  {stripHtml(product.categoryName || '')}
                </span>
                <span>SKU: {selectedVariant?.sku || product.sku}</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-950 font-['Syne'] leading-tight">
                {stripHtml(product.name)}
              </h1>

              {/* Rating & Review Counter */}
              <div className="flex items-center gap-3">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? 'fill-amber-400 stroke-amber-400'
                          : 'stroke-stone-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-stone-900 font-mono">{product.rating}</span>
                <span className="text-stone-300">·</span>
                <span className="text-xs text-stone-500">{product.reviewCount} Verified Reviews</span>
              </div>

              {/* Price Block */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 flex items-baseline justify-between">
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-extrabold text-stone-950 font-mono">
                      {formatPKR(price)}
                    </span>
                    {product.compareAtPrice && product.compareAtPrice > price && (
                      <span className="text-base text-stone-400 line-through font-mono">
                        {formatPKR(product.compareAtPrice)}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Inclusive of all taxes. Free delivery over Rs. 2,000.
                  </p>
                </div>

                <span
                  className={`text-xs font-mono font-semibold px-2 py-1 rounded ${
                    maxStock > 5
                      ? 'bg-emerald-100 text-emerald-800'
                      : maxStock > 0
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {maxStock > 5 ? 'In Stock' : maxStock > 0 ? `Only ${maxStock} Left` : 'Sold Out'}
                </span>
              </div>

              {/* Short Description */}
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {stripHtml(product.shortDescription)}
              </p>

              {/* Variants Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold text-stone-900">
                    Configuration & Finish:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`p-3 text-left rounded-xl border transition-all ${
                          selectedVariant?.id === v.id
                            ? 'border-stone-950 bg-stone-950 text-white shadow-xs'
                            : 'border-stone-200 bg-white text-stone-800 hover:border-stone-400'
                        }`}
                      >
                        <p className="text-xs font-bold">{v.name}</p>
                        <p className={`text-[11px] font-mono mt-0.5 ${selectedVariant?.id === v.id ? 'text-stone-300' : 'text-stone-500'}`}>
                          {v.stock > 0 ? `${v.stock} in stock` : 'Out of stock'}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Stepper */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-stone-900 mb-1.5">
                  Order Quantity:
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3.5 py-2 text-stone-600 hover:bg-stone-100 text-sm font-mono font-bold"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 text-xs font-bold font-mono text-stone-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                      disabled={quantity >= maxStock}
                      className="px-3.5 py-2 text-stone-600 hover:bg-stone-100 text-sm font-mono font-bold disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={`p-2.5 rounded-lg border transition-colors ${
                      inWishlist
                        ? 'border-rose-300 bg-rose-50 text-rose-600'
                        : 'border-stone-200 text-stone-600 hover:border-stone-400'
                    }`}
                    title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
                  >
                    <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-600' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-4">
                <button
                  onClick={handleAddToCart}
                  disabled={maxStock === 0}
                  className={`w-full py-3.5 px-6 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                    added
                      ? 'bg-emerald-600 text-white'
                      : maxStock === 0
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      : 'bg-stone-950 text-white hover:bg-stone-800'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Shopping Bag</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={maxStock === 0}
                  className="w-full py-3.5 px-6 rounded-xl text-xs sm:text-sm font-bold bg-emerald-700 text-white hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-40"
                >
                  <span>ORDER ON CASH ON DELIVERY</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Pakistani Delivery Estimator */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-semibold text-stone-900">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Estimated Delivery for:</span>
                  </span>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="bg-white border border-stone-300 rounded px-2 py-1 text-xs text-stone-900 font-medium"
                  >
                    {POPULAR_PAKISTANI_CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-between text-stone-600 pt-1 border-t border-stone-200/60">
                  <span>Courier: TCS / Leopards Express</span>
                  <span className="font-semibold text-emerald-800">
                    {selectedCity === 'Lahore' || selectedCity === 'Karachi' || selectedCity === 'Islamabad'
                      ? '1 - 2 Business Days'
                      : '2 - 3 Business Days'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lower Section: Tabs (Specs, Shipping Info, Reviews) */}
        <div className="mt-16 pt-8 border-t border-stone-200">
          <div className="flex items-center gap-6 border-b border-stone-200 pb-3">
            <button
              onClick={() => setActiveTab('specs')}
              className={`text-sm font-bold transition-colors pb-3 -mb-3 border-b-2 ${
                activeTab === 'specs'
                  ? 'border-stone-950 text-stone-950'
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              Technical Specifications
            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              className={`text-sm font-bold transition-colors pb-3 -mb-3 border-b-2 ${
                activeTab === 'shipping'
                  ? 'border-stone-950 text-stone-950'
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              Packaging & Delivery
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`text-sm font-bold transition-colors pb-3 -mb-3 border-b-2 ${
                activeTab === 'reviews'
                  ? 'border-stone-950 text-stone-950'
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              Verified Customer Reviews ({reviews.length})
            </button>
          </div>

          <div className="py-8">
            {activeTab === 'specs' && (
              <div className="max-w-3xl space-y-6">
                <div
                  className="text-xs sm:text-sm text-stone-700 leading-relaxed space-y-2 [&_h1]:text-xl [&_h1]:font-black [&_h1]:text-stone-900 [&_h1]:mt-4 [&_h1]:mb-2 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-stone-900 [&_h2]:mt-3 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-stone-900 [&_h3]:mt-3 [&_h3]:mb-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_blockquote]:border-l-4 [&_blockquote]:border-amber-400 [&_blockquote]:pl-3.5 [&_blockquote]:italic [&_blockquote]:text-stone-600 [&_blockquote]:my-3 [&_a]:text-emerald-700 [&_a]:underline [&_img]:rounded-2xl [&_img]:shadow-md [&_img]:max-w-full [&_img]:my-4 [&_img]:mx-auto [&_img]:border [&_img]:border-stone-200/80 [&_figure]:my-5 [&_figure]:text-center [&_figcaption]:text-xs [&_figcaption]:text-stone-500 [&_figcaption]:mt-1.5 [&_figcaption]:italic"
                  dangerouslySetInnerHTML={{ __html: formatProductDescriptionHtml(product.description) }}
                />

                <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100">
                  {Object.entries(product.specifications).map(([key, val]) => (
                    <div key={key} className="grid grid-cols-3 p-3.5 text-xs bg-stone-50/50">
                      <span className="font-semibold text-stone-800">{key}</span>
                      <span className="col-span-2 text-stone-600 font-mono">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="max-w-3xl space-y-4 text-xs sm:text-sm text-stone-600 leading-relaxed">
                <p>
                  Every order placed on <strong>YehMart</strong> is packed in high-density tamper-evident protective transit packaging to ensure pristine condition upon arrival.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                    <h5 className="font-bold text-stone-900 mb-1">Cash on Delivery (COD)</h5>
                    <p className="text-xs text-stone-500">
                      Pay cash directly to the TCS or Leopards courier delivery rider upon inspecting the parcel at your doorstep.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                    <h5 className="font-bold text-stone-900 mb-1">Free Delivery Eligibility</h5>
                    <p className="text-xs text-stone-500">
                      Orders with a total of Rs. {SITE_CONFIG.freeShippingThreshold.toLocaleString()} or more automatically receive complimentary express shipping.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="max-w-3xl space-y-8">
                {/* Submit New Review Form */}
                <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200">
                  <h4 className="text-sm font-bold text-stone-900 mb-2">Write a Verified Review</h4>
                  <p className="text-xs text-stone-500 mb-4">
                    Share your experience with fellow buyers in Pakistan.
                  </p>

                  {reviewSubmitted ? (
                    <div className="p-3 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-medium flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>Thank you! Your verified review has been published.</span>
                    </div>
                  ) : (
                    <form onSubmit={handleReviewSubmit} className="space-y-3.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Your Name
                          </label>
                          <input
                            type="text"
                            required
                            value={reviewerName}
                            onChange={(e) => setReviewerName(e.target.value)}
                            placeholder="e.g. Asad Malik"
                            className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-stone-900"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Rating
                          </label>
                          <select
                            value={reviewRating}
                            onChange={(e) => setReviewRating(Number(e.target.value))}
                            className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-stone-900"
                          >
                            <option value={5}>5 Stars - Outstanding</option>
                            <option value={4}>4 Stars - Very Good</option>
                            <option value={3}>3 Stars - Average</option>
                            <option value={2}>2 Stars - Subpar</option>
                            <option value={1}>1 Star - Poor</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Review Headline
                        </label>
                        <input
                          type="text"
                          value={reviewTitle}
                          onChange={(e) => setReviewTitle(e.target.value)}
                          placeholder="e.g. Exceptional sound and solid build quality"
                          className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-stone-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Detailed Feedback
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="How did the product perform? How was the delivery speed in your city?"
                          className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-stone-900"
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-5 py-2 bg-stone-950 text-white text-xs font-bold rounded-lg hover:bg-stone-800 transition-colors"
                      >
                        Submit Verified Review
                      </button>
                    </form>
                  )}
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <p className="text-xs text-stone-400">No customer reviews yet. Be the first to review!</p>
                  ) : (
                    reviews.map((rev: any) => (
                      <div key={rev.id} className="p-4 rounded-xl border border-stone-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-stone-900">{rev.userName}</span>
                            {rev.isVerifiedPurchase && (
                              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-medium">
                                Verified Buyer
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-stone-400 font-mono">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-amber-500">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                          ))}
                        </div>

                        <h5 className="text-xs font-bold text-stone-900">{rev.title}</h5>
                        <p className="text-xs text-stone-600 leading-relaxed">{rev.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-stone-200">
            <h3 className="text-xl font-bold font-['Syne'] text-stone-950 mb-6">
              Customers Also Purchased
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onSelect={onSelectProduct}
                  onQuickView={onSelectProduct}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FULL-SIZE IMAGE LIGHTBOX MODAL */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-5 right-5 p-3 rounded-full bg-stone-900/80 hover:bg-stone-800 text-white transition-colors z-20"
            aria-label="Close Fullscreen Image"
          >
            <X className="w-6 h-6" />
          </button>
          <div
            className="relative max-w-5xl max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImage || FALLBACK_PRODUCT_IMAGE}
              alt="Zoomed Product"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl border border-stone-800 bg-stone-900"
              onError={(e) => {
                (e.target as HTMLImageElement).src = FALLBACK_PRODUCT_IMAGE;
              }}
            />
            <p className="text-xs text-stone-400 mt-3 font-mono">
              {stripHtml(product.name)} • High-Resolution Atelier Capture
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
