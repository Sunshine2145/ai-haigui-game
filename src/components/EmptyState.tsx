import React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * 空状态组件
 * 用于显示没有消息/数据的场景
 */
const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description, 
  icon = '📭', 
  action 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-fade-in">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-slate-100 mb-2">{title}</h3>
      <p className="text-slate-400 mb-6 max-w-md">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold py-2 px-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1 active:scale-95"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;