// 设置编码
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// 强制使用UTF-8编码
process.stdout.setEncoding('utf8');
process.stderr.setEncoding('utf8');

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// 导入必要的依赖
const fetch = require('node-fetch');
const AbortController = require('abort-controller');

// 日志文件路径
const logFilePath = path.join(__dirname, 'server.log');

// 自定义日志函数
const log = (message) => {
  const timestamp = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
  const logMessage = `[${timestamp}] ${message}`;
  
  // 最简单的方式：直接使用console.log
  console.log(logMessage);
  
  // 写入日志文件，指定编码为utf8
  fs.appendFileSync(logFilePath, `[${timestamp}] ${message}\n`, { encoding: 'utf8' });
};

// 创建Express应用实例
const app = express();

// 配置CORS中间件
app.use(cors({
  origin: '*', // 允许所有来源，生产环境中应该设置具体的域名
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 解析JSON请求体，设置字符编码为utf-8
app.use(express.json({ encoding: 'utf-8' }));

// 解析URL编码的请求体，设置字符编码为utf-8
app.use(express.urlencoded({ extended: true, encoding: 'utf-8' }));

// 设置默认字符编码为utf-8
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// 禁用重写的console.log函数，使用默认的console.log
// 确保Node.js使用正确的编码输出
process.stdout.setEncoding('utf8');
process.stderr.setEncoding('utf8');

// 请求频率限制（暂时禁用）
// const chatRateLimit = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15分钟
//   max: 30, // 每IP限制30个请求
//   message: {
//     success: false,
//     error: {
//       code: "RATE_LIMIT_EXCEEDED",
//       message: "请求频率过高，请稍后再试"
//     }
//   },
//   standardHeaders: true,
//   legacyHeaders: false
// });

// GET /接口 - 服务信息
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Turtle Soup AI Service",
    data: {
      version: "1.0.0",
      endpoints: {
        "GET /": "服务信息",
        "GET /api/test": "测试",
        "POST /api/chat": "AI对话"
      }
    }
  });
});

// GET /api/test接口
app.get('/api/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Test API working",
    data: {}
  });
});

