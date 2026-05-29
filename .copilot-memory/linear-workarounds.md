# Linear MCP 已知问题与替代方案

## 1. 项目级 Status Update

### 问题
`mcp_linear_save_status_update` 调用报错：
```
MCP error -32602: Tool save_status_update not found
```
同样受影响：`mcp_linear_get_status_updates`

### 替代方案
使用 `mcp_linear_save_comment` 加 `projectId` 参数，直接在项目层级发评论，效果等同于 Status Update：

```
mcp_linear_save_comment(
  body: "## 项目进展 · YYYY-MM-DD 🟢 onTrack\n...",
  projectId: "memotool"   // 项目名、ID 或 slug 均可
)
```

评论会出现在 Linear 项目的 Discussion 区，格式建议沿用 AGENTS.md 的完整格式模板。

## 2. Document icon 参数

### 问题
`mcp_linear_save_document` 传 emoji 字符串给 `icon` 参数报错：
```
Argument Validation Error - icon is not a valid icon.
```

### 替代方案
省略 `icon` 参数，Linear 会用默认图标。或传 `:emoji_name:` 格式（如 `:clipboard:`），但兼容性未完全验证，建议直接不传。
