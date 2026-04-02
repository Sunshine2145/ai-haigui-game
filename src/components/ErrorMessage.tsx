import React, { useState } from 'react';

interface ErrorMessageProps {
  type?: 'error' | 'warning' | 'info';
  message: string;
  details?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
  onFeedback?: () => void;
}

/**
 * 错误提示组件
 * 用于显示各种类型的错误信息
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  type = 'error', 
  message, 
  details,
  action, 
  onClose,
  onFeedback
}) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const typeConfig = {
    error: {
      color: 'bg-red-500',
      icon: '❌',
      borderColor: 'border-red-400'
    },
    warning: {
      color: 'bg-yellow-500',
      icon: '⚠️',
      borderColor: 'border-yellow-400'
    },
    info: {
      color: 'bg-blue-500',
      icon: 'ℹ️',
      borderColor: 'border-blue-400'
    }
  };

  const config = typeConfig[type];

  const handleFeedback = () => {
    if (onFeedback) {
      onFeedback();
    }
  };

  return (
    <div className={`flex flex-col p-4 mb-4 rounded-lg border-l-4 ${config.borderColor} bg-slate-800 animate-fade-in shadow-lg`}>
      <div className="flex items-start">
        <div className={`${config.color} p-2 rounded-full mr-3 flex-shrink-0 mt-1`}>
          <span className="text-white text-lg">{config.icon}</span>
        </div>
        <div className="flex-1">
          <p className="text-slate-200 font-medium">{message}</p>
          {details && (
            <div className="mt-2">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors mb-1 flex items-center"
              >
                {showDetails ? '收起详情' : '查看详情'} {showDetails ? '▲' : '▼'}
              </button>
              {showDetails && (
                <div className="text-sm text-slate-400 bg-slate-900 p-3 rounded-md">
                  {details}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 ml-4">
          {type === 'error' && onFeedback && (
            <button
              onClick={handleFeedback}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors px-2 py-1"
              title="反馈错误"
            >
              📋 反馈
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-full hover:bg-slate-700"
              title="关闭"
            >
              ×
            </button>
          )}
        </div>
      </div>
      {action && (
        <div className="mt-3 pt-3 border-t border-slate-700 flex justify-end">
          <button
            onClick={action.onClick}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
          >
            {action.label}
          </button>
        </div>
      )}
    </div>
  );
};

export default ErrorMessage;