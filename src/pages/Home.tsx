import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { stories } from '../stories';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import './Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(12);

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
    setDisplayCount(prev => Math.min(prev + 12, stories.length));
  };

  const hasMoreStories = displayCount < stories.length;

  if (isLoading) {
    return <Loading fullScreen text="加载游戏中..." />;
  }

  return (
    <div className="home-container">
      <div className="home-inner">
        {/* 页面标题 */}
        <div className="home-title-section animate-fade-in">
          <h1 className="home-title animate-sea-wave">🐢 AI海龟汤</h1>
          <p className="home-subtitle animate-wave">
            一场智慧与推理的盛宴，揭开神秘故事的真相
          </p>
        </div>

        {/* 介绍文字 */}
        <div className="home-intro animate-fade-in">
          <p className="home-intro-text">
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

        {/* 故事卡片网格 - 使用原生CSS实现响应式布局 */}
        <div className="home-card-grid">
          {stories.slice(0, displayCount).map((story, index) => (
            <div key={story.id} className="home-card-item animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="home-card">
                {/* 标题和难度 */}
                <div className="home-card-header">
                  <h3 className="home-card-title">{story.title}</h3>
                  <span className={`home-difficulty-badge ${story.difficulty === 'easy' ? 'home-difficulty-easy' : story.difficulty === 'medium' ? 'home-difficulty-medium' : 'home-difficulty-hard'}`}>
                    {story.difficulty === 'easy' ? '简单' : story.difficulty === 'medium' ? '中等' : '困难'}
                  </span>
                </div>

                {/* 汤面内容 */}
                <div className="home-card-content">
                  {story.surface}
                </div>

                {/* 开始游戏按钮 */}
                <button
                  onClick={() => handleStartGame(story.id)}
                  className="home-start-button"
                >
                  开始游戏
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 更多故事/收起按钮 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '48px', gap: '16px' }} className="animate-fade-in">
          {displayCount > 12 && (
            <button 
              onClick={() => setDisplayCount(12)}
              className="home-more-button"
              style={{ backgroundColor: '#475569', color: '#e2e8f0' }}
            >
              收起 (显示12个)
            </button>
          )}
          {hasMoreStories && (
            <button 
              onClick={handleMoreStories}
              className="home-more-button"
              style={{ backgroundColor: '#334155', color: '#e2e8f0' }}
            >
              更多故事 ({stories.length - displayCount} 个)
            </button>
          )}
        </div>

        {/* 页脚 */}
        <div className="home-footer animate-fade-in">
          <p>© 2026 AI海龟汤游戏 | 沉浸式悬疑推理体验</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
