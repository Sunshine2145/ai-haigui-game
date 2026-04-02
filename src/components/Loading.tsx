import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

/**
 * 加载动画组件
 * 用于数据加载、表单提交、页面切换等需要等待的操作
 */
const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  text = '加载中...', 
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4'
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' 
    : 'flex items-center justify-center';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center">
        <div className={`${sizeClasses[size]} border-t-amber-500 border-r-amber-500 border-b-amber-500 border-l-slate-700 rounded-full animate-spin mb-2`}></div>
        {text && <p className="text-slate-200 font-medium">{text}</p>}
      </div>
    </div>
  );
};

export default Loading;