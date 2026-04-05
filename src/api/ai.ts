import { Story } from '../stories';

/**
 * AI接口封装
 * 用于调用后端API进行海龟汤游戏的问答和故事生成
 */

// 后端接口基础地址，通过环境变量配置，默认使用相对路径（开发环境）
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL || '';

// 构建完整的API URL
const buildApiUrl = (path: string): string => {
  // 如果基础URL为空，则使用相对路径（适用于开发环境代理）
  if (!BACKEND_BASE_URL) {
    return path;
  }
  // 确保基础URL不以斜杠结尾，路径以斜杠开头
  const base = BACKEND_BASE_URL.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

// API端点路径
const CHAT_API_PATH = '/api/chat';
const GENERATE_STORY_API_PATH = '/api/generate-story';

/**
 * 向AI提问
 * @param question 用户问题
 * @param story 当前故事
 * @returns AI回答
 */
export const askAI = async (question: string, story: Story): Promise<string> => {
  try {
    console.log('Sending AI question request to backend...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000); // 后端有30秒超时，这里设置35秒

    const response = await fetch(buildApiUrl(CHAT_API_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question,
        story
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('Backend API returned non-200 status:', response.status, response.statusText);
      try {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `API request failed: ${response.status} ${response.statusText}`);
      } catch (jsonError) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    console.log('Received response from backend:', data);
    
    // 验证响应数据格式
    if (!data || typeof data !== 'object' || !data.success) {
      throw new Error('Invalid response format from backend');
    }
    
    if (!data.data || !data.data.answer) {
      throw new Error('No answer found in response');
    }
    
    const answer = data.data.answer;
    console.log('AI answer:', answer);
    return answer;
  } catch (error) {
    console.error('AI API error:', error);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again later.');
      }
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Network connection failed. Please check your internet connection.');
      }
    }
    throw new Error('Failed to get AI response. Please try again later.');
  }
};

/**
 * 生成海龟汤故事
 * @returns 生成的故事
 */
export const generateStory = async (): Promise<Story> => {
  try {
    console.log('Sending story generation request to backend...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000); // 后端有30秒超时，这里设置35秒

    // 调用后端接口生成故事
    const response = await fetch(buildApiUrl(GENERATE_STORY_API_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('Backend API returned non-200 status:', response.status, response.statusText);
      try {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `API request failed: ${response.status} ${response.statusText}`);
      } catch (jsonError) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    console.log('Received story generation response from backend:', data);
    
    // 验证响应数据格式
    if (!data || typeof data !== 'object' || !data.success) {
      throw new Error('Invalid response format from backend');
    }
    
    if (!data.data || !data.data.story) {
      throw new Error('No story found in response');
    }
    
    const story = data.data.story;
    
    // 验证故事数据结构
    if (!story.title || !story.difficulty || !story.surface || !story.bottom) {
      throw new Error('Invalid story data structure');
    }
    
    return {
      id: Date.now(),
      title: story.title,
      difficulty: story.difficulty as 'easy' | 'medium' | 'hard',
      surface: story.surface,
      bottom: story.bottom
    };
  } catch (error) {
    console.error('Story generation error:', error);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again later.');
      }
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Network connection failed. Please check your internet connection.');
      }
    }
    throw new Error('Failed to generate story. Please try again later.');
  }
};