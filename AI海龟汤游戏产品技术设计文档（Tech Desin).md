# AI海龟汤游戏技术设计文档
## 一、文档概述
本文档为**AI海龟汤推理游戏**的技术设计方案，明确项目技术栈、工程结构、数据模型、核心流程、技术关键点及数据库设计等内容，保障项目可落地、可扩展、可维护。
游戏核心逻辑：玩家选择海龟汤故事，通过向AI提问获取「是/否/无关」的回答，逐步推理出故事真相（汤底），支持本地数据持久化存储与AI智能交互。

## 二、项目概述
### 1. 项目定位
轻量化、高交互性的Web版AI海龟汤游戏，支持故事选择、在线提问、AI智能应答、故事揭晓等核心功能，前期可纯前端运行，后期可无缝对接后端与数据库。
### 2. 核心功能
- 游戏大厅：展示所有海龟汤故事，支持按难度筛选
- 游戏核心：玩家提问、AI应答、对话记录展示
- 游戏结束：揭晓汤底，支持重新开始游戏
- 数据管理：本地MySQL数据库持久化存储故事数据

## 三、技术栈选择
### 1. 前端技术栈
| 技术分类 | 选型 | 选型原因 |
|----------|------|----------|
| 构建工具 | Vite 5 | 极速冷启动、热更新，提升开发效率 |
| 核心框架 | React + TypeScript | 组件化开发，TS提供类型安全，减少运行时错误 |
| 样式方案 | Tailwind CSS | 原子化CSS，快速构建响应式界面，无需编写冗余样式 |
| 状态管理 | React Hooks (useState/useContext) | 轻量级状态管理，满足游戏小型状态需求，无需引入Redux等重型库 |
| 路由管理 | React Router | 实现首页、游戏页、结果页的路由跳转 |

### 2. 后端技术栈（可选，后期扩展）
- 运行环境：Node.js
- 服务框架：Express
- 作用：提供API接口、对接数据库、代理AI请求（避免前端直接暴露API密钥）

### 3. AI服务
- 优选：DeepSeek AI
- 备选：智谱AI
- 优势：Token成本低、响应速度快，完美适配「是/否/无关」的短文本应答场景

### 4. 数据库
- 类型：MySQL（关系型数据库）
- 作用：持久化存储海龟汤故事数据，支持后期故事管理、增删改查操作

## 四、项目工程结构
严格遵循模块化、职责分离原则，结构清晰易维护：
```
ai-turtle-soup/
├── public/               # 静态资源
├── src/
│   ├── components/       # 公共UI组件
│   │   ├── GameCard.tsx  # 故事卡片组件（展示标题、难度、汤面）
│   │   ├── ChatBox.tsx   # 聊天输入+对话列表容器
│   │   ├── Message.tsx   # 单条对话消息组件
│   │   └── StoryReveal.tsx # 汤底揭晓弹窗/页面
│   ├── pages/            # 页面组件
│   │   ├── Home.tsx      # 首页/游戏大厅（故事列表）
│   │   ├── Game.tsx      # 游戏核心页面（提问+AI对话）
│   │   └── Result.tsx    # 游戏结果页（汤底展示）
│   ├── data/             # 本地数据/类型定义
│   │   └── stories.ts    # 前端模拟故事数据（对接数据库后替换）
│   ├── api/              # API请求层
│   │   ├── ai.ts         # AI接口请求封装
│   │   └── story.ts      # 故事数据接口封装
│   ├── utils/            # 工具函数
│   │   ├── prompt.ts     # AI Prompt模板生成
│   │   └── db.ts         # 数据库连接工具（后端）
│   ├── context/          # 全局状态上下文
│   │   └── GameContext.tsx # 游戏全局状态管理
│   ├── types/            # TypeScript类型定义
│   │   ├── index.ts      # 统一导出类型
│   ├── App.tsx           # 根组件
│   └── main.tsx          # 项目入口
├── .env                  # 环境变量（AI密钥、数据库配置）
├── package.json
└── tsconfig.json
```

## 五、数据模型设计
基于TypeScript定义强类型数据模型，同时适配MySQL数据库表结构。

### 1. 核心数据模型（TypeScript类型）
#### （1）海龟汤故事模型（Story）
```typescript
// src/types/index.ts
export interface Story {
  id: string;              // 唯一标识（UUID）
  title: string;           // 故事标题
  difficulty: 'easy' | 'medium' | 'hard'; // 难度
  surface: string;         // 汤面（玩家可见的谜面）
  bottom: string;          // 汤底（故事真相，AI可见）
  createTime?: number;      // 创建时间（可选，数据库用）
  updateTime?: number;      // 更新时间（可选，数据库用）
}
```

#### （2）对话消息模型（Message）
```typescript
export interface Message {
  id: string;              // 消息唯一标识
  role: 'user' | 'assistant'; // 发送者：玩家/AI
  content: string;         // 消息内容
  timestamp: number;       // 时间戳（毫秒）
}
```

#### （3）游戏状态模型（GameState）
```typescript
export interface GameState {
  currentStory: Story | null; // 当前选中的故事
  messageList: Message[];     // 对话记录
  gameStatus: 'idle' | 'playing' | 'ended'; // 游戏状态：未开始/进行中/已结束
}
```

