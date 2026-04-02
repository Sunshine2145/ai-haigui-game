require('dotenv').config();
const express = require('express');
const cors = require('cors');

// 创建Express应用实例
const app = express();

// 配置CORS中间件
app.use(cors({
  origin: '*', // 允许所有来源，生产环境中应该设置具体的域名
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 解析JSON请求体
app.use(express.json());

// 解析URL编码的请求体
app.use(express.urlencoded({ extended: true }));

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
    // 参数验证
    if (!req.body) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_PARAMS",
          message: "请求体不能为空"
        }
      });
    }
    
    const { question, story } = req.body;
    
    if (!question || typeof question !== 'string' || question.trim() === '') {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_PARAMS",
          message: "question参数不能为空"
        }
      });
    }
    
    if (!story || typeof story !== 'object') {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_PARAMS",
          message: "story参数必须是对象类型"
        }
      });
    }
    
    // 简单返回一个模拟的AI回答
    res.status(200).json({
      success: true,
      data: {
        answer: "是"
      }
    });
    
  } catch (error) {
    console.error('Internal server error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "服务器内部错误，请稍后再试"
      }
    });
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
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error"
  });
});

// 设置端口
const PORT = process.env.PORT || 3000;

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;