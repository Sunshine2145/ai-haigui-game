# AI对话接口文档

## 接口说明

本接口用于与AI进行对话，针对海龟汤游戏场景，根据故事内容回答用户问题。

## 接口信息

- **HTTP方法**: POST
- **接口路径**: /api/chat
- **内容类型**: application/json

## 请求参数

请求体必须为JSON格式，包含以下字段：

| 字段 | 类型 | 必需 | 描述 |
|------|------|------|------|
| question | string | 是 | 用户提出的问题，不能为空 |
| story | object | 是 | 故事相关信息 |

### story对象结构

| 字段 | 类型 | 必需 | 描述 |
|------|------|------|------|
| title | string | 是 | 故事标题 |
| surface | string | 是 | 汤面（故事谜面） |
| bottom | string | 是 | 汤底（故事真相） |

## 响应格式

### 成功响应 (200 OK)

```json
{
  "success": true,
  "data": {
    "answer": "AI生成的回答内容"
  }
}
```

### 错误响应

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "人类可读的错误信息"
  }
}
```

## 错误码说明

| 错误码 | 描述 | 状态码 |
|--------|------|--------|
| INVALID_PARAMS | 参数验证错误 | 400 |
| API_KEY_MISSING | API密钥缺失 | 500 |
| API_CALL_FAILED | API调用失败 | 502 |
| API_RESPONSE_ERROR | API响应错误 | 502 |
| EMPTY_ANSWER | AI未返回有效回答 | 502 |
| REQUEST_TIMEOUT | 请求超时 | 504 |
| INTERNAL_ERROR | 服务器内部错误 | 500 |
| RATE_LIMIT_EXCEEDED | 请求频率过高 | 429 |

## 请求示例

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "question": "敲门的人是被山顶的人杀死的吗？",
    "story": {
      "title": "神秘的敲门声",
      "surface": "一个人住在山顶的小屋里，半夜听见有敲门声，他打开门却没有人，于是去睡了。等了一会儿又有敲门声，去开门还是没人，如是者几次。第二天，有人在山脚下发现死尸一具，警察来把山顶的那人带走了。",
      "bottom": "因为山顶的小屋门是向外开的，当他开门时，敲门的人被门推下山去，如此反复，导致敲门者死亡。"
    }
  }'
```

## 响应示例

### 成功响应

```json
{
  "success": true,
  "data": {
    "answer": "是"
  }
}
```

### 错误响应

```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMS",
    "message": "question参数不能为空"
  }
}
```

## 安全与性能

- **请求频率限制**: 每IP 15分钟内最多30个请求
- **超时控制**: 30秒超时，最多2次重试
- **敏感信息**: 不在日志中记录完整的question和story内容
- **异步处理**: 接口使用异步处理，避免阻塞主线程

## 环境配置

需要在`.env`文件中配置DeepSeek API密钥：

```
DEEPSEEK_API_KEY=your_api_key_here
```