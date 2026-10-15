import React, { useState } from 'react';
import { Search, Truck, CheckCircle2, Clock, PackageCheck, AlertCircle, MapPin } from 'lucide-react';
import { storeService } from '../services/storeService';
import { Order, OrderStatus } from '../types';
import { formatPKR } from '../config/site';

interface TrackOrderViewProps {
  initialOrderNumber?: string;
  onExploreProducts: () => void;
}

export const TrackOrderView: React.FC<TrackOrderViewProps> = ({
  initialOrderNumber = '',
  onExploreProducts,
}) => {
  const [orderQuery, setOrderQuery] = useState(initialOrderNumber);
  const [phoneQuery, setPhoneQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(() => {
    if (initialOrderNumber) {
      return storeService.getOrderByNumber(initialOrderNumber) || null;
    }
    return null;
  });
  const [hasSearched, setHasSearched] = useState(Boolean(initialOrderNumber));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery.trim()) return;

    const found = storeService.getOrderByNumber(orderQuery);
    setSearchedOrder(found || null);
    setHasSearched(true);
  };

  const steps: { status: OrderStatus; label: string; description: string }[] = [
    { status: 'pending', label: 'Order Placed', description: 'Received in system' },
    { status: 'confirmed', label: 'Confirmed', description: 'Verified by support' },
    { status: 'packed', label: 'Inspected & Packed', description: 'Sealed for transit' },
    { status: 'shipped', label: 'Handed to Courier', description: 'In-transit via TCS/Leopards' },
    { status: 'delivered', label: 'Delivered', description: 'Received & COD settled' },
  ];

  const getStepIndex = (status: OrderStatus) => {
    if (status === 'pending') return 0;
    if (status === 'confirmed') return 1;
    if (status === 'processing' || status === 'packed') return 2;
    if (status === 'shipped' || status === 'out_for_delivery') return 3;
    if (status === 'delivered') return 4;
    return 0;
  };

  const currentStepIdx = searchedOrder ? getStepIndex(searchedOrder.status) : 0;

  return (
    <div className="bg-stone-50 min-h-screen py-12 lg:py-16 border-b border-stone-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-8">
          <span className="text-xs uppercase tracking-widest font-mono font-bold text-stone-500">
            Logistics & Courier Timeline
          </span>
          <h1 className="text-3xl font-extrabold text-stone-950 font-['Syne']">
            Track Your Consignment
          </h1>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Enter your YehMart order reference number to view real-time courier dispatch status and delivery rider updates.
          </p>
        </div>

        {/* Search Bar Form */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Order Reference *
                </label>
                <input
                  type="text"
                  required
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value.toUpperCase())}
                  placeholder="e.g. KVN-2026-8812"
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs font-mono uppercase focus:outline-hidden focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Recipient Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={phoneQuery}
                  onChange={(e) => setPhoneQuery(e.target.value)}
                  placeholder="03001234567"
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-hidden focus:border-stone-900"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-stone-950 text-white text-xs font-bold rounded-lg hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Track Consignment</span>
            </button>
          </form>

          {/* Quick Demo Hint */}
          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
            <span>Try demo order reference:</span>
            <button
              onClick={() => {
                setOrderQuery('YM-2026-8812');
                const found = storeService.getOrderByNumber('YM-2026-8812');
                setSearchedOrder(found || null);
                setHasSearched(true);
              }}
              className="font-mono font-semibold text-stone-700 hover:text-stone-950 underline"
            >
              YM-2026-8812 (Shipped)
            </button>
            <button
              onClick={() => {
                setOrderQuery('YM-2026-8815');
                const found = storeService.getOrderByNumber('YM-2026-8815');
                setSearchedOrder(found || null);
                setHasSearched(true);
              }}
              className="font-mono font-semibold text-stone-700 hover:text-stone-950 underline"
            >
              YM-2026-8815 (Delivered)
            </button>
          </div>
        </div>

        {/* Results */}
        {hasSearched && (
          <>
            {searchedOrder ? (
              <div className="bg-white rounded-2xl border border-stone-200 shadow-lg p-6 sm:p-8 space-y-6">
                {/* Header status */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-stone-100">
                  <div>
                    <span className="text-[11px] font-mono text-stone-400 uppercase tracking-widest">
                      Consignment Status
                    </span>
                    <h3 className="text-xl font-extrabold font-mono text-stone-950 mt-0.5">
                      {searchedOrder.orderNumber}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        searchedOrder.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : searchedOrder.status === 'shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {searchedOrder.status.replace('_', ' ')}
                    </span>
                    {searchedOrder.trackingCarrier && (
                      <p className="text-[11px] text-stone-500 font-mono mt-1">
                        Courier: {searchedOrder.trackingCarrier} · {searchedOrder.trackingNumber || 'Assigned'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stepper Timeline */}
                <div className="py-2">
                  <div className="relative flex justify-between">
                    {/* Connecting line */}
                    <div className="absolute top-4 left-4 right-4 h-0.5 bg-stone-200 -z-0" />
                    <div
                      className="absolute top-4 left-4 h-0.5 bg-emerald-600 transition-all duration-500 -z-0"
                      style={{
                        width: `${(currentStepIdx / (steps.length - 1)) * 92}%`,
                      }}
                    />

                    {steps.map((st, i) => {
                      const isComplete = i <= currentStepIdx;
                      const isCurrent = i === currentStepIdx;

                      return (
                        <div key={st.status} className="relative z-10 flex flex-col items-center text-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-colors ${
                              isComplete
                                ? 'bg-emerald-600 text-white ring-4 ring-emerald-50'
                                : 'bg-white border-2 border-stone-300 text-stone-400'
                            }`}
                          >
                            {isComplete ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                          </div>
                          <p
                            className={`text-xs font-bold mt-2 ${
                              isCurrent ? 'text-stone-950 font-bold' : isComplete ? 'text-stone-800' : 'text-stone-400'
                            }`}
                          >
                            {st.label}
                          </p>
                          <p className="text-[10px] text-stone-400 hidden sm:block max-w-[80px]">
                            {st.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Audit Log / History Notes */}
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 space-y-2">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
                    Event History
                  </h4>
                  <div className="space-y-2 divide-y divide-stone-200/60 text-xs">
                    {searchedOrder.history.map((h) => (
                      <div key={h.id} className="pt-2 flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-stone-900">{h.note}</p>
                          <p className="text-[11px] text-stone-400 uppercase font-mono mt-0.5">
                            Status: {h.status}
                          </p>
                        </div>
                        <span className="text-[11px] text-stone-400 font-mono shrink-0">
                          {new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Destination address */}
                <div className="flex items-start gap-2.5 text-xs text-stone-600 pt-2 border-t border-stone-100">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Delivering to: {searchedOrder.shippingAddress.streetAddress}, {searchedOrder.shippingAddress.city}, {searchedOrder.shippingAddress.province}.
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-stone-300">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-stone-900">Consignment Not Found</h4>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  We could not find an order matching "{orderQuery}". Please check your order reference number or contact support.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
