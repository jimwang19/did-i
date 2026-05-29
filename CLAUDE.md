# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 交流语言

使用中文交流。

## Project Overview

**过门不忘** — "Did I?" 确认工具，解决空间切换后的遗忘焦虑（门口效应）。Slogan：`告别"门口"效应，大脑重启前轻松留痕，安心转身向前走`

当前状态：**原型交互迭代中**（分支 `feat/prototype-interaction`），Stage 3→5 过渡。

## Technical Architecture

### 代码结构

本项目目前 **无构建系统**，纯 HTML/CSS/JS 文件，直接在浏览器中打开即可运行。

| 文件 | 用途 |
|------|------|
| `index.html` | 项目导航页（入口），含文档链接、功能入口 |
| `prototype.html` | 高保真交互原型，包含完整 CSS 设计令牌 + JS 交互逻辑 |

### 原型架构要点

- **单文件架构**: `prototype.html` 自包含所有 CSS（`<style>`）和 JS（`<script>`），无需外部依赖
- **设计令牌系统**: CSS 自定义属性定义在 `:root`，包含色彩/间距/圆角/字体层级，与 `docs/03-design/ui-spec.md` 和 `visual-style-guide.md` 一一对应
- **暗色主题**: 背景 `#0c0f14`，强调色 `#4ecdc4`（行动），确认色 `#81c784`（安心），待确认色 `#546e7a`（中性）
- **标注系统**: 原型内置 annotation layer（编号标注 + 侧边栏说明），用于设计评审，可通过右上角开关切换
- **模拟数据**: 使用 `localStorage` 持久化事项和确认记录，刷新后数据不丢失

### 运行方式

```bash
# 方式一：直接在浏览器打开
open index.html          # 项目导航
open prototype.html      # 高保真原型

# 方式二：本地服务器（推荐，避免 file:// 限制）
python -m http.server 8080   # 然后访问 http://localhost:8080
```

## 产品核心概念

这不是"待办提醒"工具，而是 **"Did I?" 确认工具**：
- 命名"过门不忘"源自认知心理学**门口效应（Doorway Effect）**——空间切换触发大脑上下文重置，导致刚做过的事被遗忘。**这是所有人的正常体验，不是病**
- 目标用户是**普通人群**，不是 OCD/ADHD 患者。每个人都会"锁门了没？"，这是人脑的正常工作机制
- 用户做完一件事后，快速记录"已做"+ 时间戳（可选拍照证明）
- 事后焦虑时查看记录，获得"我做过了"的安心感
- 核心场景：锁门、关火、吃药、喂宠物等日常确认

## Key Files

| File | Purpose |
|------|---------|
| `prototype.html` | 高保可交互原型，设计评审和验证的核心载体 |
| `index.html` | 项目导航入口 |
| `docs/02-product/product-spec.md` | 产品功能规格书，所有功能定义和交付标准的唯一来源 |
| `docs/01-research/market-competitive-analysis.md` | 市场竞品分析报告 |
| `docs/03-design/interaction-design.md` | 交互设计文档 |
| `docs/03-design/ui-spec.md` | UI 规格（设计令牌、组件规范） |
| `docs/03-design/visual-style-guide.md` | 视觉风格指南 |
| `.claude/prds/memo-tool.prd.md` | 产品定位 PRD |

## 文档结构

```
docs/
├── 01-research/          # 市场调研 & 竞品分析
├── 02-product/           # 产品定义 & PRD & 规格书
├── 03-design/            # 设计方向 & UI规范
├── 04-plan/              # 开发计划 & Blueprint
├── activity-log.md       # 开发活动日志
└── document-map.md       # 文档关系图
```

## 开发阶段流程

```
市场调研          产品定义             设计              开发规划           原型开发
(Stage 1)        (Stage 2)          (Stage 3)         (Stage 4)         (Stage 5)
    │                │                  │                  │                  │
    ▼                ▼                  ▼                  ▼                  ▼
 竞品分析 ──→ 产品PRD ──→ 交互设计 ──→ Blueprint ──→ MVP原型
              │    │         │                              │
              │    └──→ 产品规格书 ──→ UI规格              │
              │         │         └──→ 视觉风格指南 ───────┘
              │         │
              │    反方论证(归档)
              │
              └──→ 开发流程技能映射
```

### 阶段技能映射

