import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import ErrorMessage from '../components/ErrorMessage';

interface ErrorItem {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  details?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  autoClose?: boolean;
  duration?: number;
  onFeedback?: () => void;
}

interface ErrorContextType {
  errors: ErrorItem[];
  addError: (error: Omit<ErrorItem, 'id'>) => string;
  removeError: (id: string) => void;
  clearAllErrors: () => void;
  showError: (message: string, options?: Partial<Omit<ErrorItem, 'id' | 'message'>>) => string;
  showWarning: (message: string, options?: Partial<Omit<ErrorItem, 'id' | 'message'>>) => string;
  showInfo: (message: string, options?: Partial<Omit<ErrorItem, 'id' | 'message'>>) => string;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [errors, setErrors] = useState<ErrorItem[]>([]);

  const addError = useCallback((error: Omit<ErrorItem, 'id'>) => {
    const id = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newError: ErrorItem = {
      id,
      ...error,
      autoClose: error.autoClose ?? true,
      duration: error.duration ?? 5000,
    };

    setErrors(prev => [...prev, newError]);

    if (newError.autoClose) {
      setTimeout(() => {
        removeError(id);
      }, newError.duration);
    }

    return id;
  }, []);

  const removeError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const showError = useCallback((message: string, options?: Partial<Omit<ErrorItem, 'id' | 'message'>>) => {
    return addError({ type: 'error', message, ...options });
  }, [addError]);

  const showWarning = useCallback((message: string, options?: Partial<Omit<ErrorItem, 'id' | 'message'>>) => {
    return addError({ type: 'warning', message, ...options });
  }, [addError]);

  const showInfo = useCallback((message: string, options?: Partial<Omit<ErrorItem, 'id' | 'message'>>) => {
    return addError({ type: 'info', message, ...options });
  }, [addError]);

  const handleFeedback = useCallback((error: ErrorItem) => {
    // 这里可以实现错误反馈逻辑，比如发送错误信息到服务器
    console.log('Feedback for error:', error);
    // 可以添加复制错误信息到剪贴板等功能
    navigator.clipboard.writeText(`${error.message}\n\nDetails: ${error.details || 'No details'}`)
      .then(() => {
        // 显示复制成功的提示
        showInfo('错误信息已复制到剪贴板');
      })
      .catch(err => {
        console.error('Failed to copy error info:', err);
      });
  }, [showInfo]);

  return (
    <ErrorContext.Provider
      value={{
        errors,
        addError,
        removeError,
        clearAllErrors,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}
      <div className="fixed top-4 right-4 z-50 max-w-md w-full">
        {errors.map(error => (
          <ErrorMessage
            key={error.id}
            type={error.type}
            message={error.message}
            details={error.details}
            action={error.action}
            onClose={() => removeError(error.id)}
            onFeedback={() => handleFeedback(error)}
          />
        ))}
      </div>
    </ErrorContext.Provider>
  );
};