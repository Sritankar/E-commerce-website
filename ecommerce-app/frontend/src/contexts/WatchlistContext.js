import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const WatchlistContext = createContext();

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};

export const WatchlistProvider = ({ children }) => {
  const [watchlistItems, setWatchlistItems] = useState(() => {
    try {
      const savedWatchlist = localStorage.getItem('ecommerce_watchlist');
      return savedWatchlist ? JSON.parse(savedWatchlist) : [];
    } catch (error) {
      console.error('Error loading watchlist from localStorage:', error);
      return [];
    }
  });

  // Save to localStorage whenever watchlist changes
  useEffect(() => {
    try {
      localStorage.setItem('ecommerce_watchlist', JSON.stringify(watchlistItems));
    } catch (error) {
      console.error('Error saving watchlist to localStorage:', error);
    }
  }, [watchlistItems]);

  const addToWatchlist = (product) => {
    setWatchlistItems(prevItems => {
      const isAlreadyInWatchlist = prevItems.some(item => item.id === product.id);
      
      if (isAlreadyInWatchlist) {
        toast.info(`${product.product_name} is already in your watchlist`);
        return prevItems;
      }

      const watchlistItem = {
        id: product.id,
        product_id: product.product_id,
        product_name: product.product_name,
        sale_price: product.sale_price,
        market_price: product.market_price,
        image_url: product.image_url,
        category: product.category,
        brand: product.brand,
        rating: product.rating,
        addedAt: new Date().toISOString()
      };

      toast.success(`Added ${product.product_name} to watchlist`);
      return [...prevItems, watchlistItem];
    });
  };

  const removeFromWatchlist = (productId) => {
    setWatchlistItems(prevItems => {
      const itemToRemove = prevItems.find(item => item.id === productId);
      if (itemToRemove) {
        toast.success(`Removed ${itemToRemove.product_name} from watchlist`);
      }
      return prevItems.filter(item => item.id !== productId);
    });
  };

  const clearWatchlist = () => {
    setWatchlistItems([]);
    toast.success('Watchlist cleared');
  };

  const isInWatchlist = (productId) => {
    return watchlistItems.some(item => item.id === productId);
  };

  const getWatchlistCount = () => {
    return watchlistItems.length;
  };

  const value = {
    watchlistItems,
    addToWatchlist,
    removeFromWatchlist,
    clearWatchlist,
    isInWatchlist,
    getWatchlistCount
  };

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
};
