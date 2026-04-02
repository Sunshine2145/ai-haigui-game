import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import Loading from '../components/Loading';

interface LoadingItem {
  id: string;
  message?: string;
  type: 'global' | 'local' | 'button';
}

interface LoadingContextType {
  loadingItems: LoadingItem[];
  isLoading: (type?: 'global' | 'local' | 'button') => boolean;
  startLoading: (id: string, options?: { message?: string; type?: 'global' | 'local' | 'button' }) => void;
  stopLoading: (id: string) => void;
  clearAllLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [loadingItems, setLoadingItems] = useState<LoadingItem[]>([]);

  const isLoading = useCallback((type?: 'global' | 'local' | 'button') => {
    if (type) {
      return loadingItems.some(item => item.type === type);
    }
    return loadingItems.length > 0;
  }, [loadingItems]);

  const startLoading = useCallback((id: string, options?: { message?: string; type?: 'global' | 'local' | 'button' }) => {
    setLoadingItems(prev => {
      if (prev.some(item => item.id === id)) {
        return prev;
      }
      return [...prev, { id, type: 'local', ...options }];
    });
  }, []);

  const stopLoading = useCallback((id: string) => {
    setLoadingItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearAllLoading = useCallback(() => {
    setLoadingItems([]);
  }, []);

  const globalLoading = loadingItems.find(item => item.type === 'global');

  return (
    <LoadingContext.Provider
      value={{
        loadingItems,
        isLoading,
        startLoading,
        stopLoading,
        clearAllLoading,
      }}
    >
      {children}
      {globalLoading && (
        <Loading
          fullScreen
          text={globalLoading.message || '加载中...'}
          size="lg"
        />
      )}
    </LoadingContext.Provider>
  );
};