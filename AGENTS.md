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

## 测试规范

**每次改完必须验证，再标记 In Review。**

- **Web 原型**：用 Playwright 在浏览器打开，验证视觉效果 + 交互行为 + 标注系统
- **小程序**：微信开发者工具预览，真机扫码验证

## 常见陷阱

- `prototype.html` 的 JS 函数均为**全局函数**，不使用模块化
- `localStorage` 用于原型数据持久化，小程序用 `utils/storage.ts` 封装的 `wx.setStorageSync`
- 小程序 TypeScript 编译使用 `compilerPlugins: ["typescript"]`，**SWC 已禁用**
- `devil-advocate-analysis.md` 是归档文档，仅供回溯，不再维护
