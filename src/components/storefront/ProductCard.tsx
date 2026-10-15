import React, { useState } from 'react';
import { Heart, Eye, ShoppingBag, Star, Check } from 'lucide-react';
import { Product } from '../../types';
import { formatPKR } from '../../config/site';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { stripHtml, FALLBACK_PRODUCT_IMAGE } from '../../utils/htmlUtils';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onQuickView,
}) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const inWishlist = isInWishlist(product.id);

  const discountPercentage =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = addToCart(product, product.variants?.[0], 1);
    if (success) {
      setAddedAnimation(true);
      setTimeout(() => setAddedAnimation(false), 1200);
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickView(product);
  };

  const primaryImage = product.images?.[0] || FALLBACK_PRODUCT_IMAGE;
  const secondaryImage = product.images?.[1] || primaryImage;
  const cleanTitle = stripHtml(product.name);
  const cleanShortDesc = stripHtml(product.shortDescription);

  return (
    <div
      onClick={() => onSelect(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col bg-white border border-stone-200/90 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >
      {/* Media Section (65-75% height) */}
      <div className="relative aspect-4/3 sm:aspect-square bg-stone-100 overflow-hidden">
        {/* Images with transition */}
        <img
          src={isHovered ? secondaryImage : primaryImage}
          alt={cleanTitle}
          className="w-full h-full object-cover object-center transition-all duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = FALLBACK_PRODUCT_IMAGE;
          }}
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10">
          {discountPercentage && (
            <span className="px-2 py-0.5 bg-rose-600 text-white text-[11px] font-bold rounded-sm font-mono tracking-tight shadow-xs">
              -{discountPercentage}%
            </span>
          )}
          {product.isNewArrival && !discountPercentage && (
            <span className="px-2 py-0.5 bg-stone-900 text-white text-[10px] font-semibold rounded-sm tracking-wider uppercase shadow-xs">
              New Arrival
            </span>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="px-2 py-0.5 bg-amber-500 text-stone-950 text-[10px] font-semibold rounded-sm tracking-wider shadow-xs">
              Only {product.stock} Left
            </span>
          )}
          {product.stock === 0 && (
            <span className="px-2 py-0.5 bg-stone-700 text-white text-[10px] font-semibold rounded-sm tracking-wider shadow-xs">
              Sold Out
            </span>
          )}
        </div>

        {/* Top-Right Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full transition-all duration-200 z-10 ${
            inWishlist
              ? 'bg-rose-50 text-rose-600 shadow-sm'
              : 'bg-white/80 text-stone-600 hover:text-stone-900 hover:bg-white backdrop-blur-xs'
          }`}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Hover Quick View Trigger */}
        <div className="absolute inset-x-2 bottom-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button
            onClick={handleQuickView}
            className="flex-1 py-2 px-3 bg-white/95 hover:bg-white text-stone-900 text-xs font-semibold rounded-md shadow-md backdrop-blur-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-stone-600" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Unboxed Metadata (Zero-pill discipline) */}
          <div className="flex items-center gap-2 text-[11px] text-stone-500 mb-1">
            <span className="uppercase tracking-wider font-semibold text-stone-600">
              {product.categoryName || 'Catalog'}
            </span>
            <span aria-hidden="true">·</span>
            <div className="flex items-center gap-0.5 text-amber-500">
              <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
              <span className="font-mono text-stone-700 font-semibold">{product.rating}</span>
              <span className="text-stone-400">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <h3 className="text-sm font-bold text-stone-900 font-['Urbanist','Outfit','Syne',sans-serif] tracking-[-0.02em] line-clamp-1 group-hover:text-emerald-800 transition-colors">
            {cleanTitle}
          </h3>

          <p className="text-xs text-stone-500 mt-1 line-clamp-1 font-['Urbanist','Plus_Jakarta_Sans',sans-serif] font-normal">
            {cleanShortDesc}
          </p>
        </div>

        {/* Price & Action Footer */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[15px] font-extrabold text-stone-950 font-mono tabular-nums tracking-tight">
              {formatPKR(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-stone-400 line-through font-mono tabular-nums">
                {formatPKR(product.compareAtPrice)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              addedAnimation
                ? 'bg-emerald-600 text-white'
                : product.stock === 0
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : 'bg-stone-900 text-white hover:bg-stone-800'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : product.stock === 0 ? (
              <span>Out of Stock</span>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
