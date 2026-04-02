import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Story } from '../stories';

/**
 * 游戏结果页面
 * 显示故事汤底和游戏历史
 */
const Result: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { story, history = [] } = location.state as { story: Story; history?: Array<{ role: 'user' | 'ai'; content: string }> };
  const [showContent, setShowContent] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [isRevealing, setIsRevealing] = useState(false);

  // 汤底揭晓动画
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
      setIsRevealing(true);
      
      // 逐字显示汤底
      let index = 0;
      const revealTextInterval = setInterval(() => {
        if (index < story.bottom.length) {
          setDisplayedText(prev => prev + story.bottom.charAt(index));
          index++;
        } else {
          clearInterval(revealTextInterval);
          setIsRevealing(false);
        }
      }, 30);
    }, 1000);

    return () => clearTimeout(timer);
  }, [story.bottom]);

  // 再来一局
  const handlePlayAgain = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4 md:p-6 flex items-center justify-center">
      <div className="max-w-4xl w-full">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-400 mb-2">故事真相</h1>
          <h2 className="text-2xl font-semibold text-slate-100">{story.title}</h2>
        </div>

        {/* 汤底揭晓 */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8 relative overflow-hidden">
          {/* 粒子效果背景 */}
          <div className="absolute inset-0 z-0">
            {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={i}
                className="absolute bg-amber-500 rounded-full opacity-30 animate-pulse"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 10 + 5}px`,
                  height: `${Math.random() * 10 + 5}px`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${Math.random() * 3 + 2}s`
                }}
              />
            ))}
          </div>
          
          {/* 揭晓动画遮罩 */}
          {!showContent && (
            <div className="absolute inset-0 bg-slate-900 z-10 flex items-center justify-center">
              <div className="text-2xl text-amber-400 animate-pulse">揭晓真相中...</div>
            </div>
          )}
          
          {/* 汤底内容 */}
          <div className={`relative z-0 transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h3 className="text-xl font-semibold text-amber-400 mb-4 animate-fade-in">汤底</h3>
            <div className="text-slate-300 text-lg leading-relaxed bg-slate-900 bg-opacity-50 p-4 rounded-lg border-l-4 border-amber-500">
              <p>{displayedText}</p>
              {isRevealing && (
                <span className="inline-block w-2 h-6 bg-amber-400 animate-pulse ml-1 align-middle"></span>
              )}
            </div>
          </div>
        </div>

        {/* 对话历史（可选） */}
        {history.length > 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-amber-400 mb-4">对话历史</h3>
            <div className="space-y-4">
              {history.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-200'}`}>
                    <p>{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex justify-center">
          <button
            onClick={handlePlayAgain}
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold py-3 px-8 rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1 active:scale-95"
          >
            再来一局
          </button>
        </div>
      </div>
    </div>
  );
};

export default Result;