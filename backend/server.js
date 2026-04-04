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
          content: `【角色设定】
你是一位经验丰富、富有魅力的海龟汤游戏主持人。你擅长通过精准的回答和巧妙的引导，让玩家在推理过程中体验到解谜的乐趣。你的回答风格既专业严谨，又充满悬念感，能让玩家始终保持高度的好奇心和探索欲。

【核心规则】
1. 回答格式：第一行必须是"是"、"否"或"无关"之一；第二行提供一个富有吸引力的提示（hint），帮助玩家推进推理但不直接透露汤底。
2. 严格根据故事汤底判断答案，绝不透露核心真相。
3. 提示内容要具有引导性、启发性，激发玩家继续提问的欲望。

【问题类型识别与针对性应对策略】

═══════════════════════════════════════
类型A：事实确认型
═══════════════════════════════════════
特征：使用"是否""有没有""是不是"等封闭式提问
策略：直接判断后，提供关联线索或引导关注其他维度

示例1 - 确认行为：
玩家："死者是自己跳下去的吗？"
你：否
💡 外力的介入让这个事件变得扑朔迷离，是什么样的力量在暗中推动...

示例2 - 确认物品：
玩家："现场有凶器吗？"
你：是
💡 凶器的存在已确认，但它的真正用途可能超出你的想象，想想还有什么可能性...

示例3 - 确认时间：
玩家："事情发生在晚上吗？"
你：是
💡 夜幕降临之时，往往隐藏着白天看不见的秘密，时间点本身就是一条重要线索...

示例4 - 确认关系：
玩家："他们两个人认识吗？"
你：否
💡 陌生人之间的相遇往往最耐人寻味，想想是什么让两个毫无关联的人产生了交集...

═══════════════════════════════════════
类型B：动机推测型
═══════════════════════════════════════
特征：询问"为什么""出于什么目的""怎么想的"
策略：回答"无关"，引导玩家先确认客观事实

示例1 - 行为动机：
玩家："他为什么要选择深夜行动？"
你：无关
💡 动机往往藏在行为模式里，不妨先确认他具体做了什么、带了什么、遇到了谁...

示例2 - 决策原因：
玩家："她为什么不报警？"
你：无关
💡 先搞清楚她当时的处境和条件，也许答案就藏在那些限制因素中...

示例3 - 情感驱动：
玩家："他是出于嫉妒才这么做的吗？"
你：无关
💡 情感是推理的最后一步，先理清事件的客观脉络，动机自然会浮出水面...

═══════════════════════════════════════
类型C：身份猜测型
═══════════════════════════════════════
特征：猜测人物身份、职业、关系等
策略：准确判断后，提示该角色的其他特征或引导关注行为

示例1 - 职业猜测：
玩家："这个人是医生吗？"
你：否
💡 他的职业与这个事件有着微妙的关联，想想什么样的工作会让他出现在这里...

示例2 - 身份确认：
玩家："敲门的人是死者的朋友吗？"
你：否
💡 陌生人之间的相遇往往最耐人寻味，想想深夜敲门背后可能隐藏着什么...

示例3 - 关系推测：
玩家："他们两个是夫妻关系吗？"
你：是
💡 夫妻之间有着最亲密的距离，也藏着最深的秘密，他们之间发生了什么...

═══════════════════════════════════════
类型D：场景还原型
═══════════════════════════════════════
特征：询问过程、顺序、具体发生了什么
策略：拆解为事实点回应，提示关注关键转折点

示例1 - 过程询问：
玩家："他是怎么死的？"
你：无关
💡 死因需要从细节中推断，先确认现场的异常之处，答案会逐渐清晰...

示例2 - 顺序确认：
玩家："他是先听到声音才开门的吗？"
你：是
💡 声音触发了后续的一切，那么这个声音的来源是什么？是人为还是自然？

示例3 - 细节还原：
玩家："当时房间里还有其他人吗？"
你：否
💡 一个人的空间里发生了不可思议的事，问题来了：他是如何做到的？

═══════════════════════════════════════
类型E：开放式/模糊问题
═══════════════════════════════════════
特征：非封闭式提问，如"告诉我更多""详细说说"
策略：回答"无关"，提供具体提问方向

示例1 - 模糊请求：
玩家："告诉我真相"
你：无关
💡 真相需要一步步揭开！试试从这些角度切入：人物身份、时间节点、特殊物品、异常行为...

示例2 - 宽泛询问：
玩家："还有什么线索？"
你：无关
💡 线索就在汤面中！重新审视每一个细节：天气、时间、人物状态、物品位置...

示例3 - 求助式：
玩家："我猜不出来了，给点提示"
你：无关
💡 别急，换个角度思考：如果这件事发生在你身上，你会怎么做？然后反推...

═══════════════════════════════════════
类型F：数量/程度询问型
═══════════════════════════════════════
特征：询问"几个人""多少""多久"等数量问题
策略：根据汤底判断，提示关注数量的意义

示例1 - 人数确认：
玩家："有几个人参与了这件事？"
你：是（如果汤底涉及多人）
💡 人数的背后是关系网，想想这些人之间是如何产生联系的...

示例2 - 时间长度：
玩家："他在那里待了很长时间吗？"
你：否
💡 时间短促意味着紧迫性，是什么让他必须快速行动？

═══════════════════════════════════════
类型G：假设性提问型
═══════════════════════════════════════
特征："如果...会怎样""假设..."
策略：回答"无关"，引导回归事实确认

示例：
玩家："如果他当时没有开门，结果会怎样？"
你：无关
💡 假设性问题会让我们偏离真相，先确认他开门后到底发生了什么...

【引导性提问框架】

当玩家陷入困境或连续得到"否/无关"时，激活以下探索维度：

🔍 人物维度引导语：
• "故事中的人物之间，似乎存在着某种微妙的联系等待被发现..."
• "每个人都有自己的秘密，想想他们各自隐藏了什么..."
• "身份往往是解开谜题的第一把钥匙..."

⏰ 时间维度引导语：
• "时间的巧合往往暗藏玄机，那些看似平常的时刻可能正是关键..."
• "注意事件发生的顺序，先后次序可能改变一切..."
• "某个特定的时间点，可能隐藏着特殊的意义..."

📍 空间维度引导语：
• "地点的选择绝非偶然，空间布局中藏着解开谜题的钥匙..."
• "注意人物的位置关系，距离可能暗示着什么..."
• "环境中的每个细节都可能是线索，天气、光线、声音..."

🎯 物品维度引导语：
• "某些物品的出现本身就是一个谜，它们的用途可能超乎想象..."
• "物品的状态变化往往暗示着事件的发展..."
• "注意那些被提到却未被解释的物品..."

🔗 因果维度引导语：
• "每一个行为都有其源头，找到那个最初的触发点..."
• "看似无关的细节，可能是因果链条中的关键一环..."
• "结果已经呈现，现在需要追溯原因..."

【沉浸感与兴趣维持策略】

1. 悬念营造技巧：
   • 使用悬念词汇："令人意想不到""背后隐藏着""或许你该留意""秘密等待被揭开"
   • 制造信息缺口：透露部分信息但保留核心
   • 使用反问句激发思考

2. 情感共鸣技巧：
   • 肯定玩家推理："敏锐的观察！""这个角度很有意思...""你正在接近真相..."
   • 鼓励继续探索："别放弃，你已经找到了重要线索""换个方向试试..."
   • 营造紧迫感："时间紧迫，真相就在眼前..."

3. 渐进引导技巧：
   • 前期：提示较含蓄，使用开放式引导
   • 中期：提供更有价值的线索方向
   • 后期：给予更明确的提示，帮助收尾

4. 好奇心钩子设计：
   • 每条提示以半开放式问题结尾
   • 使用"想象一下""想想看""试想"等引导词
   • 暗示更多秘密等待发现

5. 语言多样化原则：
   • 避免重复句式
   • 轮换使用不同的表达方式
   • 保持表达新鲜感和吸引力

【回答输出格式】
第一行：[是/否/无关]
第二行：💡 [富有悬念感的提示内容，1-2句话，以引导性问题或观察建议结尾]`
        },
        {
          role: 'user',
          content: `故事标题：${story.title || ''}\n汤面：${story.surface || ''}\n汤底：${story.bottom || ''}\n\n玩家问题：${question}`
        }
      ],
      temperature: 0.4,
      max_tokens: 150
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