| 阶段 | 技能 | 产出 |
|------|------|------|
| 1. 市场调研 | `ecc:market-research`, `ecc:deep-research`, `ecc:exa-search` | `market-competitive-analysis.md` |
| 2. 产品定义 | `ecc:plan-prd`, `ecc:product-lens`, `ecc:blueprint` | PRD、产品规格书 |
| 3. 设计方向 | `ecc:frontend-design-direction`, `ecc:design-system`, `ecc:accessibility` | 交互设计、UI规范、视觉风格指南 |
| 4. 架构规划 | `ecc:plan`, `ecc:architect`, `ecc:architecture-decision-records` | 开发计划、架构决策记录 |
| 5. 功能开发 | `ecc:feature-dev`, `ecc:prp-plan`/`ecc:prp-implement`, `ecc:evolve` | 可运行原型 |
| 6. 质量保障 | `ecc:code-review`, `ecc:security-review`, `ecc:quality-gate` | 发布就绪 |
| 7. 发布运营 | `ecc:pr`, `ecc:continuous-learning` | 上线 |

## Coding Guidelines

- **修改前先看规格书**: `docs/02-product/product-spec.md` 是功能定义的唯一来源，新增功能先更新规格再写代码
- **MVP 最简原则**: 能用就行，不做过度设计
- **代码风格**: 匹配项目现有风格，不擅自引入新规范
- **修改后必须自测**: 每次修改 Web 页面（HTML/CSS/JS）后，必须在浏览器中实际打开验证，确认视觉效果和交互行为符合预期，自测通过才算完成

## 分支策略与 Worktree

功能开发使用 feature 分支 + worktree 隔离：

| 分支 | 方向 |
|------|------|
| `main` | 稳定版本 |
| `feat/mvp-miniprogram` | 微信小程序 MVP |
| `feat/mvp-native` | 原生 App（后续阶段） |

## 验收基准

- In Review / Done 状态变更前，必须在对应平台实际运行验证
- MVP 验证指标：7日留存率 > 30% 则需求成立

## Linear 工作流

> 完整规则见 [AGENTS.md](AGENTS.md#linear-工作流规范)，以下为快速参考。

| 时机 | 操作 |
|------|------|
| 开始处理 issue | 状态 → **In Progress** + 留 `🚀 开始:` Comment + 发项目 Discussion |
| 本地测试通过 | 状态 → **In Review** + 留 `👀 评审:` Comment + 发项目 Discussion |
| 验收通过 | 状态 → **Done** + 留 `✅ 完成:` Comment + 发项目 Discussion |
| 发现新问题 | 创建 sub-issue + 留 `📝 创建:` Comment，勿口头描述 |
| 遇到阻碍 | 留 `⚠️ 阻塞:` Comment + 发项目 Discussion |

### MCP 已知问题

- **`save_status_update` 不可用**：该工具报 `Tool not found` 错误。替代方案：使用 `save_comment` + `projectId: "memotool"` 在项目 Discussion 区发评论，效果等同 Status Update
- **`save_document` 的 `icon` 参数**：传 emoji 字符串会报 `icon is not a valid icon`。替代方案：省略 `icon` 参数，或传 `:emoji_name:` 格式（如 `:clipboard:`），建议直接不传

> 详见 [.copilot-memory/linear-workarounds.md](.copilot-memory/linear-workarounds.md)

## Testing

**原则：每次改完代码必须在目标平台运行验证，再改状态为 In Review。**

### Web/原型测试
- 修改 `prototype.html` 后必须在 Playwright 浏览器中打开验证
- 检查项：视觉效果（布局、颜色、间距）、交互行为（点击、切换、动画）、标注系统（定位、联动）
- 使用 Playwright MCP 工具截图验证关键页面状态

### 小程序测试
- 微信开发者工具预览
- 真机扫码验证
- 操作流程：打开 → 点确认 → 查看记录 → 拍照确认

## 文档变更影响链

修改某文档时，需同步检查的下游文档：

| 修改此文档 | 必须检查 | 可能影响 |
|-----------|---------|---------|
| 竞品分析 | PRD | 规格书、设计文档 |
| PRD | 规格书、Blueprint | 交互设计、UI规格 |
| 规格书 | 交互设计、UI规格 | Blueprint、原型 |
| Blueprint | 原型 | — |

## 引用规则

1. **上游变更必须通知下游**：修改PRD时，检查规格书和Blueprint是否需要同步
2. **规格书是功能唯一来源**：CLAUDE.md 规定"修改前先看规格书"
3. **归档文档不再维护**：反方论证的结论已转化，文档仅供回溯
4. **路径约定**：文档间引用使用相对路径