// POST /api/chat接口
app.post('/api/chat', async (req, res) => {
  try {
    log('\n========================================');
    log('收到新的AI对话请求');
    log('请求时间: ' + new Date().toLocaleString());
    
    // 参数验证
    if (!req.body) {
      log('请求体为空');
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_PARAMS",
          message: "请求体不能为空"
        }
      });
    }
    
    const { question, story } = req.body;
    
    log('用户问题: ' + question);
    log('故事标题: ' + (story?.title || '无'));
    
    if (!question || typeof question !== 'string' || question.trim() === '') {
      log('question参数为空或无效');
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_PARAMS",
          message: "question参数不能为空"
        }
      });
    }
    
    if (!story || typeof story !== 'object') {
      log('story参数为空或不是对象');
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_PARAMS",
          message: "story参数必须是对象类型"
        }
      });
    }
    
    // 从环境变量获取API密钥
    const API_KEY = process.env.DEEPSEEK_API_KEY;
    if (!API_KEY) {
      log('DeepSeek API key is not configured');
      return res.status(500).json({
        success: false,
        error: {
          code: "API_KEY_MISSING",
          message: "服务器配置错误，请联系管理员"
        }
      });
    }
    
    // 构建DeepSeek API请求参数
    const requestBody = {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一个海龟汤游戏的主持人，根据故事汤底回答玩家问题。首先回答"是"、"否"或"无关"，然后在回答后添加一个换行符，再提供一个简短的提示，帮助玩家更好地理解故事，降低游戏难度。提示内容应该与故事相关，不要透露汤底的全部内容。'
        },
        {
          role: 'user',
          content: `故事标题：${story.title || ''}\n汤面：${story.surface || ''}\n汤底：${story.bottom || ''}\n\n玩家问题：${question}`
        }
      ],
      temperature: 0.3,
      max_tokens: 100
    };
    
    log('正在调用DeepSeek API...');
    
    // 调用DeepSeek API，实现重试机制
    let retryCount = 0;
    const maxRetries = 2;
    let response;
    
    while (retryCount <= maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
        
        log(`尝试调用API (${retryCount + 1}/${maxRetries + 1})`);
        
        response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        log('API调用成功，状态码: ' + response.status);
        break;
      } catch (error) {
        log(`API调用失败 (${retryCount + 1}/${maxRetries + 1}): ` + error.message);
        if (error.name === 'AbortError') {
          if (retryCount === maxRetries) {
            log('请求超时，已达到最大重试次数');
            return res.status(504).json({
              success: false,
              error: {
                code: "REQUEST_TIMEOUT",
                message: "请求超时，请稍后再试"
              }
            });
          }
        }
        retryCount++;
        if (retryCount > maxRetries) {
          log('DeepSeek API call failed: ' + error);
          return res.status(502).json({
            success: false,
            error: {
              code: "API_CALL_FAILED",
              message: "AI服务暂时不可用，请稍后再试"
            }
          });
        }
        // 重试前等待1秒
        log('等待1秒后重试...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // 处理API响应
    if (!response || !response.ok) {
      const errorText = await response?.text();
      log('DeepSeek API response error: ' + response?.status + ' ' + errorText);
      return res.status(502).json({
        success: false,
        error: {
          code: "API_RESPONSE_ERROR",
          message: "AI服务返回错误，请稍后再试"
        }
      });
    }
    
    const data = await response.json();
    const answer = data.choices[0]?.message?.content?.trim() || '';
    
    log('AI回答: ' + answer);
    
    if (!answer) {
      log('AI未返回有效回答');
      return res.status(502).json({
        success: false,
        error: {
          code: "EMPTY_ANSWER",
          message: "AI未返回有效回答，请稍后再试"
        }
      });
    }
    
    // 成功响应
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(200).json({
      success: true,
      data: {
        answer
      }
    });
    
    log('响应发送成功');
    log('========================================');
    
  } catch (error) {
    log('Internal server error: ' + error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "服务器内部错误，请稍后再试"
      }
    });
  }
});

// POST /api/generate-story接口 - 生成海龟汤故事
app.post('/api/generate-story', async (req, res) => {
  try {
    // 简单返回一个模拟的故事
    const story = {
      title: "神秘的敲门声",
      difficulty: "easy",
      surface: "一个人住在山顶的小屋里，半夜听见有敲门声，他打开门却没有人，于是去睡了。等了一会儿又有敲门声，去开门还是没人，如是者几次。第二天，有人在山脚下发现死尸一具，警察来把山顶的那人带走了。",
      bottom: "因为山顶的小屋门是向外开的，当他开门时，敲门的人被门推下山去，如此反复，导致敲门者死亡。"
    };
    
    // 构建响应数据
    const responseData = {
      success: true,
      data: {
        story
      }
    };
    
    // 成功响应，确保使用utf-8编码
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(200).end(JSON.stringify(responseData));
    
  } catch (error) {
    log('Internal server error: ' + error);
    // 构建错误响应数据
    const errorData = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "服务器内部错误，请稍后再试"
      }
    };
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(500).end(JSON.stringify(errorData));
  }
});

// 404错误处理
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
  log('Error stack: ' + err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error"
  });
});

// 设置端口
const PORT = process.env.PORT || 3001;

// 启动服务器
try {
  app.listen(PORT, '0.0.0.0', () => {
    log(`Server is running on port ${PORT}`);
    log(`Server is listening on http://localhost:${PORT}`);
    log(`Server is accessible on LAN at http://[your-local-ip]:${PORT}`);
  });
} catch (error) {
  console.error('Error starting server:', error);
  log('Error starting server: ' + error.message);
  process.exit(1);
}

module.exports = app;