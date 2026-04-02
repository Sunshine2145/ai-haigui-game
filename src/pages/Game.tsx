import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatBox from '../components/ChatBox';
import { stories } from '../stories';

/**
 * 游戏页面
 * 显示海龟汤故事和聊天界面
 */
const Game: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [history, setHistory] = useState<Array<{ role: 'user' | 'ai'; content: string }>>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'ended'>('playing');

  // 根据ID获取故事
  const storyId = id ? parseInt(id, 10) : 1;
  const currentStory = stories.find(story => story.id === storyId) || stories[0];

  // 查看汤底
  const handleViewBottom = () => {
    if (gameStatus === 'playing') {
      setGameStatus('ended');
      navigate('/result', { state: { story: currentStory, history } });
    }
  };

  // 结束游戏
  const handleEndGame = () => {
    if (gameStatus === 'playing') {
      setGameStatus('ended');
      navigate('/');
    }
  };

  // 中途放弃游戏
  const handleQuitGame = () => {
    if (gameStatus === 'playing') {
      setGameStatus('ended');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* 顶部导航 */}
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={handleQuitGame}
            disabled={gameStatus === 'ended'}
            className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg transition-all duration-300 disabled:bg-slate-800 disabled:cursor-not-allowed"
          >
            ← 放弃游戏
          </button>
          <h1 className="text-2xl font-bold text-amber-400">{gameStatus === 'playing' ? '游戏中' : '游戏已结束'}</h1>
          <div className="w-12"></div> {/* 占位，保持标题居中 */}
        </div>

        {/* 故事信息 */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-100 mb-2">{currentStory.title}</h2>
          <div className="flex items-center mb-4">
            <span className={`text-xs font-medium px-3 py-1 rounded-full text-white ${currentStory.difficulty === 'easy' ? 'bg-green-500' : currentStory.difficulty === 'medium' ? 'bg-yellow-500' : 'bg-red-500'}`}>
              {currentStory.difficulty === 'easy' ? '简单' : currentStory.difficulty === 'medium' ? '中等' : '困难'}
            </span>
          </div>
          <p className="text-slate-300">
            {currentStory.surface}
          </p>
        </div>

        {/* 聊天界面 */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg mb-6 h-[60vh]">
          <ChatBox story={currentStory} setHistory={setHistory} />
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-4">
          <button
            onClick={handleViewBottom}
            disabled={gameStatus === 'ended'}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 relative overflow-hidden disabled:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            <span>查看汤底</span>
            <span className="absolute inset-0 bg-white bg-opacity-10 transform -translate-x-full transition-transform duration-500 hover:translate-x-0"></span>
          </button>
          <button
            onClick={handleEndGame}
            disabled={gameStatus === 'ended'}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 relative overflow-hidden disabled:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            <span>结束游戏</span>
            <span className="absolute inset-0 bg-white bg-opacity-10 transform -translate-x-full transition-transform duration-500 hover:translate-x-0"></span>
          </button>
        </div>


      </div>
    </div>
  );
};

export default Game;