### 2. MySQL数据库表结构
创建`turtle_stories`表存储故事数据，字段与TypeScript模型一一对应：
```sql
CREATE TABLE `turtle_stories` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY COMMENT '故事唯一ID',
  `title` VARCHAR(100) NOT NULL COMMENT '故事标题',
  `difficulty` ENUM('easy','medium','hard') NOT NULL COMMENT '难度',
  `surface` TEXT NOT NULL COMMENT '汤面',
  `bottom` TEXT NOT NULL COMMENT '汤底',
  `create_time` BIGINT NOT NULL DEFAULT UNIX_TIMESTAMP() COMMENT '创建时间戳',
  `update_time` BIGINT NOT NULL DEFAULT UNIX_TIMESTAMP() ON UPDATE UNIX_TIMESTAMP() COMMENT '更新时间戳'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT '海龟汤故事表';
```

## 六、核心业务流程
```
1. 首页加载 → 请求MySQL数据库/本地模拟数据 → 渲染故事列表
2. 玩家选择故事 → 进入游戏页 → 展示汤面，初始化游戏状态
3. 玩家输入问题 → 前端校验输入 → 调用AI接口
4. AI基于Prompt模板判断 → 返回「是/否/无关」
5. 对话记录存入状态 → 实时渲染到聊天框
6. 玩家猜出真相/主动放弃 → 结束游戏 → 展示汤底
7. 选择重新开始 → 清空状态，返回故事列表
```

## 七、AI Prompt设计（最终版）
严格遵循游戏规则，无额外输出，保证AI应答合规：
```typescript
// src/utils/prompt.ts
export const generateAIPrompt = (story: Story, question: string) => {
  return `你是一个海龟汤游戏的主持人。
当前故事的汤面是：${story.surface}
故事的汤底是：${story.bottom}

玩家会向你提问，你只能回答以下三种之一：
1."是"：玩家的猜测与汤底一致
2."否"：玩家的猜测与汤底矛盾
3."无关"：玩家的猜测与汤底无关，无法判断

注意：
1.严格根据汤底判断，不要额外推理
2.只回答"是"、"否"、"无关"，不要解释任何内容
3.保持神秘感，绝对不要透露汤底

玩家问：${question}
请回答：`;
};
```

## 八、技术关键点与解决方案
### 1. 全局状态管理
- 方案：使用`React Context + useReducer`管理游戏全局状态（当前故事、对话列表、游戏状态）
- 作用：跨组件共享数据，避免props层层传递，保证游戏状态一致性

### 2. AI接口请求
- 前端直连（前期）：封装Fetch/axios请求DeepSeek API，通过.env管理API密钥
- 后端代理（后期）：前端请求Express后端，后端转发AI请求，**隐藏API密钥，提升安全性**
- 异常处理：网络错误、AI响应超时、无权限时，返回友好提示

### 3. 数据库对接
- 后端：使用`mysql2`库连接MySQL，实现故事数据的增删改查接口
- 前端：通过API请求获取数据库中的故事数据，替换本地模拟数据
- 数据同步：保证前端类型与数据库字段完全匹配，避免类型错误

### 4. 游戏逻辑校验
- 禁止空内容提问，前端做输入校验
- 游戏结束后禁止继续提问
- AI应答严格过滤，只保留「是/否/无关」，拒绝其他内容

### 5. 响应式适配
- 基于Tailwind CSS实现移动端/PC端自适应
- 聊天框、故事卡片适配不同屏幕尺寸

### 6. 性能优化
- 组件懒加载：使用React.lazy加载页面组件
- 对话列表虚拟化（可选）：大量对话时提升渲染性能
- 避免重复请求：缓存已加载的故事数据

## 九、环境变量配置
### 前端 .env 文件
```env
# AI服务配置
VITE_AI_API_KEY=your_deepseek_api_key
VITE_AI_API_URL=https://api.deepseek.com/chat/completions

# 后端接口地址（后期启用）
VITE_BACKEND_URL=http://localhost:3000
```

### 后端 .env 文件
```env
# MySQL数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=turtle_soup

# AI配置
AI_API_KEY=your_deepseek_api_key
AI_API_URL=https://api.deepseek.com/chat/completions
```

## 十、前后端交互接口（后期扩展）
| 接口地址 | 请求方式 | 功能 |
|----------|----------|------|
| /api/stories | GET | 获取所有海龟汤故事 |
| /api/story/:id | GET | 获取单个故事详情 |
| /api/ai/answer | POST | 发送问题，获取AI应答 |

## 十一、项目开发计划
1. **阶段一（纯前端）**：完成页面、组件、AI交互、本地模拟数据
2. **阶段二（后端+数据库）**：搭建Express服务，对接MySQL，实现数据持久化
3. **阶段三（优化）**：异常处理、响应式优化、性能提升

---

### 总结
1. 本项目采用**React+TS+Vite**前端栈，搭配轻量级状态管理，开发效率高、类型安全；
2. 数据模型标准化，同时适配TypeScript类型与MySQL数据库，支持本地持久化存储；
3. AI Prompt严格约束应答规则，保证游戏体验，技术方案支持**纯前端运行**和**前后端分离**两种模式；
4. 项目结构模块化，核心流程清晰，可快速落地并支持后期功能扩展。