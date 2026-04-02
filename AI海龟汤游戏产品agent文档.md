# AI海龟汤游戏开发指令（完善版）
## 项目概述
基于**React 18 + TypeScript + Tailwind CSS + Vite**构建的Web端AI海龟汤解谜游戏，面向全平台用户提供沉浸式悬疑推理体验。核心功能为AI生成海龟汤谜题、智能判定玩家提问、逐步揭示剧情，最终引导玩家还原真相，支持移动端/桌面端自适应。

## 核心功能模块
1. **谜题系统**
   - AI生成原创海龟汤故事（标题、谜面、隐藏真相、关键线索）
   - 本地谜题库兜底（无API时可加载预设谜题）
   - 谜题难度分级（简单/中等/困难）
2. **游戏交互系统**
   - 玩家文字提问输入框
   - AI智能应答（是/否/无关/补充线索）
   - 问答历史记录展示
   - 游戏状态控制（开始/重置/提示/揭晓真相）
3. **用户体验系统**
   - 悬疑氛围动效（文字渐变、淡入淡出）
   - 提示次数限制（防剧透，增强游戏性）
   - 游戏进度保存（本地存储，刷新不丢失）
   - 响应式布局适配全尺寸设备
4. **AI接口系统**
   - 环境变量配置API密钥
   - 请求/响应格式标准化
   - 异常处理（网络错误、API限流、无响应）

## 技术栈详情
| 分类 | 技术选型 | 用途 |
|------|----------|------|
| 核心框架 | React 18 | 页面渲染、组件化开发 |
| 类型系统 | TypeScript | 类型约束、代码提示、安全校验 |
| 构建工具 | Vite | 快速编译、热更新、打包优化 |
| 样式方案 | Tailwind CSS | 原子化样式、响应式开发 |
| AI服务 | 大模型API | 谜题生成、提问判定、剧情解答 |
| 数据存储 | localStorage | 本地保存游戏进度、谜题记录 |
| 代码规范 | ESLint + Prettier | 统一代码风格、自动格式化 |

## 开发规范
### 1. 类型规范（TypeScript）
- 所有组件、函数、变量必须定义类型，禁止使用`any`
- 自定义类型/接口统一以`T`开头（如`TStory`、`TGameMessage`）
- 枚举类型使用`enum`，命名为PascalCase（如`GameStatus`）
- 共享类型抽取至`src/types/`目录统一管理

### 2. 组件规范
- 全部使用**函数式组件 + React Hooks**，禁止类组件
- 组件文件命名：PascalCase（如`GameBoard.tsx`）
- 单组件职责单一，可复用组件抽取至`src/components/`
- 组件必须添加注释：功能说明、入参类型、返回值
- Props如需默认值，使用`defaultProps`或参数默认值

### 3. 函数与变量规范
- 组件内函数：camelCase（如`handleSubmitQuestion`）
- 工具函数：存放于`src/utils/`，camelCase命名
- 常量：UPPER_SNAKE_CASE（如`MAX_HINT_COUNT`）
- 禁止匿名函数滥用，逻辑复杂函数单独拆分

### 4. 目录结构规范
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

## 代码风格
1. **命名规则**
   - 组件：PascalCase（`GameModal.tsx`）
   - 函数/方法：camelCase（`getAiResponse`）
   - 常量：UPPER_SNAKE_CASE（`API_BASE_URL`）
   - 类型/接口：T + PascalCase（`TGameConfig`）
2. **格式规范**
   - 2空格缩进，禁止Tab
   - 语句末尾加分号
   - 引号统一使用双引号
   - 代码自动格式化（保存时触发Prettier）
3. **注释规范**
   - 文件头部：文件功能、作者、更新时间
   - 组件/函数：功能、参数、返回值
   - 复杂逻辑：单行注释说明思路
   - 禁止无意义注释，保持简洁

## 设计规范（UI/UX）
### 1. 主题配色（强制统一）
- 背景主色：`bg-slate-900`（深蓝色悬疑底）
- 文字主色：`text-slate-100`（白色文字）
- 文字次要色：`text-slate-400`（灰色辅助文字）
- 强调色/金色：`text-amber-400`（标题、按钮、高亮）
- 边框色：`border-slate-700`
- 按钮禁用色：`bg-slate-700 text-slate-500`

### 2. 样式规则
- 圆角：统一使用`rounded-lg`
- 阴影：统一使用`shadow-lg`
- 间距：使用Tailwind默认间距单位（`p-4`/`m-6`等）
- 过渡：交互元素添加`transition-all duration-300`
- 禁止原生CSS写法，全部使用Tailwind原子类

