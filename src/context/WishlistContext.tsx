import React, { createContext, useContext, useState, useEffect } from 'react';
import { storeService } from '../services/storeService';

interface WishlistContextType {
  wishlist: string[];
  toggleWishlist: (productId: string) => boolean;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<string[]>(() => storeService.getWishlist());

  useEffect(() => {
    // Keep local storage in sync
  }, [wishlist]);

  const toggleWishlist = (productId: string): boolean => {
    const isAdded = storeService.toggleWishlist(productId);
    setWishlist(storeService.getWishlist());
    return isAdded;
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isInWishlist,
        wishlistCount: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};
