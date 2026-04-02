import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { stories } from '../stories';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

/**
 * 游戏大厅页面
 * 展示所有海龟汤故事卡片
 */
const Home: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(12); // 每页显示12个故事

  // 模拟加载过程
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const handleStartGame = (storyId: number) => {
    navigate(`/game/${storyId}`);
  };

  const handleMoreStories = () => {
    // 加载更多故事，每次增加12个
    setDisplayCount(prev => Math.min(prev + 12, stories.length));
  };

  // 判断是否有更多故事可以加载
  const hasMoreStories = displayCount < stories.length;

  if (isLoading) {
    return <Loading fullScreen text="加载游戏中..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4 md:p-6">
      <div className="max-w-full px-4 md:px-6 mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-12 pt-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-500 mb-4 animate-sea-wave">🐢 AI海龟汤</h1>
          <p className="text-xl text-green-400 animate-wave">
            一场智慧与推理的盛宴，揭开神秘故事的真相
          </p>
        </div>

        {/* 介绍文字 */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-10 animate-fade-in">
          <p className="text-slate-300 leading-relaxed">
            海龟汤是一种推理游戏，玩家通过提问来还原故事的真相。
            选择一个故事，开始你的推理之旅吧！
          </p>
        </div>

        {/* 错误提示 */}
        {error && (
          <ErrorMessage 
            type="info" 
            message={error} 
            onClose={() => setError(null)} 
          />
        )}

        {/* 故事卡片网格 */}
        <div className="grid grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-12">
          {stories.slice(0, displayCount).map((story, index) => (
            <div key={story.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full">
                {/* 标题和难度 */}
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-slate-100 flex-1 mr-3 transition-all duration-300 hover:text-amber-400">{story.title}</h3>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full text-white shrink-0 transition-all duration-300 hover:scale-105 ${story.difficulty === 'easy' ? 'bg-green-500' : story.difficulty === 'medium' ? 'bg-yellow-500' : 'bg-red-500'}`}>
                    {story.difficulty === 'easy' ? '简单' : story.difficulty === 'medium' ? '中等' : '困难'}
                  </span>
                </div>

                {/* 汤面内容 */}
                <div className="flex-1 mb-6">
                  <p className="text-slate-300 text-sm leading-relaxed line-clamp-4 transition-all duration-300 hover:text-slate-200">
                    {story.surface}
                  </p>
                </div>

                {/* 开始游戏按钮 */}
                <button
                  onClick={() => handleStartGame(story.id)}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1 active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50"
                >
                  开始游戏
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 更多故事/收起按钮 */}
        <div className="flex justify-end mb-12 animate-fade-in gap-4">
          {displayCount > 12 && (
            <button 
              onClick={() => setDisplayCount(12)}
              className="bg-slate-600 hover:bg-slate-500 text-slate-200 font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1 active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-50"
            >
              收起 (显示12个)
            </button>
          )}
          {hasMoreStories && (
            <button 
              onClick={handleMoreStories}
              className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              更多故事 ({stories.length - displayCount} 个)
            </button>
          )}
        </div>

        {/* 页脚 */}
        <div className="text-center text-slate-400 py-8 border-t border-slate-800 animate-fade-in">
          <p>© 2026 AI海龟汤游戏 | 沉浸式悬疑推理体验</p>
        </div>
      </div>
    </div>
  );
};

export default Home;