### 3. 布局与适配
- 移动端优先，断点使用：`sm`/`md`/`lg`/`xl`
- 最大宽度：`max-w-4xl mx-auto`（游戏主容器）
- 内边距：移动端`p-4`，桌面端`p-6`
- 禁止固定宽高，使用百分比/flex/grid自适应

### 4. 交互设计
- 按钮：hover悬浮效果、点击反馈
- 输入框：聚焦高亮、清空按钮、字数限制
- 加载状态：骨架屏/加载动画，提升体验
- 弹窗：居中、蒙层、点击外部关闭

## 环境配置与安全规范
1. **环境变量**
   - 新建`.env`文件，配置AI API密钥：`VITE_AI_API_KEY=xxx`
   - 环境变量必须以`VITE_`开头，禁止硬编码API Key
   - `.env`文件加入`.gitignore`，禁止提交到代码仓库
2. **API请求规范**
   - 统一封装AI请求工具函数，添加错误捕获
   - 设置请求超时时间，防止页面卡死
   - 敏感接口添加参数校验，防止非法调用

## 开发流程
1. 初始化项目（Vite + React + TS）
2. 安装依赖（Tailwind CSS、ESLint等）
3. 配置全局类型、主题、工具函数
4. 开发基础UI组件
5. 实现AI接口封装
6. 开发游戏核心逻辑
7. 联调测试、适配移动端
8. 优化体验、修复bug

## 测试要求
1. **功能测试**
   - 谜题生成：AI可正常输出完整谜题
   - 提问判定：回答准确（是/否/无关）
   - 游戏控制：开始、重置、提示、揭晓功能正常
   - 本地存储：刷新页面进度不丢失
2. **UI测试**
   - 全尺寸屏幕（手机/平板/电脑）显示正常
   - 样式统一，符合设计规范
   - 动效流畅，无卡顿、错位
3. **异常测试**
   - 无API Key：提示用户配置
   - 网络错误：友好提示，不崩溃
   - 空输入：表单校验，禁止提交

## 注意事项
- 核心功能优先，非必要功能延后开发
- 代码简洁易懂，避免过度设计和冗余逻辑
- 保持悬疑氛围，UI不可过于花哨
- 移动端交互优化（按钮尺寸、输入体验）
- 定期提交代码，编写清晰commit信息

---

# 配套TypeScript核心类型定义（`src/types/index.ts`）
```typescript
/**
 * 海龟汤故事类型
 */
export type TStory = {
  id: string; // 唯一标识
  title: string; // 谜题标题
  question: string; // 谜面（玩家可见）
  answer: string; // 真相（揭晓后展示）
  difficulty: 'easy' | 'medium' | 'hard'; // 难度
  hints: string[]; // 线索库
  createTime?: number;
};

/**
 * 游戏消息类型（问答记录）
 */
export type TGameMessage = {
  id: string;
  content: string; // 提问/回答内容
  role: 'player' | 'ai'; // 发送方
  responseType?: 'yes' | 'no' | 'irrelevant' | 'hint'; // AI回答类型
  createTime: number;
};

/**
 * 游戏状态枚举
 */
export enum GameStatus {
  IDLE = 'idle', // 未开始
  PLAYING = 'playing', // 游戏中
  SOLVED = 'solved', // 已揭晓真相
  LOADING = 'loading' // 加载中
}

/**
 * 游戏配置类型
 */
export type TGameConfig = {
  maxHintCount: number; // 最大提示次数
  aiModel: string; // AI模型名称
  timeout: number; // 请求超时时间
};

/**
 * AI请求参数类型
 */
export type TAiRequestParams = {
  story: TStory;
  userQuestion: string;
  history: TGameMessage[];
};
```

---

# 项目常量定义（`src/constants/index.ts`）
```typescript
/**
 * 游戏全局常量
 */

// 最大提示次数
export const MAX_HINT_COUNT = 3;

// AI请求超时时间（毫秒）
export const AI_REQUEST_TIMEOUT = 15000;

// 默认游戏配置
export const DEFAULT_GAME_CONFIG = {
  maxHintCount: MAX_HINT_COUNT,
  aiModel: 'gpt-3.5-turbo',
  timeout: AI_REQUEST_TIMEOUT,
};

// 游戏状态文案
export const GAME_STATUS_TEXT = {
  [GameStatus.IDLE]: '准备开始游戏',
  [GameStatus.PLAYING]: '游戏进行中，请问出你的问题',
  [GameStatus.SOLVED]: '真相已揭晓',
  [GameStatus.LOADING]: '正在生成谜题...',
};
```

---
