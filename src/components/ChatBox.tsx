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
      content: '🎭 欢迎来到海龟汤推理世界！我是你的专属主持人。\n\n你面前是一道神秘的"汤面"——一个看似离奇的故事片段。真相隐藏在细节之中，等待你去发现。\n\n💡 提问技巧：\n• 用"是否""有没有"等封闭式问题逐步缩小范围\n• 关注人物、时间、地点、物品四个维度\n• 每个"是"都是线索，每个"否"都在排除错误方向\n\n准备好了吗？开始你的推理之旅吧！🔍'
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

    // 保存当前输入值
    const userQuestion = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    // 添加用户消息和加载消息
    setMessages(prevMessages => [
      ...prevMessages,
      { role: 'user', content: userQuestion },
      { role: 'ai', content: '思考中...', isLoading: true }
    ]);
    setHistory(prevHistory => [...prevHistory, { role: 'user', content: userQuestion }]);

    try {
      // 调用AI API
      const aiResponse = await askAI(userQuestion, story);
      
      // 验证回答是否符合规范
      const validResponses = ['是', '否', '无关'];
      const normalizedResponse = aiResponse.trim();
      
      // 只提取标准回答，使用startsWith()以兼容换行后的多行回答格式
      let mainResponse = '';
      let hintContent = '';
      
      if (normalizedResponse.includes('\n')) {
        const parts = normalizedResponse.split('\n');
        for (const part of parts) {
          const trimmedPart = part.trim();
          if (validResponses.some(response => trimmedPart.startsWith(response))) {
            // 提取标准回答，去掉后面的空格和其他字符
            for (const response of validResponses) {
              if (trimmedPart.startsWith(response)) {
                mainResponse = response;
                break;
              }
            }
          } else if (trimmedPart.startsWith('💡')) {
            hintContent = trimmedPart.substring(2).trim();
          } else if (trimmedPart.startsWith('提示：')) {
            hintContent = trimmedPart.substring(3).trim();
          }
        }
      } else {
        for (const response of validResponses) {
          if (normalizedResponse.trim().startsWith(response)) {
            mainResponse = response;
            break;
          }
        }
      }
      
      if (!mainResponse) {
        mainResponse = '无关';
      }
      
      // 生成鼓励语和引导语
      let responseContent = mainResponse;
      
      if (mainResponse === '是') {
        responseContent += '\n好眼力！这条线索正在帮你拼凑真相的碎片...';
      } else if (mainResponse === '否') {
        responseContent += '\n这个方向似乎走不通，但排除错误本身就是一种进步...';
      } else if (mainResponse === '无关') {
        responseContent += '\n试试从这些维度探索：人物身份、时间节点、地点环境、物品细节';
      }
      
      // 添加提示内容（如果有）
      if (hintContent) {
        responseContent += `\n<div class="bg-slate-700/50 rounded-lg p-3 mt-2">🎯 主持人提示：${hintContent}</div>`;
      }
      
      // 移除加载消息，添加AI回复
      setHistory(prevHistory => [...prevHistory, { role: 'ai', content: mainResponse }]);
      setMessages(prevMessages => {
        const newMessages = prevMessages.filter(msg => !msg.isLoading);
        const newMessage: MessageType = { role: 'ai', content: responseContent };
        return [...newMessages, newMessage];
      });
    } catch (error) {
      console.error('AI API error:', error);
      
      // 移除加载消息，添加错误消息
        setMessages(prevMessages => {
          const newMessages = prevMessages.filter(msg => !msg.isLoading);
          const errorMessage: MessageType = {
            role: 'ai',
            content: '无关\n🌐 主持人暂时失去了与推理中枢的连接...请稍后再试，真相不会跑掉的。',
            isError: true,
            errorDetails: error instanceof Error ? error.message : '未知错误'
          };
          return [...newMessages, errorMessage];
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
            title="🔍 开始你的推理之旅" 
            description="从任意一个细节入手提问——人物的身份、事件的时间、地点的特殊之处、物品的用途……每个问题都是通往真相的一步。" 
            icon="🐢" 
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
            placeholder="试试问：这个人是做什么的？ / 当时是白天还是晚上？ / 现场有什么特别的物品？"
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