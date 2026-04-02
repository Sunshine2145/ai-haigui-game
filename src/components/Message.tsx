import React from 'react';

interface MessageProps {
  message: {
    role: 'user' | 'ai';
    content: string;
    isError?: boolean;
  };
}

/**
 * 聊天消息组件
 * 显示单条聊天消息，区分用户和AI消息
 */
const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-start max-w-[80%] ${isUser ? 'flex-row-reverse' : ''}`}>
        {/* 头像/图标 */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${isUser ? 'ml-3' : ''}`}>
          {isUser ? (
            <div className="bg-blue-500 text-white font-bold">
              U
            </div>
          ) : (
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isError ? 'bg-red-500' : 'bg-amber-500'}`}>
              <span className={`font-bold ${isError ? 'text-white' : 'text-slate-900'}`}>
                AI
              </span>
            </div>
          )}
        </div>

        {/* 消息内容 */}
        <div className={`p-3 rounded-lg ${isUser ? 'bg-blue-500 text-white' : isError ? 'bg-red-900/30 border border-red-800 text-slate-300' : 'bg-slate-700 text-slate-200'}`}>
          <p>{message.content}</p>
        </div>
      </div>
    </div>
  );
};

export default Message;