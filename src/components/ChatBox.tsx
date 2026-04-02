import React, { useState, useRef, useEffect } from 'react';
import Message from './Message';
import { askAI } from '../api/ai';
import { Story } from '../stories';
import ErrorMessage from './ErrorMessage';
import EmptyState from './EmptyState';

interface ChatBoxProps {
  story: Story;
  setHistory: React.Dispatch<React.SetStateAction<Array<{ role: 'user' | 'ai'; content: string }>>>;
}

interface MessageType {
  role: 'user' | 'ai' | 'system';
  content: string;
  isLoading?: boolean;
  isError?: boolean;
  hint?: string;
  errorDetails?: string;
}

/**
 * 聊天界面组件
 * 包含消息列表和输入框
 */
const ChatBox: React.FC<ChatBoxProps> = ({ story, setHistory }) => {
  const [messages, setMessages] = useState<MessageType[]>([
    {
      role: 'system',
      content: '欢迎来到海龟汤游戏！我是你的AI主持人，你可以通过提问来推理故事的真相。'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 当消息变化时滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 发送消息
  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;
    if (isLoading) return;

    // 清除之前的错误
    setError(null);

    // 添加用户消息
    const newMessage: MessageType = {
      role: 'user',
      content: inputValue.trim()
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
    setHistory(prevHistory => [...prevHistory, { role: 'user', content: inputValue.trim() }]);
    setInputValue('');
    setIsLoading(true);

    // 添加加载消息
    const loadingMessage: MessageType = {
      role: 'ai',
      content: '思考中...',
      isLoading: true
    };
    setMessages(prevMessages => [...prevMessages, loadingMessage]);

    try {
      // 调用AI API
      const aiResponse = await askAI(inputValue.trim(), story);
      
      // 验证回答是否符合规范
      const validResponses = ['是', '否', '无关'];
      const normalizedResponse = aiResponse.trim();
      
      // 提取回答和提示
      let mainResponse = normalizedResponse;
      let hint = '';
      
      // 检查回答是否包含提示
      if (normalizedResponse.includes('\n')) {
        const parts = normalizedResponse.split('\n');
        // 找到第一个有效的回答
        for (const part of parts) {
          const trimmedPart = part.trim();
          if (validResponses.includes(trimmedPart)) {
            mainResponse = trimmedPart;
            // 提取提示部分
            hint = parts.slice(parts.indexOf(part) + 1).join('\n').trim();
            break;
          }
        }
      }
      
      // 移除加载消息，添加AI回复
      if (validResponses.includes(mainResponse)) {
        // 先更新历史记录
        setHistory(prevHistory => [...prevHistory, { role: 'ai', content: normalizedResponse }]);
        // 然后更新消息列表
        setMessages(prevMessages => {
          const newMessages = prevMessages.filter(msg => !msg.isLoading);
          return [...newMessages, { role: 'ai', content: normalizedResponse, hint }];
        });
      } else {
        // 回答不符合规范，提示用户重新提问
        setMessages(prevMessages => {
          const newMessages = prevMessages.filter(msg => !msg.isLoading);
          return [...newMessages, {
            role: 'ai',
            content: '抱歉，我无法理解你的问题，请尝试用更清晰的方式提问。',
            isError: true
          }];
        });
      }
    } catch (error) {
      console.error('AI API error:', error);
      
      // 移除加载消息，添加错误消息
      setMessages(prevMessages => {
        const newMessages = prevMessages.filter(msg => !msg.isLoading);
        return [...newMessages, {
          role: 'ai',
          content: '抱歉，我暂时无法回答你的问题，请稍后再试。',
          isError: true,
          errorDetails: error instanceof Error ? error.message : '未知错误'
        }];
      });
      
      // 设置错误状态
      setError('AI服务暂时不可用，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理回车发送
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 错误提示 */}
      {error && (
        <ErrorMessage 
          type="error" 
          message={error} 
          onClose={() => setError(null)} 
        />
      )}

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 1 ? (
          <EmptyState 
            title="开始你的推理吧！" 
            description="输入你的问题，AI会回答你'是'、'否'或'无关'，帮助你逐步接近故事真相。" 
            icon="🔍" 
          />
        ) : (
          messages.map((message, index) => (
            <div key={index} className="animate-fade-in">
              <Message 
                message={{ 
                  role: message.role === 'system' ? 'ai' : message.role, 
                  content: message.content,
                  isError: message.isError
                }} 
              />
              {message.isError && (
                <div className="mt-1 ml-14 flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-red-500 text-xs font-medium">⚠️ 服务暂时不可用</span>
                    <span className="text-slate-400 text-xs">请稍后再试</span>
                  </div>
                  {message.errorDetails && (
                    <p className="text-slate-500 text-xs mt-1">
                      原因：{message.errorDetails}
                    </p>
                  )}
                </div>
              )}
              {/* 根据回答类型添加鼓励或提示 */}
              {message.role === 'ai' && !message.isError && message.content === '是' && (
                <p className="text-green-500 text-xs mt-1 ml-14 animate-fade-in">
                  👍 正确！你离真相又近了一步
                </p>
              )}
              {message.role === 'ai' && !message.isError && message.content === '否' && (
                <p className="text-yellow-500 text-xs mt-1 ml-14 animate-fade-in">
                  🔍 不太对，再仔细想想
                </p>
              )}
              {message.role === 'ai' && !message.isError && message.content === '无关' && (
                <p className="text-blue-500 text-xs mt-1 ml-14 animate-fade-in">
                  💡 这个问题与故事关系不大，试试从其他角度提问
                </p>
              )}
              {/* 显示提示内容 */}
              {message.role === 'ai' && !message.isError && message.hint && (
                <p className="text-purple-400 text-xs mt-2 ml-14 animate-fade-in">
                  💡 提示：{message.hint}
                </p>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <div className="border-t border-slate-700 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入你的问题..."
            disabled={isLoading}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-900 disabled:opacity-70 transition-all duration-300"
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || inputValue.trim() === ''}
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1 active:scale-95 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed min-w-[80px] sm:min-w-[100px]"
          >
            {isLoading ? '发送中...' : '发送'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;