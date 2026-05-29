# 过门不忘 · AI Agent 工作指南

> "Did I?" 确认工具，解决空间切换后的遗忘焦虑（门口效应）。

## 核心工作规则

- **禁止假设**：遇到模糊逻辑主动询问，不自作主张补全参数或逻辑
- **禁止过度设计**：200 行能写完绝不写 500 行，不引入未声明的第三方依赖
- **安全红线**：禁止硬编码 API Key、密码或 Token，不提交 `.env` 文件
- **最小改动**：只改必须改的地方，不顺手"优化"旁边不相关的代码
- **匹配风格**：遵循项目现有代码风格，不擅自引入新格式化规则

## 架构概览

| 平台 | 入口 | 说明 |
|------|------|------|
| Web 原型 | `prototype.html` | 单文件，含全部 CSS 令牌 + JS 交互，无构建步骤 |
| 微信小程序 | `miniprogram/` | TypeScript，三 Tab：今日 / 历史 / 设置 |
| 项目导航 | `index.html` | 文档链接 + 功能入口 |

**无构建系统**，Web 原型直接浏览器打开即可运行。

## 运行方式

```bash
# Web 原型（推荐用本地服务器避免 file:// 限制）
python -m http.server 8080
# 浏览器打开 http://localhost:8080/prototype.html

# 小程序：在微信开发者工具中打开 miniprogram/ 目录
```

## 关键文件速查

| 文件 | 用途 |
|------|------|
| [docs/02-product/product-spec.md](docs/02-product/product-spec.md) | **功能唯一来源**，新增功能先改规格再写代码 |
| [docs/03-design/ui-spec.md](docs/03-design/ui-spec.md) | 设计令牌定义 |
| [docs/03-design/visual-style-guide.md](docs/03-design/visual-style-guide.md) | 视觉风格指南 |
| [docs/03-design/interaction-design.md](docs/03-design/interaction-design.md) | 交互设计文档 |
| [docs/04-plan/mvp-architecture-plan.md](docs/04-plan/mvp-architecture-plan.md) | MVP 架构计划 |
| [docs/adr/](docs/adr/) | 架构决策记录 |

## 设计令牌（prototype.html `:root`）

| 用途 | 变量 | 值 |
|------|------|----|
| 背景 | `--bg` | `#0c0f14` |
| 行动/强调 | `--accent` | `#4ecdc4` |
| 确认/安心 | `--success` | `#81c784` |
| 待确认/中性 | `--pending` | `#546e7a` |
| 危险 | `--danger` | `#ef5350` |

修改颜色时保持令牌一致，小程序复用相同色值。

## 小程序关键常量（`miniprogram/utils/constants.ts`）

- `ITEM_MAX_COUNT = 10`（事项上限）
- `ITEM_NAME_MAX = 10`（名称字符上限）
- `PHOTO_KEEP_DAYS = 7`（照片保留天数）
- `ICON_PRESETS`：16 个预设 emoji

## Linear 工作流规范

Linear 是开发过程管理中心（项目: memotool，团队: Memotool）。

### Issue 状态流转

Backlog → Todo → In Progress → In Review → Done

### Done 规则

- `Done` 只能在 `main` 分支完成验证后再改
- 默认由产品经理在 `main` 分支验收通过后确认关闭
- 若尚未完成 `main` 分支验证，Issue 先停留在 `In Review`

### Activity Comment 规范

在以下 5 个关键节点必须留 Comment，格式统一：

| 节点 | 格式 | 何时使用 |
|------|------|----------|
| 创建 | `📝 创建: <为什么建这个 Issue>` | save_issue 创建时 |
| 开始 | `🚀 开始: <当前在做什么>` | 状态改为 In Progress 时 |
| 评审 | `👀 评审: <改了什么，怎么验证>` | 状态改为 In Review 时 |
| 完成 | `✅ 完成: <最终结果>` | 状态改为 Done 时 |
| 阻塞 | `⚠️ 阻塞: <什么问题>` | 遇到阻碍时 |

### 操作规则

- **创建 Issue**: 创建后立即追加 `📝 创建:` Comment **+ 发项目级 Discussion**（`save_comment` + `projectId`）
- **状态变更**: 每次改状态时追加对应 Comment **+ 发项目级 Discussion**（`save_comment` + `projectId`）
- **Done 限制**: 只有产品经理在 `main` 分支验证通过后，才允许把 Issue 改成 `Done`
- **文档更新**: Spec/UI Spec/风格指南/PRD 有实质修改时，**发项目级 Discussion**（`save_comment` + `projectId`）
- **内容更新**: 仅在修改了需求范围/验收标准时追加 `🔄 更新:` Comment
- **不需要 Comment**: 纯标签/优先级变更（Linear 自动记录）

### 项目级 Status Update 规范

> ⚠️ **MCP 已知问题**：`save_status_update` 工具不可用（报 `Tool not found`）。
> **替代方案**：使用 `save_comment` + `projectId: "memotool"` 在项目 Discussion 区发评论，效果等同 Status Update。

每次操作规则要求发 Status Update 时，必须立即调用 `save_comment({ projectId: "memotool", body: "..." })`，**不等用户提醒**。每条动态是一句有意义的总结，不写流水账。

**核心原则**：像 git log 一样频繁，像 commit message 一样精炼。

**格式（两种）**：

简短格式（大多数场景，1-3行）：
```text
✅ MEM-XX 功能名 — 做了什么，结果是什么
决策: 关键决策内容（如有）
```

完整格式（里程碑/方向调整/周汇总时使用）：
```text
## 进展
- MEM-XX 功能完成

## 决策
- **<决策名>**：<决策内容及原因>

## 风险
- 无

## 下一步
- ...
```

**健康度**：onTrack 🟢 / atRisk 🟡 / offTrack 🔴

**禁止**：状态停在 In Progress 超过一个工作日而没有 comment 更新。

## 测试规范

**每次改完必须验证，再标记 In Review。**

- **Web 原型**：用 Playwright 在浏览器打开，验证视觉效果 + 交互行为 + 标注系统
- **小程序**：微信开发者工具预览，真机扫码验证

## 常见陷阱

- `prototype.html` 的 JS 函数均为**全局函数**，不使用模块化
- `localStorage` 用于原型数据持久化，小程序用 `utils/storage.ts` 封装的 `wx.setStorageSync`
- 小程序 TypeScript 编译使用 `compilerPlugins: ["typescript"]`，**SWC 已禁用**
- `devil-advocate-analysis.md` 是归档文档，仅供回溯，不再维护
