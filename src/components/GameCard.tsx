import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Story } from '../stories';

interface GameCardProps {
  story: Story;
}

/**
 * 游戏卡片组件
 * 用于显示单个海龟汤故事卡片，包含汤面内容、难度等级和开始游戏按钮
 */
const GameCard: React.FC<GameCardProps> = ({ story }) => {
  const navigate = useNavigate();

  const handleStartGame = () => {
    navigate(`/game/${story.id}`);
  };

  // 根据难度获取对应的颜色和文本
  const getDifficultyInfo = () => {
    switch (story.difficulty) {
      case 'easy':
        return { color: 'bg-green-500', text: '简单' };
      case 'medium':
        return { color: 'bg-yellow-500', text: '中等' };
      case 'hard':
        return { color: 'bg-red-500', text: '困难' };
      default:
        return { color: 'bg-gray-500', text: '未知' };
    }
  };

  const difficultyInfo = getDifficultyInfo();

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full animate-fade-in">
      {/* 标题和难度 */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-slate-100 flex-1 mr-3 transition-all duration-300 hover:text-amber-400">{story.title}</h3>
        <span className={`${difficultyInfo.color} text-xs font-medium px-3 py-1 rounded-full text-white shrink-0 transition-all duration-300 hover:scale-105`}>
          {difficultyInfo.text}
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
        onClick={handleStartGame}
        className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1 active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50"
      >
        开始游戏
      </button>
    </div>
  );
};

export default GameCard;