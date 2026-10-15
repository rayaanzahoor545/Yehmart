import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, ArrowRight, Printer, MessageSquare, Truck, ShieldCheck } from 'lucide-react';
import { Order } from '../types';
import { formatPKR, SITE_CONFIG } from '../config/site';

interface OrderSuccessViewProps {
  order: Order;
  onTrackOrder: (orderNumber: string) => void;
  onContinueShopping: () => void;
}

export const OrderSuccessView: React.FC<OrderSuccessViewProps> = ({
  order,
  onTrackOrder,
  onContinueShopping,
}) => {
  useEffect(() => {
    // Fire celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#0f172a', '#f59e0b', '#3b82f6'],
      });
    } catch {
      // safe fallback
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const openWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello YehMart team, I placed order #${order.orderNumber} for ${formatPKR(
        order.totalAmount
      )}. Please confirm my dispatch!`
    );
    window.open(`https://wa.me/${SITE_CONFIG.whatsappNumber.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  return (
    <div className="bg-stone-50 min-h-screen py-12 lg:py-16 border-b border-stone-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Celebration Header */}
        <div className="text-center space-y-3 pb-8">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <span className="text-xs uppercase tracking-widest font-mono font-bold text-emerald-800">
            Order Successfully Placed
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-950 font-['Syne']">
            Thank you, {order.customerName}!
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
            Your order <strong>{order.orderNumber}</strong> has been logged into our fulfillment queue. An automated confirmation SMS has been sent to {order.customerPhone}.
          </p>
        </div>

        {/* Invoice Receipt Box */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-md p-6 sm:p-8 space-y-6">
          {/* Top Info Bar */}
          <div className="flex flex-wrap items-center justify-between pb-6 border-b border-stone-200 gap-4 text-xs">
            <div>
              <p className="text-stone-400 uppercase font-mono tracking-wider">Order Reference</p>
              <p className="text-base font-extrabold font-mono text-stone-950 mt-0.5">{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-stone-400 uppercase font-mono tracking-wider">Payment Mode</p>
              <p className="font-semibold text-stone-900 mt-0.5">Cash on Delivery (COD)</p>
            </div>
            <div>
              <p className="text-stone-400 uppercase font-mono tracking-wider">Expected Courier</p>
              <p className="font-semibold text-emerald-800 mt-0.5">{order.trackingCarrier || 'TCS Express'} (1-2 Days)</p>
            </div>
          </div>

          {/* Shipping Details */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 text-xs space-y-1">
            <p className="font-bold text-stone-900">Destination Address:</p>
            <p className="text-stone-600">{order.shippingAddress.recipientName} ({order.customerPhone})</p>
            <p className="text-stone-600">
              {order.shippingAddress.streetAddress}, {order.shippingAddress.areaLocality ? `${order.shippingAddress.areaLocality}, ` : ''}
              {order.shippingAddress.city}, {order.shippingAddress.province}
            </p>
          </div>

          {/* Ordered Line Items */}
          <div className="divide-y divide-stone-100 text-xs">
            <p className="font-bold uppercase tracking-wider text-stone-900 pb-2">Ordered Articles</p>
            {order.items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt="" className="w-12 h-12 object-cover rounded bg-stone-100" />
                  )}
                  <div>
                    <p className="font-semibold text-stone-900">{item.productName}</p>
                    {item.variantName && <p className="text-[11px] text-stone-500">{item.variantName}</p>}
                    <p className="text-[11px] text-stone-400">Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-stone-950">{formatPKR(item.totalPrice)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="pt-4 border-t border-stone-200 text-xs space-y-1.5">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal:</span>
              <span className="font-mono font-bold">{formatPKR(order.subtotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount Applied:</span>
                <span className="font-mono font-bold">-{formatPKR(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-stone-600">
              <span>Shipping Fee:</span>
              <span className="font-mono font-bold">
                {order.shippingFee === 0 ? <span className="text-emerald-700">FREE</span> : formatPKR(order.shippingFee)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-stone-100 text-base font-extrabold text-stone-950">
              <span>Cash Amount Due at Doorstep:</span>
              <span className="font-mono text-xl text-emerald-800">{formatPKR(order.totalAmount)}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => onTrackOrder(order.orderNumber)}
              className="px-5 py-2.5 bg-stone-950 text-white text-xs font-bold rounded-lg hover:bg-stone-800 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Truck className="w-4 h-4" />
              <span>Track Order In Real Time</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={openWhatsApp}
                className="px-4 py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Care</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-3 py-2.5 border border-stone-300 text-stone-700 text-xs font-semibold rounded-lg hover:bg-stone-100 transition-colors"
                title="Print invoice"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={onContinueShopping}
            className="text-xs text-stone-600 hover:text-stone-950 font-semibold"
          >
            ← Return to Storefront
          </button>
        </div>
      </div>
    </div>
  );
};
