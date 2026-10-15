import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Truck, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPKR } from '../../config/site';

interface CartDrawerProps {
  onCheckout: () => void;
  onViewCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout, onViewCart }) => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    itemCount,
    freeShippingProgress,
    amountNeededForFreeShipping,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col z-10">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-stone-900" />
            <h2 className="text-base font-bold text-stone-900 font-['Syne']">
              Shopping Bag ({itemCount})
            </h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 text-stone-400 hover:text-stone-900 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Meter */}
        <div className="px-6 py-3.5 bg-stone-50 border-b border-stone-200 text-xs">
          <div className="flex items-center justify-between text-stone-700 mb-1.5">
            <span className="flex items-center gap-1.5 font-medium">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              {amountNeededForFreeShipping === 0 ? (
                <span className="text-emerald-700 font-semibold">
                  You unlocked FREE Delivery across Pakistan! 🎉
                </span>
              ) : (
                <span>
                  Add <strong>{formatPKR(amountNeededForFreeShipping)}</strong> more for FREE Shipping!
                </span>
              )}
            </span>
            <span className="font-mono text-stone-500 font-semibold">{freeShippingProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-stone-100">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-stone-400">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="text-base font-semibold text-stone-800">Your bag is empty</p>
              <p className="text-xs text-stone-500 mt-1 max-w-xs">
                Explore our catalog of precision acoustics, horology, and heavyweight knitwear.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-5 px-5 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="py-4 flex gap-4 items-start">
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded-lg bg-stone-100 shrink-0 border border-stone-200/80"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-stone-900 truncate">
                    {item.product.name}
                  </h4>
                  {item.selectedVariant && (
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Variant: {item.selectedVariant.name}
                    </p>
                  )}
                  <p className="text-xs font-bold text-stone-950 font-mono mt-1">
                    {formatPKR(item.unitPrice)}
                  </p>

                  {/* Quantity Stepper & Remove */}
                  <div className="mt-2.5 flex items-center justify-between">
                    <div className="flex items-center border border-stone-200 rounded-md overflow-hidden bg-white">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-1 text-stone-600 hover:bg-stone-100 text-xs font-mono"
                      >
                        -
                      </button>
                      <span className="px-2.5 py-1 text-[11px] font-semibold font-mono text-stone-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-1 text-stone-600 hover:bg-stone-100 text-xs font-mono"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Subtotal & Action */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-stone-200 bg-stone-50/70 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-600">Subtotal:</span>
              <span className="text-base font-extrabold text-stone-950 font-mono">
                {formatPKR(subtotal)}
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Taxes included. Standard shipping calculated at checkout.
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onCheckout();
                }}
                className="w-full py-3 bg-stone-950 text-white text-xs font-bold rounded-lg hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onViewCart();
                }}
                className="w-full py-2 bg-white text-stone-700 border border-stone-300 text-xs font-semibold rounded-lg hover:bg-stone-100 transition-colors"
              >
                View Detailed Bag & Apply Promo Code
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cash on Delivery Guaranteed</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
